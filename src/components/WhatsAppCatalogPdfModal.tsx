import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  Printer,
  Share2,
  Download,
  Copy,
  Check,
  Smartphone,
  Phone,
  Building,
  ShieldCheck,
  Sparkles,
  Layers,
  ShoppingBag,
  Filter,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Info
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { Z_INDEX } from '../constants/zIndex';

interface WhatsAppCatalogPdfModalProps {
  products: Product[];
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppCatalogPdfModal: React.FC<WhatsAppCatalogPdfModalProps> = ({
  products,
  storeSettings,
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [includeDiscounts, setIncludeDiscounts] = useState(true);
  const [includePairingRules, setIncludePairingRules] = useState(true);
  const [includeMpesaPayment, setIncludeMpesaPayment] = useState(true);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Generate WhatsApp Text Broadcast message
  const generateWhatsAppBroadcastText = () => {
    let msg = `*👟 BLUES COLLECTION KISUMU — OFFICIAL WHOLESALE PRICE LIST*\n`;
    msg += `📍 *Depot:* ${storeSettings.locationAddress}\n`;
    msg += `📅 *Date:* ${currentDate} | *Daily Express Bus Parcels at 4:00 PM*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    filteredProducts.forEach((p, index) => {
      msg += `*${index + 1}. ${p.title.toUpperCase()}*\n`;
      msg += `🏷️ *Category:* ${p.category.toUpperCase()} | *Brand:* ${p.brand}\n`;
      msg += `💰 *Wholesale Price:* KSh ${p.wholesalePrice.toLocaleString()} / pair (MOQ: ${p.moq} pairs)\n`;
      msg += `🎯 *Suggested Retail:* KSh ${p.retailPrice.toLocaleString()} (Est. Profit: +KSh ${(p.retailPrice - p.wholesalePrice).toLocaleString()}/pair)\n`;
      if (p.sizingRuleType === 'paired_ladies' && includePairingRules) {
        msg += `⚖️ *Sizing:* Paired Ratio Enforced (42↔37, 41↔38, 40↔39) to prevent dead stock\n`;
      } else {
        msg += `📦 *Sizing:* Flexible Sizes (${p.variants?.map(v => v.size).join(', ') || '37-45'})\n`;
      }
      msg += `\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    if (includeMpesaPayment) {
      msg += `💳 *M-PESA PAYMENT DETAILS:*\n`;
      msg += `• Till (Buy Goods): *${storeSettings.mpesaTill}* (Blues Collection Wholesale)\n`;
      msg += `• Paybill: *${storeSettings.mpesaPaybill}* | Acc: *Your Name / Order No*\n\n`;
    }
    msg += `🚌 *County Parcel Delivery:* Dispatched daily to all 47 counties via Guardian Angel, Easy Coach, Fargo & North Rift.\n`;
    msg += `📲 *Order Online / Call Depot:* ${storeSettings.kisumuPhone1} / ${storeSettings.kisumuPhone2}\n`;
    msg += `💬 *Join WhatsApp VIP Group:* ${storeSettings.whatsappGroupUrl}\n`;

    return msg;
  };

  const handleCopyWhatsAppText = async () => {
    const text = generateWhatsAppBroadcastText();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBroadcast(true);
      setCopyError(false);
      setTimeout(() => setCopiedBroadcast(false), 2500);
    } catch (e) {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 4000);
    }
  };

