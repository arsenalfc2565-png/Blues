import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Download, FileText, ShieldCheck, DollarSign, Package, Truck, CheckCircle2 } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface FullOrdersPdfReportModalProps {
  orders: Order[];
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  reportTitle?: string;
}

export const FullOrdersPdfReportModal: React.FC<FullOrdersPdfReportModalProps> = ({
  orders,
  storeSettings,
  isOpen,
  onClose,
  reportTitle = 'Wholesale Footwear Master Orders & Financial Ledger',
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Financial Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPairsSold = orders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );
  const totalWholesaleSavings = orders.reduce((sum, o) => sum + (o.wholesaleSavings || 0), 0);
  const totalDepositCollected = orders.reduce((sum, o) => sum + (o.depositAmount || 0), 0);
  const totalReceivablesDue = orders.reduce((sum, o) => sum + (o.balanceDue || 0), 0);
  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-5xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white border-b border-neutral-800 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-900 border border-blue-700 text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-md">
                  Admin Financial Export
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs text-neutral-300 font-semibold">{orders.length} Verified Records</span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Orders Master Ledger & PDF Report
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF Canvas Body */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-xs bg-white text-neutral-950 font-sans print:p-0 print:overflow-visible">
          {/* Company & Fiscal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-neutral-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight text-neutral-950 uppercase">
                  {storeSettings.shopName}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-extrabold text-[10px] uppercase">
                  Kisumu Depot Hub
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                {storeSettings.locationAddress} · {storeSettings.landmark}, {storeSettings.city}
              </p>
              <p className="text-xs text-neutral-500 font-mono">
                Phone: {storeSettings.kisumuPhone1} · WhatsApp: {storeSettings.whatsappNumber}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">FISCAL COMPLIANCE</span>
              <p className="font-mono text-xs font-bold text-neutral-900">
                KRA PIN: <strong>{storeSettings.kraPin}</strong>
              </p>
              <p className="font-mono text-xs text-neutral-700">
                M-Pesa Till: <strong>{storeSettings.mpesaTill}</strong> · Paybill: {storeSettings.mpesaPaybill}
              </p>
              <p className="text-[10px] text-neutral-500">Statement Date: {currentDate}</p>
            </div>
          </div>

          {/* Report Title & Scope */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-lg text-neutral-900 uppercase">
                {reportTitle}
              </h2>
              <p className="text-xs text-neutral-500">
                Audited transaction list for accounting, KRA eTIMS filing & inventory reconciliation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
              STATUS: AUDITED & RECONCILED
            </span>
          </div>

          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-0.5">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">TOTAL REVENUE:</span>
              <p className="font-mono font-black text-lg text-neutral-900">
                KSh {totalRevenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-500">{orders.length} Total Orders</span>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-0.5">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">TOTAL PAIRS SOLD:</span>
              <p className="font-mono font-black text-lg text-blue-900">
                {totalPairsSold} Pairs
              </p>
              <span className="text-[10px] text-blue-700">Wholesale & Retail Volume</span>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-0.5">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">LIPA POLE POLE BOOKINGS:</span>
              <p className="font-mono font-black text-lg text-amber-800">
                KSh {totalDepositCollected.toLocaleString()}
              </p>
              <span className="text-[10px] text-amber-700">Due on Collection: KSh {totalReceivablesDue.toLocaleString()}</span>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-0.5">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">AVERAGE ORDER VALUE:</span>
              <p className="font-mono font-black text-lg text-emerald-900">
                KSh {averageOrderValue.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-700">Volume Savings: KSh {totalWholesaleSavings.toLocaleString()}</span>
            </div>
          </div>

          {/* Full Itemized Orders Table */}
          <div className="border border-neutral-300 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-2.5">Order #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Buyer & Contact</th>
                  <th className="p-2.5">Destination & Courier</th>
                  <th className="p-2.5">Items & Sizes Breakdown</th>
                  <th className="p-2.5 text-center">Pairs</th>
                  <th className="p-2.5 text-right">Amount (KSh)</th>
                  <th className="p-2.5 text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {orders.map((order, idx) => {
                  const isLipa = order.paymentMethod === 'lipa_pole_pole';
                  const totalPairs = order.items.reduce((s, it) => s + it.quantity, 0);

                  return (
                    <tr key={order.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'}>
                      {/* Order Number & Waybill */}
                      <td className="p-2.5 font-mono font-bold text-blue-900 align-top">
                        {order.orderNumber}
                        {order.waybillNumber && (
                          <span className="block text-[9px] text-neutral-500 font-mono">
                            WB: {order.waybillNumber}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-2.5 text-neutral-600 whitespace-nowrap align-top">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>

                      {/* Buyer */}
                      <td className="p-2.5 align-top">
                        <strong className="text-neutral-900 block">{order.customerName}</strong>
                        <span className="text-[10px] text-neutral-500 font-mono">{order.customerPhone}</span>
                      </td>

                      {/* Destination */}
                      <td className="p-2.5 align-top">
                        <span className="text-neutral-900 font-semibold block">{order.deliveryTown}</span>
                        <span className="text-[10px] text-neutral-500">via {order.courier}</span>
                      </td>

                      {/* Items Detailed */}
                      <td className="p-2.5 align-top space-y-0.5">
                        {order.items.map((it, iIdx) => (
                          <div key={iIdx} className="text-[10px] text-neutral-700">
                            • {it.productTitle} · Sz <strong>{it.size}</strong> ({it.color}) × {it.quantity}
                          </div>
                        ))}
                      </td>

                      {/* Pairs Count */}
                      <td className="p-2.5 text-center font-mono font-bold text-neutral-900 align-top">
                        {totalPairs}
                      </td>

                      {/* Total Amount */}
                      <td className="p-2.5 text-right font-mono font-black text-neutral-900 align-top">
                        {order.totalAmount.toLocaleString()}
                        {isLipa && order.depositAmount && (
                          <span className="block text-[9px] text-amber-700 font-normal">
                            Dep: {order.depositAmount.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-2.5 text-center align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            order.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'dispatched'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                        {order.mpesaReceipt && (
                          <span className="block text-[8px] font-mono text-neutral-500 mt-0.5">
                            {order.mpesaReceipt}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-900 text-white font-bold text-xs">
                  <td colSpan={5} className="p-3 text-right uppercase tracking-wider">
                    Total Portfolio Figures:
                  </td>
                  <td className="p-3 text-center font-mono font-black text-blue-300">
                    {totalPairsSold} Pairs
                  </td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400">
                    KSh {totalRevenue.toLocaleString()}
                  </td>
                  <td className="p-3 text-center font-mono text-[10px] text-neutral-300">
                    {orders.length} Invoices
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Audit Verification & Signature Footer */}
          <div className="pt-6 border-t-2 border-neutral-300 grid grid-cols-2 gap-8 text-[11px] text-neutral-600">
            <div className="space-y-1">
              <span className="font-bold text-neutral-900 block">OFFICIAL CERTIFICATION:</span>
              <p>
                This statement certifies all footwear wholesale orders booked and dispatched through Blues Collection
                Kisumu Central Stage Depot Hub. Verified for KRA fiscal compliance and eTIMS filing.
              </p>
            </div>

            <div className="text-right space-y-4">
              <div>
                <span className="font-bold text-neutral-900 block">AUTHORIZED CHIEF ACCOUNTANT</span>
                <span className="text-[10px] text-neutral-500">Blues Collection Kisumu Wholesale Ltd</span>
              </div>
              <div className="border-b border-neutral-400 w-48 ml-auto pt-4" />
              <span className="text-[10px] text-neutral-400 block">Official Signature & Date Stamp</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-3.5 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600 shrink-0 no-print">
          <span>Ready for high-resolution A4 printing and automated PDF download.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-all cursor-pointer shadow-xs"
            >
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
