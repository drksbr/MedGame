import { MapObject } from "./MapObject";

/**
 * Interface para os dados do mapa
 */
export interface MapData {
  id?: string;
  name: string;
  version: string;
  objects: MapObject[];
  metadata?: {
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    checksum?: string;
  };
}

/**
 * Resposta da API ao salvar um mapa
 */
export interface SaveMapResponse {
  success: boolean;
  mapId?: string;
  message?: string;
}

/**
 * Resposta da API ao carregar um mapa
 */
export interface LoadMapResponse {
  success: boolean;
  mapData?: MapData;
  message?: string;
}

/**
 * Resposta da API ao listar mapas
 */
export interface ListMapsResponse {
  success: boolean;
  maps?: MapListItem[];
  message?: string;
}

/**
 * Item da lista de mapas
 */
export interface MapListItem {
  id: string;
  name: string;
  version: string;
  updatedAt: string;
}
