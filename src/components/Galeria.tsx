// Galería tipo polaroid de todas las fotos del diario

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Images } from "lucide-react";
import type { Entrada } from "../types";
import { urlDeFoto } from "../lib/utils";

export interface FotoGaleria {
  entrada: Entrada;
  fotoId: string;
  url: string;
  descripcion?: string;
}

interface Props {
  entradas: Entrada[];
  onAbrir: (foto: FotoGaleria, indice: number) => void;
}

export function Galeria({ entradas, onAbrir }: Props) {
  const fotos = useMemo<FotoGaleria[]>(() => {
    const lista: FotoGaleria[] = [];
    for (const entrada of entradas) {
      for (const foto of entrada.fotos) {
        lista.push({
          entrada,
          fotoId: foto.id,
          url: urlDeFoto(foto.blob),
          descripcion: foto.descripcion,
        });
      }
    }
    return lista.reverse();
  }, [entradas]);

  if (fotos.length === 0) {
    return (
      <div className="papel mx-auto max-w-md rounded-2xl p-10 text-center">
        <Images className="mx-auto mb-3 h-10 w-10 texto-suave" />
        <p className="font-mano text-2xl text-[var(--tinta)]">
          Todavía no hay fotos. Añádelas desde cualquier entrada.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h2 className="mb-4 font-mano text-3xl text-[var(--tinta)]">Fotos</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fotos.map((foto, i) => (
          <motion.button
            key={foto.fotoId}
            initial={{ opacity: 0, y: 20, rotate: i % 2 === 0 ? -2 : 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.05 }}
            whileHover={{ rotate: 0, scale: 1.03 }}
            whileTap={{ scale: 0.95, rotate: 0 }}
            onClick={() => onAbrir(foto, i)}
            className="bg-white p-2 pb-3 shadow-md dark:bg-[#2b2530]"
            style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)` }}
          >
            <img
              src={foto.url}
              alt={foto.descripcion ?? "Foto del diario"}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <p className="mt-2 truncate px-1 text-left font-mano text-base text-[#3a3145] dark:text-[#e8e2f2]">
              {foto.descripcion || new Date(foto.entrada.fecha).toLocaleDateString("es-ES")}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
