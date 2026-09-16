import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Check, X, Loader, Building2, Clock, ShieldCheck, XCircle, Globe2, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminListHospitals, adminApproveHospital, adminRejectHospital, adminGetOverview } from '../services/api';
import logoMark from '../assets/logo-mark.png';

const PROFILE_LABELS = {
    default: 'Shared Pilot Dataset',
    government: 'Government Network',
    meridian: 'Private Chain',
    ramdayal: 'Single Facility',
};

const StatTile = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1A`, color }}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <div className="text-xl font-bold text-[#0F172A] leading-tight">{value}</div>
            <div className="text-xs text-[#8593A6] leading-tight mt-0.5">{label}</div>
        </div>
    </div>
);

const TenantOverviewCard = ({ tenant }) => (
    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <div className="font-semibold text-[#0F172A] truncate">{tenant.hospital_name}</div>
                <div className="text-xs text-[#8593A6] truncate">{tenant.email}</div>
            </div>
            <span className="app-mono text-[10px] font-bold px-2 py-1 rounded-full bg-[#F1F8F5] text-[#159A7E] capitalize shrink-0 whitespace-nowrap">
                {PROFILE_LABELS[tenant.dataset_profile] || tenant.dataset_profile}
            </span>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3 text-center">
            <div>
                <div className="text-sm font-bold text-[#0F172A]">{tenant.citiesMonitored}</div>
                <div className="text-[10px] text-[#8593A6]">Locations</div>
            </div>
            <div>
                <div className="text-sm font-bold text-[#DC2626]">{tenant.criticalZones}</div>
                <div className="text-[10px] text-[#8593A6]">Critical</div>
            </div>
            <div>
                <div className="text-sm font-bold text-[#CA8A04]">{tenant.highZones}</div>
                <div className="text-[10px] text-[#8593A6]">High</div>
            </div>
            <div>
                <div className="text-sm font-bold text-[#159A7E]">{tenant.avgRisk}</div>
                <div className="text-[10px] text-[#8593A6]">Avg Risk</div>
            </div>
        </div>
        <div className="text-[11px] text-[#8593A6] mt-3 pt-3 border-t border-[#F1F5F9] capitalize">
            {tenant.plan} plan · {tenant.hospital_count} facilit{tenant.hospital_count === 1 ? 'y' : 'ies'} · {tenant.totalPredictedCases.toLocaleString()} predicted cases (48h)
        </div>
    </div>
);

const TABS = [
    { key: 'pending', label: 'Pending', icon: Clock, color: '#CA8A04' },
    { key: 'approved', label: 'Approved', icon: ShieldCheck, color: '#16A34A' },
    { key: 'rejected', label: 'Rejected', icon: XCircle, color: '#DC2626' },
];

const PLAN_OPTIONS = ['starter', 'professional', 'enterprise'];

const HospitalRow = ({ hospital, onApprove, onReject, actionable }) => {
    const [plan, setPlan] = useState(hospital.plan || 'professional');
    const [count, setCount] = useState(hospital.hospital_count || 1);
    const [busy, setBusy] = useState(false);

    const runApprove = async () => {
        setBusy(true);
        try {
            await onApprove(hospital.id, { plan, hospital_count: Number(count) });
        } finally {
            setBusy(false);
        }
    };

    const runReject = async () => {
        setBusy(true);
        try {
            await onReject(hospital.id);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#F1F8F5] flex items-center justify-center text-[#159A7E] shrink-0">
                    <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <div className="font-semibold text-[#0F172A] truncate">{hospital.hospital_name}</div>
                    <div className="text-xs text-[#8593A6] truncate">{hospital.email}</div>
                    <div className="text-[11px] text-[#8593A6] mt-1">
                        Requested: <span className="font-medium text-[#475569] capitalize">{hospital.plan}</span> plan · {hospital.hospital_count} hospital{hospital.hospital_count === 1 ? '' : 's'}
                    </div>
                </div>
            </div>

            {actionable ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        className="text-sm border border-[#E2E8F0] rounded px-2 py-1.5 bg-white text-[#0F172A] capitalize"
                    >
                        {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input
                        type="number"
                        min={1}
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                        className="w-20 text-sm border border-[#E2E8F0] rounded px-2 py-1.5 bg-white text-[#0F172A]"
                    />
                    <button
                        onClick={runApprove}
                        disabled={busy}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#159A7E] hover:bg-[#11836A] text-white text-sm font-semibold rounded transition-colors disabled:opacity-60"
                        type="button"
                    >
                        {busy ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve
                    </button>
                    <button
                        onClick={runReject}
                        disabled={busy}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[#DC2626] text-sm font-semibold rounded transition-colors disabled:opacity-60"
                        type="button"
                    >
                        <X className="w-3.5 h-3.5" /> Reject
                    </button>
                </div>
            ) : (
                <span
                    className="app-mono text-[11px] font-bold px-2.5 py-1 rounded-full capitalize shrink-0"
                    style={{
                        backgroundColor: hospital.status === 'approved' ? '#F0FDF4' : '#FEF2F2',
                        color: hospital.status === 'approved' ? '#16A34A' : '#DC2626',
                    }}
                >
                    {hospital.status}
                </span>
            )}
        </div>
    );
};

const AdminDashboardPage = () => {
    const { hospital, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('pending');
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [overview, setOverview] = useState(null);
    const [overviewLoading, setOverviewLoading] = useState(true);

    const load = useCallback(async (status) => {
        setLoading(true);
        try {
            const data = await adminListHospitals(status);
            setHospitals(data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load hospitals:', err);
            setError('Could not load hospital list.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadOverview = useCallback(async () => {
        setOverviewLoading(true);
        try {
            const data = await adminGetOverview();
            setOverview(data);
        } catch (err) {
            console.error('Failed to load admin overview:', err);
        } finally {
            setOverviewLoading(false);
        }
    }, []);

    useEffect(() => {
        load(tab);
    }, [tab, load]);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    const handleApprove = async (id, payload) => {
        await adminApproveHospital(id, payload);
        load(tab);
        loadOverview();
    };

    const handleReject = async (id) => {
        await adminRejectHospital(id);
        load(tab);
        loadOverview();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-shell min-h-screen bg-[#F8FAFB]">
            <header className="bg-white border-b border-[#E2E8F0] shadow-sm">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logoMark} alt="VectorShield" className="w-8 h-8 object-contain" />
                        <div>
                            <div className="text-sm font-bold text-[#0F172A] leading-tight">VectorShield Admin</div>
                            <div className="text-[11px] text-[#8593A6] leading-tight">Signed in as {hospital?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F8F5] rounded transition-colors"
                        type="button"
                    >
                        <LogOut className="w-4 h-4" /> Log out
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-[#0F172A]">Platform Overview</h1>
                    <p className="text-sm text-[#475569] mt-0.5">Every tenant registered on VectorShield, and what their live dashboards are showing right now.</p>
                </div>

                {overviewLoading ? (
                    <div className="text-center py-10 text-[#8593A6] mb-6">Loading overview...</div>
                ) : overview ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <StatTile icon={Building2} label="Approved Tenants" value={overview.approvedCount} color="#159A7E" />
                            <StatTile icon={Clock} label="Pending Review" value={overview.pendingCount} color="#CA8A04" />
                            <StatTile icon={Globe2} label="Facilities Monitored" value={overview.totalFacilitiesMonitored} color="#2563EB" />
                            <StatTile icon={AlertTriangle} label="Rejected" value={overview.rejectedCount} color="#DC2626" />
                        </div>

                        {overview.tenants.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-[#159A7E]" />
                                    <h2 className="text-sm font-bold text-[#0F172A]">Live Tenant Snapshots</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {overview.tenants.map((t) => (
                                        <TenantOverviewCard key={t.id} tenant={t} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : null}

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-[#0F172A]">Hospital Registrations</h2>
                    <p className="text-sm text-[#475569] mt-0.5">Review and approve new hospital signups before they can sign in.</p>
                </div>

                <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-lg p-1 shadow-sm w-fit mb-6">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold transition-all"
                            style={tab === t.key ? { backgroundColor: '#F1F8F5', color: t.color } : { color: '#8593A6' }}
                            type="button"
                        >
                            <t.icon className="w-3.5 h-3.5" /> {t.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] p-3 rounded-lg mb-4 text-sm">{error}</div>
                )}

                {loading ? (
                    <div className="text-center py-16 text-[#8593A6]">Loading...</div>
                ) : hospitals.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-[#E2E8F0]">
                        <p className="text-[#475569]">No {tab} registrations.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {hospitals.map((h) => (
                            <HospitalRow
                                key={h.id}
                                hospital={h}
                                actionable={tab === 'pending'}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboardPage;
