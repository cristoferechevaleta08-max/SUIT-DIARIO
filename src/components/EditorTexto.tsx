// Área de texto con formato básico (negrita, cursiva, listas)

import { useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface Props {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  filas?: number;
}

export function EditorTexto({ valor, onChange, placeholder = "Escribe sin miedo…", filas = 8 }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Insertar marcas de markdown alrededor del texto seleccionado
  const envolver = (marca: string) => {
    const area = ref.current;
    if (!area) return;
    const { selectionStart: inicio, selectionEnd: fin } = area;
    const seleccion = valor.slice(inicio, fin) || "texto";
    const nuevo =
      valor.slice(0, inicio) + marca + seleccion + marca + valor.slice(fin);
    onChange(nuevo);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(inicio + marca.length, inicio + marca.length + seleccion.length);
    });
  };

  const prefijar = (prefijo: string) => {
    const area = ref.current;
    if (!area) return;
    const { selectionStart: inicio } = area;
    const inicioLinea = valor.lastIndexOf("\n", inicio - 1) + 1;
    const nuevo = valor.slice(0, inicioLinea) + prefijo + valor.slice(inicioLinea);
    onChange(nuevo);
    requestAnimationFrame(() => area.focus());
  };

  const boton =
    "papel rounded-lg p-2 texto-suave transition-colors hover:text-[var(--acento)] active:scale-90";

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button type="button" className={boton} onClick={() => envolver("**")} aria-label="Negrita">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={boton} onClick={() => envolver("*")} aria-label="Cursiva">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={boton} onClick={() => prefijar("- ")} aria-label="Lista con viñetas">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={boton} onClick={() => prefijar("1. ")} aria-label="Lista numerada">
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>
      <textarea
        ref={ref}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={filas}
        className="papel w-full resize-y rounded-2xl p-4 leading-relaxed text-[var(--tinta)] outline-none focus:ring-2 focus:ring-[var(--acento-suave)]"
      />
      <p className="texto-suave text-xs">Puedes usar **negrita**, *cursiva* y listas con "- "</p>
    </div>
  );
}
