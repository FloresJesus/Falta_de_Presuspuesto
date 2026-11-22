import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import type { RutaPeligro, ZonaPeligro } from '@/lib/types';

type Centro = { latitude: number; longitude: number };

const MapaWebView = WebView as unknown as React.ComponentType<{
  ref?: React.Ref<WebView>;
  originWhitelist?: string[];
  source?: { html: string };
  style?: object;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  onMessage?: (event: { nativeEvent: { data: string } }) => void;
}>;

export function MapaOSM({
  zonas,
  rutas,
  center,
  userLocation,
  onZonePress,
  onMapPress,
  webRef,
}: {
  zonas: ZonaPeligro[];
  rutas: RutaPeligro[];
  center: Centro;
  userLocation?: Centro | null;
  onZonePress: (z: ZonaPeligro) => void;
  onMapPress?: (lat: number, lng: number) => void;
  webRef?: React.RefObject<WebView | null>;
}) {
  const [inicial] = useState(center);
  const html = useMemo(() => buildHtml(zonas, rutas, inicial), [zonas, rutas, inicial]);

  useEffect(() => {
    if (userLocation && webRef?.current) {
      webRef.current.injectJavaScript(
        `window.miUbicacion && window.miUbicacion(${userLocation.latitude}, ${userLocation.longitude}); true;`,
      );
    }
  }, [userLocation, webRef]);

  return (
    <MapaWebView
      ref={webRef}
      originWhitelist={['*']}
      source={{ html }}
      style={styles.web}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data) as { type: string; id?: string; lat?: number; lng?: number };
          if (data.type === 'zona' && data.id) {
            const z = zonas.find((item) => item.id === data.id);
            if (z) onZonePress(z);
          }
          if (data.type === 'mapa' && data.lat != null && data.lng != null) {
            onMapPress?.(data.lat, data.lng);
          }
        } catch {
          // Ignora mensajes que no sean JSON.
        }
      }}
    />
  );
}

function esc(texto: string | null | undefined) {
  return (texto ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHtml(zonas: ZonaPeligro[], rutas: RutaPeligro[], center: Centro) {
  const datos = zonas.map((z) => ({
    id: z.id,
    nombre: esc(z.nombre),
    descripcion: esc(z.descripcion),
    lat: z.latitud,
    lng: z.longitud,
    radio: z.radio_m,
    indice: z.indice_peligro,
  }));
  const rutasDatos = rutas.map((r) => ({
    id: r.id,
    nombre: esc(r.nombre),
    descripcion: esc(r.descripcion),
    puntos: r.coordenadas,
    indice: r.indice_peligro,
  }));
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>html,body,#map{height:100%;margin:0}#map{background:#EDE0F4}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const zonas = ${JSON.stringify(datos)};
const colores = ['#2E9E5B','#D9A400','#E87A1F','#E23B3B','#8E1B2E'];
const map = L.map('map', { zoomControl: true }).setView([${center.latitude}, ${center.longitude}], 14);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);
const rutas = ${JSON.stringify(rutasDatos)};
rutas.forEach(r => {
  const color = colores[Math.max(0, Math.min(4, r.indice - 1))];
  L.polyline(r.puntos, { color, weight: 7, opacity: 0.85 }).addTo(map)
    .bindPopup('<b>' + r.nombre + '</b><br/>' + (r.descripcion || '') + '<br/>Riesgo ' + r.indice + '/5');
});

zonas.forEach(z => {
  const color = colores[Math.max(0, Math.min(4, z.indice - 1))];
  L.circle([z.lat, z.lng], { radius: z.radio, color, fillColor: color, fillOpacity: 0.15, weight: 2 }).addTo(map);
  const icon = L.divIcon({
    className: '',
    html: '<div style="width:34px;height:34px;border-radius:50%;background:' + color + ';border:3px solid white;color:white;font-weight:800;display:flex;align-items:center;justify-content:center;font-family:sans-serif">' + z.indice + '</div>',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
  L.marker([z.lat, z.lng], { icon }).addTo(map)
    .bindPopup('<b>' + z.nombre + '</b><br/>' + (z.descripcion || '') + '<br/>Riesgo ' + z.indice + '/5')
    .on('click', () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'zona', id: z.id })));
});
let yo = null;
window.miUbicacion = (lat, lng) => {
  if (yo) { yo.setLatLng([lat, lng]); }
  else {
    const icon = L.divIcon({ className: '', html: '<div style="width:22px;height:22px;border-radius:50%;background:#2F80ED;border:4px solid white;box-shadow:0 0 0 6px rgba(47,128,237,0.25)"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
    yo = L.marker([lat, lng], { icon }).addTo(map).bindPopup('Estás aquí');
  }
  map.setView([lat, lng], Math.max(map.getZoom(), 15));
};
window.moverMapa = (lat, lng) => { map.setView([lat, lng], 16); };
map.on('click', (e) => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapa', lat: e.latlng.lat, lng: e.latlng.lng })));
</script></body></html>`;
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#EDE0F4' },
});
