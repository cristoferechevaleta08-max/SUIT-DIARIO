// Selector de color de tarjeta

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Props {
  colores: string[];
  valor: string;
  onChange: (color: string) => void;
}

export function SelectorColor({ colores, valor, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {colores.map((color) => (
        <motion.button
          key={color}
          type="button"
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => onChange(color)}
          aria-label={`Color ${color}`}
          aria-pressed={valor === color}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--papel-borde)] shadow-sm"
          style={{ background: color }}
        >
          {valor === color && <Check className="h-4 w-4 text-[var(--tinta)]" />}
        </motion.button>
      ))}
    </div>
  );
}
