import { DrawingMessage } from './drawing-message';

export interface WordImagePair {
  hashSocketId: string,
  word: string,
  canvasSize: number,
  paths: DrawingMessage[],
  hints: string[],
  difficulty: Difficulty
}

export interface WordImagePairInfo {
  word: string,
  canvasSize: number,
  hints: string[],
  difficulty: Difficulty
}

export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard"
}
