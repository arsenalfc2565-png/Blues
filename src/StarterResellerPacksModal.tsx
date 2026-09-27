import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Package,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Flame,
  Truck,
  DollarSign,
  ChevronRight,
  Info,
  Clock,
  Layers,
  MapPin,
  Check
} from 'lucide-react';
import { StarterPack, CartItem, Product } from '../types';
import { Z_INDEX } from '../constants/zIndex';
import confetti from 'canvas-confetti';

interface StarterResellerPacksModalProps {
  isOpen: boolean;
  onClose: () => void;
  starterPacks: StarterPack[];
  products: Product[];
  onAddStarterPackToCart: (pack: StarterPack) => void;
}

export const StarterResellerPacksModal: React.FC<StarterResellerPacksModalProps> = ({
  isOpen,
  onClose,
  starterPacks,
  products,
  onAddStarterPackToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPackId, setSelectedPackId] = useState<string>(starterPacks[0]?.id || '');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPacks = starterPacks.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const activePack = starterPacks.find((p) => p.id === selectedPackId) || filteredPacks[0] || starterPacks[0];

  const handleAddToCart = (pack: StarterPack) => {
    onAddStarterPackToCart(pack);
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setAddedNotice(`Added "${pack.title}" (${pack.totalPairs} Pairs) to your Cart!`);
    setTimeout(() => {
      setAddedNotice(null);
    }, 3000);
  };

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 ${Z_INDEX.MODAL} overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-5xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-950 text-white border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Curated Master Cartons
                </span>
                <span className="text-xs text-neutral-400">Zero Orphan Size Guarantee</span>
              </div>
              <h3 className="font-display font-black text-base sm:text-lg text-white">
                Pre-Packed Assorted Carton Bundles (Starter Reseller Packs)
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

        {/* Category Filters Toolbar */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              All Bundles ({starterPacks.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('ladies')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'ladies'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              Ladies' Paired Cartons
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('sneakers')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'sneakers'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              Athletic Sneakers
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('mens')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'mens'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              Men's Leather Dress
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('sandals')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'sandals'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              Slides & Sandals
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Extra 5%–8% Bundle Discount Applied</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-neutral-50">
          {addedNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 animate-in zoom-in-95">
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{addedNotice}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded-xl bg-emerald-700 text-white font-bold text-xs"
              >
                Proceed to Checkout →
              </button>
            </div>
          )}

          {/* Grid of Starter Packs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Bundle Cards List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredPacks.map((pack) => {
                const isSelected = pack.id === activePack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPackId(pack.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-600/30'
                        : 'bg-white hover:bg-neutral-100/80 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-amber-400 font-mono text-[10px] font-bold">
                        {pack.badge}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                        Save {pack.bundleDiscountPct}%
                      </span>
                    </div>

                    <h4 className="font-display font-extrabold text-sm text-neutral-900 mt-2">
                      {pack.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-neutral-700">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span>{pack.totalPairs} Pairs ({pack.totalCartons} Carton)</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-semibold text-purple-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{pack.expectedTurnoverDays}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-200">
                      <div>
                        <span className="text-[10px] text-neutral-400 block line-through">
                          KSh {pack.originalWholesalePrice.toLocaleString()}
                        </span>
                        <span className="text-base font-black font-mono text-blue-900">
                          KSh {pack.bundleWholesalePrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 block">Est. Net Profit</span>
                        <span className="text-xs font-black font-mono text-emerald-700">
                          +KSh {pack.estimatedNetProfit.toLocaleString()} ({pack.marginPct}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Active Bundle Deep Breakdown & 1-Click Cart Button */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-900 text-blue-200 font-mono text-[10px] font-bold">
                    {activePack.badge}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Target: <strong>{activePack.targetMerchant}</strong>
                  </span>
                </div>

                <h3 className="font-display font-black text-lg text-neutral-950 mt-1.5">
                  {activePack.title}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {activePack.description}
                </p>
              </div>

              {/* Profit & Margin Card */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">
                    Bundle Cost
                  </span>
                  <span className="text-base font-black font-mono text-neutral-900">
                    KSh {activePack.bundleWholesalePrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-semibold">
                    -{activePack.bundleDiscountPct}% Bundle Discount
                  </span>
                </div>

                <div className="border-x border-neutral-200 px-2">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">
                    Retail Clearance
                  </span>
                  <span className="text-base font-black font-mono text-blue-900">
                    KSh {activePack.suggestedRetailRevenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    At standard retail
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                    Reseller Profit
                  </span>
                  <span className="text-base font-black font-mono text-emerald-700">
                    +KSh {activePack.estimatedNetProfit.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    {activePack.marginPct}% Margin
                  </span>
                </div>
              </div>

              {/* Included Shoe Models & Exact Size Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Carton Breakdown & Enforced Sizing Ratios ({activePack.totalPairs} Pairs Total)</span>
                </h4>

                <div className="space-y-2.5">
                  {activePack.includedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.productTitle}
                          className="w-12 h-12 rounded-xl object-cover bg-white border border-neutral-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-neutral-900 text-xs block">
                            {item.productTitle}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Colorway: <strong>{item.color}</strong> · Qty: <strong>{item.pairs} Pairs</strong>
                          </span>
                        </div>
                      </div>

                      {/* Size Matrix Chips */}
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {Object.entries(item.sizeBreakdown).map(([sz, qty]) => (
                          <span
                            key={sz}
                            className="px-2 py-0.5 rounded-md bg-white border border-neutral-300 text-[10px] font-mono text-neutral-800 font-bold"
                          >
                            Sz {sz}: <strong className="text-blue-700">{qty}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights & Logistics Notes */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600">
                  {activePack.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Top Demand Counties: <strong>{activePack.recommendedCounties.join(', ')}</strong>
                  </span>
                </div>
              </div>

              {/* 1-Click Action Button */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold text-xs cursor-pointer"
                >
                  Continue Browsing
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(activePack)}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-700/25 active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Entire {activePack.totalPairs}-Pair Bundle to Cart (KSh {activePack.bundleWholesalePrice.toLocaleString()})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
