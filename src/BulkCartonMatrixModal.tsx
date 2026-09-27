import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Minus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Truck,
  Box,
  Scale,
  MapPin,
  ArrowRight,
  Calculator,
  MessageSquare
} from 'lucide-react';
import { Product, CartItem, StoreSettings } from '../types';
import { Z_INDEX } from '../constants/zIndex';
import { LADIES_PAIRING_MATRIX } from '../utils/sizingValidator';
import { RESELLER_TOWN_PROFILES } from '../data/mockData';

interface BulkCartonMatrixModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddCartonToCart: (items: CartItem[]) => void;
  storeSettings: StoreSettings;
}

export const BulkCartonMatrixModal: React.FC<BulkCartonMatrixModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddCartonToCart,
  storeSettings,
}) => {
  // Available shoe sizes based on category/sizing rule
  const availableSizes = useMemo(() => {
    if (product.sizingRuleType === 'paired_ladies') {
      return [37, 38, 39, 40, 41, 42];
    }
    if (product.sizingRuleType === 'free_size') {
      return ['Free Size'];
    }
    return [40, 41, 42, 43, 44, 45];
  }, [product]);

  // Initial matrix quantities (default to balanced 24-pair Master Carton)
  const [sizeQuantities, setSizeQuantities] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    if (product.sizingRuleType === 'paired_ladies') {
      initial[37] = 4;
      initial[38] = 4;
      initial[39] = 4;
      initial[40] = 4;
      initial[41] = 4;
      initial[42] = 4;
    } else if (product.sizingRuleType === 'free_size') {
      initial['Free Size'] = 24;
    } else {
      initial[40] = 3;
      initial[41] = 5;
      initial[42] = 6;
      initial[43] = 5;
      initial[44] = 3;
      initial[45] = 2;
    }
    return initial;
  });

  const [selectedColor, setSelectedColor] = useState(
    product.variants[0]?.color || 'Standard'
  );

  // Profit Margin Simulator settings
  const [selectedTown, setSelectedTown] = useState<string>(RESELLER_TOWN_PROFILES[0].townName);
  const currentTownProfile = useMemo(
    () => RESELLER_TOWN_PROFILES.find((t) => t.townName === selectedTown) || RESELLER_TOWN_PROFILES[0],
    [selectedTown]
  );
  const [targetRetailPrice, setTargetRetailPrice] = useState<number>(
    product.retailPrice || currentTownProfile.suggestedRetailPrice
  );
  const [cartonError, setCartonError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Total pairs in matrix
  const totalCartonPairs = Object.values(sizeQuantities).reduce((sum, q) => sum + (q || 0), 0);

  // Unit wholesale price for 2+ pairs
  const unitWholesalePrice = product.wholesalePrice ?? product.wholesaleTiers?.[0]?.pricePerUnit ?? product.retailPrice;
  const effectiveUnitPrice = totalCartonPairs >= 2 ? unitWholesalePrice : product.retailPrice;
  const totalWholesaleInvestment = totalCartonPairs * effectiveUnitPrice;

  // Pairing validation for ladies shoes
  const pairingDiscrepancies = useMemo(() => {
    if (product.sizingRuleType !== 'paired_ladies') return [];
    const list: { primarySize: number; requiredSize: number; deficit: number }[] = [];
    
    // Check if large sizes exist
    const hasLarge = (sizeQuantities[42] || 0) > 0 || (sizeQuantities[41] || 0) > 0 || (sizeQuantities[40] || 0) > 0;
    if (!hasLarge) return []; // Standalone small sizes allowed

    for (const pair of LADIES_PAIRING_MATRIX) {
      const pQty = sizeQuantities[pair.primarySize] || 0;
      const rQty = sizeQuantities[pair.requiredSize] || 0;
      if (pQty > rQty) {
        list.push({
          primarySize: pair.primarySize,
          requiredSize: pair.requiredSize,
          deficit: pQty - rQty,
        });
      }
    }
    return list;
  }, [product.sizingRuleType, sizeQuantities]);

  const isPairingBalanced = pairingDiscrepancies.length === 0;

  // Profit Simulator Calculations
  const grossRetailRevenue = totalCartonPairs * targetRetailPrice;
  const estimatedParcelFreight = totalCartonPairs * currentTownProfile.localTransportPerPair;
  const netResellerProfit = Math.max(0, grossRetailRevenue - totalWholesaleInvestment - estimatedParcelFreight);
  const roiPercentage = totalWholesaleInvestment > 0 ? Math.round((netResellerProfit / totalWholesaleInvestment) * 100) : 0;
  const profitPerPair = totalCartonPairs > 0 ? Math.round(netResellerProfit / totalCartonPairs) : 0;

  // Quick Preset Handlers
  const handleApplyPreset = (pairsCount: number) => {
    const updated: { [key: string]: number } = {};
    if (product.sizingRuleType === 'paired_ladies') {
      const perPair = Math.max(1, Math.floor(pairsCount / 6));
      [37, 38, 39, 40, 41, 42].forEach((s) => {
        updated[s] = perPair;
      });
    } else if (product.sizingRuleType === 'free_size') {
      updated['Free Size'] = pairsCount;
    } else {
      // Men's standard bell curve for sizes 40-45
      const base = Math.floor(pairsCount / 6);
      updated[40] = Math.max(1, base - 1);
      updated[41] = base + 1;
      updated[42] = base + 2;
      updated[43] = base + 1;
      updated[44] = Math.max(1, base);
      updated[45] = Math.max(1, base - 1);
    }
    setSizeQuantities(updated);
  };

  const handleAutoBalance = () => {
    const copy = { ...sizeQuantities };
    for (const pair of LADIES_PAIRING_MATRIX) {
      const pQty = copy[pair.primarySize] || 0;
      const rQty = copy[pair.requiredSize] || 0;
      if (pQty > rQty) {
        copy[pair.requiredSize] = pQty;
      }
    }
    setSizeQuantities(copy);
  };

  const handleUpdateSizeQty = (sizeKey: string | number, delta: number) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [sizeKey]: Math.max(0, (prev[sizeKey] || 0) + delta),
    }));
  };

  const handleSetSizeQty = (sizeKey: string | number, val: number) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [sizeKey]: Math.max(0, val),
    }));
  };

  const handleAddAllToCart = () => {
    const itemsToAdd: CartItem[] = [];

    Object.entries(sizeQuantities).forEach(([size, qty]) => {
      if (qty > 0) {
        itemsToAdd.push({
          id: `${product.id}-${size}-${selectedColor}-${Date.now()}-${Math.random()}`,
          productId: product.id,
          product,
          size: isNaN(Number(size)) ? size : Number(size),
          color: selectedColor,
          quantity: qty,
          unitPrice: effectiveUnitPrice,
        });
      }
    });

    if (itemsToAdd.length === 0) {
      setCartonError('Please add at least 1 pair to the carton.');
      return;
    }
    setCartonError(null);

    onAddCartonToCart(itemsToAdd);
    onClose();
  };

  const handleWhatsAppCartonQuote = () => {
    const lines = [
      `*WHOLESALE MASTER CARTON INQUIRY - BLUES COLLECTION KISUMU*`,
      `Shoe Model: ${product.title} (${product.brand})`,
      `Color Finish: ${selectedColor}`,
      `Total Pairs: ${totalCartonPairs} prs`,
      `Wholesale Rate: KSh ${effectiveUnitPrice.toLocaleString()} / pair`,
      `Total Wholesale Value: KSh ${totalWholesaleInvestment.toLocaleString()}`,
      `---------------------------------`,
      `*CARTON SIZE BREAKDOWN:*`,
    ];
    Object.entries(sizeQuantities).forEach(([s, q]) => {
      if (q > 0) {
        lines.push(`• Size ${s}: ${q} pairs`);
      }
    });
    lines.push(`---------------------------------`);
    lines.push(`Destination: ${selectedTown}`);
    lines.push(`Please confirm warehouse dispatch availability for today's 4:00 PM bus.`);

    const encoded = encodeURIComponent(lines.join('\n'));
    const phone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const modalContent = (
    <div className={`fixed inset-0 ${Z_INDEX.MODAL} overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150`}>
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30 shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  B2B Master Carton Builder
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Wholesale Active
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                {product.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Preset Buttons Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-neutral-800">Carton Batch Presets:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset(12)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-300 font-semibold text-neutral-700 bg-white hover:bg-neutral-100 transition-colors shadow-xs"
              >
                12 Pairs (Half Carton)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(24)}
                className="px-3 py-1.5 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition-all shadow-sm"
              >
                24 Pairs (Master Box)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(60)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-300 font-semibold text-neutral-700 bg-white hover:bg-neutral-100 transition-colors shadow-xs"
              >
                60 Pairs (Market Lot)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(120)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-300 font-semibold text-neutral-700 bg-white hover:bg-neutral-100 transition-colors shadow-xs"
              >
                120 Pairs (Mega Batch)
              </button>
            </div>
          </div>

          {/* Sizing Pairing Notice Banner (if ladies paired) */}
          {product.sizingRuleType === 'paired_ladies' && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isPairingBalanced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  {isPairingBalanced ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ladies Sizing Matrix: 100% Balanced</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Ladies Sizing Pairing Rule Discrepancy</span>
                    </>
                  )}
                </div>
                {!isPairingBalanced && (
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Balance Sizes</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                Wholesale ladies shoes require 1:1 balance for large sizes (42↔37, 41↔38, 40↔39) so resellers don't get stuck with dead stock.
                {pairingDiscrepancies.length > 0 && (
                  <span className="block mt-1 font-semibold text-amber-950">
                    Missing: {pairingDiscrepancies.map((d) => `${d.deficit} pair(s) of Size ${d.requiredSize} for Size ${d.primarySize}`).join(', ')}.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 1: B2B SIZING MATRIX FAST ENTRY GRID              */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800 uppercase tracking-wider">
                1. Footwear Size Allocation Grid
              </span>
              <span className="text-neutral-500">
                Total Allocated: <strong className="text-blue-700 font-mono font-bold text-sm">{totalCartonPairs}</strong> Pairs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {availableSizes.map((size) => {
                const qty = sizeQuantities[size] || 0;
                return (
                  <div
                    key={String(size)}
                    className={`p-3 rounded-2xl border transition-all text-center space-y-2 ${
                      qty > 0
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900 font-mono">
                        {typeof size === 'number' ? `Size ${size}` : size}
                      </span>
                      {product.sizingRuleType === 'paired_ladies' && (
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {size === 42 || size === 37 ? 'Pair A' : size === 41 || size === 38 ? 'Pair B' : 'Pair C'}
                        </span>
                      )}
                    </div>

                    <input
                      type="number"
                      min={0}
                      value={qty || ''}
                      onChange={(e) => handleSetSizeQty(size, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full text-center py-1.5 px-2 bg-white border border-neutral-300 rounded-xl font-mono font-extrabold text-base text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                    />

                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateSizeQty(size, -1)}
                        className="w-6 h-6 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center text-xs font-bold transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSizeQty(size, 1)}
                        className="w-6 h-6 rounded-lg bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center text-xs font-bold transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: WHOLESALE PROFIT MARGIN & ROI SIMULATOR         */}
          {/* ========================================================= */}
          <div className="p-5 rounded-3xl bg-neutral-900 text-white space-y-5 border border-neutral-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-white">
                    2. Reseller Profit Margin & ROI Simulator
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    Forecast your business return on investment for your retail boutique
                  </span>
                </div>
              </div>

              {/* Destination Town Picker */}
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={selectedTown}
                  onChange={(e) => setSelectedTown(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {RESELLER_TOWN_PROFILES.map((t) => (
                    <option key={t.townName} value={t.townName}>
                      {t.townName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inputs & Profit Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Unit Wholesale Cost */}
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
                <span className="text-[11px] text-neutral-400 block font-medium">
                  Wholesale Cost / Pair:
                </span>
                <div className="text-lg font-bold font-mono text-white">
                  KSh {effectiveUnitPrice.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-400">
                  Wholesale tier applied
                </span>
              </div>

              {/* Target Retail Price in Town */}
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
                <span className="text-[11px] text-neutral-400 block font-medium">
                  Your Retail Price in Town:
                </span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-neutral-500 font-mono text-xs">KSh</span>
                  <input
                    type="number"
                    min={effectiveUnitPrice + 100}
                    value={targetRetailPrice || ''}
                    onChange={(e) => setTargetRetailPrice(Number(e.target.value) || 2800)}
                    className="w-full pl-9 pr-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  Est. freight KSh {currentTownProfile.localTransportPerPair}/pr
                </span>
              </div>

              {/* Total Projected Net Profit */}
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-emerald-900/60 space-y-1">
                <span className="text-[11px] text-emerald-400 block font-bold">
                  Net Carton Gross Profit:
                </span>
                <div className="text-xl font-extrabold font-mono text-emerald-400">
                  +KSh {netResellerProfit.toLocaleString()}
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  KSh {profitPerPair.toLocaleString()} profit / pair
                </span>
              </div>

              {/* ROI Percentage */}
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
                <span className="text-[11px] text-blue-400 block font-bold">
                  Projected ROI:
                </span>
                <div className="text-xl font-extrabold font-mono text-blue-400">
                  +{roiPercentage}%
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  Based on {totalCartonPairs} pairs
                </span>
              </div>
            </div>

            {/* Total Financial Summary Bar */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-neutral-400">
                  Carton Cost: <strong className="font-mono text-white">KSh {totalWholesaleInvestment.toLocaleString()}</strong>
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400">
                  Projected Retail Sales: <strong className="font-mono text-white">KSh {grossRetailRevenue.toLocaleString()}</strong>
                </span>
              </div>

              <div className="text-emerald-400 font-bold font-mono">
                Boutique Net Gain: KSh {netResellerProfit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 flex flex-col gap-3">
          {cartonError && (
            <div className="w-full px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cartonError}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-600 font-medium">Carton Breakdown:</span>
            <span className="font-mono font-bold text-neutral-900">{totalCartonPairs} Pairs</span>
            <span className="text-neutral-400">·</span>
            <span className="font-mono font-extrabold text-blue-800">
              KSh {totalWholesaleInvestment.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleWhatsAppCartonQuote}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Quote</span>
            </button>

            <button
              type="button"
              disabled={totalCartonPairs === 0 || !isPairingBalanced}
              onClick={handleAddAllToCart}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                totalCartonPairs > 0 && isPairingBalanced
                  ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/25 active:scale-95'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Add {totalCartonPairs} Pairs to Wholesale Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
