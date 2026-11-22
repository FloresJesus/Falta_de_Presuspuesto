export type RolUsuario = 'usuaria' | 'admin';

export type EstadoAlerta = 'enviada' | 'vista' | 'atendida' | 'cancelada';

export type EstadoSesion = 'activa' | 'finalizada' | 'cancelada';

export type EstadoSolicitudContacto = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';

export type CategoriaInstitucion = 'legal' | 'psicologica' | 'salud' | 'proteccion';

export type TipoContenido = 'articulo' | 'infografia' | 'video';

export type AutorMensaje = 'usuaria' | 'asistente';

export interface Perfil {
  id: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  rol: RolUsuario;
  creado_en: string;
  actualizado_en: string;
}

export interface ContactoConfianza {
  id: string;
  usuaria_id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  relacion: string | null;
  es_principal: boolean;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface SolicitudContacto {
  id: string;
  solicitante_id: string;
  destinatario_id: string;
  nombre_solicitante: string;
  correo_solicitante: string | null;
  telefono_solicitante: string | null;
  nombre_destinatario: string;
  correo_destinatario: string | null;
  telefono_destinatario: string | null;
  relacion: string | null;
  estado: EstadoSolicitudContacto;
  creado_en: string;
  respondido_en: string | null;
}

export interface SesionAcompañamiento {
  id: string;
  usuaria_id: string;
  contacto_id: string;
  estado: EstadoSesion;
  compartir_ubicacion: boolean;
  token_seguimiento: string;
  destino: string | null;
  iniciada_en: string;
  finalizada_en: string | null;
  creado_en: string;
  actualizado_en: string;
  contacto?: ContactoConfianza | null;
}

export interface AlertaSOS {
  id: string;
  usuaria_id: string;
  sesion_id: string | null;
  contacto_id: string | null;
  latitud: number | null;
  longitud: number | null;
  mensaje: string;
  estado: EstadoAlerta;
  es_simulacion: boolean;
  creada_en: string;
  actualizado_en: string;
  contacto?: ContactoConfianza | null;
}

export interface PersonaDesaparecida {
  id: string;
  nombre: string;
  edad: number | null;
  descripcion: string | null;
  foto_url: string | null;
  lugar: string;
  latitud: number | null;
  longitud: number | null;
  fecha_desaparicion: string;
  estado: 'desaparecida' | 'encontrada';
  contacto_familiar: string | null;
  creado_en: string;
}

export interface ZonaPeligro {
  id: string;
  nombre: string;
  descripcion: string | null;
  latitud: number;
  longitud: number;
  radio_m: number;
  indice_peligro: number;
  tipo: 'zona' | 'alerta' | 'inundacion' | 'obras' | 'otro';
  activo: boolean;
  creado_por: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Institucion {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaInstitucion;
  alcance: string | null;
  ciudad: string | null;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  sitio_web: string | null;
  horario: string | null;
  latitud: number | null;
  longitud: number | null;
  verificado: boolean;
  fecha_revision: string | null;
  activo: boolean;
  orden: number;
  creado_en: string;
  actualizado_en: string;
}

export interface CategoriaEducativa {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  icono: string;
  orden: number;
  activo: boolean;
  creado_en: string;
}

export interface ContenidoEducativo {
  id: string;
  categoria_id: string;
  titulo: string;
  resumen: string;
  cuerpo: string;
  tipo: TipoContenido;
  url_imagen: string | null;
  fuente: string | null;
  url_fuente: string | null;
  tiempo_lectura_min: number | null;
  publicado: boolean;
  orden: number;
  fecha_revision: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Cuestionario {
  id: string;
  contenido_id: string | null;
  titulo: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
}

export interface Pregunta {
  id: string;
  cuestionario_id: string;
  enunciado: string;
  explicacion: string | null;
  orden: number;
  opciones?: OpcionRespuesta[];
}

export interface OpcionRespuesta {
  id: string;
  pregunta_id: string;
  texto: string;
  es_correcta: boolean;
  orden: number;
}

export interface CuestionarioCompleto extends Cuestionario {
  preguntas: Pregunta[];
}

export interface ResultadoCuestionario {
  intento_id: string;
  puntaje: number;
  total: number;
  porcentaje: number;
  detalle: {
    pregunta_id: string;
    enunciado: string;
    opcion_elegida_id: string;
    correcta: boolean;
    opcion_correcta_id: string;
    explicacion: string | null;
  }[];
}

export interface ConversacionAsistente {
  id: string;
  usuaria_id: string;
  titulo: string | null;
  creada_en: string;
  actualizada_en: string;
}

export interface MensajeAsistente {
  id: string;
  conversacion_id: string;
  autor: AutorMensaje;
  contenido: string;
  creada_en: string;
}

export interface UbicacionSesion {
  ubicacion_id: string;
  sesion_id: string;
  latitud: number;
  longitud: number;
  precision_m: number | null;
  registrada_en: string;
}
