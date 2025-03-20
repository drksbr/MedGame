// src/server/controllers/MapController.ts
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Diretório onde os mapas serão armazenados
const MAPS_DIRECTORY = path.join(__dirname, "../../data/maps");

// Chave para assinatura - em produção, usar variável de ambiente
const MAP_SECRET_KEY = process.env.MAP_SECRET_KEY || "medgame-map-secret-key";

// Garante que o diretório de mapas exista
if (!fs.existsSync(MAPS_DIRECTORY)) {
  fs.mkdirSync(MAPS_DIRECTORY, { recursive: true });
}

export class MapController {
  /**
   * Salva um mapa enviado pelo editor
   */
  static async saveMap(req: Request, res: Response) {
    try {
      const { mapData, editorKey } = req.body;

      // Verificação de autorização
      if (!this.verifyEditorKey(editorKey)) {
        return res.status(403).json({
          success: false,
          message: "Não autorizado para salvar mapas",
        });
      }

      // Validar dados do mapa
      if (!this.validateMapData(mapData)) {
        return res.status(400).json({
          success: false,
          message: "Dados do mapa inválidos",
        });
      }

      // Adicionar dados de segurança
      const secureMapData = this.secureMapData(mapData);

      // Salvar no sistema de arquivos
      const filename = `${secureMapData.id}.map`;
      const filePath = path.join(MAPS_DIRECTORY, filename);

      fs.writeFileSync(filePath, JSON.stringify(secureMapData));

      return res.status(200).json({
        success: true,
        mapId: secureMapData.id,
        message: "Mapa salvo com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar mapa:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao salvar mapa",
      });
    }
  }

  /**
   * Carrega um mapa para o editor
   */
  static async loadMap(req: Request, res: Response) {
    try {
      const { mapId, editorKey } = req.query;

      // Verificação de autorização
      if (!this.verifyEditorKey(editorKey as string)) {
        return res.status(403).json({
          success: false,
          message: "Não autorizado para carregar mapas",
        });
      }

      // Validar ID do mapa
      if (!mapId || typeof mapId !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do mapa inválido",
        });
      }

