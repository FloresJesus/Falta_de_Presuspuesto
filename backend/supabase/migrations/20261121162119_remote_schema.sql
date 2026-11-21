SET local check_function_bodies = off;

CREATE TABLE "public"."alertas_sos" (
  "id"          uuid             NOT NULL DEFAULT gen_random_uuid(),
  "usuaria_id"  uuid             NOT NULL,
  "sesion_id"   uuid,
  "contacto_id" uuid,
  "latitud"     double precision,
  "longitud"    double precision,
  "mensaje"     text             NOT NULL DEFAULT 'Alerta SOS de prueba enviada desde LÍA'::text,
  CONSTRAINT "alertas_latitud_valida" CHECK (((latitud IS NULL) OR ((latitud >= ('-90'::integer)::double precision) AND (latitud <= (90)::double precision)))),
  CONSTRAINT "alertas_longitud_valida" CHECK (((longitud IS NULL) OR ((longitud >= ('-180'::integer)::double precision) AND (longitud <= (180)::double precision)))),
  CONSTRAINT "alertas_sos_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."alertas_sos"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."alertas_sos" FROM "anon";

CREATE TABLE "public"."categorias_educativas" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "slug"        text                     NOT NULL,
  "nombre"      text                     NOT NULL,
  "descripcion" text,
  "icono"       text,
  "orden"       integer                  NOT NULL DEFAULT 0,
  "activo"      boolean                  NOT NULL DEFAULT true,
  "creado_en"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "categorias_educativas_pkey" PRIMARY KEY (id),
  CONSTRAINT "categorias_educativas_slug_key" UNIQUE (slug),
  CONSTRAINT "categorias_slug_formato" CHECK ((slug ~ '^[a-z0-9-]+$'::text))
);

ALTER TABLE "public"."categorias_educativas"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."contactos_confianza" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "usuaria_id"     uuid                     NOT NULL,
  "nombre"         text                     NOT NULL,
  "telefono"       text                     NOT NULL,
  "correo"         text,
  "relacion"       text,
  "es_principal"   boolean                  NOT NULL DEFAULT false,
  "activo"         boolean                  NOT NULL DEFAULT true,
  "creado_en"      timestamp with time zone NOT NULL DEFAULT now(),
  "actualizado_en" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "contactos_confianza_pkey" PRIMARY KEY (id),
  CONSTRAINT "contactos_correo_formato" CHECK (((correo IS NULL) OR (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text))),
  CONSTRAINT "contactos_nombre_longitud" CHECK (((char_length(btrim(nombre)) >= 2) AND (char_length(btrim(nombre)) <= 80))),
  CONSTRAINT "contactos_telefono_longitud" CHECK (((char_length(btrim(telefono)) >= 6) AND (char_length(btrim(telefono)) <= 25)))
);

ALTER TABLE "public"."contactos_confianza"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."contactos_confianza" FROM "anon";

CREATE TABLE "public"."contenidos_educativos" (
  "id"           uuid NOT NULL DEFAULT gen_random_uuid(),
  "categoria_id" uuid NOT NULL,
  "titulo"       text NOT NULL,
  "resumen"      text NOT NULL,
  "cuerpo"       text NOT NULL,
  CONSTRAINT "contenidos_educativos_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."contenidos_educativos"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."conversaciones_asistente" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "usuaria_id"     uuid                     NOT NULL,
  "titulo"         text,
  "creada_en"      timestamp with time zone NOT NULL DEFAULT now(),
  "actualizada_en" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "conversaciones_asistente_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."conversaciones_asistente"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."conversaciones_asistente" FROM "anon";

CREATE TABLE "public"."cuestionarios" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "contenido_id" uuid,
  "titulo"       text                     NOT NULL,
  "descripcion"  text,
  "activo"       boolean                  NOT NULL DEFAULT true,
  "creado_en"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cuestionarios_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cuestionarios"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."instituciones" (
  "id"          uuid NOT NULL DEFAULT gen_random_uuid(),
  "nombre"      text NOT NULL,
  "descripcion" text NOT NULL,
  CONSTRAINT "instituciones_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."instituciones"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."intentos_cuestionario" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "usuaria_id"      uuid                     NOT NULL,
  "cuestionario_id" uuid                     NOT NULL,
  "puntaje"         integer                  NOT NULL DEFAULT 0,
  "total_preguntas" integer                  NOT NULL DEFAULT 0,
  "completado_en"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "intentos_cuestionario_pkey" PRIMARY KEY (id),
  CONSTRAINT "intentos_puntaje_valido" CHECK ((puntaje >= 0)),
  CONSTRAINT "intentos_total_valido" CHECK ((total_preguntas >= 0))
);

ALTER TABLE "public"."intentos_cuestionario"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."intentos_cuestionario" FROM "anon";

