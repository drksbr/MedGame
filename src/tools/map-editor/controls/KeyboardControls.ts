import { EditorCamera } from "../camera/EditorCamera";

/**
 * Controles de teclado para o editor
 */
export class KeyboardControls {
  private camera: EditorCamera;
  private keysPressed: Set<string> = new Set();
  private moveSpeed: number = 0.2;

  constructor(camera: EditorCamera) {
    this.camera = camera;
    this.setupListeners();
  }

  /**
   * Configura listeners de teclado
   */
  private setupListeners(): void {
    // Tecla pressionada
    window.addEventListener("keydown", (event) => {
      this.keysPressed.add(event.code);

      // Evitar comportamentos padrão para algumas teclas
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          event.code
        )
      ) {
        event.preventDefault();
      }
    });

    // Tecla liberada
    window.addEventListener("keyup", (event) => {
      this.keysPressed.delete(event.code);
    });

    // Limpar teclas ao perder foco
    window.addEventListener("blur", () => {
      this.keysPressed.clear();
    });
  }

  /**
   * Atualiza movimento baseado nas teclas pressionadas
   */
  public update(): void {
    let forward = 0;
    let right = 0;
    let up = 0;

    // Movimento no plano XZ
    if (this.keysPressed.has("KeyW")) forward += this.moveSpeed;
    if (this.keysPressed.has("KeyS")) forward -= this.moveSpeed;
    if (this.keysPressed.has("KeyA")) right -= this.moveSpeed;
    if (this.keysPressed.has("KeyD")) right += this.moveSpeed;

    // Movimento vertical
    if (this.keysPressed.has("KeyQ")) up -= this.moveSpeed;
    if (this.keysPressed.has("KeyE")) up += this.moveSpeed;

    // Aplicar movimento se houver
    if (forward !== 0 || right !== 0 || up !== 0) {
      this.camera.move(forward, right, up);
    }
  }

  /**
   * Verifica se uma tecla está pressionada
   */
  public isKeyPressed(keyCode: string): boolean {
    return this.keysPressed.has(keyCode);
  }

  /**
   * Retorna true se qualquer tecla de movimento estiver pressionada
   */
  public isMoveKeyPressed(): boolean {
    return (
      this.keysPressed.has("KeyW") ||
      this.keysPressed.has("KeyA") ||
      this.keysPressed.has("KeyS") ||
      this.keysPressed.has("KeyD") ||
      this.keysPressed.has("KeyQ") ||
      this.keysPressed.has("KeyE")
    );
  }

  /**
   * Define a velocidade de movimento
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }
}
