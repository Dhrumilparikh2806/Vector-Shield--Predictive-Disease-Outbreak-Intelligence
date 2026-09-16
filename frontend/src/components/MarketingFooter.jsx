import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Network } from 'lucide-react';
import logoMark from '../assets/logo-mark.png';

const TRUST_BADGES = [
    { icon: KeyRound, label: 'Bcrypt password hashing' },
    { icon: ShieldCheck, label: 'Per-hospital accounts' },
    { icon: Network, label: 'Built on open ML models' },
];

const MarketingFooter = () => {
    return (
        <footer className="w-full bg-white border-t border-[#E2E8F0]">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-14">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
                    <div className="flex items-center gap-3">
                        <img src={logoMark} alt="VectorShield" className="w-8 h-8 object-contain" />
                        <span className="text-sm font-bold text-[#0B5C78]">VectorShield</span>
                        <span className="text-xs text-[#475569] pl-2">Hospital Epidemiological Intelligence</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {TRUST_BADGES.map((b) => (
                            <div key={b.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFB] border border-[#E2E8F0]">
                                <b.icon className="w-3.5 h-3.5 text-[#159A7E]" />
                                <span className="text-xs text-[#475569]">{b.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 bg-[#F8FAFB] rounded-xl px-6 py-4 border border-[#E2E8F0]">
                    <p className="text-xs text-[#475569]">© {new Date().getFullYear()} VectorShield. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/#features" className="text-xs text-[#475569] hover:text-[#0F172A] transition-colors">Features</Link>
                        <Link to="/pricing" className="text-xs text-[#475569] hover:text-[#0F172A] transition-colors">Pricing</Link>
                        <Link to="/login" className="text-xs text-[#475569] hover:text-[#0F172A] transition-colors">Log in</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default MarketingFooter;
