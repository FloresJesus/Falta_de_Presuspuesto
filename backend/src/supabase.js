const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const authOptions = {
  autoRefreshToken: false,
  persistSession: false,
};

// Cliente para el servidor: acceso total, NO expone esta instancia al cliente.
const supabaseService = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  authOptions
);

// Cliente anónimo: respeta las políticas de RLS de Supabase.
const supabaseAnon = createClient(config.supabase.url, config.supabase.anonKey, authOptions);

module.exports = { supabaseService, supabaseAnon };
