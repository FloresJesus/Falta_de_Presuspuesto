import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface AlertaRecibida {
  id: string;
  nombre_usuaria: string;
  correo_usuaria: string | null;
  telefono_usuaria: string | null;
  latitud: number | null;
  longitud: number | null;
  mensaje: string;
  estado: 'enviada' | 'vista' | 'atendida' | 'cancelada';
  creada_en: string;
  token_seguimiento: string | null;
}

/** Alertas SOS que llegaron al contacto de confianza de la usuaria actual. */
export function useAlertasRecibidas() {
  const { user } = useAuth();
  const [alertas, setAlertas] = useState<AlertaRecibida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (silencioso = false) => {
    if (!user) {
      setAlertas([]);
      setLoading(false);
      return;
    }
    if (!silencioso) setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.rpc('alertas_recibidas');
    if (err) setError(err.message);
    else setAlertas((data ?? []) as AlertaRecibida[]);
    if (!silencioso) setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
    // Refresca el banner mientras la app está abierta.
    const timer = setInterval(() => void cargar(true), 5000);
    return () => clearInterval(timer);
  }, [cargar]);

  const descartar = useCallback(async (id: string) => {
    const { error: err } = await supabase.rpc('descartar_alerta_recibida', { p_alerta_id: id });
    if (err) return { error: err.message };
    await cargar();
    return { error: null };
  }, [cargar]);

  return { alertas, loading, error, cargar, descartar };
}
