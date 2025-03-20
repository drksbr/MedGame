import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { EditorCamera } from "../camera/EditorCamera";

/**
 * Gerenciador para controles de transformação
 */
export class TransformHandler {
  private transformControls: TransformControls;
  private scene: THREE.Scene;
  private currentObject: THREE.Object3D | null = null;

  // Armazena transformações originais para undo
  private originalPosition: THREE.Vector3 = new THREE.Vector3();
  private originalRotation: THREE.Euler = new THREE.Euler();
  private originalScale: THREE.Vector3 = new THREE.Vector3();

  // Callbacks para eventos
  private onTransformStart: ((object: THREE.Object3D) => void) | null = null;
  private onTransforming: ((object: THREE.Object3D) => void) | null = null;
  private onTransformEnd: ((object: THREE.Object3D) => void) | null = null;

  constructor(scene: THREE.Scene, camera: EditorCamera) {
    this.scene = scene;

    // Inicializar controles de transformação
    this.transformControls = new TransformControls(
      camera.getCamera(),
      document.body
    );
    this.transformControls.setSize(0.8); // Tamanho menor para não obstruir muito

    // Configurar eventos
    this.transformControls.addEventListener(
      "mouseDown",
      this.handleTransformStart.bind(this)
    );
    this.transformControls.addEventListener(
      "objectChange",
      this.handleTransforming.bind(this)
    );
    this.transformControls.addEventListener(
      "mouseUp",
      this.handleTransformEnd.bind(this)
    );

    // Adicionar à cena
    this.scene.add(this.transformControls as unknown as THREE.Object3D);
  }

  /**
   * Conecta um objeto aos controles de transformação
   */
  public attachObject(object: THREE.Object3D): void {
    // Guardar objeto atual
    this.currentObject = object;

    // Armazenar transformações originais
    this.originalPosition.copy(object.position);
    this.originalRotation.copy(object.rotation);
    this.originalScale.copy(object.scale);

    // Conectar aos controles
    this.transformControls.attach(object);
  }

  /**
   * Desconecta o objeto atual
   */
  public detachObject(): void {
    this.transformControls.detach();
    this.currentObject = null;
  }

  /**
   * Define o modo de transformação
   */
  public setMode(mode: "translate" | "rotate" | "scale"): void {
    this.transformControls.setMode(mode);
  }

  /**
   * Retorna o modo atual
   */
  public getMode(): string {
    return this.transformControls.getMode();
  }

  /**
   * Handler para início de transformação
   */
  private handleTransformStart(): void {
    if (!this.currentObject) return;

    // Armazenar transformações originais para undo
    this.originalPosition.copy(this.currentObject.position);
    this.originalRotation.copy(this.currentObject.rotation);
    this.originalScale.copy(this.currentObject.scale);

    // Chamar callback
    if (this.onTransformStart) {
      this.onTransformStart(this.currentObject);
    }
  }

  /**
   * Handler para transformação em andamento
   */
  private handleTransforming(): void {
    if (!this.currentObject) return;

    if (this.onTransforming) {
      this.onTransforming(this.currentObject);
    }
  }

  /**
   * Handler para fim de transformação
   */
  private handleTransformEnd(): void {
    if (!this.currentObject) return;

    if (this.onTransformEnd) {
      this.onTransformEnd(this.currentObject);
    }
  }

  /**
   * Define callback para início de transformação
   */
  public setOnTransformStart(callback: (object: THREE.Object3D) => void): void {
    this.onTransformStart = callback;
  }

  /**
   * Define callback para transformação em andamento
   */
  public setOnTransforming(callback: (object: THREE.Object3D) => void): void {
    this.onTransforming = callback;
  }

  /**
   * Define callback para fim de transformação
   */
  public setOnTransformEnd(callback: (object: THREE.Object3D) => void): void {
    this.onTransformEnd = callback;
  }

  /**
   * Obtém as transformações originais (útil para operações de undo)
   */
  public getOriginalTransform(): {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  } {
    return {
      position: this.originalPosition.clone(),
      rotation: this.originalRotation.clone(),
      scale: this.originalScale.clone(),
    };
  }

  /**
   * Atualiza a câmera associada aos controles
   */
  public updateCamera(camera: THREE.Camera): void {
    this.transformControls.camera = camera;
  }
}
