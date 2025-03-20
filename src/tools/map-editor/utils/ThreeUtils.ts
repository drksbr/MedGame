import * as THREE from "three";

/**
 * Utilitários para THREE.js
 */
export class ThreeUtils {
  /**
   * Percorre os materiais de um objeto e seus filhos
   * @param object Objeto a ser percorrido
   * @param callback Função de callback para cada material
   */
  static traverseMaterials(
    object: THREE.Object3D,
    callback: (material: THREE.Material) => void
  ): void {
    object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const materials = Array.isArray(node.material)
          ? node.material
          : [node.material];

        for (const material of materials) {
          callback(material);
        }
      }
    });
  }

  /**
   * Destaca visualmente um objeto
   */
  static highlightObject(object: THREE.Object3D): void {
    ThreeUtils.traverseMaterials(object, (material) => {
      if (!material.userData.originalEmissive) {
        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhongMaterial
        ) {
          material.userData.originalEmissive = material.emissive.clone();
          material.emissive.set(0x333333);
        }
      }
    });
  }

  /**
   * Remove destaque visual de um objeto
   */
  static unhighlightObject(object: THREE.Object3D): void {
    ThreeUtils.traverseMaterials(object, (material) => {
      if (material.userData.originalEmissive) {
        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhongMaterial
        ) {
          material.emissive.copy(material.userData.originalEmissive);
          delete material.userData.originalEmissive;
        }
      }
    });
  }

  /**
   * Dispõe recursos de um objeto THREE.js
   */
  static disposeObject(object: THREE.Object3D): void {
    // Remove todos os filhos recursivamente
    while (object.children.length > 0) {
      ThreeUtils.disposeObject(object.children[0]);
      object.remove(object.children[0]);
    }

    // Dispor geometria
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      // Dispor materiais
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) =>
            ThreeUtils.disposeMaterial(material)
          );
        } else {
          ThreeUtils.disposeMaterial(object.material);
        }
      }
    }
  }

  /**
   * Dispõe recursos de um material
   */
  static disposeMaterial(material: THREE.Material): void {
    // Dispor o material
    material.dispose();

    // Dispor texturas associadas
    for (const propertyName of Object.keys(material)) {
      const value = (material as any)[propertyName];
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    }
  }

  /**
   * Cria um clone profundo de um objeto THREE
   */
  static deepClone(object: THREE.Object3D): THREE.Object3D {
    // Clone básico
    const clone = object.clone();

    // Copiar userData
    clone.userData = JSON.parse(JSON.stringify(object.userData));

    // Clonar materiais e geometrias de meshes
    if (object instanceof THREE.Mesh && clone instanceof THREE.Mesh) {
      if (object.geometry) {
        clone.geometry = object.geometry.clone();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          clone.material = object.material.map((m) => m.clone());
        } else {
          clone.material = object.material.clone();
        }
      }
    }

    // Limpar filhos autoclonados e clonar manualmente cada um
    clone.children.length = 0;

    for (const child of object.children) {
      clone.add(ThreeUtils.deepClone(child));
    }

    return clone;
  }

  /**
   * Gera um UUID compatível com THREE.js
   */
  static generateUUID(): string {
    return THREE.MathUtils.generateUUID();
  }

  /**
   * Posiciona um objeto na grade (snap to grid)
   */
  static snapToGrid(
    position: THREE.Vector3,
    gridSize: number = 1
  ): THREE.Vector3 {
    return new THREE.Vector3(
      Math.round(position.x / gridSize) * gridSize,
      Math.round(position.y / gridSize) * gridSize,
      Math.round(position.z / gridSize) * gridSize
    );
  }
}
