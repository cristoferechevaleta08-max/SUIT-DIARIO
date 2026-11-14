// Mi Refugio — componente principal

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartCrack, HeartHandshake, Plus } from "lucide-react";
import type { Entrada, TipoEntrada, Vista } from "./types";
import { useAjustes } from "./hooks/useAjustes";
import { useEntradas } from "./hooks/useEntradas";
import { uid } from "./lib/utils";
import { COLORES_POSTIT } from "./lib/datos";
import { Portada } from "./components/Portada";
import { PantallaPin } from "./components/PantallaPin";
import { Navegacion } from "./components/Navegacion";
import { PaginaTransicion } from "./components/PaginaTransicion";
import { Confeti } from "./components/Confeti";
import { EditorEntrada } from "./components/EditorEntrada";
import { ListaEntradas } from "./components/ListaEntradas";
import { ApuntesLocos } from "./components/ApuntesLocos";
import { Calendario } from "./components/Calendario";
import { Galeria, type FotoGaleria } from "./components/Galeria";
import { Lightbox } from "./components/Lightbox";
import { Ajustes as VistaAjustes } from "./components/Ajustes";
import { BannerDiasDificiles } from "./components/BannerDiasDificiles";

interface EstadoEditor {
  tipo: TipoEntrada;
  entrada: Entrada | null;
}

const TITULOS: Record<Vista, string> = {
  entradas: "Mi Refugio",
  apuntes: "Apuntes locos",
  calendario: "Calendario",
  galeria: "Fotos",
  ajustes: "Ajustes",
};

