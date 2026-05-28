// ─── Orders ────────────────────────────────────────────────────────────────
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  notes: string;
  createdAt: string; // ISO string
}

// ─── Menu ──────────────────────────────────────────────────────────────────
export type BrewType = 'Classic' | 'Rich' | 'Over Ice' | 'Specialty';
export type MenuCategory = 'hot' | 'cold';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  emoji: string;
  brewType: BrewType;
  brewSize: string;
  prepSteps: string[];
  tags: string[];
}

// ─── Cart ──────────────────────────────────────────────────────────────────
export interface CartItem {
  item: MenuItem;
  quantity: number;
}

// ─── AI Suggestion ──────────────────────────────────────────────────────────
export interface AISuggestion {
  roast: string;
  grind: string;
  temperature: string;
  notes: string;
}
