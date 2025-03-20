import { EditorMode, EditorModes } from "../modes/EditorModes";
import { OBJECT_TYPES, ObjectType } from "../constants/ObjectTypes";

/**
 * Barra de ferramentas lateral
 */
export class Toolbar {
  private editor: any; // Referência ao editor principal
  private toolbarElement: HTMLElement;

  constructor(editor: any) {
    this.editor = editor;

    // Criar e configurar a barra de ferramentas
    this.toolbarElement = this.createToolbarElement();
    document.body.appendChild(this.toolbarElement);

    // Configurar handlers de eventos
    this.setupEventHandlers();
  }

  /**
   * Cria o elemento HTML da barra de ferramentas
   */
  private createToolbarElement(): HTMLElement {
    const toolbar = document.createElement("div");
    toolbar.className = "editor-sidebar";

    // Título da aplicação
    const header = document.createElement("div");
    header.className = "sidebar-header";
    header.innerHTML = "<h1>MedGame Editor</h1>";
    toolbar.appendChild(header);

    // Seção de ferramentas de arquivo
    const fileSection = document.createElement("div");
    fileSection.className = "sidebar-section";
    fileSection.innerHTML = `
      <h2>Arquivo</h2>
      <div class="sidebar-buttons">
        <button id="new-map-btn" class="sidebar-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
          </svg>
          <span>Novo</span>
        </button>
        <button id="save-map-btn" class="sidebar-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path>
          </svg>
          <span>Salvar</span>
        </button>
        <button id="load-map-btn" class="sidebar-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"></path>
          </svg>
          <span>Abrir</span>
        </button>
      </div>
    `;
    toolbar.appendChild(fileSection);

    // Seção de ferramentas de edição
    const editSection = document.createElement("div");
    editSection.className = "sidebar-section";
    editSection.innerHTML = `
      <h2>Ferramentas</h2>
      <div class="sidebar-buttons">
        <button id="select-tool" class="sidebar-button active">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19,5l-14,14l3,0l0,-3l9.1,-9.1c-0.3,-0.6 -0.9,-1 -1.6,-1c-1.1,0 -2,0.9 -2,2c0,0.7 0.4,1.3 1,1.6l-9.1,9.1l0,3l3,0l14,-14l-3.5,-3.5z"></path>
          </svg>
          <span>Selecionar</span>
        </button>
        <button id="add-tool" class="sidebar-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
          </svg>
          <span>Adicionar</span>
        </button>
        <button id="delete-tool" class="sidebar-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
          </svg>
          <span>Remover</span>
        </button>
      </div>
    `;
    toolbar.appendChild(editSection);

    // Seção de objetos
    const objectsSection = document.createElement("div");
    objectsSection.className = "sidebar-section";
    objectsSection.innerHTML = `
      <h2>Objetos</h2>
      <div class="sidebar-objects">
        <button data-type="${OBJECT_TYPES.WALL}" class="object-button active">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path>
          </svg>
          <span>Parede</span>
        </button>
        <button data-type="${OBJECT_TYPES.FLOOR}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path>
          </svg>
          <span>Piso</span>
        </button>
        <button data-type="${OBJECT_TYPES.DOOR}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 19V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v14H3v2h18v-2h-2zm-8 0H9v-9l3 3 3-3v9h-2v-5l-2 2-2-2v5z"></path>
          </svg>
          <span>Porta</span>
        </button>
        <button data-type="${OBJECT_TYPES.WINDOW}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M4 4h16v4H4zm0 6h16v4H4zm0 6h16v4H4z"></path>
          </svg>
          <span>Janela</span>
        </button>
        <button data-type="${OBJECT_TYPES.NPC_DOCTOR}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
          <span>Médico</span>
        </button>
        <button data-type="${OBJECT_TYPES.NPC_NURSE}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
          <span>Enfermeiro</span>
        </button>
        <button data-type="${OBJECT_TYPES.NPC_PATIENT}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
          <span>Paciente</span>
        </button>
        <button data-type="${OBJECT_TYPES.FURNITURE_BED}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"></path>
          </svg>
          <span>Cama</span>
        </button>
        <button data-type="${OBJECT_TYPES.FURNITURE_DESK}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2 6h2v12H2V6zm3 0h1v12H5V6zm2 0h1v12H7V6zm2 0h2v12H9V6zm3 0h1v12h-1V6zm2 0h1v12h-1V6zm2 0h1v12h-1V6zm2 0h2v12h-2V6z"></path>
          </svg>
          <span>Mesa</span>
        </button>
        <button data-type="${OBJECT_TYPES.FURNITURE_CHAIR}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M16 6h-2V4h2v2zm2 1h-2v2h2V7zm1 2h-2v2h2V9zm1 2h-2v2h2v-2zm0-6h-2v2h2V5zM5 5h2V3H5v2zm0 8h2v-2H5v2zm0-4h2V7H5v2zm0-2h2V5H5v3zm8 8c-1.1 0-2 .9-2 2H2v2h18v-2h-5c0-1.1-.9-2-2-2z"></path>
          </svg>
          <span>Cadeira</span>
        </button>
        <button data-type="${OBJECT_TYPES.QUEST_TRIGGER}" class="object-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"></path>
          </svg>
          <span>Trigger</span>
        </button>
      </div>
    `;
    toolbar.appendChild(objectsSection);

    // Seção de edição
    const editActionsSection = document.createElement("div");
    editActionsSection.className = "sidebar-section";
    editActionsSection.innerHTML = `
      <h2>Edição</h2>
      <div class="sidebar-buttons">
        <button id="undo-btn" class="sidebar-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path>
          </svg>
          <span>Desfazer</span>
        </button>
        <button id="redo-btn" class="sidebar-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M18.4 10.6C16.55 9 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16a8.002 8.002 0 017.6-5.5c1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path>
          </svg>
          <span>Refazer</span>
        </button>
        <button id="duplicate-btn" class="sidebar-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
          </svg>
          <span>Duplicar</span>
        </button>
      </div>
    `;
    toolbar.appendChild(editActionsSection);

    // Controles de navegação
    const helpSection = document.createElement("div");
    helpSection.className = "sidebar-section";
    helpSection.innerHTML = `
      <h2>Controles</h2>
      <div class="sidebar-help">
        <ul>
          <li><strong>W,A,S,D</strong> - Mover câmera</li>
          <li><strong>Q,E</strong> - Subir/Descer câmera</li>
          <li><strong>Mouse</strong> - Girar visão</li>
          <li><strong>G</strong> - Mover objeto</li>
          <li><strong>R</strong> - Rotacionar objeto</li>
          <li><strong>T</strong> - Escalar objeto</li>
          <li><strong>Delete</strong> - Remover objeto</li>
        </ul>
      </div>
    `;
    toolbar.appendChild(helpSection);

    return toolbar;
  }

