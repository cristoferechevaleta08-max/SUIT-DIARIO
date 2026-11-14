// Datos fijos de la app: ánimos, colores, frases y preguntas guía

import type { Animo } from "../types";

export interface InfoAnimo {
  emoji: string;
  etiqueta: string;
  hex: string;
}

export const ANIMOS: Record<Animo, InfoAnimo> = {
  feliz: { emoji: "🌞", etiqueta: "Feliz", hex: "#e8b64c" },
  tranquilo: { emoji: "🌿", etiqueta: "Tranquilo", hex: "#7fb692" },
  neutral: { emoji: "☁️", etiqueta: "Neutral", hex: "#a8a3b8" },
  triste: { emoji: "🌧", etiqueta: "Triste", hex: "#6f8fb8" },
  ansioso: { emoji: "🌀", etiqueta: "Ansioso", hex: "#c98a5e" },
  agotado: { emoji: "🕯", etiqueta: "Agotado", hex: "#9a8b9e" },
  caotico: { emoji: "⚡", etiqueta: "Caótico", hex: "#c76a8a" },
};

export const ORDEN_ANIMOS: Animo[] = [
  "feliz",
  "tranquilo",
  "neutral",
  "triste",
  "ansioso",
  "agotado",
  "caotico",
];

// Colores de tarjeta (tonos de papel suaves)
export const COLORES_TARJETA = [
  "#faf6ee",
  "#fdeef0",
  "#eef5ec",
  "#eef2fb",
  "#fdf4e3",
  "#f3edfa",
  "#ecf6f6",
];

// Colores para post-its de apuntes locos
export const COLORES_POSTIT = ["#ffe8a3", "#ffd6e0", "#d9f2d9", "#dbe9fb", "#efe0fb", "#ffe4c4"];

// Frases de acompañamiento para los días difíciles
export const FRASES_DIAS_DIFICILES = [
  "Está bien no estar bien hoy.",
  "Solo escribe lo que puedas.",
  "No tienes que arreglar nada ahora.",
  "Aquí no hay rachas ni deberes. Solo tú.",
  "Un día a la vez está más que bien.",
  "Hoy también cuentas, aunque duela.",
  "Respira. Este es tu refugio.",
  "Lo que sientes tiene sentido.",
  "No hace falta ser productivo para ser valioso.",
  "Si solo hojeas las páginas, también está bien.",
];

// Preguntas guía, nunca obligatorias
export const PREGUNTAS_GUIA = [
  "¿Qué necesitas hoy?",
  "¿Qué pequeña cosa te ayudó, aunque sea un poco?",
  "¿Qué le dirías a alguien que quieres en tu situación?",
  "¿Qué estás sintiendo ahora mismo, sin juzgarlo?",
  "¿Hay algo que quieras soltar hoy?",
  "¿Qué te gustaría escuchar hoy?",
];
