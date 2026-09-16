import React, { useState } from 'react';
import { Activity, Wind, Bell, TrendingUp, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import AlertCard from './AlertCard';
import EnvironmentalPanel from './EnvironmentalPanel';
import CorrelationPanel from './CorrelationPanel';

const DashboardRightPanel = ({ summary, alerts, podData }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'sensors', label: 'Live Pods', icon: Wind },
        { id: 'alerts', label: `Alerts (${alerts?.length || 0})`, icon: Bell },
    ];

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-lg flex flex-col h-[600px] lg:h-full overflow-hidden shadow-sm">
            <div className="flex items-center gap-1 p-1.5 bg-[#F8FAFB] border-b border-[#E2E8F0]">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded app-mono text-[10px] uppercase tracking-wider font-bold transition-all',
                            activeTab === tab.id ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#8593A6] hover:text-[#475569]'
                        )}
                        type="button"
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-white">
                {activeTab === 'overview' && (
                    <div className="space-y-3">
                        <span className="app-mono text-[10px] font-bold text-[#8593A6] uppercase tracking-widest block mb-1">Surveillance Indices</span>

                        <div className="p-3.5 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0]">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className="text-[#475569] text-xs font-medium">Average Risk Score</span>
                                <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
                            </div>
                            <div className="app-mono text-2xl font-bold text-[#0F172A]">{summary?.avgRisk || 0}</div>
                            <div className="app-mono text-[10px] text-[#8593A6] mt-0.5 uppercase font-semibold">Composite National Index</div>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0]">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className="text-[#475569] text-xs font-medium">Predicted Cases</span>
                                <Activity className="w-4 h-4 text-[#0B5C78]" />
                            </div>
                            <div className="app-mono text-2xl font-bold text-[#0F172A]">{summary?.totalPredictedCases || 0}</div>
                            <div className="app-mono text-[10px] text-[#8593A6] mt-0.5 uppercase font-semibold">Next 48H Forecasting Window</div>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0]">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className="text-[#475569] text-xs font-medium">Critical Hotspots</span>
                                <TrendingUp className="w-4 h-4 text-[#DC2626]" />
                            </div>
                            <div className="app-mono text-2xl font-bold text-[#0F172A]">{summary?.criticalZones || 0}</div>
                            <div className="app-mono text-[10px] text-[#8593A6] mt-0.5 uppercase font-semibold">Immediate Response Required</div>
                        </div>

                        <CorrelationPanel />
                    </div>
                )}

                {activeTab === 'sensors' && (
                    <div>
                        <EnvironmentalPanel data={podData} />
                        <div className="mt-3 p-3.5 bg-[#F1F8F5] border border-[#E2E8F0] rounded-lg text-[11px] text-[#475569] leading-relaxed">
                            <div className="font-bold mb-1.5 flex items-center text-[#0B5C78] uppercase tracking-widest app-mono text-[10px]">
                                <Wind className="w-3 h-3 mr-1.5" /> IoT Pod Status
                            </div>
                            All distributed sensor nodes are currently synchronized. Last sync:{' '}
                            <span className="text-[#159A7E] font-bold">{podData?.status === 'live' ? new Date().toLocaleTimeString() : 'Waiting...'}</span>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-3">
                        <span className="app-mono text-[10px] font-bold text-[#8593A6] uppercase tracking-widest block mb-1">Incident Feed</span>
                        {alerts && alerts.length > 0 ? (
                            alerts.map((alert, idx) => <AlertCard key={idx} alert={alert} />)
                        ) : (
                            <div className="text-center py-14 text-[#CBD5E1] border border-dashed border-[#E2E8F0] rounded-lg">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <span className="app-mono text-[11px] uppercase tracking-widest font-bold text-[#8593A6]">No critical incidents</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardRightPanel;
