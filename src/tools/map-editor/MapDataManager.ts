// src/tools/map-editor/MapDataManager.ts
import * as crypto from "crypto";

interface MapObject {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  properties?: Record<string, any>;
}

interface MapData {
  id: string;
  name: string;
  version: string;
  objects: MapObject[];
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    checksum: string;
  };
}

export class MapDataManager {
  private secretKey: string;

  constructor(secretKey: string = "medgame-default-key") {
    this.secretKey = secretKey;
  }

  /**
   * Gera um novo mapa vazio
   */
  createNewMap(name: string, author: string): MapData {
    const mapData: MapData = {
      id: this.generateUUID(),
      name: name,
      version: "1.0",
      objects: [],
      metadata: {
        author: author,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checksum: "",
      },
    };

    // Calcular checksum inicial
    mapData.metadata.checksum = this.calculateChecksum(mapData);

    return mapData;
  }

  /**
   * Adiciona um objeto ao mapa
   */
  addObject(map: MapData, object: Omit<MapObject, "id">): MapData {
    const newMap = { ...map };
    const newObject: MapObject = {
      ...object,
      id: this.generateUUID(),
    };

    newMap.objects = [...newMap.objects, newObject];
    newMap.metadata.updatedAt = new Date().toISOString();
    newMap.metadata.checksum = this.calculateChecksum(newMap);

    return newMap;
  }

  /**
   * Remove um objeto do mapa
   */
  removeObject(map: MapData, objectId: string): MapData {
    const newMap = { ...map };
    newMap.objects = newMap.objects.filter((obj) => obj.id !== objectId);
    newMap.metadata.updatedAt = new Date().toISOString();
    newMap.metadata.checksum = this.calculateChecksum(newMap);

    return newMap;
  }

  /**
   * Atualiza um objeto no mapa
   */
  updateObject(
    map: MapData,
    objectId: string,
    updates: Partial<MapObject>
  ): MapData {
    const newMap = { ...map };
    newMap.objects = newMap.objects.map((obj) => {
      if (obj.id === objectId) {
        return { ...obj, ...updates };
      }
      return obj;
    });

    newMap.metadata.updatedAt = new Date().toISOString();
    newMap.metadata.checksum = this.calculateChecksum(newMap);

    return newMap;
  }

  /**
   * Salva o mapa em formato JSON criptografado
   */
  serializeMap(map: MapData): string {
    // Salva versão do mapa sem o checksum para verificação posterior
    const mapWithoutChecksum = {
      ...map,
      metadata: {
        ...map.metadata,
        checksum: "",
      },
    };

    // Serializa o mapa para JSON
    return JSON.stringify({
      data: mapWithoutChecksum,
      checksum: map.metadata.checksum,
      signature: this.signData(JSON.stringify(mapWithoutChecksum)),
    });
  }

  /**
   * Carrega o mapa a partir de JSON, verificando integridade
   */
  deserializeMap(jsonData: string): MapData | null {
    try {
      const parsedData = JSON.parse(jsonData);
      const { data, checksum, signature } = parsedData;

      // Verifica a assinatura
      if (!this.verifySignature(JSON.stringify(data), signature)) {
        console.error("Assinatura do mapa inválida");
        return null;
      }

      // Verifica o checksum
      const calculatedChecksum = this.calculateChecksum(data);
      if (checksum !== calculatedChecksum) {
        console.error("Checksum do mapa inválido");
        return null;
      }

      // Restaura o checksum no objeto retornado
      return {
        ...data,
        metadata: {
          ...data.metadata,
          checksum,
        },
      };
    } catch (error) {
      console.error("Erro ao deserializar mapa:", error);
      return null;
    }
  }

  /**
   * Exporta o mapa para uso no cliente
   * Remove informações sensíveis e aplica otimizações
   */
  exportForClient(map: MapData): any {
    // Versão simplificada do mapa para o cliente
    // Remove propriedades que não são necessárias para renderização
    return {
      id: map.id,
      name: map.name,
      version: map.version,
      objects: map.objects.map((obj) => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
        // Mantém apenas propriedades relevantes para o cliente
        properties: this.filterClientProperties(obj.properties || {}),
      })),
      // Cliente não precisa das informações de metadados completas
      updatedAt: map.metadata.updatedAt,
    };
  }

  /**
   * Calcula o checksum do mapa
   */
  private calculateChecksum(map: MapData): string {
    // Cria uma cópia sem o checksum para cálculo
    const mapCopy = {
      ...map,
      metadata: {
        ...map.metadata,
        checksum: "",
      },
    };

    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(mapCopy));
    return hash.digest("hex");
  }

  /**
   * Gera uma assinatura para os dados
   */
  private signData(data: string): string {
    const hmac = crypto.createHmac("sha256", this.secretKey);
    hmac.update(data);
    return hmac.digest("hex");
  }

  /**
   * Verifica a assinatura dos dados
   */
  private verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.signData(data);
    return expectedSignature === signature;
  }

  /**
   * Filtra propriedades relevantes para o cliente
   */
  private filterClientProperties(
    properties: Record<string, any>
  ): Record<string, any> {
    // Lista de propriedades seguras para enviar ao cliente
    const safeProps: Record<string, any> = {};

    // Inclui apenas propriedades que o cliente precisa para renderização
    const allowedProps = [
      "displayName",
      "color",
      "visible",
      "interactable",
      "questId",
    ];

    for (const prop of allowedProps) {
      if (prop in properties) {
        safeProps[prop] = properties[prop];
      }
    }

    return safeProps;
  }

  /**
   * Gera um UUID v4
   */
  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}

// Exportamos também o mapa de conversor de tipos de objeto
// Isso garante que apenas tipos válidos sejam usados
export const OBJECT_TYPES = {
  WALL: "wall",
  FLOOR: "floor",
  DOOR: "door",
  WINDOW: "window",
  NPC_DOCTOR: "npc_doctor",
  NPC_NURSE: "npc_nurse",
  NPC_PATIENT: "npc_patient",
  FURNITURE_BED: "furniture_bed",
  FURNITURE_DESK: "furniture_desk",
  FURNITURE_CHAIR: "furniture_chair",
  EQUIPMENT_XRAY: "equipment_xray",
  EQUIPMENT_ECG: "equipment_ecg",
  QUEST_TRIGGER: "quest_trigger",
} as const;

// Tipo que representa os tipos válidos de objetos
export type ObjectType = (typeof OBJECT_TYPES)[keyof typeof OBJECT_TYPES];
