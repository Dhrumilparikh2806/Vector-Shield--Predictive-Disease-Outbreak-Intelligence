import React from 'react';

const SimulationIndicator = () => {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur border border-emerald-500/30 rounded-full shadow-lg">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Simulation Active</span>
        </div>
    );
};

export default SimulationIndicator;
