export interface Color {
  hex: string;
  rgb: string;
  p3: string;
  isLocked: boolean;
  wcagWhite: number;
  wcagBlack: number;
  wcagWhiteCompliant: boolean;
  wcagBlackCompliant: boolean;
  isCompliant: boolean;
}

export type ColorBlindnessMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export enum AppView {
  Palette = 'palette',
  Image = 'image',
  Trending = 'trending',
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  data: string; // base64
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}