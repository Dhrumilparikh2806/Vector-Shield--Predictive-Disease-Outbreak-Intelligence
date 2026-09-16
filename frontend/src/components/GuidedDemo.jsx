import React, { useState } from 'react';
import { HelpCircle, ChevronRight, X } from 'lucide-react';

const STEPS = [
    { title: 'Welcome to VectorShield', content: "This is your hospital's outbreak surveillance workstation — every number here is live." },
    { title: 'Dashboard', content: 'National risk index, 48-hour case forecasts, and active hotspots at a glance.' },
    { title: 'Live Risk Map', content: 'Click any city marker for a live risk breakdown of that zone.' },
    { title: 'Alerts', content: 'Automatic alerts fire when a zone crosses a risk threshold — acknowledge them as you triage.' },
];

const GuidedDemo = () => {
    const [step, setStep] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const start = () => {
        setIsActive(true);
        setStep(0);
    };

    const next = () => {
        if (step < STEPS.length - 1) setStep(step + 1);
        else setIsActive(false);
    };

    if (!isActive) {
        return (
            <button
                onClick={start}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F8F5] hover:bg-[#D7F2F2] text-[#0B5C78] rounded font-medium text-sm transition-colors shadow-sm"
                type="button"
            >
                <HelpCircle className="w-4 h-4" /> Guided Tour
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] w-[calc(100%-2rem)] max-w-sm">
            <div className="bg-white border-2 border-[#159A7E] rounded-xl shadow-2xl p-5 relative">
                <button onClick={() => setIsActive(false)} className="absolute top-3 right-3 text-[#8593A6] hover:text-[#0F172A]" type="button">
                    <X className="w-4 h-4" />
                </button>
                <span className="app-mono text-[10px] font-bold px-2 py-0.5 bg-[#D7F2F2] text-[#0B5C78] rounded">
                    STEP {step + 1} / {STEPS.length}
                </span>
                <h3 className="text-base font-bold text-[#0F172A] mt-2 mb-1.5">{STEPS[step].title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed mb-4">{STEPS[step].content}</p>
                <button
                    onClick={next}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#159A7E] hover:bg-[#11836A] text-white font-semibold rounded text-sm transition-colors"
                    type="button"
                >
                    {step < STEPS.length - 1 ? 'Next' : 'Finish'}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default GuidedDemo;