CREATE TABLE "public"."mensajes_asistente" (
  "id"              uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversacion_id" uuid NOT NULL,
  CONSTRAINT "mensajes_asistente_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."mensajes_asistente"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."mensajes_asistente" FROM "anon";

CREATE TABLE "public"."opciones_respuesta" (
  "id"          uuid    NOT NULL DEFAULT gen_random_uuid(),
  "pregunta_id" uuid    NOT NULL,
  "texto"       text    NOT NULL,
  "es_correcta" boolean NOT NULL DEFAULT false,
  "orden"       integer NOT NULL DEFAULT 0,
  CONSTRAINT "opciones_respuesta_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."opciones_respuesta"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."perfiles" (
  "id"       uuid NOT NULL,
  "nombre"   text NOT NULL,
  "correo"   text,
  "telefono" text,
  CONSTRAINT "perfiles_nombre_longitud" CHECK (((char_length(btrim(nombre)) >= 2) AND (char_length(btrim(nombre)) <= 80))),
  CONSTRAINT "perfiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "perfiles_telefono_longitud" CHECK (((telefono IS NULL) OR ((char_length(btrim(telefono)) >= 6) AND (char_length(btrim(telefono)) <= 25))))
);

ALTER TABLE "public"."perfiles"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."perfiles" FROM "anon";

CREATE TABLE "public"."preguntas" (
  "id"              uuid    NOT NULL DEFAULT gen_random_uuid(),
  "cuestionario_id" uuid    NOT NULL,
  "enunciado"       text    NOT NULL,
  "explicacion"     text,
  "orden"           integer NOT NULL DEFAULT 0,
  CONSTRAINT "preguntas_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."preguntas"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."respuestas_intento" (
  "id"          bigint  GENERATED ALWAYS AS IDENTITY NOT NULL,
  "intento_id"  uuid    NOT NULL,
  "pregunta_id" uuid    NOT NULL,
  "opcion_id"   uuid    NOT NULL,
  "es_correcta" boolean NOT NULL,
  CONSTRAINT "respuestas_intento_intento_id_pregunta_id_key" UNIQUE (intento_id, pregunta_id),
  CONSTRAINT "respuestas_intento_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."respuestas_intento"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."respuestas_intento" FROM "anon";

CREATE TABLE "public"."sesiones_acompanamiento" (
  "id"          uuid NOT NULL DEFAULT gen_random_uuid(),
  "usuaria_id"  uuid NOT NULL,
  "contacto_id" uuid NOT NULL,
  CONSTRAINT "sesiones_acompanamiento_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."sesiones_acompanamiento"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."sesiones_acompanamiento" FROM "anon";

CREATE TABLE "public"."ubicaciones" (
  "id"            bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "sesion_id"     uuid                     NOT NULL,
  "usuaria_id"    uuid                     NOT NULL,
  "latitud"       double precision         NOT NULL,
  "longitud"      double precision         NOT NULL,
  "precision_m"   double precision,
  "registrada_en" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ubicaciones_latitud_valida" CHECK (((latitud >= ('-90'::integer)::double precision) AND (latitud <= (90)::double precision))),
  CONSTRAINT "ubicaciones_longitud_valida" CHECK (((longitud >= ('-180'::integer)::double precision) AND (longitud <= (180)::double precision))),
  CONSTRAINT "ubicaciones_pkey" PRIMARY KEY (id),
  CONSTRAINT "ubicaciones_precision_valida" CHECK (((precision_m IS NULL) OR ((precision_m >= (0)::double precision) AND (precision_m <= (100000)::double precision))))
);

ALTER TABLE "public"."ubicaciones"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."ubicaciones" FROM "anon";

REVOKE ALL ON SEQUENCE "public"."respuestas_intento_id_seq" FROM "anon";

REVOKE ALL ON SEQUENCE "public"."ubicaciones_id_seq" FROM "anon";

CREATE TYPE "public"."autor_mensaje" AS ENUM (
  'usuaria',
  'asistente'
);

ALTER TABLE "public"."mensajes_asistente"
  ADD COLUMN "autor" public.autor_mensaje NOT NULL;

ALTER TABLE "public"."mensajes_asistente"
  ADD COLUMN "contenido" text NOT NULL;

ALTER TABLE "public"."mensajes_asistente"
  ADD COLUMN "creada_en" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."categoria_institucion" AS ENUM (
  'legal',
  'psicologica',
  'salud',
  'proteccion'
);

ALTER TABLE "public"."instituciones"
  ADD COLUMN "categoria" public.categoria_institucion NOT NULL;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "alcance" text;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "ciudad" text;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "direccion" text;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "telefono" text;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "correo" text;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "sitio_web" text;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "horario" text;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "latitud" double precision;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "longitud" double precision;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "verificado" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "fecha_revision" date;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "activo" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "orden" integer NOT NULL DEFAULT 0;

ALTER TABLE "public"."instituciones"
  ADD COLUMN "creado_en" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."instituciones"
  ADD COLUMN "actualizado_en" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."estado_alerta" AS ENUM (
  'enviada',
  'vista',
  'atendida',
  'cancelada'
);

ALTER TABLE "public"."alertas_sos"
  ADD COLUMN "estado" public.estado_alerta NOT NULL DEFAULT 'enviada'::public.estado_alerta;

ALTER TABLE "public"."alertas_sos"
  ADD COLUMN "es_simulacion" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."alertas_sos"
  ADD COLUMN "creada_en" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."alertas_sos"
  ADD COLUMN "actualizada_en" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."estado_sesion" AS ENUM (
  'activa',
  'finalizada',
  'cancelada'
);

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD COLUMN "estado" public.estado_sesion NOT NULL DEFAULT 'activa'::public.estado_sesion;

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD COLUMN "compartir_ubicacion" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD COLUMN "token_seguimiento" uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD COLUMN "destino" text;

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD COLUMN "iniciada_en" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD COLUMN "finalizada_en" timestamp WITH time zone;

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD COLUMN "creado_en" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD COLUMN "actualizado_en" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."rol_usuario" AS ENUM (
  'usuaria',
  'admin'
);

ALTER TABLE "public"."perfiles"
  ADD COLUMN "rol" public.rol_usuario NOT NULL DEFAULT 'usuaria'::public.rol_usuario;

ALTER TABLE "public"."perfiles"
  ADD COLUMN "creado_en" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."perfiles"
  ADD COLUMN "actualizado_en" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."tipo_contenido" AS ENUM (
  'articulo',
  'infografia',
  'video'
);

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "tipo" public.tipo_contenido NOT NULL DEFAULT 'articulo'::public.tipo_contenido;

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "url_imagen" text;

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "fuente" text;

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "url_fuente" text;

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "tiempo_lectura_min" integer;

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "publicado" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "orden" integer NOT NULL DEFAULT 0;

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "fecha_revision" date;

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "creado_en" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."contenidos_educativos"
  ADD COLUMN "actualizado_en" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.alertar_sos (
  p_sesion_id uuid             DEFAULT NULL::uuid,
  p_latitud   double precision DEFAULT NULL::double precision,
  p_longitud  double precision DEFAULT NULL::double precision,
  p_mensaje   text             DEFAULT NULL::text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_usuaria uuid := (select auth.uid());
  v_contacto public.contactos_confianza;
  v_alerta public.alertas_sos;
begin
  if v_usuaria is null then
    raise exception 'Debes iniciar sesión para enviar una alerta SOS'
      using errcode = '28000';
  end if;

  if p_sesion_id is not null then
    select c.*
    into v_contacto
    from public.sesiones_acompanamiento s
    join public.contactos_confianza c on c.id = s.contacto_id
    where s.id = p_sesion_id
      and s.usuaria_id = v_usuaria;

    if v_contacto.id is null then
      raise exception 'La sesión no existe o no pertenece a la usuaria.'
        using errcode = '42501';
    end if;
  else
    select c.*
    into v_contacto
    from public.contactos_confianza c
    where c.usuaria_id = v_usuaria
      and c.activo
    order by c.es_principal desc, c.creado_en asc
    limit 1;
  end if;

  if v_contacto.id is null then
    raise exception 'No tienes un contacto de confianza activo. Registra uno antes de enviar una alerta SOS.'
      using errcode = 'P0002';
  end if;

  insert into public.alertas_sos (
    usuaria_id,
    sesion_id,
    contacto_id,
    latitud,
    longitud,
    mensaje
  )
  values (
    v_usuaria,
    p_sesion_id,
    v_contacto.id,
    p_latitud,
    p_longitud,
    coalesce(
      nullif(btrim(p_mensaje), ''),
      'Alerta SOS de prueba enviada desde LÍA'
    )
  )
  returning * into v_alerta;

  return jsonb_build_object(
    'alerta_id', v_alerta.id,
    'estado', v_alerta.estado,
    'es_simulacion', v_alerta.es_simulacion,
    'creada_en', v_alerta.creada_en,
    'mensaje', v_alerta.mensaje,
    'contacto', jsonb_build_object(
      'nombre', v_contacto.nombre,
      'telefono', v_contacto.telefono,
      'correo', v_contacto.correo
    )
  );
end;
$function$;

REVOKE ALL ON FUNCTION "public"."alertar_sos"(uuid, double precision, double precision, text) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.es_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.perfiles p
    where p.id = (select auth.uid())
      and p.rol = 'admin'
  );
$function$;

REVOKE ALL ON FUNCTION "public"."es_admin"() FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.finalizar_acompanamiento (
  p_sesion_id uuid
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_usuaria uuid := (select auth.uid());
  v_sesion public.sesiones_acompanamiento;
begin
  if v_usuaria is null then
    raise exception 'Debes iniciar sesión para finalizar un acompañamiento'
      using errcode = '28000';
  end if;

  update public.sesiones_acompanamiento
  set
    estado = 'finalizada',
    finalizada_en = now(),
    compartir_ubicacion = false
  where id = p_sesion_id
    and usuaria_id = v_usuaria
    and estado = 'activa'
  returning * into v_sesion;

  if v_sesion.id is null then
    raise exception 'No se encontró un acompañamiento activo con ese identificador.'
      using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'sesion_id', v_sesion.id,
    'estado', v_sesion.estado,
    'finalizada_en', v_sesion.finalizada_en,
    'compartir_ubicacion', v_sesion.compartir_ubicacion
  );
end;
$function$;

REVOKE ALL ON FUNCTION "public"."finalizar_acompanamiento"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.fn_completar_alerta_sos()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_usuaria uuid;
  v_contacto uuid;
begin
  if new.sesion_id is not null then
    select s.usuaria_id, s.contacto_id
    into v_usuaria, v_contacto
    from public.sesiones_acompanamiento s
    where s.id = new.sesion_id;
  else
    v_usuaria := coalesce(new.usuaria_id, auth.uid());
  end if;

  if v_usuaria is null then
    raise exception 'No se pudo identificar a la usuaria de la alerta'
      using errcode = '23514';
  end if;

  if v_contacto is null then
    select c.id
    into v_contacto
    from public.contactos_confianza c
    where c.usuaria_id = v_usuaria
      and c.activo
    order by c.es_principal desc, c.creado_en asc
    limit 1;
  end if;

  new.usuaria_id := v_usuaria;
  new.contacto_id := v_contacto;

  return new;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."fn_completar_alerta_sos"() FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.fn_crear_perfil_al_registrar()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_nombre text;
begin
  v_nombre := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'nombre', '')), '');

  if v_nombre is null or char_length(v_nombre) < 2 then
    v_nombre := 'Usuaria';
  end if;

  insert into public.perfiles (id, nombre, correo)
  values (new.id, left(v_nombre, 80), new.email)
  on conflict (id) do nothing;

  return new;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."fn_crear_perfil_al_registrar"() FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.fn_heredar_duena_ubicacion()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  select s.usuaria_id
  into new.usuaria_id
  from public.sesiones_acompanamiento s
  where s.id = new.sesion_id
    and s.estado = 'activa';

  if new.usuaria_id is null then
    raise exception 'La sesión no existe o no está activa'
      using errcode = '23514';
  end if;

  return new;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."fn_heredar_duena_ubicacion"() FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.fn_marca_tiempo_actualizacion()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.actualizado_en := now();
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."fn_marca_tiempo_actualizacion"() FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.fn_validar_sesion()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if not exists (
    select 1
    from public.contactos_confianza c
    where c.id = new.contacto_id
      and c.usuaria_id = new.usuaria_id
      and c.activo
  ) then
    raise exception 'El contacto de confianza no pertenece a la usuaria o está inactivo'
      using errcode = '23514';
  end if;

  if new.estado = 'activa' then
    new.finalizada_en := null;
  elsif new.finalizada_en is null then
    new.finalizada_en := now();
  end if;

  return new;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."fn_validar_sesion"() FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.iniciar_acompanamiento (
  p_contacto_id         uuid    DEFAULT NULL::uuid,
  p_destino             text    DEFAULT NULL::text,
  p_compartir_ubicacion boolean DEFAULT false
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_usuaria uuid := (select auth.uid());
  v_contacto public.contactos_confianza;
  v_sesion public.sesiones_acompanamiento;
begin
  if v_usuaria is null then
    raise exception 'Debes iniciar sesión para comenzar un acompañamiento'
      using errcode = '28000';
  end if;

  if exists (
    select 1
    from public.sesiones_acompanamiento s
    where s.usuaria_id = v_usuaria
      and s.estado = 'activa'
  ) then
    raise exception 'Ya tienes un acompañamiento activo. Finalízalo antes de iniciar otro.'
      using errcode = '23505';
  end if;

  if p_contacto_id is not null then
    select c.*
    into v_contacto
    from public.contactos_confianza c
    where c.id = p_contacto_id
      and c.usuaria_id = v_usuaria
      and c.activo;
  else
    select c.*
    into v_contacto
    from public.contactos_confianza c
    where c.usuaria_id = v_usuaria
      and c.activo
    order by c.es_principal desc, c.creado_en asc
    limit 1;
  end if;

  if v_contacto.id is null then
    raise exception 'Registra al menos un contacto de confianza activo antes de iniciar un acompañamiento.'
      using errcode = 'P0002';
  end if;

  insert into public.sesiones_acompanamiento (
    usuaria_id,
    contacto_id,
    destino,
    compartir_ubicacion
  )
  values (
    v_usuaria,
    v_contacto.id,
    nullif(btrim(p_destino), ''),
    coalesce(p_compartir_ubicacion, false)
  )
  returning * into v_sesion;

  return jsonb_build_object(
    'sesion_id', v_sesion.id,
    'token_seguimiento', v_sesion.token_seguimiento,
    'estado', v_sesion.estado,
    'compartir_ubicacion', v_sesion.compartir_ubicacion,
    'destino', v_sesion.destino,
    'iniciada_en', v_sesion.iniciada_en,
    'contacto', jsonb_build_object(
      'id', v_contacto.id,
      'nombre', v_contacto.nombre,
      'telefono', v_contacto.telefono
    )
  );
end;
$function$;

REVOKE ALL ON FUNCTION "public"."iniciar_acompanamiento"(uuid, text, boolean) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.obtener_cuestionario (
  p_cuestionario_id uuid
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select jsonb_build_object(
    'id', c.id,
    'titulo', c.titulo,
    'descripcion', c.descripcion,
    'preguntas', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'enunciado', q.enunciado,
          'orden', q.orden,
          'opciones', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', o.id,
                'texto', o.texto,
                'orden', o.orden
              )
              order by o.orden, o.id
            )
            from public.opciones_respuesta o
            where o.pregunta_id = q.id
          ), '[]'::jsonb)
        )
        order by q.orden, q.id
      )
      from public.preguntas q
      where q.cuestionario_id = c.id
    ), '[]'::jsonb)
  )
  from public.cuestionarios c
  where c.id = p_cuestionario_id
    and c.activo;
