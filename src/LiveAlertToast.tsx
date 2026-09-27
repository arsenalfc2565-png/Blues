import React, { useState, useEffect } from 'react';
import { BellRing, X, ExternalLink, Package, ArrowRight } from 'lucide-react';
import { InventoryAlert } from '../utils/pushNotificationService';
import { Z_INDEX } from '../constants/zIndex';

interface LiveAlertToastProps {
  onOpenAlertsModal: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const LiveAlertToast: React.FC<LiveAlertToastProps> = ({
  onOpenAlertsModal,
  onSelectProduct,
}) => {
  const [currentAlert, setCurrentAlert] = useState<InventoryAlert | null>(null);

  useEffect(() => {
    const handleBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent<InventoryAlert>;
      if (customEvent.detail) {
        setCurrentAlert(customEvent.detail);
      }
    };

    window.addEventListener('blues_inventory_alert_broadcast', handleBroadcast);
    return () => {
      window.removeEventListener('blues_inventory_alert_broadcast', handleBroadcast);
    };
  }, []);

  useEffect(() => {
    if (!currentAlert) return;
    const timer = setTimeout(() => {
      setCurrentAlert(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [currentAlert]);

  if (!currentAlert) return null;

  return (
    <div className={`fixed top-20 right-4 sm:right-6 ${Z_INDEX.LIVE_TOAST} max-w-sm w-full bg-neutral-950 text-white rounded-3xl p-4 shadow-2xl border border-neutral-800 animate-in slide-in-from-top-4 duration-300`}>
      <div className="flex items-start gap-3">
        {currentAlert.imageUrl ? (
          <img
            src={currentAlert.imageUrl}
            alt={currentAlert.title}
            className="w-11 h-11 rounded-2xl object-cover border border-neutral-700 shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                currentAlert.type === 'restock'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {currentAlert.type === 'restock' ? 'Restocked' : 'New Container Arrival'}
            </span>
            <button
              type="button"
              onClick={() => setCurrentAlert(null)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-bold text-white line-clamp-1">{currentAlert.title}</p>
          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-snug">
            {currentAlert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-800 text-xs">
        <button
          type="button"
          onClick={() => {
            setCurrentAlert(null);
            onOpenAlertsModal();
          }}
          className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[11px] transition-colors cursor-pointer text-center"
        >
          View Alert Log
        </button>

        {currentAlert.productId && onSelectProduct && (
          <button
            type="button"
            onClick={() => {
              const pid = currentAlert.productId!;
              setCurrentAlert(null);
              onSelectProduct(pid);
            }}
            className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
          >
            <span>View Shoe</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
