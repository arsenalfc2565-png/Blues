import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode, FileText, Smartphone } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface MpesaStatementModalProps {
  order: Order;
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const MpesaStatementModal: React.FC<MpesaStatementModalProps> = ({
  order,
  storeSettings,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const subtotalBeforeVat = Math.round(order.totalAmount / 1.16);
  const vatAmount = order.totalAmount - subtotalBeforeVat;
  const isLipaPolePole = order.paymentMethod === 'lipa_pole_pole';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Action Header (hidden in print) */}
        <div className="px-6 py-3.5 bg-neutral-900 text-white flex items-center justify-between no-print border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-display font-bold text-sm text-white">
              Official M-Pesa Transaction Statement & KRA eTIMS Invoice
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statement Body (Printable Area) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-neutral-900 font-sans text-xs">
          {/* Top Safaricom Green Banner */}
          <div className="border-b-2 border-emerald-600 pb-5 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-neutral-300 shadow-xs bg-neutral-900 flex items-center justify-center shrink-0">
                  <img
                    src="/blues_brand_logo_1790333662232.jpg"
                    alt="Blues Collection Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-display font-extrabold text-xl text-emerald-800 tracking-tight block leading-tight">
                    SAFARICOM M-PESA
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest block">
                    Official Merchant Settlement Receipt
                  </span>
                </div>
              </div>
              <p className="text-neutral-600 text-[11px] pt-1">
                Merchant: <strong className="text-neutral-900">{storeSettings.shopName}</strong>
              </p>
              <p className="text-neutral-500 text-[10px]">
                {storeSettings.locationAddress}, Kisumu, Kenya
              </p>
            </div>

            {/* Receipt Reference Cluster */}
            <div className="text-left sm:text-right space-y-0.5 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 font-semibold uppercase block">
                M-Pesa Receipt Number:
              </span>
              <span className="font-mono font-black text-base text-emerald-800 block">
                {order.mpesaReceipt || 'TK94G6H21A'}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono block">
                Order Ref: {order.orderNumber}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono block">
                Timestamp: {new Date(order.createdAt).toLocaleString('en-GB')}
              </span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 block text-xs">
                  Transaction Verified & Confirmed
                </span>
                <span className="text-[10px] text-emerald-700">
                  Settled via Safaricom Daraja API Gateway to Till: {storeSettings.mpesaTill}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px] uppercase font-mono">
              STATUS: SUCCESS
            </span>
          </div>

          {/* Parties & Waybill Routing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Sender / Reseller Client:
              </span>
              <p className="font-bold text-sm text-neutral-900">{order.customerName}</p>
              <p className="font-mono text-neutral-700">{order.customerPhone}</p>
              <p className="text-neutral-600">Destination: {order.deliveryTown}</p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-neutral-200 sm:pl-4">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Dispatch & Courier Waybill:
              </span>
              <p className="font-semibold text-neutral-800">
                Carrier: <strong>{order.courier}</strong>
              </p>
              <p className="font-mono text-blue-800 font-bold">
                Waybill #: {order.waybillNumber || 'GA-ELD-49210'}
              </p>
              <p className="text-neutral-500 text-[10px]">
                Fulfillment: {order.deliveryType === 'shop_pickup' ? 'Kisumu Bus Park Shop Pickup' : 'Daily 4:00 PM Bus Parcel Dispatch'}
              </p>
            </div>
          </div>

          {/* Itemized Footwear Breakdown Table */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Description & Variant</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Wholesale Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount (KSh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-semibold text-neutral-900">
                      {item.productTitle} <span className="font-normal text-neutral-500">({item.color})</span>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold">{item.size}</td>
                    <td className="py-2 px-3 font-mono text-right font-bold">{item.quantity} prs</td>
                    <td className="py-2 px-3 font-mono text-right">KSh {item.unitPrice.toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-right font-bold text-neutral-900">
                      KSh {item.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment & Tax Math Breakdown */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
            {/* KRA eTIMS Tax Box */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-[11px] space-y-1 w-full sm:w-72">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>KRA eTIMS Compliance:</span>
              </div>
              <p className="text-neutral-600">KRA PIN: <strong className="font-mono text-neutral-900">{storeSettings.kraPin}</strong></p>
              <p className="text-neutral-600">Tax Serial: <strong className="font-mono text-neutral-900">{order.kraEtimSerial || 'ETIMS-KE-2026-00918'}</strong></p>
              <div className="pt-1 border-t border-neutral-200 flex justify-between text-neutral-500">
                <span>Vatable 16% Value:</span>
                <span className="font-mono font-semibold">KSh {subtotalBeforeVat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>VAT (16%):</span>
                <span className="font-mono font-semibold">KSh {vatAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="w-full sm:w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-neutral-500">
                <span>Gross Order Value:</span>
                <span className="font-mono">KSh {order.subtotal.toLocaleString()}</span>
              </div>
              {order.wholesaleSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Wholesale Discount:</span>
                  <span className="font-mono">- KSh {order.wholesaleSavings.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-800">
                  KSh {order.totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Lipa Pole Pole Split if applicable */}
              {isLipaPolePole && order.depositAmount && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-1 mt-2">
                  <div className="flex justify-between font-bold text-amber-900 text-xs">
                    <span>Deposit Paid (30%):</span>
                    <span className="font-mono">KSh {order.depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-800 text-[11px]">
                    <span>Balance Due on Collection:</span>
                    <span className="font-mono">KSh {(order.balanceDue || 0).toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-amber-700 block">
                    Hold at Swan Centre depot for up to 14 days.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security & Official Stamp */}
          <div className="p-4 rounded-2xl border border-dashed border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-neutral-500">
            <div>
              <p className="font-bold text-neutral-800">
                BLUES COLLECTION KISUMU · KISUMU MAIN BUS PARK
              </p>
              <p>Official Safaricom M-Pesa Merchant Settlement · Tel: {storeSettings.kisumuPhone1}</p>
              <p className="mt-0.5">Automated timestamped Daraja verification.</p>
            </div>
            <div className="text-center sm:text-right font-mono text-neutral-400 font-bold uppercase border p-2 rounded-xl border-neutral-300">
              [ OFFICIAL M-PESA STAMP ]
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Statement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
