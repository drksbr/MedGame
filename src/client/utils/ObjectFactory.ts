// src/client/utils/ObjectFactory.ts
import * as THREE from "three";

// Interface para materiais com texturas
// O problema é que THREE.Texture | null não é compatível com THREE.Texture | undefined
// Ajustamos a interface para aceitar null também
interface MaterialWithTextures extends THREE.Material {
  map?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  specularMap?: THREE.Texture | null;
  envMap?: THREE.Texture | null;
}

export class ObjectFactory {
  // Mapa para caching de geometrias
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  // Mapa para caching de materiais
  private materials: Map<string, MaterialWithTextures> = new Map();

  constructor() {
    this.initializeGeometries();
    this.initializeMaterials();
  }

  /**
   * Inicializa geometrias comuns
   */
  private initializeGeometries(): void {
    // Geometrias padrão para objetos comuns
    this.geometries.set("wall", new THREE.BoxGeometry(5, 3, 0.3));
    this.geometries.set("floor", new THREE.PlaneGeometry(10, 10));
    this.geometries.set("door", new THREE.BoxGeometry(1.8, 2.2, 0.1));
    this.geometries.set("window", new THREE.BoxGeometry(1.5, 1.5, 0.1));
    this.geometries.set("furniture_bed", new THREE.BoxGeometry(2, 0.5, 1));
    this.geometries.set("furniture_desk", new THREE.BoxGeometry(1.5, 0.8, 0.8));
    this.geometries.set("npc", new THREE.CylinderGeometry(0.4, 0.4, 1.8, 8));
  }

