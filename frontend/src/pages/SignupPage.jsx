import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Lock, KeyRound, ShieldCheck, Check, Clock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoMark from '../assets/logo-mark.png';

const PLANS = [
    { id: 'starter', name: 'Starter', price: '₹4,499', period: '/mo', blurb: '1 hospital' },
    { id: 'professional', name: 'Pro', price: '₹14,449', period: '/mo', blurb: 'Up to 4 hospitals', popular: true },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', blurb: 'Large networks' },
];

const SignupPage = () => {
    const { signup } = useAuth();
    const [hospitalName, setHospitalName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [plan, setPlan] = useState('professional');
    const [hospitalCount, setHospitalCount] = useState(1);
    const [confirmAuthority, setConfirmAuthority] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pending, setPending] = useState(null);

    const passwordTooShort = password.length > 0 && password.length < 8;
    const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!confirmAuthority) {
            setError('Please confirm you are authorized to register this hospital.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (!hospitalCount || hospitalCount < 1) {
            setError('Enter how many hospitals you need to monitor (at least 1).');
            return;
        }

        setLoading(true);
        try {
            const data = await signup(hospitalName, email, password, plan, Number(hospitalCount));
            setPending(data);
        } catch (err) {
            setError(err?.response?.data?.detail || 'A hospital with that name or email already exists.');
        } finally {
            setLoading(false);
        }
    };

    if (pending) {
        return (
            <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center py-10 px-4">
                <div className="w-full max-w-md text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <img src={logoMark} alt="VectorShield" className="w-11 h-11 object-contain" />
                        <span className="text-2xl font-bold tracking-tight text-[#0F172A]">VectorShield</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-[#E2E8F0] p-8">
                        <div className="w-14 h-14 rounded-full bg-[#D7F2F2] flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-7 h-7 text-[#0B5C78]" />
                        </div>
                        <h2 className="text-xl font-bold text-[#0F172A] mb-2">Registration submitted</h2>
                        <p className="text-sm text-[#475569] leading-relaxed mb-5">
                            {pending.message}
                        </p>
                        <div className="bg-[#F8FAFB] border border-[#E2E8F0] rounded-lg p-4 text-left text-sm space-y-1.5 mb-6">
                            <div className="flex justify-between"><span className="text-[#8593A6]">Hospital</span><span className="font-semibold text-[#0F172A]">{pending.hospital?.hospital_name}</span></div>
                            <div className="flex justify-between"><span className="text-[#8593A6]">Plan requested</span><span className="font-semibold text-[#0F172A] capitalize">{pending.hospital?.plan}</span></div>
                            <div className="flex justify-between"><span className="text-[#8593A6]">Hospitals to monitor</span><span className="font-semibold text-[#0F172A]">{pending.hospital?.hospital_count}</span></div>
                            <div className="flex justify-between"><span className="text-[#8593A6]">Status</span><span className="font-semibold text-[#CA8A04] capitalize">{pending.hospital?.status}</span></div>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-[#8593A6] mb-6">
                            <Mail className="w-3.5 h-3.5" />
                            <span>We'll notify {pending.hospital?.email} once you're approved.</span>
                        </div>
                        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#159A7E] hover:text-[#0B5C78] transition-colors">
                            Back to sign in <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center py-10 px-4">
            <div className="w-full max-w-lg flex flex-col items-center">
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="flex items-center gap-3">
                        <img src={logoMark} alt="VectorShield" className="w-11 h-11 object-contain" />
                        <span className="text-2xl font-bold tracking-tight text-[#0F172A]">VectorShield</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D7F2F2] text-[#0B5C78] text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#159A7E] animate-pulse" />
                            Hospital Onboarding
                        </span>
                    </div>
                </div>

                <div className="w-full bg-white rounded-xl shadow-md p-6 sm:p-8 border border-[#E2E8F0] relative">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#0F172A]">Register Your Hospital</h2>
                        <p className="text-sm text-[#475569] mt-1">New accounts are reviewed by our team before you can sign in.</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm flex items-start gap-2.5">
                            <AlertCircle className="w-[18px] h-[18px] text-red-600 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-red-600">Couldn't create account</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#0F172A]" htmlFor="hospital-name">Hospital Name</label>
                            <input
                                id="hospital-name"
                                type="text"
                                required
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                placeholder="General Hospital"
                                className="w-full bg-white rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] border border-[#E2E8F0] placeholder:text-[#8593A6] focus:outline-none focus:border-[#159A7E] focus:ring-[3px] focus:ring-[#D7F2F2] transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#0F172A]" htmlFor="work-email">Email</label>
                            <input
                                id="work-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@yourhospital.org"
                                className="w-full bg-white rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] border border-[#E2E8F0] placeholder:text-[#8593A6] focus:outline-none focus:border-[#159A7E] focus:ring-[3px] focus:ring-[#D7F2F2] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#0F172A]" htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    className={`w-full bg-white rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] border ${passwordTooShort ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:ring-[#D7F2F2]'} placeholder:text-[#8593A6] focus:outline-none focus:border-[#159A7E] focus:ring-[3px] transition-all`}
                                />
                                <p className={`text-xs ${passwordTooShort ? 'text-red-600' : 'text-[#8593A6]'}`}>
                                    {passwordTooShort ? 'Must be at least 8 characters.' : 'Min. 8 characters'}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#0F172A]" htmlFor="confirm-password">Confirm Password</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className={`w-full bg-white rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] border ${passwordsMismatch ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:ring-[#D7F2F2]'} placeholder:text-[#8593A6] focus:outline-none focus:border-[#159A7E] focus:ring-[3px] transition-all`}
                                />
                                {passwordsMismatch && <p className="text-xs text-red-600">Passwords do not match.</p>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-[#0F172A]">Choose a plan</label>
                            <div className="grid grid-cols-3 gap-2">
                                {PLANS.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setPlan(p.id)}
                                        className={`relative text-left p-3 rounded-lg border transition-all ${plan === p.id ? 'border-[#159A7E] bg-[#F1F8F5] ring-1 ring-[#159A7E]' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'}`}
                                    >
                                        {p.popular && (
                                            <span className="absolute -top-2 right-2 text-[9px] font-bold uppercase bg-[#159A7E] text-white px-1.5 py-0.5 rounded-full">Popular</span>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-[#0F172A]">{p.name}</span>
                                            {plan === p.id && <Check className="w-3.5 h-3.5 text-[#159A7E]" />}
                                        </div>
                                        <div className="text-sm font-bold text-[#159A7E] mt-1">{p.price}<span className="text-[10px] font-normal text-[#8593A6]"> {p.period}</span></div>
                                        <div className="text-[10px] text-[#8593A6] mt-0.5">{p.blurb}</div>
                                    </button>
                                ))}
                            </div>
                            <Link to="/pricing" className="text-xs text-[#159A7E] hover:text-[#0B5C78] transition-colors self-start">Compare plan details →</Link>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#0F172A]" htmlFor="hospital-count">How many hospitals do you need to monitor?</label>
                            <input
                                id="hospital-count"
                                type="number"
                                min={1}
                                required
                                value={hospitalCount}
                                onChange={(e) => setHospitalCount(e.target.value)}
                                className="w-full bg-white rounded-lg px-3.5 py-2.5 text-sm text-[#0F172A] border border-[#E2E8F0] placeholder:text-[#8593A6] focus:outline-none focus:border-[#159A7E] focus:ring-[3px] focus:ring-[#D7F2F2] transition-all"
                            />
                            <p className="text-xs text-[#8593A6]">This is a request — final scope is confirmed when your account is approved.</p>
                        </div>

                        <div className="pt-1 flex items-start gap-2.5">
                            <input
                                id="confirm-authority"
                                type="checkbox"
                                checked={confirmAuthority}
                                onChange={(e) => setConfirmAuthority(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-[#CBD5E1] text-[#159A7E] accent-[#159A7E] cursor-pointer"
                            />
                            <label htmlFor="confirm-authority" className="text-sm text-[#475569] leading-tight cursor-pointer">
                                I confirm I'm authorized to register this hospital and manage its VectorShield account.
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#159A7E] hover:bg-[#11836A] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                                        </svg>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <span>Submit for Approval</span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-4 text-center">
                        <p className="text-sm text-[#475569]">
                            Already registered?{' '}
                            <Link to="/login" className="font-semibold text-[#159A7E] hover:text-[#0B5C78] transition-colors inline-flex items-center gap-0.5">
                                Sign in
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 w-full text-center px-4">
                    <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-[#8593A6]">
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

export default SignupPage;
