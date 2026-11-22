-- Detalle de una alerta SOS para la contacto destinataria.
CREATE OR REPLACE FUNCTION public.alerta_sos_recibida(p_id uuid)
  RETURNS TABLE (
    id uuid,
    nombre_usuaria text,
    correo_usuaria text,
    telefono_usuaria text,
    latitud double precision,
    longitud double precision,
    mensaje text,
    estado public.estado_alerta,
    creada_en timestamp with time zone,
    token_seguimiento uuid
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
AS $$
  SELECT a.id,
         p.nombre,
         p.correo,
         p.telefono,
         a.latitud,
         a.longitud,
         a.mensaje,
         a.estado,
         a.creada_en,
         s.token_seguimiento
  FROM public.alertas_sos a
  JOIN public.contactos_confianza c ON c.id = a.contacto_id
  JOIN public.perfiles p ON p.id = a.usuaria_id
  LEFT JOIN public.sesiones_acompanamiento s ON s.id = a.sesion_id
  WHERE auth.uid() IS NOT NULL
    AND a.id = p_id
    AND c.usuaria_id = auth.uid()
    AND c.activo
    AND a.estado IN ('enviada', 'vista')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.alerta_sos_recibida(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.alerta_sos_recibida(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.alerta_sos_recibida(uuid) TO authenticated;
