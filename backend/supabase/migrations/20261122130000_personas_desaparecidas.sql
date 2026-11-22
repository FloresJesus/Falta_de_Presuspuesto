-- Personas desaparecidas recientes (FELCC administra el contenido).

CREATE TABLE IF NOT EXISTS public.personas_desaparecidas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  edad integer,
  descripcion text,
  foto_url text,
  lugar text NOT NULL,
  latitud double precision,
  longitud double precision,
  fecha_desaparicion timestamptz NOT NULL DEFAULT now(),
  estado text NOT NULL DEFAULT 'desaparecida',
  contacto_familiar text,
  creado_por uuid,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT personas_desaparecidas_pkey PRIMARY KEY (id),
  CONSTRAINT personas_nombre_longitud CHECK (char_length(btrim(nombre)) BETWEEN 2 AND 120),
  CONSTRAINT personas_edad_rango CHECK (edad IS NULL OR (edad BETWEEN 0 AND 120)),
  CONSTRAINT personas_estado_valido CHECK (estado IN ('desaparecida', 'encontrada')),
  CONSTRAINT personas_lat_rango CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90),
  CONSTRAINT personas_lng_rango CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),
  CONSTRAINT personas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_desaparecidas_recientes
  ON public.personas_desaparecidas (estado, fecha_desaparicion DESC);

ALTER TABLE public.personas_desaparecidas ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.personas_desaparecidas FROM anon;
REVOKE ALL ON TABLE public.personas_desaparecidas FROM authenticated;
GRANT SELECT ON TABLE public.personas_desaparecidas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.personas_desaparecidas TO authenticated;

CREATE POLICY desaparecidas_lectura_publica ON public.personas_desaparecidas
  FOR SELECT TO anon, authenticated
  USING (estado = 'desaparecida');

CREATE POLICY desaparecidas_admin_total ON public.personas_desaparecidas
  FOR ALL TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE OR REPLACE FUNCTION public.fn_desaparecidas_actualizado_en()
  RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  new.actualizado_en := now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_desaparecidas_actualizado_en ON public.personas_desaparecidas;
CREATE TRIGGER trg_desaparecidas_actualizado_en
  BEFORE UPDATE ON public.personas_desaparecidas
  FOR EACH ROW EXECUTE FUNCTION public.fn_desaparecidas_actualizado_en();

COMMENT ON TABLE public.personas_desaparecidas IS 'Personas desaparecidas recientes, visibles en el carrusel de inicio.';
