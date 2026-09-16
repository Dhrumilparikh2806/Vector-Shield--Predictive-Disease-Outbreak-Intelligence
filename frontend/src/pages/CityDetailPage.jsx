import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, Droplets, Download, FileText, AlertTriangle, Loader } from 'lucide-react';
import KPICard from '../components/KPICard';
import TrendChart from '../components/TrendChart';
import EnvironmentalPanel from '../components/EnvironmentalPanel';
import CityMap from '../components/CityMap';
import RiskExplanationPanel from '../components/RiskExplanationPanel';

import { getPredictions48h, getMapZones, getDashboardSummary, simulateTick } from '../services/api';

const round1 = (n) => (typeof n === 'number' ? Math.round(n * 10) / 10 : n);

const CityDetailPage = () => {
    const { name } = useParams();
    const [data, setData] = useState({ risk: 0, cases: 0, lat: 0, lng: 0, loading: true, summary: null });
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const loadData = async () => {
        try {
            try {
                await simulateTick();
            } catch (simErr) {
                console.error('Simulation tick failed:', simErr);
            }

            const [preds, zones, summary] = await Promise.all([
                getPredictions48h(),
                getMapZones(),
                getDashboardSummary(),
            ]);
            const cityPred = preds.find((p) => p.location === name);
            const cityZone = zones.find((z) => z.location === name);

            setData({
                risk: round1(cityZone?.riskScore || 0),
                cases: round1(cityPred?.predicted_cases_48h || 0),
                lat: cityZone?.lat || 0,
                lng: cityZone?.lng || 0,
                loading: false,
                summary,
            });
            setError(null);
        } catch (err) {
            console.error('Error loading city detail:', err);
            setError('Backend offline – retrying...');
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2500);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name]);

    const handleExportCSV = () => {
        setExporting(true);
        try {
            const csv = 'city,risk_score,predicted_cases_48h,national_avg_risk\n' +
                `${name},${data.risk},${data.cases},${data.summary?.avgRisk || 0}`;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${name}-profile-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
        } finally {
            setExporting(false);
        }
    };

    const handleExportReport = () => {
        setExporting(true);
        try {
            const report = {
                city: name,
                timestamp: new Date().toISOString(),
                riskScore: data.risk,
                predictedCases48h: data.cases,
                coordinates: { lat: data.lat, lng: data.lng },
                nationalAvgRisk: data.summary?.avgRisk || 0,
            };
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${name}-report-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
        } finally {
            setExporting(false);
        }
    };

    const nationalDelta = round1((data.risk || 0) - (data.summary?.avgRisk || 0));

    return (
        <div className="app-shell p-6 space-y-6 bg-[#F8FAFB] min-h-screen">
            <Link to="/city-explorer" className="inline-flex items-center text-[#475569] hover:text-[#0F172A] transition-colors text-sm font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to City Explorer
            </Link>

            {error && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] p-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-2">{name} Analysis</h1>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="app-mono px-2 py-0.5 bg-[#F1F5F9] rounded text-xs text-[#475569]">LAT: {data.lat.toFixed(4)}</span>
                        <span className="app-mono px-2 py-0.5 bg-[#F1F5F9] rounded text-xs text-[#475569]">LNG: {data.lng.toFixed(4)}</span>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="app-mono text-[10px] text-[#8593A6] uppercase">Live Sync</div>
                    <div className="text-[#159A7E] app-mono text-sm font-semibold">Polling every 2.5s</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <KPICard title="City Risk Score" value={data.risk} unit="/ 100" riskLevel={data.risk > 70 ? 'HIGH' : data.risk > 40 ? 'MODERATE' : 'LOW'} icon={Activity} />
                        <KPICard title="Predicted 48h Cases" value={data.cases} icon={Activity} />
                        <KPICard title="National Avg Risk" value={data.summary?.avgRisk || 0} unit="/ 100" icon={Droplets} />
                        <KPICard title="Delta vs National" value={nationalDelta > 0 ? `+${nationalDelta}` : nationalDelta} unit="pts" icon={AlertTriangle} riskLevel={nationalDelta > 0 ? 'HIGH' : 'LOW'} />
                    </div>

                    <div className="h-80">
                        <TrendChart title="Local Infection Prediction (48h Forecast)" color="#DC2626" dataKey="risk" data={[{ name: 'Now', risk: data.risk }, { name: '+48h', risk: data.cases }]} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-[#475569] border border-[#E2E8F0] rounded text-sm font-medium hover:text-[#0F172A] hover:bg-[#F1F8F5] transition-all shadow-sm disabled:opacity-60"
                            type="button"
                        >
                            {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export CSV
                        </button>
                        <button
                            onClick={handleExportReport}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 bg-[#159A7E] text-white rounded text-sm font-medium hover:bg-[#11836A] transition-all shadow-sm disabled:opacity-60"
                            type="button"
                        >
                            {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Export Report (JSON)
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <CityMap lat={data.lat} lng={data.lng} cityName={name} />
                    <EnvironmentalPanel data={{ humidity: data.risk }} />
                    <RiskExplanationPanel location={name} defaultOpen />
                </div>
            </div>
        </div>
    );
};

export default CityDetailPage;
