import * as THREE from "three";
import { IEditorMode } from "./EditorModes";

/**
 * Modo de adição de objetos
 */
export class AddMode implements IEditorMode {
  private editor: any;

  constructor(editor: any) {
    this.editor = editor;
  }

  /**
   * Chamado quando o modo é ativado
   */
  public enter(): void {
    document.body.style.cursor = "cell";
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

    // Fazer raycasting apenas no plano do chão
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.editor.camera.getCamera());

    // Verificar interseção com o plano do chão
    const groundPlane = this.editor.getScene().getObjectByName("ground-plane");
    if (!groundPlane) return;

    const intersects = raycaster.intersectObject(groundPlane);

    if (intersects.length > 0) {
      // Adicionar objeto na posição clicada
      const point = intersects[0].point;
      this.editor.addObjectAt(point);
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
    // Teclas para mudar o tipo de objeto
    if (key >= "1" && key <= "9") {
      const index = parseInt(key) - 1;
      const types = Object.values(this.editor.getObjectTypes());

      if (index >= 0 && index < types.length) {
        this.editor.setObjectType(types[index]);
      }
    }
  }
}