  const handleShareToWhatsApp = () => {
    const text = generateWhatsAppBroadcastText();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 ${Z_INDEX.MODAL} overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 print:p-0 print:bg-white print:fixed print:inset-0`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-5xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto animate-in zoom-in-95 duration-200 print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none"
      >
        {/* Modal Top Header (Hidden in Print) */}
        <div className="px-6 py-4 bg-neutral-950 text-white border-b border-neutral-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                  B2B Reseller Export
                </span>
                <span className="text-xs text-neutral-400">PDF & WhatsApp Status Ready</span>
              </div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                Wholesale Catalog PDF & Price Sheet Auto-Exporter
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-500 font-semibold text-xs flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              All Categories ({products.length})
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
              Ladies' Heels & Wedges
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
              Men's Formal Loafers
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyWhatsAppText}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {copiedBroadcast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : copyError ? (
                <>
                  <Copy className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-red-700">Copy failed — select text manually</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Copy Broadcast Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareToWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-700/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Catalog Canvas */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs bg-neutral-50 print:bg-white print:p-0">
          {/* Printable Header Letterhead */}
          <div className="p-6 bg-neutral-900 text-white rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:bg-white print:text-black print:border-b-2 print:border-black print:rounded-none print:p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-neutral-700 flex items-center justify-center shrink-0">
                <img
                  src="/src/assets/images/blues_brand_logo_1790333662232.jpg"
                  alt="Blues Collection Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider print:border print:border-black print:bg-white print:text-black">
                  Official Wholesale B2B Price Sheet
                </span>
                <h1 className="font-display font-black text-xl sm:text-2xl text-white print:text-black mt-1">
                  Blues Collection Footwear Wholesale
                </h1>
                <p className="text-neutral-300 print:text-neutral-700 text-xs">
                  {storeSettings.locationAddress} · {storeSettings.landmark}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right space-y-1 font-mono text-[11px] text-neutral-300 print:text-black">
              <div><strong>Catalog Date:</strong> {currentDate}</div>
              <div><strong>Helpline:</strong> {storeSettings.kisumuPhone1}</div>
              <div><strong>Depot Dispatch:</strong> 4:00 PM Express Daily (Guardian / Easy Coach)</div>
              <div><strong>KRA PIN:</strong> {storeSettings.kraPin}</div>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="border border-neutral-300 rounded-2xl overflow-hidden bg-white shadow-xs print:border-black">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white border-b border-neutral-800 text-[10px] font-bold uppercase tracking-wider print:bg-neutral-200 print:text-black print:border-b">
                  <th className="p-3.5">Footwear Item & Specifications</th>
                  <th className="p-3.5">Category & Brand</th>
                  <th className="p-3.5 text-center">Sizing & Matrix Rules</th>
                  <th className="p-3.5 text-right">Wholesale Rate (MOQ 2)</th>
                  <th className="p-3.5 text-right">Suggested Retail</th>
                  <th className="p-3.5 text-right">Reseller Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 print:divide-neutral-400">
                {filteredProducts.map((p) => {
                  const profit = p.retailPrice - p.wholesalePrice;
                  const marginPct = Math.round((profit / p.retailPrice) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Product Preview */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-neutral-900 block text-xs">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-neutral-500 line-clamp-1 max-w-xs">
                              {p.description}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {p.allowedColors?.slice(0, 3).map((col) => (
                                <span key={col} className="px-1.5 py-0.2 rounded bg-neutral-100 border border-neutral-200 text-[9px] text-neutral-700 font-medium">
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="p-3.5">
                        <span className="font-bold text-neutral-800 block capitalize text-xs">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {p.brand}
                        </span>
                      </td>

                      {/* Sizing Rules */}
                      <td className="p-3.5 text-center">
                        {p.sizingRuleType === 'paired_ladies' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300 font-bold text-[10px]">
                            <ShieldCheck className="w-3 h-3 text-pink-600" />
                            <span>Paired (42/37, 41/38, 40/39)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-bold text-[10px]">
                            <span>Flexible (37-45)</span>
                          </span>
                        )}
                      </td>

                      {/* Wholesale Price */}
                      <td className="p-3.5 text-right font-mono font-black text-neutral-900 text-sm">
                        KSh {p.wholesalePrice.toLocaleString()}
                        <span className="text-[10px] text-neutral-500 block font-normal font-sans">
                          per pair (MOQ: {p.moq})
                        </span>
                      </td>

                      {/* Retail Price */}
                      <td className="p-3.5 text-right font-mono font-bold text-neutral-600">
                        KSh {p.retailPrice.toLocaleString()}
                        <span className="text-[10px] text-neutral-400 block font-normal font-sans">
                          recommended
                        </span>
                      </td>

                      {/* Reseller Profit */}
                      <td className="p-3.5 text-right font-mono font-black text-emerald-700">
                        +KSh {profit.toLocaleString()}
                        <span className="text-[10px] text-emerald-600 block font-normal font-sans">
                          {marginPct}% margin
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Payment & Logistics Terms Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-neutral-300 shadow-xs print:border-black">
            <div className="space-y-1">
              <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-700" />
                <span>M-Pesa Verified Payments</span>
              </h4>
              <p className="text-[11px] text-neutral-600 font-mono">
                • Till No: <strong>{storeSettings.mpesaTill}</strong> (Buy Goods)<br />
                • Paybill: <strong>{storeSettings.mpesaPaybill}</strong> (Acc: Your Name)
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-700" />
                <span>Daily Bus Parcel Courier</span>
              </h4>
              <p className="text-[11px] text-neutral-600">
                Dispatches at 4:00 PM Sharp to all 47 counties via Guardian Angel, Easy Coach, Fargo & North Rift.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Lipa Pole Pole Layaway</span>
              </h4>
              <p className="text-[11px] text-neutral-600">
                Pay 30% deposit to lock wholesale carton inventory, clear balance upon bus collection at your town stage.
              </p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center text-[11px] text-neutral-500 py-2 border-t border-neutral-200 print:text-black">
            Blues Collection Wholesale & Retail · Swan Centre, Kisumu Bus Park Depot · Hotline: {storeSettings.kisumuPhone1} · WhatsApp VIP: {storeSettings.whatsappGroupUrl}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
