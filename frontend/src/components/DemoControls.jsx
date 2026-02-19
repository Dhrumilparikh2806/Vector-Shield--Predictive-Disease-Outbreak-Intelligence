import React, { useState } from 'react';
import { Play, Square, Settings, Loader } from 'lucide-react';
import { startDemo, stopDemo } from '../services/api';

const DemoControls = () => {
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            if (isDemoRunning) {
                await stopDemo();
                setIsDemoRunning(false);
            } else {
                await startDemo();
                setIsDemoRunning(true);
            }
        } catch (err) {
            console.error('Demo toggle failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 px-4 rounded-full shadow-2xl">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Hackathon Mode</span>
                <span className={`text-[10px] font-bold ${isDemoRunning ? 'text-green-500' : 'text-slate-400'}`}>
                    {isDemoRunning ? 'SIMULATION ACTIVE' : 'SYSTEM IDLE'}
                </span>
            </div>
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`p-2 rounded-full transition-all ${isDemoRunning
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }`}
            >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : (isDemoRunning ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />)}
            </button>
        </div>
    );
};

export default DemoControls;
