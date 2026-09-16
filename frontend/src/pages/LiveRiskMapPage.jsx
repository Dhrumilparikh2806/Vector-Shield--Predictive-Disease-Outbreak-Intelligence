import React, { useState, useEffect, useMemo } from 'react';
import { getMapZones, getDashboardSummary, getHeatmapData, simulateTick, exportZonesCSV, getExportableData, getRiskExplanation } from '../services/api';
import {
    Radio, AlertTriangle, Download, FileText, Loader, ShieldCheck, Gauge,
    Bug, BrainCircuit, ArrowRight, Layers, RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LiveMapComponent from '../components/LiveMapComponent';
import SimulationIndicator from '../components/SimulationIndicator';
import GuidedDemo from '../components/GuidedDemo';

const SEVERITY_FILTERS = [
    { key: 'ALL', label: 'All', match: () => true },
    { key: 'CRITICAL', label: 'Critical', match: (r) => r >= 70, color: '#DC2626' },
    { key: 'HIGH', label: 'High', match: (r) => r >= 45 && r < 70, color: '#EA580C' },
    { key: 'MODERATE', label: 'Moderate', match: (r) => r >= 15 && r < 45, color: '#CA8A04' },
    { key: 'LOW', label: 'Low', match: (r) => r < 15, color: '#16A34A' },
];

const RISK_LEGEND = [
    { label: 'Critical', range: '70 – 100', color: '#DC2626' },
    { label: 'High', range: '45 – 69', color: '#EA580C' },
    { label: 'Moderate', range: '15 – 44', color: '#CA8A04' },
    { label: 'Low', range: '0 – 14', color: '#16A34A' },
];

const KPIRow = ({ label, value, color = '#0F172A' }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-[#F1F5F9] last:border-0 last:pb-0">
        <span className="text-[#475569] text-sm">{label}</span>
        <span className="app-mono font-semibold text-sm" style={{ color }}>{value}</span>
    </div>
);

const TargetAnalysisPanel = ({ location }) => {
    const [explanation, setExplanation] = useState(null);

    useEffect(() => {
        if (!location) return;
        let cancelled = false;
        getRiskExplanation(location).then((d) => { if (!cancelled) setExplanation(d); }).catch(() => {});
        return () => { cancelled = true; };
    }, [location]);

    if (!location) {
        return (
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-6 text-center">
                <Gauge className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-sm text-[#475569]">Click a city marker on the map to inspect its risk breakdown.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-[#F8FAFB] border-b border-[#E2E8F0] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#159A7E]" />
                <h2 className="text-sm font-semibold text-[#0F172A]">Target Analysis: {location}</h2>
            </div>
            {explanation ? (
                <div className="p-4 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded bg-[#F8FAFB] border border-[#E2E8F0]">
                            <span className="app-mono text-[10px] text-[#8593A6] uppercase">Admissions Trend</span>
                            <div className="app-mono text-base font-bold text-[#0F172A]">{explanation.hospitalTrend}%</div>
                        </div>
                        <div className="p-2.5 rounded bg-[#F8FAFB] border border-[#E2E8F0]">
                            <span className="app-mono text-[10px] text-[#8593A6] uppercase">Water Index</span>
                            <div className="app-mono text-base font-bold text-[#0F172A]">{explanation.waterContamination}<span className="text-xs text-[#8593A6]">/100</span></div>
                        </div>
                        <div className="p-2.5 rounded bg-[#F8FAFB] border border-[#E2E8F0]">
                            <span className="app-mono text-[10px] text-[#8593A6] uppercase">Environmental Risk</span>
                            <div className="app-mono text-base font-bold text-[#0F172A]">{explanation.environmentalRisk}<span className="text-xs text-[#8593A6]">/100</span></div>
                        </div>
                        <div className="p-2.5 rounded bg-[#F8FAFB] border border-[#E2E8F0]">
                            <span className="app-mono text-[10px] text-[#8593A6] uppercase">Model Confidence</span>
                            <div className="app-mono text-base font-bold text-[#159A7E]">{explanation.confidence}%</div>
                        </div>
                    </div>
                    <Link
                        to={`/city/${encodeURIComponent(location)}`}
                        className="flex items-center justify-between p-2.5 rounded bg-[#159A7E] text-white hover:bg-[#11836A] transition-all shadow-sm group"
                    >
                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                            <BrainCircuit className="w-4 h-4" /> Open Full City Profile
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            ) : (
                <div className="p-6 text-center text-sm text-[#8593A6]">Loading breakdown…</div>
            )}
        </div>
    );
};

const LiveRiskMapPage = () => {
    const [zones, setZones] = useState([]);
    const [summary, setSummary] = useState(null);
    const [heatmap, setHeatmap] = useState([]);
    const [error, setError] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const [mapKey, setMapKey] = useState(0);

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
                const csvContent = 'city,risk_score,severity,predicted_cases_48h\n' +
                    zones.map((z) => `${z.location},${z.risk},${z.level},${z.predicted_cases || 0}`).join('\n');
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
            await getExportableData();
            const topZones = [...zones].sort((a, b) => (b.risk || 0) - (a.risk || 0)).slice(0, 5);
            const report = {
                timestamp: new Date().toISOString(),
                reportType: 'Risk Intelligence Report',
                summary: {
                    avgRisk: summary?.avgRisk || 0,
                    totalZones: summary?.totalZones || 0,
                    criticalZones: summary?.criticalZones || 0,
                    totalAnomalies: summary?.totalAnomalies || 0,
                },
                activeCities: zones.map((z) => ({ city: z.location, risk: z.risk, severity: z.level })),
                topRiskZones: topZones.map((z) => ({ city: z.location, risk: z.risk, severity: z.level, predictedCases: z.predicted_cases || 0 })),
            };
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8;' });
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
                getHeatmapData(),
            ]);
            setZones(zonesData || []);
            setSummary(summaryData);
            setHeatmap(heatmapData || []);
            setError(null);
        } catch (err) {
            console.error('Error loading map data:', err);
            setError('Backend offline – retrying...');
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2500);
        return () => clearInterval(interval);
    }, []);

    const filteredZones = useMemo(() => {
        const filter = SEVERITY_FILTERS.find((f) => f.key === severityFilter);
        if (!filter || filter.key === 'ALL') return zones;
        return zones.filter((z) => filter.match(z.riskScore ?? z.risk ?? 0));
    }, [zones, severityFilter]);

    const distribution = useMemo(() => {
        const counts = { CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0 };
        zones.forEach((z) => {
            const score = z.riskScore ?? z.risk ?? 0;
            if (score >= 70) counts.CRITICAL++;
            else if (score >= 45) counts.HIGH++;
            else if (score >= 15) counts.MODERATE++;
            else counts.LOW++;
        });
        return counts;
    }, [zones]);

    const total = zones.length || 1;

    return (
        <div className="app-shell h-[calc(100vh-56px)] p-6 overflow-hidden flex flex-col bg-[#F8FAFB]">
            {error && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] p-2 rounded-lg flex items-center gap-2 mb-3 text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 flex-shrink-0 mb-4">
                <div>
                    <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                        <Radio className="w-5 h-5 text-[#DC2626] animate-pulse" />
                        Live Disease Risk Map
                    </h1>
                    <p className="text-[#475569] text-sm mt-0.5">Real-time outbreak monitoring via hospital admissions, water quality, and IoT pods</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-white border border-[#E2E8F0] p-1 rounded-lg shadow-sm">
                        {SEVERITY_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setSeverityFilter(f.key)}
                                className="app-mono px-2.5 py-1 rounded text-[11px] font-bold transition-all"
                                style={severityFilter === f.key
                                    ? { backgroundColor: f.color || '#0F172A', color: '#fff' }
                                    : { color: f.color || '#475569' }}
                                type="button"
                            >
                                {f.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setMapKey((k) => k + 1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F1F8F5] text-[#0F172A] border border-[#E2E8F0] text-sm font-medium shadow-sm transition-all"
                        type="button"
                    >
                        <RotateCcw className="w-4 h-4 text-[#159A7E]" /> Reset View
                    </button>
                    <SimulationIndicator />
                    <GuidedDemo />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                <div className="lg:w-[68%] h-full bg-white rounded-lg border border-[#E2E8F0] overflow-hidden shadow-sm relative">
                    <LiveMapComponent
                        key={mapKey}
                        zones={filteredZones}
                        heatmap={heatmap}
                        onMarkerClick={(m) => setSelectedCity(m.location)}
                    />
                    <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur border border-[#E2E8F0] px-2.5 py-1.5 rounded text-xs text-[#475569] shadow-sm flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#159A7E]" />
                        <span className="app-mono">{filteredZones.length} / {zones.length} zones shown</span>
                    </div>
                </div>

                <div className="lg:w-[32%] h-full overflow-y-auto space-y-4 pr-1">
                    <TargetAnalysisPanel location={selectedCity} />

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleExportCSV}
                            disabled={exportLoading}
                            className="flex items-center justify-center gap-1.5 py-2 bg-white text-[#475569] border border-[#E2E8F0] rounded text-[11px] font-bold hover:text-[#0F172A] hover:bg-[#F1F8F5] transition-all disabled:opacity-50"
                            type="button"
                        >
                            {exportLoading ? <Loader className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} EXPORT CSV
                        </button>
                        <button
                            onClick={handleIntelReport}
                            disabled={exportLoading}
                            className="flex items-center justify-center gap-1.5 py-2 bg-[#159A7E] text-white rounded text-[11px] font-bold hover:bg-[#11836A] transition-all disabled:opacity-50"
                            type="button"
                        >
                            {exportLoading ? <Loader className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />} INTEL REPORT
                        </button>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                            <Bug className="w-4 h-4 text-[#DC2626]" /> Risk Level Scale
                        </h3>
                        <div className="space-y-1.5">
                            {RISK_LEGEND.map((r) => (
                                <div key={r.label} className="flex items-center justify-between p-1.5 rounded bg-[#F8FAFB]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                                        <span className="text-xs font-semibold text-[#0F172A]">{r.label}</span>
                                    </div>
                                    <span className="app-mono text-xs font-bold" style={{ color: r.color }}>{r.range}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-[#0F172A]">Zone Risk Distribution</h3>
                            <span className="app-mono text-xs text-[#8593A6]">{zones.length} centers</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden flex mb-3">
                            {RISK_LEGEND.map((r) => (
                                <div
                                    key={r.label}
                                    className="h-full"
                                    style={{ width: `${((distribution[r.label.toUpperCase()] || 0) / total) * 100}%`, backgroundColor: r.color }}
                                    title={`${r.label}: ${distribution[r.label.toUpperCase()] || 0}`}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {RISK_LEGEND.map((r) => (
                                <div key={r.label} className="flex items-center justify-between p-1.5 bg-[#F8FAFB] rounded app-mono text-xs">
                                    <span className="flex items-center gap-1 font-medium" style={{ color: r.color }}>
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                                        {r.label}
                                    </span>
                                    <span className="font-bold text-[#0F172A]">{distribution[r.label.toUpperCase()] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Live Analytics</h3>
                        <div className="space-y-1">
                            <KPIRow label="Average Risk" value={summary?.avgRisk || 0} />
                            <KPIRow label="Total Anomalies" value={summary?.totalAnomalies || 0} color="#CA8A04" />
                            <KPIRow label="Prediction Load" value={summary?.totalPredictedCases || 0} />
                            <KPIRow label="Active Zones" value={summary?.totalZones || 0} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveRiskMapPage;
