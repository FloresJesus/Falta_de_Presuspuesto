-- Un contacto escrito a mano (perfil_id IS NULL) es solo un intento previo,
-- no confirma nada. No debe bloquear la solicitud ni ocultar a la persona.
-- Al aceptar, ese contacto manual se desactiva y queda el contacto vinculado.

CREATE OR REPLACE FUNCTION public.buscar_personas(p_query text, p_tipo text)
  RETURNS TABLE (id uuid, nombre text, correo text, telefono text)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
AS $$
  WITH q AS (
    SELECT btrim(COALESCE(p_query, '')) AS texto,
           lower(btrim(COALESCE(p_query, ''))) AS correo,
           public.normalizar_telefono(p_query) AS tel,
           p_tipo AS tipo
  )
  SELECT p.id, p.nombre, p.correo, p.telefono
  FROM public.perfiles p, q
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND (
      (q.tipo = 'correo'
        AND q.texto LIKE '%@%'
        AND p.correo IS NOT NULL
        AND lower(btrim(p.correo)) = q.correo)
      OR (q.tipo = 'telefono'
        AND length(q.tel) >= 6
        AND public.normalizar_telefono(p.telefono) = q.tel)
    )
    -- Solo se considera contacto definitivo el que ya está vinculado a un perfil.
    AND NOT EXISTS (
      SELECT 1 FROM public.contactos_confianza c
      WHERE c.usuaria_id = auth.uid()
        AND c.activo
        AND c.perfil_id = p.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.solicitudes_contacto s
      WHERE s.estado = 'pendiente'
        AND (
          (s.solicitante_id = auth.uid() AND s.destinatario_id = p.id)
          OR (s.solicitante_id = p.id AND s.destinatario_id = auth.uid())
        )
    )
  ORDER BY p.nombre
  LIMIT 5;
$$;

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

    -- El contacto que se había guardado a mano antes de la solicitud ya no
    -- aplica: se desactiva para no duplicar a la misma persona.
    UPDATE public.contactos_confianza
    SET activo = false
    WHERE usuaria_id = v.solicitante_id
      AND perfil_id IS NULL
      AND activo
      AND (
        (v.correo_destinatario IS NOT NULL AND correo IS NOT NULL
          AND lower(btrim(correo)) = lower(btrim(v.correo_destinatario)))
        OR (v.telefono_destinatario IS NOT NULL AND telefono IS NOT NULL
          AND public.normalizar_telefono(telefono)
              = public.normalizar_telefono(v.telefono_destinatario))
      );

    UPDATE public.contactos_confianza
    SET activo = false
    WHERE usuaria_id = v.destinatario_id
      AND perfil_id IS NULL
      AND activo
      AND (
        (v.correo_solicitante IS NOT NULL AND correo IS NOT NULL
          AND lower(btrim(correo)) = lower(btrim(v.correo_solicitante)))
        OR (v.telefono_solicitante IS NOT NULL AND telefono IS NOT NULL
          AND public.normalizar_telefono(telefono)
              = public.normalizar_telefono(v.telefono_solicitante))
      );

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
