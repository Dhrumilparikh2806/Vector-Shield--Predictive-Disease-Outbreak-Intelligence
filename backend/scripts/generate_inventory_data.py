"""
Fabricates a per-hospital inventory snapshot (current stock, resupply lead time,
unit cost) for the outbreak-response item catalog used by inventory_engine.py.

This script seeds STATIC stock levels only. The live burn-rate / demand
projection / reorder math happens at request time in inventory_engine.py,
using the (already trained) predicted_cases_48h per hospital. Stock levels
here are deliberately correlated with each hospital's recent case load and
risk score, so hospitals already flagged as high-risk in the live dashboards
also show up as inventory-constrained - consistent with the "outbreak
outpaces supply" story this feature is meant to demonstrate.

Run from backend/: python scripts/generate_inventory_data.py
"""
import os
import numpy as np
import pandas as pd

RNG_SEED = 7

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MERGED_PATH = os.path.join(_BACKEND_DIR, "ml_outputs", "merged_features.csv")
OUT_PATH = os.path.join(_BACKEND_DIR, "data", "inventory_stock.csv")

# Outbreak-response catalog. unit_cost_inr is an illustrative planning figure,
# not a real procurement price.
ITEMS = [
    {"item_code": "ors_sachets", "item_name": "ORS Sachets", "unit": "sachet", "unit_cost_inr": 15, "lead_time_base": 3},
    {"item_code": "iv_fluid_bags", "item_name": "IV Fluid - Ringer's Lactate (1L)", "unit": "bag", "unit_cost_inr": 65, "lead_time_base": 4},
    {"item_code": "azithromycin_courses", "item_name": "Azithromycin Course", "unit": "course", "unit_cost_inr": 140, "lead_time_base": 6},
    {"item_code": "ciprofloxacin_courses", "item_name": "Ciprofloxacin Course", "unit": "course", "unit_cost_inr": 95, "lead_time_base": 6},
    {"item_code": "water_purification_tablets", "item_name": "Water Purification Tablets", "unit": "tablet", "unit_cost_inr": 4, "lead_time_base": 3},
]

# Rough per-case reference weight used ONLY to seed a believable stock
# baseline here. The real, disease-specific consumption model lives in
# inventory_engine.py and is what actually drives reorder recommendations.
_SEED_WEIGHT = {
    "ors_sachets": 3.5,
    "iv_fluid_bags": 1.2,
    "azithromycin_courses": 0.35,
    "ciprofloxacin_courses": 0.3,
    "water_purification_tablets": 10.0,
}

# Lead time adjustment by network type: government procurement is slower,
# a private multi-branch chain has a tighter logistics network, a lone
# hospital has the weakest negotiating position / least frequent deliveries.
_LEAD_TIME_ADJUST = {
    "government": 2,
    "meridian": -1,
    "ramdayal": 3,
    "default": 0,
}


def main():
    if not os.path.exists(MERGED_PATH):
        raise SystemExit(f"Missing {MERGED_PATH} - run ml_engine.py first.")

    merged = pd.read_csv(MERGED_PATH)
    merged["date"] = pd.to_datetime(merged["date"])
    latest_date = merged["date"].max()
    window_start = latest_date - pd.Timedelta(days=13)

    recent = merged[(merged["date"] >= window_start) & (merged["date"] <= latest_date)]
    latest = merged[merged["date"] == latest_date].set_index("hospital_id")

    case_cols = ["cholera_cases", "typhoid_cases", "gastroenteritis_cases", "other_cases"]
    recent_avg_cases = recent.groupby("hospital_id")[case_cols].mean().sum(axis=1)

    hospitals = (
        merged[["hospital_id", "hospital_name", "city", "tenant_profile"]]
        .drop_duplicates(subset="hospital_id")
        .set_index("hospital_id")
    )

    rng = np.random.default_rng(RNG_SEED)
    rows = []

    for hospital_id, hinfo in hospitals.iterrows():
        avg_cases = float(recent_avg_cases.get(hospital_id, 1.0))
        avg_cases = max(avg_cases, 1.0)
        risk_score = float(latest.loc[hospital_id, "riskScore"]) if hospital_id in latest.index else 40.0
        tenant_profile = hinfo["tenant_profile"]

        # Higher current risk -> lower baseline days-of-cover (stock already
        # under pressure), independent per hospital via rng draw. Centered
        # close to typical lead times (3-9 days) so the reorder engine has a
        # believable mix of critical/warning/ok, not a flat "everything's fine".
        risk_pressure = np.clip(risk_score / 100.0, 0.0, 1.0)
        days_of_cover_center = 10 - (6.5 * risk_pressure)  # ranges roughly 3.5..10
        days_of_cover_seed = rng.triangular(
            max(1.5, days_of_cover_center - 4), days_of_cover_center, days_of_cover_center + 6
        )

        for item in ITEMS:
            code = item["item_code"]
            daily_ref = avg_cases * _SEED_WEIGHT[code]
            noise = rng.uniform(0.85, 1.15)
            current_stock = max(3, int(round(daily_ref * days_of_cover_seed * noise)))

            lead_time = max(1, item["lead_time_base"] + _LEAD_TIME_ADJUST.get(tenant_profile, 0) + int(rng.integers(-1, 2)))

            rows.append({
                "hospital_id": hospital_id,
                "hospital_name": hinfo["hospital_name"],
                "city": hinfo["city"],
                "tenant_profile": tenant_profile,
                "item_code": code,
                "item_name": item["item_name"],
                "unit": item["unit"],
                "current_stock": current_stock,
                "lead_time_days": lead_time,
                "unit_cost_inr": item["unit_cost_inr"],
            })

    out_df = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    out_df.to_csv(OUT_PATH, index=False)
    print(f"Wrote {len(out_df)} rows ({hospitals.shape[0]} hospitals x {len(ITEMS)} items) to {OUT_PATH}")


if __name__ == "__main__":
    main()
