import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CityDetailPage from './pages/CityDetailPage';
import CityExplorerPage from './pages/CityExplorerPage';
import AlertsPage from './pages/AlertsPage';
import LiveRiskMapPage from './pages/LiveRiskMapPage';
import ScenarioSimulatorPage from './pages/ScenarioSimulatorPage';
import InventoryIntelligencePage from './pages/InventoryIntelligencePage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/live-map" element={<LiveRiskMapPage />} />
                        <Route path="/scenario-simulator" element={<ScenarioSimulatorPage />} />
                        <Route path="/inventory" element={<InventoryIntelligencePage />} />
                        <Route path="/city-explorer" element={<CityExplorerPage />} />
                        <Route path="/city/:name" element={<CityDetailPage />} />
                        <Route path="/alerts" element={<AlertsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
