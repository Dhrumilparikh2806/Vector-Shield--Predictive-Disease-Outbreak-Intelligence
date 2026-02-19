import React, { useState } from 'react';
import { Activity, Wind, Bell, Droplets, TrendingUp, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import AlertCard from './AlertCard';
import EnvironmentalPanel from './EnvironmentalPanel';
import CorrelationPanel from './CorrelationPanel';

const DashboardRightPanel = ({ summary, alerts, podData }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'sensors', label: 'Live Pods', icon: Wind },
        { id: 'alerts', label: 'Alerts', icon: Bell },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[600px] lg:h-full overflow-hidden shadow-2xl">
            {/* Tab Header */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 backdrop-blur">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 flex items-center justify-center py-3 text-[10px] uppercase tracking-widest font-bold transition-all",
                            activeTab === tab.id
                                ? "bg-slate-800 text-primary border-b-2 border-primary"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-950/20">

                {activeTab === 'overview' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Surveillance Indices</h3>

                        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 group hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-400 text-xs font-medium">Average Risk Score</span>
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tighter">{summary?.avgRisk || 0}</div>
                            <div className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">Composite National Index</div>
                        </div>

                        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 group hover:border-blue-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-400 text-xs font-medium">Predicted Cases</span>
                                <Droplets className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tighter">{summary?.totalPredictedCases || 0}</div>
                            <div className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">Next 48H Forecasting Window</div>
                        </div>

                        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 group hover:border-red-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-400 text-xs font-medium">Critical Hotspots</span>
                                <TrendingUp className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tighter">{summary?.criticalZones || 0}</div>
                            <div className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">Immediate Response Required</div>
                        </div>

                        <CorrelationPanel />
                    </div>
                )}

                {activeTab === 'sensors' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                        <EnvironmentalPanel data={podData} />
                        <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl text-[11px] text-slate-400 leading-relaxed shadow-inner">
                            <div className="font-bold mb-2 flex items-center text-primary uppercase tracking-widest"><Wind className="w-3 h-3 mr-2" /> IoT Pod Status</div>
                            All distributed sensor nodes are currently synchronized. Atmospheric and aquatic telemetry stream active.{' '}
                            Last sync: <span className="text-green-400 font-bold">{podData?.status === 'live' ? new Date().toLocaleTimeString() : 'Waiting...'}</span>
                        </div>
                    </div>
                )}


                {activeTab === 'alerts' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Incident Feed</h3>
                        {alerts && alerts.length > 0 ? (
                            alerts.map((alert, idx) => (
                                <AlertCard key={idx} alert={alert} />
                            ))
                        ) : (
                            <div className="text-center py-16 text-slate-600 border border-slate-800 border-dashed rounded-xl">
                                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                <span className="text-xs uppercase tracking-widest font-bold opacity-40">No critical incidents</span>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default DashboardRightPanel;
