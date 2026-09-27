import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  FileText,
  Truck,
  Repeat,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Order, StoreSettings, CartItem, Product } from '../types';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
  onPrintThermalLabel?: (order: Order) => void;
  onPrintStatement?: (order: Order) => void;
  onPrintWaybill?: (order: Order) => void;
  onReorder?: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  storeSettings,
  onPrintThermalLabel,
  onPrintStatement,
  onPrintWaybill,
  onReorder,
}) => {
  if (!isOpen || !order) return null;

  const isLipa = order.paymentMethod === 'lipa_pole_pole';
  const totalPairs = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Profit and Landed Cost Calculation
  const orderCost =
    order.totalCost ||
    order.items.reduce(
      (sum, it) => sum + (it.unitBuyingPrice || Math.round(it.unitPrice * 0.6)) * it.quantity,
      0
    );
  const orderProfit = order.netProfit !== undefined ? order.netProfit : order.totalAmount - orderCost;
  const profitMarginPct =
    order.profitMarginPct !== undefined
      ? order.profitMarginPct
      : order.totalAmount > 0
      ? Math.round((orderProfit / order.totalAmount) * 1000) / 10
      : 0;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-neutral-900 text-white rounded-3xl max-w-3xl w-full border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-950 border border-blue-800 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-lg text-white">{order.orderNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-900/60 text-blue-300 border border-blue-700">
                  {order.orderType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    order.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : order.status === 'dispatched'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {order.status === 'dispatched' ? 'Bus Courier En Route' : order.status}
                </span>
                {isLipa && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-600">
                    Lipa Pole Pole 30%
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-neutral-500" />
                <span>Placed on {formattedDate}</span>
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-neutral-900">
          {/* PROFIT MARGIN & EXECUTIVE FINANCIAL SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Net Gross Profit */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-neutral-950 border border-emerald-700/80 space-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400">Net Profit</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-200 font-mono font-bold text-[9px]">
                  +{profitMarginPct}%
                </span>
              </div>
              <p className="font-mono font-black text-lg text-emerald-400">
                +KSh {orderProfit.toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-400">Order Gross Margin</span>
            </div>

            {/* 2. Total Invoiced Revenue */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1 shadow-md">
              <span className="text-[10px] font-black uppercase text-neutral-400">Total Revenue</span>
              <p className="font-mono font-black text-lg text-white">
                KSh {order.totalAmount.toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-500">{totalPairs} Footwear Pairs</span>
            </div>

            {/* 3. Factory Landed Buying Cost */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1 shadow-md">
              <span className="text-[10px] font-black uppercase text-neutral-400">Landed Cost</span>
              <p className="font-mono font-black text-lg text-amber-400">
                KSh {orderCost.toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-500">Factory COGS</span>
            </div>

            {/* 4. Payment Terms & Method */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1 shadow-md">
              <span className="text-[10px] font-black uppercase text-neutral-400">Payment Status</span>
              <p className="font-display font-bold text-sm text-blue-400 truncate">
                {order.paymentStatus === 'paid' ? '100% Fully Paid' : '30% Deposit Paid'}
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">
                {order.paymentMethod.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* TWO-COLUMN GRID: CUSTOMER & DESTINATION DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer & Account Info Card */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-800 text-neutral-300 font-bold">
                <User className="w-4 h-4 text-blue-400" />
                <span>Customer & Reseller Account</span>
              </div>
              <div className="space-y-1.5 text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Buyer Name:</span>
                  <strong className="text-white">{order.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Phone Number:</span>
                  <span className="font-mono text-emerald-400 font-bold">{order.customerPhone}</span>
                </div>
                {order.mpesaReceipt && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">M-Pesa Receipt:</span>
                    <span className="font-mono text-white font-bold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                      {order.mpesaReceipt}
                    </span>
                  </div>
                )}
                {order.kraEtimSerial && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">KRA eTIMS Serial:</span>
                    <span className="font-mono text-neutral-400">{order.kraEtimSerial}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Route & Logistics Card */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-800 text-neutral-300 font-bold">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Dispatch & Delivery Logistics</span>
              </div>
              <div className="space-y-1.5 text-neutral-300">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-neutral-500 shrink-0">Destination Stage:</span>
                  <strong className="text-blue-300 text-right">{order.deliveryTown}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Courier Partner:</span>
                  <span className="text-white font-bold">{order.courier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Waybill Tracking:</span>
                  <span className="font-mono text-amber-400 font-bold">{order.waybillNumber || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dispatch Hub:</span>
                  <span className="text-neutral-400">Kisumu Main Bus Park (4:00 PM Express)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ITEMIZED PRODUCTS & LINE ITEM PROFIT BREAKDOWN TABLE */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Ordered Line Items ({order.items.length} Product Models)</span>
              </span>
              <span className="text-neutral-400 text-xs font-mono">{totalPairs} Pairs Total</span>
            </div>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-800 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                    <th className="p-3">Footwear Model</th>
                    <th className="p-3">Size & Color</th>
                    <th className="p-3 text-center">Pairs</th>
                    <th className="p-3 text-right">Landed Cost</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3 text-right">Line Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {order.items.map((it, idx) => {
                    const buyCost = it.unitBuyingPrice || Math.round(it.unitPrice * 0.6);
                    const lineCost = it.totalCost || buyCost * it.quantity;
                    const lineProfit = it.itemProfit !== undefined ? it.itemProfit : it.totalPrice - lineCost;
                    const lineMargin =
                      it.totalPrice > 0 ? Math.round((lineProfit / it.totalPrice) * 1000) / 10 : 0;

                    return (
                      <tr key={idx} className="hover:bg-neutral-900/50 transition-colors">
                        {/* Model */}
                        <td className="p-3">
                          <strong className="text-white block font-medium">{it.productTitle}</strong>
                          <span className="text-[10px] text-neutral-500 font-mono">ID: {it.productId}</span>
                        </td>

                        {/* Size & Color */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 font-mono font-bold text-amber-400 text-[11px]">
                              Size {it.size}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px]">
                              {it.color}
                            </span>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="p-3 text-center font-mono font-bold text-white">
                          {it.quantity}
                        </td>

                        {/* Unit Buying Cost */}
                        <td className="p-3 text-right font-mono text-neutral-400">
                          KSh {buyCost.toLocaleString()}
                          <span className="block text-[9px] text-neutral-600">
                            Tot: KSh {lineCost.toLocaleString()}
                          </span>
                        </td>

                        {/* Unit Selling Price */}
                        <td className="p-3 text-right font-mono font-bold text-white">
                          KSh {it.unitPrice.toLocaleString()}
                          <span className="block text-[9px] text-neutral-400">
                            Tot: KSh {it.totalPrice.toLocaleString()}
                          </span>
                        </td>

                        {/* Line Profit */}
                        <td className="p-3 text-right font-mono font-black text-emerald-400">
                          +KSh {lineProfit.toLocaleString()}
                          <span className="block text-[9px] text-emerald-600 font-medium">
                            {lineMargin}% margin
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-900/90 border-t-2 border-neutral-800 font-bold text-xs">
                    <td colSpan={2} className="p-3 text-right uppercase tracking-wider text-neutral-300">
                      Portfolio Totals:
                    </td>
                    <td className="p-3 text-center font-mono text-blue-400">{totalPairs} prs</td>
                    <td className="p-3 text-right font-mono text-amber-400">KSh {orderCost.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-white">KSh {order.totalAmount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">+KSh {orderProfit.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* LIPA POLE POLE LAYAWAY BREAKDOWN (IF APPLICABLE) */}
          {isLipa && order.depositAmount && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Lipa Pole Pole Layaway Balance Details</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 text-[10px]">
                  30% Deposit Hold
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-neutral-400 block text-[11px]">30% Deposit Paid (Stock Locked):</span>
                  <strong className="font-mono text-emerald-400 text-sm">
                    KSh {order.depositAmount.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">70% Balance Due Upon Bus Collection:</span>
                  <strong className="font-mono text-amber-400 text-sm">
                    KSh {(order.balanceDue || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* NOTES & FULFILLMENT AUDIT LOG */}
          {order.notes && (
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-300 space-y-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Fulfillment Notes:</span>
              <p className="text-xs leading-relaxed text-neutral-300">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Action Footer Bar */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* 4x6 Label Print */}
            {onPrintThermalLabel && (
              <button
                type="button"
                onClick={() => {
                  onPrintThermalLabel(order);
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>4×6" Label</span>
              </button>
            )}

            {/* M-Pesa Statement PDF */}
            {onPrintStatement && (
              <button
                type="button"
                onClick={() => {
                  onPrintStatement(order);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>M-Pesa PDF</span>
              </button>
            )}

            {/* Digital Waybill PDF */}
            {onPrintWaybill && (
              <button
                type="button"
                onClick={() => {
                  onPrintWaybill(order);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download professional digital courier waybill in PDF format"
              >
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>Waybill PDF</span>
              </button>
            )}

            {/* WhatsApp Notification Link */}
            <a
              href={`https://wa.me/254${order.customerPhone.replace(/[^0-9]/g, '').substring(1)}?text=Hello%20${encodeURIComponent(order.customerName)},%20here%20is%20the%20update%20for%20your%20Blues%20Collection%20order%20${order.orderNumber}.%20Total:%20KSh%20${order.totalAmount.toLocaleString()}%20Courier:%20${order.courier}%20Waybill:%20${order.waybillNumber || 'Pending'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Buyer</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {onReorder && (
              <button
                type="button"
                onClick={() => {
                  onReorder(order);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                title={`Quick Reorder all ${totalPairs} pairs from ${order.orderNumber}`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Quick Reorder ({totalPairs} prs)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
