import * as THREE from "three";
import { EditorCamera } from "./camera/EditorCamera";
import { KeyboardControls } from "./controls/KeyboardControls";
import { MouseControls } from "./controls/MouseControls";
import { TransformHandler } from "./controls/TransformHandler";
import { Toolbar } from "./ui/Toolbar";
import { PropertiesPanel } from "./ui/PropertiesPanel";
import { ObjectFactory } from "./factories/ObjectFactory";
import { MapData } from "./models/MapData";
import { ThreeUtils } from "./utils/ThreeUtils";
import { MapService } from "./services/MapService";
import { UndoService } from "./services/UndoService";
import { EditorMode, EditorModes } from "./modes/EditorModes";
import { SelectMode } from "./modes/SelectMode";
import { AddMode } from "./modes/AddMode";
import { DeleteMode } from "./modes/DeleteMode";
import { OBJECT_TYPES, ObjectType } from "./constants/ObjectTypes";

/**
 * Editor principal de mapas
 */
export class MapEditor {
  // THREE.js core objects
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;

  // Componentes do editor
  private camera: EditorCamera;
  private keyboardControls: KeyboardControls;
  private mouseControls: MouseControls;
  private transformHandler: TransformHandler;
  private toolbar: Toolbar;
  private propertiesPanel: PropertiesPanel;
  private mapService: MapService;
  private undoService: UndoService;

  // Modos do editor
  private modes: { [key: string]: any }; // Simplificado para evitar erro de tipagem
  private currentMode: EditorMode = EditorModes.SELECT;

  // Estado do editor
  private container: HTMLElement;
  private objects: THREE.Object3D[] = [];
  private selectedObject: THREE.Object3D | null = null;
  private currentObjectType: ObjectType = OBJECT_TYPES.WALL;
  private mapData: MapData;
  private objectFactory: ObjectFactory;

  constructor(container: HTMLElement) {
    this.container = container;

    // Inicializar THREE.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();

    // Inicializar câmera
    this.camera = new EditorCamera(
      this.container.clientWidth / this.container.clientHeight,
      this.renderer.domElement
    );

    // Inicializar controles
    this.keyboardControls = new KeyboardControls(this.camera);
    this.mouseControls = new MouseControls(
      this.renderer.domElement,
      this.camera,
      this.raycaster
    );
    this.transformHandler = new TransformHandler(this.scene, this.camera);

    // Inicializar factory e serviços
    this.objectFactory = new ObjectFactory();
    this.mapService = new MapService();
    this.undoService = new UndoService(this.scene, this.objects);

    // Inicializar modos do editor
    this.modes = {
      [EditorModes.SELECT]: new SelectMode(this),
      [EditorModes.ADD]: new AddMode(this),
      [EditorModes.DELETE]: new DeleteMode(this),
    };

    // Inicializar UI
    this.toolbar = new Toolbar(this);
    this.propertiesPanel = new PropertiesPanel(
      this,
      () => {},
      () => {}
    );

    // Inicializar mapa
    this.mapData = {
      name: "Novo Hospital",
      version: "1.0.0",
      objects: [],
    };

    // Configurar cena inicial
    this.setupScene();

    // Inicializar evento de redimensionamento
    window.addEventListener("resize", this.onResize.bind(this));

    // Iniciar loop de renderização
    this.animate();
  }

  /**
   * Configura a cena com objetos básicos
   */
  private setupScene(): void {
    // Adicionar iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Adicionar grid
    const grid = new THREE.GridHelper(100, 100, 0x888888, 0xcccccc);
    this.scene.add(grid);

    // Adicionar plano para raycasting
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -0.01;
    plane.name = "ground-plane";
    this.scene.add(plane);

    // Criar piso inicial
    this.createNewMap("Novo Hospital");
  }

  /**
   * Loop de renderização
   */
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    // Atualizar câmera e controles
    this.camera.update();
    this.keyboardControls.update();

