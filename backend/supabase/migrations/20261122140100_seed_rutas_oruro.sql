INSERT INTO public.rutas_peligro (nombre, descripcion, coordenadas, indice_peligro)
SELECT v.nombre, v.descripcion, v.coordenadas::jsonb, v.indice
FROM (VALUES
  ('Terminal → Plaza 10 de Febrero', 'Tramo con reportes de arrebatos, especialmente de noche.', '[[-17.7721,-67.1268],[-17.7760,-67.1290],[-17.7800,-67.1310],[-17.7835,-67.1320]]', 4),
  ('Plaza → Río Huari Huari', 'Zona con poca iluminación y riesgo de inundación.', '[[-17.7835,-67.1320],[-17.7865,-67.1350],[-17.7895,-67.1380]]', 5),
  ('Circunvalación norte', 'Tramo con obras y transporte pesado.', '[[-17.7895,-67.1380],[-17.7935,-67.1300],[-17.7970,-67.1210]]', 3)
) AS v(nombre, descripcion, coordenadas, indice)
WHERE NOT EXISTS (
  SELECT 1 FROM public.rutas_peligro r WHERE r.nombre = v.nombre
);
