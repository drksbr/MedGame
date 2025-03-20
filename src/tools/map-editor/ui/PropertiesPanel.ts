import * as THREE from "three";
import { GUI } from "dat.gui";
import { OBJECT_TYPES, ObjectType } from "../constants/ObjectTypes";
import { MapObjectProperties } from "../models/MapObject";

export interface PropertiesChangeCallback {
  (object: THREE.Object3D, properties: MapObjectProperties): void;
}

export interface DimensionsChangeCallback {
  (object: THREE.Object3D, width: number, height: number, depth: number): void;
}

/**
 * Painel de propriedades para objetos no editor
 */
export class PropertiesPanel {
  private gui: GUI;
  private folders: Record<string, GUI> = {};
  private controllers: Record<string, any[]> = {};
  private properties: MapObjectProperties = {
    color: "#ffffff",
    name: "",
    questId: "",
    visible: true,
    interactable: true,
    width: 5,
    height: 3,
    depth: 0.3,
  };

  private propertiesChangeCallback: PropertiesChangeCallback;
  private dimensionsChangeCallback: DimensionsChangeCallback;

  constructor(
    propertiesChangeCallback: PropertiesChangeCallback,
    dimensionsChangeCallback: DimensionsChangeCallback,
    container?: HTMLElement
  ) {
    this.propertiesChangeCallback = propertiesChangeCallback;
    this.dimensionsChangeCallback = dimensionsChangeCallback;

    // Inicializar dat.GUI
    this.gui = new GUI({
      autoPlace: !container,
      width: 300,
    });

    if (container) {
      container.appendChild(this.gui.domElement);
    }

    this.setupPanels();
  }

  /**
   * Configura os painéis de propriedades
   */
  private setupPanels(): void {
    // Pasta para propriedades básicas
    this.folders.basic = this.gui.addFolder("Propriedades Básicas");
    this.controllers.basic = [];

    this.controllers.basic.push(
      this.folders.basic
        .addColor(this.properties, "color")
        .name("Cor")
        .onChange(() => this.onPropertiesChange())
    );

    this.controllers.basic.push(
      this.folders.basic
        .add(this.properties, "name")
        .name("Nome")
        .onChange(() => this.onPropertiesChange())
    );

    this.controllers.basic.push(
      this.folders.basic
        .add(this.properties, "visible")
        .name("Visível")
        .onChange(() => this.onPropertiesChange())
    );

    this.controllers.basic.push(
      this.folders.basic
        .add(this.properties, "interactable")
        .name("Interativo")
        .onChange(() => this.onPropertiesChange())
    );

    // Pasta para dimensões
    this.folders.dimensions = this.gui.addFolder("Dimensões");
    this.controllers.dimensions = [];

    this.controllers.dimensions.push(
      this.folders.dimensions
        .add(this.properties, "width", 0.1, 20)
        .name("Largura")
        .onChange(() => this.onDimensionsChange())
    );

    this.controllers.dimensions.push(
      this.folders.dimensions
        .add(this.properties, "height", 0.1, 10)
        .name("Altura")
        .onChange(() => this.onDimensionsChange())
    );

    this.controllers.dimensions.push(
      this.folders.dimensions
        .add(this.properties, "depth", 0.1, 20)
        .name("Profundidade")
        .onChange(() => this.onDimensionsChange())
    );

    // Pasta para propriedades de quest
    this.folders.quest = this.gui.addFolder("Propriedades de Quest");
    this.controllers.quest = [];

    this.controllers.quest.push(
      this.folders.quest
        .add(this.properties, "questId")
        .name("ID da Quest")
        .onChange(() => this.onPropertiesChange())
    );

    // Abrir a pasta de propriedades básicas por padrão
    this.folders.basic.open();
  }

  /**
   * Atualiza o painel com as propriedades do objeto selecionado
   */
  updateFromObject(object: THREE.Object3D | null): void {
    if (!object) {
      this.resetToDefaults();
      this.disableAllControllers();
      return;
    }

    const props = object.userData.properties || {};
    const objectType = object.userData.type as ObjectType;

    // Atualizar propriedades com os valores do objeto
    this.properties.color = props.color || "#ffffff";
    this.properties.name = props.name || "";
    this.properties.questId = props.questId || "";
    this.properties.visible = props.visible !== false;
    this.properties.interactable = props.interactable !== false;

    // Habilitar/desabilitar controladores baseado no tipo de objeto
    this.enableControllersByType(objectType);

    // Atualizar dimensões se for um Mesh
    if (object instanceof THREE.Mesh && object.geometry) {
      this.updateDimensionsFromMesh(object);
    } else {
      // Desabilitar controles de dimensão para objetos complexos
      this.disableFolder("dimensions");
    }

    // Atualizar todos os controladores
    this.updateAllControllers();
  }

