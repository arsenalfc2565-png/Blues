import React from 'react';
import { X, Printer, Truck, QrCode } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface ThermalWaybillLabelModalProps {
  order: Order;
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalWaybillLabelModal: React.FC<ThermalWaybillLabelModalProps> = ({
  order,
  storeSettings,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalPairs = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartons = Math.max(1, Math.ceil(totalPairs / 24));
  const estimatedWeightKg = (totalPairs * 0.85).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Header no-print */}
        <div className="px-5 py-3.5 bg-neutral-900 text-white flex items-center justify-between no-print border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <h3 className="font-display font-bold text-xs text-white">
              4×6" Thermal Courier Sticker Label ({order.courier})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4x6 Thermal Label Container */}
        <div className="p-6 bg-white text-neutral-950 font-sans text-xs space-y-4">
          {/* Label Outer Border simulating 4x6" sticker */}
          <div className="border-4 border-neutral-950 rounded-2xl p-4 space-y-3.5 bg-white shadow-sm">
            {/* Courier Banner & Waybill # */}
            <div className="flex items-center justify-between border-b-4 border-neutral-950 pb-2.5">
              <div>
                <span className="font-display font-black text-xl tracking-tight uppercase block leading-none">
                  {order.courier.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-600">
                  KENYA PARCEL EXPRESS
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-neutral-500 block">WAYBILL NUMBER:</span>
                <span className="font-mono font-black text-base text-blue-800 block">
                  {order.waybillNumber || 'GA-ELD-49210'}
                </span>
              </div>
            </div>

            {/* Destination Big Routing Block */}
            <div className="bg-neutral-950 text-white p-3 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-300">
                DESTINATION TERMINAL
              </span>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight">
                {order.deliveryTown}
              </h2>
              <span className="text-[10px] text-neutral-300">
                Daily 4:00 PM Dispatched from Kisumu Bus Park Depot
              </span>
            </div>

            {/* Consignee & Shipper Grid */}
            <div className="grid grid-cols-2 gap-2 p-2.5 border-2 border-neutral-950 rounded-xl text-[11px]">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-neutral-500 block">RECEIVER / CONSIGNEE:</span>
                <p className="font-bold text-sm leading-tight text-neutral-950">{order.customerName}</p>
                <p className="font-mono font-bold text-neutral-800 text-xs">{order.customerPhone}</p>
                <p className="text-[10px] text-neutral-600">{order.deliveryTown}</p>
              </div>

              <div className="space-y-0.5 border-l-2 border-neutral-300 pl-2">
                <span className="text-[9px] font-black uppercase text-neutral-500 block">SHIPPER / ORIGIN:</span>
                <p className="font-bold text-xs text-neutral-950">{storeSettings.shopName}</p>
                <p className="text-[10px] text-neutral-700">Kisumu Main Bus Park, Central Stage</p>
                <p className="font-mono text-[10px]">{storeSettings.kisumuPhone1}</p>
              </div>
            </div>

            {/* Pieces & Weight Strip */}
            <div className="grid grid-cols-3 gap-2 text-center border-b-2 border-neutral-950 pb-2 text-[10px] font-bold">
              <div className="bg-neutral-100 p-1.5 rounded-lg">
                <span className="text-neutral-500 block text-[9px]">TOTAL PAIRS:</span>
                <span className="text-xs font-mono font-black">{totalPairs} Pairs</span>
              </div>
              <div className="bg-neutral-100 p-1.5 rounded-lg">
                <span className="text-neutral-500 block text-[9px]">CARTONS:</span>
                <span className="text-xs font-mono font-black">{totalCartons} Master Box</span>
              </div>
              <div className="bg-neutral-100 p-1.5 rounded-lg">
                <span className="text-neutral-500 block text-[9px]">EST. WEIGHT:</span>
                <span className="text-xs font-mono font-black">{estimatedWeightKg} KG</span>
              </div>
            </div>

            {/* Realistic Barcode Graphic (SVG Vector) */}
            <div className="flex flex-col items-center justify-center pt-1 space-y-1">
              <svg className="w-full h-14" viewBox="0 0 280 60">
                {/* Code 128 Bars Simulation */}
                <rect x="10" y="0" width="3" height="48" fill="#000" />
                <rect x="15" y="0" width="2" height="48" fill="#000" />
                <rect x="20" y="0" width="5" height="48" fill="#000" />
                <rect x="28" y="0" width="2" height="48" fill="#000" />
                <rect x="33" y="0" width="4" height="48" fill="#000" />
                <rect x="40" y="0" width="2" height="48" fill="#000" />
                <rect x="45" y="0" width="6" height="48" fill="#000" />
                <rect x="54" y="0" width="3" height="48" fill="#000" />
                <rect x="60" y="0" width="2" height="48" fill="#000" />
                <rect x="66" y="0" width="5" height="48" fill="#000" />
                <rect x="74" y="0" width="3" height="48" fill="#000" />
                <rect x="80" y="0" width="2" height="48" fill="#000" />
                <rect x="85" y="0" width="4" height="48" fill="#000" />
                <rect x="92" y="0" width="6" height="48" fill="#000" />
                <rect x="101" y="0" width="3" height="48" fill="#000" />
                <rect x="107" y="0" width="2" height="48" fill="#000" />
                <rect x="112" y="0" width="5" height="48" fill="#000" />
                <rect x="120" y="0" width="2" height="48" fill="#000" />
                <rect x="125" y="0" width="4" height="48" fill="#000" />
                <rect x="132" y="0" width="3" height="48" fill="#000" />
                <rect x="138" y="0" width="6" height="48" fill="#000" />
                <rect x="147" y="0" width="2" height="48" fill="#000" />
                <rect x="152" y="0" width="4" height="48" fill="#000" />
                <rect x="159" y="0" width="3" height="48" fill="#000" />
                <rect x="165" y="0" width="2" height="48" fill="#000" />
                <rect x="170" y="0" width="5" height="48" fill="#000" />
                <rect x="178" y="0" width="3" height="48" fill="#000" />
                <rect x="184" y="0" width="4" height="48" fill="#000" />
                <rect x="191" y="0" width="2" height="48" fill="#000" />
                <rect x="196" y="0" width="6" height="48" fill="#000" />
                <rect x="205" y="0" width="3" height="48" fill="#000" />
                <rect x="211" y="0" width="2" height="48" fill="#000" />
                <rect x="216" y="0" width="5" height="48" fill="#000" />
                <rect x="224" y="0" width="3" height="48" fill="#000" />
                <rect x="230" y="0" width="4" height="48" fill="#000" />
                <rect x="237" y="0" width="2" height="48" fill="#000" />
                <rect x="242" y="0" width="6" height="48" fill="#000" />
                <rect x="251" y="0" width="3" height="48" fill="#000" />
                <rect x="257" y="0" width="2" height="48" fill="#000" />
                <rect x="262" y="0" width="5" height="48" fill="#000" />
              </svg>
              <span className="font-mono font-bold tracking-widest text-[11px] text-neutral-800">
                *{order.waybillNumber || 'GA-ELD-49210'}*
              </span>
            </div>

            {/* Bottom Footer Stamp */}
            <div className="flex items-center justify-between text-[9px] text-neutral-500 pt-1 border-t border-neutral-300">
              <span>SECURITY SEALED CARRIER LABEL</span>
              <span>KISUMU CENTRAL BUS PARK DESK</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print 4×6" Sticker Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
