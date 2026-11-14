// Envoltorio de página: transición de hoja (rotateY) o suave (fade + desplazamiento)

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useAjustes } from "../hooks/useAjustes";

interface Props {
  clave: string;
  children: ReactNode;
}

export function PaginaTransicion({ clave, children }: Props) {
  const { ajustes } = useAjustes();
  const reduceMotion = useReducedMotion();

  // Con prefers-reduced-motion solo usamos opacidad
  if (reduceMotion) {
    return (
      <motion.section
        key={clave}
        className="flex-1 overflow-y-auto px-4 pb-28 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.section>
    );
  }

  // Duración más lenta y amable en modo días difíciles
  const factor = ajustes.modoDificil ? 1.5 : 1;

  if (ajustes.transicion === "suave") {
    return (
      <motion.section
        key={clave}
        className="flex-1 overflow-y-auto px-4 pb-28 pt-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3 * factor, ease: "easeOut" }}
      >
        {children}
      </motion.section>
    );
  }

  // Efecto de hoja de papel: rotación en Y con sombra en el lomo
  return (
    <motion.section
      key={clave}
      className="flex-1 overflow-y-auto px-4 pb-28 pt-4"
      style={{ transformOrigin: "left center" }}
      initial={{
        opacity: 0.4,
        rotateY: 28,
        boxShadow: "24px 0 48px var(--sombra)",
      }}
      animate={{
        opacity: 1,
        rotateY: 0,
        boxShadow: "0 0 0 var(--sombra)",
      }}
      exit={{
        opacity: 0,
        rotateY: -14,
        boxShadow: "-24px 0 48px var(--sombra)",
      }}
      transition={{ duration: 0.42 * factor, ease: [0.3, 0.1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}
