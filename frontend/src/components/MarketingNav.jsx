import React from 'react';
import { Link } from 'react-router-dom';
import logoMark from '../assets/logo-mark.png';

const MarketingNav = () => {
    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-[#F8FAFB]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="h-16 max-w-[1600px] mx-auto px-6 lg:px-8 flex items-center justify-between gap-6">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logoMark} alt="VectorShield" className="w-9 h-9 object-contain" />
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-tight text-[#0B5C78]">VectorShield</span>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#D7F2F2] text-[#0B5C78] tracking-wide">Surveillance</span>
                        </div>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/#features" className="text-sm font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">Features</Link>
                        <Link to="/#how-it-works" className="text-sm font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">How it works</Link>
                        <Link to="/pricing" className="text-sm font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">Pricing</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="text-sm font-semibold text-[#475569] hover:text-[#159A7E] transition-colors px-3 py-2">Log in</Link>
                    <Link to="/signup" className="text-sm font-semibold bg-[#159A7E] hover:bg-[#11836A] text-white px-4 py-2 rounded-[10px] shadow-sm transition-all">Sign up</Link>
                </div>
            </div>
        </header>
    );
};

export default MarketingNav;