  /**
   * Inicializa materiais comuns
   */
  private initializeMaterials(): void {
    // Materiais padrão - explicitamente tipados como MaterialWithTextures
    this.materials.set(
      "wall",
      new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0.7,
      }) as MaterialWithTextures
    );

    this.materials.set(
      "floor",
      new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.9,
      }) as MaterialWithTextures
    );

    this.materials.set(
      "door",
      new THREE.MeshStandardMaterial({
        color: 0xa52a2a,
        roughness: 0.6,
      }) as MaterialWithTextures
    );

    this.materials.set(
      "window",
      new THREE.MeshStandardMaterial({
        color: 0xadd8e6,
        transparent: true,
        opacity: 0.6,
      }) as MaterialWithTextures
    );

    this.materials.set(
      "furniture",
      new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.8,
      }) as MaterialWithTextures
    );

    this.materials.set(
      "npc_doctor",
      new THREE.MeshStandardMaterial({
        color: 0x3282b8,
        roughness: 0.5,
      }) as MaterialWithTextures
    );

    this.materials.set(
      "npc_nurse",
      new THREE.MeshStandardMaterial({
        color: 0x8a2be2,
        roughness: 0.5,
      }) as MaterialWithTextures
    );

    this.materials.set(
      "npc_patient",
      new THREE.MeshStandardMaterial({
        color: 0xffd5cd,
        roughness: 0.5,
      }) as MaterialWithTextures
    );
  }

  /**
   * Cria um objeto 3D com base no tipo
   */
  createObject(
    type: string,
    properties?: Record<string, any>
  ): THREE.Object3D | null {
    // Criar diferentes tipos de objetos
    switch (type) {
      case "wall":
        return this.createWall(properties);
      case "floor":
        return this.createFloor(properties);
      case "door":
        return this.createDoor(properties);
      case "window":
        return this.createWindow(properties);
      case "npc_doctor":
      case "npc_nurse":
      case "npc_patient":
        return this.createNPC(type, properties);
      case "furniture_bed":
        return this.createBed(properties);
      case "furniture_desk":
        return this.createDesk(properties);
      case "furniture_chair":
        return this.createChair(properties);
      case "quest_trigger":
        return this.createQuestTrigger(properties);
      default:
        console.warn(`Tipo desconhecido: ${type}`);
        return null;
    }
  }

  /**
   * Cria uma parede
   */
  private createWall(properties?: Record<string, any>): THREE.Mesh {
    const geometry =
      this.geometries.get("wall") || new THREE.BoxGeometry(5, 3, 0.3);
    const material = this.getMaterial("wall");

    // Aplicar propriedades personalizadas
    if (properties?.color && material instanceof THREE.MeshStandardMaterial) {
      material.color.set(properties.color);
    }

    const wall = new THREE.Mesh(geometry, material);
    wall.castShadow = true;
    wall.receiveShadow = true;

    return wall;
  }

  /**
   * Cria um piso
   */
  private createFloor(properties?: Record<string, any>): THREE.Mesh {
    const geometry =
      this.geometries.get("floor") || new THREE.PlaneGeometry(10, 10);
    const material = this.getMaterial("floor");

    if (properties?.color && material instanceof THREE.MeshStandardMaterial) {
      material.color.set(properties.color);
    }

    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2; // Rotaciona para ficar horizontal
    floor.receiveShadow = true;

    return floor;
  }

  /**
   * Cria uma porta
   */
  private createDoor(properties?: Record<string, any>): THREE.Group {
    const doorGroup = new THREE.Group();

    // Moldura
    const frameGeometry = new THREE.BoxGeometry(2.2, 2.5, 0.3);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 1.25;
    doorGroup.add(frame);

    // Porta
    const doorGeometry =
      this.geometries.get("door") || new THREE.BoxGeometry(1.8, 2.2, 0.1);
    const doorMaterial = this.getMaterial("door");

    if (
      properties?.color &&
      doorMaterial instanceof THREE.MeshStandardMaterial
    ) {
      doorMaterial.color.set(properties.color);
    }

    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.y = 1.1;
    door.position.z = 0.1;
    doorGroup.add(door);

    // Maçaneta
    const knobGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const knobMaterial = new THREE.MeshStandardMaterial({ color: 0xd4af37 });

    const knob = new THREE.Mesh(knobGeometry, knobMaterial);
    knob.position.set(0.7, 1.1, 0.15);
    doorGroup.add(knob);

    return doorGroup;
  }

  /**
   * Cria uma janela
   */
  private createWindow(properties?: Record<string, any>): THREE.Group {
    const windowGroup = new THREE.Group();

    // Moldura
    const frameGeometry = new THREE.BoxGeometry(2, 2, 0.2);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    windowGroup.add(frame);

    // Vidro
    const glassGeometry =
      this.geometries.get("window") || new THREE.BoxGeometry(1.5, 1.5, 0.05);
    const glassMaterial = this.getMaterial("window");

    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.z = 0.08;
    windowGroup.add(glass);

    return windowGroup;
  }

  /**
   * Cria um NPC
   */
  private createNPC(
    type: string,
    properties?: Record<string, any>
  ): THREE.Group {
    const npcGroup = new THREE.Group();

    // Corpo
    const bodyGeometry =
      this.geometries.get("npc") ||
      new THREE.CylinderGeometry(0.4, 0.4, 1.8, 8);
    const bodyMaterial = this.getMaterial(type);

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    npcGroup.add(body);

    // Cabeça
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffd5cd });

    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    npcGroup.add(head);

    // Adicionar placa de identificação se houver nome
    if (properties?.displayName) {
      const labelGeometry = new THREE.PlaneGeometry(1, 0.3);
      const labelMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });

      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(0, 2.7, 0);
      label.rotation.x = -Math.PI / 4;
      npcGroup.add(label);
    }

    return npcGroup;
  }

  /**
   * Cria uma cama
   */
  private createBed(properties?: Record<string, any>): THREE.Group {
    const bedGroup = new THREE.Group();

    // Base
    const baseGeometry = new THREE.BoxGeometry(2.5, 0.3, 1.8);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    bedGroup.add(base);

    // Colchão
    const mattressGeometry = new THREE.BoxGeometry(2.4, 0.3, 1.7);
    const mattressMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
    });

    if (properties?.color) {
      mattressMaterial.color.set(properties.color);
    }

    const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
    mattress.position.y = 0.45;
    bedGroup.add(mattress);

    // Travesseiro
    const pillowGeometry = new THREE.BoxGeometry(0.7, 0.15, 1.3);
    const pillowMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });

    const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
    pillow.position.set(-0.7, 0.68, 0);
    bedGroup.add(pillow);

    return bedGroup;
  }

  /**
   * Cria uma mesa
   */
  private createDesk(properties?: Record<string, any>): THREE.Group {
    const deskGroup = new THREE.Group();

    // Tampo
    const topGeometry = new THREE.BoxGeometry(2, 0.1, 1);
    const topMaterial = this.getMaterial("furniture");

    if (
      properties?.color &&
      topMaterial instanceof THREE.MeshStandardMaterial
    ) {
      topMaterial.color.set(properties.color);
    }

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.75;
    deskGroup.add(top);

    // Pernas
    const legGeometry = new THREE.BoxGeometry(0.1, 0.75, 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x6b3e26 });

    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);

      const xPos = i < 2 ? -0.9 : 0.9;
      const zPos = i % 2 === 0 ? -0.4 : 0.4;

      leg.position.set(xPos, 0.375, zPos);
      deskGroup.add(leg);
    }

    return deskGroup;
  }

  /**
   * Cria uma cadeira
   */
  private createChair(properties?: Record<string, any>): THREE.Group {
    const chairGroup = new THREE.Group();

    // Assento
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const seatMaterial = this.getMaterial("furniture");

    if (
      properties?.color &&
      seatMaterial instanceof THREE.MeshStandardMaterial
    ) {
      seatMaterial.color.set(properties.color);
    }

    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.45;
    chairGroup.add(seat);

    // Encosto
    const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
    // Clone para evitar problemas de compartilhamento de material
    const backMaterial =
      seatMaterial instanceof THREE.MeshStandardMaterial
        ? seatMaterial.clone()
        : new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 0.7, -0.2);
    chairGroup.add(back);

    // Pernas
    const legGeometry = new THREE.BoxGeometry(0.05, 0.45, 0.05);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x6b3e26 });

    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);

      const xPos = i < 2 ? -0.2 : 0.2;
      const zPos = i % 2 === 0 ? -0.2 : 0.2;

      leg.position.set(xPos, 0.225, zPos);
      chairGroup.add(leg);
    }

    return chairGroup;
  }

  /**
   * Cria um gatilho de quest (invisível para o jogador)
   */
  private createQuestTrigger(properties?: Record<string, any>): THREE.Mesh {
    // Geometria simples para colisão
    const geometry = new THREE.SphereGeometry(1, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });

    // No modo de jogo, configurar opacity para 0 (invisível)
    if (!properties?.visible) {
      material.opacity = 0;
    }

    const trigger = new THREE.Mesh(geometry, material);
    trigger.userData.isQuestTrigger = true;

    if (properties?.questId) {
      trigger.userData.questId = properties.questId;
    }

    return trigger;
  }

  /**
   * Método auxiliar para obter um material com segurança
   */
  private getMaterial(type: string): THREE.Material {
    // Tenta obter o material do cache
    const cachedMaterial = this.materials.get(type);

    if (cachedMaterial) {
      // Clonar para evitar problemas de compartilhamento
      return cachedMaterial.clone();
    }

    // Fallback para material padrão se não encontrar
    return new THREE.MeshStandardMaterial({ color: 0xcccccc });
  }
}
