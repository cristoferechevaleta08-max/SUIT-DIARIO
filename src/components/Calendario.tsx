// Calendario mensual: cada día con entrada muestra el color de su ánimo

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import type { Entrada } from "../types";
import { ANIMOS } from "../lib/datos";
import { claveDia } from "../lib/utils";

interface Props {
  entradas: Entrada[];
  onAbrirDia: (entradas: Entrada[]) => void;
}

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function Calendario({ entradas, onAbrirDia }: Props) {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const porDia = useMemo(() => {
    const mapa = new Map<string, Entrada[]>();
    for (const entrada of entradas) {
      const clave = claveDia(entrada.fecha);
      mapa.set(clave, [...(mapa.get(clave) ?? []), entrada]);
    }
    return mapa;
  }, [entradas]);

  const moverMes = (delta: number) => {
    const nuevo = new Date(anio, mes + delta, 1);
    setMes(nuevo.getMonth());
    setAnio(nuevo.getFullYear());
  };

  // Cuadrícula empezando en lunes
  const primerDia = new Date(anio, mes, 1);
  const desplazamiento = (primerDia.getDay() + 6) % 7;
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const celdas: (number | null)[] = [
    ...Array.from({ length: desplazamiento }, () => null),
    ...Array.from({ length: diasMes }, (_, i) => i + 1),
  ];

  const claveHoy = claveDia(hoy.toISOString());

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => moverMes(-1)}
          className="papel rounded-full p-2 text-[var(--tinta)]"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        <h2 className="font-mano text-3xl capitalize text-[var(--tinta)]">
          {MESES[mes]} {anio}
        </h2>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => moverMes(1)}
          className="papel rounded-full p-2 text-[var(--tinta)]"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="papel rounded-2xl p-3 shadow-sm">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold texto-suave">
          {DIAS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <motion.div
          key={`${anio}-${mes}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-7 gap-1"
        >
          {celdas.map((dia, i) => {
            if (dia === null) return <div key={`vacio-${i}`} />;
            const clave = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
            const delDia = porDia.get(clave) ?? [];
            const esHoy = clave === claveHoy;
            return (
              <motion.button
                key={clave}
                whileTap={{ scale: 0.88 }}
                onClick={() => delDia.length > 0 && onAbrirDia(delDia)}
                disabled={delDia.length === 0}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
                  delDia.length > 0 ? "papel font-semibold text-[var(--tinta)] shadow-sm" : "texto-suave"
                } ${esHoy ? "ring-2 ring-[var(--acento)]" : ""}`}
              >
                {dia}
                {delDia.length > 0 && (
                  <span className="mt-0.5 flex items-center gap-0.5">
                    {delDia.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: ANIMOS[e.animo].hex }}
                        title={ANIMOS[e.animo].etiqueta}
                      />
                    ))}
                    {delDia.some((e) => e.modoDificil) && (
                      <Heart className="h-2.5 w-2.5 text-[var(--acento)]" fill="currentColor" />
                    )}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <p className="texto-suave mt-3 text-center text-xs">
        Toca un día con puntos para abrir su entrada
      </p>
    </div>
  );
}
