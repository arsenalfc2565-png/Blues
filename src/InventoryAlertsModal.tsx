import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  Check,
  Trash2,
  Clock,
  Package,
  Layers,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import {
  InventoryAlert,
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  getAlertsHistory,
  markAllAlertsAsRead,
  clearAllAlerts,
  getBrowserPermissionState,
  requestBrowserPermission,
  triggerRestockAlert,
  triggerNewInventoryAlert,
} from '../utils/pushNotificationService';
import { Z_INDEX } from '../constants/zIndex';

interface InventoryAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const InventoryAlertsModal: React.FC<InventoryAlertsModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [alerts, setAlerts] = useState<InventoryAlert[]>(getAlertsHistory());
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setPermissionState(getBrowserPermissionState());
    setAlerts(getAlertsHistory());
    setSettings(getNotificationSettings());

    const handleHistoryChanged = (e: Event) => {
      const customEvent = e as CustomEvent<InventoryAlert[]>;
      if (customEvent.detail) {
        setAlerts(customEvent.detail);
      } else {
        setAlerts(getAlertsHistory());
      }
    };

    const handleBroadcast = () => {
      setAlerts(getAlertsHistory());
    };

    window.addEventListener('blues_alerts_history_changed', handleHistoryChanged);
    window.addEventListener('blues_inventory_alert_broadcast', handleBroadcast);

    return () => {
      window.removeEventListener('blues_alerts_history_changed', handleHistoryChanged);
      window.removeEventListener('blues_inventory_alert_broadcast', handleBroadcast);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestBrowserPermission();
    setPermissionState(getBrowserPermissionState());
    if (granted) {
      setSettings((prev) => {
        const next = { ...prev, enabled: true };
        saveNotificationSettings(next);
        return next;
      });
      triggerRestockAlert('Monaco Chunky Block Heels', 40, 'Classic Black', 36);
    }
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveNotificationSettings(next);
      return next;
    });
  };

  const handleSendTestRestock = () => {
    const newAlert = triggerRestockAlert(
      'Milan Executive Loafer',
      42,
      'Cognac Tan',
      48,
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=400&q=80',
      'prod-mens-02'
    );
    setTestSentMessage('Restock alert simulated & push triggered!');
    setTimeout(() => setTestSentMessage(null), 3500);
  };

  const handleSendTestNewArrival = () => {
    const newAlert = triggerNewInventoryAlert(
      'Serengeti Heavy-Duty Safari Boot',
      'boots',
      2400,
      72,
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=400&q=80',
      'prod-boots-01'
    );
    setTestSentMessage('New container arrival alert broadcasted!');
    setTimeout(() => setTestSentMessage(null), 3500);
  };

  const handleMarkAllRead = () => {
    markAllAlertsAsRead();
    setAlerts(getAlertsHistory());
  };

  const handleClear = () => {
    clearAllAlerts();
    setAlerts([]);
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 ${Z_INDEX.MODAL} overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-2xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 text-white border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  Reseller Live Alerts
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <h3 className="font-display font-black text-lg text-white">
                Restock & New Inventory Notifications
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-neutral-50 text-xs">
          {/* Push Permission & Status Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-neutral-900 text-sm">
                    Browser Push Notifications
                  </h4>
                  {permissionState === 'granted' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Active</span>
                    </span>
                  ) : permissionState === 'denied' ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                      Blocked in Browser
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold text-[10px]">
                      Not Enabled Yet
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Receive instant alerts on your desktop or mobile screen the minute low-stock shoe sizes are replenished or new containers reach Kisumu Depot.
                </p>
              </div>

              {permissionState !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enable Push Alerts</span>
                </button>
              )}
            </div>

            {permissionState === 'denied' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Browser notifications are blocked. Click the lock/tune icon near your browser address bar to allow notifications, or rely on live in-app alerts below.
                </span>
              </div>
            )}
          </div>

          {/* Preferences & Filter Toggles */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-neutral-500">
              Notification Preferences
            </h4>

            <div className="divide-y divide-neutral-100">
              {/* Toggle 1: Restock Alerts */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-neutral-900 block font-semibold">
                    Low-Stock Restock Alerts
                  </strong>
                  <span className="text-[11px] text-neutral-500">
                    Alert when sizes (e.g. Size 37, 40, 42) are restocked from factory
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('restockAlerts')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.restockAlerts ? 'bg-blue-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.restockAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: New Inventory Container Arrivals */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-neutral-900 block font-semibold">
                    New Container Footwear Arrivals
                  </strong>
                  <span className="text-[11px] text-neutral-500">
                    Alert when new shoe styles or seasonal models enter the wholesale catalog
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('newInventoryAlerts')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.newInventoryAlerts ? 'bg-blue-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.newInventoryAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Sound Chimes */}
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-neutral-400" />
                  )}
                  <div>
                    <strong className="text-neutral-900 block font-semibold">
                      Notification Chime Sound
                    </strong>
                    <span className="text-[11px] text-neutral-500">
                      Plays a subtle chime when an alert is received
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('soundEnabled')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.soundEnabled ? 'bg-blue-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Test & Simulation Buttons */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulate Restock & New Container Inbound:</span>
              </span>
              {testSentMessage && (
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full animate-in fade-in">
                  {testSentMessage}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSendTestRestock}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-blue-900 border border-blue-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Send Test Restock Alert (+48 prs)</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestNewArrival}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                <span>Send Test New Model Alert</span>
              </button>
            </div>
          </div>

          {/* Alert Feed Header & Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-neutral-900 text-sm">
                Recent Warehouse Alerts ({alerts.length})
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-blue-700 hover:text-blue-900 font-bold text-[11px] cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
              {alerts.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-neutral-400 hover:text-red-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Alerts Feed List */}
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 space-y-2">
                <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="font-bold text-neutral-700 text-xs">No alerts yet</p>
                <p className="text-[11px] text-neutral-400">
                  When stock arrives or new containers are added at Swan Centre, alerts will appear here!
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    alert.read
                      ? 'bg-white border-neutral-200 text-neutral-700'
                      : 'bg-blue-50/60 border-blue-200/90 text-neutral-900 shadow-xs'
                  }`}
                >
                  {alert.imageUrl ? (
                    <img
                      src={alert.imageUrl}
                      alt={alert.title}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            alert.type === 'restock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {alert.type === 'restock' ? 'Restocked' : 'New Arrival'}
                        </span>
                        <strong className="font-bold text-xs">{alert.title}</strong>
                      </div>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(alert.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                    </div>

                    <p className="text-neutral-600 text-[11px] leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.productId && onSelectProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProduct(alert.productId!);
                          onClose();
                        }}
                        className="text-blue-700 hover:text-blue-900 font-bold text-[11px] flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>View Shoe in Catalog</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>Swan Centre Kisumu Depot Logistics Dispatch Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
