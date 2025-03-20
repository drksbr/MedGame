// Tipos de objetos disponíveis no editor
export const OBJECT_TYPES = {
  WALL: "wall",
  FLOOR: "floor",
  DOOR: "door",
  WINDOW: "window",
  NPC_DOCTOR: "npc_doctor",
  NPC_NURSE: "npc_nurse",
  NPC_PATIENT: "npc_patient",
  FURNITURE_BED: "furniture_bed",
  FURNITURE_DESK: "furniture_desk",
  FURNITURE_CHAIR: "furniture_chair",
  QUEST_TRIGGER: "quest_trigger",
} as const;

// Tipo TypeScript para os valores de OBJECT_TYPES
export type ObjectType = (typeof OBJECT_TYPES)[keyof typeof OBJECT_TYPES];

// Mapeamento de tipos para nomes amigáveis
export const OBJECT_TYPE_NAMES: Record<ObjectType, string> = {
  [OBJECT_TYPES.WALL]: "Parede",
  [OBJECT_TYPES.FLOOR]: "Piso",
  [OBJECT_TYPES.DOOR]: "Porta",
  [OBJECT_TYPES.WINDOW]: "Janela",
  [OBJECT_TYPES.NPC_DOCTOR]: "Médico (NPC)",
  [OBJECT_TYPES.NPC_NURSE]: "Enfermeiro (NPC)",
  [OBJECT_TYPES.NPC_PATIENT]: "Paciente (NPC)",
  [OBJECT_TYPES.FURNITURE_BED]: "Cama",
  [OBJECT_TYPES.FURNITURE_DESK]: "Mesa",
  [OBJECT_TYPES.FURNITURE_CHAIR]: "Cadeira",
  [OBJECT_TYPES.QUEST_TRIGGER]: "Gatilho de Quest",
};
