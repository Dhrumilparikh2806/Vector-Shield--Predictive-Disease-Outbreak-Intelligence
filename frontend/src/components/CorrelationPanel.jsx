import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { getCorrelations } from '../services/api';

const BARS = [
    { key: 'casesVsWater', label: 'Cases vs Water Contamination', color: '#0B5C78' },
    { key: 'casesVsHumidity', label: 'Cases vs Relative Humidity', color: '#159A7E' },
    { key: 'casesVsRainfall', label: 'Cases vs Rainfall', color: '#DC2626' },
];

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
        <div className="bg-[#F8FAFB] border border-[#E2E8F0] rounded-lg p-4 mt-4">
            <span className="app-mono text-[11px] font-semibold text-[#8593A6] uppercase tracking-widest mb-3 flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" /> Multi-Vector Correlative Factors
            </span>
            <div className="space-y-3 mt-3">
                {BARS.map((b) => {
                    const value = correlations[b.key];
                    if (value === undefined) return null;
                    return (
                        <div key={b.key}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-[#0F172A] font-medium">{b.label}</span>
                                <span className="app-mono text-xs font-semibold" style={{ color: b.color }}>{value.toFixed(2)} Pearson</span>
                            </div>
                            <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${value * 100}%`, backgroundColor: b.color }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CorrelationPanel;
