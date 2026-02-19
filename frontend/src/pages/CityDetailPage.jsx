import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, Droplets, Download, FileText, AlertCircle } from 'lucide-react';
import KPICard from '../components/KPICard';
import TrendChart from '../components/TrendChart';
import EnvironmentalPanel from '../components/EnvironmentalPanel';
import CityMap from '../components/CityMap';
import RiskExplanationPanel from '../components/RiskExplanationPanel';

import { getPredictions48h, getMapZones, getDashboardSummary, reloadBackend, simulateTick } from '../services/api';

const CityDetailPage = () => {
    const { name } = useParams();
    const [data, setData] = useState({
        risk: 0,
        cases: 0,
        lat: 0,
        lng: 0,
        loading: true,
        summary: null
    });
    const [error, setError] = useState(null);

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
                getDashboardSummary()
            ]);
            // ... (rest of loadData)
            const cityPred = preds.find(p => p.location === name);
            const cityZone = zones.find(z => z.location === name);

            setData({
                risk: cityZone?.riskScore || 0,
                cases: cityPred?.predicted_cases_48h || 0,
                lat: cityZone?.lat || 0,
                lng: cityZone?.lng || 0,
                loading: false,
                summary
            });
            setError(null);
        } catch (err) {
            console.error('Error loading city detail:', err);
            setError('Backend offline – retrying...');
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // 10s for live updates
        return () => clearInterval(interval);
    }, [name]);

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-screen">
            <Link to="/dashboard" className="flex items-center text-slate-400 hover:text-white mb-2 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 animate-pulse mb-6">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{name} Analysis</h1>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Lat: {data.lat.toFixed(4)}</span>
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Lng: {data.lng.toFixed(4)}</span>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-sm text-slate-400">Last Updated</div>
                    <div className="text-white font-mono">Real-time ML Stream</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <KPICard title="City Risk Score" value={data.risk} unit="/ 100" riskLevel={data.risk > 70 ? "HIGH" : data.risk > 40 ? "MODERATE" : "LOW"} icon={Activity} />
                        <KPICard title="Predicted 48h Cases" value={data.cases} icon={Activity} />
                        <KPICard title="National Avg Risk" value={data.summary?.avgRisk || 0} unit="/ 100" icon={Droplets} />
                        <KPICard title="National Hotspots" value={data.summary?.criticalZones || 0} unit="active" />
                    </div>

                    <div className="h-80">
                        <TrendChart title="Local Infection Prediction (48h Forecast)" color="#ef4444" dataKey="risk" data={[{ name: 'Now', risk: data.risk }, { name: '+48h', risk: data.cases }]} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-400 border border-slate-800 rounded-lg text-xs font-bold hover:text-white transition-all">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-400 border border-slate-800 rounded-lg text-xs font-bold hover:text-white transition-all">
                            <FileText className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <CityMap lat={data.lat} lng={data.lng} cityName={name} />
                    <EnvironmentalPanel data={{ humidity: data.risk }} />
                    <RiskExplanationPanel location={name} />
                </div>
            </div>
        </div>
    );
};

export default CityDetailPage;
