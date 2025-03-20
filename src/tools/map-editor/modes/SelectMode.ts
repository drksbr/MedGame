import * as THREE from "three";
import { IEditorMode } from "./EditorModes";

/**
 * Modo de seleção
 */
export class SelectMode implements IEditorMode {
  private editor: any;

  constructor(editor: any) {
    this.editor = editor;
  }

  /**
   * Chamado quando o modo é ativado
   */
  public enter(): void {
    document.body.style.cursor = "pointer";
  }

  /**
   * Chamado quando o modo é desativado
   */
  public exit(): void {
    document.body.style.cursor = "default";
  }

  /**
   * Processa eventos de mouse
   */
  public handleMouseDown(x: number, y: number, button: number): void {
    // Apenas processa clique esquerdo
    if (button !== 0) return;

    // Configurar posição do mouse para raycasting
    const mouse = new THREE.Vector2(x, y);

    // Fazer raycasting nos objetos
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.editor.camera.getCamera());

    // Verificar interseções
    const intersects = raycaster.intersectObjects(
      this.editor.getObjects(),
      true
    );

    if (intersects.length > 0) {
      // Encontrar o objeto pai (root)
      let object = intersects[0].object;
      while (object.parent && object.parent !== this.editor.getScene()) {
        object = object.parent;
      }

      // Selecionar o objeto
      this.editor.selectObject(object);
    } else {
      // Nenhum objeto clicado, deselecionar
      this.editor.deselectObject();
    }
  }

  /**
   * Processa eventos de teclado
   */
  public handleKeyDown(
    key: string,
    ctrl: boolean,
    shift: boolean,
    alt: boolean
  ): void {
    // Processar atalhos de teclado específicos do modo
    switch (key) {
      case "Delete":
        this.editor.removeSelectedObject();
        break;
      case "g":
        // Entrar no modo de translação se houver objeto selecionado
        if (this.editor.getSelectedObject()) {
          this.editor.getTransformHandler().setMode("translate");
        }
        break;
      case "r":
        // Entrar no modo de rotação se houver objeto selecionado
        if (this.editor.getSelectedObject()) {
          this.editor.getTransformHandler().setMode("rotate");
        }
        break;
      case "t":
        // Entrar no modo de escala se houver objeto selecionado
        if (this.editor.getSelectedObject()) {
          this.editor.getTransformHandler().setMode("scale");
        }
        break;
      case "d":
        // Duplicar objeto selecionado
        if (ctrl && this.editor.getSelectedObject()) {
          this.editor.duplicateSelectedObject();
        }
        break;
    }
  }
}
