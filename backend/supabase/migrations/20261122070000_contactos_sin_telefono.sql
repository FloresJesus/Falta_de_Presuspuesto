-- Corrección: permitir contactos y solicitudes cuando la usuaria solo tiene
-- correo registrado (no todas las cuentas tienen teléfono en perfiles).

-- El CHECK de contactos_confianza ya acepta NULL; solo quitamos el NOT NULL.
ALTER TABLE public.contactos_confianza ALTER COLUMN telefono DROP NOT NULL;

-- Enviar solicitud: el teléfono deja de ser obligatorio en cualquiera de los
-- dos lados. Si no se captura, se guarda NULL.
CREATE OR REPLACE FUNCTION public.enviar_solicitud_contacto(
  p_destinatario_id uuid,
  p_nombre text,
  p_telefono text,
  p_correo text,
  p_relacion text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
DECLARE
  v_solicitante    uuid := auth.uid();
  v_mi_nombre      text;
  v_mi_correo      text;
  v_mi_telefono    text;
  v_dest_nombre    text;
  v_dest_correo    text;
  v_dest_telefono  text;
  v_nombre_dest    text;
  v_correo_dest    text;
  v_telefono_dest  text;
  v_id             uuid;
BEGIN
  IF v_solicitante IS NULL THEN
    RAISE EXCEPTION 'No hay sesión activa.';
  END IF;
  IF p_destinatario_id = v_solicitante THEN
    RAISE EXCEPTION 'No puedes enviarte una solicitud a ti misma.';
  END IF;

  SELECT nombre, correo, telefono INTO v_mi_nombre, v_mi_correo, v_mi_telefono
  FROM public.perfiles WHERE id = v_solicitante;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No encontramos tu perfil.';
  END IF;

  SELECT nombre, correo, telefono INTO v_dest_nombre, v_dest_correo, v_dest_telefono
  FROM public.perfiles WHERE id = p_destinatario_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No encontramos a esa persona registrada.';
  END IF;

  v_nombre_dest   := COALESCE(NULLIF(btrim(p_nombre), ''), v_dest_nombre);
  v_correo_dest   := COALESCE(NULLIF(btrim(p_correo), ''), v_dest_correo);
  v_telefono_dest := NULLIF(btrim(COALESCE(p_telefono, '')), '');
  IF v_telefono_dest IS NULL THEN
    v_telefono_dest := NULLIF(btrim(COALESCE(v_dest_telefono, '')), '');
  END IF;

  IF length(btrim(v_nombre_dest)) < 2 OR length(btrim(v_nombre_dest)) > 80 THEN
    RAISE EXCEPTION 'El nombre debe tener entre 2 y 80 caracteres.';
  END IF;
  IF v_telefono_dest IS NOT NULL
     AND (length(public.normalizar_telefono(v_telefono_dest)) < 6
          OR length(btrim(v_telefono_dest)) > 25) THEN
    RAISE EXCEPTION 'Ingresa un teléfono válido (entre 6 y 25 caracteres).';
  END IF;
  IF v_correo_dest IS NOT NULL
     AND NOT (btrim(v_correo_dest) ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') THEN
    RAISE EXCEPTION 'El correo no tiene un formato válido.';
  END IF;
  IF v_correo_dest IS NULL AND v_telefono_dest IS NULL THEN
    RAISE EXCEPTION 'La persona necesita al menos un correo o teléfono.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.contactos_confianza
    WHERE usuaria_id = v_solicitante AND activo AND perfil_id = p_destinatario_id
  ) THEN
    RAISE EXCEPTION 'Esta persona ya es tu contacto.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.solicitudes_contacto
    WHERE estado = 'pendiente'
      AND (
        (solicitante_id = v_solicitante AND destinatario_id = p_destinatario_id)
        OR (solicitante_id = p_destinatario_id AND destinatario_id = v_solicitante)
      )
  ) THEN
    RAISE EXCEPTION 'Ya hay una solicitud pendiente con esta persona.';
  END IF;

  INSERT INTO public.solicitudes_contacto (
    solicitante_id, destinatario_id,
    nombre_solicitante, correo_solicitante, telefono_solicitante,
    nombre_destinatario, correo_destinatario, telefono_destinatario,
    relacion
  ) VALUES (
    v_solicitante, p_destinatario_id,
    COALESCE(NULLIF(btrim(v_mi_nombre), ''), 'Usuaria'),
    v_mi_correo,
    NULLIF(btrim(COALESCE(v_mi_telefono, '')), ''),
    v_nombre_dest, v_correo_dest, v_telefono_dest,
    NULLIF(btrim(p_relacion), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Aceptar: crea los contactos aunque alguno no tenga teléfono.
CREATE OR REPLACE FUNCTION public.responder_solicitud_contacto(
  p_solicitud_id uuid,
  p_aceptar boolean
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
DECLARE
  v public.solicitudes_contacto%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No hay sesión activa.';
  END IF;

  SELECT * INTO v FROM public.solicitudes_contacto WHERE id = p_solicitud_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'La solicitud ya no existe.';
  END IF;
  IF v.destinatario_id <> auth.uid() THEN
    RAISE EXCEPTION 'Esta solicitud no es para ti.';
  END IF;
  IF v.estado <> 'pendiente' THEN
    RAISE EXCEPTION 'Esta solicitud ya fue respondida.';
  END IF;

  IF p_aceptar THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.contactos_confianza
      WHERE usuaria_id = v.solicitante_id AND activo AND perfil_id = v.destinatario_id
    ) THEN
      INSERT INTO public.contactos_confianza (
        usuaria_id, perfil_id, nombre, telefono, correo, relacion, es_principal
      ) VALUES (
        v.solicitante_id, v.destinatario_id, v.nombre_destinatario,
        v.telefono_destinatario, v.correo_destinatario, v.relacion, false
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.contactos_confianza
      WHERE usuaria_id = v.destinatario_id AND activo AND perfil_id = v.solicitante_id
    ) THEN
      INSERT INTO public.contactos_confianza (
        usuaria_id, perfil_id, nombre, telefono, correo, relacion, es_principal
      ) VALUES (
        v.destinatario_id, v.solicitante_id, v.nombre_solicitante,
        v.telefono_solicitante, v.correo_solicitante, v.relacion, false
      );
    END IF;

    UPDATE public.solicitudes_contacto
    SET estado = 'aceptada', respondido_en = now()
    WHERE id = v.id;
  ELSE
    UPDATE public.solicitudes_contacto
    SET estado = 'rechazada', respondido_en = now()
    WHERE id = v.id;
  END IF;
END;
$$;
