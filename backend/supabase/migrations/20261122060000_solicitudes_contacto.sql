-- Solicitudes de contacto entre usuarias registradas en LÍA.
--
-- Cambios respecto al autocompletado anterior:
--   * Las sugerencias ya NO se buscan por nombre, solo por correo o teléfono
--     exactos (evita enumerar perfiles).
--   * Elegir una sugerencia envía una solicitud; la otra usuaria la acepta o
--     rechaza desde la app. Al aceptar se crea el contacto en AMBAS cuentas.
--   * Contactos_confianza ahora puede vincularse al perfil de la otra usuaria.

-- Normaliza un teléfono a solo dígitos para comparar 55 1234 5678 = +525512345678.
CREATE OR REPLACE FUNCTION public.normalizar_telefono(p_telefono text)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  SET search_path = ''
AS $$
  SELECT regexp_replace(COALESCE(p_telefono, ''), '[^0-9]', '', 'g');
$$;

-- ---------------------------------------------------------------------------
-- Contactos vinculados a un perfil
-- ---------------------------------------------------------------------------
ALTER TABLE public.contactos_confianza
  ADD COLUMN IF NOT EXISTS perfil_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contactos_confianza_perfil_id_fkey'
  ) THEN
    ALTER TABLE public.contactos_confianza
      ADD CONSTRAINT contactos_confianza_perfil_id_fkey
      FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_contactos_perfil_activo
  ON public.contactos_confianza (usuaria_id, perfil_id)
  WHERE activo AND perfil_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Tabla de solicitudes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.solicitudes_contacto (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid(),
  solicitante_id      uuid        NOT NULL,
  destinatario_id     uuid        NOT NULL,
  nombre_solicitante  text        NOT NULL,
  correo_solicitante  text,
  telefono_solicitante text,
  nombre_destinatario text        NOT NULL,
  correo_destinatario text,
  telefono_destinatario text,
  relacion            text,
  estado              text        NOT NULL DEFAULT 'pendiente',
  creado_en           timestamptz NOT NULL DEFAULT now(),
  respondido_en       timestamptz,
  CONSTRAINT solicitudes_contacto_pkey PRIMARY KEY (id),
  CONSTRAINT solicitudes_contacto_no_mismo CHECK (solicitante_id <> destinatario_id),
  CONSTRAINT solicitudes_contacto_estado CHECK (
    estado IN ('pendiente', 'aceptada', 'rechazada', 'cancelada')
  ),
  CONSTRAINT solicitudes_contacto_solicitante_fkey
    FOREIGN KEY (solicitante_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
  CONSTRAINT solicitudes_contacto_destinatario_fkey
    FOREIGN KEY (destinatario_id) REFERENCES public.perfiles(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_solicitudes_pendientes
  ON public.solicitudes_contacto (solicitante_id, destinatario_id)
  WHERE estado = 'pendiente';

CREATE INDEX IF NOT EXISTS ix_solicitudes_destinatario
  ON public.solicitudes_contacto (destinatario_id, estado);

CREATE INDEX IF NOT EXISTS ix_solicitudes_solicitante
  ON public.solicitudes_contacto (solicitante_id, estado);

ALTER TABLE public.solicitudes_contacto ENABLE ROW LEVEL SECURITY;

-- Solo lectura y alta directa desde el cliente; los cambios de estado pasan
-- siempre por las funciones SECURITY DEFINER de abajo.
REVOKE ALL ON TABLE public.solicitudes_contacto FROM anon;
REVOKE ALL ON TABLE public.solicitudes_contacto FROM authenticated;
GRANT SELECT, INSERT ON TABLE public.solicitudes_contacto TO authenticated;

CREATE POLICY solicitudes_lectura_propia ON public.solicitudes_contacto
  FOR SELECT TO authenticated
  USING (
    solicitante_id = (SELECT auth.uid())
    OR destinatario_id = (SELECT auth.uid())
  );

CREATE POLICY solicitudes_alta_propia ON public.solicitudes_contacto
  FOR INSERT TO authenticated
  WITH CHECK (solicitante_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- Búsqueda de sugerencias: únicamente correo o teléfono exactos
-- ---------------------------------------------------------------------------
-- Se reemplaza la versión anterior de 1 argumento (buscaba por nombre).
DROP FUNCTION IF EXISTS public.buscar_personas(text);

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
    -- No sugerir a alguien que ya es contacto.
    AND NOT EXISTS (
      SELECT 1 FROM public.contactos_confianza c
      WHERE c.usuaria_id = auth.uid()
        AND c.activo
        AND (
          c.perfil_id = p.id
          OR (p.correo IS NOT NULL AND c.correo IS NOT NULL
              AND lower(btrim(c.correo)) = lower(btrim(p.correo)))
          OR (q.tipo = 'telefono'
              AND public.normalizar_telefono(c.telefono) = q.tel)
        )
    )
    -- No repetir una solicitud que ya está en camino (en ningún sentido).
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

REVOKE ALL ON FUNCTION public.buscar_personas(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.buscar_personas(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.buscar_personas(text, text) TO authenticated;

COMMENT ON FUNCTION public.buscar_personas(text, text) IS
  'Sugerencias de contactos solo por correo o teléfono exactos (nunca por nombre).';

-- ---------------------------------------------------------------------------
-- Enviar solicitud
-- ---------------------------------------------------------------------------
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

  SELECT nombre, telefono INTO v_mi_nombre, v_mi_telefono
  FROM public.perfiles WHERE id = v_solicitante;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No encontramos tu perfil.';
  END IF;
  IF v_mi_telefono IS NULL OR length(public.normalizar_telefono(v_mi_telefono)) < 6 THEN
    RAISE EXCEPTION 'Agrega tu teléfono en Ajustes antes de enviar una solicitud.';
  END IF;

  SELECT nombre, correo, telefono INTO v_dest_nombre, v_dest_correo, v_dest_telefono
  FROM public.perfiles WHERE id = p_destinatario_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No encontramos a esa persona registrada.';
  END IF;

  v_nombre_dest   := COALESCE(NULLIF(btrim(p_nombre), ''), v_dest_nombre);
  v_correo_dest   := COALESCE(NULLIF(btrim(p_correo), ''), v_dest_correo);
  v_telefono_dest := COALESCE(NULLIF(btrim(p_telefono), ''), v_dest_telefono);

  IF length(btrim(v_nombre_dest)) < 2 OR length(btrim(v_nombre_dest)) > 80 THEN
    RAISE EXCEPTION 'El nombre debe tener entre 2 y 80 caracteres.';
  END IF;
  IF v_telefono_dest IS NULL
     OR length(public.normalizar_telefono(v_telefono_dest)) < 6
     OR length(btrim(v_telefono_dest)) > 25 THEN
    RAISE EXCEPTION 'Ingresa un teléfono válido (entre 6 y 25 caracteres).';
  END IF;
  IF v_correo_dest IS NOT NULL
     AND NOT (btrim(v_correo_dest) ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') THEN
    RAISE EXCEPTION 'El correo no tiene un formato válido.';
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
    (SELECT correo FROM public.perfiles WHERE id = v_solicitante),
    v_mi_telefono,
    v_nombre_dest, v_correo_dest, v_telefono_dest,
    NULLIF(btrim(p_relacion), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Responder solicitud (aceptar/rechazar): solo la destinataria
-- ---------------------------------------------------------------------------
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
    IF v.telefono_solicitante IS NULL
       OR length(public.normalizar_telefono(v.telefono_solicitante)) < 6 THEN
      RAISE EXCEPTION 'La persona que te invitó no tiene teléfono registrado.';
    END IF;
    IF v.telefono_destinatario IS NULL
       OR length(public.normalizar_telefono(v.telefono_destinatario)) < 6 THEN
      RAISE EXCEPTION 'Falta el teléfono para guardar el contacto.';
    END IF;

    -- Contacto para quien envió la solicitud (con los datos que escribió).
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

    -- Contacto para quien aceptó (con los datos del perfil de la solicitante).
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

-- ---------------------------------------------------------------------------
-- Cancelar solicitud enviada: solo la solicitante, mientras esté pendiente
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancelar_solicitud_contacto(p_solicitud_id uuid)
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
  IF v.solicitante_id <> auth.uid() THEN
    RAISE EXCEPTION 'Solo quien envió la solicitud puede cancelarla.';
  END IF;
  IF v.estado <> 'pendiente' THEN
    RAISE EXCEPTION 'Esta solicitud ya no está pendiente.';
  END IF;

  UPDATE public.solicitudes_contacto
  SET estado = 'cancelada', respondido_en = now()
  WHERE id = v.id;
END;
$$;

REVOKE ALL ON FUNCTION public.enviar_solicitud_contacto(uuid, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enviar_solicitud_contacto(uuid, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.enviar_solicitud_contacto(uuid, text, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.responder_solicitud_contacto(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.responder_solicitud_contacto(uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.responder_solicitud_contacto(uuid, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.cancelar_solicitud_contacto(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancelar_solicitud_contacto(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.cancelar_solicitud_contacto(uuid) TO authenticated;

COMMENT ON TABLE public.solicitudes_contacto IS
  'Solicitudes para convertirse en contactos de confianza; el destino las acepta o rechaza.';
