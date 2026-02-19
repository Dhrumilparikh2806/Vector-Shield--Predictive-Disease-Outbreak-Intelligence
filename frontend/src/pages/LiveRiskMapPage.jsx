import React, { useState, useEffect } from 'react';
import { getMapZones, getDashboardSummary, getHeatmapData, reloadBackend, simulateTick, exportZonesCSV, getExportableData } from '../services/api';
import { Activity, Droplets, Thermometer, Radio, AlertCircle, Download, FileText, Loader } from 'lucide-react';
import RiskExplanationPanel from '../components/RiskExplanationPanel';
import LiveMapComponent from '../components/LiveMapComponent';
import SimulationIndicator from '../components/SimulationIndicator';
import GuidedDemo from '../components/GuidedDemo';

const KPIRow = ({ label, value, colorClass = "text-slate-200" }) => (
    <div className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0 last:pb-0">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className={`font-mono font-medium ${colorClass}`}>{value}</span>
    </div>
);

const RiskLevelBar = ({ label, range, color }) => (
    <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-4 rounded ${color}`}></div>
        <div className={`text-xs font-bold uppercase tracking-wider w-20 ${color.replace('bg-', 'text-')}`}>{label}</div>
        <div className="text-xs text-slate-500 ml-auto font-mono">{range}</div>
    </div>
);

const LiveRiskMapPage = () => {
    
    const [zones, setZones] = useState([]);
    const [summary, setSummary] = useState(null);
    const [heatmap, setHeatmap] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);

    const handleExportCSV = async () => {
        setExportLoading(true);
        try {
            const csvBlob = await exportZonesCSV();
            if (csvBlob) {
                const url = window.URL.createObjectURL(csvBlob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `zones-${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                // Fallback: create CSV from frontend state
                const csvContent = 'city,risk_score,severity,predicted_cases_48h\n' +
                    zones.map(z => `${z.location},${z.risk},${z.level},${z.predicted_cases || 0}`).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `zones-${new Date().toISOString().slice(0, 10)}.csv`;
                link.click();
            }
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        } finally {
            setExportLoading(false);
        }
    };

    const handleIntelReport = async () => {
        setExportLoading(true);
        try {
            const data = await getExportableData();
            const topZones = zones.sort((a, b) => (b.risk || 0) - (a.risk || 0)).slice(0, 5);
            const report = {
                timestamp: new Date().toISOString(),
                reportType: 'Risk Intelligence Report',
                summary: {
                    avgRisk: summary?.avgRisk || 0,
                    totalZones: summary?.totalZones || 0,
                    criticalZones: summary?.criticalZones || 0,
                    totalAnomalies: summary?.totalAnomalies || 0
                },
                activeCities: zones.map(z => ({ city: z.location, risk: z.risk, severity: z.level })),
                topRiskZones: topZones.map(z => ({ 
                    city: z.location, 
                    risk: z.risk, 
                    severity: z.level, 
                    predictedCases: z.predicted_cases || 0 
                }))
            };
            const jsonStr = JSON.stringify(report, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `intel-report-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
        } catch (err) {
            console.error('Intel report generation failed:', err);
            alert('Report generation failed. Please try again.');
        } finally {
            setExportLoading(false);
        }
    };

    const loadData = async () => {
        try {
            try {
                await simulateTick();
            } catch (simErr) {
                console.error('Simulation tick failed:', simErr);
            }

            const [zonesData, summaryData, heatmapData] = await Promise.all([
                getMapZones(),
                getDashboardSummary(),
                getHeatmapData()
            ]);
            setZones(zonesData);
            setSummary(summaryData);
            setHeatmap(heatmapData);
            setError(null);
        } catch (err) {
            console.error('Error loading map data:', err);
            setError('Backend offline – retrying...');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] p-6 overflow-hidden flex flex-col">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2 rounded-lg flex items-center gap-2 animate-pulse mb-4 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 flex-shrink-0 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Radio className="w-6 h-6 text-red-500 animate-pulse" />
                        Live Disease Risk Map
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time outbreak monitoring via VectorShield Pods + Hospital + Water Data</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                    <SimulationIndicator />
                    <GuidedDemo />
                </div>
            </div>

            {/* Main Content Split */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                {/* LEFT: Map (70%) */}
                <div className="lg:w-[70%] h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg relative">
                    <LiveMapComponent
                        zones={zones}
                        heatmap={heatmap}
                        onMarkerClick={(m) => setSelectedCity(m.location)}
                    />

                    {/* Floating Info */}
                    <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            Live Feed Active
                        </div>
                    </div>
                </div>

                {/* RIGHT: Analytics Panel (30%) */}
                <div className="lg:w-[30%] h-full overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                    {selectedCity && (
                        <div className="animate-in slide-in-from-right-4 duration-500">
                            <RiskExplanationPanel location={selectedCity} />
                        </div>
                    )}

                    {/* Export Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={handleExportCSV}
                            disabled={exportLoading}
                            className="flex items-center justify-center gap-2 py-2 bg-slate-900 text-slate-400 border border-slate-800 rounded-lg text-[10px] font-bold hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {exportLoading ? <Loader className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} EXPORT CSV
                        </button>
                        <button 
                            onClick={handleIntelReport}
                            disabled={exportLoading}
                            className="flex items-center justify-center gap-2 py-2 bg-slate-900 text-slate-400 border border-slate-800 rounded-lg text-[10px] font-bold hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {exportLoading ? <Loader className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />} INTEL REPORT
                        </button>
                    </div>

                    {/* Risk Scale Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-red-400" />
                            Risk Level Scale
                        </h3>
                        <div className="space-y-1">
                            <RiskLevelBar label="Critical" range="85-100" color="bg-red-600" />
                            <RiskLevelBar label="High" range="70-84" color="bg-red-500" />
                            <RiskLevelBar label="High-Mod" range="60-69" color="bg-orange-500" />
                            <RiskLevelBar label="Moderate" range="45-59" color="bg-orange-400" />
                            <RiskLevelBar label="Low-Mod" range="30-44" color="bg-amber-400" />
                            <RiskLevelBar label="Low" range="15-29" color="bg-emerald-500" />
                            <RiskLevelBar label="Very Low" range="0-14" color="bg-emerald-400" />
                        </div>
                        <div className="mt-3 text-[10px] text-slate-500 italic text-center border-t border-slate-800 pt-2">
                            Color intensity increases with risk score
                        </div>
                    </div>

                    {/* Zone Distribution */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">Zone Distribution</h3>
                        <div className="space-y-2">
                            <KPIRow label="Critical" value={summary?.criticalZones || 0} colorClass="text-red-500" />
                            <KPIRow label="High" value={summary?.highZones || 0} colorClass="text-orange-500" />
                            <KPIRow label="Active Cities" value={summary?.totalZones || 0} colorClass="text-amber-500" />
                        </div>
                    </div>

                    {/* Live Analytics */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">Live Analytics</h3>
                        <div className="space-y-2">
                            <KPIRow label="Average Risk" value={summary?.avgRisk || 0} />
                            <KPIRow label="Total Anomalies" value={summary?.totalAnomalies || 0} colorClass="text-yellow-500" />
                            <KPIRow label="Prediction Load" value={summary?.totalPredictedCases || 0} />
                            <KPIRow label="Active Nodes" value={summary?.totalZones || 0} />
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-500">
                        <p className="italic">Map updates every 10s based on latest ML output generation. Geospatial clusters are computed via DBSCAN.</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LiveRiskMapPage;
