// Hook para leer y escribir entradas del diario

import { useCallback, useEffect, useState } from "react";
import type { Entrada } from "../types";
import { borrarEntrada, guardarEntrada, obtenerEntradas } from "../lib/db";

export function useEntradas() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    const todas = await obtenerEntradas();
    setEntradas(todas);
    setCargando(false);
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const guardar = useCallback(
    async (entrada: Entrada) => {
      await guardarEntrada(entrada);
      await recargar();
    },
    [recargar]
  );

  const borrar = useCallback(
    async (id: string) => {
      await borrarEntrada(id);
      await recargar();
    },
    [recargar]
  );

  return { entradas, cargando, guardar, borrar, recargar };
}
