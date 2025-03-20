import * as THREE from "three";
import { ObjectType } from "../constants/ObjectTypes";

/**
 * Interface para representar um objeto no mapa
 */
export interface MapObject {
  id: string;
  type: ObjectType;
  position: THREE.Vector3Like;
  rotation: THREE.Vector3Like;
  scale: THREE.Vector3Like;
  properties?: MapObjectProperties;
}

/**
 * Propriedades comuns para objetos no mapa
 */
export interface MapObjectProperties {
  color?: string;
  name?: string;
  questId?: string;
  visible?: boolean;
  interactable?: boolean;
  width?: number;
  height?: number;
  depth?: number;
  [key: string]: any; // Permite propriedades adicionais específicas
}

/**
 * Propriedades específicas para NPCs
 */
export interface NpcProperties extends MapObjectProperties {
  dialogues?: string[];
  questions?: string[];
  specialtyId?: string;
}

/**
 * Propriedades específicas para triggers de quest
 */
export interface QuestTriggerProperties extends MapObjectProperties {
  questId: string;
  triggerRadius?: number;
  triggerType?: "proximity" | "interaction";
  requiredItems?: string[];
}
