import React, { useState } from 'react';
import { HelpCircle, ChevronRight, X } from 'lucide-react';

const GuidedDemo = ({ onStart }) => {
    const [step, setStep] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const steps = [
        {
            title: "Welcome to VectorShield",
            content: "I'll guide you through the system architecture and live prediction flow.",
            target: "body",
        },
        {
            title: "Executive Dashboard",
            content: "View national risk metrics, 48-hour case forecasts, and active hotspots at a glance.",
            target: "dashboard",
        },
        {
            title: "Live Risk Map",
            content: "Real-time geospatial visualization of city-level risk scores and thermal heatmaps.",
            target: "map",
        },
        {
            title: "AI Alerts",
            content: "Automatic detection of anomalous health patterns and immediate risk notifications.",
            target: "alerts",
        },
    ];

    const start = () => {
        setIsActive(true);
        setStep(1);
        if (onStart) onStart();
    };

    const next = () => {
        if (step < steps.length - 1) setStep(step + 1);
        else setIsActive(false);
    };

    if (!isActive) {
        return (
            <button
                onClick={start}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:opacity-90 transition-all"
            >
                <HelpCircle className="w-4 h-4" /> Start Guided Demo
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-sm">
            <div className="bg-slate-900 border-2 border-primary rounded-2xl shadow-2xl p-6 relative animate-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => setIsActive(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-2 text-primary">
                    <span className="px-2 py-0.5 bg-primary/20 rounded text-[10px] font-bold">STEP {step} / {steps.length - 1}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{steps[step].title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {steps[step].content}
                </p>

                <button
                    onClick={next}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-slate-950 font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                    {step < steps.length - 1 ? "Next Insight" : "Finish Discovery"}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default GuidedDemo;
