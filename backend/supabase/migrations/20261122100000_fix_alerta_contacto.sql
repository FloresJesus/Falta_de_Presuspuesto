-- El trigger de alertas SOS respetaba el contacto indicado por el llamador.
-- Antes siempre lo reemplazaba por el principal de la usuaria que envía,
-- por lo que el contacto destinatario nunca veía la alerta.

CREATE OR REPLACE FUNCTION public.fn_completar_alerta_sos()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $function$
DECLARE
  v_usuaria  uuid;
  v_contacto uuid;
BEGIN
  IF new.sesion_id IS NOT NULL THEN
    SELECT s.usuaria_id, s.contacto_id
      INTO v_usuaria, v_contacto
    FROM public.sesiones_acompanamiento s
    WHERE s.id = new.sesion_id;
  ELSE
    v_usuaria  := COALESCE(new.usuaria_id, auth.uid());
    v_contacto := new.contacto_id;
  END IF;

  IF v_usuaria IS NULL THEN
    RAISE EXCEPTION 'No se pudo identificar a la usuaria de la alerta'
      USING errcode = '23514';
  END IF;

  IF v_contacto IS NULL THEN
    SELECT c.id
      INTO v_contacto
    FROM public.contactos_confianza c
    WHERE c.usuaria_id = v_usuaria
      AND c.activo
    ORDER BY c.es_principal DESC, c.creado_en ASC
    LIMIT 1;
  END IF;

  new.usuaria_id  := v_usuaria;
  new.contacto_id := v_contacto;

  RETURN new;
END;
$function$;