$function$;

CREATE OR REPLACE FUNCTION public.obtener_cuestionario_admin (
  p_cuestionario_id uuid
)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_resultado jsonb;
begin
  if not public.es_admin() then
    raise exception 'Solo una administradora puede ver las respuestas correctas.'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id', c.id,
    'titulo', c.titulo,
    'descripcion', c.descripcion,
    'activo', c.activo,
    'preguntas', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'enunciado', q.enunciado,
          'explicacion', q.explicacion,
          'orden', q.orden,
          'opciones', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', o.id,
                'texto', o.texto,
                'es_correcta', o.es_correcta,
                'orden', o.orden
              )
              order by o.orden, o.id
            )
            from public.opciones_respuesta o
            where o.pregunta_id = q.id
          ), '[]'::jsonb)
        )
        order by q.orden, q.id
      )
      from public.preguntas q
      where q.cuestionario_id = c.id
    ), '[]'::jsonb)
  )
  into v_resultado
  from public.cuestionarios c
  where c.id = p_cuestionario_id;

  if v_resultado is null then
    raise exception 'El cuestionario no existe.'
      using errcode = 'P0002';
  end if;

  return v_resultado;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."obtener_cuestionario_admin"(uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.registrar_ubicacion (
  p_sesion_id   uuid,
  p_latitud     double precision,
  p_longitud    double precision,
  p_precision_m double precision DEFAULT NULL::double precision
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_usuaria uuid := (select auth.uid());
  v_ubicacion public.ubicaciones;
begin
  if v_usuaria is null then
    raise exception 'Debes iniciar sesión para compartir tu ubicación'
      using errcode = '28000';
  end if;

  insert into public.ubicaciones (sesion_id, latitud, longitud, precision_m)
  select s.id, p_latitud, p_longitud, p_precision_m
  from public.sesiones_acompanamiento s
  where s.id = p_sesion_id
    and s.usuaria_id = v_usuaria
    and s.estado = 'activa'
  returning * into v_ubicacion;

  if v_ubicacion.id is null then
    raise exception 'No hay una sesión de acompañamiento activa para esta usuaria.'
      using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'ubicacion_id', v_ubicacion.id,
    'sesion_id', v_ubicacion.sesion_id,
    'latitud', v_ubicacion.latitud,
    'longitud', v_ubicacion.longitud,
    'precision_m', v_ubicacion.precision_m,
    'registrada_en', v_ubicacion.registrada_en
  );
end;
$function$;

REVOKE ALL ON FUNCTION "public"."registrar_ubicacion"(uuid, double precision, double precision, double precision) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.responder_cuestionario (
  p_cuestionario_id uuid,
  p_respuestas      jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_usuaria uuid := (select auth.uid());
  v_total integer;
  v_intento uuid;
  v_puntaje integer;
  v_detalle jsonb;
begin
  if v_usuaria is null then
    raise exception 'Debes iniciar sesión para responder el cuestionario'
      using errcode = '28000';
  end if;

  if p_respuestas is null or jsonb_typeof(p_respuestas) <> 'array' then
    raise exception 'El formato de las respuestas debe ser un arreglo JSON.'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.cuestionarios c
    where c.id = p_cuestionario_id
      and c.activo
  ) then
    raise exception 'El cuestionario no existe o no está activo.'
      using errcode = 'P0002';
  end if;

  select count(*)
  into v_total
  from public.preguntas q
  where q.cuestionario_id = p_cuestionario_id;

  -- Todas las respuestas deben corresponder a una pregunta del cuestionario
  -- y a una opción de esa pregunta.
  if exists (
    select 1
    from jsonb_array_elements(p_respuestas) as r
    where not exists (
      select 1
      from public.preguntas q
      join public.opciones_respuesta o on o.pregunta_id = q.id
      where q.cuestionario_id = p_cuestionario_id
        and q.id = (r ->> 'pregunta_id')::uuid
        and o.id = (r ->> 'opcion_id')::uuid
    )
  ) then
    raise exception 'Hay respuestas con preguntas u opciones que no pertenecen al cuestionario.'
      using errcode = '22023';
  end if;

  insert into public.intentos_cuestionario (
    usuaria_id,
    cuestionario_id,
    total_preguntas
  )
  values (v_usuaria, p_cuestionario_id, v_total)
  returning id into v_intento;

  insert into public.respuestas_intento (
    intento_id,
    pregunta_id,
    opcion_id,
    es_correcta
  )
  select
    v_intento,
    x.pregunta_id,
    x.opcion_id,
    o.es_correcta
  from (
    select distinct on ((r ->> 'pregunta_id')::uuid)
      (r ->> 'pregunta_id')::uuid as pregunta_id,
      (r ->> 'opcion_id')::uuid as opcion_id
    from jsonb_array_elements(p_respuestas) as r
    where r ? 'pregunta_id'
      and r ? 'opcion_id'
    order by (r ->> 'pregunta_id')::uuid, (r ->> 'opcion_id')::uuid
  ) as x
  join public.opciones_respuesta o on o.id = x.opcion_id;

  select count(*)
  into v_puntaje
  from public.respuestas_intento ri
  where ri.intento_id = v_intento
    and ri.es_correcta;

  update public.intentos_cuestionario i
  set puntaje = v_puntaje
  where i.id = v_intento;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'pregunta_id', q.id,
        'enunciado', q.enunciado,
        'opcion_elegida_id', ri.opcion_id,
        'correcta', coalesce(ri.es_correcta, false),
        'opcion_correcta_id', oc.id,
        'explicacion', q.explicacion
      )
      order by q.orden, q.id
    ),
    '[]'::jsonb
  )
  into v_detalle
  from public.preguntas q
  left join public.respuestas_intento ri
    on ri.pregunta_id = q.id
   and ri.intento_id = v_intento
  left join public.opciones_respuesta oc
    on oc.pregunta_id = q.id
   and oc.es_correcta
  where q.cuestionario_id = p_cuestionario_id;

  return jsonb_build_object(
    'intento_id', v_intento,
    'puntaje', v_puntaje,
    'total', v_total,
    'porcentaje', case
      when v_total = 0 then 0
      else round((v_puntaje::numeric * 100) / v_total)
    end,
    'detalle', v_detalle
  );
