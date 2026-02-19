import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import CityDetailPage from './pages/CityDetailPage';
import AlertsPage from './pages/AlertsPage';
import LiveRiskMapPage from './pages/LiveRiskMapPage';
import ScenarioSimulatorPage from './pages/ScenarioSimulatorPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/live-map" element={<LiveRiskMapPage />} />
                    <Route path="/scenario-simulator" element={<ScenarioSimulatorPage />} />
                    <Route path="/city/:name" element={<CityDetailPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
