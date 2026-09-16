import React from 'react';
import { X, Cpu, Server, Database, Map as MapIcon, Bell } from 'lucide-react';

const NODES = [
    { icon: Cpu, title: 'IoT Pods', subtitle: 'Edge Sensors', color: '#16A34A' },
    { icon: Server, title: 'FastAPI', subtitle: 'Backend API', color: '#0B5C78' },
    { icon: Database, title: 'ML Engine', subtitle: 'Predictive Models', color: '#159A7E' },
    { icon: MapIcon, title: 'Risk Maps', subtitle: 'GIS Layer', color: '#EA580C' },
    { icon: Bell, title: 'Alerts', subtitle: 'Response Engine', color: '#DC2626' },
];

const ArchitectureModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-white border border-[#E2E8F0] rounded-xl shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-[#159A7E]" />
                        VectorShield System Architecture
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#F1F8F5] rounded-full transition-colors" type="button">
                        <X className="w-5 h-5 text-[#475569]" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[70vh]">
                    <div className="flex flex-col items-center gap-10 relative lg:flex-row lg:justify-between lg:gap-4 lg:items-start">
                        {NODES.map((node, i) => (
                            <React.Fragment key={node.title}>
                                <div className="flex flex-col items-center gap-2 z-10">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: node.color }}>
                                        <node.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-[#0F172A]">{node.title}</div>
                                        <div className="app-mono text-[10px] text-[#8593A6]">{node.subtitle}</div>
                                    </div>
                                </div>
                                {i < NODES.length - 1 && (
                                    <div className="hidden lg:block w-full h-px bg-[#E2E8F0] mt-7 relative">
                                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0]">
                            <h4 className="text-sm font-bold text-[#0F172A] mb-1.5">Data Flow</h4>
                            <p className="text-xs text-[#475569] leading-relaxed">
                                Environmental readings (temperature, humidity, water quality) come in from IoT pods and
                                hospital admissions data. The ML engine applies Random Forest and Isolation Forest models
                                to compute geospatial risk scores.
                            </p>
                        </div>
                        <div className="p-4 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0]">
                            <h4 className="text-sm font-bold text-[#0F172A] mb-1.5">Response Loop</h4>
                            <p className="text-xs text-[#475569] leading-relaxed">
                                When a zone's risk score crosses a threshold, the alert engine surfaces it on the live
                                feed and updates the risk map — your team triages from there.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchitectureModal;
