import React from 'react';
import { Wind, Thermometer } from 'lucide-react';

const EnvironmentalPanel = ({ data }) => {
    const { temperature, humidity, rainfall, soil_moisture } = data || { temperature: 0, humidity: 0, rainfall: 0, soil_moisture: 0 };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center">
                <Wind className="w-5 h-5 mr-2 text-primary" /> Live Environmental Data
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400 text-xs uppercase">Avg Temp</div>
                    <div className="text-xl font-bold text-white flex items-center">
                        {temperature}°C <Thermometer className="w-4 h-4 ml-1 text-slate-500" />
                    </div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400 text-xs uppercase">Humidity</div>
                    <div className="text-xl font-bold text-white">{humidity}%</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400 text-xs uppercase">Rainfall</div>
                    <div className="text-xl font-bold text-white">{rainfall}mm</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400 text-xs uppercase">Soil Moisture</div>
                    <div className="text-xl font-bold text-white">{soil_moisture}%</div>
                </div>
            </div>
        </div>
    );
};

export default EnvironmentalPanel;
