import React, { useEffect, useState } from 'react';
import { Activity, Droplets, AlertTriangle, Compass, LayoutGrid } from 'lucide-react';
import KPICard from '../components/KPICard';
import OutbreakMap from '../components/OutbreakMap';
import TrendChart from '../components/TrendChart';
import DashboardRightPanel from '../components/DashboardRightPanel';
import GuidedDemo from '../components/GuidedDemo';
import ArchitectureModal from '../components/ArchitectureModal';
import SimulationIndicator from '../components/SimulationIndicator';
import ExportButtons from '../components/ExportButtons';
import { getDashboardSummary, getPredictions48h, getLiveAlerts, getMapZones, simulateTick, getLivePodData } from '../services/api';

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
                getLivePodData(),
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
        const interval = setInterval(loadData, 2500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const podInterval = setInterval(async () => {
            try {
                const freshPod = await getLivePodData();
                setPodData(freshPod || {});
            } catch (e) {
                console.warn('Pod poll failed:', e);
            }
        }, 2500);
        return () => clearInterval(podInterval);
    }, []);

    if (loading && !summary) {
        return (
            <div className="p-6 bg-[#F8FAFB] min-h-screen flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#159A7E] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="app-mono text-[#8593A6] font-medium animate-pulse tracking-widest uppercase text-xs">Loading VectorShield Surveillance...</p>
            </div>
        );
    }

    return (
        <div className="app-shell p-6 space-y-6 bg-[#F8FAFB] min-h-screen">
            <ArchitectureModal isOpen={isArchModalOpen} onClose={() => setIsArchModalOpen(false)} />

            {error && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] p-3 rounded-lg flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">National Disease Surveillance</h1>
                        <span className="app-mono px-2 py-0.5 bg-[#159A7E] text-white text-[10px] font-bold rounded uppercase tracking-widest">v1.2 Pilot</span>
                    </div>
                    <p className="text-[#475569] text-sm">Real-time predictive modeling for geospatial health monitoring.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <SimulationIndicator />
                    <GuidedDemo />
                    <button
                        onClick={() => setIsArchModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B5C78] hover:bg-[#0a4e66] text-white rounded text-sm font-medium transition-colors shadow-sm"
                        type="button"
                    >
                        <LayoutGrid className="w-4 h-4" /> Architecture
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    riskLevel={alerts.length > 0 ? 'HIGH' : 'LOW'}
                    icon={AlertTriangle}
                />
                <KPICard
                    title="Total Risk Zones"
                    value={summary?.totalZones || 0}
                    unit="cities"
                    icon={Droplets}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4">
                        <h2 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-[#159A7E]" /> Geospatial Risk Intelligence
                        </h2>
                        <OutbreakMap hotspots={zones} showPopups={false} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-72">
                        <TrendChart
                            title="Predicted Cases (Top 5 Cities)"
                            color="#EA580C"
                            dataKey="predicted_cases_48h"
                            data={predictions.slice(0, 5).map((p) => ({ name: p.location, predicted_cases_48h: p.predicted_cases_48h }))}
                        />
                        <TrendChart
                            title="Active Alerts Density"
                            color="#0B5C78"
                            dataKey="count"
                            data={Object.entries(alerts.reduce((acc, a) => {
                                acc[a.location] = (acc[a.location] || 0) + 1;
                                return acc;
                            }, {})).map(([name, count]) => ({ name, count }))}
                        />
                    </div>
                </div>

                <div className="h-full">
                    <DashboardRightPanel summary={summary} alerts={alerts} podData={podData} />
                </div>
            </div>

            <div className="flex justify-center gap-3 py-6 border-t border-[#E2E8F0] mt-6">
                <ExportButtons />
            </div>
        </div>
    );
};

export default DashboardPage;
