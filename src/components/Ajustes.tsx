// Ajustes: tema, transición, portada, PIN, modo difícil y respaldos

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Eye,
  HeartHandshake,
  KeyRound,
  Moon,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Wind,
} from "lucide-react";
import type { Entrada } from "../types";
import { useAjustes } from "../hooks/useAjustes";
import {
  descargarArchivo,
  exportarDiario,
  importarDiario,
} from "../lib/utils";

interface Props {
  entradas: Entrada[];
  onImportar: (entradas: Entrada[]) => void;
  onAviso: (mensaje: string) => void;
}

export function Ajustes({ entradas, onImportar, onAviso }: Props) {
  const { ajustes, cambiarTema, cambiarTransicion, alternarModoDificil, fijarPin, fijarPortada } =
    useAjustes();
  const inputImportar = useRef<HTMLInputElement>(null);
  const [pinNuevo, setPinNuevo] = useState("");
  const [editandoPin, setEditandoPin] = useState(false);
  const [exportando, setExportando] = useState(false);

  const exportar = async () => {
    setExportando(true);
    try {
      const json = await exportarDiario(entradas);
      const fecha = new Date().toISOString().slice(0, 10);
      descargarArchivo(json, `mi-refugio-respaldo-${fecha}.json`);
      onAviso("Respaldo descargado 💾");
    } catch {
      onAviso("No se pudo exportar");
    }
    setExportando(false);
  };

  const importar = async (archivo: File | undefined) => {
    if (!archivo) return;
    try {
      const texto = await archivo.text();
      const entradasImportadas = await importarDiario(texto);
      onImportar(entradasImportadas);
      onAviso(`Se importaron ${entradasImportadas.length} entradas 📖`);
    } catch (error) {
      onAviso(error instanceof Error ? error.message : "Archivo no válido");
    }
  };

  const guardarPin = async () => {
    if (pinNuevo.length === 4) {
      await fijarPin(pinNuevo);
      setPinNuevo("");
      setEditandoPin(false);
      onAviso("PIN guardado con hash 🔒");
    } else {
      onAviso("El PIN debe tener 4 dígitos");
    }
  };

  const fila = "papel flex items-center justify-between gap-3 rounded-2xl p-4";
  const botonOpcion = (activa: boolean) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
      activa ? "bg-[var(--acento)] text-white" : "bg-[var(--acento-suave)] text-[var(--tinta)]"
    }`;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <h2 className="font-mano text-3xl text-[var(--tinta)]">Ajustes</h2>

      {/* Tema */}
      <div className={fila}>
        <span className="flex items-center gap-2 text-[var(--tinta)]">
          {ajustes.tema === "claro" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          Tema
        </span>
        <div className="flex gap-2">
          <button className={botonOpcion(ajustes.tema === "claro")} onClick={() => cambiarTema("claro")}>
            Claro
          </button>
          <button className={botonOpcion(ajustes.tema === "oscuro")} onClick={() => cambiarTema("oscuro")}>
            Oscuro
          </button>
        </div>
      </div>

      {/* Transición */}
      <div className={fila}>
        <span className="flex items-center gap-2 text-[var(--tinta)]">
          <Wind className="h-5 w-5" /> Cambio de página
        </span>
        <div className="flex gap-2">
          <button className={botonOpcion(ajustes.transicion === "hoja")} onClick={() => cambiarTransicion("hoja")}>
            Hoja
          </button>
          <button className={botonOpcion(ajustes.transicion === "suave")} onClick={() => cambiarTransicion("suave")}>
            Suave
          </button>
        </div>
      </div>

      {/* Portada */}
      <div className={fila}>
        <span className="flex items-center gap-2 text-[var(--tinta)]">
          <Eye className="h-5 w-5" /> Ver portada al abrir
        </span>
        <button className={botonOpcion(ajustes.mostrarPortada)} onClick={() => fijarPortada(!ajustes.mostrarPortada)}>
          {ajustes.mostrarPortada ? "Sí" : "No"}
        </button>
      </div>

      {/* PIN */}
      <div className={fila + " flex-col items-stretch"}>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[var(--tinta)]">
            <KeyRound className="h-5 w-5" /> Bloqueo con PIN
          </span>
          {ajustes.pinHash ? (
            <div className="flex gap-2">
              <button
                className={botonOpcion(false)}
                onClick={() => {
                  setEditandoPin(true);
                  setPinNuevo("");
                }}
              >
                Cambiar
              </button>
              <button
                className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300"
                onClick={() => {
                  void fijarPin(null);
                  onAviso("Bloqueo quitado");
                }}
              >
                <Trash2 className="inline h-4 w-4" /> Quitar
              </button>
            </div>
          ) : (
            <button
              className={botonOpcion(false)}
              onClick={() => {
                setEditandoPin(true);
                setPinNuevo("");
              }}
            >
              Activar
            </button>
          )}
        </div>
        {editandoPin && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
            <div className="flex gap-2">
              <input
                value={pinNuevo}
                onChange={(e) => setPinNuevo(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="····"
                className="papel w-32 rounded-xl px-4 py-2 text-center text-xl tracking-[0.4em] text-[var(--tinta)] outline-none"
              />
              <button className={botonOpcion(true)} onClick={() => void guardarPin()}>
                Guardar
              </button>
              <button className={botonOpcion(false)} onClick={() => setEditandoPin(false)}>
                Cancelar
              </button>
            </div>
            <p className="texto-suave mt-1 text-xs">Se guarda como hash, nunca en texto plano.</p>
          </motion.div>
        )}
      </div>

      {/* Modo días difíciles */}
      <div className={fila}>
        <span className="flex items-center gap-2 text-[var(--tinta)]">
          <HeartHandshake className="h-5 w-5" /> Modo días difíciles
        </span>
        <button className={botonOpcion(ajustes.modoDificil)} onClick={alternarModoDificil}>
          {ajustes.modoDificil ? "Activo 💗" : "Apagado"}
        </button>
      </div>

      {/* Respaldo */}
      <div className={fila + " flex-col items-stretch"}>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[var(--tinta)]">
            <Sparkles className="h-5 w-5" /> Copia de seguridad
          </span>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => void exportar()}
              disabled={exportando}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--acento-suave)] px-4 py-2 text-sm font-semibold text-[var(--tinta)] disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Exportar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => inputImportar.current?.click()}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--acento-suave)] px-4 py-2 text-sm font-semibold text-[var(--tinta)]"
            >
              <Upload className="h-4 w-4" /> Importar
            </motion.button>
          </div>
        </div>
        <input
          ref={inputImportar}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            void importar(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <p className="texto-suave mt-2 text-xs">
          Exportar guarda todo (con fotos) en un archivo JSON. Importar añade las entradas del archivo a las tuyas.
        </p>
      </div>

      <p className="texto-suave pb-4 text-center text-xs">
        Todo vive solo en este dispositivo. Sin cuentas, sin servidores. 💜
      </p>
    </div>
  );
}
