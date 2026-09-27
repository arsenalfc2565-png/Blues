/**
 * Global Z-Index Layer Management System
 * 
 * Strict stacking order hierarchy to ensure predictable, 
 * collision-free layering across all desktop, tablet, and mobile views.
 * 
 * Stacking Order:
 * - BASE (z-0): In-flow document layout and content
 * - ELEVATED (z-10): Hovered elements, interactive cards, badge elevations
 * - STICKY_SUBNAV (z-20): Sticky in-page filter headers and table headers
 * - FLOATING_WIDGET (z-40): Floating ambient widgets (e.g. WhatsApp quick link)
 * - NAVBAR (z-[100]): Sticky Top Header Navigation & Mobile Sticky Bottom Nav Bar
 * - NAVBAR_DROPDOWN (z-[110]): User profile menu dropdowns & mobile drawer menus
 * - CART_DRAWER (z-[200]): Slide-over Cart & Checkout Drawer
 * - MODAL (z-[300]): Application modals & dialogs (Auth, Wallet, Matrix, PDFs)
 * - LIVE_TOAST (z-[400]): Real-time in-app restock & container arrival live toast alerts
 */

export const Z_INDEX = {
  BASE: 'z-0',
  ELEVATED: 'z-10',
  STICKY_SUBNAV: 'z-20',
  FLOATING_WIDGET: 'z-40',
  NAVBAR: 'z-[100]',
  NAVBAR_DROPDOWN: 'z-[110]',
  CART_DRAWER: 'z-[200]',
  MODAL: 'z-[300]',
  LIVE_TOAST: 'z-[400]',
} as const;

export type ZIndexLayer = keyof typeof Z_INDEX;
