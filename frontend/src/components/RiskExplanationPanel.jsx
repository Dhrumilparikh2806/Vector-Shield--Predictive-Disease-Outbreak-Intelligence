import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getRiskExplanation } from '../services/api';

const RiskExplanationPanel = ({ location, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
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
        <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#F8FAFB] transition-colors"
                type="button"
            >
                <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#159A7E]" />
                    Why is {location} risky?
                </h3>
                {isOpen ? <ChevronUp className="w-4 h-4 text-[#8593A6]" /> : <ChevronDown className="w-4 h-4 text-[#8593A6]" />}
            </button>

            {isOpen && explanation && (
                <div className="p-4 pt-0 space-y-3">
                    <ExplanationItem label="Hospital Admission Trend" value={explanation.hospitalTrend} unit="%" color="#DC2626" />
                    <ExplanationItem label="Water Contamination Index" value={explanation.waterContamination} unit="/100" color="#0B5C78" />
                    <ExplanationItem label="Environmental Risk Factor" value={explanation.environmentalRisk} unit="/100" color="#16A34A" />

                    <div className="flex items-center justify-between p-2.5 bg-[#F1F8F5] rounded border border-[#E2E8F0] mt-1">
                        <span className="app-mono text-[10px] uppercase font-bold text-[#8593A6]">ML Confidence</span>
                        <span className="app-mono text-sm font-bold text-[#159A7E]">{explanation.confidence}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const ExplanationItem = ({ label, value, unit, color }) => (
    <div className="flex justify-between items-end border-b border-[#F1F5F9] pb-2">
        <span className="text-xs text-[#475569]">{label}</span>
        <span className="app-mono text-sm font-bold" style={{ color }}>{value}{unit}</span>
    </div>
);

export default RiskExplanationPanel;
