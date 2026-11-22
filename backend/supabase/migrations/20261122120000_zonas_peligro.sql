-- Mapa de zonas peligrosas de Oruro. FELCC (admin) gestiona los puntos;
-- cualquier usuaria puede consultarlos.

CREATE TABLE IF NOT EXISTS public.zonas_peligro (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  nombre         text        NOT NULL,
  descripcion    text,
  latitud        double precision NOT NULL,
  longitud       double precision NOT NULL,
  radio_m        integer     NOT NULL DEFAULT 300,
  indice_peligro smallint    NOT NULL DEFAULT 3,
  tipo           text        NOT NULL DEFAULT 'zona',
  activo         boolean     NOT NULL DEFAULT true,
  creado_por     uuid,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT zonas_peligro_pkey PRIMARY KEY (id),
  CONSTRAINT zonas_nombre_longitud CHECK (char_length(btrim(nombre)) BETWEEN 2 AND 120),
  CONSTRAINT zonas_latitud_rango CHECK (latitud BETWEEN -90 AND 90),
  CONSTRAINT zonas_longitud_rango CHECK (longitud BETWEEN -180 AND 180),
  CONSTRAINT zonas_radio_rango CHECK (radio_m BETWEEN 50 AND 10000),
  CONSTRAINT zonas_indice_rango CHECK (indice_peligro BETWEEN 1 AND 5),
  CONSTRAINT zonas_tipo_valido CHECK (tipo IN ('zona', 'alerta', 'inundacion', 'obras', 'otro')),
  CONSTRAINT zonas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_zonas_activas ON public.zonas_peligro (activo, indice_peligro DESC);

ALTER TABLE public.zonas_peligro ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.zonas_peligro FROM anon;
REVOKE ALL ON TABLE public.zonas_peligro FROM authenticated;
GRANT SELECT ON TABLE public.zonas_peligro TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.zonas_peligro TO authenticated;

CREATE POLICY zonas_lectura_publica ON public.zonas_peligro
  FOR SELECT TO anon, authenticated
  USING (activo);

CREATE POLICY zonas_admin_total ON public.zonas_peligro
  FOR ALL TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE OR REPLACE FUNCTION public.fn_zonas_actualizado_en()
  RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  new.actualizado_en := now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_zonas_actualizado_en ON public.zonas_peligro;
CREATE TRIGGER trg_zonas_actualizado_en
  BEFORE UPDATE ON public.zonas_peligro
  FOR EACH ROW EXECUTE FUNCTION public.fn_zonas_actualizado_en();

COMMENT ON TABLE public.zonas_peligro IS 'Zonas con índice de peligro en Oruro, gestionadas por FELCC.';
