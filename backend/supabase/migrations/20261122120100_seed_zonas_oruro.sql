-- Datos iniciales de referencia en Oruro (se pueden editar desde la app por FELCC).
INSERT INTO public.zonas_peligro (nombre, descripcion, latitud, longitud, radio_m, indice_peligro, tipo)
SELECT v.nombre, v.descripcion, v.latitud, v.longitud, v.radio_m, v.indice_peligro, v.tipo
FROM (VALUES
  ('Terminal de buses', 'Zona de aglomeración y reportes de acoso nocturno', -17.7721, -67.1268, 450, 4, 'zona'),
  ('Mercado Camacho', 'Concentración de personas, revisar pertenencias', -17.7810, -67.1305, 350, 3, 'zona'),
  ('Río Huari Huari', 'Riesgo de inundación en época de lluvias', -17.7895, -67.1380, 700, 5, 'inundacion'),
  ('Plaza 10 de Febrero', 'Punto seguro de encuentro', -17.7835, -67.1320, 250, 1, 'zona'),
  ('Avenida Circunvalación', 'Obras y desvíos, poca iluminación', -17.7970, -67.1210, 600, 2, 'obras')
) AS v(nombre, descripcion, latitud, longitud, radio_m, indice_peligro, tipo)
WHERE NOT EXISTS (
  SELECT 1 FROM public.zonas_peligro z WHERE z.nombre = v.nombre
);
