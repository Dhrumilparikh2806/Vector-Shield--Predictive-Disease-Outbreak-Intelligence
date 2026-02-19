import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ title, value, unit, trend, riskLevel, icon: Icon }) => {
    const getRiskColor = (level) => {
        switch (level?.toUpperCase()) {
            case 'CRITICAL': return 'text-risk-critical border-risk-critical/20 bg-risk-critical/5';
            case 'HIGH': return 'text-risk-high border-risk-high/20 bg-risk-high/5';
            case 'MODERATE': return 'text-risk-moderate border-risk-moderate/20 bg-risk-moderate/5';
            case 'LOW': return 'text-risk-low border-risk-low/20 bg-risk-low/5';
            default: return 'text-slate-100 border-slate-800 bg-slate-900';
        }
    };

    const riskClass = riskLevel ? getRiskColor(riskLevel) : 'text-slate-100 border-slate-800 bg-slate-900';

    return (
        <div className={clsx("p-6 rounded-xl border flex flex-col justify-between h-32", riskClass)}>
            <div className="flex justify-between items-start">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                {Icon && <Icon className="w-5 h-5 opacity-70" />}
            </div>
            <div>
                <div className="flex items-baseline">
                    <span className="text-3xl font-bold tracking-tight">
                        {value !== undefined && value !== null ? value : 0}
                    </span>
                    {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
                </div>
            </div>
        </div>
    );
};

export default KPICard;
