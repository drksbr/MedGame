import * as THREE from "three";
import { MapObjectProperties } from "../models/MapObject";

/**
 * Factory para criar pisos e terrenos
 */
export class FloorFactory {
  /**
   * Cria um piso simples
   */
  createFloor(properties?: MapObjectProperties): THREE.Mesh {
    const width = properties?.width || 10;
    const depth = properties?.depth || 10;

    const geometry = new THREE.PlaneGeometry(width, depth);
    const material = new THREE.MeshStandardMaterial({
      color: properties?.color || 0xeeeeee,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });

    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2; // Rotaciona para ficar horizontal
    floor.receiveShadow = true;

    return floor;
  }

  /**
   * Cria um piso em grade (para áreas externas)
   */
  createGridFloor(properties?: MapObjectProperties): THREE.Group {
    const floorGroup = new THREE.Group();

    // Piso base
    const floor = this.createFloor(properties);
    floorGroup.add(floor);

    // Adicionar grade sobreposta
    const gridSize = properties?.width || 10;
    const gridDivisions = properties?.gridDivisions || 10;

    const gridHelper = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      0x888888,
      0xcccccc
    );
    gridHelper.position.y = 0.01; // Ligeiramente acima do piso
    floorGroup.add(gridHelper);

    return floorGroup;
  }

  /**
   * Cria um terreno com relevo simples
   */
  createTerrain(properties?: MapObjectProperties): THREE.Mesh {
    const width = properties?.width || 50;
    const depth = properties?.depth || 50;
    const segments = 128;

    // Criar geometria de terreno
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);

    // Aplicar altura aleatória para criar relevo
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      // Altura (y) é o segundo componente (index + 1)
      if (i + 1 < vertices.length) {
        const noise = Math.random() * 0.5;
        vertices[i + 1] = noise;
      }
    }

    // Atualizar normais
    geometry.computeVertexNormals();

    // Material
    const material = new THREE.MeshStandardMaterial({
      color: properties?.color || 0x7cfc00,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;

    return terrain;
  }
}
