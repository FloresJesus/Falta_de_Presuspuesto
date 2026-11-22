// Aviso push de una alerta SOS al contacto de confianza.
// El canal Android 'sos-alerts' se crea en la app con audio de alarma; en iOS
// se usa timeSensitive. Para sonar con No molestar en iOS hace falta además
// el entitlement de Critical Alerts de Apple (aprobación manual).

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const usuario = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: errorAuth,
    } = await usuario.auth.getUser(jwt);
    if (errorAuth || !user) {
      return json({ error: 'No autorizado' }, 401);
    }

    const { alertaId } = (await req.json()) as { alertaId?: string };
    if (!alertaId) return json({ error: 'Falta alertaId' }, 400);

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: alerta } = await admin
      .from('alertas_sos')
      .select('id, mensaje, estado, latitud, longitud, contacto_id, sesion_id, usuaria_id')
      .eq('id', alertaId)
      .maybeSingle();
    if (!alerta || alerta.estado !== 'enviada') return json({ error: 'Alerta no encontrada' }, 404);

    const { data: contacto } = await admin
      .from('contactos_confianza')
      .select('usuaria_id')
      .eq('id', alerta.contacto_id)
      .maybeSingle();
    if (!contacto) return json({ error: 'Contacto no encontrado' }, 404);

    const { data: destinatario } = await admin
      .from('perfiles')
      .select('nombre, push_token')
      .eq('id', contacto.usuaria_id)
      .maybeSingle();
    if (!destinatario?.push_token) return json({ enviado: false, motivo: 'sin push_token' });

    const { data: sesion } = await admin
      .from('sesiones_acompanamiento')
      .select('token_seguimiento')
      .eq('id', alerta.sesion_id)
      .maybeSingle();

    const { data: emisora } = await admin
      .from('perfiles')
      .select('nombre')
      .eq('id', alerta.usuaria_id)
      .maybeSingle();

    const nombre = emisora?.nombre ?? 'Una usuaria';
    const token = sesion?.token_seguimiento ?? null;

    const respuesta = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: destinatario.push_token,
        title: `🚨 Alerta SOS de ${nombre}`,
        body: `${alerta.mensaje}. Abre para ver su ubicación en vivo.`,
        sound: 'default',
        priority: 'high',
        channelId: 'sos-alerts',
        interruptionLevel: 'timeSensitive',
        data: { type: 'sos', alertaId: alerta.id, token },
      }),
    });

    const resultado = await respuesta.json();
    return json({ enviado: respuesta.ok, resultado });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Error inesperado' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
