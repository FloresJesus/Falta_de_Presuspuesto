-- La columna de alertas_sos se llama actualizada_en (femenino), pero el trigger
-- genérico intentaba asignar actualizado_en y hacía fallar cualquier UPDATE.
CREATE OR REPLACE FUNCTION public.fn_alerta_actualizada_en()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $$
BEGIN
  new.actualizada_en := now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_alertas_actualizado_en ON public.alertas_sos;
CREATE TRIGGER trg_alertas_actualizado_en
  BEFORE UPDATE ON public.alertas_sos
  FOR EACH ROW EXECUTE FUNCTION public.fn_alerta_actualizada_en();
