// Visor a pantalla completa de una foto (efecto polaroid al expandir)

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Trash2, X } from "lucide-react";
import type { FotoGaleria } from "./Galeria";

interface Props {
  foto: FotoGaleria;
  onCerrar: () => void;
  onBorrar: (entradaId: string, fotoId: string) => void;
  onIrEntrada: (entradaId: string) => void;
}

export function Lightbox({ foto, onCerrar, onBorrar, onIrEntrada }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/85 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCerrar}
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { scale: 0.5, rotate: -4 }}
        animate={reduceMotion ? { opacity: 1 } : { scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white p-3 pb-4 shadow-2xl dark:bg-[#2b2530]"
      >
        <img
          src={foto.url}
          alt={foto.descripcion ?? "Foto del diario"}
          className="max-h-[60vh] w-full object-contain"
        />
        <p className="mt-3 px-1 text-center font-mano text-xl text-[#3a3145] dark:text-[#e8e2f2]">
          {foto.descripcion || "Sin descripción"}
        </p>

        <div className="mt-3 flex justify-center gap-3">
          <button
            onClick={() => onIrEntrada(foto.entrada.id)}
            className="flex items-center gap-1.5 rounded-full bg-[var(--acento-suave)] px-4 py-2 text-sm font-semibold text-[var(--tinta)]"
          >
            <BookOpen className="h-4 w-4" /> Ver entrada
          </button>
          <button
            onClick={() => onBorrar(foto.entrada.id, foto.fotoId)}
            className="flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300"
          >
            <Trash2 className="h-4 w-4" /> Borrar foto
          </button>
        </div>
      </motion.div>

      <button
        onClick={onCerrar}
        className="rounded-full bg-white/15 p-3 text-white"
        aria-label="Cerrar foto"
      >
        <X className="h-6 w-6" />
      </button>
    </motion.div>
  );
}
