// Lista de entradas con búsqueda por texto, etiqueta y ánimo

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Image as ImageIcon, Search, X } from "lucide-react";
import type { Animo, Entrada } from "../types";
import { ANIMOS, ORDEN_ANIMOS } from "../lib/datos";
import { fechaCorta, textoPlano, urlDeFoto } from "../lib/utils";

interface Props {
  entradas: Entrada[];
  onAbrir: (entrada: Entrada) => void;
}

export function ListaEntradas({ entradas, onAbrir }: Props) {
  const [consulta, setConsulta] = useState("");
  const [animoFiltro, setAnimoFiltro] = useState<Animo | null>(null);

  const resultados = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    return entradas.filter((e) => {
      if (e.tipo !== "diario") return false;
      if (animoFiltro && e.animo !== animoFiltro) return false;
      if (!q) return true;
      if (q.startsWith("#")) {
        const etiqueta = q.slice(1);
        return e.etiquetas.some((et) => et.includes(etiqueta));
      }
      return (
        (e.titulo ?? "").toLowerCase().includes(q) ||
        textoPlano(e.texto).toLowerCase().includes(q) ||
        e.etiquetas.some((et) => et.includes(q))
      );
    });
  }, [entradas, consulta, animoFiltro]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 texto-suave" />
        <input
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar texto, #etiqueta…"
          className="papel w-full rounded-full py-3 pl-11 pr-10 text-[var(--tinta)] outline-none focus:ring-2 focus:ring-[var(--acento-suave)]"
        />
        {consulta && (
          <button
            onClick={() => setConsulta("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 texto-suave"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="sin-scroll flex gap-2 overflow-x-auto pb-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setAnimoFiltro(null)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
            !animoFiltro ? "bg-[var(--acento)] text-white" : "papel texto-suave"
          }`}
        >
          Todos
        </motion.button>
        {ORDEN_ANIMOS.map((id) => {
          const activo = animoFiltro === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setAnimoFiltro(activo ? null : id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                activo ? "bg-[var(--acento)] text-white" : "papel texto-suave"
              }`}
            >
              {ANIMOS[id].emoji} {ANIMOS[id].etiqueta}
            </motion.button>
          );
        })}
      </div>

      {resultados.length === 0 ? (
        <p className="texto-suave py-16 text-center font-mano text-2xl">
          {entradas.length === 0
            ? "Tu primera página te está esperando…"
            : "No encontré nada con eso."}
        </p>
      ) : (
        <ul className="space-y-3">
          {resultados.map((entrada, i) => (
            <motion.li
              key={entrada.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 6) * 0.05 }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onAbrir(entrada)}
                className="papel w-full rounded-2xl p-4 text-left shadow-sm"
                style={{ background: entrada.color }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: ANIMOS[entrada.animo].hex }}
                        title={ANIMOS[entrada.animo].etiqueta}
                      />
                      <h3 className="truncate font-mano text-2xl text-[var(--tinta)]">
                        {entrada.titulo || fechaCorta(entrada.fecha)}
                      </h3>
                      {entrada.modoDificil && (
                        <Heart className="h-4 w-4 shrink-0 text-[var(--acento)]" fill="currentColor" />
                      )}
                    </div>
                    <p className="texto-suave mt-1 line-clamp-2 text-sm">
                      {textoPlano(entrada.texto) || "(solo fotos)"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs texto-suave">
                      <span>{fechaCorta(entrada.fecha)}</span>
                      {entrada.etiquetas.map((et) => (
                        <span key={et} className="rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">
                          #{et}
                        </span>
                      ))}
                      {entrada.fotos.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5" /> {entrada.fotos.length}
                        </span>
                      )}
                    </div>
                  </div>
                  {entrada.fotos[0] && (
                    <img
                      src={urlDeFoto(entrada.fotos[0].blob)}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  )}
                </div>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
