import React, { useEffect, useRef, useState } from 'react';
import { Wind, Thermometer, Droplets, CloudRain, Sprout } from 'lucide-react';

const EnvironmentalPanel = ({ data }) => {
    const { temperature, humidity, rainfall, soil_moisture } = data || {
        temperature: 0, humidity: 0, rainfall: 0, soil_moisture: 0
    };

    const [lastUpdated, setLastUpdated] = useState(null);
    const prevData = useRef(null);

    useEffect(() => {
        if (data && data.status === 'live') {
            const changed =
                !prevData.current ||
                prevData.current.temperature !== data.temperature ||
                prevData.current.humidity !== data.humidity;
            if (changed) {
                setLastUpdated(new Date().toLocaleTimeString());
                prevData.current = { ...data };
            }
        }
    }, [data]);

    const tiles = [
        { label: 'Avg Temp', value: temperature, unit: '°C', icon: Thermometer, color: '#f97316' },
        { label: 'Humidity', value: humidity, unit: '%', icon: Droplets, color: '#3b82f6' },
        { label: 'Rainfall', value: rainfall, unit: 'mm', icon: CloudRain, color: '#06b6d4' },
        { label: 'Moisture', value: soil_moisture, unit: '%', icon: Sprout, color: '#22c55e' },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-primary" />
                    Live Environmental Data
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                </span>
            </h3>

            {lastUpdated && (
                <p className="text-[10px] text-slate-500 mb-3 font-mono">
                    Last updated: <span className="text-green-500">{lastUpdated}</span>
                </p>
            )}

            <div className="grid grid-cols-2 gap-3">
                {tiles.map(({ label, value, unit, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all"
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="w-3 h-3" style={{ color }} />
                            <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">{label}</div>
                        </div>
                        <div className="text-xl font-bold font-mono text-white">
                            {value}{unit}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EnvironmentalPanel;
