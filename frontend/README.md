# VectorShield - Predictive Disease Outbreak Dashboard

VectorShield is a health-tech predictive outbreak intelligence system designed to predict Cholera and Typhoid outbreaks 48 hours in advance.

## Project Overview

- **Frontend**: React + Vite + Tailwind CSS
- **Mapping**: React Leaflet
- **Charts**: Recharts
- **API**: Axios (Connected to placeholder `api.vectorshield.ai`)

## Setup Instructions

Since Node.js was not detected in the environment, the project structure has been scaffolded manually. To run the project, please follow these steps:

1. **Install Node.js**: Ensure you have Node.js installed (v16+).
2. **Navigate to directory**:
   ```bash
   cd vectorshield
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Features implemented

- **Landing Page**: Immersive hero section with feature highlights.
- **Dashboard**: Real-time KPI cards, interactive outbreak map, trend charts, and environmental data.
- **City Detail**: Detailed analysis view for specific locations.
- **Alerts**: Live alert monitoring system.
- **No Mock Data**: All data defaults to 0 until the backend responds.
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS.

## API Integration

The application is configured to fetch data from `https://api.vectorshield.ai`.
- If the API is unavailable, the application gracefully handles errors and displays default `0` values as requested.
- You can update `src/services/api.js` to point to a real backend.
