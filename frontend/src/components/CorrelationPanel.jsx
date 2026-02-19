import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart } from 'lucide-react';
import { getCorrelations } from '../services/api';

const CorrelationPanel = () => {
    const [correlations, setCorrelations] = useState(null);

    useEffect(() => {
        const fetchCorrs = async () => {
            try {
                const data = await getCorrelations();
                setCorrelations(data);
            } catch (err) {
                console.error('Failed to fetch correlations:', err);
            }
        };
        fetchCorrs();
    }, []);

    if (!correlations) return null;

    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart className="w-3 h-3" /> Statistical Correlations
            </h3>
            <div className="space-y-3">
                <CorrelationItem label="Cases vs Water Contamination" value={correlations.casesVsWater} color="bg-blue-500" />
                <CorrelationItem label="Cases vs Humidity" value={correlations.casesVsHumidity} color="bg-emerald-500" />
                <CorrelationItem label="Cases vs Rainfall" value={correlations.casesVsRainfall} color="bg-cyan-500" />
            </div>
        </div>
    );
};

const CorrelationItem = ({ label, value, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-300">
            <span>{label}</span>
            <span className="font-mono">{value.toFixed(2)}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} transition-all duration-1000`}
                style={{ width: `${value * 100}%` }}
            ></div>
        </div>
    </div>
);

export default CorrelationPanel;
