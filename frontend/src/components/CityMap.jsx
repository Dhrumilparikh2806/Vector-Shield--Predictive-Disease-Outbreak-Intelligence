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
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-800 z-0 relative">
            <div className="absolute top-2 right-2 z-[400] bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                Live Satellite Feed
            </div>
            <MapContainer center={position} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='© OpenTopoMap contributors'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    maxZoom={17}
                />
                <TileLayer
                    attribution='© CARTO'
                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                />
                <RecenterMap lat={position[0]} lng={position[1]} />
                <CircleMarker
                    center={position}
                    radius={20}
                    pathOptions={{
                        color: '#3b82f6',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.4
                    }}
                >
                    <Popup className="bg-white border border-slate-200 text-slate-900">
                        <div className="font-bold">{cityName}</div>
                    </Popup>
                </CircleMarker>
            </MapContainer>
        </div>
    );
};

export default CityMap;
