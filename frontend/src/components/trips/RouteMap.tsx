import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { StopItem, TripItem } from '../../services/api/tripApi';
import MapIcon from '@mui/icons-material/Map';

declare global {
  interface Window {
    L: any;
  }
}

interface RouteMapProps {
  trip: TripItem;
}

const STOP_COLOR_MAP: Record<string, string> = {
  CURRENT: '#00796b',
  PICKUP: '#d97706',
  DROPOFF: '#dc2626',
  REST_BREAK: '#2563eb',
  REST: '#2563eb',
  SLEEP: '#4f46e5',
  SLEEPER: '#4f46e5',
  FUEL: '#ea580c',
  DRIVING: '#00796b',
};

const STOP_ICON_MAP: Record<string, string> = {
  CURRENT: 'S',
  PICKUP: 'P',
  DROPOFF: 'D',
  REST_BREAK: 'R',
  SLEEPER: 'B',
  FUEL: 'F',
};

export const RouteMap: React.FC<RouteMapProps> = React.memo(({ trip }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Destroy existing map instance
    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    const L = window.L;

    // Use stops_with_coords (real geocoded data) if available, otherwise fall back to stops
    const stopsSource: StopItem[] = trip.stops_with_coords || trip.stops || [];
    const waypoints: [number, number][] = [];

    // Initialize map
    const map = L.map(mapRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
    }).setView([39.8283, -98.5795], 4);
    leafletInstance.current = map;

    // OpenStreetMap Tile Layer (free, no API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Render markers for each stop
    stopsSource.forEach((stop, idx) => {
      const lat = stop.lat;
      const lng = stop.lng;

      // Skip stops without real coordinates
      if (!lat || !lng || (lat === 0 && lng === 0)) return;

      const coords: [number, number] = [lat, lng];
      waypoints.push(coords);

      const color = STOP_COLOR_MAP[stop.stop_type] || '#00796b';
      const emoji = STOP_ICON_MAP[stop.stop_type] || `${idx + 1}`;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 13px;
        ">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 6px; min-width: 180px;">
          <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px; font-weight: 700;">
            Stop #${stop.sequence}: ${stop.location}
          </h4>
          <div style="font-size: 12px; color: #475569; line-height: 1.6;">
            <strong>Type:</strong> ${stop.stop_type.replace('_', ' ')}<br/>
            <strong>Duration:</strong> ${stop.duration_hours} hrs<br/>
            <strong>Coords:</strong> ${lat.toFixed(4)}°, ${lng.toFixed(4)}°<br/>
            <em style="color: #64748b;">${stop.notes || ''}</em>
          </div>
        </div>
      `;

      L.marker(coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    // Draw route polyline
    if (waypoints.length > 1) {
      const polyline = L.polyline(waypoints, {
        color: '#00796b',
        weight: 4,
        opacity: 0.85,
        dashArray: '10, 6',
        lineCap: 'round',
      }).addTo(map);

      // Fit map bounds to show all markers
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [trip]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="bg-teal-100 text-teal-700 p-1.5 rounded-lg">
            <MapIcon fontSize="small" />
          </div>
          Interactive Trip Route Map
        </h3>
        <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200 font-semibold">
          Google Maps + OpenStreetMap
        </span>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-96 rounded-xl border border-slate-300 z-10 shadow-inner overflow-hidden"
      />

      {/* Stop Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
        {Object.entries(STOP_ICON_MAP).map(([type, emoji]) => (
          <span key={type} className="flex items-center gap-1">
            <span>{emoji}</span>
            <span className="font-medium">{type.replace('_', ' ')}</span>
          </span>
        ))}
      </div>
    </motion.div>
  );
});

RouteMap.displayName = 'RouteMap';