    // Renderizar cena
    this.renderer.render(this.scene, this.camera.getCamera());
  }

  /**
   * Handler para redimensionamento da janela
   */
  private onResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.resize(width, height);
    this.renderer.setSize(width, height);
  }

  /**
   * Cria um novo mapa
   */
  public createNewMap(name: string): void {
    // Limpar mapa existente
    this.clearMap();

    // Configurar novo mapa
    this.mapData = {
      name: name,
      version: "1.0.0",
      objects: [],
      metadata: {
        author: "MedGame Editor",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    // Criar piso básico
    const floor = this.objectFactory.createObject(OBJECT_TYPES.FLOOR);
    if (floor) {
      floor.userData.id = ThreeUtils.generateUUID();
      floor.userData.type = OBJECT_TYPES.FLOOR;
      floor.userData.properties = {
        color: "#eeeeee",
        name: "Piso Principal",
      };

      floor.scale.set(20, 1, 20);

      this.scene.add(floor);
      this.objects.push(floor);
      this.addObjectToMapData(floor);
    }
  }

  /**
   * Dialogo para criar novo mapa
   */
  public createNewMapWithDialog(): void {
    const name = prompt("Nome do novo mapa:", "Novo Hospital");
    if (name) {
      this.createNewMap(name);
    }
  }

  /**
   * Limpa o mapa atual
   */
  private clearMap(): void {
    // Deselecionar objeto atual
    this.deselectObject();

    // Remover todos os objetos
    for (const object of this.objects) {
      this.scene.remove(object);
      ThreeUtils.disposeObject(object);
    }

    // Limpar arrays
    this.objects = [];
    this.mapData.objects = [];

    // Limpar undo
    this.undoService.clear();
  }

  /**
   * Adiciona dados do objeto ao mapData
   */
  public addObjectToMapData(object: THREE.Object3D): void {
    if (!object.userData.id || !object.userData.type) return;

    const mapObject = {
      id: object.userData.id,
      type: object.userData.type,
      position: {
        x: object.position.x,
        y: object.position.y,
        z: object.position.z,
      },
      rotation: {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z,
      },
      scale: {
        x: object.scale.x,
        y: object.scale.y,
        z: object.scale.z,
      },
      properties: object.userData.properties || {},
    };

    this.mapData.objects.push(mapObject);
  }

  /**
   * Remove dados do objeto do mapData
   */
  public removeObjectFromMapData(objectId: string): void {
    const index = this.mapData.objects.findIndex((o) => o.id === objectId);

    if (index !== -1) {
      this.mapData.objects.splice(index, 1);
    }
  }

  /**
   * Atualiza os dados de um objeto no mapData
   */
  public updateObjectInMapData(object: THREE.Object3D): void {
    const index = this.mapData.objects.findIndex(
      (o) => o.id === object.userData.id
    );

    if (index === -1) return;

    this.mapData.objects[index] = {
      id: object.userData.id,
      type: object.userData.type,
      position: {
        x: object.position.x,
        y: object.position.y,
        z: object.position.z,
      },
      rotation: {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z,
      },
      scale: {
        x: object.scale.x,
        y: object.scale.y,
        z: object.scale.z,
      },
      properties: object.userData.properties || {},
    };
  }

  /**
   * Define o modo atual do editor
   */
  public setEditorMode(mode: EditorMode): void {
    // Sair do modo atual
    this.modes[this.currentMode]?.exit?.();

    // Atualizar modo
    this.currentMode = mode;

    // Entrar no novo modo
    this.modes[mode]?.enter?.();

    // Atualizar UI
    this.toolbar.updateModeState(mode);
  }

  /**
   * Define o tipo de objeto atual
   */
  public setObjectType(type: ObjectType): void {
    this.currentObjectType = type;
    this.toolbar.updateObjectType(type);
  }

  /**
   * Seleciona um objeto
   */
  public selectObject(object: THREE.Object3D): void {
    if (this.selectedObject === object) return;

    this.deselectObject();
    this.selectedObject = object;

    // Destacar objeto
    ThreeUtils.highlightObject(object);

    // Conectar ao transform handler
    this.transformHandler.attachObject(object);

    // Atualizar UI
    this.propertiesPanel.updateFromObject(object);
  }

  /**
   * Deseleciona o objeto atual
   */
  public deselectObject(): void {
    if (!this.selectedObject) return;

    // Remover destaque
    ThreeUtils.unhighlightObject(this.selectedObject);

    // Desconectar do transform handler
    this.transformHandler.detachObject();

    this.selectedObject = null;

    // Atualizar UI
    this.propertiesPanel.updateFromObject(null);
  }

  /**
   * Remove o objeto selecionado
   */
  public removeSelectedObject(): void {
    if (!this.selectedObject) return;

    // Registrar para undo
    this.undoService.recordRemove(this.selectedObject);

    // Remover do mapData
    this.removeObjectFromMapData(this.selectedObject.userData.id);

    // Remover da cena
    this.scene.remove(this.selectedObject);

    // Remover da lista de objetos
    const index = this.objects.indexOf(this.selectedObject);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }

    // Deselecionar
    this.deselectObject();
  }

  /**
   * Duplica o objeto selecionado
   */
  public duplicateSelectedObject(): void {
    if (!this.selectedObject) return;

    // Criar clone profundo
    const clone = ThreeUtils.deepClone(this.selectedObject);

    // Novo ID
    clone.userData.id = ThreeUtils.generateUUID();

    // Deslocar um pouco
    clone.position.x += 1;

    // Adicionar à cena
    this.scene.add(clone);
    this.objects.push(clone);

    // Adicionar ao mapData
    this.addObjectToMapData(clone);

    // Registrar para undo
    this.undoService.recordAdd(clone);

    // Selecionar novo objeto
    this.selectObject(clone);
  }

  /**
   * Adiciona um objeto na posição especificada
   */
  public addObjectAt(position: THREE.Vector3): void {
    // Criar objeto do tipo atual
    const object = this.objectFactory.createObject(this.currentObjectType);

    if (!object) return;

    // Posicionar no grid
    const snappedPosition = ThreeUtils.snapToGrid(position);
    object.position.copy(snappedPosition);

    // Ajustar altura baseada no tipo
    switch (this.currentObjectType) {
      case OBJECT_TYPES.FLOOR:
        object.position.y = 0;
        break;
      case OBJECT_TYPES.WALL:
      case OBJECT_TYPES.DOOR:
      case OBJECT_TYPES.WINDOW:
        object.position.y = 1.5;
        break;
      default:
        object.position.y = 0;
        break;
    }

    // Configurar metadados
    object.userData.id = ThreeUtils.generateUUID();
    object.userData.type = this.currentObjectType;
    object.userData.properties = {};

    // Adicionar à cena
    this.scene.add(object);
    this.objects.push(object);

    // Adicionar ao mapData
    this.addObjectToMapData(object);

    // Registrar para undo
    this.undoService.recordAdd(object);

    // Selecionar novo objeto
    this.selectObject(object);
  }

  /**
   * Salva o mapa atual
   */
  public async saveMap(): Promise<void> {
    try {
      // Atualizar timestamp
      if (!this.mapData.metadata) {
        this.mapData.metadata = {};
      }
      this.mapData.metadata.updatedAt = new Date().toISOString();

      // Salvar usando o serviço
      const result = await this.mapService.saveMap(this.mapData);

      if (result.success) {
        alert(`Mapa "${this.mapData.name}" salvo com sucesso!`);
      } else {
        alert(`Erro ao salvar mapa: ${result.message}`);
      }
    } catch (error) {
      console.error("Erro ao salvar mapa:", error);
      alert("Erro ao salvar mapa. Verifique o console para mais detalhes.");
    }
  }

  /**
   * Carrega um mapa
   */
  public async loadMap(): Promise<void> {
    try {
      const maps = await this.mapService.listMaps();

      if (!maps.success || !maps.maps || maps.maps.length === 0) {
        alert("Nenhum mapa disponível para carregar.");
        return;
      }

      // Criar elemento para selecionar o mapa
      const mapOptions = maps.maps
        .map(
          (map) =>
            `<option value="${map.id}">${map.name} (${new Date(
              map.updatedAt
            ).toLocaleString()})</option>`
        )
        .join("");

      const mapId = prompt("Selecione o ID do mapa:", maps.maps[0].id);

      if (!mapId) return;

      const mapData = await this.mapService.loadMap(mapId);

      if (mapData.success && mapData.mapData) {
        this.loadMapData(mapData.mapData);
        alert(`Mapa "${mapData.mapData.name}" carregado com sucesso!`);
      } else {
        alert(`Erro ao carregar mapa: ${mapData.message}`);
      }
    } catch (error) {
      console.error("Erro ao carregar mapa:", error);
      alert("Erro ao carregar mapa. Verifique o console para mais detalhes.");
    }
  }

  /**
   * Carrega dados de um mapa
   */
  public loadMapData(data: MapData): boolean {
    try {
      // Limpar mapa atual
      this.clearMap();

      // Atualizar dados
      this.mapData = data;

      // Criar objetos 3D
      for (const objData of data.objects) {
        this.createObjectFromData(objData);
      }

      return true;
    } catch (error) {
      console.error("Erro ao processar dados do mapa:", error);
      return false;
    }
  }

  /**
   * Cria um objeto 3D a partir dos dados do mapa
   */
  private createObjectFromData(data: any): void {
    // Validar dados
    if (!data.id || !data.type) return;

    // Criar objeto
    const object = this.objectFactory.createObject(data.type, data.properties);

    if (!object) return;

    // Configurar transformações
    object.position.set(data.position.x, data.position.y, data.position.z);

    object.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);

    object.scale.set(data.scale.x, data.scale.y, data.scale.z);

    // Configurar metadata
    object.userData.id = data.id;
    object.userData.type = data.type;
    object.userData.properties = data.properties || {};

    // Adicionar à cena
    this.scene.add(object);
    this.objects.push(object);
  }

  /**
   * Desfaz a última ação
   */
  public undo(): void {
    this.undoService.undo();
    this.deselectObject();
  }

  /**
   * Refaz a última ação desfeita
   */
  public redo(): void {
    this.undoService.redo();
    this.deselectObject();
  }

  /**
   * Retorna informações sobre o mapa atual
   */
  public getMapInfo(): MapData {
    return this.mapData;
  }

  /**
   * Retorna o objeto selecionado
   */
  public getSelectedObject(): THREE.Object3D | null {
    return this.selectedObject;
  }

  /**
   * Retorna a lista de objetos
   */
  public getObjects(): THREE.Object3D[] {
    return this.objects;
  }

  /**
   * Retorna a cena
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Retorna o tipo de objeto atual
   */
  public getCurrentObjectType(): ObjectType {
    return this.currentObjectType;
  }

  /**
   * Retorna o modo atual do editor
   */
  public getCurrentMode(): EditorMode {
    return this.currentMode;
  }

  /**
   * Retorna o handler de transformação
   */
  public getTransformHandler(): TransformHandler {
    return this.transformHandler;
  }

  /**
   * Retorna os tipos de objetos disponíveis
   */
  public getObjectTypes(): typeof OBJECT_TYPES {
    return OBJECT_TYPES;
  }
}
