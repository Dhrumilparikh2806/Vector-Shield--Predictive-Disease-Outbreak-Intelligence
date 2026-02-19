"""
sensor_store.py
---------------
Shared in-memory sensor state.
The background thread writes here; the /live-pod-data endpoint reads from here.
No file I/O on the hot path → always reflects the very latest reading.
"""

import threading
import time
import random
import os
import pandas as pd
from datetime import datetime

# ── In-memory store (thread-safe via lock) ─────────────────────────────────
_lock = threading.Lock()

_latest: dict = {
    "temperature": 0.0,
    "humidity":    0.0,
    "rainfall":    0.0,
    "soil_moisture": 0.0,
    "status": "starting",
    "timestamp": None,
}

def _simulate_new_reading():
    """Generates new simulated data (used by both thread and lazy fallback)"""
    temp     = 25 + random.uniform(-2, 2)
    humidity = 60 + random.uniform(-10, 10)
    moisture = 45 + random.uniform(-15, 15)
    rainfall = 0.0  # Stagnant rainfall as requested
    return temp, humidity, moisture, rainfall

def get_latest() -> dict:
    """Gets latest data. If stale (>5s old, likely due to Vercel freezing), simulate now."""
    with _lock:
        now = datetime.utcnow()
        last_ts_str = _latest.get("timestamp")
        
        is_stale = True
        if last_ts_str:
            last_ts = datetime.fromisoformat(last_ts_str)
            if (now - last_ts).total_seconds() < 5:
                is_stale = False
        
        # If thread is dead/frozen (Serverless), update state on-read
        if is_stale and _latest.get("status") != "starting":
            t, h, m, r = _simulate_new_reading()
            _latest["temperature"]   = round(t, 1)
            _latest["humidity"]      = round(h, 1)
            _latest["rainfall"]      = round(r, 2)
            _latest["soil_moisture"] = round(m, 1)
            _latest["status"]        = "live"
            _latest["timestamp"]     = now.isoformat()

        return dict(_latest)

def _set_latest(temp, humidity, moisture, rainfall):
    with _lock:
        _latest["temperature"]   = round(temp,     1)
        _latest["humidity"]      = round(humidity,  1)
        _latest["rainfall"]      = round(rainfall,  2)
        _latest["soil_moisture"] = round(moisture,  1)
        _latest["status"]        = "live"
        _latest["timestamp"]     = datetime.utcnow().isoformat()

# ── CSV path (also keep writing to file so arduino_listener stays compatible) ──
_CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "live_pod.csv")

def _ensure_csv():
    try:
        os.makedirs(os.path.dirname(_CSV_PATH), exist_ok=True)
        if not os.path.exists(_CSV_PATH):
            pd.DataFrame(columns=["date","temperature","humidity","moisture","rainfall"]
                         ).to_csv(_CSV_PATH, index=False)
    except Exception as e:
        print(f"[sensor_store] CSV init warning: {e}")

# ── Try real Arduino port ───────────────────────────────────────────────────
def _try_serial():
    try:
        import serial
        ser = serial.Serial("COM3", 9600, timeout=1)
        print("[sensor_store] 🔌 Connected to Arduino on COM3")
        return ser
    except Exception as e:
        print(f"[sensor_store] ⚠️  Arduino not available ({e}) — running in DEMO mode")
        return None

# ── Background sensor loop ─────────────────────────────────────────────────
def _sensor_loop():
    _ensure_csv()
    ser = _try_serial()
    print("[sensor_store] 🚀 Sensor loop started")

    while True:
        try:
            if ser:
                line = ser.readline().decode("utf-8").strip()
                if not line:
                    continue
                temp, humidity, moisture, rainfall = map(float, line.split(","))
            else:
                temp, humidity, moisture, rainfall = _simulate_new_reading()
                time.sleep(3)

            _set_latest(temp, humidity, moisture, rainfall)

            # Also append to CSV for historical record
            try:
                row = {
                    "date": datetime.utcnow(),
                    "temperature": round(temp, 1),
                    "humidity":    round(humidity, 1),
                    "moisture":    round(moisture, 1),
                    "rainfall":    round(rainfall, 2),
                }
                pd.DataFrame([row]).to_csv(_CSV_PATH, mode="a", header=False, index=False)
            except Exception as csv_err:
                # Silently fail on Vercel read-only filesystem
                pass 

        except Exception as e:
            time.sleep(1)

# ── Start once ──────────────────────────────────────────────────────────────
_thread = threading.Thread(target=_sensor_loop, daemon=True, name="SensorLoop")
_thread.start()
