import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertTriangle, Clock, Search, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveFeed } from '../hooks/useLiveFeed';

const TopHeader = ({ isSidebarOpen, onToggleSidebar }) => {
    const { hospital } = useAuth();
    const navigate = useNavigate();
    const { count, topAlert, latencyMs } = useLiveFeed();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' });

    return (
        <header className="app-shell fixed top-0 left-0 md:left-64 right-0 h-14 bg-white/90 backdrop-blur-md z-40 px-4 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden p-1.5 text-[#475569] hover:text-[#0F172A] rounded hover:bg-[#F1F8F5] transition-colors shrink-0"
                    type="button"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    <Building2 className="w-4 h-4 text-[#8593A6]" />
                    <span className="text-xs font-semibold text-[#0F172A] truncate max-w-[180px]" title={hospital?.hospital_name}>
                        {hospital?.hospital_name || 'Hospital'}
                    </span>
                    <span className="text-[#CBD5E1] text-xs">/</span>
                    <span className="app-mono text-[10px] text-[#8593A6] uppercase">Surveillance Operations</span>
                </div>
                {topAlert && (
                    <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF3E8] rounded text-[#0F172A] min-w-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                        <span className="app-mono text-[10px] text-[#DC2626] font-bold uppercase shrink-0">Flash:</span>
                        <span className="app-mono text-[11px] text-[#475569] truncate max-w-sm">{topAlert.message}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 app-mono text-[11px] text-[#8593A6] px-2 py-1 bg-[#F8FAFB] rounded">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeStr} UTC</span>
                    {latencyMs !== null && <span className="text-[#159A7E] font-semibold">· {latencyMs}ms</span>}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => navigate('/city-explorer')}
                        title="Search cities"
                        className="p-1.5 text-[#475569] hover:text-[#0F172A] rounded hover:bg-[#F1F8F5] transition-colors"
                        type="button"
                    >
                        <Search className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        onClick={() => navigate('/alerts')}
                        title={`${count} active alerts`}
                        className="relative p-1.5 text-[#475569] hover:text-[#0F172A] rounded hover:bg-[#F1F8F5] transition-colors"
                        type="button"
                    >
                        <Bell className="w-[18px] h-[18px]" />
                        {count > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626]" />}
                    </button>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#D7F2F2] flex items-center justify-center text-[#0B5C78] font-semibold text-xs ring-1 ring-[#E2E8F0]">
                    {(hospital?.hospital_name || 'H').charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
