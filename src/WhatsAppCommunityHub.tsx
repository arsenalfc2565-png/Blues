import React, { useState } from 'react';
import { MessageSquare, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { StoreSettings } from '../types';
import { Z_INDEX } from '../constants/zIndex';

interface WhatsAppCommunityHubProps {
  storeSettings: StoreSettings;
}

export const WhatsAppCommunityHub: React.FC<WhatsAppCommunityHubProps> = ({ storeSettings }) => {
  const [isWidgetDismissed, setIsWidgetDismissed] = useState(false);

  return (
    <>
      {/* Dedicated Section / Hub */}
      <section className="py-12 bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>340+ Kenyan Footwear Resellers Onboard</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-normal text-white">
                Join Our VIP Wholesale WhatsApp Group for Daily Arrivals.
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                Be the first to see fresh container shipments unboxed at our Kisumu warehouse. Get live video clips of shoe finishes, master carton price drops, and rapid dispatch booking before stock sells out.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Daily 7:30 AM New Stock Broadcast</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Master Carton Flash Discounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Bus Waybill Confirmations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Size-Pairing Balance Support</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-3">
              <a
                href={storeSettings.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <MessageSquare className="w-5 h-5 text-neutral-950" />
                <span>Join Official VIP WhatsApp Group</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-[11px] text-neutral-400">
                Free to join · For retail boutique owners & shoe vendors
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom-Right WhatsApp Quick Widget */}
      {!isWidgetDismissed && (
        <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 ${Z_INDEX.FLOATING_WIDGET} flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 no-print`}>
          <a
            href={storeSettings.whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/50 hover:shadow-emerald-500/70 transition-all hover:scale-105 active:scale-95 border border-emerald-400/40"
            title="Join VIP Wholesale WhatsApp Group"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold block leading-tight">Join VIP WhatsApp</span>
              <span className="text-[10px] text-emerald-100 block">Daily Kisumu Arrivals</span>
            </div>
          </a>
          <button
            onClick={() => setIsWidgetDismissed(true)}
            aria-label="Dismiss WhatsApp floating button"
            className="w-7 h-7 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center text-xs shadow-md border border-neutral-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