end;
$function$;

REVOKE ALL ON FUNCTION "public"."responder_cuestionario"(uuid, jsonb) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.ubicacion_publica (
  p_token uuid
)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_resultado jsonb;
begin
  select jsonb_build_object(
    'valida', true,
    'nombre_usuaria', split_part(p.nombre, ' ', 1),
    'estado', s.estado,
    'compartir_ubicacion', s.compartir_ubicacion,
    'destino', s.destino,
    'iniciada_en', s.iniciada_en,
    'finalizada_en', s.finalizada_en,
    'ubicacion', case
      when s.compartir_ubicacion and s.estado = 'activa' then (
        select jsonb_build_object(
          'latitud', u.latitud,
          'longitud', u.longitud,
          'precision_m', u.precision_m,
          'registrada_en', u.registrada_en
        )
        from public.ubicaciones u
        where u.sesion_id = s.id
        order by u.registrada_en desc
        limit 1
      )
      else null
    end
  )
  into v_resultado
  from public.sesiones_acompanamiento s
  join public.perfiles p on p.id = s.usuaria_id
  where s.token_seguimiento = p_token;

  return coalesce(v_resultado, jsonb_build_object('valida', false));
end;
$function$;

ALTER TABLE "public"."alertas_sos"
  ADD CONSTRAINT "alertas_sos_contacto_id_fkey" FOREIGN KEY (contacto_id) REFERENCES public.contactos_confianza(id) ON DELETE SET NULL;

ALTER TABLE "public"."contenidos_educativos"
  ADD CONSTRAINT "contenidos_educativos_categoria_id_fkey" FOREIGN KEY (categoria_id) REFERENCES public.categorias_educativas(id) ON DELETE RESTRICT;

ALTER TABLE "public"."contenidos_educativos"
  ADD CONSTRAINT "contenidos_tiempo_lectura" CHECK (((tiempo_lectura_min IS NULL) OR ((tiempo_lectura_min >= 1) AND (tiempo_lectura_min <= 120))));

ALTER TABLE "public"."cuestionarios"
  ADD CONSTRAINT "cuestionarios_contenido_id_fkey" FOREIGN KEY (contenido_id) REFERENCES public.contenidos_educativos(id) ON DELETE SET NULL;

ALTER TABLE "public"."instituciones"
  ADD CONSTRAINT "instituciones_latitud_valida" CHECK (((latitud IS NULL) OR ((latitud >= ('-90'::integer)::double precision) AND (latitud <= (90)::double precision))));

ALTER TABLE "public"."instituciones"
  ADD CONSTRAINT "instituciones_longitud_valida" CHECK (((longitud IS NULL) OR ((longitud >= ('-180'::integer)::double precision) AND (longitud <= (180)::double precision))));

ALTER TABLE "public"."instituciones"
  ADD CONSTRAINT "instituciones_nombre_ciudad_unico" UNIQUE (nombre, ciudad);

ALTER TABLE "public"."intentos_cuestionario"
  ADD CONSTRAINT "intentos_cuestionario_cuestionario_id_fkey" FOREIGN KEY (cuestionario_id) REFERENCES public.cuestionarios(id) ON DELETE CASCADE;

ALTER TABLE "public"."mensajes_asistente"
  ADD CONSTRAINT "mensajes_asistente_conversacion_id_fkey" FOREIGN KEY (conversacion_id) REFERENCES public.conversaciones_asistente(id) ON DELETE CASCADE;

ALTER TABLE "public"."mensajes_asistente"
  ADD CONSTRAINT "mensajes_contenido_longitud" CHECK (((char_length(btrim(contenido)) >= 1) AND (char_length(btrim(contenido)) <= 4000)));

ALTER TABLE "public"."perfiles"
  ADD CONSTRAINT "perfiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."alertas_sos"
  ADD CONSTRAINT "alertas_sos_usuaria_id_fkey" FOREIGN KEY (usuaria_id) REFERENCES public.perfiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."contactos_confianza"
  ADD CONSTRAINT "contactos_confianza_usuaria_id_fkey" FOREIGN KEY (usuaria_id) REFERENCES public.perfiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."conversaciones_asistente"
  ADD CONSTRAINT "conversaciones_asistente_usuaria_id_fkey" FOREIGN KEY (usuaria_id) REFERENCES public.perfiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."intentos_cuestionario"
  ADD CONSTRAINT "intentos_cuestionario_usuaria_id_fkey" FOREIGN KEY (usuaria_id) REFERENCES public.perfiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."preguntas"
  ADD CONSTRAINT "preguntas_cuestionario_id_fkey" FOREIGN KEY (cuestionario_id) REFERENCES public.cuestionarios(id) ON DELETE CASCADE;

ALTER TABLE "public"."opciones_respuesta"
  ADD CONSTRAINT "opciones_respuesta_pregunta_id_fkey" FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id) ON DELETE CASCADE;

