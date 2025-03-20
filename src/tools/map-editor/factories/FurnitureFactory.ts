import * as THREE from "three";
import { MapObjectProperties } from "../models/MapObject";

/**
 * Factory para criar móveis e outros objetos de cenário
 */
export class FurnitureFactory {
  /**
   * Cria uma cama de hospital
   */
  createBed(properties?: MapObjectProperties): THREE.Group {
    const bedGroup = new THREE.Group();

    // Dimensões
    const width = properties?.width || 2.5;
    const height = properties?.height || 0.6;
    const depth = properties?.depth || 1.8;

    // Base (estrutura metálica)
    const baseGeometry = new THREE.BoxGeometry(width, height / 2, depth);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0.5,
      roughness: 0.5,
    });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = height / 4;
    base.castShadow = true;
    base.receiveShadow = true;
    bedGroup.add(base);

    // Colchão
    const mattressGeometry = new THREE.BoxGeometry(
      width - 0.1,
      height / 2,
      depth - 0.1
    );
    const mattressMaterial = new THREE.MeshStandardMaterial({
      color: properties?.color || 0xffffff,
      roughness: 0.9,
    });

    const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
    mattress.position.y = height / 2 + 0.05;
    mattress.castShadow = true;
    bedGroup.add(mattress);

    // Travesseiro
    const pillowGeometry = new THREE.BoxGeometry(
      width / 3,
      height / 4,
      depth - 0.5
    );
    const pillowMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.8,
    });

    const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
    pillow.position.set(-(width / 3), height * 0.6, 0);
    bedGroup.add(pillow);

    // Grades laterais (opcional para camas de hospital)
    if (properties?.hasRails !== false) {
      const railGeometry = new THREE.BoxGeometry(width, height / 3, 0.05);
      const railMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.8,
        roughness: 0.2,
      });

      // Grade esquerda
      const leftRail = new THREE.Mesh(railGeometry, railMaterial);
      leftRail.position.set(0, height / 2, depth / 2);
      leftRail.rotation.x = Math.PI / 2;
      bedGroup.add(leftRail);

      // Grade direita
      const rightRail = new THREE.Mesh(railGeometry, railMaterial);
      rightRail.position.set(0, height / 2, -depth / 2);
      rightRail.rotation.x = Math.PI / 2;
      bedGroup.add(rightRail);
    }

    return bedGroup;
  }

  /**
   * Cria uma mesa simples
   */
  createDesk(properties?: MapObjectProperties): THREE.Group {
    const deskGroup = new THREE.Group();

    // Dimensões
    const width = properties?.width || 2;
    const height = properties?.height || 0.8;
    const depth = properties?.depth || 1;

    // Tampo
    const topGeometry = new THREE.BoxGeometry(width, 0.05, depth);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: properties?.color || 0x8b4513,
      roughness: 0.8,
    });

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height;
    top.castShadow = true;
    deskGroup.add(top);

    // Pernas
    const legGeometry = new THREE.BoxGeometry(0.1, height, 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b3e26,
      roughness: 0.8,
    });

    // Criar as quatro pernas
    const legPositions = [
      { x: -width / 2 + 0.1, z: -depth / 2 + 0.1 },
      { x: -width / 2 + 0.1, z: depth / 2 - 0.1 },
      { x: width / 2 - 0.1, z: -depth / 2 + 0.1 },
      { x: width / 2 - 0.1, z: depth / 2 - 0.1 },
    ];

    for (const pos of legPositions) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos.x, height / 2, pos.z);
      leg.castShadow = true;
      deskGroup.add(leg);
    }

    return deskGroup;
  }

  /**
   * Cria uma cadeira simples
   */
  createChair(properties?: MapObjectProperties): THREE.Group {
    const chairGroup = new THREE.Group();

    // Dimensões
    const width = properties?.width || 0.5;
    const height = properties?.height || 0.9;
    const depth = properties?.depth || 0.5;
    const seatHeight = 0.45;

    // Assento
    const seatGeometry = new THREE.BoxGeometry(width, 0.05, depth);
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: properties?.color || 0x8b4513,
      roughness: 0.8,
    });

    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = seatHeight;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Encosto
    const backGeometry = new THREE.BoxGeometry(
      width,
      height - seatHeight,
      0.05
    );
    const backMaterial = seatMaterial.clone();

    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, (height + seatHeight) / 2, -depth / 2 + 0.025);
    back.castShadow = true;
    chairGroup.add(back);

    // Pernas
    const legGeometry = new THREE.BoxGeometry(0.05, seatHeight, 0.05);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b3e26,
      roughness: 0.8,
    });

    // Criar as quatro pernas
    const legPositions = [
      { x: -width / 2 + 0.05, z: -depth / 2 + 0.05 },
      { x: -width / 2 + 0.05, z: depth / 2 - 0.05 },
      { x: width / 2 - 0.05, z: -depth / 2 + 0.05 },
      { x: width / 2 - 0.05, z: depth / 2 - 0.05 },
    ];

    for (const pos of legPositions) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos.x, seatHeight / 2, pos.z);
      leg.castShadow = true;
      chairGroup.add(leg);
    }

    return chairGroup;
  }

  /**
   * Cria um equipamento médico (genérico)
   */
  createMedicalEquipment(properties?: MapObjectProperties): THREE.Group {
    const equipGroup = new THREE.Group();

    // Base/carrinho
    const baseGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.6);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
    });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.05;
    equipGroup.add(base);

    // Corpo principal
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: properties?.color || 0xffffff,
      roughness: 0.8,
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.7;
    body.castShadow = true;
    equipGroup.add(body);

    // Painel de controle
    const panelGeometry = new THREE.PlaneGeometry(0.4, 0.3);
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
    });

    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(0, 0.9, 0.251);
    equipGroup.add(panel);

    // Rodas
    const wheelGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.7,
    });

    // Posições das rodas
    const wheelPositions = [
      { x: -0.3, z: -0.2 },
      { x: -0.3, z: 0.2 },
      { x: 0.3, z: -0.2 },
      { x: 0.3, z: 0.2 },
    ];

    for (const pos of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos.x, 0.06, pos.z);
      equipGroup.add(wheel);
    }

    return equipGroup;
  }

  /**
   * Cria uma máquina de raio-X
   */
  createXRayMachine(properties?: MapObjectProperties): THREE.Group {
    const xrayGroup = new THREE.Group();

    // Base
    const baseGeometry = new THREE.BoxGeometry(1.5, 0.1, 1.5);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
    });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.05;
    xrayGroup.add(base);

    // Suporte vertical
    const standGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const standMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
      metalness: 0.8,
      roughness: 0.2,
    });

    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.set(0, 1, 0);
    xrayGroup.add(stand);

    // Braço horizontal
    const armGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.1);
    const armMaterial = standMaterial.clone();

    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.set(0, 1.8, 0);
    xrayGroup.add(arm);

    // Cabeça de emissão
    const headGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: properties?.color || 0xffffff,
      roughness: 0.8,
    });

    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(-0.5, 1.8, 0);
    head.castShadow = true;
    xrayGroup.add(head);

    // Receptor
    const receptorGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.6);
    const receptorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
    });

    const receptor = new THREE.Mesh(receptorGeometry, receptorMaterial);
    receptor.position.set(0.5, 1.2, 0);
    receptor.castShadow = true;
    xrayGroup.add(receptor);

    return xrayGroup;
  }
}
