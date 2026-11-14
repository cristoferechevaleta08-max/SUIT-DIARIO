// Editor de entradas de diario y apuntes locos

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Save, Trash2, X } from "lucide-react";
import type { Animo, Entrada, Foto, TipoEntrada } from "../types";
import { COLORES_POSTIT, COLORES_TARJETA } from "../lib/datos";
import { comprimirFoto, fechaLarga, uid, urlDeFoto } from "../lib/utils";
import { useAjustes } from "../hooks/useAjustes";
import { EditorTexto } from "./EditorTexto";
import { SelectorAnimo } from "./SelectorAnimo";
import { SelectorColor } from "./SelectorColor";

interface Props {
  entrada: Entrada | null;
  tipo: TipoEntrada;
  onGuardar: (entrada: Entrada) => void;
  onCancelar: () => void;
  onBorrar?: (id: string) => void;
}

export function EditorEntrada({ entrada, tipo, onGuardar, onCancelar, onBorrar }: Props) {
  const { ajustes } = useAjustes();
  const [titulo, setTitulo] = useState(entrada?.titulo ?? "");
  const [texto, setTexto] = useState(entrada?.texto ?? "");
  const [animo, setAnimo] = useState<Animo>(entrada?.animo ?? "neutral");
  const [color, setColor] = useState(
    entrada?.color ?? (tipo === "apunte-loco" ? COLORES_POSTIT[0] : COLORES_TARJETA[0])
  );
  const [etiquetas, setEtiquetas] = useState<string[]>(entrada?.etiquetas ?? []);
  const [etiquetaNueva, setEtiquetaNueva] = useState("");
  const [fotos, setFotos] = useState<Foto[]>(entrada?.fotos ?? []);
  const inputFotos = useRef<HTMLInputElement>(null);
  const inputCamara = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  const agregarFotos = async (archivos: FileList | null) => {
    if (!archivos?.length) return;
    setSubiendo(true);
    const nuevas: Foto[] = [];
    for (const archivo of Array.from(archivos)) {
      if (!archivo.type.startsWith("image/")) continue;
      nuevas.push({ id: uid(), blob: await comprimirFoto(archivo) });
    }
    setFotos((previas) => [...previas, ...nuevas]);
    setSubiendo(false);
  };

  const agregarEtiqueta = () => {
    const limpia = etiquetaNueva.trim().replace(/^#/, "").toLowerCase();
    if (limpia && !etiquetas.includes(limpia)) setEtiquetas([...etiquetas, limpia]);
    setEtiquetaNueva("");
  };

  const guardar = () => {
    if (!texto.trim() && fotos.length === 0) return;
    const ahora = new Date().toISOString();
    onGuardar({
      id: entrada?.id ?? uid(),
      fecha: entrada?.fecha ?? ahora,
      titulo: titulo.trim() || undefined,
      texto,
      tipo,
      animo,
      modoDificil: ajustes.modoDificil,
      color,
      etiquetas,
      fotos,
      posicion: entrada?.posicion,
    });
  };

  const colores = tipo === "apunte-loco" ? COLORES_POSTIT : COLORES_TARJETA;
  const esApunte = tipo === "apunte-loco";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: ajustes.modoDificil ? 0.45 : 0.3, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-mano text-3xl text-[var(--tinta)]">
          {entrada ? "Editar" : esApunte ? "Nuevo apunte loco" : "Nueva entrada"}
        </h2>
        <div className="flex gap-2">
          {entrada && onBorrar && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onBorrar(entrada.id)}
              className="rounded-full bg-[var(--papel-borde)] p-2.5 text-[var(--tinta)]"
              aria-label="Borrar entrada"
            >
              <Trash2 className="h-5 w-5" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onCancelar}
            className="rounded-full bg-[var(--papel-borde)] p-2.5 text-[var(--tinta)]"
            aria-label="Cerrar editor"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {entrada && <p className="texto-suave text-sm">{fechaLarga(entrada.fecha)}</p>}

      {!esApunte && (
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título (opcional)"
          maxLength={80}
          className="papel w-full rounded-2xl px-4 py-3 font-mano text-2xl text-[var(--tinta)] outline-none placeholder:opacity-50 focus:ring-2 focus:ring-[var(--acento-suave)]"
        />
      )}

      <EditorTexto
        valor={texto}
        onChange={setTexto}
        placeholder={esApunte ? "Idea suelta, impulso, sueño, garabato…" : "Querido diario…"}
        filas={esApunte ? 5 : 9}
      />

      {!esApunte && <SelectorAnimo valor={animo} onChange={setAnimo} />}

      <div>
        <p className="texto-suave mb-2 text-sm font-semibold">Color de la tarjeta</p>
        <SelectorColor colores={colores} valor={color} onChange={setColor} />
      </div>

      {!esApunte && (
        <div>
          <p className="texto-suave mb-2 text-sm font-semibold">Etiquetas</p>
          <div className="mb-2 flex flex-wrap gap-2">
            {etiquetas.map((et) => (
              <span
                key={et}
                className="flex items-center gap-1 rounded-full bg-[var(--acento-suave)] px-3 py-1 text-sm text-[var(--tinta)]"
              >
                #{et}
                <button
                  onClick={() => setEtiquetas(etiquetas.filter((x) => x !== et))}
                  aria-label={`Quitar etiqueta ${et}`}
                  className="texto-suave"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            value={etiquetaNueva}
            onChange={(e) => setEtiquetaNueva(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarEtiqueta())}
            placeholder="Añadir etiqueta y Enter"
            className="papel w-full rounded-xl px-4 py-2 text-sm text-[var(--tinta)] outline-none focus:ring-2 focus:ring-[var(--acento-suave)]"
          />
        </div>
      )}

      <div>
        <p className="texto-suave mb-2 text-sm font-semibold">Fotos</p>
        <div className="mb-3 flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => inputFotos.current?.click()}
            className="papel flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--tinta)]"
          >
            <ImagePlus className="h-4 w-4" /> Galería
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => inputCamara.current?.click()}
            className="papel flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--tinta)]"
          >
            <Camera className="h-4 w-4" /> Cámara
          </motion.button>
        </div>
        <input
          ref={inputFotos}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void agregarFotos(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={inputCamara}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            void agregarFotos(e.target.files);
            e.target.value = "";
          }}
        />
        {subiendo && <p className="texto-suave text-sm">Comprimiendo fotos…</p>}
        {fotos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {fotos.map((foto) => (
              <motion.div
                key={foto.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="papel space-y-1.5 rounded-xl p-2"
              >
                <div className="relative">
                  <img
                    src={urlDeFoto(foto.blob)}
                    alt={foto.descripcion ?? "Foto de la entrada"}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setFotos(fotos.filter((f) => f.id !== foto.id))}
                    className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white"
                    aria-label="Quitar foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  value={foto.descripcion ?? ""}
                  onChange={(e) =>
                    setFotos(
                      fotos.map((f) =>
                        f.id === foto.id ? { ...f, descripcion: e.target.value } : f
                      )
                    )
                  }
                  placeholder="Descripción…"
                  className="w-full rounded-md bg-transparent px-1 text-xs text-[var(--tinta)] outline-none placeholder:opacity-50"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={guardar}
        disabled={!texto.trim() && fotos.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--acento)] py-3.5 font-semibold text-white shadow-md disabled:opacity-40"
      >
        <Save className="h-5 w-5" />
        {entrada ? "Guardar cambios" : esApunte ? "Pegar en el mural" : "Guardar entrada"}
      </motion.button>

    </motion.div>
  );
}