ALTER TABLE "public"."respuestas_intento"
  ADD CONSTRAINT "respuestas_intento_intento_id_fkey" FOREIGN KEY (intento_id) REFERENCES public.intentos_cuestionario(id) ON DELETE CASCADE;

ALTER TABLE "public"."respuestas_intento"
  ADD CONSTRAINT "respuestas_intento_opcion_id_fkey" FOREIGN KEY (opcion_id) REFERENCES public.opciones_respuesta(id) ON DELETE CASCADE;

ALTER TABLE "public"."respuestas_intento"
  ADD CONSTRAINT "respuestas_intento_pregunta_id_fkey" FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id) ON DELETE CASCADE;

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD CONSTRAINT "sesiones_acompanamiento_contacto_id_fkey" FOREIGN KEY (contacto_id) REFERENCES public.contactos_confianza(id) ON DELETE RESTRICT;

ALTER TABLE "public"."alertas_sos"
  ADD CONSTRAINT "alertas_sos_sesion_id_fkey" FOREIGN KEY (sesion_id) REFERENCES public.sesiones_acompanamiento(id) ON DELETE SET NULL;

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD CONSTRAINT "sesiones_acompanamiento_usuaria_id_fkey" FOREIGN KEY (usuaria_id) REFERENCES public.perfiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD CONSTRAINT "sesiones_destino_longitud" CHECK (((destino IS NULL) OR (char_length(btrim(destino)) <= 120)));

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD CONSTRAINT "sesiones_estado_finalizada"
    CHECK ((((estado = 'activa'::public.estado_sesion) AND (finalizada_en IS NULL)) OR ((estado <> 'activa'::public.estado_sesion) AND (finalizada_en IS NOT NULL))));

ALTER TABLE "public"."sesiones_acompanamiento"
  ADD CONSTRAINT "sesiones_token_unico" UNIQUE (token_seguimiento);

ALTER TABLE "public"."ubicaciones"
  ADD CONSTRAINT "ubicaciones_sesion_id_fkey" FOREIGN KEY (sesion_id) REFERENCES public.sesiones_acompanamiento(id) ON DELETE CASCADE;

ALTER TABLE "public"."ubicaciones"
  ADD CONSTRAINT "ubicaciones_usuaria_id_fkey" FOREIGN KEY (usuaria_id) REFERENCES public.perfiles(id) ON DELETE CASCADE;

CREATE INDEX ix_alertas_estado ON public.alertas_sos USING btree (estado);

CREATE INDEX ix_alertas_usuaria_fecha ON public.alertas_sos USING btree (usuaria_id, creada_en DESC);

CREATE INDEX ix_contactos_usuaria_activos ON public.contactos_confianza USING btree (usuaria_id)
  WHERE activo;

CREATE INDEX ix_contenidos_categoria_publicados ON public.contenidos_educativos USING btree (categoria_id, orden)
  WHERE publicado;

CREATE INDEX ix_conversaciones_usuaria ON public.conversaciones_asistente USING btree (usuaria_id, actualizada_en DESC);

CREATE INDEX ix_instituciones_categoria_activas ON public.instituciones USING btree (categoria, orden)
  WHERE activo;

CREATE INDEX ix_instituciones_verificadas ON public.instituciones USING btree (verificado)
  WHERE activo;

CREATE INDEX ix_intentos_usuaria ON public.intentos_cuestionario USING btree (usuaria_id, completado_en DESC);

CREATE INDEX ix_mensajes_conversacion ON public.mensajes_asistente USING btree (conversacion_id, creada_en);

CREATE INDEX ix_opciones_pregunta ON public.opciones_respuesta USING btree (pregunta_id, orden);

CREATE INDEX ix_perfiles_correo ON public.perfiles USING btree (lower(correo));

CREATE INDEX ix_preguntas_cuestionario ON public.preguntas USING btree (cuestionario_id, orden);

CREATE INDEX ix_respuestas_intento ON public.respuestas_intento USING btree (intento_id);

CREATE INDEX ix_sesiones_usuaria_estado ON public.sesiones_acompanamiento USING btree (usuaria_id, estado);

CREATE INDEX ix_ubicaciones_sesion_reciente ON public.ubicaciones USING btree (sesion_id, registrada_en DESC);

CREATE UNIQUE INDEX ux_contactos_principal ON public.contactos_confianza USING btree (usuaria_id)
  WHERE (es_principal AND activo);

CREATE UNIQUE INDEX ux_sesiones_activa_por_usuaria ON public.sesiones_acompanamiento USING btree (usuaria_id)
  WHERE (estado = 'activa'::public.estado_sesion);

CREATE TRIGGER trg_crear_perfil_al_registrar
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_crear_perfil_al_registrar();

CREATE TRIGGER trg_alertas_actualizado_en
  BEFORE UPDATE ON public.alertas_sos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_marca_tiempo_actualizacion();

CREATE TRIGGER trg_alertas_completar
  BEFORE INSERT ON public.alertas_sos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_completar_alerta_sos();

CREATE TRIGGER trg_contactos_actualizado_en
  BEFORE UPDATE ON public.contactos_confianza
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_marca_tiempo_actualizacion();

CREATE TRIGGER trg_contenidos_actualizado_en
  BEFORE UPDATE ON public.contenidos_educativos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_marca_tiempo_actualizacion();

CREATE TRIGGER trg_conversaciones_actualizado_en
  BEFORE UPDATE ON public.conversaciones_asistente
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_marca_tiempo_actualizacion();

CREATE TRIGGER trg_instituciones_actualizado_en
  BEFORE UPDATE ON public.instituciones
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_marca_tiempo_actualizacion();

CREATE TRIGGER trg_perfiles_actualizado_en
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_marca_tiempo_actualizacion();

CREATE TRIGGER trg_sesiones_actualizado_en
  BEFORE UPDATE ON public.sesiones_acompanamiento
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_marca_tiempo_actualizacion();

CREATE TRIGGER trg_sesiones_validar
  BEFORE INSERT OR UPDATE ON public.sesiones_acompanamiento
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_validar_sesion();

CREATE TRIGGER trg_ubicaciones_heredar_duena
  BEFORE INSERT ON public.ubicaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_heredar_duena_ubicacion();

CREATE POLICY "alertas_actualizacion_propia" ON "public"."alertas_sos"
  FOR UPDATE
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "alertas_alta_propia" ON "public"."alertas_sos"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "alertas_lectura_admin" ON "public"."alertas_sos"
  FOR SELECT
  TO "authenticated"
  USING (public.es_admin());

CREATE POLICY "alertas_lectura_propia" ON "public"."alertas_sos"
  FOR SELECT
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "categorias_admin" ON "public"."categorias_educativas"
  FOR ALL
  TO "authenticated"
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY "categorias_lectura_publica" ON "public"."categorias_educativas"
  FOR SELECT
  TO "anon", "authenticated"
  USING (activo);

CREATE POLICY "contactos_actualizacion_propia" ON "public"."contactos_confianza"
  FOR UPDATE
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "contactos_alta_propia" ON "public"."contactos_confianza"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "contactos_baja_propia" ON "public"."contactos_confianza"
  FOR DELETE
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "contactos_lectura_admin" ON "public"."contactos_confianza"
  FOR SELECT
  TO "authenticated"
  USING (public.es_admin());

CREATE POLICY "contactos_lectura_propia" ON "public"."contactos_confianza"
  FOR SELECT
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "contenidos_admin" ON "public"."contenidos_educativos"
  FOR ALL
  TO "authenticated"
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY "contenidos_lectura_publica" ON "public"."contenidos_educativos"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((publicado AND (EXISTS ( SELECT 1
   FROM public.categorias_educativas c
  WHERE ((c.id = contenidos_educativos.categoria_id) AND c.activo)))));

CREATE POLICY "conversaciones_propias" ON "public"."conversaciones_asistente"
  FOR ALL
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "cuestionarios_admin" ON "public"."cuestionarios"
  FOR ALL
  TO "authenticated"
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY "cuestionarios_lectura_publica" ON "public"."cuestionarios"
  FOR SELECT
  TO "anon", "authenticated"
  USING (activo);

