import * as THREE from "three";

/**
 * Câmera personalizada para o editor
 */
export class EditorCamera {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private element: HTMLElement;

  // Parâmetros da câmera
  private defaultHeight: number = 10;
  private rotationSpeed: number = 0.002;
  private isDragging: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private phi: number = Math.PI / 4; // Ângulo vertical (pitch)
  private theta: number = 0; // Ângulo horizontal (yaw)
  private distance: number = 15;

  constructor(aspect: number, element: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.target = new THREE.Vector3(0, 0, 0);
    this.element = element;

    // Posicionar câmera inicialmente
    this.updateCameraPosition();

    // Adicionar listeners para rotação com o mouse
    this.setupMouseListeners();
  }

  /**
   * Configura listeners para controle de câmera com o mouse
   */
  private setupMouseListeners(): void {
    this.element.addEventListener("mousedown", (event) => {
      // Botão direito do mouse para rotação
      if (event.button === 2) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.element.style.cursor = "grabbing";
        event.preventDefault();
      }
    });

    window.addEventListener("mousemove", (event) => {
      if (this.isDragging) {
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;

        // Atualizar ângulos
        this.theta -= deltaX * this.rotationSpeed;
        this.phi -= deltaY * this.rotationSpeed;

        // Limitar ângulo vertical para evitar inversão
        this.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, this.phi));

        // Atualizar posição da câmera
        this.updateCameraPosition();
      }
    });

    window.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.element.style.cursor = "default";
      }
    });

    // Prevenir menu de contexto ao usar botão direito
    this.element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    // Zoom com roda do mouse
    this.element.addEventListener("wheel", (event) => {
      // Ajustar distância da câmera
      this.distance += event.deltaY * 0.01;

      // Limitar zoom
      this.distance = Math.max(5, Math.min(50, this.distance));

      // Atualizar posição
      this.updateCameraPosition();

      event.preventDefault();
    });
  }

  /**
   * Atualiza a posição da câmera baseada nos ângulos
   */
  private updateCameraPosition(): void {
    // Calcular posição usando coordenadas esféricas
    const x =
      this.target.x + this.distance * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.target.y + this.distance * Math.cos(this.phi);
    const z =
      this.target.z + this.distance * Math.sin(this.phi) * Math.cos(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  /**
   * Atualiza a câmera - chamado no loop de renderização
   */
  public update(): void {
    // Lógica para atualização contínua, se necessário
  }

  /**
   * Move a câmera em coordenadas locais
   */
  public move(forward: number, right: number, up: number): void {
    // Vetor direção
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0; // Manter movimento no plano XZ
    direction.normalize();

    // Vetor para a direita
    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

    // Calcular deslocamento
    const movement = new THREE.Vector3();
    movement.addScaledVector(direction, forward);
    movement.addScaledVector(rightVector, right);
    movement.y += up; // Movimento vertical

    // Atualizar posição alvo
    this.target.add(movement);

    // Atualizar posição da câmera
    this.updateCameraPosition();
  }

  /**
   * Retorna a instância da câmera
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Define o ponto alvo da câmera
   */
  public setTarget(x: number, y: number, z: number): void {
    this.target.set(x, y, z);
    this.updateCameraPosition();
  }

  /**
   * Atualiza quando a janela é redimensionada
   */
  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Retorna a direção da câmera
   */
  public getDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }
}
