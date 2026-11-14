// Punto de entrada de Mi Refugio

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ProveedorAjustes } from "./hooks/useAjustes";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProveedorAjustes>
      <App />
    </ProveedorAjustes>
  </StrictMode>
);