CREATE POLICY "instituciones_admin" ON "public"."instituciones"
  FOR ALL
  TO "authenticated"
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY "instituciones_lectura_publica" ON "public"."instituciones"
  FOR SELECT
  TO "anon", "authenticated"
  USING (activo);

CREATE POLICY "intentos_lectura_admin" ON "public"."intentos_cuestionario"
  FOR SELECT
  TO "authenticated"
  USING (public.es_admin());

CREATE POLICY "intentos_lectura_propia" ON "public"."intentos_cuestionario"
  FOR SELECT
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "mensajes_propios" ON "public"."mensajes_asistente"
  FOR ALL
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.conversaciones_asistente c
  WHERE ((c.id = mensajes_asistente.conversacion_id) AND (c.usuaria_id = ( SELECT auth.uid() AS uid))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.conversaciones_asistente c
  WHERE ((c.id = mensajes_asistente.conversacion_id) AND (c.usuaria_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "opciones_admin" ON "public"."opciones_respuesta"
  FOR ALL
  TO "authenticated"
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY "opciones_lectura_publica" ON "public"."opciones_respuesta"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.preguntas q
     JOIN public.cuestionarios c ON ((c.id = q.cuestionario_id)))
  WHERE ((q.id = opciones_respuesta.pregunta_id) AND c.activo))));

CREATE POLICY "perfiles_actualizacion_propia" ON "public"."perfiles"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "perfiles_alta_propia" ON "public"."perfiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "perfiles_lectura_admin" ON "public"."perfiles"
  FOR SELECT
  TO "authenticated"
  USING (public.es_admin());

CREATE POLICY "perfiles_lectura_propia" ON "public"."perfiles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "preguntas_admin" ON "public"."preguntas"
  FOR ALL
  TO "authenticated"
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY "preguntas_lectura_publica" ON "public"."preguntas"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.cuestionarios c
  WHERE ((c.id = preguntas.cuestionario_id) AND c.activo))));

CREATE POLICY "respuestas_lectura_admin" ON "public"."respuestas_intento"
  FOR SELECT
  TO "authenticated"
  USING (public.es_admin());

