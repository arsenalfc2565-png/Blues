import React, { useEffect } from 'react';
import { X, Printer, CheckCircle2, Package, MapPin, Phone, Truck, ShieldCheck, Mail, Calendar, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface CustomerOrderReceiptModalProps {
  order: Order;
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}

export const CustomerOrderReceiptModal: React.FC<CustomerOrderReceiptModalProps> = ({
  order,
  storeSettings,
  isOpen,
  onClose,
  autoPrint = false,
}) => {
  // Trigger print dialog when autoPrint is true and modal opens
  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  if (!isOpen) return null;

  const totalPairs = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartons = Math.max(1, Math.ceil(totalPairs / 24));
  const subtotalBeforeVat = Math.round(order.totalAmount / 1.16);
  const vatAmount = order.totalAmount - subtotalBeforeVat;
  const isLipaPolePole = order.paymentMethod === 'lipa_pole_pole';
  const isPaid = order.paymentStatus === 'paid';
  const isDepositPaid = order.paymentStatus === 'deposit_paid';
  const isCancelled = order.status === 'cancelled';

  const amountPaid = isPaid
    ? order.totalAmount
    : isDepositPaid
    ? order.depositAmount || Math.round(order.totalAmount * 0.5)
    : 0;

  const balanceDue = isPaid ? 0 : Math.max(0, order.totalAmount - amountPaid);

  const getPaymentMethodDisplay = () => {
    switch (order.paymentMethod) {
      case 'wallet_balance':
        return 'Blues Reseller Account Wallet (Preloaded Funds)';
      case 'mpesa_till':
        return 'Lipa na M-Pesa (Buy Goods Till #5422109)';
      case 'mpesa_paybill':
        return 'M-Pesa Paybill (Business #883010)';
      case 'mpesa_stk':
        return 'M-Pesa STK Instant Checkout';
      case 'lipa_pole_pole':
        return 'Lipa Pole Pole (50% Deposit Installment Plan)';
      case 'cash_pickup':
        return 'Cash On Delivery / Depot Counter Pickup';
      default:
        return String(order.paymentMethod).toUpperCase().replace('_', ' ');
    }
  };

  const getPaymentStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs uppercase tracking-wide border border-red-300">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>ORDER CANCELLED (REFUNDED TO WALLET)</span>
        </span>
      );
    }
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wide border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>PAYMENT RECEIVED IN FULL</span>
        </span>
      );
    }
    if (isDepositPaid) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs uppercase tracking-wide border border-amber-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>50% DEPOSIT PAID • BALANCE ON DELIVERY</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs uppercase tracking-wide border border-neutral-300">
        <span>PENDING SETTLEMENT</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:static print:bg-white print:p-0 print:overflow-visible animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none print:w-full print:overflow-visible">
        
        {/* On-screen Header Bar (Hidden during print) */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between no-print border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Official Order Receipt — {order.orderNumber}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Ready for printing on any standard A4 / desktop or thermal printer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close Receipt Dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRINTABLE RECEIPT CONTENT CONTAINER                                       */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-neutral-950 font-sans print:p-0 print:overflow-visible print:space-y-4 print:text-black">
          
          {/* Header & Logo Section */}
          <div className="border-b-2 border-neutral-950 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-display font-black text-xl tracking-tighter shadow-sm border border-neutral-950">
                    BC
                  </div>
                  <div>
                    <h1 className="font-display font-black text-xl tracking-tight uppercase text-neutral-950 leading-none">
                      BLUES COLLECTION FOOTWEAR
                    </h1>
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest block pt-0.5">
                      WHOLESALE & CONSIGNMENT DEPOT
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-600 space-y-0.5 pt-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                    <span>Swan Centre, Oginga Odinga Street, Kisumu Central, Kenya</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                    <span>Depot Tel: +254 712 345 678 • WhatsApp: {storeSettings.whatsappNumber}</span>
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    KRA eTIMS PIN: P051928374Z • Kisumu County Wholesale License: KSM-DIS-88301
                  </p>
                </div>
              </div>

              {/* Receipt Title Box */}
              <div className="text-left sm:text-right bg-neutral-50 border border-neutral-200 p-3.5 rounded-2xl sm:min-w-[220px]">
                <span className="text-[10px] font-mono uppercase font-black tracking-wider text-neutral-500 block">
                  OFFICIAL TAX RECEIPT
                </span>
                <span className="font-mono font-black text-lg text-neutral-900 block leading-tight">
                  RCP-{order.orderNumber}
                </span>
                <div className="text-[11px] text-neutral-600 space-y-0.5 pt-1 font-mono">
                  <div>Date: {new Date(order.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <div>Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EAT</div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Customer Details & Dispatch Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Customer Details */}
            <div className="bg-neutral-50/70 border border-neutral-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block border-b border-neutral-200 pb-1">
                Billed & Issued To (Reseller)
              </span>
              <div className="space-y-1">
                <div className="font-bold text-sm text-neutral-900">{order.customerName}</div>
                <div className="text-neutral-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{order.customerPhone}</span>
                </div>
                {order.customerEmail && (
                  <div className="text-neutral-600 flex items-center gap-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
                <div className="text-[11px] text-neutral-500 pt-0.5">
                  Account Type: <strong>Wholesale Partner / Active Reseller</strong>
                </div>
              </div>
            </div>

            {/* Delivery Destination & Bus Transit */}
            <div className="bg-neutral-50/70 border border-neutral-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block border-b border-neutral-200 pb-1">
                Bus Parcel Delivery & Transit Stage
              </span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Destination Town:</span>
                  <strong className="font-bold text-neutral-900 text-sm">{order.deliveryTown}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Bus Stage / Terminal:</span>
                  <span className="font-semibold text-neutral-800">{order.busStage || 'Main Bus Park / Office'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Courier Partner:</span>
                  <span className="font-bold text-neutral-900 uppercase">{order.courier}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-neutral-500">Consignment Waybill:</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {order.waybillNumber || 'PENDING DISPATCH'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Summary Banner */}
          <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neutral-700" />
                <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-700">
                  Payment Verification & Settlement Details
                </span>
              </div>
              <div>{getPaymentStatusBadge()}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-neutral-500 block text-[11px]">Payment Method:</span>
                <span className="font-bold text-neutral-900 block pt-0.5">
                  {getPaymentMethodDisplay()}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Transaction Reference:</span>
                <span className="font-mono font-bold text-neutral-900 block pt-0.5">
                  {order.mpesaReceipt || (order.paymentMethod === 'wallet_balance' ? `WAL-${order.orderNumber.replace(/[^0-9]/g, '')}` : `TXN-BC-${order.orderNumber.replace(/[^0-9]/g, '')}`)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Parcel Package Status:</span>
                <span className="font-bold text-neutral-900 block pt-0.5 capitalize">
                  {order.status === 'dispatched' ? 'En Route with Bus Courier' : order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Footwear Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Itemized Footwear Manifest ({totalPairs} Pairs • {totalCartons} Bale/Carton)</span>
              </span>
              <span className="text-neutral-500 text-xs font-mono">
                {order.items.length} line items
              </span>
            </div>

            <div className="border border-neutral-300 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Shoe Model & Specification</th>
                    <th className="py-2.5 px-3 text-center">Size</th>
                    <th className="py-2.5 px-3 text-center">Color</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Qty (Prs)</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-3 font-mono text-neutral-400 text-center">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <strong className="font-bold text-neutral-900 block">{item.productTitle}</strong>
                        <span className="text-[10px] text-neutral-500 font-mono">SKU: BC-{item.productId}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold bg-neutral-50">
                        {item.size}
                      </td>
                      <td className="py-2.5 px-3 text-center text-neutral-700 capitalize">
                        {item.color}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                        KSh {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-neutral-900">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-950">
                        KSh {item.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown Summary & Totals */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            {/* Left side: Notes & Depot Seal */}
            <div className="space-y-3 sm:max-w-xs text-xs">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  Quality & Sizing Guarantee
                </span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  All footwear cartons are factory-inspected, matched, and security-taped at our Kisumu Depot. 
                  Free size replacement available within 48h of bus stage receipt.
                </p>
              </div>

              {/* Simulated Barcode */}
              <div className="p-3 bg-white border border-neutral-300 rounded-xl text-center space-y-1">
                <svg className="w-full h-9 mx-auto" viewBox="0 0 240 36">
                  <rect x="10" y="0" width="3" height="36" fill="#000" />
                  <rect x="16" y="0" width="2" height="36" fill="#000" />
                  <rect x="22" y="0" width="5" height="36" fill="#000" />
                  <rect x="31" y="0" width="2" height="36" fill="#000" />
                  <rect x="36" y="0" width="4" height="36" fill="#000" />
                  <rect x="44" y="0" width="2" height="36" fill="#000" />
                  <rect x="50" y="0" width="6" height="36" fill="#000" />
                  <rect x="60" y="0" width="3" height="36" fill="#000" />
                  <rect x="67" y="0" width="2" height="36" fill="#000" />
                  <rect x="73" y="0" width="5" height="36" fill="#000" />
                  <rect x="82" y="0" width="3" height="36" fill="#000" />
                  <rect x="89" y="0" width="4" height="36" fill="#000" />
                  <rect x="97" y="0" width="2" height="36" fill="#000" />
                  <rect x="103" y="0" width="6" height="36" fill="#000" />
                  <rect x="113" y="0" width="3" height="36" fill="#000" />
                  <rect x="120" y="0" width="2" height="36" fill="#000" />
                  <rect x="126" y="0" width="5" height="36" fill="#000" />
                  <rect x="135" y="0" width="4" height="36" fill="#000" />
                  <rect x="143" y="0" width="2" height="36" fill="#000" />
                  <rect x="149" y="0" width="6" height="36" fill="#000" />
                  <rect x="159" y="0" width="3" height="36" fill="#000" />
                  <rect x="166" y="0" width="2" height="36" fill="#000" />
                  <rect x="172" y="0" width="4" height="36" fill="#000" />
                  <rect x="180" y="0" width="3" height="36" fill="#000" />
                  <rect x="187" y="0" width="5" height="36" fill="#000" />
                  <rect x="196" y="0" width="2" height="36" fill="#000" />
                  <rect x="202" y="0" width="4" height="36" fill="#000" />
                  <rect x="210" y="0" width="3" height="36" fill="#000" />
                  <rect x="217" y="0" width="5" height="36" fill="#000" />
                  <rect x="226" y="0" width="2" height="36" fill="#000" />
                </svg>
                <span className="font-mono text-[10px] font-bold tracking-widest text-neutral-600 block">
                  *{order.orderNumber}*
                </span>
              </div>
            </div>

            {/* Right side: Numerical Calculation Box */}
            <div className="sm:w-72 bg-neutral-50 border border-neutral-300 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Wholesale Subtotal (Net):</span>
                <span className="font-mono font-medium">KSh {subtotalBeforeVat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>KRA 16% VAT (Inclusive):</span>
                <span className="font-mono font-medium">KSh {vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Bus Stage Delivery & Handling:</span>
                <span className="font-bold text-emerald-700">INCLUDED</span>
              </div>
              
              <div className="border-t-2 border-neutral-900 pt-2 flex justify-between items-baseline font-black text-sm text-neutral-950">
                <span className="uppercase tracking-tight">Total Wholesale Bill:</span>
                <span className="font-mono text-base text-neutral-950">
                  KSh {order.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-neutral-700">
                  <span>Amount Settled / Paid:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    KSh {amountPaid.toLocaleString()}
                  </span>
                </div>
                {balanceDue > 0 ? (
                  <div className="flex justify-between text-amber-900 font-bold bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                    <span>Balance Due Upon Collection:</span>
                    <span className="font-mono">KSh {balanceDue.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Balance Remaining:</span>
                    <span className="font-mono">KSh 0.00 (Cleared)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Official Sign-off & Footer Stamp */}
          <div className="border-t border-neutral-300 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="font-semibold text-neutral-700">
                Authorized Dispatch Desk: Swan Centre Central Depot, Kisumu
              </p>
              <p>System-generated official tax receipt valid without physical seal.</p>
            </div>
            <div className="text-center sm:text-right font-mono font-bold text-neutral-800 border-2 border-dashed border-neutral-400 px-3 py-1.5 rounded-xl uppercase text-[10px]">
              BLUES DISPATCH VERIFIED • SECURE
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Bar (Hidden during print) */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-3 no-print shrink-0">
          <div className="text-xs text-neutral-500 hidden sm:block">
            Tip: You can select <span className="font-bold text-neutral-800">"Save as PDF"</span> in the printer destination dropdown.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print Receipt Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
