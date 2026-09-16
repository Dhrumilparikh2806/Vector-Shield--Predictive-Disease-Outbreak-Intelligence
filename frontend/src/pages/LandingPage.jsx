import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Radar, Waves, LineChart, MapPinned, Radio,
    BellRing, Droplet, SlidersHorizontal, Zap,
    CheckCircle2, ShieldCheck, FileSpreadsheet, LayoutDashboard,
} from 'lucide-react';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';

const FEATURES = [
    { title: 'AI Outbreak Forecasting', desc: 'Random Forest and Isolation Forest models predict case surges up to 48 hours before they happen.', tag: 'Exploratory predictive matrix', icon: LineChart, tint: 'bg-[#D7F2F2] text-[#159A7E]' },
    { title: 'Geographic Hotspot Mapping', desc: 'Live heatmaps show exactly which zones are trending toward critical risk.', tag: 'Spatial polygon drill-down', icon: MapPinned, tint: 'bg-[#DCEFFB] text-[#0B5C78]' },
    { title: 'IoT Sensor Integration', desc: 'Stream live environmental data straight from field sensor pods.', tag: 'Serial & API sensor feeds', icon: Radio, tint: 'bg-[#EEF2F5] text-[#0F172A]' },
    { title: 'Automated Alerts', desc: 'Authorities get notified the moment a zone crosses a risk threshold.', tag: 'In-app alert feed', icon: BellRing, tint: 'bg-[#FEE2E2] text-[#DC2626]' },
    { title: 'Water Quality Correlation', desc: 'Cross-reference contamination trends against hospital admissions automatically.', tag: 'Automatic correlation analysis', icon: Droplet, tint: 'bg-[#DCEFFB] text-[#0B5C78]' },
    { title: 'Scenario Simulation', desc: 'Model hypothetical outbreak scenarios to stress-test response plans.', tag: 'Synthetic cohort generation', icon: SlidersHorizontal, tint: 'bg-[#D7F2F2] text-[#159A7E]' },
];

const STEPS = [
    { n: '01', title: 'Register your hospital', desc: 'Set up your hospital profile in minutes — just a name, email, and password.', icon: ShieldCheck, detailTitle: 'Just a name and email', detail: "Create your hospital's account in under a minute." },
    { n: '02', title: 'Connect your data', desc: 'Bring in hospital admissions, water-quality readings, and IoT sensor feeds.', icon: FileSpreadsheet, detailTitle: 'CSV-based import', detail: 'Upload hospital admissions and water-quality data directly.' },
    { n: '03', title: 'Get early warnings', desc: 'Access live risk heatmaps and 48-hour forecasts on your dashboard.', icon: LayoutDashboard, detailTitle: 'Live dashboard alerts', detail: 'Risk zones and forecasts update on your dashboard in real time.' },
];

