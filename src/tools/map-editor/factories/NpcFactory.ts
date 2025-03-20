import * as THREE from "three";
import { OBJECT_TYPES, ObjectType } from "../constants/ObjectTypes";
import { MapObjectProperties, NpcProperties } from "../models/MapObject";

/**
 * Factory para criar diferentes tipos de NPCs
 */
export class NpcFactory {
  /**
   * Cria um NPC baseado no tipo
   */
  createNpc(type: ObjectType, properties?: MapObjectProperties): THREE.Group {
    const npcGroup = new THREE.Group();

    // Definir cor baseada no tipo
    let bodyColor = 0x3282b8; // médico - azul

    if (type === OBJECT_TYPES.NPC_NURSE) {
      bodyColor = 0x8a2be2; // enfermeiro - roxo
    } else if (type === OBJECT_TYPES.NPC_PATIENT) {
      bodyColor = 0xe67e22; // paciente - laranja
    }

    // Sobrescreveer com cor personalizada, se disponível
    if (properties?.color) {
      bodyColor = new THREE.Color(properties.color).getHex();
    }

    // Criar corpo
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.5,
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9; // Posicionar para que fique em pé
    body.castShadow = true;
    npcGroup.add(body);

    // Criar cabeça
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd5cd, // Cor de pele para a cabeça
      roughness: 0.6,
    });

    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.0; // No topo do corpo
    head.castShadow = true;
    npcGroup.add(head);

    // Adicionar nome/tag, se disponível
    if (properties?.name) {
      this.addNameTag(npcGroup, properties.name);
    }

    // Se for um NPC de quest, adicionar indicador
    if ((properties as NpcProperties)?.questId) {
      this.addQuestIndicator(npcGroup);
    }

    return npcGroup;
  }

  /**
   * Adiciona uma tag com o nome do NPC
   */
  private addNameTag(npcGroup: THREE.Group, name: string): void {
    // Criar um canvas para renderizar o texto
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) return;

    // Configurar o canvas
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Adicionar texto
    context.font = "24px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(name, canvas.width / 2, canvas.height / 2);

    // Criar textura a partir do canvas
    const texture = new THREE.CanvasTexture(canvas);

    // Criar tag
    const tagGeometry = new THREE.PlaneGeometry(1, 0.25);
    const tagMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const tag = new THREE.Mesh(tagGeometry, tagMaterial);
    tag.position.y = 2.5; // Acima da cabeça
    tag.rotation.x = -0.2; // Inclinar levemente para a câmera

    // Adicionar ao grupo do NPC
    npcGroup.add(tag);
  }

  /**
   * Adiciona um indicador visual de que o NPC possui uma quest
   */
  private addQuestIndicator(npcGroup: THREE.Group): void {
    // Criar símbolo de exclamação
    const indicatorGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const indicatorMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00, // Amarelo
    });

    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.y = 2.7; // Acima da tag de nome

    // Adicionar ao grupo do NPC
    npcGroup.add(indicator);

    // Animação de flutuação
    const animate = () => {
      indicator.position.y = 2.7 + Math.sin(Date.now() * 0.003) * 0.1;
      requestAnimationFrame(animate);
    };

    animate();
  }
}
