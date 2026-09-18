import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Zap, Building2, HeartPulse, Network, RefreshCw, Clock, Database, ShieldCheck, Radio, ArrowRight } from 'lucide-react';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';

const TIERS = [
    {
        name: 'Starter',
        icon: Building2,
        price: '₹4,499',
        period: '/month',
        description: 'For 1 Hospital',
        featuresHeading: 'Included',
        features: [
            '48-hour risk prediction',
            'IoT environmental monitoring',
            'Temperature & humidity monitoring',
            'Rainfall monitoring',
            'Moisture monitoring',
            'Risk scoring',
            'Hotspot & clustering intelligence',
            'Environmental intelligence',
            'In-platform alerts',
            'Hospital dashboard',
            'Standard support',
        ],
        excluded: 'Inventory Intelligence is not included.',
        addons: [
            { label: 'Pod', value: '₹399/pod/month' },
            { label: 'Installation', value: '₹999/pod one-time' },
        ],
        cta: 'Get started',
        highlighted: false,
    },
    {
        name: 'Pro',
        icon: HeartPulse,
        price: '₹14,449',
        period: '/month',
        description: 'Up to 4 Hospitals / Network',
        featuresHeading: 'Everything in Starter, plus:',
        features: [
            'Multi-hospital dashboard',
            'Cross-hospital analytics',
            'Network-level risk intelligence',
            'Centralized monitoring',
            'Centralized alerts',
            'Priority support',
        ],
        addons: [
            { label: 'Additional Hospital', value: '₹2,999/month per hospital' },
            { label: 'Pod', value: '₹349/pod/month' },
            { label: 'Installation', value: '₹999/pod one-time' },
        ],
        cta: 'Get started',
        highlighted: true,
    },
    {
        name: 'Enterprise',
        icon: Network,
        price: 'Custom',
        period: '',
        description: 'For large healthcare networks and specialized deployments',
        featuresHeading: 'Built around your deployment',
        features: [
            'Custom number of hospitals',
            'Custom IoT deployment',
            'Custom integrations',
            'Custom analytics & solutions',
            'Dedicated implementation',
            'Flexible SLA & support',
            'Government & large healthcare network deployments',
        ],
        footnote: 'Contact us for customized pricing',
        cta: 'Contact sales',
        highlighted: false,
    },
];

const GLANCE = [
    { icon: RefreshCw, label: 'Dashboard Refresh', value: 'Every 2.5 seconds', desc: 'Live data polling keeps every KPI and map marker current.' },
    { icon: Clock, label: 'Forecast Horizon', value: '48 hours ahead', desc: 'ML-based case surge predictions built into every plan.' },
    { icon: Database, label: 'Data Sources', value: 'Hospital + water + IoT', desc: 'Correlate admissions, water quality, and sensor pods in one view.' },
];

const FAQS = [
    {
        icon: ShieldCheck,
        q: 'How is my hospital’s data kept separate from others?',
        a: 'Each hospital signs in with its own account and password. The current pilot dashboard shows a shared surveillance view built from all connected data sources — we’re happy to scope a fully isolated, per-hospital deployment for production use.',
    },
    {
        icon: Radio,
        q: 'What sensor or data hardware does VectorShield support?',
        a: 'IoT pods connect over serial and simple API feeds today. Hospital admissions and water-quality readings can be imported directly as CSV files. Custom hardware integrations can be scoped for Enterprise deployments.',
    },
    {
        icon: Database,
        q: 'Do I need to integrate my EHR system to get started?',
        a: 'No — hospitals get started by creating an account and importing data directly. No EHR integration is required for the pilot program.',
    },
];

