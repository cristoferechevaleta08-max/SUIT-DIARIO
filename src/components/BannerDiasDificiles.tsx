// Banner del modo días difíciles: frase de acompañamiento y pregunta guía opcional

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HeartHandshake, RefreshCw } from "lucide-react";
import { FRASES_DIAS_DIFICILES, PREGUNTAS_GUIA } from "../lib/datos";
import { useAjustes } from "../hooks/useAjustes";
import { ApoyoModoDificil } from "./ApoyoModoDificil";

export function BannerDiasDificiles() {
  const { ajustes } = useAjustes();
  const [mostrarPregunta, setMostrarPregunta] = useState(false);

  // Frase y pregunta que rotan sin repetir en la misma sesión
  const frase = useMemo(() => {
    const indice = Math.floor(Math.random() * FRASES_DIAS_DIFICILES.length);
    return FRASES_DIAS_DIFICILES[indice];
  }, []);

  const [indicePregunta, setIndicePregunta] = useState(
    () => Math.floor(Math.random() * PREGUNTAS_GUIA.length)
  );

  if (!ajustes.modoDificil) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="papel mx-auto mb-4 w-full max-w-2xl rounded-2xl p-4"
    >
      <p className="flex items-start gap-2 font-mano text-2xl leading-snug text-[var(--tinta)]">
        <HeartHandshake className="mt-1 h-5 w-5 shrink-0 text-[var(--acento)]" />
        {frase}
      </p>

      <button
        onClick={() => setMostrarPregunta((v) => !v)}
        className="texto-suave mt-2 flex items-center gap-1 text-sm"
      >
        {mostrarPregunta ? "Ocultar pregunta guía" : "¿Quieres una pregunta guía?"}
        <motion.span animate={{ rotate: mostrarPregunta ? 180 : 0 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {mostrarPregunta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-[var(--acento-suave)] px-4 py-3">
              <p className="font-mano text-xl text-[var(--tinta)]">
                {PREGUNTAS_GUIA[indicePregunta]}
              </p>
              <motion.button
                whileTap={{ rotate: 180, scale: 0.9 }}
                onClick={() =>
                  setIndicePregunta((i) => (i + 1) % PREGUNTAS_GUIA.length)
                }
                className="shrink-0 rounded-full p-1.5 text-[var(--tinta)]"
                aria-label="Otra pregunta"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
            </div>
            <p className="texto-suave mt-1 text-xs">
              Solo si quieres. Está bien ignorarla.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3">
        <ApoyoModoDificil />
      </div>
    </motion.div>
  );
}
