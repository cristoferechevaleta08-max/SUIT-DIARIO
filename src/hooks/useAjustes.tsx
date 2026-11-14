// Contexto global de ajustes: tema, transición, PIN y modo días difíciles

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Ajustes, Tema, TipoTransicion } from "../types";
import { AJUSTES_INICIALES, guardarAjustes, obtenerAjustes } from "../lib/db";
import { hashPin } from "../lib/utils";

interface ContextoAjustes {
  ajustes: Ajustes;
  listos: boolean;
  cambiarTema: (tema: Tema) => void;
  cambiarTransicion: (transicion: TipoTransicion) => void;
  alternarModoDificil: () => void;
  fijarPin: (pin: string | null) => Promise<void>;
  fijarPortada: (mostrar: boolean) => void;
}

const Contexto = createContext<ContextoAjustes | null>(null);

export function ProveedorAjustes({ children }: { children: ReactNode }) {
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_INICIALES);
  const [listos, setListos] = useState(false);

  useEffect(() => {
    obtenerAjustes().then((guardados) => {
      setAjustes(guardados);
      setListos(true);
    });
  }, []);

  // Aplicar clases de tema y modo difícil al documento
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle("dark", ajustes.tema === "oscuro");
    raiz.classList.toggle("modo-dificil", ajustes.modoDificil);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        "content",
        ajustes.modoDificil ? "#c99a7e" : ajustes.tema === "oscuro" ? "#17141f" : "#8b7fa8"
      );
    }
  }, [ajustes.tema, ajustes.modoDificil]);

  const persistir = useCallback((nuevos: Ajustes) => {
    setAjustes(nuevos);
    void guardarAjustes(nuevos);
  }, []);

  const cambiarTema = useCallback(
    (tema: Tema) => persistir({ ...ajustes, tema }),
    [ajustes, persistir]
  );

  const cambiarTransicion = useCallback(
    (transicion: TipoTransicion) => persistir({ ...ajustes, transicion }),
    [ajustes, persistir]
  );

  const alternarModoDificil = useCallback(
    () => persistir({ ...ajustes, modoDificil: !ajustes.modoDificil }),
    [ajustes, persistir]
  );

  const fijarPin = useCallback(
    async (pin: string | null) => {
      const pinHash = pin ? await hashPin(pin) : undefined;
      persistir({ ...ajustes, pinHash });
    },
    [ajustes, persistir]
  );

  const fijarPortada = useCallback(
    (mostrarPortada: boolean) => persistir({ ...ajustes, mostrarPortada }),
    [ajustes, persistir]
  );

  return (
    <Contexto.Provider
      value={{ ajustes, listos, cambiarTema, cambiarTransicion, alternarModoDificil, fijarPin, fijarPortada }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAjustes(): ContextoAjustes {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAjustes debe usarse dentro de ProveedorAjustes");
  return contexto;
}
