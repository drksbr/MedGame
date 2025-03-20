/**
 * Modos disponíveis para o editor
 */
export const EditorModes = {
  SELECT: "select",
  ADD: "add",
  DELETE: "delete",
  EDIT: "edit",
} as const;

/**
 * Tipo para os modos do editor
 */
export type EditorMode = (typeof EditorModes)[keyof typeof EditorModes];

/**
 * Interface base para modos do editor
 */
export interface IEditorMode {
  /**
   * Chamado quando o modo é ativado
   */
  enter?(): void;

  /**
   * Chamado quando o modo é desativado
   */
  exit?(): void;

  /**
   * Processa eventos de mouse
   */
  handleMouseDown?(x: number, y: number, button: number): void;

  /**
   * Processa eventos de teclado
   */
  handleKeyDown?(
    key: string,
    ctrl: boolean,
    shift: boolean,
    alt: boolean
  ): void;
}
