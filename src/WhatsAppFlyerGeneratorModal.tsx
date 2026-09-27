import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Square,
  FileText,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Truck,
  ShieldCheck,
  Palette,
  Layers,
  Image as ImageIcon,
  Printer,
  ChevronDown
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface WhatsAppFlyerGeneratorModalProps {
  product: Product | null;
  allProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
}

export const WhatsAppFlyerGeneratorModal: React.FC<WhatsAppFlyerGeneratorModalProps> = ({
  product: initialProduct,
  allProducts,
  isOpen,
  onClose,
  storeSettings,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct);

  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
    } else if (allProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(allProducts[0]);
    }
  }, [initialProduct, allProducts]);

  // Flyer Customization State
  const [flyerFormat, setFlyerFormat] = useState<'status' | 'square' | 'card'>('status'); // 9:16 status vs 1:1 square vs price card
  const [resellerName, setResellerName] = useState('My Footwear Boutique');
  const [resellerPhone, setResellerPhone] = useState(storeSettings.kisumuPhone1 || '+254 712 345 678');
  const [resellerTown, setResellerTown] = useState('Eldoret CBD & Western Towns');
  const [customPrice, setCustomPrice] = useState<number>(
    initialProduct?.retailPrice || 2800
  );
  const [theme, setTheme] = useState<'midnight' | 'kisumu_blue' | 'safari_emerald' | 'crimson_luxe'>('midnight');
  const [showWholesaleBadge, setShowWholesaleBadge] = useState(true);
  const [showDispatchStamp, setShowDispatchStamp] = useState(true);
  const [showColorPills, setShowColorPills] = useState(true);
  const [showSizeRange, setShowSizeRange] = useState(true);
  const [customPitchNote, setCustomPitchNote] = useState('Top Grade Italian Quality · Limited Stock Available');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Sync custom price when product changes
  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.retailPrice);
    }
  }, [selectedProduct]);

  // Available colors for the selected product
  const productColors = useMemo<string[]>(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.allowedColors && selectedProduct.allowedColors.length > 0) {
      return selectedProduct.allowedColors;
    }
    const variantCols = Array.from(new Set(selectedProduct.variants.map((v) => v.color || 'Standard')));
    return variantCols.length > 0 ? variantCols : ['Classic Black', 'Cognac Tan'];
  }, [selectedProduct]);

  // Available sizes for the selected product
  const productSizes = useMemo<string>(() => {
    if (!selectedProduct) return 'All Sizes';
    if (selectedProduct.sizingRuleType === 'free_size') return 'Free Size Assorted Carton';
    const sizes = Array.from(new Set(selectedProduct.variants.map((v) => v.size))).filter(Boolean);
    if (sizes.length > 0) {
      return `Sizes ${sizes.join(', ')}`;
    }
    return selectedProduct.sizingRuleType === 'paired_ladies' ? 'Sizes 37, 38, 39, 40, 41, 42' : 'Sizes 40, 41, 42, 43, 44, 45';
  }, [selectedProduct]);

  // Wholesale buying price and profit calculation
  const wholesaleBuyPrice = selectedProduct?.wholesalePrice ?? Math.round((selectedProduct?.retailPrice || 2800) * 0.6);
  const unitProfit = Math.max(0, customPrice - wholesaleBuyPrice);
  const profitMarginPercent = wholesaleBuyPrice > 0 ? Math.round((unitProfit / wholesaleBuyPrice) * 100) : 0;

  // Clean phone number for WhatsApp links
  const cleanPhone = resellerPhone.replace(/[^0-9]/g, '');
  const formattedWaPhone = cleanPhone.startsWith('0') ? `254${cleanPhone.substring(1)}` : cleanPhone;

  // Generate WhatsApp text message pitch
  const generateWhatsAppCaption = () => {
    if (!selectedProduct) return '';
    return `🔥 *HOT NEW ARRIVAL: ${selectedProduct.title.toUpperCase()}* 🔥
✨ *Brand:* ${selectedProduct.brand} (${selectedProduct.category.toUpperCase()})
💰 *Special Resale Price:* KSh ${customPrice.toLocaleString()}/-
${showWholesaleBadge ? `📦 *Wholesale Bulk (2+ Pairs):* Discount Available!` : ''}

🎨 *Available Colors:* ${productColors.join(', ')}
👟 *Available Sizes:* ${productSizes}

⭐ *Product Highlights:*
• ${selectedProduct.description ? selectedProduct.description.replace(/[*#<u>[\]]/g, '') : 'Premium durable material with cushioned sole comfort.'}
• ${customPitchNote}

🚚 *Direct Bus Parcel Courier Dispatch* daily from Kisumu to all towns!
📲 *To Order / Inquire Now:* Tap https://wa.me/${formattedWaPhone}?text=Hello%20${encodeURIComponent(resellerName)},%20I%20want%20to%20order%20${encodeURIComponent(selectedProduct.title)}%20(Price:%20KSh%20${customPrice})`;
  };

  const handleCopyCaption = () => {
    const caption = generateWhatsAppCaption();
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleOpenWhatsAppShare = () => {
    const caption = generateWhatsAppCaption();
    const url = `https://wa.me/?text=${encodeURIComponent(caption)}`;
    window.open(url, '_blank');
  };

  // Canvas-based image generator and download
  const handleDownloadFlyerImage = async () => {
    if (!selectedProduct) return;
    setIsGeneratingImage(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions based on format
      const width = flyerFormat === 'status' ? 1080 : flyerFormat === 'square' ? 1080 : 1200;
      const height = flyerFormat === 'status' ? 1920 : flyerFormat === 'square' ? 1080 : 900;
      canvas.width = width;
      canvas.height = height;

      // Theme background colors
      let bgGradStart = '#0f172a';
      let bgGradEnd = '#020617';
      let accentColor = '#38bdf8';
      let accentGold = '#f59e0b';

      if (theme === 'kisumu_blue') {
        bgGradStart = '#1e3a8a';
        bgGradEnd = '#0f172a';
        accentColor = '#60a5fa';
        accentGold = '#fbbf24';
      } else if (theme === 'safari_emerald') {
        bgGradStart = '#064e3b';
        bgGradEnd = '#022c22';
        accentColor = '#34d399';
        accentGold = '#fde047';
      } else if (theme === 'crimson_luxe') {
        bgGradStart = '#7f1d1d';
        bgGradEnd = '#450a0a';
        accentColor = '#f87171';
        accentGold = '#facc15';
      }

      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, bgGradStart);
      grad.addColorStop(1, bgGradEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle decorative circle glows
      ctx.fillStyle = `${accentColor}15`;
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.2, 350, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `${accentGold}10`;
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.8, 300, 0, Math.PI * 2);
      ctx.fill();

      // Top Reseller Header Pill
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      roundRect(ctx, 60, 60, width - 120, 110, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(resellerName.toUpperCase(), 100, 115);

      ctx.fillStyle = accentColor;
      ctx.font = '600 24px sans-serif';
      ctx.fillText(`📍 ${resellerTown} · 📲 ${resellerPhone}`, 100, 150);

      // Load Product Image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedProduct.imageUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if CORS fails
      });

      // Product Image Frame
      const imgBoxY = flyerFormat === 'status' ? 200 : 200;
      const imgBoxHeight = flyerFormat === 'status' ? 880 : flyerFormat === 'square' ? 520 : 480;
      const imgBoxWidth = width - 120;

      ctx.save();
      ctx.fillStyle = '#0b0f19';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      roundRect(ctx, 60, imgBoxY, imgBoxWidth, imgBoxHeight, 32);
      ctx.fill();
      ctx.stroke();
      ctx.clip();

      if (img.complete && img.naturalWidth > 0) {
        // Draw image covering box
        ctx.drawImage(img, 60, imgBoxY, imgBoxWidth, imgBoxHeight);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(60, imgBoxY, imgBoxWidth, imgBoxHeight);
      }
      ctx.restore();

      // Price Tag Pill (Overlaid on image corner)
      const priceY = imgBoxY + imgBoxHeight - 110;
      ctx.fillStyle = '#0f172aee';
      ctx.strokeStyle = accentGold;
      ctx.lineWidth = 4;
      roundRect(ctx, 90, priceY, 380, 85, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('SPECIAL OFFER', 115, priceY + 32);

      ctx.fillStyle = accentGold;
      ctx.font = '900 42px monospace';
      ctx.fillText(`KSh ${customPrice.toLocaleString()}`, 115, priceY + 70);

      // Product Title & Brand
      const contentY = imgBoxY + imgBoxHeight + 50;
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(selectedProduct.brand.toUpperCase(), 70, contentY);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      const cleanTitle = selectedProduct.title.length > 36 ? selectedProduct.title.substring(0, 34) + '...' : selectedProduct.title;
      ctx.fillText(cleanTitle, 70, contentY + 55);

      // Colors & Sizes Info Strip
      let curY = contentY + 110;

      if (showColorPills) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`🎨 Available Colors: ${productColors.slice(0, 4).join(' · ')}`, 70, curY);
        curY += 45;
      }

      if (showSizeRange) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 24px sans-serif';
        ctx.fillText(`👟 ${productSizes}`, 70, curY);
        curY += 55;
      }

      // Trust Footer Strip
      const footerY = height - 140;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      roundRect(ctx, 60, footerY, width - 120, 95, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`🚚 Same-Day Kisumu 4:00 PM Bus Parcel Courier Dispatch`, 90, footerY + 40);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 20px sans-serif';
      ctx.fillText(`Order via WhatsApp: ${resellerPhone} · Fast Delivery Across Kenya`, 90, footerY + 72);

      // Convert canvas to downloadable blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedProduct.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-whatsapp-flyer.png`;
        link.click();
        URL.revokeObjectURL(url);
        setIsGeneratingImage(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating flyer image:', err);
      setIsGeneratingImage(false);
    }
  };

  // Canvas helper for rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  if (!isOpen || !selectedProduct) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-neutral-900 text-white rounded-3xl max-w-5xl w-full border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Fixed Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                  Reseller Growth Kit
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs text-neutral-300 font-semibold">1-Click WhatsApp Ready</span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                WhatsApp Product Flyer & Price Card Generator
              </h3>
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

        {/* Modal Body: 2 Columns (Left: Customizer Controls, Right: Live Interactive Flyer Preview) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left Column: Reseller Customizer Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Select Shoe Model */}
            <div className="space-y-1.5">
              <label className="text-neutral-300 font-bold flex items-center justify-between">
                <span>Select Shoe Model to Promote:</span>
                <span className="text-neutral-500 font-normal">({allProducts.length} models)</span>
              </label>
              <select
                value={selectedProduct.id}
                onChange={(e) => {
                  const found = allProducts.find((p) => p.id === e.target.value);
                  if (found) setSelectedProduct(found);
                }}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {allProducts.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.title} ({prod.brand} · KSh {prod.wholesalePrice || prod.retailPrice})
                  </option>
                ))}
              </select>
            </div>

            {/* Flyer Aspect Ratio Format */}
            <div className="space-y-1.5">
              <label className="text-neutral-300 font-bold block">Flyer Format & Ratio:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFlyerFormat('status')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    flyerFormat === 'status'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="font-bold text-[11px]">WhatsApp Status</span>
                  <span className="text-[9px] text-neutral-500">9:16 Story</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlyerFormat('square')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    flyerFormat === 'square'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Square className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Post / DP</span>
                  <span className="text-[9px] text-neutral-500">1:1 Square</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlyerFormat('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    flyerFormat === 'card'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Price Card</span>
                  <span className="text-[9px] text-neutral-500">Compact Sheet</span>
                </button>
              </div>
            </div>

            {/* Reseller Branding Settings */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <label className="text-neutral-200 font-bold flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Reseller Boutique Branding:</span>
              </label>

              <div>
                <span className="text-neutral-400 block mb-1 text-[11px]">Boutique / Business Name:</span>
                <input
                  type="text"
                  value={resellerName}
                  onChange={(e) => setResellerName(e.target.value)}
                  placeholder="e.g. Achieng Mega Shoes"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-400 block mb-1 text-[11px]">WhatsApp Contact:</span>
                  <input
                    type="text"
                    value={resellerPhone}
                    onChange={(e) => setResellerPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-neutral-400 block mb-1 text-[11px]">Town / Location:</span>
                  <input
                    type="text"
                    value={resellerTown}
                    onChange={(e) => setResellerTown(e.target.value)}
                    placeholder="Eldoret CBD"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Price & Profit Margin Calculator */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-neutral-200 font-bold flex items-center gap-1.5 text-xs">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Your Selling Price & Profit Margin:</span>
                </label>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono font-bold text-[10px]">
                  +{profitMarginPercent}% Margin
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 block mb-1 text-[11px]">Wholesale Buy Price:</span>
                  <div className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 font-mono font-bold text-xs">
                    KSh {wholesaleBuyPrice.toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-emerald-400 block mb-1 text-[11px] font-bold">Your Retail Price (KSh):</span>
                  <input
                    type="number"
                    value={customPrice || ''}
                    onChange={(e) => setCustomPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-emerald-600 rounded-xl text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-900 flex items-center justify-between text-[11px]">
                <span className="text-neutral-300">Your Net Profit Per Pair:</span>
                <span className="font-mono font-black text-emerald-400">
                  +KSh {unitProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Flyer Color Themes */}
            <div className="space-y-1.5">
              <label className="text-neutral-300 font-bold flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-400" />
                <span>Flyer Visual Theme:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('midnight')}
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    theme === 'midnight'
                      ? 'bg-neutral-800 border-blue-400 text-white shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-2 ring-blue-500 shrink-0" />
                  <span className="font-semibold text-xs">Midnight Slate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('kisumu_blue')}
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    theme === 'kisumu_blue'
                      ? 'bg-neutral-800 border-blue-400 text-white shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-700 ring-2 ring-blue-400 shrink-0" />
                  <span className="font-semibold text-xs">Kisumu Royal Blue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('safari_emerald')}
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    theme === 'safari_emerald'
                      ? 'bg-neutral-800 border-emerald-400 text-white shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 ring-2 ring-emerald-400 shrink-0" />
                  <span className="font-semibold text-xs">Safari Emerald</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('crimson_luxe')}
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    theme === 'crimson_luxe'
                      ? 'bg-neutral-800 border-red-400 text-white shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-red-700 ring-2 ring-red-400 shrink-0" />
                  <span className="font-semibold text-xs">Crimson Luxe</span>
                </button>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2 pt-1">
              <label className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider block">
                Display Badges on Flyer:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowColorPills(!showColorPills)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showColorPills ? 'bg-blue-950 border-blue-700 text-blue-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}
                >
                  {showColorPills && <Check className="w-3 h-3" />}
                  <span>Allowed Colors</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSizeRange(!showSizeRange)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showSizeRange ? 'bg-blue-950 border-blue-700 text-blue-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}
                >
                  {showSizeRange && <Check className="w-3 h-3" />}
                  <span>Available Sizes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDispatchStamp(!showDispatchStamp)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showDispatchStamp ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}
                >
                  {showDispatchStamp && <Check className="w-3 h-3" />}
                  <span>Bus Dispatch Stamp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Flyer Graphic & Quick Pitch Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-neutral-300 font-bold flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Live Flyer Preview ({flyerFormat.toUpperCase()}):</span>
              </label>

              <span className="text-[11px] text-neutral-500 font-mono">
                Auto-rendered for WhatsApp Status & Stories
              </span>
            </div>

            {/* Flyer Canvas / Mockup Container */}
            <div className="flex justify-center bg-neutral-950 p-4 rounded-3xl border border-neutral-800 overflow-hidden shadow-inner">
              <div
                className={`w-full transition-all duration-300 rounded-2xl overflow-hidden border shadow-2xl flex flex-col justify-between p-5 relative ${
                  flyerFormat === 'status'
                    ? 'max-w-[340px] min-h-[580px]'
                    : flyerFormat === 'square'
                    ? 'max-w-[400px] aspect-square'
                    : 'max-w-[460px] min-h-[420px]'
                } ${
                  theme === 'midnight'
                    ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-black border-slate-700 text-white'
                    : theme === 'kisumu_blue'
                    ? 'bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 border-blue-600 text-white'
                    : theme === 'safari_emerald'
                    ? 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 border-emerald-600 text-white'
                    : 'bg-gradient-to-br from-red-900 via-red-950 to-neutral-950 border-red-600 text-white'
                }`}
              >
                {/* Flyer Top Header Banner */}
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-display font-black text-xs sm:text-sm tracking-tight text-white block truncate uppercase">
                      {resellerName}
                    </span>
                    <span className="text-[10px] text-white/80 font-medium block truncate">
                      📍 {resellerTown} · 📲 {resellerPhone}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black text-[9px] uppercase tracking-wider shrink-0 shadow-xs">
                    Original
                  </span>
                </div>

                {/* Main Product Image with Floating Price Pill */}
                <div className="relative my-3 rounded-2xl overflow-hidden bg-black/40 border border-white/15 flex-1 min-h-[180px] max-h-[260px] flex items-center justify-center group">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2.5 left-2.5 bg-neutral-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-400/80 shadow-lg">
                    <span className="text-[9px] uppercase font-bold text-amber-300 block tracking-widest leading-none">
                      HOT PRICE:
                    </span>
                    <span className="font-display font-black text-lg text-white font-mono leading-tight">
                      KSh {customPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Brand Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-[10px] font-bold text-white uppercase">
                    {selectedProduct.brand}
                  </div>
                </div>

                {/* Product Title & Specifications Strip */}
                <div className="space-y-2 bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <div>
                    <h4 className="font-display font-black text-sm sm:text-base text-white line-clamp-1 leading-tight">
                      {selectedProduct.title}
                    </h4>
                    <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5">
                      {selectedProduct.description ? selectedProduct.description.replace(/[*#<u>[\]]/g, '') : customPitchNote}
                    </p>
                  </div>

                  {/* Allowed Colors Swatches */}
                  {showColorPills && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-amber-300 font-bold">Colors:</span>
                      {productColors.slice(0, 4).map((col) => (
                        <span
                          key={col}
                          className="px-2 py-0.5 rounded-md bg-white/15 border border-white/20 text-[10px] font-semibold text-white truncate max-w-[100px]"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Size Range Pill */}
                  {showSizeRange && (
                    <div className="flex items-center gap-1.5 text-[10px] text-white/90">
                      <span className="text-emerald-400 font-bold">Sizes:</span>
                      <span className="font-mono">{productSizes}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Trust & Contact Bar */}
                {showDispatchStamp && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-between text-[10px] text-emerald-200">
                    <span className="flex items-center gap-1 font-bold">
                      <Truck className="w-3 h-3 text-emerald-400" />
                      <span>Same-Day 4:00 PM Bus Parcel Dispatch</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-300">Countrywide</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar: Download Image / WhatsApp Share / Copy Caption */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyCaption}
                className="px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {copiedCaption ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                <span>{copiedCaption ? 'Copied WhatsApp Text!' : 'Copy Formatted Pitch Text'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadFlyerImage}
                  disabled={isGeneratingImage}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>{isGeneratingImage ? 'Generating PNG...' : 'Download Image Poster'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsAppShare}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Directly to WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span>
            Generates high-resolution PNG flyers branded for your business. Share on WhatsApp Status, Groups & Instagram.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
