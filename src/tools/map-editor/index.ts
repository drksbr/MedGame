import { MapEditor } from "./MapEditor";
import { setupStyles } from "./ui/Styles";

// Inicializa estilos
setupStyles();

// Inicializa o editor quando o DOM estiver pronto
window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("editor-container");

  if (!container) {
    console.error("Container do editor não encontrado!");
    return;
  }

  // Criar e inicializar o editor
  const editor = new MapEditor(container);

  // Expor editor para debugging (opcional)
  (window as any).mapEditor = editor;
});