  /**
   * Configura os handlers de eventos
   */
  private setupEventHandlers(): void {
    // Botões de modos de edição
    document.getElementById("select-tool")?.addEventListener("click", () => {
      this.editor.setEditorMode(EditorModes.SELECT);
    });

    document.getElementById("add-tool")?.addEventListener("click", () => {
      this.editor.setEditorMode(EditorModes.ADD);
    });

    document.getElementById("delete-tool")?.addEventListener("click", () => {
      this.editor.setEditorMode(EditorModes.DELETE);
    });

    // Botões de arquivo
    document.getElementById("new-map-btn")?.addEventListener("click", () => {
      this.editor.createNewMapWithDialog();
    });

    document.getElementById("save-map-btn")?.addEventListener("click", () => {
      this.editor.saveMap();
    });

    document.getElementById("load-map-btn")?.addEventListener("click", () => {
      this.editor.loadMap();
    });

    // Botões de edição
    document.getElementById("undo-btn")?.addEventListener("click", () => {
      this.editor.undo();
    });

    document.getElementById("redo-btn")?.addEventListener("click", () => {
      this.editor.redo();
    });

    document.getElementById("duplicate-btn")?.addEventListener("click", () => {
      this.editor.duplicateSelectedObject();
    });

    // Botões de tipo de objeto
    const objectButtons = document.querySelectorAll(".object-button");
    objectButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget as HTMLElement;
        const type = target.getAttribute("data-type") as ObjectType;

        if (type) {
          this.editor.setObjectType(type);
          this.updateObjectType(type);
        }
      });
    });
  }

  /**
   * Atualiza o estado visual dos botões de modo
   */
  public updateModeState(mode: EditorMode): void {
    // Remover classe active de todos os botões de modo
    document.querySelectorAll(".sidebar-button").forEach((button) => {
      button.classList.remove("active");
    });

    // Adicionar classe active ao botão correspondente
    const modeButtonMap: Record<EditorMode, string> = {
      [EditorModes.SELECT]: "select-tool",
      [EditorModes.ADD]: "add-tool",
      [EditorModes.DELETE]: "delete-tool",
      [EditorModes.EDIT]: "select-tool", // Modo de edição usa o mesmo botão que select
    };

    const buttonId = modeButtonMap[mode];
    document.getElementById(buttonId)?.classList.add("active");

    // Atualizar cursor
    document.body.classList.remove(
      "cursor-select",
      "cursor-add",
      "cursor-delete"
    );

    // Adicionar classe de cursor específica para o modo
    const cursorClassMap: Record<EditorMode, string> = {
      [EditorModes.SELECT]: "cursor-select",
      [EditorModes.ADD]: "cursor-add",
      [EditorModes.DELETE]: "cursor-delete",
      [EditorModes.EDIT]: "cursor-select",
    };

    document.body.classList.add(cursorClassMap[mode]);
  }

  /**
   * Atualiza o estado visual dos botões de tipo de objeto
   */
  public updateObjectType(type: ObjectType): void {
    // Remover classe active de todos os botões de objeto
    document.querySelectorAll(".object-button").forEach((button) => {
      button.classList.remove("active");
    });

    // Adicionar classe active ao botão correspondente
    document
      .querySelector(`.object-button[data-type="${type}"]`)
      ?.classList.add("active");

    // Se estamos no modo de adição, alterar para esse tipo
    if (this.editor.getCurrentMode() === EditorModes.ADD) {
      this.editor.setObjectType(type);
    }
  }
}
