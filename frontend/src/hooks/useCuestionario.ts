import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CuestionarioCompleto, ResultadoCuestionario } from '@/lib/types';

export function useCuestionario() {
  const [cuestionario, setCuestionario] = useState<CuestionarioCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCuestionario | null>(null);

  const cargar = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.rpc('obtener_cuestionario', {
      p_cuestionario_id: id,
    });
    if (err) {
      setError(err.message);
      setCuestionario(null);
      setLoading(false);
      return null;
    }
    const d = (data ?? null) as Record<string, unknown> | null;
    const preguntas = Array.isArray(d?.preguntas) ? (d?.preguntas as any[]) : [];
    const preguntasNormalizadas = preguntas.map((p: any) => ({
      id: String(p.id),
      cuestionario_id: id,
      enunciado: String(p.enunciado ?? ''),
      explicacion: p.explicacion ? String(p.explicacion) : null,
      orden: Number(p.orden ?? 0),
      opciones: Array.isArray(p.opciones) ? (p.opciones as any[]) : [],
    }));
    const nuevo: CuestionarioCompleto = {
      id: String(d?.id ?? id),
      contenido_id: (d?.contenido_id as string | null) ?? null,
      titulo: String(d?.titulo ?? 'Cuestionario'),
      descripcion: (d?.descripcion as string | null) ?? null,
      activo: true,
      creado_en: new Date().toISOString(),
      preguntas: preguntasNormalizadas,
    };
    setCuestionario(nuevo);
    setResultado(null);
    setLoading(false);
    return nuevo;
  }, []);

  const cargarPorContenido = useCallback(async (contenidoId: string) => {
    const { data, error: err } = await supabase
      .from('cuestionarios')
      .select('id')
      .eq('contenido_id', contenidoId)
      .eq('activo', true)
      .maybeSingle();
    if (err) {
      setError(err.message);
      return null;
    }
    const d = data as { id: string } | null;
    if (!d) {
      setCuestionario(null);
      setLoading(false);
      return null;
    }
    const cargado = await cargar(String(d.id));
    return cargado;
  }, [cargar]);

  const responder = useCallback(async (id: string, respuestas: { pregunta_id: string; opcion_id: string }[]) => {
    setSubmitting(true);
    const { data, error } = await supabase.rpc('responder_cuestionario', {
      p_cuestionario_id: id,
      p_respuestas: respuestas,
    });
    setSubmitting(false);
    if (error) return { error: error.message };
    const d = (data ?? null) as Record<string, unknown> | null;
    const res: ResultadoCuestionario = {
      intento_id: String(d?.intento_id ?? ''),
      puntaje: Number(d?.puntaje ?? 0),
      total: Number(d?.total ?? 0),
      porcentaje: Number(d?.porcentaje ?? 0),
      detalle: Array.isArray(d?.detalle) ? (d?.detalle as ResultadoCuestionario['detalle']) : [],
    };
    setResultado(res);
    return { data: res };
  }, []);

  return { cuestionario, loading, error, responder, resultado, setResultado, setCuestionario, cargarPorContenido };
}
