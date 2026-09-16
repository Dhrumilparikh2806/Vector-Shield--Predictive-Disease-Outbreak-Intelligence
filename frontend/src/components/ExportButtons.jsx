import React, { useState } from 'react';
import { Download, FileText, Loader } from 'lucide-react';
import { exportZonesCSV, getExportableData } from '../services/api';

const ExportButtons = () => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const blob = await exportZonesCSV();
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `zones-${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                return;
            }

            const data = await getExportableData();
            const rows = (data.zones || []).map((z) => `${z.location || z.city || ''},${z.risk || z.riskScore || ''},${z.level || z.severity || ''},${z.predicted_cases || z.predicted_cases_48h || 0}`);
            const csv = 'city,risk,severity,predicted\n' + rows.join('\n');
            const blob2 = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob2);
            link.download = `zones-${new Date().toISOString().slice(0, 10)}.csv`;
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
            const top = (z || []).sort((a, b) => (b.risk || b.riskScore || 0) - (a.risk || a.riskScore || 0)).slice(0, 5);
            const report = {
                timestamp: new Date().toISOString(),
                activeCities: (z || []).map((x) => ({ city: x.location || x.city, risk: x.risk || x.riskScore || 0 })),
                avgRisk: s?.avgRisk || 0,
                totalAnomalies: s?.totalAnomalies || 0,
                topZones: top.map((t) => ({ city: t.location || t.city, risk: t.risk || t.riskScore || 0 })),
            };
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = `intel-report-${new Date().toISOString().slice(0, 10)}.json`;
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
            <button
                onClick={handleIntel}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#475569] border border-[#E2E8F0] rounded font-medium text-sm hover:bg-[#F1F8F5] hover:text-[#0F172A] transition-colors shadow-sm disabled:opacity-60"
                type="button"
            >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Generate Risk Intel Report (JSON)
            </button>
            <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#159A7E] hover:bg-[#11836A] text-white rounded font-medium text-sm transition-colors shadow-sm disabled:opacity-60"
                type="button"
            >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export Surveillance Data (CSV)
            </button>
        </>
    );
};

export default ExportButtons;
