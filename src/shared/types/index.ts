export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Player {
  id: string;
  username: string;
  position: Position;
  rotation: Rotation;
  experience: number;
  questsCompleted: string[];
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  specialty: string;
  type: 'multiple_choice' | 'short_answer' | 'procedure';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface NPC {
  id: string;
  type: string;
  position: Position;
  rotation: Rotation;
  questsAvailable: string[];
}
