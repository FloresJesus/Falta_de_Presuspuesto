import { Alert, Platform } from 'react-native';

export const SOS_DEMO_MENSAJE = 'Alerta SOS de prueba enviada desde MASI';
export const EMERGENCIA_NUMERO = '110';

/**
 * Confirmación de acciones destructivas. En web `Alert.alert` no está
 * implementado por react-native-web, así que usamos el diálogo del navegador.
 */
export function confirmar({
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  onConfirmar,
}: {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  onConfirmar: () => void;
}) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${titulo}\n\n${mensaje}`)) {
      onConfirmar();
    }
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoConfirmar, style: 'destructive', onPress: onConfirmar },
  ]);
}


export function iniciales(nombre: string): string {
  const parts = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function primerNombre(nombre: string): string {
  const n = nombre.trim().split(/\s+/)[0];
  return n ? n : 'amiga';
}

const MESES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export function formatearFecha(ts?: string | null, conHora = true): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const dia = d.getDate();
  const mes = MESES[d.getMonth()];
  const anio = d.getFullYear();
  const fecha = `${dia} ${mes} ${anio}`;
  if (!conHora) return fecha;
  const hora = d.getHours();
  const minuto = d.getMinutes();
  return `${fecha}, ${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

export function tiempoRelativo(ts?: string | null): string {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora mismo';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias < 7) return `hace ${dias} d`;
  return formatearFecha(ts, false);
}

export function formatearCoordenadas(lat?: number | null, lng?: number | null): string {
  if (lat == null || lng == null) return 'Sin ubicación registrada';
  const latF = lat.toFixed(4);
  const lngF = lng.toFixed(4);
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'O';
  return `${latF}° ${ns}, ${lngF}° ${ew}`;
}

export type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] };

export function parseInline(texto: string): { text: string; bold: boolean }[] {
  const out: { text: string; bold: boolean }[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto)) !== null) {
    if (m.index > last) out.push({ text: texto.slice(last, m.index), bold: false });
    const token = m[0];
    if (token.startsWith('**')) out.push({ text: token.slice(2, -2), bold: true });
    else out.push({ text: token.slice(1, -1), bold: false });
    last = m.index + token.length;
  }
  if (last < texto.length) out.push({ text: texto.slice(last), bold: false });
  return out;
}

/** Convierte el markdown sencillo usado en contenidos a bloques. */
export function renderMarkdown(texto: string): MarkdownBlock[] {
  const lines = texto.split('\n');
  const blocks: MarkdownBlock[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => {
    const t = para.join(' ').trim();
    if (t) blocks.push({ type: 'paragraph', text: t });
    para = [];
  };
  const flushList = () => {
    if (list.length > 0) blocks.push({ type: 'list', items: list });
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (/^#{1,3}\s/.test(line)) {
      flushPara();
      flushList();
      blocks.push({ type: 'heading', text: line.replace(/^#+\s+/, '') });
      continue;
    }
    if (line.startsWith('- ') || /^\d+\.\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-]\s+/, '').replace(/^\d+\.\s+/, ''));
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();

  return blocks.map((b) => {
    if (b.type === 'paragraph') return { ...b, text: parseInline(b.text) };
    if (b.type === 'heading') return { ...b, text: parseInline(b.text) };
    return b;
  }) as MarkdownBlock[];
}

export function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function esTelefonoValido(telefono: string): boolean {
  return /^[+0-9][0-9\s\-()]{5,}$/.test(telefono.trim());
}
