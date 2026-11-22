-- Soporte para la alerta SOS: token de notificaciones por dispositivo y
-- lectura de las alertas enviadas al contacto de confianza.

ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS push_token text;

-- Lausuaria puede guardar/actualizar su propio token de Expo Push.
GRANT UPDATE (push_token) ON TABLE public.perfiles TO authenticated;

CREATE INDEX IF NOT EXISTS ix_perfiles_push_token
  ON public.perfiles (push_token)
  WHERE push_token IS NOT NULL;

-- El contacto de confianza necesita ver la alerta aunque sus filas de
-- alertas_sos pertenezcan a otra usuaria (RLS no se lo permitiría).
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
    AND c.usuaria_id = auth.uid()
    AND c.activo
    AND a.estado IN ('enviada', 'vista')
  ORDER BY a.creada_en DESC
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.alertas_recibidas() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.alertas_recibidas() FROM anon;
GRANT EXECUTE ON FUNCTION public.alertas_recibidas() TO authenticated;

COMMENT ON FUNCTION public.alertas_recibidas() IS
  'Alertas SOS dirigidas al contacto de confianza de la usuaria autenticada.';
