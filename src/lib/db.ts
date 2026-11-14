// Capa de datos: IndexedDB con idb. Sin servidores ni cuentas.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Ajustes, Entrada } from "../types";

interface RefugioDB extends DBSchema {
  entradas: {
    key: string;
    value: Entrada;
    indexes: { "por-fecha": string };
  };
  ajustes: {
    key: string;
    value: unknown;
  };
}

const NOMBRE_DB = "mi-refugio";
const VERSION_DB = 1;

let promesaDB: Promise<IDBPDatabase<RefugioDB>> | null = null;

function abrir(): Promise<IDBPDatabase<RefugioDB>> {
  if (!promesaDB) {
    promesaDB = openDB<RefugioDB>(NOMBRE_DB, VERSION_DB, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("entradas")) {
          const store = db.createObjectStore("entradas", { keyPath: "id" });
          store.createIndex("por-fecha", "fecha");
        }
        if (!db.objectStoreNames.contains("ajustes")) {
          db.createObjectStore("ajustes");
        }
      },
    });
  }
  return promesaDB;
}

// ---------- Entradas ----------

export async function obtenerEntradas(): Promise<Entrada[]> {
  const db = await abrir();
  const todas = await db.getAllFromIndex("entradas", "por-fecha");
  return todas.reverse(); // más recientes primero
}

export async function guardarEntrada(entrada: Entrada): Promise<void> {
  const db = await abrir();
  await db.put("entradas", entrada);
}

export async function borrarEntrada(id: string): Promise<void> {
  const db = await abrir();
  await db.delete("entradas", id);
}

// ---------- Ajustes ----------

export const AJUSTES_INICIALES: Ajustes = {
  tema: "claro",
  transicion: "hoja",
  modoDificil: false,
  mostrarPortada: true,
};

export async function obtenerAjustes(): Promise<Ajustes> {
  const db = await abrir();
  const guardados = (await db.get("ajustes", "config")) as Ajustes | undefined;
  return { ...AJUSTES_INICIALES, ...(guardados ?? {}) };
}

export async function guardarAjustes(ajustes: Ajustes): Promise<void> {
  const db = await abrir();
  await db.put("ajustes", ajustes, "config");
}
