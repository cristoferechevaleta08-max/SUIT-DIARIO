// Portada del cuaderno cerrado con animación de apertura en 3D

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";

interface Props {
  onAbrir: () => void;
}

export function Portada({ onAbrir }: Props) {
  const reduceMotion = useReducedMotion();
  const [abriendo, setAbriendo] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  const duracion = reduceMotion ? 0.15 : 1.2;

  const abrir = () => {
    if (abriendo) return;
    setAbriendo(true);
    // Dejar que la tapa gire antes de desvanecer toda la portada
    setTimeout(() => setSaliendo(true), (duracion * 1000) / 1.6);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fondo)]"
      animate={saliendo ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.45 }}
      onAnimationComplete={() => saliendo && onAbrir()}
      style={{ perspective: 1400 }}
    >
      <motion.button
        onClick={abrir}
        aria-label="Abrir mi refugio"
        className="relative outline-none"
        animate={abriendo && !reduceMotion ? { scale: 1.04, y: -6 } : { scale: 1, y: 0 }}
        transition={{ duration: duracion, ease: "easeOut" }}
      >
        {/* Lomo y páginas interiores que se revelan al abrir la tapa */}
        <div
          className="relative h-[26rem] w-[17rem] sm:h-[30rem] sm:w-[20rem]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 rounded-r-2xl rounded-l-md bg-[var(--papel)] shadow-[0_25px_60px_var(--sombra)]">
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <Heart className="h-8 w-8 text-[var(--acento)]" fill="currentColor" />
              <p className="font-mano text-2xl text-[var(--tinta)]">Este cuaderno te espera</p>
              <p className="texto-suave text-sm">toca la tapa para entrar</p>
            </div>
          </div>

          {/* Tapa del cuaderno */}
          <motion.div
            className="absolute inset-0 origin-left rounded-r-2xl rounded-l-md shadow-[0_25px_60px_var(--sombra)]"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, var(--acento) 0%, var(--acento-suave) 100%)",
            }}
            animate={abriendo ? { rotateY: reduceMotion ? 0 : -165 } : { rotateY: 0 }}
            transition={{ duration: duracion, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex h-full flex-col items-center justify-between py-10">
              <div className="mt-6 rounded-full border-2 border-white/40 bg-white/15 p-6 backdrop-blur-sm">
                <Heart className="h-12 w-12 text-white" fill="currentColor" />
              </div>
              <div className="text-center">
                <h1 className="font-mano text-5xl font-bold text-white drop-shadow-sm">Mi Refugio</h1>
                <p className="mt-2 text-sm text-white/80">un lugar seguro para tus días</p>
              </div>
              <div className="mb-6 h-1.5 w-24 rounded-full bg-white/30" />
            </div>
          </motion.div>
        </div>
      </motion.button>

      <motion.button
        onClick={abrir}
        className="absolute bottom-8 right-8 rounded-full px-4 py-2 text-sm texto-suave hover:underline"
        animate={{ opacity: abriendo ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        omitir →
      </motion.button>
    </motion.div>
  );
}
