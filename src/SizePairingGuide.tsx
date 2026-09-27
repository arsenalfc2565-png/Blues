import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Scale, Sparkles } from 'lucide-react';
import { LADIES_PAIRING_MATRIX } from '../utils/sizingValidator';

export const SizePairingGuide: React.FC = () => {
  const [testSizes, setTestSizes] = useState<{ [size: number]: number }>({
    37: 0,
    38: 0,
    39: 0,
    40: 0,
    41: 0,
    42: 0,
  });

  const updateTestQty = (size: number, delta: number) => {
    setTestSizes((prev) => ({
      ...prev,
      [size]: Math.max(0, (prev[size] || 0) + delta),
    }));
  };

  const hasLarge = (testSizes[42] || 0) > 0 || (testSizes[41] || 0) > 0 || (testSizes[40] || 0) > 0;
  const smallOnly = !hasLarge && ((testSizes[37] || 0) > 0 || (testSizes[38] || 0) > 0 || (testSizes[39] || 0) > 0);
  const diff42_37 = (testSizes[42] || 0) - (testSizes[37] || 0);
  const diff41_38 = (testSizes[41] || 0) - (testSizes[38] || 0);
  const diff40_39 = (testSizes[40] || 0) - (testSizes[39] || 0);
  const isBalanced = !hasLarge || (diff42_37 <= 0 && diff41_38 <= 0 && diff40_39 <= 0);

  return (
    <section className="py-12 bg-white border-b border-neutral-200" id="pairing-guide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Wholesale Inventory Integrity Engine</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-neutral-900 tracking-normal">
            Footwear Size-Pairing & Sizing Rules Explained
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed">
            In wholesale footwear distribution across Kenya and East Africa, extreme size imbalances lead to dead stock for retailers and distributors. Blues Collection implements specialized sizing rules to guarantee profitable inventory turn.
          </p>
        </div>

        {/* 3 Columns: Ladies, Mens, and Free Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ladies Paired Size Matrix */}
          <div className="p-6 rounded-3xl border border-neutral-200 bg-neutral-50/80 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-neutral-900">
              1. Ladies' Paired Size Matrix
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              When buying larger sizes in bulk, resellers must purchase an equal number of corresponding smaller sizes to avoid dead inventory:
            </p>
            <div className="space-y-2 text-xs">
              {LADIES_PAIRING_MATRIX.map((pair) => (
                <div
                  key={pair.primarySize}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 font-semibold"
                >
                  <span className="text-neutral-800 font-mono">Size {pair.primarySize} (Large)</span>
                  <span className="text-amber-600">↔ Requires 1:1</span>
                  <span className="text-neutral-800 font-mono">Size {pair.requiredSize} (Small)</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <span className="font-bold block">Standalone Small Size Exception:</span>
              <span>
                If a customer purchases ONLY Sizes 37, 38, or 39 alone, they can buy them individually without needing to buy larger paired sizes.
              </span>
            </div>
          </div>

          {/* Card 2: Men's Flexible Sizing */}
          <div className="p-6 rounded-3xl border border-neutral-200 bg-neutral-50/80 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-neutral-900">
              2. Men's Flexible Individual Sizing
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              For men's leather shoes, safari boots, and sneakers, buyers have total freedom to pick exact sizes between 40 and 45.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center font-bold">
              {['Size 40', 'Size 41', 'Size 42', 'Size 43', 'Size 44', 'Size 45'].map((s) => (
                <div key={s} className="p-2 rounded-xl bg-white border border-neutral-200 text-blue-700">
                  {s}
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              Order any combination that matches your shop's customer demographics.
            </p>
          </div>

          {/* Card 3: Free Size Assorted */}
          <div className="p-6 rounded-3xl border border-neutral-200 bg-neutral-50/80 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-neutral-900">
              3. Free Size / Assorted Cartons
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              For EVA cushion slides, flip-flops, and casual open sandals, shoes are pre-packed in master cartons with factory balanced size distribution.
            </p>
            <div className="p-3 bg-white rounded-2xl border border-neutral-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Selection Mode:</span>
                <span className="font-bold text-neutral-800">Open Quantity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Size Breakdown:</span>
                <span className="font-medium text-neutral-800">Pre-assorted by manufacturer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ideal For:</span>
                <span className="text-neutral-800">High-volume fast resale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Live Pairing Tester Simulator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Live Pairing Simulator
              </span>
              <h3 className="font-display text-xl font-bold mt-1">
                Test the Ladies' Pairing Matrix Interactively
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Adjust quantities below to see how the cart validator evaluates pairing balance in real-time.
              </p>
            </div>

            <div className="shrink-0">
              {isBalanced ? (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {smallOnly
                      ? 'Valid: Standalone Small Sizes'
                      : 'Valid: Sizing Matrix Balanced'}
                  </span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Unbalanced: Paired Small Sizes Needed</span>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Inputs for sizes 37 to 42 */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[37, 38, 39, 40, 41, 42].map((size) => (
              <div
                key={size}
                className="bg-neutral-800 p-3.5 rounded-2xl border border-neutral-700 text-center space-y-2"
              >
                <span className="text-xs font-bold text-neutral-300 block font-mono">Size {size}</span>
                <div className="text-lg font-mono font-bold text-white tabular-nums">
                  {testSizes[size] || 0}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateTestQty(size, -1)}
                    className="w-7 h-7 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white font-bold flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateTestQty(size, 1)}
                    className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-neutral-300 pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              {diff42_37 > 0 && (
                <span className="text-amber-400 mr-4 font-semibold">
                  • Size 42 has {diff42_37} extra pair(s) missing matching Size 37.
                </span>
              )}
              {diff41_38 > 0 && (
                <span className="text-amber-400 mr-4 font-semibold">
                  • Size 41 has {diff41_38} extra pair(s) missing matching Size 38.
                </span>
              )}
              {diff40_39 > 0 && (
                <span className="text-amber-400 font-semibold">
                  • Size 40 has {diff40_39} extra pair(s) missing matching Size 39.
                </span>
              )}
              {isBalanced && (
                <span className="text-emerald-400 font-medium">
                  ✓ Perfect balance. Reseller order is ready for instant checkout and dispatch!
                </span>
              )}
            </div>

            <button
              onClick={() =>
                setTestSizes({
                  42: 8,
                  37: 8,
                  41: 6,
                  38: 6,
                  40: 4,
                  39: 4,
                })
              }
              className="text-xs text-blue-400 hover:text-blue-300 font-bold underline"
            >
              Load Sample Balanced Carton (36 Pairs)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
