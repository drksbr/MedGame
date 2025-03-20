import * as THREE from "three";
import { OBJECT_TYPES, ObjectType } from "../constants/ObjectTypes";
import { MapObjectProperties } from "../models/MapObject";
import { WallFactory } from "./WallFactory";
import { FloorFactory } from "./FloorFactory";
import { NpcFactory } from "./NpcFactory";
import { FurnitureFactory } from "./FurnitureFactory";

/**
 * Factory principal para criar objetos 3D no editor
 */
export class ObjectFactory {
  private wallFactory: WallFactory;
  private floorFactory: FloorFactory;
  private npcFactory: NpcFactory;
  private furnitureFactory: FurnitureFactory;

  constructor() {
    this.wallFactory = new WallFactory();
    this.floorFactory = new FloorFactory();
    this.npcFactory = new NpcFactory();
    this.furnitureFactory = new FurnitureFactory();
  }

  /**
   * Cria um objeto 3D baseado no tipo e propriedades
   */
  createObject(
    type: ObjectType,
    properties?: MapObjectProperties
  ): THREE.Object3D | null {
    switch (type) {
      case OBJECT_TYPES.WALL:
        return this.wallFactory.createWall(properties);

      case OBJECT_TYPES.FLOOR:
        return this.floorFactory.createFloor(properties);

      case OBJECT_TYPES.DOOR:
        return this.wallFactory.createDoor(properties);

      case OBJECT_TYPES.WINDOW:
        return this.wallFactory.createWindow(properties);

      case OBJECT_TYPES.NPC_DOCTOR:
      case OBJECT_TYPES.NPC_NURSE:
      case OBJECT_TYPES.NPC_PATIENT:
        return this.npcFactory.createNpc(type, properties);

      case OBJECT_TYPES.FURNITURE_BED:
        return this.furnitureFactory.createBed(properties);

      case OBJECT_TYPES.FURNITURE_DESK:
        return this.furnitureFactory.createDesk(properties);

      case OBJECT_TYPES.FURNITURE_CHAIR:
        return this.furnitureFactory.createChair(properties);

      case OBJECT_TYPES.QUEST_TRIGGER:
        return this.createQuestTrigger(properties);

      default:
        console.warn(`Tipo de objeto desconhecido: ${type}`);
        return null;
    }
  }

  /**
   * Cria um gatilho de quest (área invisível que ativa quests)
   */
  private createQuestTrigger(properties?: MapObjectProperties): THREE.Mesh {
    const radius = properties?.triggerRadius || 1;

    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });

    // No modo de jogo, configurar opacity para 0 (invisível)
    if (properties?.visible === false) {
      material.opacity = 0;
    }

    const trigger = new THREE.Mesh(geometry, material);
    trigger.userData.isQuestTrigger = true;

    if (properties?.questId) {
      trigger.userData.questId = properties.questId;
    }

    return trigger;
  }
}