export default function App() {
  const { ajustes, alternarModoDificil } = useAjustes();
  const { entradas, cargando, guardar, borrar, recargar } = useEntradas();

  const [desbloqueado, setDesbloqueado] = useState(false);
  const [portadaAbierta, setPortadaAbierta] = useState(false);
  const [vista, setVista] = useState<Vista>("entradas");
  const [editor, setEditor] = useState<EstadoEditor | null>(null);
  const [confeti, setConfeti] = useState(false);
  const [fotoAbierta, setFotoAbierta] = useState<FotoGaleria | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const mostrarAviso = (mensaje: string) => {
    setAviso(mensaje);
    setTimeout(() => setAviso(null), 2400);
  };

  // ---------- Acciones ----------

  const nuevaEntrada = (tipo: TipoEntrada) => setEditor({ tipo, entrada: null });

  const abrirEntrada = (entrada: Entrada) => setEditor({ tipo: entrada.tipo, entrada });

  const guardarEntrada = async (entrada: Entrada) => {
    // Los apuntes locos nuevos reciben una posición inicial en el mural
    const final: Entrada =
      entrada.tipo === "apunte-loco" && !entrada.posicion
        ? {
            ...entrada,
            posicion: {
              x: 8 + Math.random() * 45,
              y: 10 + Math.random() * 50,
              rotacion: (Math.random() - 0.5) * 14,
            },
            color: entrada.color || COLORES_POSTIT[Math.floor(Math.random() * COLORES_POSTIT.length)],
          }
        : entrada;
    await guardar(final);
    setEditor(null);
    setConfeti(true);
  };

  const borrarEntrada = async (id: string) => {
    await borrar(id);
    setEditor(null);
    mostrarAviso("Entrada borrada");
  };

  const guardarPosicionApunte = (
    id: string,
    posicion: { x: number; y: number; rotacion: number }
  ) => {
    const entrada = entradas.find((e) => e.id === id);
    if (entrada) void guardar({ ...entrada, posicion });
  };

  const borrarFoto = async (entradaId: string, fotoId: string) => {
    const entrada = entradas.find((e) => e.id === entradaId);
    if (!entrada) return;
    await guardar({ ...entrada, fotos: entrada.fotos.filter((f) => f.id !== fotoId) });
    setFotoAbierta(null);
    mostrarAviso("Foto borrada");
  };

  const importar = async (entradasImportadas: Entrada[]) => {
    const existentes = new Set(entradas.map((e) => e.id));
    for (const entrada of entradasImportadas) {
      // Evitar pisar entradas existentes con el mismo id
      const limpia = existentes.has(entrada.id) ? { ...entrada, id: uid() } : entrada;
      await guardar(limpia);
    }
    await recargar();
  };

  // ---------- Pantallas previas ----------

  if (ajustes.pinHash && !desbloqueado) {
    return <PantallaPin pinHash={ajustes.pinHash} onDesbloquear={() => setDesbloqueado(true)} />;
  }

  const contenido = () => {
    switch (vista) {
      case "entradas":
        return (
          <>
            <BannerDiasDificiles />
            {cargando ? (
              <p className="texto-suave py-16 text-center font-mano text-2xl">Abriendo el cuaderno…</p>
            ) : (
              <ListaEntradas entradas={entradas} onAbrir={abrirEntrada} />
            )}
          </>
        );
      case "apuntes":
        return (
          <ApuntesLocos
            entradas={entradas.filter((e) => e.tipo === "apunte-loco")}
            onAbrir={abrirEntrada}
            onPosicion={guardarPosicionApunte}
          />
        );
      case "calendario":
        return <Calendario entradas={entradas} onAbrirDia={(delDia) => abrirEntrada(delDia[0])} />;
      case "galeria":
        return <Galeria entradas={entradas} onAbrir={setFotoAbierta} />;
      case "ajustes":
        return <VistaAjustes entradas={entradas} onImportar={importar} onAviso={mostrarAviso} />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-[var(--fondo)] text-[var(--tinta)]">
      {!portadaAbierta && ajustes.mostrarPortada && <Portada onAbrir={() => setPortadaAbierta(true)} />}

      {/* Cabecera */}
      <header className="flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <h1 className="font-mano text-3xl font-bold text-[var(--acento)]">{TITULOS[vista]}</h1>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={alternarModoDificil}
            className={`rounded-full p-2.5 shadow-sm ${
              ajustes.modoDificil
                ? "bg-[var(--acento)] text-white"
                : "papel text-[var(--tinta)]"
            }`}
            aria-label="Modo días difíciles"
            title="Modo días difíciles"
          >
            {ajustes.modoDificil ? <HeartHandshake className="h-5 w-5" /> : <HeartCrack className="h-5 w-5" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => nuevaEntrada(vista === "apuntes" ? "apunte-loco" : "diario")}
            className="rounded-full bg-[var(--acento)] p-2.5 text-white shadow-md"
            aria-label={vista === "apuntes" ? "Nuevo apunte loco" : "Nueva entrada"}
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      {/* Páginas con transición */}
      <main className="relative flex flex-1 flex-col" style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait">
          <PaginaTransicion clave={vista}>{contenido()}</PaginaTransicion>
        </AnimatePresence>
      </main>

      {/* Editor (encima de todo) */}
      <AnimatePresence>
        {editor && (
          <div className="fixed inset-0 z-40 overflow-y-auto bg-[var(--fondo)] px-4 pb-10 pt-[max(env(safe-area-inset-top),1rem)]">
            <EditorEntrada
              entrada={editor.entrada}
              tipo={editor.tipo}
              onGuardar={(e) => void guardarEntrada(e)}
              onCancelar={() => setEditor(null)}
              onBorrar={(id) => void borrarEntrada(id)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox de fotos */}
      <AnimatePresence>
        {fotoAbierta && (
          <Lightbox
            foto={fotoAbierta}
            onCerrar={() => setFotoAbierta(null)}
            onBorrar={(entradaId, fotoId) => void borrarFoto(entradaId, fotoId)}
            onIrEntrada={(entradaId) => {
              const entrada = entradas.find((e) => e.id === entradaId);
              setFotoAbierta(null);
              if (entrada) abrirEntrada(entrada);
            }}
          />
        )}
      </AnimatePresence>

      {/* Celebración al guardar */}
      {confeti && <Confeti onTerminar={() => setConfeti(false)} />}

      {/* Avisos suaves */}
      <AnimatePresence>
        {aviso && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--tinta)] px-5 py-2.5 text-sm font-semibold text-[var(--papel)] shadow-lg"
          >
            {aviso}
          </motion.p>
        )}
      </AnimatePresence>

      <Navegacion vista={vista} onCambiar={setVista} />
    </div>
  );
}
