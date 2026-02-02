// Sale record representing a vehicle sale
export interface Sale {
  id: string;          // UUID
  date: string;        // ISO date string (YYYY-MM-DD)
  time: string;        // HH:mm format
  plate: string;       // License plate or empty string
  timestamp: number;   // Unix timestamp in milliseconds
}

// License plate for categorization
export interface Plate {
  id: string;          // UUID
  license: string;     // Plate text (max 8 chars, alphanumeric)
}

// App settings
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  notifyOneSlot: boolean;
  notifyTwoSlots: boolean;
}

// Theme type
export type Theme = Settings['theme'];

// Limit status for visual indicators
export type LimitStatus = 'safe' | 'warning' | 'danger';

// Weekly sales data for chart
export interface DailySales {
  day: string;         // Day abbreviation (Mon, Tue, etc.)
  fullDay: string;     // Full day name
  date: string;        // ISO date string
  count: number;       // Number of sales
}
