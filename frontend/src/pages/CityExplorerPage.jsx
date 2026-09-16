import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, ArrowRight, AlertTriangle } from 'lucide-react';
import { getMapZones, simulateTick } from '../services/api';

const severityFor = (score) => {
    if (score >= 70) return { label: 'Critical', color: '#DC2626', bg: '#FEF2F2' };
    if (score >= 45) return { label: 'High', color: '#EA580C', bg: '#FFF7ED' };
    if (score >= 15) return { label: 'Moderate', color: '#CA8A04', bg: '#FEFCE8' };
    return { label: 'Low', color: '#16A34A', bg: '#F0FDF4' };
};

const CityExplorerPage = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let interval;
        const load = async () => {
            try {
                try { await simulateTick(); } catch (e) { /* non-fatal */ }
                const data = await getMapZones();
                setZones(data || []);
                setError(null);
            } catch (err) {
                console.error('Error loading zones:', err);
                setError('Backend offline – retrying...');
            } finally {
                setLoading(false);
            }
        };
        load();
        interval = setInterval(load, 2500);
        return () => clearInterval(interval);
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        const list = q ? zones.filter((z) => (z.location || '').toLowerCase().includes(q)) : zones;
        return [...list].sort((a, b) => (b.riskScore ?? b.risk ?? 0) - (a.riskScore ?? a.risk ?? 0));
    }, [zones, search]);

    return (
        <div className="app-shell p-6 bg-[#F8FAFB] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#159A7E]" />
                        <h1 className="text-xl font-bold text-[#0F172A]">City Explorer</h1>
                    </div>
                    <p className="text-[#475569] text-sm mt-0.5">Every monitored city — open one for its full risk profile.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-[#8593A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search cities..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#8593A6] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D7F2F2]"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] p-3 rounded-lg flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-[#8593A6]">Loading cities...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-[#E2E8F0]">
                    <p className="text-[#475569]">No cities match "{search}".</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((zone, idx) => {
                        const score = zone.riskScore ?? zone.risk ?? 0;
                        const sev = severityFor(score);
                        return (
                            <Link
                                key={`${zone.location}-${idx}`}
                                to={`/city/${encodeURIComponent(zone.location)}`}
                                className="group bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm hover:shadow-md hover:border-[#159A7E]/40 transition-all flex flex-col justify-between"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="font-semibold text-[#0F172A]">{zone.location}</span>
                                    <span
                                        className="app-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: sev.bg, color: sev.color }}
                                    >
                                        {sev.label.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="app-mono text-2xl font-bold" style={{ color: sev.color }}>{Math.round(score * 10) / 10}</span>
                                        <span className="app-mono text-xs text-[#8593A6]"> / 100</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-[#8593A6] group-hover:text-[#159A7E] group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CityExplorerPage;
