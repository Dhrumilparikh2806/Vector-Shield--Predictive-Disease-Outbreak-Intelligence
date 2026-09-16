import os
import numpy as np
import pandas as pd

from services.data_loader import data_loader

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTORY_PATH = os.path.join(_BACKEND_DIR, "data", "inventory_stock.csv")

# Illustrative capacity-planning estimates (units per case), NOT a clinical
# protocol - loosely informed by WHO cholera/typhoid rehydration and
# antibiotic guidance ranges, simplified for stock-projection purposes only.
BOM = {
    "cholera_cases": {
        "ors_sachets": 6.0, "iv_fluid_bags": 3.0, "azithromycin_courses": 1.0,
        "ciprofloxacin_courses": 0.0, "water_purification_tablets": 20.0,
    },
    "typhoid_cases": {
        "ors_sachets": 2.0, "iv_fluid_bags": 1.0, "azithromycin_courses": 0.3,
        "ciprofloxacin_courses": 1.0, "water_purification_tablets": 10.0,
    },
    "gastroenteritis_cases": {
        "ors_sachets": 4.0, "iv_fluid_bags": 1.0, "azithromycin_courses": 0.0,
        "ciprofloxacin_courses": 0.0, "water_purification_tablets": 15.0,
    },
    "other_cases": {
        "ors_sachets": 2.0, "iv_fluid_bags": 0.5, "azithromycin_courses": 0.1,
        "ciprofloxacin_courses": 0.1, "water_purification_tablets": 5.0,
    },
}
DISEASE_COLUMNS = list(BOM.keys())
URGENCY_ORDER = {"critical": 0, "warning": 1, "ok": 2}


def _haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0) ** 2
    return r * (2 * np.arcsin(np.sqrt(a)))


