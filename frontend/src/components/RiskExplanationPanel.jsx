import React, { useEffect, useState } from 'react';
import { Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getRiskExplanation } from '../services/api';

const RiskExplanationPanel = ({ location }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [explanation, setExplanation] = useState(null);

    useEffect(() => {
        if (!location) return;
        const fetch = async () => {
            try {
                const data = await getRiskExplanation(location);
                setExplanation(data);
            } catch (err) {
                console.error('Failed to fetch explanation:', err);
            }
        };
        fetch();
    }, [location]);

    if (!location) return null;

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
            >
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    Why is {location} risky?
                </h3>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isOpen && explanation && (
                <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <ExplanationItem label="Hospital Admission Trend" value={explanation.hospitalTrend} unit="%" color="text-red-400" />
                    <ExplanationItem label="Water Contamination Index" value={explanation.waterContamination} unit="/100" color="text-blue-400" />
                    <ExplanationItem label="Environmental Risk Factor" value={explanation.environmentalRisk} unit="/100" color="text-emerald-400" />

                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30 mt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500">ML Confidence</span>
                        <span className="text-sm font-mono font-bold text-primary">{explanation.confidence}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const ExplanationItem = ({ label, value, unit, color }) => (
    <div className="flex justify-between items-end border-b border-slate-700/30 pb-2">
        <span className="text-xs text-slate-400">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value}{unit}</span>
    </div>
);

export default RiskExplanationPanel;
