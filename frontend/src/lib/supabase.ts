import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Debe ejecutarse antes del cliente para que existan en React Native.
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

export const SUPABASE_URL = 'https://jefskurnzxyvwdhsuvzb.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZnNrdXJuenh5dndkaHN1dnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNjkyNDcsImV4cCI6MjExMDg0NTI0N30.0ftwXyQe1mLtESCH8OZ4E8PSc4S1jJXz58LvQD_3vak';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const CATEGORIAS_INSTITUCION_LABEL: Record<string, string> = {
  legal: 'Legal',
  psicologica: 'Psicológica',
  salud: 'Salud',
  proteccion: 'Protección',
};

export const CATEGORIAS_INSTITUCION_ICON: Record<string, string> = {
  legal: 'scale',
  psicologica: 'heart',
  salud: 'medical',
  proteccion: 'shield',
};

export const CATEGORIAS_EDUCATIVAS_LABEL: Record<string, string> = {
  prevencion: 'Prevención',
  seguridad: 'Seguridad personal y digital',
  derechos: 'Derechos y marco legal',
  denuncia: 'Rutas de denuncia y apoyo',
  autocuidado: 'Autocuidado y bienestar',
};

export const ESTADOS_ALERTA_LABEL: Record<string, string> = {
  enviada: 'Enviada',
  vista: 'Vista',
  atendida: 'Atendida',
  cancelada: 'Cancelada',
};
