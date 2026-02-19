import serial
import time
import pandas as pd
from datetime import datetime
import os

# UPDATE PORT BASED ON OS
# Windows example: "COM3"
# Linux example: "/dev/ttyACM0"
# Mac example: "/dev/cu.usbmodemXXXX"
PORT = "COM3"
BAUD = 9600

ser = None
try:
    ser = serial.Serial(PORT, BAUD, timeout=1)
    print("🔌 Listening to Arduino on", PORT)
except Exception as e:
    print(f"⚠️ Arduino not available ({e})")
    print("📊 Running in DEMO MODE - generating simulated sensor data...")
    ser = None

CSV_PATH = "backend/data/live_pod.csv"

# Write header once if file doesn't exist
try:
    pd.read_csv(CSV_PATH)
except:
    pd.DataFrame(columns=[
        "date", "temperature", "humidity", "moisture", "rainfall"
    ]).to_csv(CSV_PATH, index=False)

import random

while True:
    try:
        if ser:
            # Real Arduino mode
            line = ser.readline().decode("utf-8").strip()
            if not line:
                continue
            temp, humidity, moisture, rainfall = map(float, line.split(","))
        else:
            # Demo mode - simulate realistic sensor values
            temp = 25 + random.uniform(-2, 2)
            humidity = 60 + random.uniform(-10, 10)
            moisture = 45 + random.uniform(-15, 15)
            rainfall = 0.0 # Stagnant rainfall
            time.sleep(3)  # Simulate reading every 3 seconds

        row = {
            "date": datetime.utcnow(),
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "moisture": round(moisture, 1),
            "rainfall": round(rainfall, 2)
        }

        pd.DataFrame([row]).to_csv(
            CSV_PATH,
            mode="a",
            header=False,
            index=False
        )

        mode = "REAL" if ser else "DEMO"
        print(f"[{mode}] POD DATA:", row)

    except Exception as e:
        if ser:
            time.sleep(1)
        continue

