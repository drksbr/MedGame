import * as THREE from "three";
import { ThreeUtils } from "../utils/ThreeUtils";

/**
 * Tipo de ação para undo/redo
 */
export type ActionType = "add" | "remove" | "transform" | "modify";

/**
 * Dados da ação para undo/redo
 */
export interface ActionData {
  type: ActionType;
  objectId: string;

  // Para ações add/remove
  object?: THREE.Object3D;
  index?: number;

  // Para ações transform
  oldPosition?: THREE.Vector3;
  newPosition?: THREE.Vector3;
  oldRotation?: THREE.Euler;
  newRotation?: THREE.Euler;
  oldScale?: THREE.Vector3;
  newScale?: THREE.Vector3;

  // Para ações modify
  oldProperties?: any;
  newProperties?: any;
}

/**
 * Serviço para gerenciar operações de desfazer/refazer
 */
export class UndoService {
  private undoStack: ActionData[] = [];
  private redoStack: ActionData[] = [];
  private maxStackSize = 50;
  private scene: THREE.Scene;
  private objects: THREE.Object3D[];

  constructor(scene: THREE.Scene, objects: THREE.Object3D[]) {
    this.scene = scene;
    this.objects = objects;
  }

  /**
   * Registra uma ação para desfazer
   */
  private recordAction(action: ActionData): void {
    this.undoStack.push(action);

    // Limitar tamanho da pilha
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }

