import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Bell, ShieldAlert, Settings, Info, TestTube2 } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Live Risk Map', path: '/live-map', icon: Map },
        { name: 'Alerts', path: '/alerts', icon: Bell },
        { name: 'Scenario Simulator', path: '/scenario-simulator', icon: TestTube2 },
    ];

    return (
        <aside
            className={clsx(
                "w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-30 transition-transform duration-300 ease-in-out font-sans",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
        >
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <ShieldAlert className="w-8 h-8 text-primary mr-3" />
                <span className="text-lg font-bold text-white tracking-wide">VectorShield</span>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) => clsx(
                            'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                            isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center text-slate-500 text-xs">
                    <Info className="w-4 h-4 mr-2" />
                    <span>v1.0.0 Stable</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
