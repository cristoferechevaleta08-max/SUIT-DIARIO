// Navegación inferior entre páginas del diario

import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Images, Settings, StickyNote } from "lucide-react";
import type { Vista } from "../types";

interface Props {
  vista: Vista;
  onCambiar: (vista: Vista) => void;
}

const PAGINAS: { id: Vista; etiqueta: string; Icono: typeof BookOpen }[] = [
  { id: "entradas", etiqueta: "Entradas", Icono: BookOpen },
  { id: "apuntes", etiqueta: "Apuntes", Icono: StickyNote },
  { id: "calendario", etiqueta: "Calendario", Icono: CalendarDays },
  { id: "galeria", etiqueta: "Fotos", Icono: Images },
  { id: "ajustes", etiqueta: "Ajustes", Icono: Settings },
];

export function Navegacion({ vista, onCambiar }: Props) {
  return (
    <nav className="papel sin-scroll fixed inset-x-0 bottom-0 z-30 flex justify-around border-t px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_24px_var(--sombra)]">
      {PAGINAS.map(({ id, etiqueta, Icono }) => {
        const activa = vista === id;
        return (
          <motion.button
            key={id}
            whileTap={{ scale: 0.82 }}
            onClick={() => onCambiar(id)}
            className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 outline-none"
            aria-label={etiqueta}
            aria-current={activa ? "page" : undefined}
          >
            {activa && (
              <motion.span
                layoutId="pastilla-nav"
                className="absolute inset-0 rounded-xl bg-[var(--acento-suave)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icono
              className={`relative h-6 w-6 ${activa ? "text-[var(--acento)]" : "texto-suave"}`}
            />
            <span
              className={`relative text-[0.65rem] font-semibold ${
                activa ? "text-[var(--acento)]" : "texto-suave"
              }`}
            >
              {etiqueta}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
