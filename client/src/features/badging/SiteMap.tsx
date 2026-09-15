import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Props = { latitude: number | null; longitude: number | null; radius: number; disabled: boolean;
  onChange: (latitude: number, longitude: number) => void };

export default function SiteMap({ latitude, longitude, radius, disabled, onChange }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const circle = useRef<L.Circle | null>(null);
  const current = useRef({ disabled, onChange });
  current.current = { disabled, onChange };
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    const view = L.map(container.current!, { scrollWheelZoom: false }).setView([41.9, 12.5], 5);
    map.current = view;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, referrerPolicy: 'strict-origin-when-cross-origin',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).on('tileerror', () => setTileError(true)).on('tileload', () => setTileError(false)).addTo(view);
    view.on('click', (event: L.LeafletMouseEvent) => {
      if (!current.current.disabled) current.current.onChange(event.latlng.lat, event.latlng.lng);
    });
    const resize = new ResizeObserver(() => view.invalidateSize());
    resize.observe(container.current!);
    return () => { resize.disconnect(); view.remove(); map.current = null; marker.current = null; circle.current = null; };
  }, []);

  useEffect(() => {
    const view = map.current!;
    if (latitude === null || longitude === null) {
      marker.current?.remove(); marker.current = null;
      circle.current?.remove(); circle.current = null;
      return;
    }
    const point = L.latLng(latitude, longitude);
    if (!marker.current) {
      marker.current = L.marker(point, { draggable: true, title: 'Punto di timbratura: trascina per spostarlo',
        alt: 'Punto di timbratura', icon: L.divIcon({ className: 'badge-map-pin', html: '<span></span>', iconSize: [28, 36], iconAnchor: [14, 36] }),
      }).on('dragend', () => {
        const position = marker.current!.getLatLng();
        if (!current.current.disabled) current.current.onChange(position.lat, position.lng);
      }).addTo(view);
    } else marker.current.setLatLng(point);
    if (current.current.disabled) marker.current.dragging?.disable(); else marker.current.dragging?.enable();
    const meters = Number.isFinite(radius) && radius >= 20 && radius <= 5000 ? radius : 200;
    if (!circle.current) circle.current = L.circle(point, { radius: meters, color: '#23553d', weight: 2, fillOpacity: 0.12, interactive: false }).addTo(view);
    else circle.current.setLatLng(point).setRadius(meters);
    view.fitBounds(circle.current.getBounds(), { padding: [28, 28], maxZoom: 18, animate: false });
  }, [latitude, longitude, radius]);

  useEffect(() => {
    if (disabled) marker.current?.dragging?.disable(); else marker.current?.dragging?.enable();
  }, [disabled]);

  return <div>
    <div ref={container} className="badge-site-map" role="region" aria-label="Mappa del punto di timbratura" />
    {tileError && <p className="badge-help" role="status">La mappa non si carica. Puoi usare la ricerca indirizzi, il GPS o le coordinate qui sotto.</p>}
  </div>;
}
