import httpx
import json

base_url = "http://127.0.0.1:8000/api/v1"

def test_endpoint(path, method="GET", data=None):
    try:
        if method == "GET":
            response = httpx.get(f"{base_url}{path}")
        else:
            response = httpx.post(f"{base_url}{path}", json=data)
        
        print(f"Testing {method} {path}...")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            res_json = response.json()
            print(f"Response: {json.dumps(res_json)[:100]}...")
            return True, res_json
        else:
            print(f"Error: {response.text}")
            return False, response.text
    except Exception as e:
        print(f"Exception: {e}")
        return False, str(e)

print("--- Phase 2 Verification ---")
s1, summary = test_endpoint("/dashboard/summary")
s2, zones = test_endpoint("/map/zones")
s3, heatmap = test_endpoint("/map/heatmap")
s4, predictions = test_endpoint("/prediction/48h")
s5, alerts = test_endpoint("/alerts/live")
s6, reload_res = test_endpoint("/system/reload", method="POST")

print("\nLogic Check:")
if s1:
    print(f"Summary Check: TotalZones={summary.get('totalZones')}, AvgRisk={summary.get('avgRisk')}")
if s5 and isinstance(alerts, list):
    print(f"Alerts Check: Generated {len(alerts)} alerts.")
    if len(alerts) > 0:
        print(f"Sample Alert: {alerts[0]}")

if s6:
    print(f"Reload Check: {reload_res.get('status')}")

# Final Pass/Fail determination
all_pass = all([s1, s2, s3, s4, s5, s6])
print(f"\nOVERALL STATUS: {'PASS' if all_pass else 'FAIL'}")
