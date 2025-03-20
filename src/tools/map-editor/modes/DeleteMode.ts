import * as THREE from "three";
import { IEditorMode } from "./EditorModes";

/**
 * Modo de remoção de objetos
 */
export class DeleteMode implements IEditorMode {
  private editor: any;

  constructor(editor: any) {
    this.editor = editor;
  }

  /**
   * Chamado quando o modo é ativado
   */
  public enter(): void {
    document.body.style.cursor = "no-drop";
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

      // Selecionar o objeto e removê-lo imediatamente
      this.editor.selectObject(object);
      this.editor.removeSelectedObject();
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
    // Nenhuma funcionalidade específica para teclas no modo de deleção
  }
}
