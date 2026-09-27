import React, { useState } from 'react';
import { X, Printer, Truck, FileText, CheckCircle2, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { Order, StoreSettings, CourierPartner } from '../types';

interface BusDispatchManifestModalProps {
  orders: Order[];
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const BusDispatchManifestModal: React.FC<BusDispatchManifestModalProps> = ({
  orders,
  storeSettings,
  isOpen,
  onClose,
}) => {
  const [selectedCarrier, setSelectedCarrier] = useState<CourierPartner | 'all'>('all');

  if (!isOpen) return null;

  // Filter orders for today's parcel dispatches
  const dispatchOrders = orders.filter((o) => {
    if (selectedCarrier !== 'all' && o.courier !== selectedCarrier) return false;
    return o.status === 'packing' || o.status === 'dispatched' || o.status === 'verified';
  });

  const totalCartons = dispatchOrders.reduce((sum, o) => {
    const pairs = o.items.reduce((s, it) => s + it.quantity, 0);
    return sum + Math.max(1, Math.ceil(pairs / 24));
  }, 0);

  const totalPairsDispatched = dispatchOrders.reduce((sum, o) => {
    return sum + o.items.reduce((s, it) => s + it.quantity, 0);
  }, 0);

  const totalDeclaredValue = dispatchOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header (No print) */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between no-print border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">
                  Daily 4:00 PM Bus Parcel Dispatch Manifest
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[11px] text-neutral-400">
                Official handover log for bus drivers & parcel clerks at Kisumu Main Bus Park
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value as any)}
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">All Carriers Combined</option>
              <option value="Guardian Angel">Guardian Angel Express</option>
              <option value="Easy Coach">Easy Coach Bus Services</option>
              <option value="Fargo Courier">Fargo Courier</option>
              <option value="Kisumu Matatu Shuttle">Kisumu Matatu Shuttles</option>
            </select>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Manifest Printable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-neutral-950 font-sans text-xs">
          {/* Manifest Top Heading */}
          <div className="border-b-2 border-neutral-900 pb-4 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight text-neutral-950">
                  BLUES COLLECTION KISUMU
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                  DAILY MANIFEST
                </span>
              </div>
              <p className="text-neutral-600 font-semibold text-xs mt-0.5">
                Official Bus Parcel Handoff Document & Courier Security Log
              </p>
              <p className="text-[11px] text-neutral-500">
                Kisumu Main Bus Park, Central Stage Terminus · Depot Hotline: {storeSettings.kisumuPhone1}
              </p>
            </div>

            <div className="text-left sm:text-right bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">DISPATCH SCHEDULE:</span>
              <span className="font-display font-black text-lg text-blue-900 block">4:00 PM DAILY</span>
              <span className="font-mono text-neutral-600 text-[11px]">Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Metric Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">CONSIGNMENTS:</span>
              <span className="font-mono font-black text-lg text-neutral-900">{dispatchOrders.length} Parcels</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">TOTAL CARTONS:</span>
              <span className="font-mono font-black text-lg text-blue-800">{totalCartons} Master Boxes</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">FOOTWEAR QUANTITY:</span>
              <span className="font-mono font-black text-lg text-neutral-900">{totalPairsDispatched} Pairs</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">DECLARED VALUE:</span>
              <span className="font-mono font-black text-lg text-emerald-700">KSh {totalDeclaredValue.toLocaleString()}</span>
            </div>
          </div>

          {/* Itemized Consignments Table */}
          <div className="border border-neutral-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-700 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-300">
                <tr>
                  <th className="py-2.5 px-3">Waybill #</th>
                  <th className="py-2.5 px-3">Carrier & Route</th>
                  <th className="py-2.5 px-3">Destination Town</th>
                  <th className="py-2.5 px-3">Receiver / Phone</th>
                  <th className="py-2.5 px-3 text-right">Pairs</th>
                  <th className="py-2.5 px-3 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {dispatchOrders.map((order, index) => {
                  const pairs = order.items.reduce((s, it) => s + it.quantity, 0);
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-mono font-black text-blue-900">
                        {order.waybillNumber || `GA-KIS-${index + 101}`}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-neutral-800">
                        {order.courier}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-950">
                        {order.deliveryTown}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold block">{order.customerName}</span>
                        <span className="font-mono text-neutral-600 text-[11px]">{order.customerPhone}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-right">
                        {pairs} prs
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right text-emerald-800 font-bold">
                        {order.paymentStatus === 'paid' ? 'PREPAID' : 'LIPA POLE POLE'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legal Handover Signature Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl border-2 border-dashed border-neutral-300 text-xs">
            <div className="space-y-3">
              <span className="font-bold text-neutral-800 uppercase text-[11px] block">
                Warehouse Dispatch Clerk Handover:
              </span>
              <p className="text-neutral-500">I certify all listed cartons have been verified for size-pairing integrity and sealed.</p>
              <div className="pt-4 border-b border-neutral-400">
                <span className="text-[10px] text-neutral-400">Dispatched By Name & Signature:</span>
              </div>
              <div className="text-[10px] text-neutral-400">Time of Handover: 3:45 PM EAT</div>
            </div>

            <div className="space-y-3 sm:border-l sm:border-neutral-300 sm:pl-6">
              <span className="font-bold text-neutral-800 uppercase text-[11px] block">
                Bus Driver / Courier Receiving Agent:
              </span>
              <p className="text-neutral-500">Received the above listed consignments in good condition for route transit.</p>
              <div className="pt-4 border-b border-neutral-400">
                <span className="text-[10px] text-neutral-400">Driver / Conductor Signature & Bus Registration No:</span>
              </div>
              <div className="text-[10px] text-neutral-400">Bus Registration: KDA ________</div>
            </div>
          </div>
        </div>

        {/* Footer actions no-print */}
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
            className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Daily Manifest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
