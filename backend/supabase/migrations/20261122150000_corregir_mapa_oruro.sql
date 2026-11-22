-- Corrección: las coordenadas anteriores estaban al norte de Oruro (cerca de Soracachi).
-- Ahora se usan puntos del centro urbano de Oruro reportados por prensa local.

UPDATE public.zonas_peligro SET
  nombre = 'Calle Brasil (Ayacucho–Junín)',
  descripcion = 'Robos de celulares a pasajeros de minibuses. Reportado por La Patria (2026).',
  latitud = -17.97000, longitud = -67.10730, radio_m = 260, indice_peligro = 5, tipo = 'alerta'
WHERE nombre = 'Río Huari Huari';

UPDATE public.zonas_peligro SET
  descripcion = 'Aglomeración y robos; refuerzo policial permanente.',
  latitud = -17.96769, longitud = -67.11636, radio_m = 320, indice_peligro = 3
WHERE nombre = 'Mercado Camacho';

UPDATE public.zonas_peligro SET
  descripcion = 'Nueva terminal de buses; robos y aglomeración.',
  latitud = -17.95098, longitud = -67.09673, radio_m = 380, indice_peligro = 4
WHERE nombre = 'Terminal de buses';

UPDATE public.zonas_peligro SET
  descripcion = 'Punto de referencia y encuentro; mantener precaución nocturna.',
  latitud = -17.96957, longitud = -67.11473, radio_m = 220, indice_peligro = 1
WHERE nombre = 'Plaza 10 de Febrero';

UPDATE public.zonas_peligro SET
  nombre = 'Mercado Campero',
  descripcion = 'Zona comercial con robos a estudiantes y transeúntes.',
  latitud = -17.97084, longitud = -67.11017, radio_m = 260, indice_peligro = 4, tipo = 'zona'
WHERE nombre = 'Avenida Circunvalación';

INSERT INTO public.zonas_peligro (nombre, descripcion, latitud, longitud, radio_m, indice_peligro, tipo)
SELECT 'Pasaje Bolívar–Sucre', 'Policía reporta mayor incidencia delictiva; pasaje poco iluminado.', -17.97130, -67.11180, 180, 5, 'alerta'
WHERE NOT EXISTS (SELECT 1 FROM public.zonas_peligro WHERE nombre = 'Pasaje Bolívar–Sucre');

UPDATE public.rutas_peligro SET
  nombre = 'Calle Brasil: Ayacucho → Junín',
  descripcion = 'Robos de celulares a minibuses en hora pico (La Patria, mayo 2026).',
  coordenadas = '[[-17.96919,-67.10869],[-17.97000,-67.10730],[-17.97096,-67.10583]]'::jsonb,
  indice_peligro = 5
WHERE nombre = 'Plaza → Río Huari Huari';

UPDATE public.rutas_peligro SET
  nombre = 'Calle Bolívar: Oruro → Camacho',
  descripcion = 'Tramo con asesinato y alta percepción de inseguridad (Radio Fides).',
  coordenadas = '[[-17.97078,-67.11209],[-17.97130,-67.11180],[-17.97000,-67.11400],[-17.96769,-67.11636]]'::jsonb,
  indice_peligro = 5
WHERE nombre = 'Terminal → Plaza 10 de Febrero';

UPDATE public.rutas_peligro SET
  nombre = 'Mercado Campero → Mercado Camacho',
  descripcion = 'Eje comercial con robos y arrebatos a transeúntes.',
  coordenadas = '[[-17.97084,-67.11017],[-17.96900,-67.11300],[-17.96769,-67.11636]]'::jsonb,
  indice_peligro = 4
WHERE nombre = 'Circunvalación norte';

INSERT INTO public.rutas_peligro (nombre, descripcion, coordenadas, indice_peligro)
SELECT 'Pasaje Bolívar–Sucre', 'Punto crítico señalado por la Policía de Oruro.', '[[-17.97078,-67.11209],[-17.97130,-67.11180],[-17.97184,-67.11147]]'::jsonb, 5
WHERE NOT EXISTS (SELECT 1 FROM public.rutas_peligro WHERE nombre = 'Pasaje Bolívar–Sucre');
