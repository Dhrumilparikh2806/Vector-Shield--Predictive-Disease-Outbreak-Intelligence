import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
    LayoutDashboard, Map, AlertTriangle, TestTube2, Building2, Package,
    Settings, Server, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveFeed } from '../hooks/useLiveFeed';
import logoMark from '../assets/logo-mark.png';

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Risk Map', path: '/live-map', icon: Map },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: true },
    { name: 'Scenario Simulator', path: '/scenario-simulator', icon: TestTube2 },
    { name: 'Inventory Intelligence', path: '/inventory', icon: Package },
    { name: 'City Explorer', path: '/city-explorer', icon: Building2 },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { hospital, logout } = useAuth();
    const navigate = useNavigate();
    const { count } = useLiveFeed();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div
            className={clsx(
                'app-shell fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out',
                isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}
        >
            <div className="flex flex-col">
                <div className="p-4 flex items-center gap-3">
                    <img src={logoMark} alt="VectorShield" className="w-10 h-10 object-contain shrink-0" />
                    <div className="flex flex-col leading-tight">
                        <span className="text-[17px] font-semibold text-[#159A7E] tracking-tight">VectorShield</span>
                        <span className="app-mono text-[10px] text-[#8593A6] uppercase tracking-wider">Surveillance Matrix v1.2</span>
                    </div>
                </div>

                <div className="px-4 pb-3">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#F1F8F5] rounded border border-[#E2E8F0]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#159A7E] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#159A7E]" />
                        </span>
                        <span className="app-mono text-[10px] font-semibold text-[#0C6952] uppercase tracking-wide">Live Stream Polling (2.5s)</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-1 px-3 pt-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose && onClose()}
                            className={({ isActive }) => clsx(
                                'flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-colors',
                                isActive ? 'bg-[#159A7E] text-white' : 'text-[#475569] hover:bg-[#F1F8F5] hover:text-[#0F172A]'
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <item.icon className="w-[18px] h-[18px]" />
                                {item.name}
                            </span>
                            {item.badge && count > 0 && (
                                <span className="app-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626]">
                                    {count} Active
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 flex flex-col gap-3 border-t border-[#E2E8F0]">
                <div className="p-2 rounded bg-[#F8FAFB] border border-[#E2E8F0]">
                    <span className="app-mono text-[10px] text-[#8593A6] uppercase block">Signed in as</span>
                    <span className="app-mono text-xs text-[#0F172A] font-semibold block truncate" title={hospital?.hospital_name}>
                        {hospital?.hospital_name || 'Hospital'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-[#D7F2F2] flex items-center justify-center text-[#0B5C78] font-semibold text-xs shrink-0">
                            {(hospital?.hospital_name || 'H').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#0F172A] truncate">{hospital?.email || 'account'}</span>
                            <span className="app-mono text-[10px] text-[#8593A6]">Hospital account</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button title="Settings (coming soon)" className="text-[#8593A6] hover:text-[#159A7E] transition-colors p-1" type="button">
                            <Settings className="w-4 h-4" />
                        </button>
                        <button title="System status (coming soon)" className="text-[#8593A6] hover:text-[#159A7E] transition-colors p-1" type="button">
                            <Server className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded text-[#475569] hover:bg-[#F1F8F5] hover:text-[#0F172A] transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Log out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