    // Limpar pilha de redo ao adicionar nova ação
    this.redoStack = [];
  }

  /**
   * Registra a adição de um objeto
   */
  public recordAdd(object: THREE.Object3D): void {
    this.recordAction({
      type: "add",
      objectId: object.userData.id,
      object: object,
    });
  }

  /**
   * Registra a remoção de um objeto
   */
  public recordRemove(object: THREE.Object3D): void {
    // Encontrar índice
    const index = this.objects.indexOf(object);

    // Criar clone profundo para poder restaurar
    const clonedObject = ThreeUtils.deepClone(object);

    this.recordAction({
      type: "remove",
      objectId: object.userData.id,
      object: clonedObject,
      index: index,
    });
  }

  /**
   * Registra a transformação de um objeto
   */
  public recordTransform(
    object: THREE.Object3D,
    oldPosition: THREE.Vector3,
    oldRotation: THREE.Euler,
    oldScale: THREE.Vector3
  ): void {
    this.recordAction({
      type: "transform",
      objectId: object.userData.id,
      oldPosition: oldPosition.clone(),
      newPosition: object.position.clone(),
      oldRotation: oldRotation.clone(),
      newRotation: object.rotation.clone(),
      oldScale: oldScale.clone(),
      newScale: object.scale.clone(),
    });
  }

  /**
   * Registra a modificação de propriedades
   */
  public recordModify(
    object: THREE.Object3D,
    oldProperties: any,
    newProperties: any
  ): void {
    this.recordAction({
      type: "modify",
      objectId: object.userData.id,
      oldProperties: JSON.parse(JSON.stringify(oldProperties)),
      newProperties: JSON.parse(JSON.stringify(newProperties)),
    });
  }

  /**
   * Desfaz a última ação
   */
  public undo(): boolean {
    if (this.undoStack.length === 0) {
      return false;
    }

    const action = this.undoStack.pop()!;

    // Processar ação baseado no tipo
    switch (action.type) {
      case "add":
        this.undoAdd(action);
        break;
      case "remove":
        this.undoRemove(action);
        break;
      case "transform":
        this.undoTransform(action);
        break;
      case "modify":
        this.undoModify(action);
        break;
    }

    // Adicionar à pilha de redo
    this.redoStack.push(action);

    return true;
  }

  /**
   * Refaz a última ação desfeita
   */
  public redo(): boolean {
    if (this.redoStack.length === 0) {
      return false;
    }

    const action = this.redoStack.pop()!;

    // Processar ação baseado no tipo
    switch (action.type) {
      case "add":
        this.redoAdd(action);
        break;
      case "remove":
        this.redoRemove(action);
        break;
      case "transform":
        this.redoTransform(action);
        break;
      case "modify":
        this.redoModify(action);
        break;
    }

    // Adicionar de volta à pilha de undo
    this.undoStack.push(action);

    return true;
  }

  /**
   * Desfaz uma adição
   */
  private undoAdd(action: ActionData): void {
    // Encontrar o objeto pelo ID
    const object = this.findObjectById(action.objectId);

    if (object) {
      // Remover da cena
      this.scene.remove(object);

      // Remover da lista de objetos
      const index = this.objects.indexOf(object);
      if (index !== -1) {
        this.objects.splice(index, 1);
      }
    }
  }

  /**
   * Desfaz uma remoção
   */
  private undoRemove(action: ActionData): void {
    if (action.object && action.index !== undefined) {
      // Adicionar objeto de volta à cena
      this.scene.add(action.object);

      // Adicionar de volta à lista de objetos
      this.objects.splice(action.index, 0, action.object);
    }
  }

  /**
   * Desfaz uma transformação
   */
  private undoTransform(action: ActionData): void {
    const object = this.findObjectById(action.objectId);

    if (object && action.oldPosition && action.oldRotation && action.oldScale) {
      // Restaurar posição e rotação antigas
      object.position.copy(action.oldPosition);
      object.rotation.copy(action.oldRotation);
      object.scale.copy(action.oldScale);
    }
  }

  /**
   * Desfaz uma modificação de propriedades
   */
  private undoModify(action: ActionData): void {
    const object = this.findObjectById(action.objectId);

    if (object && action.oldProperties) {
      // Restaurar propriedades antigas
      object.userData.properties = action.oldProperties;

      // Atualizar aparência
      if (action.oldProperties.color) {
        ThreeUtils.traverseMaterials(object, (material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshPhongMaterial
          ) {
            material.color.set(action.oldProperties.color);
          }
        });
      }

      // Atualizar visibilidade
      if (action.oldProperties.visible !== undefined) {
        object.visible = action.oldProperties.visible;
      }
    }
  }

  /**
   * Refaz uma adição
   */
  private redoAdd(action: ActionData): void {
    if (action.object) {
      // Adicionar de volta à cena
      this.scene.add(action.object);

      // Adicionar à lista de objetos
      this.objects.push(action.object);
    }
  }

  /**
   * Refaz uma remoção
   */
  private redoRemove(action: ActionData): void {
    const object = this.findObjectById(action.objectId);

    if (object) {
      // Remover da cena
      this.scene.remove(object);

      // Remover da lista de objetos
      const index = this.objects.indexOf(object);
      if (index !== -1) {
        this.objects.splice(index, 1);
      }
    }
  }

  /**
   * Refaz uma transformação
   */
  private redoTransform(action: ActionData): void {
    const object = this.findObjectById(action.objectId);

    if (object && action.newPosition && action.newRotation && action.newScale) {
      // Restaurar posição e rotação novas
      object.position.copy(action.newPosition);
      object.rotation.copy(action.newRotation);
      object.scale.copy(action.newScale);
    }
  }

  /**
   * Refaz uma modificação de propriedades
   */
  private redoModify(action: ActionData): void {
    const object = this.findObjectById(action.objectId);

    if (object && action.newProperties) {
      // Restaurar propriedades novas
      object.userData.properties = action.newProperties;

      // Atualizar aparência
      if (action.newProperties.color) {
        ThreeUtils.traverseMaterials(object, (material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshPhongMaterial
          ) {
            material.color.set(action.newProperties.color);
          }
        });
      }

      // Atualizar visibilidade
      if (action.newProperties.visible !== undefined) {
        object.visible = action.newProperties.visible;
      }
    }
  }

  /**
   * Encontra um objeto pelo ID
   */
  private findObjectById(id: string): THREE.Object3D | null {
    for (const object of this.objects) {
      if (object.userData.id === id) {
        return object;
      }
    }
    return null;
  }

  /**
   * Limpa as pilhas de undo e redo
   */
  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
