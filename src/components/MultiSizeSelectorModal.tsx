import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  AlertCircle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
  TrendingDown,
  Palette,
  Trash2
} from 'lucide-react';
import { Product, CartItem, StoreSettings } from '../types';
import { LADIES_PAIRING_MATRIX } from '../utils/sizingValidator';

export interface SizeColorItem {
  id: string;
  size: number | string;
  color: string;
  quantity: number;
}

interface MultiSizeSelectorModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddSizesToCart: (items: CartItem[]) => void;
  onOrderNow?: (items: CartItem[]) => void;
  storeSettings?: StoreSettings;
  initialSize?: number | string;
}

export const MultiSizeSelectorModal: React.FC<MultiSizeSelectorModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddSizesToCart,
  onOrderNow,
  storeSettings,
  initialSize,
}) => {
  // Determine all available sizes for this shoe
  const availableSizes = useMemo<(number | string)[]>(() => {
    if (product.sizingRuleType === 'free_size') {
      return ['Free Size'];
    }

    // Extract sizes from product variants if available
    const variantSizes = product.variants
      .map((v) => v.size)
      .filter((s) => s !== undefined && s !== null);

    if (variantSizes.length > 0) {
      // Deduplicate and sort numerically if possible
      const unique = Array.from(new Set(variantSizes));
      return unique.sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return String(a).localeCompare(String(b));
      });
    }

    // Fallbacks based on category/sizing rule
    if (product.sizingRuleType === 'paired_ladies' || product.category === 'ladies') {
      return [37, 38, 39, 40, 41, 42];
    }
    // Men's shoes, sneakers, boots, sandals
    return [40, 41, 42, 43, 44, 45];
  }, [product]);

  // Determine all colors allowed by the admin for this shoe model
  const availableColors = useMemo<string[]>(() => {
    const list: string[] = [];
    if (product.allowedColors && product.allowedColors.length > 0) {
      product.allowedColors.forEach((c) => {
        if (c && !list.includes(c)) list.push(c);
      });
    }
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.color && !list.includes(v.color)) list.push(v.color);
      });
    }
    return list.length > 0 ? list : ['Classic Black', 'Cognac Tan', 'Standard'];
  }, [product]);

  // Global default active color
  const defaultColor = availableColors[0] || 'Standard';
  const [globalColor, setGlobalColor] = useState<string>(defaultColor);

  // State: List of size-color line items
  const [items, setItems] = useState<SizeColorItem[]>([]);

  // Initialize or reset line items when modal opens or product changes
  useEffect(() => {
    if (!isOpen) return;

    const baseColor = availableColors[0] || 'Standard';
    setGlobalColor(baseColor);

    const initialItems: SizeColorItem[] = availableSizes.map((sz, idx) => {
      let defaultQty = 0;
      if (initialSize && String(sz) === String(initialSize)) {
        defaultQty = 2;
      } else if (!initialSize && (sz === 42 || sz === 'Free Size')) {
        defaultQty = 2;
      }

      return {
        id: `line-${sz}-${baseColor}-${idx}`,
        size: sz,
        color: baseColor,
        quantity: defaultQty,
      };
    });

    setItems(initialItems);
  }, [isOpen, product, availableSizes, availableColors, initialSize]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Swatch color helper
  const getSwatchHex = (colorName: string) => {
    const lower = colorName.toLowerCase();
    if (lower.includes('gold') || lower.includes('yellow')) return '#eab308';
    if (lower.includes('blue') || lower.includes('navy') || lower.includes('kisumu')) return '#2563eb';
    if (lower.includes('beige') || lower.includes('taupe') || lower.includes('cream')) return '#d6c0a6';
    if (lower.includes('tan') || lower.includes('brown') || lower.includes('cognac') || lower.includes('espresso') || lower.includes('rust')) return '#854d0e';
    if (lower.includes('red') || lower.includes('crimson') || lower.includes('wine')) return '#dc2626';
    if (lower.includes('white') || lower.includes('silver')) return '#f8fafc';
    if (lower.includes('green') || lower.includes('olive') || lower.includes('volt')) return '#16a34a';
    return '#171717';
  };

  // Quantity updater for a specific item
  const handleSetItemQty = (id: string, newQty: number) => {
    const validQty = Math.max(0, Math.min(500, Math.floor(newQty || 0)));
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: validQty } : it))
    );
  };

  const handleIncrementItem = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const newQty = Math.max(0, Math.min(500, it.quantity + delta));
          return { ...it, quantity: newQty };
        }
        return it;
      })
    );
  };

  // Change color for a specific item line
  const handleSetItemColor = (id: string, newColor: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, color: newColor } : it))
    );
  };

  // Add another color variant for a specific size number
  const handleAddColorVariantForSize = (size: number | string) => {
    // Pick next unused color for this size if possible
    const currentColorsForSize = items
      .filter((it) => it.size === size)
      .map((it) => it.color);

    const nextColor =
      availableColors.find((c) => !currentColorsForSize.includes(c)) ||
      availableColors[0] ||
      'Standard';

    const newItem: SizeColorItem = {
      id: `line-${size}-${nextColor}-${Date.now()}`,
      size,
      color: nextColor,
      quantity: 1, // Default 1 pair for new variant
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Remove a line item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      // Find the item
      const target = prev.find((it) => it.id === id);
      if (!target) return prev;

      // If it's the only line for this size, just reset quantity to 0
      const countForSize = prev.filter((it) => it.size === target.size).length;
      if (countForSize <= 1) {
        return prev.map((it) => (it.id === id ? { ...it, quantity: 0 } : it));
      }

      // Otherwise remove the extra line
      return prev.filter((it) => it.id !== id);
    });
  };

  // Apply a color to ALL current lines
  const handleApplyColorToAll = (colorName: string) => {
    setGlobalColor(colorName);
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        color: colorName,
      }))
    );
  };

  // Quick preset actions
  const handleClearAll = () => {
    setItems((prev) => prev.map((it) => ({ ...it, quantity: 0 })));
  };

  const handleAddOneToAll = () => {
    setItems((prev) => prev.map((it) => ({ ...it, quantity: it.quantity + 1 })));
  };

  const handleAddTwoToAll = () => {
    setItems((prev) => prev.map((it) => ({ ...it, quantity: it.quantity + 2 })));
  };

  // Auto-balance ladies pairing (42<->37, 41<->38, 40<->39)
  const handleAutoBalanceLadies = () => {
    setItems((prev) => {
      const updated = [...prev];

      LADIES_PAIRING_MATRIX.forEach(({ primarySize, requiredSize }) => {
        // Calculate total qty of primary size across all colors
        const primItems = updated.filter((it) => it.size === primarySize);
        const reqItems = updated.filter((it) => it.size === requiredSize);

        const totalPrim = primItems.reduce((s, it) => s + it.quantity, 0);
        const totalReq = reqItems.reduce((s, it) => s + it.quantity, 0);

        if (totalPrim > totalReq) {
          const deficit = totalPrim - totalReq;
          // Add deficit to first required size item or add to it
          if (reqItems.length > 0) {
            const firstReqId = reqItems[0].id;
            const targetIndex = updated.findIndex((it) => it.id === firstReqId);
            if (targetIndex !== -1) {
              updated[targetIndex] = {
                ...updated[targetIndex],
                quantity: updated[targetIndex].quantity + deficit,
              };
            }
          }
        }
      });

      return updated;
    });
  };

  // Calculations
  const activeItems = items.filter((it) => it.quantity > 0);
  const totalPairs = activeItems.reduce((sum, it) => sum + it.quantity, 0);
  const wholesalePrice =
    product.wholesalePrice ??
    product.wholesaleTiers?.[0]?.pricePerUnit ??
    Math.round(product.retailPrice * 0.6);
  const isWholesaleActive = totalPairs >= 2;
  const effectiveUnitPrice = isWholesaleActive ? wholesalePrice : product.retailPrice;
  const totalCost = totalPairs * effectiveUnitPrice;
  const totalSavings = Math.max(0, (product.retailPrice - effectiveUnitPrice) * totalPairs);

  // Ladies Pairing Status
  const ladiesPairingStatus = useMemo(() => {
    if (product.sizingRuleType !== 'paired_ladies') return null;

    const discrepancies: { primary: number; required: number; deficit: number }[] = [];
    LADIES_PAIRING_MATRIX.forEach(({ primarySize, requiredSize }) => {
      const primQty = items
        .filter((it) => it.size === primarySize)
        .reduce((sum, it) => sum + it.quantity, 0);
      const reqQty = items
        .filter((it) => it.size === requiredSize)
        .reduce((sum, it) => sum + it.quantity, 0);

      if (primQty > reqQty) {
        discrepancies.push({
          primary: primarySize,
          required: requiredSize,
          deficit: primQty - reqQty,
        });
      }
    });

    const isBalanced = discrepancies.length === 0;
    return { isBalanced, discrepancies };
  }, [product.sizingRuleType, items]);

  // Handle Add All to Cart
  const handleConfirmAddToCart = () => {
    if (totalPairs === 0) return;

    const itemsToAdd: CartItem[] = activeItems.map((it, index) => ({
      id: `${product.id}-${it.size}-${it.color}-${Date.now()}-${index}`,
      productId: product.id,
      product,
      size: it.size,
      color: it.color,
      quantity: it.quantity,
      unitPrice: effectiveUnitPrice,
    }));

    onAddSizesToCart(itemsToAdd);
    onClose();
  };

  // Handle Order Now (Instant Direct Checkout)
  const handleOrderNow = () => {
    if (totalPairs === 0) return;

    const itemsToAdd: CartItem[] = activeItems.map((it, index) => ({
      id: `${product.id}-${it.size}-${it.color}-${Date.now()}-${index}`,
      productId: product.id,
      product,
      size: it.size,
      color: it.color,
      quantity: it.quantity,
      unitPrice: effectiveUnitPrice,
    }));

    if (onOrderNow) {
      onOrderNow(itemsToAdd);
    } else {
      onAddSizesToCart(itemsToAdd);
    }
    onClose();
  };

  // Group items by size for rendering
  const itemsBySize = useMemo(() => {
    const map = new Map<number | string, SizeColorItem[]>();
    availableSizes.forEach((sz) => map.set(sz, []));

    items.forEach((it) => {
      const list = map.get(it.size) || [];
      list.push(it);
      map.set(it.size, list);
    });

    return map;
  }, [availableSizes, items]);

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  Size & Color Customization
                </span>
                <span className="text-xs text-neutral-400 font-medium">·</span>
                <span className="text-xs text-neutral-500 font-semibold">{product.brand}</span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-neutral-950 line-clamp-1">
                {product.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Sizing Freedom / Sizing Rules Notification Card */}
          {product.sizingRuleType === 'flexible_mens' ? (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
              <div className="p-1.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="font-bold text-emerald-900 text-sm">
                    Open Flexible Sizing & Color Freedom
                  </strong>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Free Choice
                  </span>
                </div>
                <p className="text-emerald-800 leading-relaxed text-[11px] sm:text-xs">
                  Assign <strong>custom colors per shoe size</strong> (e.g., 3 pairs of Size 42 in <em>Classic Black</em>, 4 pairs of Size 43 in <em>Cognac Tan</em>). Wholesale rates apply automatically at 2+ pairs!
                </p>
              </div>
            </div>
          ) : product.sizingRuleType === 'paired_ladies' ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold text-amber-900 block text-xs">
                    Ladies Matched Sizing Rule (42↔37, 41↔38, 40↔39)
                  </strong>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Pick your preferred colors for each size. Pairs are balanced across total size quantities.
                  </p>
                </div>
              </div>

              {ladiesPairingStatus && !ladiesPairingStatus.isBalanced && (
                <button
                  type="button"
                  onClick={handleAutoBalanceLadies}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition-colors shadow-xs"
                >
                  Auto-Balance
                </button>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Free Size Assorted Carton:</strong> Choose color preference below. Standard mixed sizes pre-packaged.
              </span>
            </div>
          )}

          {/* Quick Toolbar: Batch Apply Color to All Sizes */}
          {availableColors.length > 1 && (
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  <span>Batch Quick Action (Apply One Color to All Sizes):</span>
                </label>
                <span className="text-[10px] text-neutral-500">
                  Or customize colors per size below
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleApplyColorToAll(col)}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white border border-neutral-300 hover:border-blue-500 hover:bg-blue-50 text-neutral-700 hover:text-blue-900 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-black/20 shrink-0"
                      style={{ backgroundColor: getSwatchHex(col) }}
                    />
                    <span>Set all to {col}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIZES BREAKDOWN SECTION (WITH INDIVIDUAL COLOR SELECTORS) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Choose Shoe Numbers & Specific Colors:</span>
                </label>
                <span className="text-[11px] text-neutral-500">
                  Select quantity and choose any allowed color for that specific shoe number
                </span>
              </div>

              {/* Fast Presets Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddOneToAll}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[11px] transition-colors cursor-pointer"
                  title="Add 1 pair of every size"
                >
                  +1 to All
                </button>
                <button
                  type="button"
                  onClick={handleAddTwoToAll}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[11px] transition-colors cursor-pointer"
                  title="Add 2 pairs of every size"
                >
                  +2 to All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset all quantities to 0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Sizes & Colors List */}
            <div className="space-y-3">
              {availableSizes.map((sizeKey) => {
                const sizeLines = itemsBySize.get(sizeKey) || [];
                const totalQtyForThisSize = sizeLines.reduce((s, it) => s + it.quantity, 0);
                const hasSelection = totalQtyForThisSize > 0;
                const sizeNum = typeof sizeKey === 'number' ? sizeKey : parseInt(String(sizeKey), 10);

                let pairedPartner: number | null = null;
                if (product.sizingRuleType === 'paired_ladies' && !isNaN(sizeNum)) {
                  const pairObj = LADIES_PAIRING_MATRIX.find(
                    (p) => p.primarySize === sizeNum || p.requiredSize === sizeNum
                  );
                  if (pairObj) {
                    pairedPartner = pairObj.primarySize === sizeNum ? pairObj.requiredSize : pairObj.primarySize;
                  }
                }

                return (
                  <div
                    key={String(sizeKey)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 space-y-2.5 ${
                      hasSelection
                        ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/10 shadow-xs'
                        : 'bg-neutral-50/70 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* Header Row for this Size */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center font-display font-black text-xs shrink-0 transition-colors ${
                            hasSelection
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'bg-white text-neutral-800 border border-neutral-200'
                          }`}
                        >
                          <span className="text-[8px] uppercase font-bold tracking-tighter opacity-80 leading-none">
                            Size
                          </span>
                          <span className="text-sm leading-none mt-0.5">{sizeKey}</span>
                        </div>

                        <div>
                          <span className="font-bold text-xs text-neutral-900">
                            {typeof sizeKey === 'number' ? `Shoe Number EU ${sizeKey}` : sizeKey}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                            {pairedPartner ? (
                              <span className="text-amber-700 font-medium">Pairs with Size {pairedPartner}</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Flexible Sizing</span>
                            )}
                            {hasSelection && (
                              <span className="font-bold text-blue-700">
                                · Total {totalQtyForThisSize} {totalQtyForThisSize === 1 ? 'pair' : 'pairs'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Add another color line button for this shoe number */}
                      {availableColors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddColorVariantForSize(sizeKey)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200 border border-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Another Color</span>
                        </button>
                      )}
                    </div>

                    {/* Color Variant Rows for this Shoe Number */}
                    <div className="space-y-2 pt-1">
                      {sizeLines.map((line, lIdx) => (
                        <div
                          key={line.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-xl bg-white border border-neutral-200 shadow-2xs"
                        >
                          {/* Color Selector for this specific line */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[11px] font-semibold text-neutral-500 shrink-0">
                              Color:
                            </span>

                            {availableColors.length <= 4 ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {availableColors.map((col) => {
                                  const isSelected = line.color === col;
                                  return (
                                    <button
                                      key={col}
                                      type="button"
                                      onClick={() => handleSetItemColor(line.id, col)}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isSelected
                                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                                      }`}
                                    >
                                      <span
                                        className="w-2.5 h-2.5 rounded-full ring-1 ring-black/20 shrink-0"
                                        style={{ backgroundColor: getSwatchHex(col) }}
                                      />
                                      <span>{col}</span>
                                      {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <select
                                value={line.color}
                                onChange={(e) => handleSetItemColor(line.id, e.target.value)}
                                className="px-2.5 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {availableColors.map((col) => (
                                  <option key={col} value={col}>
                                    {col}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Numeric Stepper for this specific line */}
                          <div className="flex items-center justify-end gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleIncrementItem(line.id, -1)}
                              disabled={line.quantity === 0}
                              aria-label={`Decrease quantity`}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                line.quantity === 0
                                  ? 'text-neutral-300 bg-neutral-100 cursor-not-allowed'
                                  : 'bg-white hover:bg-neutral-200 text-neutral-800 border border-neutral-300 active:scale-95 shadow-2xs'
                              }`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min={0}
                              max={500}
                              value={line.quantity === 0 ? '' : line.quantity}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                handleSetItemQty(line.id, isNaN(val) ? 0 : val);
                              }}
                              placeholder="0"
                              className={`w-11 h-7 rounded-lg text-center font-extrabold text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                line.quantity > 0
                                  ? 'bg-blue-50 text-blue-900 border-blue-400 font-bold'
                                  : 'bg-white text-neutral-700 border-neutral-300'
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() => handleIncrementItem(line.id, 1)}
                              aria-label={`Increase quantity`}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-neutral-200 text-neutral-800 border border-neutral-300 flex items-center justify-center active:scale-95 transition-colors shadow-2xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleIncrementItem(line.id, 2)}
                              className="h-7 px-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[10px] flex items-center justify-center transition-colors active:scale-95 border border-neutral-200"
                              title={`Add 2 more pairs`}
                            >
                              +2
                            </button>

                            {/* Remove extra row button */}
                            {sizeLines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(line.id)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                                title="Remove this color variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ITEMIZED SELECTION SUMMARY CHIPS */}
          {activeItems.length > 0 && (
            <div className="p-3.5 bg-neutral-100/90 rounded-2xl border border-neutral-200 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                Itemized Order Breakdown ({totalPairs} {totalPairs === 1 ? 'pair' : 'pairs'} total):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeItems.map((it) => (
                  <div
                    key={it.id}
                    className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-neutral-300 shadow-2xs text-xs font-semibold text-neutral-900"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-black/20 shrink-0"
                      style={{ backgroundColor: getSwatchHex(it.color) }}
                    />
                    <span className="font-bold text-blue-700">Size {it.size}</span>
                    <span className="text-neutral-500 font-medium">({it.color}):</span>
                    <span className="font-extrabold font-mono text-neutral-950">{it.quantity} prs</span>
                    <button
                      type="button"
                      onClick={() => handleSetItemQty(it.id, 0)}
                      className="text-neutral-400 hover:text-red-500 ml-0.5 p-0.5 rounded cursor-pointer"
                      title={`Remove line`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wholesale Pricing Calculation Box */}
          <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Total Chosen Quantity:</span>
              <span className="font-extrabold text-sm text-white font-mono">
                {totalPairs} {totalPairs === 1 ? 'Pair' : 'Pairs'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Effective Unit Price:</span>
                {isWholesaleActive ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Wholesale Rate Active (≥ 2 Pairs)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    Retail Rate (Add 1 more for wholesale)
                  </span>
                )}
              </div>
              <span className="font-bold text-neutral-200 font-mono">
                KSh {effectiveUnitPrice.toLocaleString()} / pair
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold pt-1 border-t border-neutral-800">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Wholesale Savings:</span>
                </span>
                <span className="font-mono">Save KSh {totalSavings.toLocaleString()}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <span className="font-bold text-sm text-neutral-300">Total Order Amount:</span>
              <span className="font-display font-black text-xl text-white font-mono tabular-nums">
                KSh {totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-600 hidden sm:block">
            {totalPairs === 0 ? (
              <span className="text-neutral-400">Pick any numbers and colors above</span>
            ) : (
              <span>
                Ready to dispatch from <strong>Kisumu Bus Park Depot</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* Button 1: Add to Cart (Tuka, yani - Keep Shopping for other shoes) */}
            <button
              type="button"
              disabled={totalPairs === 0}
              onClick={handleConfirmAddToCart}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                totalPairs === 0
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-white border-blue-600 text-blue-700 hover:bg-blue-50 shadow-xs'
              }`}
              title="Add these sizes and colors to your cart and continue shopping for other shoe styles"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>
                {totalPairs === 0
                  ? 'Pick Sizes Above'
                  : `Add ${totalPairs} to Cart (Keep Shopping)`}
              </span>
            </button>

            {/* Button 2: Order Now (Direct Checkout for Single/Express Shoppers) */}
            <button
              type="button"
              disabled={totalPairs === 0}
              onClick={handleOrderNow}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                totalPairs === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/25 hover:scale-[1.02]'
              }`}
              title="Add items and immediately open checkout drawer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Order Now (Checkout)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
