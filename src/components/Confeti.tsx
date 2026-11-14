// Pequeña celebración al guardar: corazones y confeti que se desvanecen

import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAjustes } from "../hooks/useAjustes";

interface Props {
  onTerminar: () => void;
}

interface Particula {
  id: number;
  x: number;
  retraso: number;
  escala: number;
  emoji?: string;
  color?: string;
}

export function Confeti({ onTerminar }: Props) {
  const { ajustes } = useAjustes();
  const reduceMotion = useReducedMotion();
  const factor = ajustes.modoDificil ? 1.6 : 1;

  const particulas = useMemo<Particula[]>(() => {
    const colores = ["#e8b64c", "#c76a8a", "#7fb692", "#8b7fa8", "#c98a5e"];
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      retraso: Math.random() * 0.3,
      escala: 0.6 + Math.random() * 0.9,
      // En días difíciles solo corazones suaves; en modo normal, mezcla
      emoji: ajustes.modoDificil || i % 2 === 0 ? "💗" : undefined,
      color: colores[i % colores.length],
    }));
  }, [ajustes.modoDificil]);

  useEffect(() => {
    const t = setTimeout(onTerminar, 1800 * factor);
    return () => clearTimeout(t);
  }, [onTerminar, factor]);

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {particulas.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-1/4"
          style={{ left: `${p.x}%` }}
          initial={{ opacity: 0, y: 40, scale: 0.4 }}
          animate={{ opacity: [0, 1, 1, 0], y: -180 - Math.random() * 120, rotate: (Math.random() - 0.5) * 90 }}
          transition={{ duration: 1.4 * factor, delay: p.retraso, ease: "easeOut" }}
        >
          {p.emoji ? (
            <span style={{ fontSize: `${p.escala * 1.4}rem` }}>{p.emoji}</span>
          ) : (
            <div
              className="h-3 w-3 rounded-sm"
              style={{ background: p.color, transform: `scale(${p.escala})` }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
