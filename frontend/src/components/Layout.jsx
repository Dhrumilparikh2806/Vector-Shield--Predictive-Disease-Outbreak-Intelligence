import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="app-shell flex min-h-screen bg-[#F8FAFB] text-[#0F172A]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <TopHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((v) => !v)} />

            <main className="flex-1 w-full md:pl-64 pt-14 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
