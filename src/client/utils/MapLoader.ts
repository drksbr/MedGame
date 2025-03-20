// src/client/utils/MapLoader.ts
import * as THREE from "three";
import { ObjectFactory } from "./ObjectFactory";

interface MapObject {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  properties?: Record<string, any>;
}

interface ClientMapData {
  id: string;
  name: string;
  version: string;
  objects: MapObject[];
}

// Interface atualizada para aceitar null também
interface MaterialWithTextures extends THREE.Material {
  map?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  specularMap?: THREE.Texture | null;
  envMap?: THREE.Texture | null;
}

export class MapLoader {
  private scene: THREE.Scene;
  private objectFactory: ObjectFactory;
  private loadedObjects: Map<string, THREE.Object3D> = new Map();
  private mapId: string | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.objectFactory = new ObjectFactory();
  }

  /**
   * Carrega um mapa do servidor pelo ID
   */
  async loadMapById(mapId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/maps/client/${mapId}`);

      if (!response.ok) {
        console.error(`Erro ao carregar mapa: ${response.statusText}`);
        return false;
      }

      const data = await response.json();

      if (!data.success) {
        console.error(`Erro ao carregar mapa: ${data.message}`);
        return false;
      }

      return this.loadMapFromData(data.mapData);
    } catch (error) {
      console.error("Erro ao carregar mapa:", error);
      return false;
    }
  }

  /**
   * Carrega um mapa a partir dos dados recebidos
   */
  loadMapFromData(mapData: ClientMapData): boolean {
    try {
      // Limpar objetos existentes
      this.clearMap();

      // Salvar ID do mapa
      this.mapId = mapData.id;

      // Criar objetos
      for (const obj of mapData.objects) {
        this.createObject(obj);
      }

      return true;
    } catch (error) {
      console.error("Erro ao processar dados do mapa:", error);
      return false;
    }
  }

  /**
   * Cria um objeto 3D a partir dos dados
   */
  private createObject(objectData: MapObject): void {
    // Usar factory para criar o objeto
    const object = this.objectFactory.createObject(
      objectData.type,
      objectData.properties
    );

    if (!object) {
      console.warn(`Tipo de objeto desconhecido: ${objectData.type}`);
      return;
    }

    // Aplicar transformações
    object.position.set(
      objectData.position.x,
      objectData.position.y,
      objectData.position.z
    );

    object.rotation.set(
      objectData.rotation.x,
      objectData.rotation.y,
      objectData.rotation.z
    );

    object.scale.set(
      objectData.scale.x,
      objectData.scale.y,
      objectData.scale.z
    );

    // Armazenar referência e ID
    object.userData.id = objectData.id;
    object.userData.type = objectData.type;
    object.userData.properties = objectData.properties || {};

    // Adicionar à cena
    this.scene.add(object);
    this.loadedObjects.set(objectData.id, object);
  }

  /**
   * Limpa todos os objetos do mapa
   */
  clearMap(): void {
    for (const object of this.loadedObjects.values()) {
      this.scene.remove(object);
      this.disposeObject(object);
    }

    this.loadedObjects.clear();
    this.mapId = null;
  }

  /**
   * Libera memória de um objeto
   */
  private disposeObject(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          for (const material of object.material) {
            this.disposeMaterial(material as MaterialWithTextures);
          }
        } else {
          this.disposeMaterial(object.material as MaterialWithTextures);
        }
      }
    }

    // Recursivamente limpar filhos
    while (object.children.length > 0) {
      this.disposeObject(object.children[0]);
      object.remove(object.children[0]);
    }
  }

  /**
   * Libera recursos de um material
   */
  private disposeMaterial(material: MaterialWithTextures): void {
    material.dispose();

    // Limpar texturas se existirem
    if (material.map) {
      material.map.dispose();
    }

    if (material.normalMap) {
      material.normalMap.dispose();
    }

    if (material.specularMap) {
      material.specularMap.dispose();
    }

    if (material.envMap) {
      material.envMap.dispose();
    }
  }

  /**
   * Retorna um objeto pelo ID
   */
  getObjectById(id: string): THREE.Object3D | undefined {
    return this.loadedObjects.get(id);
  }

  /**
   * Retorna todos os objetos de um determinado tipo
   */
  getObjectsByType(type: string): THREE.Object3D[] {
    const result: THREE.Object3D[] = [];

    for (const object of this.loadedObjects.values()) {
      if (object.userData.type === type) {
        result.push(object);
      }
    }

    return result;
  }

  /**
   * Retorna o ID do mapa atual
   */
  getCurrentMapId(): string | null {
    return this.mapId;
  }

  /**
   * Verifica se um mapa está carregado
   */
  isMapLoaded(): boolean {
    return this.mapId !== null;
  }
}
