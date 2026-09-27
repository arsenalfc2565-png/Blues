import { OfflineDraftOrder, CartItem, CourierPartner } from '../types';

const OFFLINE_DRAFTS_KEY = 'blues_offline_draft_orders';

export function isDeviceOnline(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
}

export function saveOfflineDraft(draft: {
  items: CartItem[];
  customerPhone: string;
  customerName: string;
  deliveryTown: string;
  courier: CourierPartner;
  isLipaPolePole: boolean;
  totalAmount: number;
}): OfflineDraftOrder {
  const newDraft: OfflineDraftOrder = {
    id: `draft-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: Date.now(),
    ...draft,
  };

  try {
    const existing = getOfflineDrafts();
    const updated = [newDraft, ...existing];
    localStorage.setItem(OFFLINE_DRAFTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save offline order draft:', err);
  }

  return newDraft;
}

export function getOfflineDrafts(): OfflineDraftOrder[] {
  try {
    const raw = localStorage.getItem(OFFLINE_DRAFTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load offline drafts:', err);
  }
  return [];
}

export function removeOfflineDraft(draftId: string): void {
  try {
    const drafts = getOfflineDrafts().filter((d) => d.id !== draftId);
    localStorage.setItem(OFFLINE_DRAFTS_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.warn('Failed to remove offline draft:', err);
  }
}

export function clearAllOfflineDrafts(): void {
  try {
    localStorage.removeItem(OFFLINE_DRAFTS_KEY);
  } catch (err) {
    console.warn('Failed to clear offline drafts:', err);
  }
}
