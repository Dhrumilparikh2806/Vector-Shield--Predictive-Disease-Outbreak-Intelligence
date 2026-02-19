import pandas as pd, json, os

BASE = os.path.dirname(os.path.abspath(__file__))
h = pd.read_csv(os.path.join(BASE, 'Data set', 'NEW HOSPITAL ALL.csv'))
w = pd.read_csv(os.path.join(BASE, 'Data set', 'NEW WATER ALL.csv'))

print("HOSPITAL COLS:", json.dumps(list(h.columns)))
print()
print("WATER COLS:", json.dumps(list(w.columns)))
print()

h['date'] = pd.to_datetime(h['date'])
w['date'] = pd.to_datetime(w['date'])
print(f"Hospital: {len(h)} rows | {h['date'].min().date()} -> {h['date'].max().date()}")
print(f"Water:    {len(w)} rows | {w['date'].min().date()} -> {w['date'].max().date()}")
print()
print("Hospital cities:", sorted(h['city'].unique().tolist()))
print()
# Try merge
m = pd.merge(h, w, on=['date','hospital_id'], how='inner', suffixes=('','_w'))
print(f"Merged: {len(m)} rows, {len(m.columns)} cols")
print("All cols after merge:", json.dumps(list(m.columns)))
print()
print("Water temp col:", [c for c in m.columns if 'temp' in c.lower()])
print("Turbidity:", [c for c in m.columns if 'turbid' in c.lower()])
print("pH:", [c for c in m.columns if 'ph' in c.lower()])
print("Coliform:", [c for c in m.columns if 'coliform' in c.lower()])
print("Bed:", [c for c in m.columns if 'bed' in c.lower()])
