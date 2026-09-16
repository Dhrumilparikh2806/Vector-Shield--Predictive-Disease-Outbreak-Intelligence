"""
Fabricates hospital-admission + water-quality time series for the investor-demo
tenants (government network, private chain, single hospital) and appends them
to the existing pilot dataset, tagged with a `tenant_profile` column.

Run once, then re-run ml_engine.py to retrain on the combined dataset:
    python scripts/generate_demo_tenant_data.py
    python ml_engine.py

Safe to re-run: if the CSVs already have a tenant_profile column (i.e. this
script already ran), it refuses to run again rather than duplicating rows —
delete that column or restore the original CSVs from git first.
"""
import os
import sys
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from geo_mapping import GOVERNMENT_CITIES, MERIDIAN_BRANCHES, RAMDAYAL_CITIES  # noqa: E402

RNG_SEED = 42
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
HOSPITAL_CSV = os.path.join(DATA_DIR, 'NEW HOSPITAL ALL.csv')
WATER_CSV = os.path.join(DATA_DIR, 'NEW WATER ALL.csv')

DATE_START = '2025-08-24'
DATE_END = '2026-02-19'  # must match the existing dataset's last date exactly


def slug(label: str) -> str:
    return label.upper().replace(' - ', '_').replace(' ', '').replace(',', '')[:20]


def build_roster(cities: dict, tenant: str, prefix: str, name_fn, state_fn, hospital_type: str):
    """One hospital_id per city/branch in the given roster."""
    roster = []
    for city in cities:
        roster.append({
            'hospital_id': f"{prefix}_{slug(city)}",
            'hospital_name': name_fn(city),
            'hospital_type': hospital_type,
            'city': city,
            'state': state_fn(city),
            'tenant_profile': tenant,
        })
    return roster


# City -> state, best-effort real mapping for the government roster (Meridian branches
# and Ram Dayal use a simpler placeholder since "city" is already the display label).
GOV_STATE = {
    'Bhopal': 'Madhya Pradesh', 'Indore': 'Madhya Pradesh', 'Patna': 'Bihar',
    'Ranchi': 'Jharkhand', 'Raipur': 'Chhattisgarh', 'Bhubaneswar': 'Odisha',
    'Guwahati': 'Assam', 'Dehradun': 'Uttarakhand', 'Shimla': 'Himachal Pradesh',
    'Panaji': 'Goa', 'Imphal': 'Manipur', 'Agartala': 'Tripura',
    'Shillong': 'Meghalaya', 'Itanagar': 'Arunachal Pradesh', 'Gangtok': 'Sikkim',
    'Aizawl': 'Mizoram', 'Kohima': 'Nagaland', 'Srinagar': 'Jammu and Kashmir',
    'Jammu': 'Jammu and Kashmir', 'Thiruvananthapuram': 'Kerala', 'Coimbatore': 'Tamil Nadu',
    'Surat': 'Gujarat', 'Ahmedabad': 'Gujarat', 'Amritsar': 'Punjab',
    'Ludhiana': 'Punjab', 'Visakhapatnam': 'Andhra Pradesh', 'Bhilai': 'Chhattisgarh',
    'Jodhpur': 'Rajasthan',
}

ROSTERS = [
    *build_roster(
        GOVERNMENT_CITIES, 'government', 'GOV',
        name_fn=lambda c: f"District Government Hospital, {c}",
        state_fn=lambda c: GOV_STATE.get(c, 'India'),
        hospital_type='public',
    ),
    *build_roster(
        MERIDIAN_BRANCHES, 'meridian', 'MER',
        name_fn=lambda c: f"Meridian Health — {c}",
        state_fn=lambda c: c.split(' - ')[0],
        hospital_type='private',
    ),
    *build_roster(
        RAMDAYAL_CITIES, 'ramdayal', 'RD',
        name_fn=lambda c: f"Ram Dayal Hospital, {c}",
        state_fn=lambda c: 'Uttar Pradesh',
        hospital_type='private',
    ),
]


