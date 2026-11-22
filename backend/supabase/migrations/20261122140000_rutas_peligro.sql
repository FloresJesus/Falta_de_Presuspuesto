-- Rutas peligrosas de Oruro, visibles en el mapa público.
CREATE TABLE IF NOT EXISTS public.rutas_peligro (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  coordenadas jsonb NOT NULL,
  indice_peligro smallint NOT NULL DEFAULT 3,
  activo boolean NOT NULL DEFAULT true,
  creado_por uuid,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rutas_peligro_pkey PRIMARY KEY (id),
  CONSTRAINT rutas_nombre_longitud CHECK (char_length(btrim(nombre)) BETWEEN 2 AND 120),
  CONSTRAINT rutas_indice_rango CHECK (indice_peligro BETWEEN 1 AND 5),
  CONSTRAINT rutas_coordenadas_array CHECK (jsonb_typeof(coordenadas) = 'array'),
  CONSTRAINT rutas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_rutas_activas ON public.rutas_peligro (activo, indice_peligro DESC);

ALTER TABLE public.rutas_peligro ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.rutas_peligro FROM anon;
REVOKE ALL ON TABLE public.rutas_peligro FROM authenticated;
GRANT SELECT ON TABLE public.rutas_peligro TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.rutas_peligro TO authenticated;

CREATE POLICY rutas_lectura_publica ON public.rutas_peligro
  FOR SELECT TO anon, authenticated
  USING (activo);

CREATE POLICY rutas_admin_total ON public.rutas_peligro
  FOR ALL TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

COMMENT ON TABLE public.rutas_peligro IS 'Rutas o tramos peligrosos de Oruro para el mapa.';
