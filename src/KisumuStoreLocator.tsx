import React from 'react';
import { MapPin, Phone, Clock, Navigation, CheckCircle2, Truck, MessageSquare } from 'lucide-react';
import { StoreSettings } from '../types';

interface KisumuStoreLocatorProps {
  storeSettings: StoreSettings;
}

export const KisumuStoreLocator: React.FC<KisumuStoreLocatorProps> = ({ storeSettings }) => {
  return (
    <section className="py-16 bg-white border-b border-neutral-200" id="store-locator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Store Details & Pickup Info */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Kisumu Bus Park Physical Distribution Depot</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 tracking-normal">
              Visit Our Wholesale Depot & Walk-In Showroom at Kisumu Bus Park.
            </h2>

            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Wholesale boutique buyers and retail shoppers are welcome to visit our physical depot directly at Kisumu Bus Park main stage to inspect footwear quality, pick up reserved orders, or coordinate instant bus parcel loading across Kenya.
            </p>

            {/* Address & Landmark Card */}
            <div className="bg-neutral-50 rounded-3xl p-5 border border-neutral-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">Physical Depot Address:</h4>
                  <p className="text-xs text-neutral-700 mt-0.5 font-medium">{storeSettings.locationAddress}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Landmark: {storeSettings.landmark}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-neutral-200">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">Direct Dispatch Hotline:</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-mono font-bold text-neutral-800">
                    <a href={`tel:${storeSettings.kisumuPhone1}`} className="hover:text-blue-700 underline">
                      {storeSettings.kisumuPhone1}
                    </a>
                    <span>·</span>
                    <a href={`tel:${storeSettings.kisumuPhone2}`} className="hover:text-blue-700 underline">
                      {storeSettings.kisumuPhone2}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-neutral-200">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">Operating & Bus Dispatch Hours:</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">{storeSettings.workingHours}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://maps.google.com/?q=Kisumu+Bus+Park+Kisumu+Kenya"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-700/20 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Google Maps Directions</span>
              </a>

              <a
                href={storeSettings.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Join VIP WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Depot Visual Showcase & Bus Hubs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-neutral-200 shadow-xl bg-neutral-900 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80"
                alt="Blues Collection Kisumu Bus Park Footwear Distribution Depot"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-neutral-950/85 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-blue-400">Kisumu Bus Park Wholesale Depot</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    Open Mon-Sat
                  </span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Fast parcel dispatches loaded directly at Kisumu Bus Park into Guardian Angel, Easy Coach, and regional Matatu shuttle terminals at 4:00 PM sharp.
                </p>
              </div>
            </div>

            {/* Regional Bus Courier Desk Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
                <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="font-bold text-neutral-800 block">Guardian Angel</span>
                <span className="text-[10px] text-neutral-500">Departures 4:00 PM</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
                <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="font-bold text-neutral-800 block">Easy Coach</span>
                <span className="text-[10px] text-neutral-500">Mega City Terminal</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
                <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="font-bold text-neutral-800 block">Fargo Courier</span>
                <span className="text-[10px] text-neutral-500">Doorstep Delivery</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
                <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="font-bold text-neutral-800 block">Kisumu Shuttles</span>
                <span className="text-[10px] text-neutral-500">Express Matatus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
