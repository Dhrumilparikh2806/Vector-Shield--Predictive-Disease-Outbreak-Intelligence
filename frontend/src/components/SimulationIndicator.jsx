import React from 'react';

const SimulationIndicator = () => {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F1F8F5] border border-[#E2E8F0] rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#159A7E] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#159A7E]" />
            </span>
            <span className="app-mono text-[10px] font-bold text-[#0C6952] uppercase tracking-widest">Simulation Active · 2.5s Poll</span>
        </div>
    );
};

export default SimulationIndicator;
