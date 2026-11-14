// Utilidades generales: fechas, fotos, markdown, PIN y respaldo

import type { Entrada } from "../types";

// ---------- Identificadores ----------

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Fechas ----------

export function ahoraISO(): string {
  return new Date().toISOString();
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${fecha}, ${hora}`;
}

export function claveDia(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ---------- Fotos ----------

const MAX_LADO = 1600;
const CALIDAD = 0.8;

/** Comprime una imagen a JPEG (máx. 1600px de lado largo, calidad 0.8). */
export async function comprimirFoto(archivo: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = reject;
    imagen.src = dataUrl;
  });

  const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(img.width * escala);
  lienzo.height = Math.round(img.height * escala);
  lienzo.getContext("2d")!.drawImage(img, 0, 0, lienzo.width, lienzo.height);

  return new Promise((resolve) => {
    lienzo.toBlob(
      (blob) => resolve(blob ?? new Blob([], { type: "image/jpeg" })),
      "image/jpeg",
      CALIDAD
    );
  });
}

// Caché de URLs de objetos para no recrearlas en cada render
const cacheURLs = new WeakMap<Blob, string>();

export function urlDeFoto(blob: Blob): string {
  let url = cacheURLs.get(blob);
  if (!url) {
    url = URL.createObjectURL(blob);
    cacheURLs.set(blob, url);
  }
  return url;
}

// ---------- Texto enriquecido (markdown simple) ----------

function escaparHTML(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function enLinea(texto: string): string {
  return texto
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

/** Convierte markdown simple (**negrita**, *cursiva*, listas) a HTML seguro. */
export function textoAHTML(texto: string): string {
  const lineas = escaparHTML(texto).split(/\r?\n/);
  const partes: string[] = [];
  let lista: "ul" | "ol" | null = null;

  const cerrarLista = () => {
    if (lista) {
      partes.push(`</${lista}>`);
      lista = null;
    }
  };

  for (const linea of lineas) {
    const recortada = linea.trim();
    if (!recortada) {
      cerrarLista();
      continue;
    }
    const vineta = recortada.match(/^[-*]\s+(.*)/);
    const numerada = recortada.match(/^\d+[.)]\s+(.*)/);
    if (vineta) {
      if (lista !== "ul") {
        cerrarLista();
        partes.push("<ul>");
        lista = "ul";
      }
      partes.push(`<li>${enLinea(vineta[1])}</li>`);
    } else if (numerada) {
      if (lista !== "ol") {
        cerrarLista();
        partes.push("<ol>");
        lista = "ol";
      }
      partes.push(`<li>${enLinea(numerada[1])}</li>`);
    } else {
      cerrarLista();
      partes.push(`<p>${enLinea(recortada)}</p>`);
    }
  }
  cerrarLista();
  return partes.join("");
}

/** Texto plano de una entrada (para búsquedas y vistas previas). */
export function textoPlano(texto: string): string {
  return texto
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+[.)]\s+/gm, "");
}

// ---------- PIN ----------

/** Hash SHA-256 en hexadecimal; nunca guardamos el PIN en texto plano. */
export async function hashPin(pin: string): Promise<string> {
  const datos = new TextEncoder().encode(`mi-refugio::${pin}`);
  const digesto = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(digesto))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------- Respaldo (exportar / importar) ----------

function blobABase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve((lector.result as string).split(",")[1] ?? "");
    lector.onerror = reject;
    lector.readAsDataURL(blob);
  });
}

async function base64ABlob(base64: string): Promise<Blob> {
  const respuesta = await fetch(`data:image/jpeg;base64,${base64}`);
  return respuesta.blob();
}

export interface Respaldo {
  app: "mi-refugio";
  version: 1;
  exportado: string;
  entradas: Entrada[];
}

export async function exportarDiario(entradas: Entrada[]): Promise<string> {
  const serializadas = await Promise.all(
    entradas.map(async (entrada) => ({
      ...entrada,
      fotos: await Promise.all(
        entrada.fotos.map(async (foto) => ({
          id: foto.id,
          descripcion: foto.descripcion,
          base64: await blobABase64(foto.blob),
        }))
      ),
    }))
  );
  const respaldo: Respaldo = {
    app: "mi-refugio",
    version: 1,
    exportado: ahoraISO(),
    entradas: serializadas as unknown as Entrada[],
  };
  return JSON.stringify(respaldo, null, 2);
}

export async function importarDiario(json: string): Promise<Entrada[]> {
  const datos = JSON.parse(json) as Respaldo;
  if (datos.app !== "mi-refugio" || !Array.isArray(datos.entradas)) {
    throw new Error("El archivo no parece un respaldo de Mi Refugio.");
  }
  return Promise.all(
    datos.entradas.map(async (entrada) => ({
      ...entrada,
      fotos: await Promise.all(
        (entrada.fotos ?? []).map(async (foto) => {
          const conBase64 = foto as unknown as { base64?: string; blob?: Blob };
          const blob = conBase64.blob ?? (await base64ABlob(conBase64.base64 ?? ""));
          return { id: foto.id, blob, descripcion: foto.descripcion };
        })
      ),
    }))
  );
}

export function descargarArchivo(contenido: string, nombre: string): void {
  const url = URL.createObjectURL(new Blob([contenido], { type: "application/json" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
