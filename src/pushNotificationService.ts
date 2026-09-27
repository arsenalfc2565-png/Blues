// Simple Browser-Based Push & In-App Inventory Notification System for Resellers

export interface InventoryAlert {
  id: string;
  type: 'restock' | 'new_inventory' | 'system';
  title: string;
  message: string;
  timestamp: string;
  productId?: string;
  productTitle?: string;
  variantSize?: string | number;
  variantColor?: string;
  addedQuantity?: number;
  imageUrl?: string;
  read: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  restockAlerts: boolean;
  newInventoryAlerts: boolean;
  soundEnabled: boolean;
}

const SETTINGS_KEY = 'blues_notification_settings';
const ALERTS_HISTORY_KEY = 'blues_notification_history';

// Default initial alerts so users see realistic recent warehouse activity
const INITIAL_DEMO_ALERTS: InventoryAlert[] = [
  {
    id: 'alert-init-1',
    type: 'restock',
    title: '🔥 Low Stock Restocked!',
    message: 'Monaco Chunky Block Heels (Size 39, Classic Black) restocked +48 pairs at Kisumu Depot.',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    productId: 'prod-ladies-01',
    productTitle: 'Monaco Chunky Block Heels',
    variantSize: 39,
    variantColor: 'Classic Black',
    addedQuantity: 48,
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80',
    read: false,
  },
  {
    id: 'alert-init-2',
    type: 'new_inventory',
    title: '✨ New Container Landed!',
    message: 'Italian Slip-on Moccasins have arrived at Swan Centre. Available in 24-pair master cartons.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hrs ago
    productId: 'prod-mens-01',
    productTitle: 'Italian Slip-on Moccasins',
    addedQuantity: 120,
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80',
    read: false,
  },
];

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse notification settings', e);
  }
  return {
    enabled: true,
    restockAlerts: true,
    newInventoryAlerts: true,
    soundEnabled: true,
  };
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('blues_notification_settings_changed', { detail: settings }));
  } catch (e) {
    console.warn('Failed to save notification settings', e);
  }
};

export const getAlertsHistory = (): InventoryAlert[] => {
  try {
    const raw = localStorage.getItem(ALERTS_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse alerts history', e);
  }
  return INITIAL_DEMO_ALERTS;
};

export const saveAlertsHistory = (alerts: InventoryAlert[]): void => {
  try {
    localStorage.setItem(ALERTS_HISTORY_KEY, JSON.stringify(alerts.slice(0, 50))); // Keep last 50
    window.dispatchEvent(new CustomEvent('blues_alerts_history_changed', { detail: alerts }));
  } catch (e) {
    console.warn('Failed to save alerts history', e);
  }
};

export const markAllAlertsAsRead = (): void => {
  const alerts = getAlertsHistory();
  const updated = alerts.map((a) => ({ ...a, read: true }));
  saveAlertsHistory(updated);
};

export const clearAllAlerts = (): void => {
  saveAlertsHistory([]);
};

// Web Audio API subtle chime sound synthesizer (zero external audio files needed)
export const playNotificationChime = (): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.0, now + 0.1); // A5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch (e) {
    // Audio context may be restricted by autoplay policy before user gesture
  }
};

export const checkBrowserNotificationSupport = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getBrowserPermissionState = (): NotificationPermission | 'unsupported' => {
  if (!checkBrowserNotificationSupport()) return 'unsupported';
  return Notification.permission;
};

export const requestBrowserPermission = async (): Promise<boolean> => {
  if (!checkBrowserNotificationSupport()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permission', e);
    return false;
  }
};

// Main trigger function: Sends native push notification + records in-app history + plays chime
export const sendInventoryAlert = (
  type: 'restock' | 'new_inventory',
  title: string,
  message: string,
  meta?: {
    productId?: string;
    productTitle?: string;
    variantSize?: string | number;
    variantColor?: string;
    addedQuantity?: number;
    imageUrl?: string;
  }
): InventoryAlert => {
  const settings = getNotificationSettings();

  // Check user filter preferences
  if (!settings.enabled) {
    return {
      id: `alert-skip-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: true,
    };
  }

  if (type === 'restock' && !settings.restockAlerts) {
    return {
      id: `alert-skip-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: true,
    };
  }

  if (type === 'new_inventory' && !settings.newInventoryAlerts) {
    return {
      id: `alert-skip-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: true,
    };
  }

  const newAlert: InventoryAlert = {
    id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    productId: meta?.productId,
    productTitle: meta?.productTitle,
    variantSize: meta?.variantSize,
    variantColor: meta?.variantColor,
    addedQuantity: meta?.addedQuantity,
    imageUrl: meta?.imageUrl,
    read: false,
  };

  // 1. Save to in-app history
  const currentHistory = getAlertsHistory();
  saveAlertsHistory([newAlert, ...currentHistory]);

  // 2. Play subtle chime if enabled
  if (settings.soundEnabled) {
    playNotificationChime();
  }

  // 3. Trigger native browser Web Notification if permitted
  if (checkBrowserNotificationSupport() && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: message,
        icon: meta?.imageUrl || '/favicon.ico',
        tag: `blues-${type}-${meta?.productId || Date.now()}`,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('Native notification failed, recorded in-app instead:', e);
    }
  }

  // 4. Dispatch custom event for real-time in-app toast / banner
  window.dispatchEvent(
    new CustomEvent('blues_inventory_alert_broadcast', {
      detail: newAlert,
    })
  );

  return newAlert;
};

// Convenience helpers
export const triggerRestockAlert = (
  productTitle: string,
  size: number | string,
  color: string,
  addedQty: number,
  imageUrl?: string,
  productId?: string
) => {
  const title = `👟 Restocked: ${productTitle}`;
  const message = `Good news! Size ${size} (${color}) restocked with +${addedQty} pairs at Swan Centre Kisumu Depot. Grab wholesale cartons before stock clears!`;
  return sendInventoryAlert('restock', title, message, {
    productId,
    productTitle,
    variantSize: size,
    variantColor: color,
    addedQuantity: addedQty,
    imageUrl,
  });
};

export const triggerNewInventoryAlert = (
  productTitle: string,
  category: string,
  wholesalePrice: number,
  addedQty: number = 24,
  imageUrl?: string,
  productId?: string
) => {
  const title = `✨ New Shoe Arrival: ${productTitle}`;
  const message = `Fresh container arrival! ${category.toUpperCase()} category - Wholesale @ KSh ${wholesalePrice.toLocaleString()}/pr. Available for immediate daily bus dispatch.`;
  return sendInventoryAlert('new_inventory', title, message, {
    productId,
    productTitle,
    addedQuantity: addedQty,
    imageUrl,
  });
};