      // Caminho do arquivo
      const filePath = path.join(MAPS_DIRECTORY, `${mapId}.map`);

      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Mapa não encontrado",
        });
      }

      // Ler e verificar o mapa
      const mapData = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Verificar integridade
      if (!this.verifyMapIntegrity(mapData)) {
        return res.status(400).json({
          success: false,
          message: "Mapa corrompido ou modificado",
        });
      }

      return res.status(200).json({
        success: true,
        mapData,
      });
    } catch (error) {
      console.error("Erro ao carregar mapa:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao carregar mapa",
      });
    }
  }

  /**
   * Lista mapas disponíveis para o editor
   */
  static async listMaps(req: Request, res: Response) {
    try {
      const { editorKey } = req.query;

      // Verificação de autorização
      if (!this.verifyEditorKey(editorKey as string)) {
        return res.status(403).json({
          success: false,
          message: "Não autorizado para listar mapas",
        });
      }

      // Ler arquivos do diretório
      const files = fs.readdirSync(MAPS_DIRECTORY);
      const maps = [];

      for (const file of files) {
        if (file.endsWith(".map")) {
          try {
            const mapData = JSON.parse(
              fs.readFileSync(path.join(MAPS_DIRECTORY, file), "utf8")
            );

            // Verificar integridade
            if (this.verifyMapIntegrity(mapData)) {
              maps.push({
                id: mapData.id,
                name: mapData.name,
                version: mapData.version,
                updatedAt: mapData.metadata.updatedAt,
              });
            }
          } catch (e) {
            console.error(`Erro ao ler mapa ${file}:`, e);
          }
        }
      }

      return res.status(200).json({
        success: true,
        maps,
      });
    } catch (error) {
      console.error("Erro ao listar mapas:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar mapas",
      });
    }
  }

  /**
   * Exclui um mapa
   */
  static async deleteMap(req: Request, res: Response) {
    try {
      const { mapId, editorKey } = req.body;

      // Verificação de autorização
      if (!this.verifyEditorKey(editorKey)) {
        return res.status(403).json({
          success: false,
          message: "Não autorizado para excluir mapas",
        });
      }

      // Validar ID do mapa
      if (!mapId || typeof mapId !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do mapa inválido",
        });
      }

      // Caminho do arquivo
      const filePath = path.join(MAPS_DIRECTORY, `${mapId}.map`);

      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Mapa não encontrado",
        });
      }

      // Excluir arquivo
      fs.unlinkSync(filePath);

      return res.status(200).json({
        success: true,
        message: "Mapa excluído com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir mapa:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir mapa",
      });
    }
  }

  /**
   * Carrega mapa para o cliente
   * Retorna apenas os dados necessários para renderização
   */
  static async getMapForClient(req: Request, res: Response) {
    try {
      const { mapId } = req.params;

      // Validar ID do mapa
      if (!mapId) {
        return res.status(400).json({
          success: false,
          message: "ID do mapa é obrigatório",
        });
      }

      // Caminho do arquivo
      const filePath = path.join(MAPS_DIRECTORY, `${mapId}.map`);

      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Mapa não encontrado",
        });
      }

      // Ler e verificar o mapa
      const mapData = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Verificar integridade
      if (!this.verifyMapIntegrity(mapData)) {
        return res.status(400).json({
          success: false,
          message: "Mapa corrompido ou modificado",
        });
      }

      // Filtrar dados para o cliente
      const clientMapData = this.prepareMapForClient(mapData);

      return res.status(200).json({
        success: true,
        mapData: clientMapData,
      });
    } catch (error) {
      console.error("Erro ao obter mapa para cliente:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao obter mapa",
      });
    }
  }

  /**
   * Verifica se a chave do editor é válida
   */
  private static verifyEditorKey(key: string): boolean {
    // Em produção, comparar com chaves armazenadas no banco de dados
    // ou uma lista de chaves autorizadas
    const validKeys = ["editor-key-1", "editor-key-2"];
    return validKeys.includes(key);
  }

  /**
   * Valida a estrutura dos dados do mapa
   */
  private static validateMapData(mapData: any): boolean {
    // Validações básicas
    if (!mapData || typeof mapData !== "object") return false;
    if (!mapData.name || typeof mapData.name !== "string") return false;
    if (!Array.isArray(mapData.objects)) return false;

    // Validação dos objetos
    for (const obj of mapData.objects) {
      if (!obj.type || typeof obj.type !== "string") return false;
      if (!obj.position || typeof obj.position !== "object") return false;
      if (!obj.rotation || typeof obj.rotation !== "object") return false;
      if (!obj.scale || typeof obj.scale !== "object") return false;

      // Validar coordenadas
      const coords = ["x", "y", "z"];
      for (const coord of coords) {
        if (typeof obj.position[coord] !== "number") return false;
        if (typeof obj.rotation[coord] !== "number") return false;
        if (typeof obj.scale[coord] !== "number") return false;
      }
    }

    return true;
  }

  /**
   * Adiciona dados de segurança ao mapa
   */
  private static secureMapData(mapData: any): any {
    const timestamp = new Date().toISOString();

    // Criar ou atualizar identificador
    if (!mapData.id) {
      mapData.id = this.generateUUID();
    }

    // Adicionar ou atualizar metadados
    mapData.metadata = {
      ...(mapData.metadata || {}),
      updatedAt: timestamp,
      createdAt: mapData.metadata?.createdAt || timestamp,
      author: mapData.metadata?.author || "unknown",
    };

    // Calcular e adicionar checksum
    const dataToSign = {
      ...mapData,
      metadata: {
        ...mapData.metadata,
        checksum: undefined,
      },
    };

    const checksum = this.calculateChecksum(dataToSign);
    mapData.metadata.checksum = checksum;

    // Adicionar assinatura
    mapData.metadata.signature = this.signData(
      JSON.stringify(dataToSign),
      MAP_SECRET_KEY
    );

    return mapData;
  }

  /**
   * Verifica a integridade do mapa
   */
  private static verifyMapIntegrity(mapData: any): boolean {
    if (!mapData.metadata) return false;
    if (!mapData.metadata.checksum) return false;
    if (!mapData.metadata.signature) return false;

    // Obter checksum original
    const originalChecksum = mapData.metadata.checksum;

    // Recalcular checksum
    const dataToCheck = {
      ...mapData,
      metadata: {
        ...mapData.metadata,
        checksum: undefined,
      },
    };

    const calculatedChecksum = this.calculateChecksum(dataToCheck);

    // Verificar checksum
    if (originalChecksum !== calculatedChecksum) {
      return false;
    }

    // Verificar assinatura
    return this.verifySignature(
      JSON.stringify(dataToCheck),
      mapData.metadata.signature,
      MAP_SECRET_KEY
    );
  }

  /**
   * Prepara o mapa para envio ao cliente
   */
  private static prepareMapForClient(mapData: any): any {
    // Remover informações sensíveis e desnecessárias
    return {
      id: mapData.id,
      name: mapData.name,
      version: mapData.version,
      objects: mapData.objects.map((obj: any) => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
        // Incluir apenas propriedades relevantes para o cliente
        properties: this.filterClientProperties(obj.properties || {}),
      })),
    };
  }

  /**
   * Filtra propriedades relevantes para o cliente
   */
  private static filterClientProperties(
    properties: Record<string, any>
  ): Record<string, any> {
    // Lista de propriedades seguras para enviar ao cliente
    const safeProps: Record<string, any> = {};

    // Propriedades permitidas para o cliente
    const allowedProps = [
      "displayName",
      "color",
      "visible",
      "interactable",
      "questId",
      "collider",
      "animation",
    ];

    for (const prop of allowedProps) {
      if (prop in properties) {
        safeProps[prop] = properties[prop];
      }
    }

    return safeProps;
  }

  /**
   * Gera UUID v4
   */
  private static generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * Calcula checksum para os dados
   */
  private static calculateChecksum(data: any): string {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(data));
    return hash.digest("hex");
  }

  /**
   * Assina os dados com a chave secreta
   */
  private static signData(data: string, key: string): string {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(data);
    return hmac.digest("hex");
  }

  /**
   * Verifica a assinatura dos dados
   */
  private static verifySignature(
    data: string,
    signature: string,
    key: string
  ): boolean {
    const expectedSignature = this.signData(data, key);
    return expectedSignature === signature;
  }
}