const STATS = [
    { value: '48 hours', label: 'Forecast horizon before a hospital surge', color: 'text-[#159A7E]' },
    { value: '3+', label: 'Data sources correlated (hospital, water, IoT)', color: 'text-[#0B5C78]' },
    { value: 'Unlimited', label: 'Monitored municipal & clinical risk zones', color: 'text-[#0F172A]' },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFB] text-[#0F172A]">
            <MarketingNav />

            {/* Hero */}
            <section className="relative w-full overflow-hidden pt-16">
                <div className="pointer-events-none absolute -top-40 right-10 h-[520px] w-[520px] rounded-full bg-[#159A7E]/5 blur-[120px]" />
                <div className="pointer-events-none absolute top-1/3 -left-32 h-[440px] w-[440px] rounded-full bg-[#D7F2F2]/50 blur-[100px]" />
                <div className="max-w-[1600px] mx-auto px-6 lg:px-8 pt-14 pb-16 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-6 flex flex-col items-start gap-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6F8] text-[#0B5C78] text-xs font-semibold shadow-sm">
                                <span className="inline-block w-2 h-2 rounded-full bg-[#159A7E] animate-pulse" />
                                <span>Live Epidemiological Intelligence · v1.2 Pilot</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-[#0F172A]" style={{ textWrap: 'balance' }}>
                                Predict disease outbreaks before they happen
                            </h1>
                            <p className="text-lg text-[#475569] max-w-xl">
                                An integrated early-warning system that correlates hospital admissions, water-quality
                                telemetry, and field IoT sensors to deliver 48-hour surge forecasts.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Link to="/signup" className="text-sm font-semibold bg-[#159A7E] hover:bg-[#11836A] text-white rounded-[10px] px-6 py-3.5 shadow-sm transition-all inline-flex items-center gap-2">
                                    <span>Register Your Hospital</span>
                                    <ArrowRight className="w-[18px] h-[18px]" />
                                </Link>
                                <Link to="/pricing" className="text-sm font-semibold bg-white hover:bg-[#F1F8F5] text-[#0F172A] border border-[#E2E8F0] rounded-[10px] px-6 py-3.5 shadow-sm transition-colors">
                                    View Pricing
                                </Link>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <div className="flex -space-x-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0B5C78] text-white text-[10px] font-bold ring-2 ring-[#F8FAFB]">HOS</span>
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#159A7E] text-white text-[10px] font-bold ring-2 ring-[#F8FAFB]">H2O</span>
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#486061] text-white text-[10px] font-bold ring-2 ring-[#F8FAFB]">IoT</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-[#0F172A]">Continuous multi-source telemetry</span>
                                    <span className="text-xs text-[#475569]">Built on Random Forest &amp; Isolation Forest models</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6 w-full">
                            <div className="bg-white rounded-xl p-5 shadow-xl border border-[#E2E8F0]">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <Radar className="w-[22px] h-[22px] text-[#0B5C78]" />
                                        <div>
                                            <h2 className="text-sm font-bold text-[#0B5C78]">Geospatial Risk Intelligence</h2>
                                            <p className="text-xs text-[#475569]">National surveillance · Live synthesis</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full bg-[#EAF6F8] text-[#0B5C78] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#159A7E] animate-pulse" />
                                        Active Surveillance
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div className="bg-[#F8FAFB] rounded-lg p-3 flex flex-col border border-[#E2E8F0]">
                                        <span className="text-[11px] text-[#475569]">Average Risk Score</span>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-xl font-bold text-[#0F172A]">55.34</span>
                                            <span className="text-xs text-[#475569]">/ 100</span>
                                        </div>
                                        <div className="mt-2 w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-[#159A7E] h-1.5 rounded-full" style={{ width: '55%' }} />
                                        </div>
                                    </div>
                                    <div className="bg-[#F8FAFB] rounded-lg p-3 flex flex-col border border-[#E2E8F0]">
                                        <span className="text-[11px] text-[#475569]">Active Alerts</span>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-xl font-bold text-[#DC2626]">49</span>
                                            <span className="text-[11px] text-[#DC2626] font-medium">zones</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-[11px] text-[#475569]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] inline-block" />
                                            <span>Updated every few seconds</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#F8FAFB] rounded-lg p-3 flex flex-col border border-[#E2E8F0]">
                                        <span className="text-[11px] text-[#475569]">Forecasting Horizon</span>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-xl font-bold text-[#0B5C78]">48</span>
                                            <span className="text-[11px] text-[#0B5C78] font-medium">hours out</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-[11px] text-[#159A7E]">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>ML-based forecast</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 bg-[#EEF2F5] rounded-xl p-3 relative overflow-hidden">
                                    <div className="flex items-center justify-between pb-2">
                                        <span className="text-[10px] uppercase tracking-wider text-[#475569] font-semibold">Cluster Threat Matrix</span>
                                        <div className="flex items-center gap-3 text-[10px] font-medium">
                                            <span className="flex items-center gap-1 text-[#0F172A]"><span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Critical</span>
                                            <span className="flex items-center gap-1 text-[#0F172A]"><span className="w-2 h-2 rounded-full bg-[#EA580C]" /> High</span>
                                            <span className="flex items-center gap-1 text-[#0F172A]"><span className="w-2 h-2 rounded-full bg-[#CA8A04]" /> Moderate</span>
                                            <span className="flex items-center gap-1 text-[#0F172A]"><span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Low</span>
                                        </div>
                                    </div>
                                    <div className="relative w-full h-44 bg-white rounded-lg overflow-hidden border border-[#E2E8F0]">
                                        <svg className="absolute inset-0 w-full h-full text-[#E2E8F0]" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <pattern id="lp-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                                                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeWidth="0.75" />
                                                </pattern>
                                            </defs>
                                            <rect width="100%" height="100%" fill="url(#lp-grid)" />
                                            <path d="M 20,120 Q 100,90 200,110 T 420,70" fill="none" stroke="#0B5C78" strokeDasharray="4 4" strokeWidth="2" opacity="0.5" />
                                        </svg>
                                        <div className="absolute top-8 left-12 flex items-center justify-center">
                                            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#DC2626] opacity-40" />
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#DC2626]" />
                                        </div>
                                        <div className="absolute top-20 left-[45%] h-3.5 w-3.5 rounded-full bg-[#EA580C]" />
                                        <div className="absolute bottom-8 right-20 h-3 w-3 rounded-full bg-[#CA8A04]" />
                                        <div className="absolute top-6 right-10 h-3 w-3 rounded-full bg-[#16A34A]" />
                                    </div>
                                </div>

                                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-[#475569] border-t border-[#E2E8F0]">
                                    <div className="flex items-center gap-1.5">
                                        <Waves className="w-4 h-4 text-[#159A7E]" />
                                        <span>Encrypted risk telemetry</span>
                                    </div>
                                    <span className="text-[11px]">Live dashboard preview</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="w-full bg-white py-20 border-y border-[#E2E8F0]">
                <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-semibold text-[#159A7E] uppercase tracking-widest px-3 py-1 bg-[#D7F2F2] rounded-full mb-3">Platform Capabilities</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A]">Everything you need to get ahead</h2>
                        <p className="text-[#475569] mt-3">Built for hospital networks, epidemiologists, and public health teams.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
                                <div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.tint}`}>
                                        <f.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0F172A] mb-1.5">{f.title}</h3>
                                    <p className="text-sm text-[#475569] leading-relaxed">{f.desc}</p>
                                </div>
                                <div className="mt-6 pt-3 border-t border-[#F1F5F9] flex items-center gap-1.5 text-xs font-semibold text-[#159A7E]">
                                    <span>{f.tag}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="w-full bg-[#F8FAFB] py-20">
                <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-semibold text-[#0B5C78] uppercase tracking-widest px-3 py-1 bg-[#EAF6F8] rounded-full mb-3">Getting Started</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A]">How VectorShield deploys</h2>
                        <p className="text-[#475569] mt-3">Up and running in three steps — no complex infrastructure required.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map((s) => (
                            <div key={s.n} className="bg-white rounded-xl p-7 shadow-sm border border-[#E2E8F0] relative flex flex-col justify-between overflow-hidden">
                                <div className="absolute -right-2 -bottom-4 text-[100px] font-bold text-[#F1F5F9] select-none pointer-events-none leading-none">{s.n}</div>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-[#159A7E] text-white flex items-center justify-center mb-5 shadow-sm">
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0F172A] mb-2">{s.title}</h3>
                                    <p className="text-sm text-[#475569] leading-relaxed">{s.desc}</p>
                                </div>
                                <div className="relative mt-6 pt-3 bg-[#F1F8F5] rounded-lg p-3.5 border border-[#E2E8F0]">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-[#159A7E]" />
                                        <span className="text-xs font-semibold text-[#0F172A]">{s.detailTitle}</span>
                                    </div>
                                    <p className="text-xs text-[#475569] mt-1">{s.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="w-full bg-[#F8FAFB] pb-20">
                <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
                    <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {STATS.map((s) => (
                            <div key={s.label} className="flex flex-col items-center px-3 py-2">
                                <span className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
                                <span className="text-[#475569] mt-1.5 max-w-[260px] text-sm">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="w-full bg-[#F8FAFB] pb-20">
                <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
                    <div className="relative overflow-hidden bg-[#0B5C78] text-white rounded-2xl p-14 text-center shadow-xl">
                        <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#159A7E]/25 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D7F2F2] text-xs font-semibold mb-4">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Free to start</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-3">Ready to see risk before it spreads?</h2>
                            <p className="text-[#D7F2F2] max-w-xl mb-8 leading-relaxed">
                                Deploy VectorShield for your hospital or health district today. No complex infrastructure required.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Link to="/signup" className="text-sm font-semibold bg-[#159A7E] hover:bg-white hover:text-[#0B5C78] text-white rounded-[10px] px-8 py-3.5 shadow-md transition-all inline-flex items-center gap-2">
                                    <span>Get Started Free</span>
                                    <ArrowRight className="w-[18px] h-[18px]" />
                                </Link>
                                <Link to="/pricing" className="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white rounded-[10px] px-6 py-3.5 transition-colors">
                                    See Pricing Plans
                                </Link>
                            </div>
                            <p className="text-sm text-[#D7F2F2]/80 mt-6 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Free to start — no credit card required.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
};

export default LandingPage;
