import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Sparkles, ZoomIn, ShieldCheck } from 'lucide-react';
import brandLogoImg from '../assets/images/blues_brand_logo_1790333662232.jpg';

interface LogoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoSrc?: string;
}

export const LogoLightboxModal: React.FC<LogoLightboxModalProps> = ({
  isOpen,
  onClose,
  logoSrc = brandLogoImg,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Ensure page cannot accidentally get locked permanently
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedSrc = imageError ? brandLogoImg : (logoSrc || brandLogoImg);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resolvedSrc;
    link.download = 'blues_collection_logo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-neutral-900 text-white rounded-3xl max-w-lg w-full border border-neutral-700 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="font-display font-bold text-base text-white">
              Blues Collection Official Logo
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close lightbox"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Centerpiece Image Frame */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="relative group max-w-xs sm:max-w-sm w-full aspect-square rounded-3xl overflow-hidden ring-4 ring-blue-600/40 shadow-2xl shadow-blue-700/30 bg-black flex items-center justify-center">
            {!imageError ? (
              <img
                src={resolvedSrc}
                alt="Blues Collection Official Brand Logo"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              /* Fallback SVG Emblem if image is ever blocked */
              <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center text-5xl font-black font-display text-white shadow-xl shadow-blue-600/40 border border-blue-400/30">
                  B
                </div>
                <span className="mt-4 font-display font-black text-xl text-white tracking-wider">
                  BLUES COLLECTION
                </span>
                <span className="text-xs text-blue-400 font-semibold mt-1">
                  Kisumu Main Bus Park Depot
                </span>
              </div>
            )}

            {/* Subtle corner badge */}
            <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-bold text-neutral-300 border border-white/10 flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Official Brand Mark · Kisumu Bus Park</span>
            </div>
          </div>

          {/* Description & Typography */}
          <div className="mt-6 text-center space-y-2 max-w-md">
            <h4 className="font-display font-extrabold text-xl text-white tracking-tight">
              Blues Collection Footwear
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              An aerodynamic, winged letter <strong>"B"</strong> morphed with the sleek profile of a performance shoe sole, finished in vibrant sapphire blue, electric cobalt, and warm gold accents.
            </p>
          </div>

          {/* Brand Palette Swatches */}
          <div className="mt-6 pt-5 border-t border-neutral-800 w-full flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#1d4ed8] ring-1 ring-white/20" />
              <span className="font-mono">Sapphire Blue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#38bdf8] ring-1 ring-white/20" />
              <span className="font-mono">Electric Cyan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] ring-1 ring-white/20" />
              <span className="font-mono">Warm Gold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0a0a0a] ring-1 ring-white/20" />
              <span className="font-mono">Obsidian</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-500 font-medium">
            High-Resolution Vector Mark
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
