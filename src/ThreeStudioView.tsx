import React, { useState } from 'react';
import { ThreeShoeViewer, DEFAULT_SHOE_COLORS } from './ThreeShoeViewer';
import { Product, CartItem } from '../types';
import { Sparkles, Plus, Check, ShieldCheck, Scale, Activity } from 'lucide-react';

interface ThreeStudioViewProps {
  products: Product[];
  onAddToCart: (item: CartItem) => void;
}

export const ThreeStudioView: React.FC<ThreeStudioViewProps> = ({ products, onAddToCart }) => {
  const sneakerProduct = products.find((p) => p.has3DModel) || products[0];
  const [selectedProduct, setSelectedProduct] = useState<Product>(sneakerProduct);
  const [selectedColorHex, setSelectedColorHex] = useState(DEFAULT_SHOE_COLORS[0].hex);
  const [selectedSize, setSelectedSize] = useState<number | string>(42);
  const [selectedQty, setSelectedQty] = useState<number>(12);
  const [addedNotice, setAddedNotice] = useState(false);

  const currentColorObj = DEFAULT_SHOE_COLORS.find((c) => c.hex === selectedColorHex) || DEFAULT_SHOE_COLORS[0];

  const handleAddFromStudio = () => {
    const wholesale = selectedProduct.wholesalePrice ?? selectedProduct.wholesaleTiers?.[0]?.pricePerUnit ?? selectedProduct.retailPrice;
    const unitPrice = selectedQty >= 2 ? wholesale : selectedProduct.retailPrice;

    const newItem: CartItem = {
      id: `${selectedProduct.id}-${selectedSize}-${currentColorObj.name}-${Date.now()}`,
      productId: selectedProduct.id,
      product: selectedProduct,
      size: selectedSize,
      color: currentColorObj.name,
      quantity: selectedQty,
      unitPrice,
    };
    onAddToCart(newItem);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <section className="py-12 bg-neutral-950 text-white min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Three.js / WebGL 3D Interactive Lab</span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-normal mt-2 text-white">
              360° Footwear Inspection & Sole Cushion Lab
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Drag to rotate 360°, inspect vulcanized rubber tread cushioning, swap leather finishes, and test sole flexion.
            </p>
          </div>

          {/* Model Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Model:</span>
            <select
              value={selectedProduct.id}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                if (found) setSelectedProduct(found);
              }}
              className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Studio Grid: 3D Canvas + Configuration Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 3D Canvas */}
          <div className="lg:col-span-8">
            <ThreeShoeViewer
              primaryColor={selectedColorHex}
              accentColor={currentColorObj.accent}
              productTitle={selectedProduct.title}
              onColorChange={(hex) => setSelectedColorHex(hex)}
              fallbackImageUrl={selectedProduct.imageUrl}
            />

            {/* Spec callout strips below viewer */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Material Texture</span>
                <span className="font-semibold text-neutral-200">High-Durability Mesh & EVA</span>
              </div>
              <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Sole Grip</span>
                <span className="font-semibold text-neutral-200">Non-Slip Vulcanized Rubber</span>
              </div>
              <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Packaging Format</span>
                <span className="font-semibold text-neutral-200">Master Reseller Carton</span>
              </div>
            </div>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="lg:col-span-4 bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-6 shadow-xl">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="uppercase font-semibold tracking-wider text-blue-400">
                  {selectedProduct.brand}
                </span>
                <span>MOQ: 2 Pairs Wholesale</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white mt-1">
                {selectedProduct.title}
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* Sizing Rule Pill */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                {selectedProduct.sizingRuleType === 'paired_ladies' ? (
                  <>
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">Ladies Pairing Enforced (42↔37, 41↔38)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">Flexible Individual Sizing (40-45)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                {selectedProduct.sizingRuleType === 'paired_ladies'
                  ? 'Size 42 must pair with 37 in the cart. Automated pair balancing available.'
                  : 'Pick any numbers without restrictive sizing ratios.'}
              </p>
            </div>

            {/* Wholesale Pricing Rate */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs flex justify-between items-center">
              <div>
                <span className="text-neutral-400 block text-[11px]">Wholesale Price (≥2 prs):</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  KSh {(selectedProduct.wholesalePrice || 1550).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block text-[11px]">Single Pair:</span>
                <span className="font-mono text-neutral-400 line-through">
                  KSh {selectedProduct.retailPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Size Selector */}
            {selectedProduct.sizingRuleType !== 'free_size' && (
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  Select Size (EU):
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedSize(v.size)}
                      className={`py-2 text-center rounded-xl text-xs font-bold transition-all border ${
                        selectedSize === v.size
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <label className="font-semibold text-neutral-300">Quantity (Pairs):</label>
                <span className="text-emerald-400 font-mono font-bold">Wholesale Active</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-center font-bold text-white text-sm font-mono"
                />
                <div className="flex-1 grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setSelectedQty(6)}
                    className="py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl"
                  >
                    6 prs
                  </button>
                  <button
                    onClick={() => setSelectedQty(12)}
                    className="py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl"
                  >
                    12 prs
                  </button>
                  <button
                    onClick={() => setSelectedQty(24)}
                    className="py-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xs font-bold rounded-xl border border-blue-700"
                  >
                    24 prs
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Wholesale Cart Button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleAddFromStudio}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-300" />
                    <span>Added to Wholesale Cart!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add {selectedQty} Pairs to Wholesale Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
