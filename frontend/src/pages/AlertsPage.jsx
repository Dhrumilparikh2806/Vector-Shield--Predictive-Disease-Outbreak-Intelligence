import React, { useEffect, useMemo, useRef, useState } from 'react';
import AlertCard from '../components/AlertCard';
import { getLiveAlerts, simulateTick } from '../services/api';
import { Search, AlertTriangle, Volume2, VolumeX, CheckCheck, ShieldCheck } from 'lucide-react';
import SimulationIndicator from '../components/SimulationIndicator';

const SEVERITY_META = {
    Critical: { color: '#DC2626', bg: '#FEF2F2', tier: 'Tier 1' },
    High: { color: '#EA580C', bg: '#FFF7ED', tier: 'Tier 2' },
    Moderate: { color: '#CA8A04', bg: '#FEFCE8', tier: 'Tier 3' },
    Low: { color: '#16A34A', bg: '#F0FDF4', tier: 'Tier 4' },
};

const severityWeight = { Critical: 4, High: 3, Moderate: 2, Low: 1 };

const playBeep = () => {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* audio not available */ }
};

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [severity, setSeverity] = useState('ALL');
    const [sortMode, setSortMode] = useState('SEVERITY');
    const [audioOn, setAudioOn] = useState(true);
    const knownIds = useRef(new Set());
    const firstLoad = useRef(true);

    const load = async () => {
        try {
            try {
                await simulateTick();
            } catch (simErr) {
                console.error('Simulation tick failed:', simErr);
            }

            const data = await getLiveAlerts();
            const list = data || [];

            if (audioOn && !firstLoad.current) {
                const hasNewCritical = list.some((a, i) => a.severity === 'Critical' && !knownIds.current.has(`${a.location}-${a.timestamp}-${i}`));
                if (hasNewCritical) playBeep();
            }
            knownIds.current = new Set(list.map((a, i) => `${a.location}-${a.timestamp}-${i}`));
            firstLoad.current = false;

            setAlerts(list);
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
        const interval = setInterval(load, 2500);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioOn]);

    const tierCounts = useMemo(() => {
        const counts = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
        alerts.forEach((a) => { if (counts[a.severity] !== undefined) counts[a.severity]++; });
        return counts;
    }, [alerts]);

    const filtered = useMemo(() => {
        let list = alerts;
        if (severity !== 'ALL') list = list.filter((a) => a.severity === severity);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((a) => (a.location || '').toLowerCase().includes(q) || (a.message || '').toLowerCase().includes(q));
        }
        list = [...list].sort((a, b) => {
            if (sortMode === 'SEVERITY') return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
            return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        });
        return list;
    }, [alerts, severity, search, sortMode]);

    return (
        <div className="app-shell p-6 bg-[#F8FAFB] min-h-screen">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-[#159A7E]" />
                            <h1 className="text-xl font-bold text-[#0F172A]">Active Alerts &amp; Incident Feed</h1>
                        </div>
                        <p className="text-[#475569] text-sm max-w-2xl mt-0.5">Real-time alerts synthesized from hospital admissions, water quality, and IoT sensor pods.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <SimulationIndicator />
                        <button
                            onClick={() => setAudioOn((v) => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E2E8F0] text-[#0F172A] text-sm font-medium shadow-sm hover:bg-[#F1F8F5] transition-colors"
                            type="button"
                        >
                            {audioOn ? <Volume2 className="w-4 h-4 text-[#159A7E]" /> : <VolumeX className="w-4 h-4 text-[#8593A6]" />}
                            <span className="app-mono text-xs">{audioOn ? 'AUDIO ON' : 'MUTED'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                    <div className="md:col-span-6 relative flex items-center">
                        <Search className="w-4 h-4 text-[#8593A6] absolute left-3 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by city or message..."
                            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFB] rounded text-sm text-[#0F172A] placeholder:text-[#8593A6] focus:outline-none focus:ring-2 focus:ring-[#D7F2F2]"
                        />
                    </div>
                    <div className="md:col-span-3 flex items-center gap-2">
                        <span className="app-mono text-[10px] text-[#8593A6] uppercase shrink-0">Severity</span>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="w-full py-1.5 px-2 bg-[#F8FAFB] text-[#0F172A] text-sm rounded focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">All ({alerts.length})</option>
                            <option value="Critical">Critical ({tierCounts.Critical})</option>
                            <option value="High">High ({tierCounts.High})</option>
                            <option value="Moderate">Moderate ({tierCounts.Moderate})</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 flex items-center gap-2">
                        <span className="app-mono text-[10px] text-[#8593A6] uppercase shrink-0">Sort</span>
                        <select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value)}
                            className="w-full py-1.5 px-2 bg-[#F8FAFB] text-[#0F172A] text-sm rounded focus:outline-none cursor-pointer"
                        >
                            <option value="SEVERITY">Severity first</option>
                            <option value="NEWEST">Newest first</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(SEVERITY_META).map(([label, meta]) => (
                        <div key={label} className="p-3.5 rounded-lg shadow-sm flex flex-col justify-between" style={{ backgroundColor: meta.bg }}>
                            <div className="flex items-center justify-between">
                                <span className="app-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>{label}</span>
                                <span className="app-mono text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: meta.color }}>{meta.tier}</span>
                            </div>
                            <span className="app-mono text-2xl font-bold mt-1" style={{ color: meta.color }}>{tierCounts[label]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] p-3 rounded-lg flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-2 text-center py-10 text-[#8593A6]">Loading alerts...</div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                        <ShieldCheck className="w-10 h-10 text-[#CBD5E1] mb-3" />
                        <p className="text-[#0F172A] font-semibold mb-1">No alerts matching your filters</p>
                        <p className="text-[#8593A6] text-sm">Try clearing the search or severity filter.</p>
                    </div>
                ) : (
                    filtered.map((alert, idx) => <AlertCard key={idx} alert={alert} />)
                )}
            </div>

            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-[#E2E8F0] app-mono text-xs text-[#8593A6]">
                    <CheckCheck className="w-3.5 h-3.5" />
                    Showing {filtered.length} of {alerts.length} alerts
                </div>
            )}
        </div>
    );
};

export default AlertsPage;
