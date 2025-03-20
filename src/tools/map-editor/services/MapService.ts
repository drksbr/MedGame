import { MapData } from "../models/MapData";

/**
 * Serviço para carregar e salvar mapas
 */
export class MapService {
  /**
   * Salva um mapa no servidor
   */
  public async saveMap(
    mapData: MapData
  ): Promise<{ success: boolean; mapId?: string; message?: string }> {
    try {
      const response = await fetch("/api/maps/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mapData,
          editorKey: "editor-key-1", // Chave temporária para desenvolvimento
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Erro ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao salvar mapa:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Carrega um mapa do servidor
   */
  public async loadMap(
    mapId: string
  ): Promise<{ success: boolean; mapData?: MapData; message?: string }> {
    try {
      const response = await fetch(
        `/api/maps/load?mapId=${mapId}&editorKey=editor-key-1`
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Erro ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao carregar mapa:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Lista mapas disponíveis
   */
  public async listMaps(): Promise<{
    success: boolean;
    maps?: any[];
    message?: string;
  }> {
    try {
      const response = await fetch(`/api/maps/list?editorKey=editor-key-1`);

      if (!response.ok) {
        return {
          success: false,
          message: `Erro ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao listar mapas:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Exclui um mapa
   */
  public async deleteMap(
    mapId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch("/api/maps/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mapId,
          editorKey: "editor-key-1",
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Erro ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao excluir mapa:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}
