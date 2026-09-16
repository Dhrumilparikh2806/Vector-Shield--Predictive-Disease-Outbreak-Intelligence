import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, AlertCircle, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoMark from '../assets/logo-mark.png';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [showForgotNote, setShowForgotNote] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password, remember);
            navigate(data.hospital?.is_admin ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err?.response?.data?.detail || 'Invalid email or password. Please verify your hospital credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center py-10 px-4">
            <div className="flex flex-col items-center mb-6 text-center">
                <div className="flex items-center gap-3 mb-2">
                    <img src={logoMark} alt="VectorShield" className="w-11 h-11 object-contain" />
                    <span className="text-2xl font-bold tracking-tight text-[#0B5C78]">VectorShield</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#159A7E] animate-pulse" />
                    <span className="text-[11px] font-semibold uppercase text-[#8593A6] tracking-wider">Hospital Surveillance Gateway</span>
                </div>
            </div>

            <div className="relative w-full max-w-md bg-white rounded-xl p-8 shadow-xl border border-[#E2E8F0]">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#0F172A]">Hospital Sign In</h2>
                    <p className="text-sm text-[#475569] mt-1">Access your outbreak surveillance dashboard.</p>
                </div>

                {error && (
                    <div className="mb-5 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3.5 flex items-start gap-2.5">
                        <AlertCircle className="w-[18px] h-[18px] text-red-600 shrink-0 mt-0.5" />
                        <div className="text-left">
                            <p className="text-[11px] text-red-600 uppercase font-bold tracking-wide">Authentication Failed</p>
                            <p className="text-sm text-red-700 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#0F172A]" htmlFor="email-input">Email</label>
                        <input
                            id="email-input"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@yourhospital.org"
                            className="w-full h-10 px-3.5 bg-white text-[#0F172A] rounded-[9px] border border-[#E2E8F0] text-sm placeholder:text-[#8593A6] transition-all focus:outline-none focus:border-[#159A7E] focus:ring-[3px] focus:ring-[#D7F2F2]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-[#0F172A]" htmlFor="password-input">Password</label>
                            <button
                                type="button"
                                onClick={() => setShowForgotNote((v) => !v)}
                                className="text-xs font-medium text-[#159A7E] hover:text-[#0B5C78] transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                id="password-input"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-10 px-3.5 pr-10 bg-white text-[#0F172A] rounded-[9px] border border-[#E2E8F0] text-sm placeholder:text-[#8593A6] transition-all focus:outline-none focus:border-[#159A7E] focus:ring-[3px] focus:ring-[#D7F2F2]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8593A6] hover:text-[#0F172A] transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                            </button>
                        </div>
                        {showForgotNote && (
                            <p className="text-xs text-[#475569] bg-[#F1F8F5] border border-[#E2E8F0] rounded-md px-2.5 py-2 mt-1">
                                Password reset isn't available yet — contact your VectorShield administrator for help signing in.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                        <input
                            id="remember-device"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="w-4 h-4 rounded border-[#CBD5E1] text-[#159A7E] accent-[#159A7E] cursor-pointer"
                        />
                        <label htmlFor="remember-device" className="text-sm text-[#475569] cursor-pointer select-none">
                            Keep me signed in on this device
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full h-11 bg-[#159A7E] hover:bg-[#11836A] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-[10px] flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                                    </svg>
                                    <span className="text-xs uppercase tracking-wide">Signing in...</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span>Sign In</span>
                                    <ArrowRight className="w-[18px] h-[18px]" />
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-5 text-center">
                    <p className="text-sm text-[#475569]">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-semibold text-[#159A7E] hover:text-[#0B5C78] transition-colors">
                            Register your hospital
                        </Link>
                    </p>
                </div>

                <div className="mt-6 pt-4 bg-[#F1F8F5] rounded-lg p-3 text-center border border-[#E2E8F0]">
                    <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#8593A6]">
                        <span className="inline-flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-[#159A7E]" /><span>Encrypted connection</span></span>
                        <span className="text-[#CBD5E1]">•</span>
                        <span className="inline-flex items-center gap-1"><KeyRound className="w-3.5 h-3.5 text-[#159A7E]" /><span>Bcrypt password hashing</span></span>
                        <span className="text-[#CBD5E1]">•</span>
                        <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#159A7E]" /><span>Per-hospital accounts</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
