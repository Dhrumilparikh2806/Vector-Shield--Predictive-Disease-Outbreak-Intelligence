import React, { useEffect, useState } from 'react';
import { Activity, Droplets, AlertCircle, Layout, FileText, Download } from 'lucide-react';
import KPICard from '../components/KPICard';
import OutbreakMap from '../components/OutbreakMap';
import TrendChart from '../components/TrendChart';
import DashboardRightPanel from '../components/DashboardRightPanel';
import GuidedDemo from '../components/GuidedDemo';
import ArchitectureModal from '../components/ArchitectureModal';
import SimulationIndicator from '../components/SimulationIndicator';
import ExportButtons from '../components/ExportButtons';
import { getDashboardSummary, getPredictions48h, getLiveAlerts, reloadBackend, getMapZones, simulateTick, getLivePodData } from '../services/api';

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [zones, setZones] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [podData, setPodData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isArchModalOpen, setIsArchModalOpen] = useState(false);

    const loadData = async () => {
        try {
            try {
                await simulateTick();
            } catch (simErr) {
                console.error('Simulation tick failed:', simErr);
            }

            const [summaryData, alertsData, predictionsData, zonesData, podDataRes] = await Promise.all([
                getDashboardSummary(),
                getLiveAlerts(),
                getPredictions48h(),
                getMapZones(),
                getLivePodData()
            ]);

            setSummary(summaryData);
            setAlerts(alertsData);
            setPredictions(predictionsData);
            setZones(zonesData || []);
            setPodData(podDataRes || {});
            setError(null);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Backend offline – retrying...');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // 10s for live updates
        return () => clearInterval(interval);
    }, []);

    if (loading && !summary) {
        return (
            <div className="p-6 text-white bg-slate-950 min-h-screen flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-xs">Initializing VectorShield Matrix...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-screen font-sans selection:bg-primary/30">
            <ArchitectureModal isOpen={isArchModalOpen} onClose={() => setIsArchModalOpen(false)} />

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 animate-pulse mb-4">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-white tracking-tight">National Disease Surveillance</h1>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded border border-primary/20 uppercase tracking-widest">v1.2 Pilot</span>
                    </div>
                    <p className="text-slate-400 text-sm">Real-time predictive modeling for geospatial health monitoring</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                    <SimulationIndicator />
                    <GuidedDemo />
                    <button
                        onClick={() => setIsArchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur text-slate-300 border border-slate-700/50 rounded-full text-xs font-bold hover:bg-slate-800 hover:text-white transition-all shadow-lg"
                    >
                        <Layout className="w-4 h-4" /> Architecture
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div id="dashboard" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Average Risk Score"
                    value={summary?.avgRisk || 0}
                    unit="/ 100"
                    riskLevel={summary?.avgRisk > 70 ? 'HIGH' : summary?.avgRisk > 40 ? 'MODERATE' : 'LOW'}
                    icon={Activity}
                />
                <KPICard
                    title="Predicted 48h Cases"
                    value={summary?.totalPredictedCases || 0}
                    unit="cases"
                    icon={Activity}
                />
                <KPICard
                    title="Active Alerts"
                    value={alerts.length}
                    unit="zones"
                    riskLevel={alerts.length > 0 ? "HIGH" : "LOW"}
                    icon={AlertCircle}
                />
                <KPICard
                    title="Total Risk Zones"
                    value={summary?.totalZones || 0}
                    unit="cities"
                    icon={Droplets}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div id="map" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" /> Geospatial Risk Intelligence
                        </h2>
                        <OutbreakMap hotspots={zones} showPopups={false} />
                    </div>

                    <div id="predictions" className="grid grid-cols-1 md:grid-cols-2 gap-4 h-72">
                        <TrendChart
                            title="Predicted Cases (Top 5 Cities)"
                            color="#f97316"
                            dataKey="predicted_cases_48h"
                            data={predictions.slice(0, 5).map(p => ({ name: p.location, predicted_cases_48h: p.predicted_cases_48h }))}
                        />
                        <TrendChart
                            title="Active Alerts Heatmap"
                            color="#3b82f6"
                            dataKey="count"
                            data={Object.entries(alerts.reduce((acc, a) => {
                                acc[a.location] = (acc[a.location] || 0) + 1;
                                return acc;
                            }, {})).map(([name, count]) => ({ name, count }))}
                        />
                    </div>
                </div>

                <div id="alerts" className="h-full">
                    <DashboardRightPanel summary={summary} alerts={alerts} podData={podData} />
                </div>
            </div>

            {/* Export Actions */}
            <div className="flex justify-center gap-4 py-8 border-t border-slate-900/50 mt-12">
                <ExportButtons />
            </div>
        </div>
    );
};

export default DashboardPage;
