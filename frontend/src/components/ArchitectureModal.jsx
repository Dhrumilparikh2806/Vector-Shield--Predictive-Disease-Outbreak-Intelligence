import React from 'react';
import { X, Cpu, Server, Database, Map as MapIcon, Bell } from 'lucide-react';

const ArchitectureModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-primary" />
                        VectorShield System Architecture
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[70vh]">
                    <div className="flex flex-col items-center gap-12 relative lg:flex-row lg:justify-between lg:gap-4 lg:items-start">
                        <ArchNode icon={Cpu} title="IoT Pods" subtitle="Edge Sensors" color="bg-emerald-500" />
                        <Connector />
                        <ArchNode icon={Server} title="FastAPI" subtitle="Backend API" color="bg-blue-500" />
                        <Connector />
                        <ArchNode icon={Database} title="ML Engine" subtitle="Predictive Models" color="bg-purple-500" />
                        <Connector />
                        <ArchNode icon={MapIcon} title="Risk Maps" subtitle="GIS Layer" color="bg-orange-500" />
                        <Connector />
                        <ArchNode icon={Bell} title="Alerts" subtitle="Response Engine" color="bg-red-500" />
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Data Flow</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Real-time environmental data (Temperature, Humidity, Water Quality) is ingested from distributed IoT pods. The ML Engine applies Random Forest and Clustering algorithms to compute geospatial risk scores.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Response Loop</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                When risk thresholds are exceeded or anomalies detected, the Alert Engine triggers automated responses and updates the Live Risk Map for immediate intervention.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArchNode = ({ icon: Icon, title, subtitle, color }) => (
    <div className="flex flex-col items-center gap-2 z-10">
        <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-${color.split('-')[1]}-500/20`}>
            <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
            <div className="text-sm font-bold text-white uppercase tracking-wider">{title}</div>
            <div className="text-[10px] text-slate-500 font-medium">{subtitle}</div>
        </div>
    </div>
);

const Connector = () => (
    <div className="hidden lg:block w-full h-px bg-slate-800 mt-8 relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-700"></div>
    </div>
);

export default ArchitectureModal;