class InventoryEngine:
    def __init__(self):
        self._stock = pd.read_csv(INVENTORY_PATH) if os.path.exists(INVENTORY_PATH) else pd.DataFrame()

    def _latest_merged(self):
        merged = data_loader.get_merged()
        if merged.empty:
            return merged
        merged = merged.copy()
        if not pd.api.types.is_datetime64_any_dtype(merged["date"]):
            merged["date"] = pd.to_datetime(merged["date"])
        return merged

    def _hospital_context(self, tenant_cities):
        """Latest per-hospital snapshot (predicted cases, risk score), scoped to a tenant."""
        merged = self._latest_merged()
        if merged.empty:
            return pd.DataFrame()
        latest = merged[merged["date"] == merged["date"].max()]
        if tenant_cities is not None:
            latest = latest[latest["city"].isin(tenant_cities)]
        return latest.set_index("hospital_id")

    def _hospital_demand_mix(self, hospital_id, merged):
        """Per-hospital disease-mix ratio from the last 14 days of actuals,
        falling back to an even split when there's no recent history."""
        if merged.empty:
            return {c: 0.25 for c in DISEASE_COLUMNS}
        latest_date = merged["date"].max()
        window_start = latest_date - pd.Timedelta(days=13)
        rows = merged[
            (merged["hospital_id"] == hospital_id)
            & (merged["date"] >= window_start)
            & (merged["date"] <= latest_date)
        ]
        if rows.empty:
            return {c: 0.25 for c in DISEASE_COLUMNS}
        totals = rows[DISEASE_COLUMNS].sum()
        grand_total = totals.sum()
        if grand_total <= 0:
            return {c: 0.25 for c in DISEASE_COLUMNS}
        return {c: float(totals[c] / grand_total) for c in DISEASE_COLUMNS}

    def get_status(self, tenant_cities):
        """Per hospital x item reorder status, scoped to the tenant's cities."""
        if self._stock.empty:
            return []
        context = self._hospital_context(tenant_cities)
        if context.empty:
            return []

        merged = self._latest_merged()
        stock = self._stock[self._stock["hospital_id"].isin(context.index)]
        mix_cache = {}
        results = []

        for hospital_id, group in stock.groupby("hospital_id"):
            hctx = context.loc[hospital_id]
            predicted_48h = float(hctx["predicted_cases_48h"])
            risk_score = float(hctx["riskScore"])

            if hospital_id not in mix_cache:
                mix_cache[hospital_id] = self._hospital_demand_mix(hospital_id, merged)
            mix = mix_cache[hospital_id]
            per_disease_predicted = {c: predicted_48h * mix[c] for c in DISEASE_COLUMNS}

            for _, row in group.iterrows():
                item_code = row["item_code"]
                projected_demand_48h = sum(
                    per_disease_predicted[c] * BOM[c].get(item_code, 0.0) for c in DISEASE_COLUMNS
                )
                daily_burn = projected_demand_48h / 2.0
                current_stock = float(row["current_stock"])
                lead_time_days = float(row["lead_time_days"])

                days_of_cover = (current_stock / daily_burn) if daily_burn > 0.01 else 999.0

                # Uncertainty/urgency-aware buffer: a hotter risk score widens the safety margin.
                buffer_days = lead_time_days * (0.4 + risk_score / 100.0)
                target_stock = daily_burn * (lead_time_days + buffer_days)
                recommended_reorder_qty = max(0, int(round(target_stock - current_stock)))

                if days_of_cover < lead_time_days:
                    urgency = "critical"
                elif days_of_cover < (lead_time_days + buffer_days):
                    urgency = "warning"
                else:
                    urgency = "ok"

                results.append({
                    "hospital_id": hospital_id,
                    "hospital_name": row["hospital_name"],
                    "city": row["city"],
                    "item_code": item_code,
                    "item_name": row["item_name"],
                    "unit": row["unit"],
                    "current_stock": int(current_stock),
                    "projected_demand_48h": round(projected_demand_48h, 1),
                    "daily_burn_rate": round(daily_burn, 2),
                    "days_of_cover": round(min(days_of_cover, 999.0), 1),
                    "lead_time_days": int(lead_time_days),
                    "recommended_reorder_qty": recommended_reorder_qty,
                    "unit_cost_inr": float(row["unit_cost_inr"]),
                    "urgency": urgency,
                })

        results.sort(key=lambda r: (URGENCY_ORDER[r["urgency"]], -r["recommended_reorder_qty"]))
        return results

    def get_summary(self, status_rows):
        if not status_rows:
            return {
                "criticalItems": 0, "warningItems": 0, "hospitalsAtRisk": 0,
                "estimatedReorderSpendInr": 0.0, "totalItemsTracked": 0,
            }
        critical = [r for r in status_rows if r["urgency"] == "critical"]
        warning = [r for r in status_rows if r["urgency"] == "warning"]
        hospitals_at_risk = len({r["hospital_id"] for r in critical + warning})
        spend = sum(r["recommended_reorder_qty"] * r["unit_cost_inr"] for r in status_rows)
        return {
            "criticalItems": len(critical),
            "warningItems": len(warning),
            "hospitalsAtRisk": hospitals_at_risk,
            "estimatedReorderSpendInr": round(spend, 2),
            "totalItemsTracked": len(status_rows),
        }

    def get_rebalance_suggestions(self, tenant_cities, max_suggestions=20):
        """Within-tenant transfer suggestions: move surplus stock from a
        comfortably-stocked branch to a critical/warning branch before
        defaulting to a fresh purchase order. Only meaningful for tenants
        with more than one facility."""
        status_rows = self.get_status(tenant_cities)
        if not status_rows:
            return []

        merged = self._latest_merged()
        coords = {}
        if not merged.empty:
            latest = merged[merged["date"] == merged["date"].max()]
            coords = latest.set_index("hospital_id")[["lat", "lng"]].to_dict("index")

        by_item = {}
        for row in status_rows:
            by_item.setdefault(row["item_code"], []).append(dict(row))

        suggestions = []
        for item_code, rows in by_item.items():
            if len(rows) < 2:
                continue
            deficits = [r for r in rows if r["urgency"] in ("critical", "warning")]
            surpluses = [
                r for r in rows
                if r["urgency"] == "ok" and r["days_of_cover"] > (r["lead_time_days"] * 2)
            ]
            if not deficits or not surpluses:
                continue

            surpluses.sort(key=lambda r: -r["days_of_cover"])
            deficits.sort(key=lambda r: r["days_of_cover"])

            for deficit in deficits:
                shortfall = max(0, deficit["recommended_reorder_qty"])
                if shortfall <= 0:
                    continue
                for surplus in surpluses:
                    if surplus["hospital_id"] == deficit["hospital_id"]:
                        continue
                    excess_days = surplus["days_of_cover"] - (surplus["lead_time_days"] * 1.5)
                    transferable = int(excess_days * surplus["daily_burn_rate"])
                    if transferable <= 0:
                        continue
                    qty = min(shortfall, transferable)
                    if qty <= 0:
                        continue

                    distance_km = None
                    if surplus["hospital_id"] in coords and deficit["hospital_id"] in coords:
                        distance_km = _haversine_km(
                            coords[surplus["hospital_id"]]["lat"], coords[surplus["hospital_id"]]["lng"],
                            coords[deficit["hospital_id"]]["lat"], coords[deficit["hospital_id"]]["lng"],
                        )

                    suggestions.append({
                        "item_code": item_code,
                        "item_name": deficit["item_name"],
                        "unit": deficit["unit"],
                        "from_hospital_id": surplus["hospital_id"],
                        "from_hospital_name": surplus["hospital_name"],
                        "from_city": surplus["city"],
                        "to_hospital_id": deficit["hospital_id"],
                        "to_hospital_name": deficit["hospital_name"],
                        "to_city": deficit["city"],
                        "quantity": qty,
                        "distance_km": round(float(distance_km), 1) if distance_km is not None else None,
                        "to_urgency": deficit["urgency"],
                    })

                    shortfall -= qty
                    if surplus["daily_burn_rate"] > 0:
                        surplus["days_of_cover"] -= qty / surplus["daily_burn_rate"]
                    if shortfall <= 0:
                        break

        suggestions.sort(
            key=lambda s: (URGENCY_ORDER[s["to_urgency"]], s["distance_km"] if s["distance_km"] is not None else 99999)
        )
        return suggestions[:max_suggestions]


inventory_engine = InventoryEngine()
