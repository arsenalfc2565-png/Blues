import React from 'react';
import {
  Package,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Flame,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { StarterPack } from '../types';

interface StarterPacksSectionProps {
  starterPacks: StarterPack[];
  onOpenStarterPacksModal: () => void;
  onAddStarterPackToCart: (pack: StarterPack) => void;
}

export const StarterPacksSection: React.FC<StarterPacksSectionProps> = ({
  starterPacks,
  onOpenStarterPacksModal,
  onAddStarterPackToCart,
}) => {
  return (
    <section className="max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 font-mono text-xs font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>B2B Fast-Start Program</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Balanced Size Matrices</span>
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-neutral-950 mt-2">
            Pre-Packed Assorted Starter Reseller Bundles
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
            Pre-assembled master cartons calibrated to Kenyan footwear demand. Eliminates dead-stock orphan sizes and includes an extra 5%–8% wholesale bundle discount.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenStarterPacksModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <span>View All 5 Starter Packs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Top 3 Feature Bundles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {starterPacks.slice(0, 3).map((pack) => (
          <div
            key={pack.id}
            className="group bg-white rounded-3xl border border-neutral-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Image Banner Montage */}
              <div className="relative h-44 bg-neutral-100 overflow-hidden flex items-center justify-center p-2 gap-2">
                {pack.includedItems.slice(0, 2).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.imageUrl}
                    alt={item.productTitle}
                    className="w-1/2 h-full object-cover rounded-2xl shadow-xs transition-transform duration-500 group-hover:scale-105"
                  />
                ))}
                {/* Badge Overlay */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-neutral-950/90 backdrop-blur-md text-amber-400 font-mono text-[10px] font-bold shadow-md">
                  {pack.badge}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-mono text-[10px] font-bold shadow-md">
                  Save {pack.bundleDiscountPct}%
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <h3 className="font-display font-extrabold text-base text-neutral-950 line-clamp-1 group-hover:text-blue-700 transition-colors">
                  {pack.title}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                  {pack.description}
                </p>

                {/* Carton Specs */}
                <div className="flex items-center justify-between text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <span className="flex items-center gap-1 font-bold text-neutral-900">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>{pack.totalPairs} Pairs ({pack.totalCartons} Carton)</span>
                  </span>
                  <span className="flex items-center gap-1 text-purple-700 font-semibold text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{pack.expectedTurnoverDays}</span>
                  </span>
                </div>

                {/* Profit Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-neutral-400 block line-through">
                      KSh {pack.originalWholesalePrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-black font-mono text-neutral-950">
                      KSh {pack.bundleWholesalePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">Est. Net Profit</span>
                    <span className="text-sm font-black font-mono text-emerald-700">
                      +KSh {pack.estimatedNetProfit.toLocaleString()} ({pack.marginPct}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => onAddStarterPackToCart(pack)}
                className="w-full py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-700/20 active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {pack.totalPairs}-Pair Pack to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
