import React, { useEffect, useMemo, useState } from 'react';
import {
    Package, AlertTriangle, Search, Download, Loader, ArrowLeftRight,
    Building2, Info, ShieldCheck,
} from 'lucide-react';
import { getInventoryStatus, getInventorySummary, getInventoryRebalance } from '../services/api';

const URGENCY_META = {
    critical: { label: 'Critical', color: '#DC2626', bg: '#FEF2F2' },
    warning: { label: 'Warning', color: '#CA8A04', bg: '#FFFBEB' },
    ok: { label: 'Healthy', color: '#16A34A', bg: '#F0FDF4' },
};

const StatTile = ({ icon: Icon, label, value, color }) => (
    <div className="p-3.5 rounded-lg shadow-sm flex items-center gap-3 bg-white border border-[#E2E8F0]">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1A`, color }}>
            <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
            <div className="app-mono text-lg font-bold text-[#0F172A] leading-tight">{value}</div>
            <div className="text-[11px] text-[#8593A6] leading-tight mt-0.5">{label}</div>
        </div>
    </div>
);

const UrgencyBadge = ({ urgency }) => {
    const meta = URGENCY_META[urgency] || URGENCY_META.ok;
    return (
        <span
            className="app-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
            style={{ backgroundColor: meta.bg, color: meta.color }}
        >
            {meta.label}
        </span>
    );
};

const InventoryIntelligencePage = () => {
    const [status, setStatus] = useState([]);
    const [summary, setSummary] = useState(null);
    const [rebalance, setRebalance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('ALL');
    const [hospitalFilter, setHospitalFilter] = useState('ALL');

    useEffect(() => {
        const load = async () => {
            try {
                const [statusData, summaryData, rebalanceData] = await Promise.all([
                    getInventoryStatus(),
                    getInventorySummary(),
                    getInventoryRebalance(),
                ]);
                setStatus(statusData || []);
                setSummary(summaryData || null);
                setRebalance(rebalanceData || []);
                setError(null);
            } catch (err) {
                console.error('Failed to load inventory intelligence:', err);
                setError('Could not load inventory data.');
            } finally {
                setLoading(false);
            }
        };
        load();
        const interval = setInterval(load, 15000);
        return () => clearInterval(interval);
    }, []);

    const hospitals = useMemo(() => {
        const map = new Map();
        status.forEach((r) => map.set(r.hospital_id, r.hospital_name));
        return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [status]);

    const filtered = useMemo(() => {
        let list = status;
        if (urgencyFilter !== 'ALL') list = list.filter((r) => r.urgency === urgencyFilter);
        if (hospitalFilter !== 'ALL') list = list.filter((r) => r.hospital_id === hospitalFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (r) =>
                    r.hospital_name.toLowerCase().includes(q) ||
                    r.city.toLowerCase().includes(q) ||
                    r.item_name.toLowerCase().includes(q)
            );
        }
        return list;
    }, [status, urgencyFilter, hospitalFilter, search]);

    const handleExport = () => {
        const header = 'Hospital,City,Item,Current Stock,Projected Demand (48h),Days of Cover,Lead Time (days),Recommended Reorder,Urgency\n';
        const rows = filtered.map((r) =>
            [r.hospital_name, r.city, r.item_name, r.current_stock, r.projected_demand_48h, r.days_of_cover, r.lead_time_days, r.recommended_reorder_qty, r.urgency]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(',')
        );
        const csv = header + rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `inventory-reorder-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    return (
        <div className="app-shell p-6 bg-[#F8FAFB] min-h-screen">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-1">
                <div>
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#159A7E]" />
                        <h1 className="text-xl font-bold text-[#0F172A]">Inventory Intelligence</h1>
                    </div>
                    <p className="text-[#475569] text-sm max-w-2xl mt-0.5">
                        Cross-references your 48h outbreak prediction against on-hand stock to project demand and recommend reorders and inter-branch transfers.
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={loading || filtered.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-[#159A7E] hover:bg-[#11836A] text-white rounded font-medium text-sm transition-colors shadow-sm disabled:opacity-60 shrink-0"
                    type="button"
                >
                    <Download className="w-4 h-4" />
                    Export Reorder List (CSV)
                </button>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-[#8593A6] mb-5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Consumption figures are capacity-planning estimates derived from WHO cholera/typhoid treatment guideline ranges, not a clinical protocol.</span>
            </div>

            {error && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] p-3 rounded-lg flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatTile icon={AlertTriangle} label="Critical Items" value={summary?.criticalItems ?? '—'} color="#DC2626" />
                <StatTile icon={AlertTriangle} label="Warning Items" value={summary?.warningItems ?? '—'} color="#CA8A04" />
                <StatTile icon={Building2} label="Facilities At Risk" value={summary?.hospitalsAtRisk ?? '—'} color="#EA580C" />
                <StatTile
                    icon={Package}
                    label="Est. Reorder Spend"
                    value={summary ? `₹${Number(summary.estimatedReorderSpendInr).toLocaleString('en-IN')}` : '—'}
                    color="#159A7E"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 bg-white rounded-lg border border-[#E2E8F0] shadow-sm mb-4">
                        <div className="md:col-span-5 relative flex items-center">
                            <Search className="w-4 h-4 text-[#8593A6] absolute left-3 pointer-events-none" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search hospital, city, or item..."
                                className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFB] rounded text-sm text-[#0F172A] placeholder:text-[#8593A6] focus:outline-none focus:ring-2 focus:ring-[#D7F2F2]"
                            />
                        </div>
                        <div className="md:col-span-4 flex items-center gap-2">
                            <span className="app-mono text-[10px] text-[#8593A6] uppercase shrink-0">Facility</span>
                            <select
                                value={hospitalFilter}
                                onChange={(e) => setHospitalFilter(e.target.value)}
                                className="w-full py-1.5 px-2 bg-[#F8FAFB] text-[#0F172A] text-sm rounded focus:outline-none cursor-pointer truncate"
                            >
                                <option value="ALL">All facilities ({hospitals.length})</option>
                                {hospitals.map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-3 flex items-center gap-2">
                            <span className="app-mono text-[10px] text-[#8593A6] uppercase shrink-0">Status</span>
                            <select
                                value={urgencyFilter}
                                onChange={(e) => setUrgencyFilter(e.target.value)}
                                className="w-full py-1.5 px-2 bg-[#F8FAFB] text-[#0F172A] text-sm rounded focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">All</option>
                                <option value="critical">Critical</option>
                                <option value="warning">Warning</option>
                                <option value="ok">Healthy</option>
                            </select>
                        </div>
                    </div>

                    <p className="text-[11px] text-[#8593A6] mb-2 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>Status compares days of cover against each item's resupply lead time, not just the 48h forecast — stock can exceed 48h demand and still be Critical if it would run out before a reorder placed today arrives.</span>
                    </p>

                    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#F8FAFB] sticky top-0 z-10">
                                    <tr className="text-left app-mono text-[10px] text-[#8593A6] uppercase tracking-wide">
                                        <th className="px-4 py-2.5 font-semibold">Facility / Item</th>
                                        <th className="px-3 py-2.5 font-semibold text-right">Stock</th>
                                        <th className="px-3 py-2.5 font-semibold text-right">Demand (48h)</th>
                                        <th className="px-3 py-2.5 font-semibold text-right">Cover vs. Lead Time</th>
                                        <th className="px-3 py-2.5 font-semibold text-right">Reorder</th>
                                        <th className="px-4 py-2.5 font-semibold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1F5F9]">
                                    {loading ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-[#8593A6]">Loading inventory data...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-[#8593A6]">No items match your filters.</td></tr>
                                    ) : (
                                        filtered.map((r) => (
                                            <tr key={`${r.hospital_id}-${r.item_code}`} className="hover:bg-[#F8FAFB] transition-colors">
                                                <td className="px-4 py-2.5">
                                                    <div className="font-medium text-[#0F172A] truncate max-w-[220px]" title={r.hospital_name}>{r.item_name}</div>
                                                    <div className="text-[11px] text-[#8593A6] truncate max-w-[220px]">{r.hospital_name} · {r.city}</div>
                                                </td>
                                                <td className="px-3 py-2.5 text-right app-mono text-[#0F172A]">{r.current_stock.toLocaleString()}</td>
                                                <td className="px-3 py-2.5 text-right app-mono text-[#475569]">{r.projected_demand_48h.toLocaleString()}</td>
                                                <td className="px-3 py-2.5 text-right app-mono">
                                                    <span style={{ color: URGENCY_META[r.urgency].color }}>{r.days_of_cover}d</span>
                                                    <span className="text-[#8593A6]"> / {r.lead_time_days}d lead</span>
                                                </td>
                                                <td className="px-3 py-2.5 text-right app-mono font-semibold text-[#0F172A]">
                                                    {r.recommended_reorder_qty > 0 ? `+${r.recommended_reorder_qty.toLocaleString()}` : '—'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right"><UrgencyBadge urgency={r.urgency} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {!loading && (
                        <div className="app-mono text-xs text-[#8593A6] mt-3">
                            Showing {filtered.length} of {status.length} tracked line items
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <ArrowLeftRight className="w-4 h-4 text-[#159A7E]" />
                        <h2 className="text-sm font-bold text-[#0F172A]">Network Rebalancing</h2>
                    </div>
                    <p className="text-[11px] text-[#8593A6] mb-3">
                        Before recommending a fresh purchase, the engine checks whether a branch in your own network already has surplus stock to transfer.
                    </p>

                    <div className="flex flex-col gap-2.5 max-h-[620px] overflow-y-auto pr-0.5">
                        {loading ? (
                            <div className="text-center py-10 text-[#8593A6] text-sm bg-white rounded-lg border border-[#E2E8F0]">Loading...</div>
                        ) : rebalance.length === 0 ? (
                            <div className="flex flex-col items-center text-center py-10 px-4 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                                <ShieldCheck className="w-8 h-8 text-[#CBD5E1] mb-2" />
                                <p className="text-[#0F172A] text-sm font-semibold">No transfers needed</p>
                                <p className="text-[#8593A6] text-xs mt-1">
                                    {hospitals.length <= 1
                                        ? 'Single-facility network — reorder directly from your supplier.'
                                        : 'Every branch is either healthy or has no surplus partner right now.'}
                                </p>
                            </div>
                        ) : (
                            rebalance.map((t, idx) => (
                                <div key={idx} className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-[#0F172A] truncate max-w-[160px]">{t.item_name}</span>
                                        <UrgencyBadge urgency={t.to_urgency} />
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px]">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] text-[#8593A6] uppercase app-mono">From</div>
                                            <div className="truncate text-[#0F172A] font-semibold" title={t.from_hospital_name}>{t.from_city}</div>
                                            <div className="truncate text-[10px] text-[#8593A6]" title={t.from_hospital_name}>{t.from_hospital_name}</div>
                                        </div>
                                        <ArrowLeftRight className="w-3.5 h-3.5 text-[#159A7E] shrink-0" />
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="text-[10px] text-[#8593A6] uppercase app-mono">To</div>
                                            <div className="truncate text-[#0F172A] font-semibold" title={t.to_hospital_name}>{t.to_city}</div>
                                            <div className="truncate text-[10px] text-[#8593A6]" title={t.to_hospital_name}>{t.to_hospital_name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F1F5F9] app-mono text-[11px] text-[#475569]">
                                        <span>{t.quantity.toLocaleString()} {t.unit}{t.quantity === 1 ? '' : 's'}</span>
                                        {t.distance_km != null && <span>{t.distance_km.toLocaleString()} km</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryIntelligencePage;
