import * as THREE from "three";
import { EditorCamera } from "../camera/EditorCamera";

/**
 * Controles de mouse para o editor
 */
export class MouseControls {
  private element: HTMLElement;
  private camera: EditorCamera;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2 = new THREE.Vector2();

  // Callbacks para eventos
  private onMouseDown:
    | ((event: MouseEvent, intersects: THREE.Intersection[]) => void)
    | null = null;
  private onMouseMove:
    | ((event: MouseEvent, intersects: THREE.Intersection[]) => void)
    | null = null;
  private onMouseUp: ((event: MouseEvent) => void) | null = null;

  constructor(
    element: HTMLElement,
    camera: EditorCamera,
    raycaster: THREE.Raycaster
  ) {
    this.element = element;
    this.camera = camera;
    this.raycaster = raycaster;

    this.setupListeners();
  }

  /**
   * Configura listeners de mouse
   */
  private setupListeners(): void {
    this.element.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.element.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.element.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  /**
   * Handler para evento mousedown
   */
  private handleMouseDown(event: MouseEvent): void {
    // Ignorar clique direito (usado para rotação de câmera)
    if (event.button === 2) return;

    // Atualizar posição do mouse
    this.updateMousePosition(event);

    // Atualizar o raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera.getCamera());

    // Chamar callback, se definido
    if (this.onMouseDown) {
      this.onMouseDown(event, []);
    }
  }

  /**
   * Handler para evento mousemove
   */
  private handleMouseMove(event: MouseEvent): void {
    // Atualizar posição do mouse
    this.updateMousePosition(event);

    // Atualizar o raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera.getCamera());

    // Chamar callback, se definido
    if (this.onMouseMove) {
      this.onMouseMove(event, []);
    }
  }

  /**
   * Handler para evento mouseup
   */
  private handleMouseUp(event: MouseEvent): void {
    // Chamar callback, se definido
    if (this.onMouseUp) {
      this.onMouseUp(event);
    }
  }

  /**
   * Atualiza a posição do mouse para coordenadas normalizadas (-1 a 1)
   */
  private updateMousePosition(event: MouseEvent): void {
    const rect = this.element.getBoundingClientRect();

    // Calcular posição do mouse em coordenadas normalizadas (-1 a 1)
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Retorna a posição atual do mouse em coordenadas normalizadas
   */
  public getMousePosition(): THREE.Vector2 {
    return this.mouse.clone();
  }

  /**
   * Define callback para evento mousedown
   */
  public setOnMouseDown(
    callback: (event: MouseEvent, intersects: THREE.Intersection[]) => void
  ): void {
    this.onMouseDown = callback;
  }

  /**
   * Define callback para evento mousemove
   */
  public setOnMouseMove(
    callback: (event: MouseEvent, intersects: THREE.Intersection[]) => void
  ): void {
    this.onMouseMove = callback;
  }

  /**
   * Define callback para evento mouseup
   */
  public setOnMouseUp(callback: (event: MouseEvent) => void): void {
    this.onMouseUp = callback;
  }

  /**
   * Executa um raycast na cena
   */
  public raycast(objects: THREE.Object3D[]): THREE.Intersection[] {
    return this.raycaster.intersectObjects(objects, true);
  }
}
