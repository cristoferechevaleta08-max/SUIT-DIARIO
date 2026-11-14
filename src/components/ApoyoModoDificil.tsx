// Sección de apoyo del modo días difíciles: líneas de ayuda (Uruguay)

import { motion } from "framer-motion";
import { Phone, Siren } from "lucide-react";

export function ApoyoModoDificil() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="papel rounded-2xl p-4"
    >
      <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-[var(--tinta)]">
        <Phone className="h-4 w-4 text-[var(--acento)]" />
        Hablar con alguien
      </h3>
      <p className="texto-suave mb-3 text-sm">
        No hace falta que sea una emergencia para llamar. A veces solo ayuda hablar.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href="tel:08000767"
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--acento-suave)] px-4 py-2.5 text-sm font-semibold text-[var(--tinta)]"
        >
          <Phone className="h-4 w-4" /> Línea Vida · 0800 0767
        </a>
        <a
          href="tel:911"
          className="flex items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-200"
        >
          <Siren className="h-4 w-4" /> Emergencias · 911
        </a>
      </div>
      <p className="texto-suave mt-2 text-xs">Si estás en peligro, llama al 911.</p>
    </motion.div>
  );
}
