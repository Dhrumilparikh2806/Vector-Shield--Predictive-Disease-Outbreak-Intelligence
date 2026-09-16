import React, { useEffect, useRef, useState } from 'react';
import { Wind, Thermometer, Droplets, CloudRain, Sprout, RefreshCw } from 'lucide-react';

const EnvironmentalPanel = ({ data }) => {
    const { temperature, humidity, rainfall, soil_moisture } = data || {};
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
        { label: 'Avg Temp', value: temperature, unit: '°C', icon: Thermometer, color: '#EA580C' },
        { label: 'Humidity', value: humidity, unit: '%', icon: Droplets, color: '#0B5C78' },
        { label: 'Rainfall', value: rainfall, unit: 'mm', icon: CloudRain, color: '#159A7E' },
        { label: 'Soil Moisture', value: soil_moisture, unit: '%', icon: Sprout, color: '#16A34A' },
    ];

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] mb-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                    <Wind className="w-4 h-4 text-[#159A7E]" />
                    Live Environmental Data
                </span>
                <span className="flex items-center gap-1.5 app-mono text-[10px] text-[#16A34A] font-bold uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                    </span>
                    Live
                </span>
            </div>

            {lastUpdated && (
                <p className="app-mono text-[10px] text-[#8593A6] mb-2">
                    Last updated: <span className="text-[#16A34A]">{lastUpdated}</span>
                </p>
            )}

            <div className="grid grid-cols-2 gap-2.5">
                {tiles.map(({ label, value, unit, icon: Icon, color }) => {
                    const hasValue = value !== undefined && value !== null;
                    return (
                        <div key={label} className="p-2.5 bg-[#F8FAFB] rounded border border-[#E2E8F0] flex flex-col">
                            <div className="flex items-center justify-between text-[#8593A6]">
                                <span className="app-mono text-[10px] uppercase tracking-wide">{label}</span>
                                <Icon className="w-3.5 h-3.5" style={{ color }} />
                            </div>
                            {hasValue ? (
                                <span className="app-mono text-lg font-semibold text-[#0F172A] mt-1">{value}{unit}</span>
                            ) : (
                                <span className="flex items-center gap-1 app-mono text-[11px] text-[#8593A6] mt-1.5">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Calibrating
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EnvironmentalPanel;