  /**
   * Atualiza dimensões baseado na geometria do mesh
   */
  private updateDimensionsFromMesh(mesh: THREE.Mesh): void {
    const geometry = mesh.geometry;

    if (geometry instanceof THREE.BoxGeometry) {
      this.properties.width = geometry.parameters.width;
      this.properties.height = geometry.parameters.height;
      this.properties.depth = geometry.parameters.depth;
      this.enableFolder("dimensions");
    } else if (geometry instanceof THREE.PlaneGeometry) {
      this.properties.width = geometry.parameters.width;
      this.properties.depth = geometry.parameters.height;
      this.properties.height = 0.1; // Espessura nominal

      // Desabilitar controle de altura para planos
      this.disableController("dimensions", 1); // height é o segundo (índice 1)
      this.enableFolder("dimensions");
    } else {
      // Geometria complexa, desabilitar controles
      this.disableFolder("dimensions");
    }
  }

  /**
   * Handler para mudança de propriedades
   */
  private onPropertiesChange(): void {
    // Criar objeto com as propriedades atuais
    const props: MapObjectProperties = {
      color: this.properties.color,
      name: this.properties.name,
      questId: this.properties.questId,
      visible: this.properties.visible,
      interactable: this.properties.interactable,
    };

    // Chamar callback com as propriedades atualizadas
    this.propertiesChangeCallback(this as any, props);
  }

  /**
   * Handler para mudança de dimensões
   */
  private onDimensionsChange(): void {
    // Garantir que width, height e depth sejam números
    const width = this.properties.width || 1;
    const height = this.properties.height || 1;
    const depth = this.properties.depth || 1;

    this.dimensionsChangeCallback(this as any, width, height, depth);
  }

  /**
   * Reseta propriedades para valores padrão
   */
  private resetToDefaults(): void {
    this.properties.color = "#ffffff";
    this.properties.name = "";
    this.properties.questId = "";
    this.properties.visible = true;
    this.properties.interactable = true;
    this.properties.width = 5;
    this.properties.height = 3;
    this.properties.depth = 0.3;
  }

  /**
   * Habilita os controladores adequados para um tipo específico de objeto
   */
  private enableControllersByType(type: ObjectType): void {
    // Habilitar propriedades básicas para todos os tipos
    this.enableFolder("basic");

    // Habilitar propriedades específicas para cada tipo
    const questTypes: ObjectType[] = [
      OBJECT_TYPES.QUEST_TRIGGER,
      OBJECT_TYPES.NPC_DOCTOR,
      OBJECT_TYPES.NPC_NURSE,
      OBJECT_TYPES.NPC_PATIENT,
    ];

    if (questTypes.includes(type)) {
      this.enableFolder("quest");
    } else {
      this.disableFolder("quest");
    }
  }

  /**
   * Desabilita todos os controladores
   */
  private disableAllControllers(): void {
    for (const folderName of Object.keys(this.folders)) {
      this.disableFolder(folderName);
    }
  }

  /**
   * Habilita uma pasta e todos os seus controladores
   */
  private enableFolder(folderName: string): void {
    if (!this.folders[folderName] || !this.controllers[folderName]) return;

    const folder = this.folders[folderName];
    folder.domElement.style.pointerEvents = "";
    folder.domElement.style.opacity = "1";

    for (let i = 0; i < this.controllers[folderName].length; i++) {
      this.enableController(folderName, i);
    }
  }

  /**
   * Desabilita uma pasta e todos os seus controladores
   */
  private disableFolder(folderName: string): void {
    if (!this.folders[folderName] || !this.controllers[folderName]) return;

    const folder = this.folders[folderName];
    folder.domElement.style.pointerEvents = "none";
    folder.domElement.style.opacity = "0.5";

    for (let i = 0; i < this.controllers[folderName].length; i++) {
      this.disableController(folderName, i);
    }
  }

  /**
   * Habilita um controlador específico
   */
  private enableController(folderName: string, index: number): void {
    if (!this.controllers[folderName] || !this.controllers[folderName][index])
      return;

    const controller = this.controllers[folderName][index];
    controller.domElement.style.pointerEvents = "";
    controller.domElement.style.opacity = "1";
  }

  /**
   * Desabilita um controlador específico
   */
  private disableController(folderName: string, index: number): void {
    if (!this.controllers[folderName] || !this.controllers[folderName][index])
      return;

    const controller = this.controllers[folderName][index];
    controller.domElement.style.pointerEvents = "none";
    controller.domElement.style.opacity = "0.5";
  }

  /**
   * Atualiza a exibição de todos os controladores
   */
  private updateAllControllers(): void {
    for (const folderName of Object.keys(this.controllers)) {
      for (const controller of this.controllers[folderName]) {
        controller.updateDisplay();
      }
    }
  }

  /**
   * Destroi o GUI e libera recursos
   */
  destroy(): void {
    this.gui.destroy();
  }
}
