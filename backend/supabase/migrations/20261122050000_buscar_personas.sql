-- NOTA: esta migración queda reemplazada por 20261122060000_solicitudes_contacto.sql,
-- que elimina la búsqueda por nombre y agrega el flujo de solicitudes.
--
-- Autocompletado de contactos: permite buscar personas ya registradas en LÍA
-- por nombre o correo. Solo devuelve los datos mínimos para llenar el contacto.
--
-- Nota de privacidad: cualquier usuaria autenticada puede buscar por nombre y
-- ver el correo de las personas registradas, tal como se pidió para el
-- autocompletado. La búsqueda por correo solo se activa cuando el texto
-- incluye "@" (para no enumerar correos por dominio).

CREATE OR REPLACE FUNCTION public.buscar_personas(p_query text)
  RETURNS TABLE (
    id       uuid,
    nombre   text,
    correo   text,
    telefono text
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
AS $$
  WITH q AS (
    SELECT btrim(COALESCE(p_query, '')) AS texto
  )
  SELECT p.id, p.nombre, p.correo, p.telefono
  FROM public.perfiles p, q
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND char_length(q.texto) >= 2
    AND (
      p.nombre ILIKE '%' || q.texto || '%'
      OR (q.texto LIKE '%@%' AND COALESCE(p.correo, '') ILIKE '%' || q.texto || '%')
    )
  ORDER BY
    CASE WHEN p.nombre ILIKE q.texto || '%' THEN 0 ELSE 1 END,
    p.nombre
  LIMIT 5;
$$;

REVOKE ALL ON FUNCTION public.buscar_personas(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.buscar_personas(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.buscar_personas(text) TO authenticated;

COMMENT ON FUNCTION public.buscar_personas(text) IS
  'Sugerencias de personas registradas para autocompletar contactos (nombre o correo).';
