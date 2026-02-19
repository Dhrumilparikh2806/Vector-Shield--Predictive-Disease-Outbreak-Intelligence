import React from 'react';
import { AlertTriangle, MapPin, Calendar, Activity } from 'lucide-react';
import clsx from 'clsx';

const AlertCard = ({ alert }) => {
    const { location, message, severity, timestamp } = alert;

    const isCritical = severity?.toLowerCase() === 'critical';

    const getSeverityStyle = (sev) => {
        switch (sev?.toLowerCase()) {
            case 'critical': return 'border-l-4 border-red-500 bg-red-500/8';
            case 'high': return 'border-l-4 border-orange-500 bg-orange-500/8';
            case 'moderate': return 'border-l-4 border-blue-500 bg-blue-500/8';
            default: return 'border-l-4 border-slate-600 bg-slate-800';
        }
    };

    return (
        <div className={clsx("p-4 rounded-lg mb-3 border border-slate-800/50 transition-all", getSeverityStyle(severity))}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center text-slate-100 font-semibold uppercase tracking-wider text-xs">
                    <AlertTriangle className={clsx("w-4 h-4 mr-2", isCritical ? "text-red-500" : "text-slate-400")} />
                    {location || "National Watch"}
                </div>
                {isCritical && (
                    <span className="flex h-2 w-2 relative">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-200 font-medium mb-3">{message}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center uppercase font-bold"><Activity className="w-3 h-3 mr-1" /> {severity}</span>
                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {timestamp}</span>
            </div>
        </div>
    );
};

export default AlertCard;
