import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Map, Smartphone } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] z-0"></div>

            <div className="z-10 text-center max-w-4xl px-4">
                <div className="flex justify-center mb-6">
                    <Shield className="w-16 h-16 text-primary animate-pulse" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    VectorShield
                </h1>
                <p className="text-xl md:text-2xl text-slate-400 mb-8 font-light">
                    Predictive Disease Outbreak Intelligence
                </p>
                <p className="text-md text-slate-500 mb-10 max-w-2xl mx-auto">
                    48-hour early warning powered by hospital data, water quality, and live environmental sensing.
                </p>

                <div className="flex gap-4 justify-center mb-16">
                    <Link to="/dashboard" className="px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20">
                        Open Dashboard
                    </Link>
                    <Link to="/live-map" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-700 transition-all">
                        View Risk Map
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                    {[
                        { title: "AI Forecasting", icon: Activity, desc: "Predict outbreaks 48h in advance" },
                        { title: "Geo Hotspots", icon: Map, desc: "Real-time heatmap of critical zones" },
                        { title: "IoT Integration", icon: Smartphone, desc: "Live environmental sensor streams" },
                        { title: "Automated Alerts", icon: Shield, desc: "Instant notifications for authorities" },
                    ].map((feature, i) => (
                        <div key={i} className="p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:border-primary/50 transition-colors">
                            <feature.icon className="w-8 h-8 text-primary mb-4" />
                            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
