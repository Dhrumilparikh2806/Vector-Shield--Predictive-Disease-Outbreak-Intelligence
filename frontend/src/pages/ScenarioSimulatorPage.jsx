import React, { useState } from 'react';
import { Upload, Play, FileText, Activity, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import KPICard from '../components/KPICard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { uploadScenario } from '../services/api';
import clsx from 'clsx';

const ScenarioSimulatorPage = () => {
    const [hospitalFile, setHospitalFile] = useState(null);
    const [waterFile, setWaterFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState({
        predicted_cases: 0,
        riskScore: 0,
        riskLevel: 'Sample',
        anomaly: false,
        analysis: {
            waterRisk: 'Sample',
            environmentRisk: 'Sample',
            trend: 'Sample'
        },
        chartData: []
    });

    const handleSimulation = async () => {
        if (!hospitalFile || !waterFile) return;

        setIsLoading(true);
        try {
            const data = await uploadScenario(hospitalFile, waterFile);
            setResults(data);
        } catch (error) {
            console.error('Simulation failed:', error);
            alert('Simulation failed. Please ensure CSV files are correctly formatted.');
        } finally {
            setIsLoading(false);
        }
    };

    const displayChartData = results.chartData.length > 0 ? results.chartData : [
        { name: 'T-48h', risk: 20 },
        { name: 'T-36h', risk: 25 },
        { name: 'T-24h', risk: 40 },
        { name: 'T-12h', risk: 35 },
        { name: 'Now', risk: 45 },
        { name: 'T+12h', risk: 50 },
        { name: 'T+24h', risk: 65 },
        { name: 'T+36h', risk: 75 },
        { name: 'T+48h', risk: 80 },
    ];

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-screen font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Scenario Simulator</h1>
                <p className="text-slate-400 text-sm">Upload environmental and clinical datasets to simulate epidemiological outcomes.</p>
            </div>

            {/* Section A: Upload */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-slate-400" /> Data Ingestion
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hospital Admissions CSV</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-lg cursor-pointer bg-slate-950 hover:bg-slate-900 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileText className="w-8 h-8 text-slate-500 mb-2" />
                                    <p className="text-sm text-slate-500">{hospitalFile ? hospitalFile.name : 'Select clinical data file'}</p>
                                </div>
                                <input type="file" className="hidden" onChange={(e) => setHospitalFile(e.target.files[0])} />
                            </label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Water Quality CSV</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-lg cursor-pointer bg-slate-950 hover:bg-slate-900 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Droplets className="w-8 h-8 text-slate-500 mb-2" />
                                    <p className="text-sm text-slate-500">{waterFile ? waterFile.name : 'Select environmental data file'}</p>
                                </div>
                                <input type="file" className="hidden" onChange={(e) => setWaterFile(e.target.files[0])} />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSimulation}
                        disabled={!hospitalFile || !waterFile || isLoading}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                    >
                        <Play className="w-4 h-4" /> {isLoading ? 'Processing...' : 'Run Prediction'}
                    </button>
                </div>
            </div>

            {/* Section B: Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Predicted Cases (48h)" value={results.predicted_cases} unit="cases" icon={Activity} />
                <KPICard title="Risk Score" value={results.riskScore} unit="/ 100" icon={AlertTriangle} riskLevel={results.riskLevel} />
                <KPICard title="Risk Level" value={results.riskLevel} icon={Search} riskLevel={results.riskLevel} />
                <KPICard title="Anomaly Detected" value={results.anomaly ? "Yes" : "No"} icon={Activity} riskLevel={results.anomaly ? "Critical" : "Low"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Section C: Mini Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-80">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-400" /> Projected Risk Trend
                    </h2>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#94a3b8' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="risk"
                                    stroke={results.riskScore > 70 ? "#ef4444" : "#3b82f6"}
                                    strokeWidth={2}
                                    dot={{ fill: results.riskScore > 70 ? "#ef4444" : "#3b82f6", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Section D: Analysis Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Search className="w-5 h-5 text-slate-400" /> Simulation Analysis
                    </h2>
                    <div className="space-y-6">
                        <div className="border-b border-slate-800 pb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Water Risk</p>
                            <p className="text-white font-medium">{results.analysis.waterRisk}</p>
                        </div>
                        <div className="border-b border-slate-800 pb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Environmental Risk</p>
                            <p className="text-white font-medium">{results.analysis.environmentRisk}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Trend Analysis</p>
                            <p className={clsx("font-bold", {
                                "text-emerald-400": results.analysis.trend === "Falling",
                                "text-rose-400": results.analysis.trend === "Rising",
                                "text-slate-300": results.analysis.trend === "Stable"
                            })}>{results.analysis.trend}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal icon component for flexibility
const Droplets = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4Z" />
        <path d="M17 14c1.1 0 2-.9 2-2 0-1.7-2-4-2-4s-2 2.3-2 4c0 1.1.9 2 2 2Z" />
    </svg>
);

export default ScenarioSimulatorPage;
