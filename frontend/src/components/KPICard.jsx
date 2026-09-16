import React from 'react';

const RISK_COLORS = {
    CRITICAL: '#DC2626',
    HIGH: '#EA580C',
    MODERATE: '#CA8A04',
    LOW: '#16A34A',
};

const KPICard = ({ title, value, unit, riskLevel, icon: Icon }) => {
    const color = RISK_COLORS[riskLevel?.toUpperCase()] || '#0F172A';

    return (
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
                <span className="app-mono text-[11px] uppercase tracking-wider text-[#8593A6]">{title}</span>
                {Icon && (
                    <div className="p-1.5 rounded bg-[#F8FAFB]">
                        <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="app-mono text-2xl font-semibold tracking-tight" style={{ color }}>
                    {value !== undefined && value !== null && value !== '' ? value : 0}
                </span>
                {unit && <span className="app-mono text-xs text-[#8593A6]">{unit}</span>}
            </div>
        </div>
    );
};

export default KPICard;