def generate_rows(rng: np.random.Generator, hospital: dict, dates: pd.DatetimeIndex, hotspot: bool):
    n = len(dates)

    admissions_base = rng.uniform(35, 150) * (1.6 if hotspot else 1.0)
    admissions = np.clip(admissions_base + rng.normal(0, 12, n).cumsum() * 0.05 + rng.normal(0, 8, n), 10, 220).round().astype(int)

    ph_base = rng.uniform(6.6, 7.6)
    turbidity_base = rng.uniform(1.0, 4.0) * (2.5 if hotspot else 1.0)
    fecal_base = rng.uniform(60, 300) * (2.2 if hotspot else 1.0)

    water_ph = np.clip(rng.normal(ph_base, 0.15, n), 6.2, 8.2)
    turbidity = np.clip(rng.normal(turbidity_base, turbidity_base * 0.4, n), 0.1, 34)
    fecal = np.clip(rng.normal(fecal_base, fecal_base * 0.5, n), 0, 3600).round().astype(int)
    chlorine = np.clip(rng.normal(0.2, 0.06, n), 0.02, 0.4)
    water_temp = np.clip(rng.normal(27, 3, n), 18, 34)
    dissolved_o2 = np.clip(rng.normal(6, 1.2, n), 2.5, 9.5)

    hosp_rows = pd.DataFrame({
        'date': dates.strftime('%d-%m-%Y'),
        'hospital_id': hospital['hospital_id'],
        'hospital_name': hospital['hospital_name'],
        'hospital_type': hospital['hospital_type'],
        'city': hospital['city'],
        'state': hospital['state'],
        'admissions': admissions,
        'cholera_cases': np.clip((admissions * rng.uniform(0.05, 0.15, n)).round(), 0, None).astype(int),
        'typhoid_cases': np.clip((admissions * rng.uniform(0.06, 0.16, n)).round(), 0, None).astype(int),
        'gastroenteritis_cases': np.clip((admissions * rng.uniform(0.08, 0.2, n)).round(), 0, None).astype(int),
        'other_cases': np.clip((admissions * rng.uniform(0.3, 0.6, n)).round(), 0, None).astype(int),
        'bed_occupancy_rate': np.clip(rng.normal(0.78 if not hotspot else 0.9, 0.1, n), 0.4, 1.0).round(2),
        'avg_patient_age': np.clip(rng.normal(36, 10, n), 1, 90).round(1),
        'comorbidity_index': np.clip(rng.normal(1.0, 0.35, n), 0.1, 2.5).round(2),
        'hospital_outbreak_flag': (admissions > np.percentile(admissions, 85)).astype(int),
        'tenant_profile': hospital['tenant_profile'],
    })

    water_risk_score = np.clip((turbidity / 34) * 0.5 + (fecal / 3600) * 0.5, 0, 1)
    water_risk_level = np.select(
        [water_risk_score < 0.33, water_risk_score < 0.66],
        ['LOW', 'MEDIUM'],
        default='HIGH',
    )

    water_rows = pd.DataFrame({
        'date': dates.strftime('%d-%m-%Y'),
        'hospital_id': hospital['hospital_id'],
        'hospital_name': hospital['hospital_name'],
        'water_pH': water_ph.round(2),
        'turbidity_NTU': turbidity.round(2),
        'fecal_coliform_cfu_100ml': fecal,
        'residual_chlorine_mg_L': chlorine.round(2),
        'water_temperature_C': water_temp.round(2),
        'dissolved_oxygen_mg_L': dissolved_o2.round(2),
        'cholera_water_risk': np.clip(rng.normal(0.4, 0.15, n), 0, 1).round(3),
        'typhoid_water_risk': np.clip(rng.normal(0.42, 0.15, n), 0, 1).round(3),
        'gastro_water_risk': np.clip(rng.normal(0.45, 0.15, n), 0, 1).round(3),
        'water_risk_score': water_risk_score.round(3),
        'water_risk_level': water_risk_level,
        'contamination_event_flag': (water_risk_score > 0.7).astype(int),
    })

    return hosp_rows, water_rows


def main():
    dates = pd.date_range(DATE_START, DATE_END, freq='D')
    print(f"Generating {len(dates)} days x {len(ROSTERS)} locations = {len(dates) * len(ROSTERS)} rows per file...")

    hosp_frames, water_frames = [], []
    for i, hospital in enumerate(ROSTERS):
        rng = np.random.default_rng(RNG_SEED + i)
        # ~18% of locations start as pre-existing "hotspots" for demo variety
        hotspot = rng.uniform() < 0.18
        h_rows, w_rows = generate_rows(rng, hospital, dates, hotspot)
        hosp_frames.append(h_rows)
        water_frames.append(w_rows)

    new_hospital_df = pd.concat(hosp_frames, ignore_index=True)
    new_water_df = pd.concat(water_frames, ignore_index=True)

    # Load existing pilot data and tag it as the 'default' tenant profile.
    existing_hospital_df = pd.read_csv(HOSPITAL_CSV)
    existing_water_df = pd.read_csv(WATER_CSV)

    if 'tenant_profile' in existing_hospital_df.columns:
        print("ERROR: NEW HOSPITAL ALL.csv already has a tenant_profile column — "
              "this script already ran once. Refusing to append a second copy of "
              "the demo data. Restore the original CSVs from git first if you need "
              "to regenerate.")
        sys.exit(1)

    existing_hospital_df['tenant_profile'] = 'default'

    combined_hospital_df = pd.concat([existing_hospital_df, new_hospital_df], ignore_index=True)
    combined_water_df = pd.concat([existing_water_df, new_water_df], ignore_index=True)

    combined_hospital_df.to_csv(HOSPITAL_CSV, index=False)
    combined_water_df.to_csv(WATER_CSV, index=False)

    print(f"Wrote {len(combined_hospital_df)} hospital rows -> {HOSPITAL_CSV}")
    print(f"Wrote {len(combined_water_df)} water rows -> {WATER_CSV}")
    print("Tenant profile breakdown (hospital rows):")
    print(combined_hospital_df.groupby('tenant_profile')['hospital_id'].nunique())
    print("\nNow run: python ml_engine.py   (from the backend/ directory)")


if __name__ == '__main__':
    main()
