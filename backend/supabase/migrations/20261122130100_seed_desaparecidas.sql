-- Ejemplos de referencia para el carrusel (reemplazables por FELCC).
INSERT INTO public.personas_desaparecidas (
  nombre, edad, descripcion, foto_url, lugar, latitud, longitud, fecha_desaparicion, contacto_familiar
)
SELECT v.nombre, v.edad, v.descripcion, v.foto_url, v.lugar, v.latitud, v.longitud, now() - (v.dias || ' days')::interval, v.contacto
FROM (VALUES
  ('Camila Rojas', 19, 'Vista por última vez con pollera azul y chaqueta blanca.', 'https://randomuser.me/api/portraits/women/44.jpg', 'Oruro · Mercado Camacho', -17.7810, -67.1305, 2, 'Familia: 70123456'),
  ('Julián Pérez', 27, 'Usa lentes y mochila negra. Fue visto cerca de la terminal.', 'https://randomuser.me/api/portraits/men/32.jpg', 'Oruro · Terminal de buses', -17.7721, -67.1268, 5, 'Familia: 71234567'),
  ('Daysi Mamani', 16, 'Salieron de la unidad educativa y no regresó a casa.', 'https://randomuser.me/api/portraits/women/68.jpg', 'Oruro · Zona La Florida', -17.7901, -67.1280, 7, 'Familia: 72345678')
) AS v(nombre, edad, descripcion, foto_url, lugar, latitud, longitud, dias, contacto)
WHERE NOT EXISTS (
  SELECT 1 FROM public.personas_desaparecidas p WHERE p.nombre = v.nombre
);
