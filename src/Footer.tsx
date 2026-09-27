import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { MapPin, Phone, MessageSquare, ShieldCheck, Truck, ZoomIn } from 'lucide-react';
import { LogoLightboxModal } from './LogoLightboxModal';

interface FooterProps {
  storeSettings: StoreSettings;
  onNavigate: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ storeSettings, onNavigate }) => {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800 text-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Kisumu Hub */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                title="Tap to view full logo in high-res"
                className="group relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-blue-500/40 hover:ring-blue-500 shadow-md bg-neutral-900 flex items-center justify-center shrink-0 cursor-pointer focus:outline-none"
              >
                <img
                  src="/src/assets/images/blues_brand_logo_1790333662232.jpg"
                  alt="Blues Collection Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="text-left font-display font-extrabold text-lg text-white tracking-tight hover:text-blue-400 transition-colors focus:outline-none cursor-pointer"
              >
                Blues Collection
              </button>
            </div>
            <p className="text-neutral-500 leading-relaxed">
              Western Kenya's premier footwear wholesale distributor and retail marketplace. 95% wholesale direct-from-depot distribution to retail boutiques.
            </p>
            <div className="flex items-center gap-2 text-neutral-400">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Kisumu Main Bus Park, Central Stage Terminus, Kisumu</span>
            </div>
          </div>

          {/* Quick Wholesale Navigation */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Platform Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors"
                >
                  Wholesale Footwear Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('3d-studio')}
                  className="hover:text-white transition-colors"
                >
                  3D WebGL Studio & Sole Flex
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pairing-guide')}
                  className="hover:text-white transition-colors"
                >
                  Size Pairing & Matrix Rules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('store')}
                  className="hover:text-white transition-colors"
                >
                  Kisumu Depot & Physical Pickup
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-orders')}
                  className="hover:text-white transition-colors text-blue-400 font-semibold flex items-center gap-1.5"
                >
                  <span>My Orders & Parcel Hub</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-900/60 text-blue-300 text-[9px] font-mono">Jumia Style</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track-order')}
                  className="hover:text-white transition-colors"
                >
                  Track Bus Parcel Waybill
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('order-history')}
                  className="hover:text-white transition-colors text-blue-400 font-semibold"
                >
                  Orders & M-Pesa Statements
                </button>
              </li>
            </ul>
          </div>

          {/* Kisumu Contacts & Logistics */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Depot Contacts & Logistics
            </h4>
            <div className="space-y-1.5 font-mono">
              <p className="text-neutral-300">Call: {storeSettings.kisumuPhone1}</p>
              <p className="text-neutral-300">Office: {storeSettings.kisumuPhone2}</p>
              <p className="text-neutral-400 text-[11px] font-sans">
                Bus Parcel Departures: 4:00 PM Daily to Eldoret, Nairobi, Kakamega, Bungoma & Kisii.
              </p>
            </div>
            <a
              href={storeSettings.whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Join VIP Wholesale WhatsApp</span>
            </a>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Settlement & eTIMS Tax
            </h4>
            <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Buy Goods Till:</span>
                <span className="font-mono font-black text-emerald-400">{storeSettings.mpesaTill}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Paybill:</span>
                <span className="font-mono font-black text-emerald-400">{storeSettings.mpesaPaybill}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                <span>KRA PIN:</span>
                <span className="font-mono text-neutral-200">{storeSettings.kraPin}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Safaricom M-Pesa STK Push Instant Verification</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-600 text-[11px]">
          <div>
            © {new Date().getFullYear()} Blues Collection Wholesale & Retail. Kisumu, Kenya. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Guardian Angel</span>
            <span>·</span>
            <span>Easy Coach</span>
            <span>·</span>
            <span>Fargo Courier</span>
            <span>·</span>
            <span>Safaricom M-Pesa</span>
          </div>
        </div>
      </div>

      {/* Full-Screen Brand Logo Lightbox Modal */}
      <LogoLightboxModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </footer>
  );
};