const PricingPage = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFB] text-[#0F172A]">
            <MarketingNav />

            <div className="relative w-full overflow-hidden pt-16 pb-20">
                <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#D7F2F2]/40 blur-3xl rounded-full" />
                <div className="max-w-[1600px] mx-auto px-6 lg:px-8 relative z-10 pt-10">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="inline-block text-xs font-semibold tracking-wider uppercase text-[#159A7E] bg-[#D7F2F2] px-3 py-1 rounded-full">
                            Transparent plans for healthcare networks
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4 text-[#0F172A]">Simple, transparent pricing</h1>
                        <p className="text-[#475569] max-w-xl mx-auto mt-3 text-lg">
                            Predictive surveillance that scales from single hospital pilots to regional health networks.
                        </p>
                    </div>

                    {/* Tier grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch max-w-6xl mx-auto">
                        {TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className={`bg-white rounded-xl p-8 flex flex-col justify-between border transition-shadow duration-200 relative ${
                                    tier.highlighted
                                        ? 'shadow-xl border-[#159A7E]/30 lg:-translate-y-3'
                                        : 'shadow-sm border-[#E2E8F0] hover:shadow-md'
                                }`}
                            >
                                {tier.highlighted && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                        <span className="bg-[#159A7E] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                            <Zap className="w-3.5 h-3.5" /> Most popular
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center justify-between mb-2 mt-2">
                                        <span className="text-lg font-bold text-[#0F172A]">{tier.name}</span>
                                        <tier.icon className="w-5 h-5 text-[#8593A6]" />
                                    </div>
                                    <p className="text-sm text-[#475569]">{tier.description}</p>
                                    <div className="mt-6 mb-7 flex items-baseline gap-1.5">
                                        <span className="text-4xl font-bold text-[#0F172A]">{tier.price}</span>
                                        <span className="text-sm text-[#475569]">{tier.period}</span>
                                    </div>
                                    <div className="w-full h-px bg-[#E2E8F0] mb-6" />
                                    <p className={`text-xs uppercase tracking-wider font-semibold mb-4 ${tier.highlighted ? 'text-[#159A7E]' : 'text-[#475569]'}`}>{tier.featuresHeading}</p>
                                    <ul className="space-y-3">
                                        {tier.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2.5 text-sm text-[#0F172A]">
                                                <Check className="w-[18px] h-[18px] text-[#159A7E] shrink-0" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                        {tier.excluded && (
                                            <li className="flex items-center gap-2.5 text-sm text-[#8593A6]">
                                                <X className="w-[18px] h-[18px] text-[#CBD5E1] shrink-0" />
                                                <span>{tier.excluded}</span>
                                            </li>
                                        )}
                                    </ul>

                                    {tier.addons && (
                                        <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
                                            <p className="text-xs uppercase tracking-wider font-semibold text-[#8593A6] mb-3">Add-ons</p>
                                            <ul className="space-y-2">
                                                {tier.addons.map((a) => (
                                                    <li key={a.label} className="flex items-center justify-between text-sm">
                                                        <span className="text-[#475569]">{a.label}</span>
                                                        <span className="font-semibold text-[#0F172A]">{a.value}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {tier.footnote && (
                                        <p className="mt-6 pt-5 border-t border-[#F1F5F9] text-sm text-[#475569]">{tier.footnote}</p>
                                    )}
                                </div>
                                <div className="mt-8 pt-6">
                                    <Link
                                        to="/signup"
                                        className={`block w-full text-center font-semibold text-sm py-3 px-4 rounded-lg transition-all ${
                                            tier.highlighted
                                                ? 'bg-[#159A7E] hover:bg-[#11836A] text-white shadow-md'
                                                : 'bg-[#F8FAFB] hover:bg-[#EEF2F5] text-[#0F172A] border border-[#E2E8F0]'
                                        }`}
                                    >
                                        {tier.cta}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-[#475569] text-center max-w-2xl mx-auto mt-10">
                        All prices in INR. IoT pods and installation are billed separately per the add-ons listed under each plan.
                        Public health departments and academic institutions may qualify for reduced pricing — get in touch to discuss your deployment.
                    </p>

                    {/* Platform at a glance */}
                    <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-[#E2E8F0] max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-8 pb-6 border-b border-[#F1F5F9]">
                            <div>
                                <span className="text-xs uppercase tracking-wider text-[#0B5C78] font-semibold">Every plan includes</span>
                                <h2 className="text-xl font-bold text-[#0F172A] mt-1">Platform at a glance</h2>
                            </div>
                            <div className="flex items-center gap-2 bg-[#F8FAFB] px-3 py-1.5 rounded-full border border-[#E2E8F0]">
                                <span className="w-2 h-2 rounded-full bg-[#159A7E] animate-pulse" />
                                <span className="text-xs text-[#475569]">Updates automatically</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {GLANCE.map((g) => (
                                <div key={g.label} className="bg-[#F8FAFB] p-5 rounded-lg border border-[#E2E8F0]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <g.icon className="w-4 h-4 text-[#159A7E]" />
                                        <span className="text-sm text-[#475569]">{g.label}</span>
                                    </div>
                                    <span className="text-lg font-bold text-[#0B5C78]">{g.value}</span>
                                    <p className="text-xs text-[#475569] mt-2">{g.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="max-w-4xl mx-auto mt-20">
                        <div className="text-center mb-10">
                            <span className="text-xs uppercase tracking-wider text-[#159A7E] font-semibold">Common Questions</span>
                            <h2 className="text-2xl font-bold text-[#0F172A] mt-1">Frequently asked questions</h2>
                            <p className="text-[#475569] mt-2">What hospitals ask before getting started.</p>
                        </div>
                        <div className="space-y-4">
                            {FAQS.map((item) => (
                                <div key={item.q} className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[#D7F2F2] flex items-center justify-center shrink-0 mt-0.5">
                                            <item.icon className="w-4 h-4 text-[#0B5C78]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[#0F172A]">{item.q}</h3>
                                            <p className="text-sm text-[#475569] mt-2 leading-relaxed">{item.a}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA banner */}
                    <div className="mt-20 max-w-6xl mx-auto bg-white rounded-xl p-8 lg:p-11 shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl text-center md:text-left">
                            <span className="text-xs uppercase tracking-wider text-[#0B5C78] font-semibold">Multi-facility &amp; regional</span>
                            <h3 className="text-xl font-bold text-[#0F172A] mt-1">Need a custom rollout for multiple facilities?</h3>
                            <p className="text-sm text-[#475569] mt-2">
                                Get in touch and we'll help you scope a deployment that fits your hospital network or health district.
                            </p>
                        </div>
                        <Link
                            to="/signup"
                            className="shrink-0 bg-[#0B5C78] hover:bg-[#0a4e66] text-white font-semibold text-sm py-3 px-6 rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
                        >
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            <MarketingFooter />
        </div>
    );
};

export default PricingPage;
