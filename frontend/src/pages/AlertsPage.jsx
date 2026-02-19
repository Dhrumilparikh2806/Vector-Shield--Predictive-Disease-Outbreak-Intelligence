import React, { useEffect, useState } from 'react';
import AlertCard from '../components/AlertCard';
import { getLiveAlerts, reloadBackend, simulateTick } from '../services/api';
import { Filter, AlertCircle, ChevronDown } from 'lucide-react';
import SimulationIndicator from '../components/SimulationIndicator';

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const severityMap = { Critical: 4, High: 3, Moderate: 2, Low: 1 };

    const sortAlerts = (alertList) => {
        return alertList.sort((a, b) => {
            const severityA = severityMap[a.severity] || 0;
            const severityB = severityMap[b.severity] || 0;
            if (severityB !== severityA) return severityB - severityA;
            // Within same severity, sort by newest first
            return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        });
    };

    const getFilteredAlerts = (allAlerts) => {
        let filtered = allAlerts;
        if (selectedFilter !== 'All') {
            filtered = allAlerts.filter(a => a.severity === selectedFilter);
        }
        return sortAlerts(filtered);
    };

    const load = async () => {
        try {
            try {
                await simulateTick();
            } catch (simErr) {
                console.error('Simulation tick failed:', simErr);
            }

            const data = await getLiveAlerts();
            setAlerts(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching alerts:', err);
            setError('Backend offline – retrying...');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 10000); // 10s for live updates
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Active Alerts & Notifications</h1>
                    <p className="text-slate-400">Real-time alerts from all monitored zones</p>
                </div>
                <div className="flex items-center gap-3">
                    <SimulationIndicator />
                    <div className="relative">
                        <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-300">
                            <Filter className="w-4 h-4 mr-2" /> {selectedFilter === 'All' ? 'Filter Alerts' : selectedFilter}
                        </button>
                        {filterOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-lg">
                                {['All','Critical','High','Moderate'].map((f) => (
                                    <button key={f} onClick={() => { setSelectedFilter(f); setFilterOpen(false); }} className="w-full text-left px-2 py-1 text-sm hover:bg-slate-800 rounded">{f}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

                {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 animate-pulse mb-6">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-2 text-center py-10 text-slate-500">Loading alerts...</div>
                ) : alerts.length === 0 ? (
                    <div className="col-span-2 text-center py-10 bg-slate-900 rounded-xl border border-slate-800">
                        <p className="text-slate-400">No active alerts at this time.</p>
                    </div>
                ) : (
                    getFilteredAlerts(alerts).map((alert, idx) => (
                        <AlertCard key={idx} alert={alert} />
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertsPage;
