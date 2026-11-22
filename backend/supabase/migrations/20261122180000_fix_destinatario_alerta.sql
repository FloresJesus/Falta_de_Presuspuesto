-- El destinatario de una alerta SOS es el perfil vinculado al contacto
-- (contactos_confianza.perfil_id), NO la usuaria dueña de la fila
-- (contactos_confianza.usuaria_id).
--
-- Con usuaria_id, la alerta le aparecía a quien la enviaba y el contacto de
-- confianza real no la veía. Lo mismo pasaba al descartarla o al abrir su
-- detalle.

CREATE OR REPLACE FUNCTION public.alertas_recibidas()
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
    AND c.perfil_id = auth.uid()
    AND c.activo
    AND a.estado IN ('enviada', 'vista')
  ORDER BY a.creada_en DESC
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.alertas_recibidas() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.alertas_recibidas() FROM anon;
GRANT EXECUTE ON FUNCTION public.alertas_recibidas() TO authenticated;

COMMENT ON FUNCTION public.alertas_recibidas() IS
  'Alertas SOS dirigidas al perfil de contacto de la usuaria autenticada.';

-- Detalle de una alerta para la persona destinataria.
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
    AND c.perfil_id = auth.uid()
    AND c.activo
    AND a.estado IN ('enviada', 'vista')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.alerta_sos_recibida(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.alerta_sos_recibida(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.alerta_sos_recibida(uuid) TO authenticated;

-- Solo la persona destinataria puede marcar la alerta como atendida.
CREATE OR REPLACE FUNCTION public.descartar_alerta_recibida(p_alerta_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
DECLARE
  v_alerta public.alertas_sos%ROWTYPE;
  v_es_destino boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No hay sesión activa.';
  END IF;

  SELECT * INTO v_alerta FROM public.alertas_sos WHERE id = p_alerta_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'La alerta ya no existe.';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.contactos_confianza c
    WHERE c.id = v_alerta.contacto_id
      AND c.perfil_id = auth.uid()
      AND c.activo
  ) INTO v_es_destino;

  IF NOT v_es_destino THEN
    RAISE EXCEPTION 'Esta alerta no es para ti.';
  END IF;

  UPDATE public.alertas_sos
  SET estado = 'atendida'
  WHERE id = v_alerta.id;

  IF v_alerta.sesion_id IS NOT NULL THEN
    UPDATE public.sesiones_acompanamiento
    SET estado = 'finalizada',
        finalizada_en = now(),
        compartir_ubicacion = false
    WHERE id = v_alerta.sesion_id
      AND estado = 'activa';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.descartar_alerta_recibida(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.descartar_alerta_recibida(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.descartar_alerta_recibida(uuid) TO authenticated;
