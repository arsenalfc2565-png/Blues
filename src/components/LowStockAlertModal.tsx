import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  AlertTriangle,
  Package,
  Plus,
  ArrowRight,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react';
import { Product, ProductVariant, StoreSettings } from '../types';

interface LowStockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  storeSettings: StoreSettings;
  onRestockVariant: (productId: string, variantId: string, addedQuantity: number) => void;
  onOpenEditProduct: (product: Product) => void;
}

export const LowStockAlertModal: React.FC<LowStockAlertModalProps> = ({
  isOpen,
  onClose,
  products,
  storeSettings,
  onRestockVariant,
  onOpenEditProduct,
}) => {
  const [restockInput, setRestockInput] = useState<{ [key: string]: number }>({});
  const [restockSuccessNotice, setRestockSuccessNotice] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');

  if (!isOpen) return null;

  // Extract all low-stock variants
  const lowStockList: {
    product: Product;
    variant: ProductVariant;
    threshold: number;
    deficit: number;
    severity: 'critical' | 'warning';
  }[] = [];

  products.forEach((p) => {
    p.variants?.forEach((v) => {
      const threshold =
        v.lowStockThreshold ??
        p.defaultLowStockThreshold ??
        storeSettings.globalLowStockThreshold ??
        25;

      if (v.stockQuantity <= threshold) {
        const severity = v.stockQuantity <= Math.round(threshold * 0.4) ? 'critical' : 'warning';
        lowStockList.push({
          product: p,
          variant: v,
          threshold,
          deficit: threshold - v.stockQuantity,
          severity,
        });
      }
    });
  });

  const filteredItems = lowStockList.filter((item) => {
    if (filterSeverity === 'all') return true;
    return item.severity === filterSeverity;
  });

  const handleApplyRestock = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) return;
    onRestockVariant(productId, variantId, quantity);
    setRestockSuccessNotice(`Restocked +${quantity} pairs successfully!`);
    setTimeout(() => setRestockSuccessNotice(null), 3000);
  };

  // CSV Purchase Order Export
  const handleExportPurchaseOrder = () => {
    const headers = [
      'Product ID',
      'Footwear Model',
      'Brand',
      'Size',
      'Color',
      'SKU',
      'Current Stock',
      'Min Threshold',
      'Units to Replenish',
      'Factory Buying Cost (KSh)',
      'Estimated Reorder Cost (KSh)',
    ];

    const rows = lowStockList.map((item) => {
      const reorderQty = Math.max(24, item.threshold * 2 - item.variant.stockQuantity);
      const buyPrice = item.product.buyingPrice || 950;
      const reorderCost = reorderQty * buyPrice;

      return [
        `"${item.product.id}"`,
        `"${item.product.title}"`,
        `"${item.product.brand}"`,
        `"${item.variant.size}"`,
        `"${item.variant.color}"`,
        `"${item.variant.sku}"`,
        item.variant.stockQuantity,
        item.threshold,
        reorderQty,
        buyPrice,
        reorderCost,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Blues_Collection_Factory_Reorder_PO_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-neutral-900 text-white rounded-3xl max-w-4xl w-full border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-800/80 text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-black text-base text-white">
                  Low Stock & Factory Reorder Alert Hub
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 font-bold text-[10px] uppercase">
                  {lowStockList.length} Variants Below Threshold
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Sizes and colors that have dipped below admin minimum inventory safety levels.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success notification banner */}
        {restockSuccessNotice && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{restockSuccessNotice}</span>
          </div>
        )}

        {/* Filters and Actions Bar */}
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">Filter Severity:</span>
            <button
              type="button"
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                filterSeverity === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              All Alerts ({lowStockList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity('critical')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                filterSeverity === 'critical'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Critical Depletion (≤40% threshold)
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity('warning')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                filterSeverity === 'warning'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Safety Warning Level
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPurchaseOrder}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download factory reorder purchase order sheet for footwear suppliers"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Supplier PO (CSV)</span>
            </button>
          </div>
        </div>

        {/* Body Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-neutral-950 rounded-2xl border border-neutral-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-display font-bold text-base text-white">All Stock Levels Optimal!</h4>
              <p className="text-neutral-400 max-w-md mx-auto">
                No footwear sizes or colors are currently below their minimum stock thresholds.
              </p>
            </div>
          ) : (
            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-800 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                    <th className="p-3">Footwear Model</th>
                    <th className="p-3">Size & Color</th>
                    <th className="p-3 text-center">Remaining Stock</th>
                    <th className="p-3 text-center">Min Threshold</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredItems.map(({ product, variant, threshold, deficit, severity }) => {
                    const rowKey = `${product.id}-${variant.id}`;
                    const customAdd = restockInput[rowKey] || 24;

                    return (
                      <tr key={rowKey} className="hover:bg-neutral-900/50 transition-colors">
                        {/* Model */}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-9 h-9 rounded-lg object-cover bg-neutral-800 border border-neutral-700 shrink-0"
                            />
                            <div>
                              <strong className="text-white block font-medium">{product.title}</strong>
                              <span className="text-[10px] text-neutral-400">
                                {product.brand} · SKU: {variant.sku}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Size & Color */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 font-mono font-bold text-amber-400 text-xs">
                              Size {variant.size}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px]">
                              {variant.color}
                            </span>
                          </div>
                        </td>

                        {/* Current Stock */}
                        <td className="p-3 text-center">
                          <span
                            className={`font-mono font-black text-sm ${
                              severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                            }`}
                          >
                            {variant.stockQuantity} pairs
                          </span>
                        </td>

                        {/* Minimum Threshold */}
                        <td className="p-3 text-center font-mono text-neutral-400">
                          {threshold} pairs
                        </td>

                        {/* Status Badge */}
                        <td className="p-3 text-center">
                          {severity === 'critical' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800 text-[10px] font-bold uppercase">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              <span>Critical (-{deficit})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold uppercase">
                              <TrendingDown className="w-3 h-3 text-amber-400" />
                              <span>Low Stock (-{deficit})</span>
                            </span>
                          )}
                        </td>

                        {/* Quick Restock Tools */}
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Preset +24 pairs */}
                            <button
                              type="button"
                              onClick={() => handleApplyRestock(product.id, variant.id, 24)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Add 1 carton (24 pairs) to stock"
                            >
                              +24 prs
                            </button>

                            {/* Preset +48 pairs */}
                            <button
                              type="button"
                              onClick={() => handleApplyRestock(product.id, variant.id, 48)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Add 2 cartons (48 pairs) to stock"
                            >
                              +48 prs
                            </button>

                            {/* Edit model in full editor */}
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenEditProduct(product);
                              }}
                              className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Open full footwear editor"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-neutral-400">
            Automated alerts trigger when inventory drops below admin-defined minimum safety levels.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Alert Hub
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
