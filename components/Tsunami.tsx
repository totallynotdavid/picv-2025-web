'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';

const TsunamiMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const rectangleRef = useRef<L.Rectangle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const coordsDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!mapRef.current) {
        mapRef.current = L.map('map').setView([0, 0], 2);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        mapRef.current.on('click', function(e) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;

          if (coordsDivRef.current) {
            coordsDivRef.current.textContent = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
          }

          if (rectangleRef.current) {
            mapRef.current?.removeLayer(rectangleRef.current);
          }
          if (markerRef.current) {
            mapRef.current?.removeLayer(markerRef.current);
          }

          markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!);

          const centerPoint = turf.point([lng, lat]);
          const options = {units: 'kilometers'};
          const rectangleBounds = turf.bbox(turf.buffer(centerPoint, 50, options));

          const leafletBounds = [
            [rectangleBounds[1], rectangleBounds[0]],
            [rectangleBounds[3], rectangleBounds[2]]
          ] as L.LatLngBoundsExpression;

          rectangleRef.current = L.rectangle(leafletBounds, {color: 'red', weight: 2})
            .addTo(mapRef.current!);

          mapRef.current?.setView([lat, lng], 8);
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[600px]">
      <div id="map" className="w-full h-full" />
      <div 
        ref={coordsDivRef}
        className="absolute bottom-2 left-2 z-[1000] bg-white p-2 rounded shadow"
      />
    </div>
  );
};

export default TsunamiMap;
