import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LiveMapComponent = ({ zones = [], heatmap = [], onMarkerClick }) => {
    const center = [20.5937, 78.9629]; // Center of India

    const getMarkerColor = (score) => {
        if (score >= 85) return '#DC2626'; // Critical
        if (score >= 70) return '#EA580C'; // High
        if (score >= 45) return '#FACC15'; // Moderate
        if (score >= 15) return '#22C55E'; // Low
        return '#16A34A'; // VeryLow
    };

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-[#E2E8F0] relative z-0">
            <MapContainer
                center={center}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
                zoomAnimation={true}
                fadeAnimation={true}
            >
                {/* OpenStreetMap: standard basemap, standardized across all app maps */}
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Heatmap Simulation Layer */}
                {heatmap.map((point, idx) => (
                    <CircleMarker
                        key={`heat-${idx}`}
                        center={[point[0], point[1]]}
                        pathOptions={{
                            color: 'transparent',
                            fillColor: '#ef4444',
                            fillOpacity: 0.15,
                            weight: 0
                        }}
                        radius={25 + (point[2] / 5)}
                    />
                ))}

                {/* Zone Markers Layer */}
                {zones.map((marker, idx) => (
                    <CircleMarker
                        key={`zone-${idx}`}
                        center={[marker.lat, marker.lng]}
                        eventHandlers={{
                            click: () => onMarkerClick && onMarkerClick(marker)
                        }}
                        pathOptions={{
                            color: getMarkerColor(marker.riskScore),
                            fillColor: getMarkerColor(marker.riskScore),
                            fillOpacity: 0.8,
                            weight: 2.5
                        }}
                        radius={8 + (marker.riskScore / 10)}
                    >
                        <Popup className="custom-popup">
                            <div className="bg-white text-slate-900 p-2 rounded shadow-lg border border-slate-200 text-sm">
                                <div className="font-bold border-b border-slate-100 pb-1 mb-1">Location: {marker.location}</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span className="text-slate-500">Risk Score:</span>
                                    <span className="text-right font-mono font-bold" style={{ color: getMarkerColor(marker.riskScore) }}>
                                        {marker.riskScore.toFixed(1)}
                                    </span>

                                    <span className="text-slate-500">Level:</span>
                                    <span className="text-right uppercase font-bold">{marker.riskLevel}</span>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LiveMapComponent;
