import React, { useState } from 'react';
import { AlertTriangle, Clock, Check, MapPinned } from 'lucide-react';
import { Link } from 'react-router-dom';

const SEVERITY = {
    Critical: { band: '#DC2626', text: '#DC2626', bg: '#FEF2F2', label: 'CRITICAL' },
    High: { band: '#EA580C', text: '#EA580C', bg: '#FFF7ED', label: 'HIGH' },
    Moderate: { band: '#CA8A04', text: '#CA8A04', bg: '#FEFCE8', label: 'MODERATE' },
    Low: { band: '#16A34A', text: '#16A34A', bg: '#F0FDF4', label: 'LOW' },
};

const AlertCard = ({ alert }) => {
    const { location, message, severity, timestamp } = alert;
    const [acknowledged, setAcknowledged] = useState(false);
    const style = SEVERITY[severity] || { band: '#8593A6', text: '#475569', bg: '#F8FAFB', label: severity?.toUpperCase() || 'INFO' };
    const isCritical = severity === 'Critical';

    return (
        <article className={`flex flex-col bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden transition-opacity ${acknowledged ? 'opacity-60' : ''}`}>
            <div className="h-1.5 w-full" style={{ backgroundColor: style.band }} />
            <div className="p-4 flex flex-col gap-2" style={{ background: `linear-gradient(to bottom, ${style.bg}, transparent)` }}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0F172A]">
                        <AlertTriangle className="w-4 h-4" style={{ color: style.text }} />
                        {location || 'National Watch'}
                        {isCritical && !acknowledged && <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />}
                    </div>
                    <span
                        className="app-mono text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.band}55` }}
                    >
                        {style.label}
                    </span>
                </div>
                <p className="text-sm text-[#0F172A]">{message}</p>
                <div className="flex items-center gap-1.5 app-mono text-[11px] text-[#8593A6]">
                    <Clock className="w-3 h-3" />
                    <span>{timestamp}</span>
                </div>
            </div>
            <div className="px-4 py-2.5 bg-[#F8FAFB] flex items-center justify-between gap-2 border-t border-[#F1F5F9]">
                <button
                    onClick={() => setAcknowledged(true)}
                    disabled={acknowledged}
                    className="flex items-center gap-1.5 app-mono text-[11px] font-semibold px-2.5 py-1 rounded transition-colors disabled:cursor-default"
                    style={acknowledged
                        ? { backgroundColor: '#F1F5F9', color: '#8593A6' }
                        : { backgroundColor: style.band, color: '#fff' }}
                    type="button"
                >
                    {acknowledged ? <><Check className="w-3 h-3" /> Acknowledged</> : 'Acknowledge'}
                </button>
                {location && (
                    <Link
                        to={`/city/${encodeURIComponent(location)}`}
                        className="flex items-center gap-1 app-mono text-[11px] font-semibold text-[#159A7E] hover:text-[#0B5C78] transition-colors"
                    >
                        <MapPinned className="w-3 h-3" /> City Profile
                    </Link>
                )}
            </div>
        </article>
    );
};

export default AlertCard;
