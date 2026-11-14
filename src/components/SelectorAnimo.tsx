// Selector de estado de ánimo con emojis y colores

import { motion } from "framer-motion";
import { ANIMOS, ORDEN_ANIMOS } from "../lib/datos";
import type { Animo } from "../types";

interface Props {
  valor: Animo;
  onChange: (animo: Animo) => void;
}

export function SelectorAnimo({ valor, onChange }: Props) {
  return (
    <div>
      <p className="texto-suave mb-2 text-sm font-semibold">¿Cómo estás hoy?</p>
      <div className="flex flex-wrap gap-2">
        {ORDEN_ANIMOS.map((id) => {
          const info = ANIMOS[id];
          const activo = valor === id;
          return (
            <motion.button
              key={id}
              type="button"
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => onChange(id)}
              aria-label={info.etiqueta}
              aria-pressed={activo}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                activo
                  ? "border-[var(--acento)] bg-[var(--acento-suave)] text-[var(--tinta)]"
                  : "papel texto-suave"
              }`}
            >
              <span className="relative flex items-center">
                {info.emoji}
                <span
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full"
                  style={{ background: info.hex }}
                />
              </span>
              {info.etiqueta}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
