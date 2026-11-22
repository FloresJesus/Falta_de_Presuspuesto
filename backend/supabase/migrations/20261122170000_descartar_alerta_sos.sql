-- Permite a la contacto destinataria marcar una alerta SOS como atendida
-- y cerrar el acompañamiento asociado.
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
      AND c.usuaria_id = auth.uid()
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
