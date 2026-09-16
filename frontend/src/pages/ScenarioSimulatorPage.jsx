import React, { useState } from 'react';
import { Database, Play, FileText, Droplet, Activity, AlertTriangle, TrendingUp, Search, CheckCircle2, Loader } from 'lucide-react';
import KPICard from '../components/KPICard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { uploadScenario } from '../services/api';
import clsx from 'clsx';

const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(0)} KB`;
};

const UploadTile = ({ label, icon: Icon, file, onChange }) => (
    <div className="group relative flex flex-col justify-between p-4 rounded-lg bg-[#F8FAFB] border border-[#E2E8F0] hover:border-[#159A7E]/40 transition-all">
        <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded bg-white border border-[#E2E8F0] flex items-center justify-center text-[#159A7E]">
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <span className="text-sm font-semibold text-[#0F172A] block">{label}</span>
                    {file ? (
                        <span className="app-mono text-xs text-[#159A7E] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {file.name} ({formatBytes(file.size)})
                        </span>
                    ) : (
                        <span className="app-mono text-xs text-[#8593A6]">No file selected</span>
                    )}
                </div>
            </div>
            {file && (
                <span className="app-mono text-[10px] uppercase px-1.5 py-0.5 bg-[#F0FDF4] text-[#16A34A] rounded font-semibold shrink-0">Ready</span>
            )}
        </div>
        <label className="w-full text-center py-2 rounded bg-white border border-[#E2E8F0] text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F8F5] cursor-pointer transition-colors">
            {file ? 'Replace file' : 'Choose CSV file'}
            <input type="file" accept=".csv" className="hidden" onChange={(e) => onChange(e.target.files[0])} />
        </label>
    </div>
);

const ScenarioSimulatorPage = () => {
    const [hospitalFile, setHospitalFile] = useState(null);
    const [waterFile, setWaterFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [results, setResults] = useState({
        predicted_cases: 0,
        riskScore: 0,
        riskLevel: 'Sample',
        anomaly: false,
        analysis: { waterRisk: 'Sample', environmentRisk: 'Sample', trend: 'Sample' },
        chartData: [],
    });

    const handleSimulation = async () => {
        if (!hospitalFile || !waterFile) return;
        setIsLoading(true);
        try {
            const data = await uploadScenario(hospitalFile, waterFile);
            setResults(data);
            setHasRun(true);
        } catch (error) {
            console.error('Simulation failed:', error);
            alert('Simulation failed. Please ensure CSV files are correctly formatted.');
        } finally {
            setIsLoading(false);
        }
    };

    const displayChartData = results.chartData?.length > 0 ? results.chartData : [
        { name: 'T-48h', risk: 20 }, { name: 'T-36h', risk: 25 }, { name: 'T-24h', risk: 40 },
        { name: 'T-12h', risk: 35 }, { name: 'Now', risk: 45 }, { name: 'T+12h', risk: 50 },
        { name: 'T+24h', risk: 65 }, { name: 'T+36h', risk: 75 }, { name: 'T+48h', risk: 80 },
    ];

    return (
        <div className="app-shell p-6 space-y-6 bg-[#F8FAFB] min-h-screen">
            <div>
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="app-mono text-[10px] uppercase tracking-wider text-[#159A7E] font-bold">Predictive Epidemiology</span>
                    <span className="text-[#CBD5E1] text-xs">/</span>
                    <span className="app-mono text-[10px] uppercase tracking-wider text-[#8593A6]">Scenario Engine</span>
                </div>
                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Outbreak Scenario Simulator</h1>
                <p className="text-[#475569] text-sm mt-1">Upload hospital admissions and water quality data to project a 48-hour outbreak scenario.</p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Database className="w-5 h-5 text-[#159A7E]" />
                    <h2 className="text-base font-semibold text-[#0F172A]">Data Ingestion</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <UploadTile label="Hospital Admissions CSV" icon={FileText} file={hospitalFile} onChange={setHospitalFile} />
                    <UploadTile label="Water Quality CSV" icon={Droplet} file={waterFile} onChange={setWaterFile} />
                </div>
                <button
                    onClick={handleSimulation}
                    disabled={!hospitalFile || !waterFile || isLoading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#159A7E] text-white font-semibold rounded hover:bg-[#11836A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    type="button"
                >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isLoading ? 'Processing...' : 'Run Prediction'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Predicted Cases (48h)" value={results.predicted_cases} unit="cases" icon={Activity} />
                <KPICard title="Risk Score" value={results.riskScore} unit="/ 100" icon={AlertTriangle} riskLevel={results.riskLevel} />
                <KPICard title="Risk Level" value={results.riskLevel} icon={Search} riskLevel={results.riskLevel} />
                <KPICard title="Anomaly Detected" value={results.anomaly ? 'Yes' : 'No'} icon={Activity} riskLevel={results.anomaly ? 'CRITICAL' : 'LOW'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-5 h-80">
                    <h2 className="text-base font-semibold text-[#0F172A] mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#159A7E]" /> Projected Risk Trend
                    </h2>
                    <p className="text-xs text-[#8593A6] mb-3">
                        {hasRun ? 'Based on your uploaded data' : 'Illustrative — upload data and run a prediction to see your projection'}
                    </p>
                    <div className="h-[190px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="name" stroke="#8593A6" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#8593A6" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6 }} itemStyle={{ color: '#0F172A' }} />
                                <Line
                                    type="monotone"
                                    dataKey="risk"
                                    stroke={results.riskScore > 70 ? '#DC2626' : '#159A7E'}
                                    strokeWidth={2}
                                    dot={{ fill: results.riskScore > 70 ? '#DC2626' : '#159A7E', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-5">
                    <h2 className="text-base font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-[#0B5C78]" /> Simulation Analysis
                    </h2>
                    <div className="space-y-4">
                        <div className="border-b border-[#F1F5F9] pb-3">
                            <p className="app-mono text-[10px] font-bold text-[#8593A6] uppercase tracking-widest mb-1">Water Risk</p>
                            <p className="text-[#0F172A] font-medium">{results.analysis?.waterRisk}</p>
                        </div>
                        <div className="border-b border-[#F1F5F9] pb-3">
                            <p className="app-mono text-[10px] font-bold text-[#8593A6] uppercase tracking-widest mb-1">Environmental Risk</p>
                            <p className="text-[#0F172A] font-medium">{results.analysis?.environmentRisk}</p>
                        </div>
                        <div>
                            <p className="app-mono text-[10px] font-bold text-[#8593A6] uppercase tracking-widest mb-1">Trend Analysis</p>
                            <p className={clsx('font-bold', {
                                'text-[#16A34A]': results.analysis?.trend === 'Falling',
                                'text-[#DC2626]': results.analysis?.trend === 'Rising',
                                'text-[#475569]': results.analysis?.trend === 'Stable' || results.analysis?.trend === 'Sample',
                            })}>{results.analysis?.trend}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioSimulatorPage;
