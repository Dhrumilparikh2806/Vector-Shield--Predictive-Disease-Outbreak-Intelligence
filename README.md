# VectorShield – Predictive Disease Surveillance Platform

## Overview
Real-time outbreak prediction using:
- **Hospital admissions**
- **Water quality**
- **IoT pod sensors**
- **ML forecasting**
- **Geospatial risk mapping**

## Architecture Diagram
```text
Arduino → Backend → ML → FastAPI → React Dashboard
```

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **Machine Learning:** Random Forest, Isolation Forest
- **Mapping:** Leaflet Maps
- **Hardware Integration:** Arduino + Serial

## How to Run

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Arduino Listener
Run the listener to process IoT data:
```bash
python backend/arduino_listener.py
```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
