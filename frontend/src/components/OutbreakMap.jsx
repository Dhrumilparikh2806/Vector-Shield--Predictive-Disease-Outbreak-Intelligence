import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

const OutbreakMap = ({ hotspots, showPopups = true }) => {
    const defaultCenter = [20.5937, 78.9629]; // India center
    const raw = hotspots && hotspots.length > 0 ? hotspots : [];

    const normalize = (spot) => {
        const level = (spot.level || spot.severity || spot.riskLevel || '').toString();
        const risk = Number(spot.risk ?? spot.riskScore ?? spot.value ?? 0) || 0;
        return { ...spot, level: level.toUpperCase(), risk };
    };

    const severityRank = (lvl) => {
        switch ((lvl || '').toUpperCase()) {
            case 'CRITICAL': return 4;
            case 'HIGH': return 3;
            case 'MODERATE': return 2;
            default: return 1;
        }
    };

    const data = raw.map(normalize).sort((a, b) => {
        const s = severityRank(b.level) - severityRank(a.level);
        if (s !== 0) return s;
        return (b.risk || 0) - (a.risk || 0);
    });

    const colorFor = (lvl) => {
        if (lvl === 'CRITICAL') return '#DC2626';
        if (lvl === 'HIGH') return '#EA580C';
        if (lvl === 'MODERATE') return '#FACC15';
        if (lvl === 'LOW') return '#22C55E';
        return '#16A34A';
    };

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-800 z-0">
            <MapContainer center={defaultCenter} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} zoomAnimation={true} fadeAnimation={true}>
                {/* Satellite base (ESRI World Imagery) */}
                <TileLayer
                    attribution='Tiles © Esri'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                {/* Hillshade overlay (subtle elevation) */}
                <TileLayer
                    attribution='Hillshade © Esri'
                    url="https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}"
                    opacity={0.35}
                />
                {/* Labels and boundaries */}
                <TileLayer
                    attribution='Labels © Esri'
                    url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                />
                {data.map((spot, idx) => {
                    const radius = 6 + Math.min(14, Math.round((spot.risk || 0) / 7)); // 6-20
                    const clr = colorFor(spot.level);
                    const fillOpacity = spot.level === 'CRITICAL' ? 0.9 : spot.level === 'HIGH' ? 0.8 : spot.level === 'MODERATE' ? 0.7 : 0.6;
                    return (
                        <CircleMarker
                            key={idx}
                            center={[spot.lat || 0, spot.lng || 0]}
                            radius={radius}
                            pathOptions={{
                                color: clr,
                                fillColor: clr,
                                fillOpacity,
                                weight: 2.5
                            }}
                        >
                            {showPopups && (
                                <Popup className="bg-white border border-slate-200 text-slate-900">
                                    <div className="p-2">
                                        <h3 className="font-bold text-sm">{spot.city || spot.location || 'Unknown'}</h3>
                                        <p className="text-xs">Risk Score: {spot.risk || 0}</p>
                                        <p className="text-xs">Predicted Cases: {spot.predicted_cases || spot.predicted_cases_48h || 0}</p>
                                    </div>
                                </Popup>
                            )}
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default OutbreakMap;
