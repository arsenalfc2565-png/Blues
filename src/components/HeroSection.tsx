import React from 'react';
import { ArrowRight, Box, MessageSquare, MapPin, CheckCircle2, Calculator } from 'lucide-react';
import { ThreeShoeViewer } from './ThreeShoeViewer';
import { StoreSettings } from '../types';

interface HeroSectionProps {
  onBrowseCatalog: () => void;
  onOpenKisumuStore: () => void;
  storeSettings: StoreSettings;
  onOpenBulkMatrixDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBrowseCatalog,
  onOpenKisumuStore,
  storeSettings,
  onOpenBulkMatrixDemo,
}) => {
  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white pt-8 pb-16 lg:py-16 border-b border-neutral-800">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Kisumu Bus Park #1 Footwear Wholesale Hub · 95% Reseller Direct</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-normal leading-[1.12] text-white">
              Premium Footwear Wholesale for Kenya's Top Resellers.
            </h1>

            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl">
              Supplying retail shoe boutiques and market vendors across Western Kenya, Nairobi, and the Rift Valley. Guaranteed size-pairing inventory balance, single wholesale pricing for 2+ pairs, Lipa Pole Pole layaway, and same-day 4:00 PM bus parcel dispatch.
            </p>

            {/* Quick Proof Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 pb-2 border-y border-neutral-800/80 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Single Wholesale Price (2+ prs)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lipa Pole Pole 30% Deposit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Guardian & EasyCoach Waybills</span>
              </div>
            </div>

            {/* Primary Action Group */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBrowseCatalog}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:translate-y-[-1px] active:translate-y-[0]"
              >
                <Box className="w-4 h-4" />
                <span>Browse Wholesale Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenBulkMatrixDemo}
                className="px-5 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/40 font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Carton Matrix & Profit Simulator</span>
              </button>

              <a
                href={storeSettings.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:translate-y-[-1px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Join VIP WhatsApp</span>
              </a>

              <button
                onClick={onOpenKisumuStore}
                className="px-4 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 font-medium text-sm flex items-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span>Visit Bus Park Shop</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Shoe Viewer Visual Showcase */}
          <div className="lg:col-span-6">
            <ThreeShoeViewer
              productTitle="Blues Velocity Aerodynamic Runner"
              fallbackImageUrl="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
