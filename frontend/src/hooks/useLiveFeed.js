import { useEffect, useState } from 'react';
import { getLiveAlerts } from '../services/api';

const severityWeight = { Critical: 4, High: 3, Moderate: 2, Low: 1 };

// Shared lightweight poll used by the sidebar badge and top header ticker.
// Kept separate from each page's own richer polling so those stay independent.
export const useLiveFeed = () => {
    const [alerts, setAlerts] = useState([]);
    const [latencyMs, setLatencyMs] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const poll = async () => {
            const start = performance.now();
            try {
                const data = await getLiveAlerts();
                if (cancelled) return;
                setLatencyMs(Math.round(performance.now() - start));
                setAlerts(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!cancelled) setLatencyMs(null);
            }
        };

        poll();
        const interval = setInterval(poll, 2500);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    const topAlert = [...alerts].sort(
        (a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0)
    )[0];

    return { alerts, count: alerts.length, topAlert, latencyMs };
};
