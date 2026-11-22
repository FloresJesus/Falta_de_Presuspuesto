import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import type { RutaPeligro, ZonaPeligro } from '@/lib/types';
import type { AlertaRecibida } from '@/hooks/useAlertasRecibidas';

type Centro = { latitude: number; longitude: number };

const MapaWebView = WebView as unknown as React.ComponentType<{
  ref?: React.Ref<WebView>;
  originWhitelist?: string[];
  source?: { html: string };
  style?: object;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  onLoadEnd?: () => void;
  onMessage?: (event: { nativeEvent: { data: string } }) => void;
}>;

export function MapaOSM({
  zonas,
  rutas,
  alertas,
  center,
  userLocation,
  onZonePress,
  onAlertaPress,
  onMapPress,
  webRef,
}: {
  zonas: ZonaPeligro[];
  rutas: RutaPeligro[];
  alertas: AlertaRecibida[];
  center: Centro;
  userLocation?: Centro | null;
  onZonePress: (z: ZonaPeligro) => void;
  onAlertaPress?: (a: AlertaRecibida) => void;
  onMapPress?: (lat: number, lng: number) => void;
  webRef?: React.RefObject<WebView | null>;
}) {
  const [inicial] = useState(center);
  const html = useMemo(() => buildHtml(zonas, rutas, alertas, inicial), [zonas, rutas, alertas, inicial]);

  function marcarMiUbicacion() {
    if (userLocation && webRef?.current) {
      webRef.current.injectJavaScript(
        `window.miUbicacion && window.miUbicacion(${userLocation.latitude}, ${userLocation.longitude}); true;`,
      );
    }
  }

  useEffect(() => {
    marcarMiUbicacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, webRef]);

  return (
    <MapaWebView
      ref={webRef}
      originWhitelist={['*']}
      source={{ html }}
      style={styles.web}
      javaScriptEnabled
      domStorageEnabled
      onLoadEnd={marcarMiUbicacion}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data) as { type: string; id?: string; lat?: number; lng?: number };
          if (data.type === 'zona' && data.id) {
            const z = zonas.find((item) => item.id === data.id);
            if (z) onZonePress(z);
          }
          if (data.type === 'alerta' && data.id) {
            const a = alertas.find((item) => item.id === data.id);
            if (a) onAlertaPress?.(a);
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

function buildHtml(zonas: ZonaPeligro[], rutas: RutaPeligro[], alertas: AlertaRecibida[], center: Centro) {
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
  const alertasDatos = alertas
    .filter((a) => a.latitud != null && a.longitud != null)
    .map((a) => ({
      id: a.id,
      nombre: esc(a.nombre_usuaria),
      mensaje: esc(a.mensaje),
      lat: a.latitud,
      lng: a.longitud,
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
const bounds = L.latLngBounds([]);
rutas.forEach(r => {
  r.puntos.forEach(p => bounds.extend(p));
  const color = colores[Math.max(0, Math.min(4, r.indice - 1))];
  L.polyline(r.puntos, { color, weight: 7, opacity: 0.85 }).addTo(map)
    .bindPopup('<b>' + r.nombre + '</b><br/>' + (r.descripcion || '') + '<br/>Riesgo ' + r.indice + '/5');
});

const alertas = ${JSON.stringify(alertasDatos)};
alertas.forEach(a => {
  bounds.extend([a.lat, a.lng]);
  const icon = L.divIcon({
    className: '',
    html: '<div style="width:44px;height:44px;border-radius:50%;background:#D8125A;border:4px solid white;color:white;font-weight:900;display:flex;align-items:center;justify-content:center;font-family:sans-serif;box-shadow:0 0 0 10px rgba(216,18,90,0.25)">SOS</div>',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
  L.marker([a.lat, a.lng], { icon, zIndexOffset: 1000 }).addTo(map)
    .bindPopup('<b>SOS de ' + a.nombre + '</b><br/>' + a.mensaje)
    .on('click', () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'alerta', id: a.id })));
});

zonas.forEach(z => {
  bounds.extend([z.lat, z.lng]);
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
if (bounds.isValid()) map.fitBounds(bounds.pad(0.18));

let yo = null;
window.miUbicacion = (lat, lng) => {
  if (yo) { yo.setLatLng([lat, lng]); }
  else {
    const icon = L.divIcon({ className: '', html: '<div style="width:22px;height:22px;border-radius:50%;background:#2F80ED;border:4px solid white;box-shadow:0 0 0 6px rgba(47,128,237,0.25)"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
    yo = L.marker([lat, lng], { icon }).addTo(map).bindPopup('Estás aquí');
  }
  bounds.extend([lat, lng]);
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.18));
};
window.moverMapa = (lat, lng) => { map.setView([lat, lng], 16); };
map.on('click', (e) => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapa', lat: e.latlng.lat, lng: e.latlng.lng })));
</script></body></html>`;
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#EDE0F4' },
});
