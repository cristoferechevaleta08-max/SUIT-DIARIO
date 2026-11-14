// Mural de "apuntes locos": post-its desordenados que se pueden arrastrar

import { useRef } from "react";
import { motion } from "framer-motion";
import { StickyNote } from "lucide-react";
import type { Entrada } from "../types";
import { textoPlano } from "../lib/utils";
import { useAjustes } from "../hooks/useAjustes";

interface Props {
  entradas: Entrada[];
  onAbrir: (entrada: Entrada) => void;
  onPosicion: (id: string, posicion: { x: number; y: number; rotacion: number }) => void;
}

export function ApuntesLocos({ entradas, onAbrir, onPosicion }: Props) {
  const mural = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);
  const { ajustes } = useAjustes();

  const crearPosicion = () => ({
    x: 8 + Math.random() * 40,
    y: 8 + Math.random() * 55,
    rotacion: (Math.random() - 0.5) * 14,
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-mano text-3xl text-[var(--tinta)]">Apuntes locos</h2>
          <p className="texto-suave text-sm">
            Ideas sueltas, sueños, impulsos. Sin orden ni reglas.
          </p>
        </div>
      </div>

      {entradas.length === 0 ? (
        <div className="papel rounded-2xl p-10 text-center">
          <StickyNote className="mx-auto mb-3 h-10 w-10 texto-suave" />
          <p className="font-mano text-2xl text-[var(--tinta)]">
            El mural está vacío… pega tu primer post-it
          </p>
        </div>
      ) : (
        <div
          ref={mural}
          className="relative min-h-[30rem] w-full"
          style={{ touchAction: "none" }}
        >
          {entradas.map((entrada, i) => {
            const pos = entrada.posicion ?? crearPosicion();
            return (
              <motion.div
                key={entrada.id}
                drag
                dragMomentum={false}
                dragElastic={0.15}
                initial={{ opacity: 0, scale: 0.6, rotate: pos.rotacion }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: Math.min(i, 8) * 0.06,
                  duration: ajustes.modoDificil ? 0.5 : 0.3,
                }}
                whileDrag={{ scale: 1.08, zIndex: 20, rotate: 0 }}
                onDragStart={() => (arrastrando.current = true)}
                onDragEnd={(_, info) => {
                  setTimeout(() => (arrastrando.current = false), 50);
                  // Guardar posición relativa al mural (en porcentaje aproximado)
                  const contenedor = mural.current;
                  if (!contenedor) return;
                  const rect = contenedor.getBoundingClientRect();
                  const actual = entrada.posicion ?? pos;
                  onPosicion(entrada.id, {
                    x: Math.min(90, Math.max(0, actual.x + (info.offset.x / rect.width) * 100)),
                    y: Math.min(85, Math.max(0, actual.y + (info.offset.y / rect.height) * 100)),
                    rotacion: pos.rotacion,
                  });
                }}
                onTap={() => {
                  if (!arrastrando.current) onAbrir(entrada);
                }}
                className="absolute w-40 cursor-grab rounded-lg p-3 shadow-lg active:cursor-grabbing sm:w-44"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  rotate: pos.rotacion,
                  background: entrada.color,
                  color: "#3a3145",
                  touchAction: "none",
                }}
              >
                <p className="line-clamp-4 break-words text-sm leading-snug">
                  {textoPlano(entrada.texto) || "(vacío)"}
                </p>
                <p className="mt-2 text-[0.65rem] opacity-60">
                  {new Date(entrada.fecha).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="texto-suave mt-4 text-center text-xs">
        Arrastra los post-its para reordenar el mural · tócalos para editar
      </p>
    </div>
  );
}
