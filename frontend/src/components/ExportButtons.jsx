import React, { useState } from 'react';
import { Download, FileText, Loader } from 'lucide-react';
import { exportZonesCSV, getExportableData } from '../services/api';

const ExportButtons = ({ zones = null, summary = null }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const blob = await exportZonesCSV();
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `zones-${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                return;
            }

            // fallback
            const data = await getExportableData();
            const rows = (data.zones || []).map(z => `${z.location || z.city || ''},${z.risk || z.riskScore || ''},${z.level || z.severity || ''},${z.predicted_cases || z.predicted_cases_48h || 0}`);
            const csv = 'city,risk,severity,predicted\n' + rows.join('\n');
            const blob2 = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob2);
            link.download = `zones-${new Date().toISOString().slice(0,10)}.csv`;
            link.click();
        } catch (err) {
            console.error('Export failed', err);
            alert('Export failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleIntel = async () => {
        setLoading(true);
        try {
            const { summary: s, zones: z } = await getExportableData();
            const top = (z || []).sort((a,b)=> (b.risk||b.riskScore||0)-(a.risk||a.riskScore||0)).slice(0,5);
            const report = {
                timestamp: new Date().toISOString(),
                activeCities: (z||[]).map(x => ({ city: x.location || x.city, risk: x.risk || x.riskScore || 0 })),
                avgRisk: s?.avgRisk || 0,
                totalAnomalies: s?.totalAnomalies || 0,
                topZones: top.map(t => ({ city: t.location || t.city, risk: t.risk || t.riskScore || 0 }))
            };
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = `intel-report-${new Date().toISOString().slice(0,10)}.json`;
            a.click();
        } catch (err) {
            console.error('Intel report failed', err);
            alert('Report failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={handleExport} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-slate-900/40 text-slate-400 border border-slate-800/50 rounded-xl hover:text-white hover:bg-slate-800 transition-all">
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} Export Surveillance Data (CSV)
            </button>
            <button onClick={handleIntel} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-slate-900/40 text-slate-400 border border-slate-800/50 rounded-xl hover:text-white hover:bg-slate-800 transition-all">
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />} Generate Risk Intel Report (JSON)
            </button>
        </>
    );
};

export default ExportButtons;
