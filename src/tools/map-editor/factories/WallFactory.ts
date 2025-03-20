import * as THREE from "three";
import { MapObjectProperties } from "../models/MapObject";

/**
 * Factory para criar paredes, portas e janelas
 */
export class WallFactory {
  /**
   * Cria uma parede simples
   */
  createWall(properties?: MapObjectProperties): THREE.Mesh {
    const width = properties?.width || 5;
    const height = properties?.height || 3;
    const depth = properties?.depth || 0.3;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: properties?.color || 0xdddddd,
      roughness: 0.7,
    });

    const wall = new THREE.Mesh(geometry, material);
    wall.castShadow = true;
    wall.receiveShadow = true;

    return wall;
  }

  /**
   * Cria uma porta com moldura
   */
  createDoor(properties?: MapObjectProperties): THREE.Group {
    const doorGroup = new THREE.Group();

    // Dimensões da porta
    const width = properties?.width || 2.2;
    const height = properties?.height || 2.5;

    // Moldura
    const frameGeometry = new THREE.BoxGeometry(width, height, 0.3);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    doorGroup.add(frame);

    // Porta
    const doorGeometry = new THREE.BoxGeometry(width - 0.4, height - 0.3, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: properties?.color || 0xa52a2a,
      roughness: 0.6,
    });

    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.z = 0.1;
    doorGroup.add(door);

    // Maçaneta
    const knobGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const knobMaterial = new THREE.MeshStandardMaterial({ color: 0xd4af37 });

    const knob = new THREE.Mesh(knobGeometry, knobMaterial);
    knob.position.set(width / 3, 0, 0.15);
    doorGroup.add(knob);

    doorGroup.castShadow = true;
    doorGroup.receiveShadow = true;

    return doorGroup;
  }

  /**
   * Cria uma janela com moldura
   */
  createWindow(properties?: MapObjectProperties): THREE.Group {
    const windowGroup = new THREE.Group();

    // Dimensões da janela
    const width = properties?.width || 2;
    const height = properties?.height || 2;

    // Moldura
    const frameGeometry = new THREE.BoxGeometry(width, height, 0.2);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    windowGroup.add(frame);

    // Vidro
    const glassGeometry = new THREE.BoxGeometry(
      width - 0.5,
      height - 0.5,
      0.05
    );
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: properties?.color || 0xadd8e6,
      transparent: true,
      opacity: 0.6,
    });

    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.z = 0.08;
    windowGroup.add(glass);

    windowGroup.castShadow = true;
    windowGroup.receiveShadow = true;

    return windowGroup;
  }
}
