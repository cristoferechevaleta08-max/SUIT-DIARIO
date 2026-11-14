// Pantalla de bloqueo con PIN de 4 dígitos

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Delete, Lock } from "lucide-react";
import { hashPin } from "../lib/utils";

interface Props {
  pinHash: string;
  onDesbloquear: () => void;
}

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "borrar"];

export function PantallaPin({ pinHash, onDesbloquear }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const reduceMotion = useReducedMotion();

  const pulsar = async (tecla: string) => {
    if (error && pin.length < 4) setError(false);
    if (tecla === "borrar") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!tecla || pin.length >= 4) return;
    const nuevo = pin + tecla;
    setPin(nuevo);
    if (nuevo.length === 4) {
      const hash = await hashPin(nuevo);
      if (hash === pinHash) {
        setTimeout(onDesbloquear, 150);
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, reduceMotion ? 100 : 650);
      }
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 bg-[var(--fondo)] p-6">
      <motion.div
        animate={error && !reduceMotion ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="rounded-full bg-[var(--acento-suave)] p-5">
          <Lock className="h-8 w-8 text-[var(--acento)]" />
        </div>
        <p className="font-mano text-3xl text-[var(--tinta)]">
          {error ? "PIN incorrecto, intenta otra vez" : "¿Cuál es tu PIN?"}
        </p>
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full transition-colors ${
                i < pin.length ? "bg-[var(--acento)]" : "bg-[var(--papel-borde)]"
              }`}
            />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {TECLAS.map((tecla, i) =>
          tecla === "" ? (
            <div key={i} />
          ) : (
            <motion.button
              key={i}
              whileTap={{ scale: 0.88 }}
              onClick={() => void pulsar(tecla)}
              className="papel flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-[var(--tinta)] shadow-sm"
              aria-label={tecla === "borrar" ? "Borrar" : `Número ${tecla}`}
            >
              {tecla === "borrar" ? <Delete className="h-5 w-5" /> : tecla}
            </motion.button>
          )
        )}
      </div>
    </div>
  );
}
