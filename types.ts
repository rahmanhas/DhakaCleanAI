export enum WasteCategory {
  ORGANIC = 'Organic',
  RECYCLABLE_PLASTIC = 'Recyclable (Plastic)',
  RECYCLABLE_PAPER = 'Recyclable (Paper)',
  RECYCLABLE_GLASS = 'Recyclable (Glass)',
  RECYCLABLE_METAL = 'Recyclable (Metal)',
  HAZARDOUS = 'Hazardous',
  E_WASTE = 'E-Waste',
  GENERAL = 'General Waste',
  UNKNOWN = 'Unknown'
}

export interface WasteAnalysisResult {
  category: WasteCategory;
  confidence: number;
  description: string;
  disposalAdvice: string;
  recyclingPotential: string;
  estimatedDecompositionTime: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  SCANNER = 'scanner',
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  MAP = 'map'
}

export interface DailyStat {
  day: string;
  organic: number;
  recyclable: number;
  hazardous: number;
}

export interface ZoneStat {
  name: string;
  efficiency: number; // 0-100
  wasteVolume: number; // in tons
}