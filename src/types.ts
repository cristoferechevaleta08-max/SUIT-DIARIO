// Tipos principales de Mi Refugio

export type Animo =
  | "feliz"
  | "tranquilo"
  | "neutral"
  | "triste"
  | "ansioso"
  | "agotado"
  | "caotico";

export type TipoEntrada = "diario" | "apunte-loco";

export interface Foto {
  id: string;
  blob: Blob;
  descripcion?: string;
}

export interface Posicion {
  x: number;
  y: number;
  rotacion: number;
}

export interface Entrada {
  id: string;
  fecha: string; // ISO con hora
  titulo?: string;
  texto: string; // markdown simple
  tipo: TipoEntrada;
  animo: Animo;
  modoDificil: boolean;
  color: string;
  etiquetas: string[];
  fotos: Foto[];
  posicion?: Posicion; // solo apuntes locos
}

export type Vista = "entradas" | "apuntes" | "calendario" | "galeria" | "ajustes";

export type Tema = "claro" | "oscuro";
export type TipoTransicion = "hoja" | "suave";

export interface Ajustes {
  tema: Tema;
  transicion: TipoTransicion;
  pinHash?: string;
  modoDificil: boolean;
  mostrarPortada: boolean;
}