CREATE POLICY "respuestas_lectura_propia" ON "public"."respuestas_intento"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.intentos_cuestionario i
  WHERE ((i.id = respuestas_intento.intento_id) AND (i.usuaria_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "sesiones_actualizacion_propia" ON "public"."sesiones_acompanamiento"
  FOR UPDATE
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "sesiones_alta_propia" ON "public"."sesiones_acompanamiento"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "sesiones_baja_propia" ON "public"."sesiones_acompanamiento"
  FOR DELETE
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "sesiones_lectura_admin" ON "public"."sesiones_acompanamiento"
  FOR SELECT
  TO "authenticated"
  USING (public.es_admin());

CREATE POLICY "sesiones_lectura_propia" ON "public"."sesiones_acompanamiento"
  FOR SELECT
  TO "authenticated"
  USING ((usuaria_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "ubicaciones_alta_propia" ON "public"."ubicaciones"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.sesiones_acompanamiento s
  WHERE ((s.id = ubicaciones.sesion_id) AND (s.usuaria_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "ubicaciones_lectura_admin" ON "public"."ubicaciones"
  FOR SELECT
  TO "authenticated"
  USING (public.es_admin());

CREATE POLICY "ubicaciones_lectura_propia" ON "public"."ubicaciones"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.sesiones_acompanamiento s
  WHERE ((s.id = ubicaciones.sesion_id) AND (s.usuaria_id = ( SELECT auth.uid() AS uid))))));

COMMENT ON COLUMN "public"."opciones_respuesta"."es_correcta" IS 'La app no puede leer esta columna: se califica en responder_cuestionario() de forma segura.';

COMMENT ON COLUMN "public"."perfiles"."rol" IS 'usuaria = acceso normal; admin = gestión de contenidos e instituciones.';

COMMENT ON COLUMN "public"."sesiones_acompanamiento"."compartir_ubicacion" IS 'Autorización explícita de la usuaria (RNF-02). Al finalizar la sesión vuelve a false.';

COMMENT ON COLUMN "public"."ubicaciones"."usuaria_id" IS 'Se deriva de la sesión en un trigger; la app no puede falsificarla.';

COMMENT ON FUNCTION "public"."alertar_sos"(uuid, double precision, double precision, text) IS 'Registra una alerta SOS simulada (es_simulacion = true). NO envía SMS ni llamadas: eso queda para una integración futura.';

COMMENT ON FUNCTION "public"."es_admin"() IS 'Devuelve true si el JWT actual pertenece a un perfil con rol admin.';

COMMENT ON FUNCTION "public"."finalizar_acompanamiento"(uuid) IS 'Finaliza la sesión y desactiva el compartir ubicación (RNF-02).';

COMMENT ON FUNCTION "public"."fn_crear_perfil_al_registrar"() IS 'Crea el perfil de LÍA a partir de auth.users. El nombre puede enviarse en raw_user_meta_data.nombre.';

COMMENT ON FUNCTION "public"."fn_marca_tiempo_actualizacion"() IS 'Trigger genérico: actualiza la columna actualizado_en antes de cada UPDATE.';

COMMENT ON FUNCTION "public"."iniciar_acompanamiento"(uuid, text, boolean) IS 'Crea la sesión activa de acompañamiento y devuelve el token que se comparte con el contacto.';

COMMENT ON FUNCTION "public"."obtener_cuestionario"(uuid) IS 'Devuelve el cuestionario y sus opciones SIN revelar cuál es la correcta. Disponible incluso sin sesión.';

COMMENT ON FUNCTION "public"."obtener_cuestionario_admin"(uuid) IS 'Igual que obtener_cuestionario() pero incluye es_correcta. Solo para perfiles admin.';

COMMENT ON FUNCTION "public"."registrar_ubicacion"(uuid, double precision, double precision, double precision) IS 'Guarda un punto GPS solo si la sesión está activa y pertenece a la usuaria.';

COMMENT ON FUNCTION "public"."responder_cuestionario"(uuid, jsonb) IS 'Califica el cuestionario en el servidor, guarda el intento y devuelve el detalle con las respuestas correctas.';

COMMENT ON FUNCTION "public"."ubicacion_publica"(uuid) IS 'Vista de solo lectura para el contacto: devuelve el primer nombre y la última ubicación autorizada. No exige cuenta.';

COMMENT ON TABLE "public"."alertas_sos" IS 'Registro de alertas SOS. En el MVP es_simulacion = true: NO es un servicio de emergencia operativo.';

COMMENT ON TABLE "public"."categorias_educativas" IS 'Categorías de la biblioteca de LÍA Aprende (RF-08).';

COMMENT ON TABLE "public"."contactos_confianza" IS 'Red de apoyo personal de cada usuaria. Se usa para compartir ubicación y enviar SOS.';

COMMENT ON TABLE "public"."contenidos_educativos" IS 'Artículos, infografías y videos. fuente/url_fuente permiten citar el origen (RNF-06).';

COMMENT ON TABLE "public"."instituciones" IS 'Directorio de apoyo. verificado/fecha_revision implementan el indicador de información verificada (RNF-06).';

COMMENT ON TABLE "public"."perfiles" IS 'Datos públicos mínimos de cada usuaria. Se crea automáticamente al registrarse en auth.users.';

COMMENT ON TABLE "public"."sesiones_acompanamiento" IS 'Cada acompañamiento iniciado por una usuaria. token_seguimiento permite que el contacto vea el mapa sin crear cuenta.';

COMMENT ON TABLE "public"."ubicaciones" IS 'Historial de puntos GPS de una sesión. Es de solo lectura para la app; la escritura pasa por registrar_ubicacion().';

GRANT EXECUTE ON FUNCTION "public"."alertar_sos"(uuid, double precision, double precision, text) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."alertar_sos"(uuid, double precision, double precision, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."alertar_sos"(uuid, double precision, double precision, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."alertar_sos"(uuid, double precision, double precision, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."es_admin"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."es_admin"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."es_admin"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."es_admin"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."finalizar_acompanamiento"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."finalizar_acompanamiento"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."finalizar_acompanamiento"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."finalizar_acompanamiento"(uuid) TO "service_role";

REVOKE ALL ON FUNCTION "public"."fn_completar_alerta_sos"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_completar_alerta_sos"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_completar_alerta_sos"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."fn_crear_perfil_al_registrar"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_crear_perfil_al_registrar"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_crear_perfil_al_registrar"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."fn_heredar_duena_ubicacion"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_heredar_duena_ubicacion"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_heredar_duena_ubicacion"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."fn_marca_tiempo_actualizacion"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_marca_tiempo_actualizacion"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_marca_tiempo_actualizacion"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."fn_validar_sesion"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_validar_sesion"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."fn_validar_sesion"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."iniciar_acompanamiento"(uuid, text, boolean) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."iniciar_acompanamiento"(uuid, text, boolean) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."iniciar_acompanamiento"(uuid, text, boolean) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."iniciar_acompanamiento"(uuid, text, boolean) TO "service_role";

REVOKE ALL ON FUNCTION "public"."obtener_cuestionario"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."obtener_cuestionario"(uuid) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."obtener_cuestionario"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."obtener_cuestionario"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."obtener_cuestionario"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."obtener_cuestionario_admin"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."obtener_cuestionario_admin"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."obtener_cuestionario_admin"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."obtener_cuestionario_admin"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."registrar_ubicacion"(uuid, double precision, double precision, double precision) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."registrar_ubicacion"(uuid, double precision, double precision, double precision) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."registrar_ubicacion"(uuid, double precision, double precision, double precision) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."registrar_ubicacion"(uuid, double precision, double precision, double precision) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."responder_cuestionario"(uuid, jsonb) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."responder_cuestionario"(uuid, jsonb) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."responder_cuestionario"(uuid, jsonb) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."responder_cuestionario"(uuid, jsonb) TO "service_role";

REVOKE ALL ON FUNCTION "public"."ubicacion_publica"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."ubicacion_publica"(uuid) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."ubicacion_publica"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."ubicacion_publica"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."ubicacion_publica"(uuid) TO "service_role";

REVOKE ALL ON SEQUENCE "public"."respuestas_intento_id_seq" FROM "authenticated";

GRANT SELECT, USAGE ON SEQUENCE "public"."respuestas_intento_id_seq" TO "authenticated";

REVOKE ALL ON SEQUENCE "public"."respuestas_intento_id_seq" FROM "postgres";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."respuestas_intento_id_seq" TO "postgres";

REVOKE ALL ON SEQUENCE "public"."respuestas_intento_id_seq" FROM "service_role";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."respuestas_intento_id_seq" TO "service_role";

REVOKE ALL ON SEQUENCE "public"."ubicaciones_id_seq" FROM "authenticated";

GRANT SELECT, USAGE ON SEQUENCE "public"."ubicaciones_id_seq" TO "authenticated";

REVOKE ALL ON SEQUENCE "public"."ubicaciones_id_seq" FROM "postgres";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."ubicaciones_id_seq" TO "postgres";

REVOKE ALL ON SEQUENCE "public"."ubicaciones_id_seq" FROM "service_role";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."ubicaciones_id_seq" TO "service_role";

REVOKE ALL ON TABLE "public"."alertas_sos" FROM "authenticated";

REVOKE ALL ("estado") ON TABLE "public"."alertas_sos" FROM "authenticated";

GRANT UPDATE ("estado") ON TABLE "public"."alertas_sos" TO "authenticated";

REVOKE ALL ("latitud") ON TABLE "public"."alertas_sos" FROM "authenticated";

GRANT INSERT ("latitud") ON TABLE "public"."alertas_sos" TO "authenticated";

REVOKE ALL ("longitud") ON TABLE "public"."alertas_sos" FROM "authenticated";

GRANT INSERT ("longitud") ON TABLE "public"."alertas_sos" TO "authenticated";

REVOKE ALL ("mensaje") ON TABLE "public"."alertas_sos" FROM "authenticated";

GRANT INSERT ("mensaje") ON TABLE "public"."alertas_sos" TO "authenticated";

REVOKE ALL ("sesion_id") ON TABLE "public"."alertas_sos" FROM "authenticated";

GRANT INSERT ("sesion_id") ON TABLE "public"."alertas_sos" TO "authenticated";

REVOKE ALL ("usuaria_id") ON TABLE "public"."alertas_sos" FROM "authenticated";

GRANT INSERT ("usuaria_id") ON TABLE "public"."alertas_sos" TO "authenticated";

GRANT SELECT ON TABLE "public"."alertas_sos" TO "authenticated";

REVOKE ALL ON TABLE "public"."alertas_sos" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."alertas_sos" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."alertas_sos" TO "service_role";

REVOKE ALL ON TABLE "public"."categorias_educativas" FROM "anon";

GRANT SELECT ON TABLE "public"."categorias_educativas" TO "anon";

REVOKE ALL ON TABLE "public"."categorias_educativas" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."categorias_educativas" TO "authenticated";

REVOKE ALL ON TABLE "public"."categorias_educativas" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."categorias_educativas" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."categorias_educativas" TO "service_role";

REVOKE ALL ON TABLE "public"."contactos_confianza" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."contactos_confianza" TO "authenticated";

REVOKE ALL ON TABLE "public"."contactos_confianza" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."contactos_confianza" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."contactos_confianza" TO "service_role";

REVOKE ALL ON TABLE "public"."contenidos_educativos" FROM "anon";

GRANT SELECT ON TABLE "public"."contenidos_educativos" TO "anon";

REVOKE ALL ON TABLE "public"."contenidos_educativos" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."contenidos_educativos" TO "authenticated";

REVOKE ALL ON TABLE "public"."contenidos_educativos" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."contenidos_educativos" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."contenidos_educativos" TO "service_role";

REVOKE ALL ON TABLE "public"."conversaciones_asistente" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."conversaciones_asistente" TO "authenticated";

REVOKE ALL ON TABLE "public"."conversaciones_asistente" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."conversaciones_asistente" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."conversaciones_asistente" TO "service_role";

REVOKE ALL ON TABLE "public"."cuestionarios" FROM "anon";

GRANT SELECT ON TABLE "public"."cuestionarios" TO "anon";

REVOKE ALL ON TABLE "public"."cuestionarios" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."cuestionarios" TO "authenticated";

REVOKE ALL ON TABLE "public"."cuestionarios" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cuestionarios" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cuestionarios" TO "service_role";

REVOKE ALL ON TABLE "public"."instituciones" FROM "anon";

GRANT SELECT ON TABLE "public"."instituciones" TO "anon";

REVOKE ALL ON TABLE "public"."instituciones" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."instituciones" TO "authenticated";

REVOKE ALL ON TABLE "public"."instituciones" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."instituciones" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."instituciones" TO "service_role";

REVOKE ALL ON TABLE "public"."intentos_cuestionario" FROM "authenticated";

GRANT SELECT ON TABLE "public"."intentos_cuestionario" TO "authenticated";

REVOKE ALL ON TABLE "public"."intentos_cuestionario" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."intentos_cuestionario" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."intentos_cuestionario" TO "service_role";

REVOKE ALL ON TABLE "public"."mensajes_asistente" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."mensajes_asistente" TO "authenticated";

REVOKE ALL ON TABLE "public"."mensajes_asistente" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."mensajes_asistente" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."mensajes_asistente" TO "service_role";

REVOKE ALL ON TABLE "public"."opciones_respuesta" FROM "anon";

REVOKE ALL ("id") ON TABLE "public"."opciones_respuesta" FROM "anon";

GRANT SELECT ("id") ON TABLE "public"."opciones_respuesta" TO "anon";

REVOKE ALL ("orden") ON TABLE "public"."opciones_respuesta" FROM "anon";

GRANT SELECT ("orden") ON TABLE "public"."opciones_respuesta" TO "anon";

REVOKE ALL ("pregunta_id") ON TABLE "public"."opciones_respuesta" FROM "anon";

GRANT SELECT ("pregunta_id") ON TABLE "public"."opciones_respuesta" TO "anon";

REVOKE ALL ("texto") ON TABLE "public"."opciones_respuesta" FROM "anon";

GRANT SELECT ("texto") ON TABLE "public"."opciones_respuesta" TO "anon";

REVOKE ALL ON TABLE "public"."opciones_respuesta" FROM "authenticated";

REVOKE ALL ("id") ON TABLE "public"."opciones_respuesta" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."opciones_respuesta" TO "authenticated";

REVOKE ALL ("orden") ON TABLE "public"."opciones_respuesta" FROM "authenticated";

GRANT SELECT ("orden") ON TABLE "public"."opciones_respuesta" TO "authenticated";

REVOKE ALL ("pregunta_id") ON TABLE "public"."opciones_respuesta" FROM "authenticated";

GRANT SELECT ("pregunta_id") ON TABLE "public"."opciones_respuesta" TO "authenticated";

REVOKE ALL ("texto") ON TABLE "public"."opciones_respuesta" FROM "authenticated";

GRANT SELECT ("texto") ON TABLE "public"."opciones_respuesta" TO "authenticated";

GRANT DELETE, INSERT, UPDATE ON TABLE "public"."opciones_respuesta" TO "authenticated";

REVOKE ALL ON TABLE "public"."opciones_respuesta" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."opciones_respuesta" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."opciones_respuesta" TO "service_role";

REVOKE ALL ON TABLE "public"."perfiles" FROM "authenticated";

REVOKE ALL ("id") ON TABLE "public"."perfiles" FROM "authenticated";

GRANT INSERT ("id") ON TABLE "public"."perfiles" TO "authenticated";

REVOKE ALL ("nombre") ON TABLE "public"."perfiles" FROM "authenticated";

GRANT INSERT ("nombre"), UPDATE ("nombre") ON TABLE "public"."perfiles" TO "authenticated";

REVOKE ALL ("telefono") ON TABLE "public"."perfiles" FROM "authenticated";

GRANT INSERT ("telefono"), UPDATE ("telefono") ON TABLE "public"."perfiles" TO "authenticated";

GRANT SELECT ON TABLE "public"."perfiles" TO "authenticated";

REVOKE ALL ON TABLE "public"."perfiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."perfiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."perfiles" TO "service_role";

REVOKE ALL ON TABLE "public"."preguntas" FROM "anon";

REVOKE ALL ("cuestionario_id") ON TABLE "public"."preguntas" FROM "anon";

GRANT SELECT ("cuestionario_id") ON TABLE "public"."preguntas" TO "anon";

REVOKE ALL ("enunciado") ON TABLE "public"."preguntas" FROM "anon";

GRANT SELECT ("enunciado") ON TABLE "public"."preguntas" TO "anon";

REVOKE ALL ("explicacion") ON TABLE "public"."preguntas" FROM "anon";

GRANT SELECT ("explicacion") ON TABLE "public"."preguntas" TO "anon";

REVOKE ALL ("id") ON TABLE "public"."preguntas" FROM "anon";

GRANT SELECT ("id") ON TABLE "public"."preguntas" TO "anon";

REVOKE ALL ("orden") ON TABLE "public"."preguntas" FROM "anon";

GRANT SELECT ("orden") ON TABLE "public"."preguntas" TO "anon";

REVOKE ALL ON TABLE "public"."preguntas" FROM "authenticated";

REVOKE ALL ("cuestionario_id") ON TABLE "public"."preguntas" FROM "authenticated";

GRANT SELECT ("cuestionario_id") ON TABLE "public"."preguntas" TO "authenticated";

REVOKE ALL ("enunciado") ON TABLE "public"."preguntas" FROM "authenticated";

GRANT SELECT ("enunciado") ON TABLE "public"."preguntas" TO "authenticated";

REVOKE ALL ("explicacion") ON TABLE "public"."preguntas" FROM "authenticated";

GRANT SELECT ("explicacion") ON TABLE "public"."preguntas" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."preguntas" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."preguntas" TO "authenticated";

REVOKE ALL ("orden") ON TABLE "public"."preguntas" FROM "authenticated";

GRANT SELECT ("orden") ON TABLE "public"."preguntas" TO "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."preguntas" TO "authenticated";

REVOKE ALL ON TABLE "public"."preguntas" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."preguntas" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."preguntas" TO "service_role";

REVOKE ALL ON TABLE "public"."respuestas_intento" FROM "authenticated";

GRANT SELECT ON TABLE "public"."respuestas_intento" TO "authenticated";

REVOKE ALL ON TABLE "public"."respuestas_intento" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."respuestas_intento" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."respuestas_intento" TO "service_role";

REVOKE ALL ON TABLE "public"."sesiones_acompanamiento" FROM "authenticated";

REVOKE ALL ("compartir_ubicacion") ON TABLE "public"."sesiones_acompanamiento" FROM "authenticated";

GRANT INSERT ("compartir_ubicacion"), UPDATE ("compartir_ubicacion") ON TABLE "public"."sesiones_acompanamiento" TO "authenticated";

REVOKE ALL ("contacto_id") ON TABLE "public"."sesiones_acompanamiento" FROM "authenticated";

GRANT INSERT ("contacto_id"), UPDATE ("contacto_id") ON TABLE "public"."sesiones_acompanamiento" TO "authenticated";

REVOKE ALL ("destino") ON TABLE "public"."sesiones_acompanamiento" FROM "authenticated";

GRANT INSERT ("destino"), UPDATE ("destino") ON TABLE "public"."sesiones_acompanamiento" TO "authenticated";

REVOKE ALL ("estado") ON TABLE "public"."sesiones_acompanamiento" FROM "authenticated";

GRANT UPDATE ("estado") ON TABLE "public"."sesiones_acompanamiento" TO "authenticated";

REVOKE ALL ("finalizada_en") ON TABLE "public"."sesiones_acompanamiento" FROM "authenticated";

GRANT UPDATE ("finalizada_en") ON TABLE "public"."sesiones_acompanamiento" TO "authenticated";

REVOKE ALL ("usuaria_id") ON TABLE "public"."sesiones_acompanamiento" FROM "authenticated";

GRANT INSERT ("usuaria_id") ON TABLE "public"."sesiones_acompanamiento" TO "authenticated";

GRANT DELETE, SELECT ON TABLE "public"."sesiones_acompanamiento" TO "authenticated";

REVOKE ALL ON TABLE "public"."sesiones_acompanamiento" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sesiones_acompanamiento" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sesiones_acompanamiento" TO "service_role";

REVOKE ALL ON TABLE "public"."ubicaciones" FROM "authenticated";

REVOKE ALL ("latitud") ON TABLE "public"."ubicaciones" FROM "authenticated";

GRANT INSERT ("latitud") ON TABLE "public"."ubicaciones" TO "authenticated";

REVOKE ALL ("longitud") ON TABLE "public"."ubicaciones" FROM "authenticated";

GRANT INSERT ("longitud") ON TABLE "public"."ubicaciones" TO "authenticated";

REVOKE ALL ("precision_m") ON TABLE "public"."ubicaciones" FROM "authenticated";

GRANT INSERT ("precision_m") ON TABLE "public"."ubicaciones" TO "authenticated";

REVOKE ALL ("sesion_id") ON TABLE "public"."ubicaciones" FROM "authenticated";

GRANT INSERT ("sesion_id") ON TABLE "public"."ubicaciones" TO "authenticated";

GRANT SELECT ON TABLE "public"."ubicaciones" TO "authenticated";

REVOKE ALL ON TABLE "public"."ubicaciones" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ubicaciones" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ubicaciones" TO "service_role";

