import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 10);
    }, [lat, lng, map]);
    return null;
}

const CityMap = ({ lat, lng, cityName }) => {
    const position = [lat || 20.5937, lng || 78.9629];

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-[#E2E8F0] z-0 relative">
            <div className="absolute top-2 right-2 z-[400] bg-[#0F172A]/85 px-2 py-1 rounded app-mono text-[11px] text-white">
                Sector Telemetry Map
            </div>
            <MapContainer center={position} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                {/* OpenStreetMap: standard basemap, standardized across all app maps */}
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap lat={position[0]} lng={position[1]} />
                <CircleMarker
                    center={position}
                    radius={16}
                    pathOptions={{
                        color: '#159A7E',
                        fillColor: '#159A7E',
                        fillOpacity: 0.35
                    }}
                >
                    <Popup className="bg-white border border-[#E2E8F0] text-[#0F172A]">
                        <div className="font-bold">{cityName}</div>
                    </Popup>
                </CircleMarker>
            </MapContainer>
        </div>
    );
};

export default CityMap;
