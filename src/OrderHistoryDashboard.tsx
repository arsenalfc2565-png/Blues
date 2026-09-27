import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Download,
  Printer,
  Repeat,
  MapPin,
  FileText,
  User,
  ShieldCheck,
  X,
  CreditCard,
  QrCode,
  FileSpreadsheet,
  FileDown,
  Eye,
  TrendingUp,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, StoreSettings, CartItem, Product, InstallmentPayment } from '../types';
import { MpesaStatementModal } from './MpesaStatementModal';
import { ThermalWaybillLabelModal } from './ThermalWaybillLabelModal';
import { FullOrdersPdfReportModal } from './FullOrdersPdfReportModal';
import { OrderDetailModal } from './OrderDetailModal';
import { LipaPolePoleLedgerModal } from './LipaPolePoleLedgerModal';
import { DigitalWaybillPdfModal } from './DigitalWaybillPdfModal';

interface OrderHistoryDashboardProps {
  orders: Order[];
  storeSettings: StoreSettings;
  products: Product[];
  onAddToCart: (item: CartItem) => void;
  onOpenCart: () => void;
  onRecordPayment?: (orderId: string, payment: Omit<InstallmentPayment, 'id' | 'recordedAt'>) => void;
}

export const OrderHistoryDashboard: React.FC<OrderHistoryDashboardProps> = ({
  orders,
  storeSettings,
  products,
  onAddToCart,
  onOpenCart,
  onRecordPayment,
}) => {
  // Demo account switcher & Admin mode toggle
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeUser, setActiveUser] = useState({
    name: 'Brian Otieno',
    businessName: 'Lakeside Footwear Retailers',
    phone: '0701234567',
    location: 'Kisumu CBD / United Mall Area',
    accountType: 'VIP Wholesale Member',
  });

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_delivery' | 'dispatched' | 'completed'>('all');
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [selectedStatementOrder, setSelectedStatementOrder] = useState<Order | null>(null);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);
  const [selectedDigitalWaybillOrder, setSelectedDigitalWaybillOrder] = useState<Order | null>(null);
  const [selectedLipaOrder, setSelectedLipaOrder] = useState<Order | null>(null);
  const [isFullPdfReportOpen, setIsFullPdfReportOpen] = useState(false);
  const [reorderedNotification, setReorderedNotification] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter orders matching logged-in user phone or all if admin mode
  const baseOrders = isAdminMode
    ? orders
    : orders.filter((o) => {
        const cleanUserPhone = activeUser.phone.replace(/[^0-9]/g, '');
        const cleanOrderPhone = o.customerPhone.replace(/[^0-9]/g, '');
        return cleanOrderPhone.includes(cleanUserPhone) || cleanUserPhone.includes(cleanOrderPhone);
      });

  const displayedOrders = baseOrders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending_delivery') {
      return o.status === 'packing' || o.status === 'verified';
    }
    if (statusFilter === 'dispatched') return o.status === 'dispatched';
    if (statusFilter === 'completed') return o.status === 'completed';
    return true;
  });

  // CSV Export Generator
  const handleExportCsv = () => {
    const ordersToExport = displayedOrders.length > 0 ? displayedOrders : orders;

    const headers = [
      'Order Number',
      'Date Placed',
      'Customer Name',
      'Customer Phone',
      'Destination Town & Stage',
      'Courier Partner',
      'Waybill Number',
      'Order Type',
      'Total Pairs',
      'Subtotal (KSh)',
      'Wholesale Savings (KSh)',
      'Total Invoice Amount (KSh)',
      'Deposit Paid (KSh)',
      'Balance Due on Collection (KSh)',
      'Payment Method',
      'Payment Status',
      'M-Pesa Receipt Code',
      'KRA eTIMS Serial',
      'Fulfillment Status',
      'Itemized Shoes List'
    ];

    const rows = ordersToExport.map((order) => {
      const totalPairs = order.items.reduce((s, it) => s + it.quantity, 0);
      const itemizedStr = order.items
        .map(
          (it) =>
            `${it.productTitle} (Size ${it.size}, Color ${it.color}, Qty ${it.quantity} @ KSh ${it.unitPrice})`
        )
        .join('; ');

      return [
        `"${order.orderNumber}"`,
        `"${new Date(order.createdAt).toISOString().split('T')[0]}"`,
        `"${order.customerName.replace(/"/g, '""')}"`,
        `"${order.customerPhone}"`,
        `"${order.deliveryTown.replace(/"/g, '""')}"`,
        `"${order.courier}"`,
        `"${order.waybillNumber || ''}"`,
        `"${order.orderType}"`,
        totalPairs,
        order.subtotal,
        order.wholesaleSavings || 0,
        order.totalAmount,
        order.depositAmount || 0,
        order.balanceDue || 0,
        `"${order.paymentMethod}"`,
        `"${order.paymentStatus}"`,
        `"${order.mpesaReceipt || ''}"`,
        `"${order.kraEtimSerial || ''}"`,
        `"${order.status}"`,
        `"${itemizedStr.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `blues-collection-orders-master-export-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported ${ordersToExport.length} order records to CSV successfully!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleReorder = (order: Order) => {
    let itemsAddedCount = 0;
    let pairsAddedCount = 0;

    order.items.forEach((item) => {
      const matchedProd =
        products.find((p) => p.id === item.productId) ||
        products.find((p) => p.title.toLowerCase() === item.productTitle.toLowerCase()) ||
        products[0];

      const cartItem: CartItem = {
        id: `${item.productId}-${item.size}-${item.color}-${Date.now()}-${Math.random()}`,
        productId: item.productId,
        product: matchedProd,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      };
      onAddToCart(cartItem);
      itemsAddedCount++;
      pairsAddedCount += item.quantity;
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setReorderedNotification(
      `Quick Reorder Success: Added ${pairsAddedCount} pairs across ${itemsAddedCount} styles from ${order.orderNumber} back into your active cart!`
    );
    setTimeout(() => setReorderedNotification(null), 4000);
    onOpenCart();
  };

  return (
    <section className="py-12 bg-neutral-50 border-b border-neutral-200 min-h-[85vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Reorder & Export Notification Toasts */}
        {reorderedNotification && (
          <div className="p-4 rounded-2xl bg-emerald-700 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{reorderedNotification}</span>
            </div>
            <button
              onClick={() => setReorderedNotification(null)}
              className="text-emerald-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {exportNotice && (
          <div className="p-4 rounded-2xl bg-blue-700 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-200" />
              <span>{exportNotice}</span>
            </div>
            <button
              onClick={() => setExportNotice(null)}
              className="text-blue-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reseller & Admin Account Profile Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center font-bold text-xl shadow-lg shrink-0 ${
                isAdminMode
                  ? 'bg-gradient-to-tr from-purple-700 to-indigo-700 shadow-purple-700/20'
                  : 'bg-gradient-to-tr from-blue-700 to-indigo-600 shadow-blue-700/20'
              }`}
            >
              {isAdminMode ? 'ADM' : activeUser.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-extrabold text-xl text-neutral-900">
                  {isAdminMode ? 'Master Wholesale Order Ledger' : activeUser.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isAdminMode
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}
                >
                  {isAdminMode ? 'Admin Audit Mode (All Orders)' : activeUser.accountType}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                {isAdminMode
                  ? 'Full Store Records for Financial Accounting & Audits'
                  : `${activeUser.businessName} · Phone: ${activeUser.phone}`}
              </p>
              <p className="text-xs text-neutral-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  Primary Depot Hub:{' '}
                  {isAdminMode ? 'Kisumu Main Bus Park Hub' : activeUser.location}
                </span>
              </p>
            </div>
          </div>

          {/* Account Profile Switcher & Admin Ledger Mode */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <span className="block font-bold text-neutral-800 text-[11px]">Ledger Scope:</span>
              <span className="text-[10px] text-neutral-500">Filter view or export all</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={isAdminMode ? 'all_admin' : activeUser.phone}
                onChange={(e) => {
                  if (e.target.value === 'all_admin') {
                    setIsAdminMode(true);
                  } else if (e.target.value === '0701234567') {
                    setIsAdminMode(false);
                    setActiveUser({
                      name: 'Brian Otieno',
                      businessName: 'Lakeside Footwear Retailers',
                      phone: '0701234567',
                      location: 'Kisumu CBD / United Mall Area',
                      accountType: 'VIP Wholesale Member',
                    });
                  } else {
                    setIsAdminMode(false);
                    setActiveUser({
                      name: 'Achieng Ouma',
                      businessName: 'Mega Shoes Eldoret',
                      phone: '0714987654',
                      location: 'Eldoret CBD & Uganda Rd',
                      accountType: 'Master Carton Reseller',
                    });
                  }
                }}
                className="bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
              >
                <option value="0701234567">Brian Otieno (Kisumu: 0701234567)</option>
                <option value="0714987654">Achieng Ouma (Eldoret: 0714987654)</option>
                <option value="all_admin">👑 Admin: All Store Orders ({orders.length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs & Export Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              All Purchases ({baseOrders.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending_delivery')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === 'pending_delivery'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Packing in Depot</span>
            </button>
            <button
              onClick={() => setStatusFilter('dispatched')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === 'dispatched'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Bus En Route</span>
            </button>
          </div>

          {/* ADMIN & USER EXPORT TOOLBAR */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Export to CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              title="Download full order list in CSV format for Excel & Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to CSV</span>
            </button>

            {/* Export to PDF Button */}
            <button
              type="button"
              onClick={() => setIsFullPdfReportOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              title="Generate printable PDF Master Financial Report & Orders Ledger"
            >
              <FileDown className="w-4 h-4 text-blue-400" />
              <span>Export to PDF</span>
            </button>
          </div>
        </div>

        {/* Order History Cards List */}
        <div className="space-y-5">
          {displayedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-neutral-200">
              <Package className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="font-display font-bold text-base text-neutral-800">
                No orders match this status
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No orders found under this filter for {activeUser.name}.
              </p>
              <button
                onClick={() => setStatusFilter('all')}
                className="px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 shadow-sm"
              >
                Show All Orders
              </button>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const isLipa = order.paymentMethod === 'lipa_pole_pole';
              const totalPairs = order.items.reduce((sum, item) => sum + item.quantity, 0);

              // Calculate profit margin
              const orderCost =
                order.totalCost ||
                order.items.reduce(
                  (sum, it) => sum + (it.unitBuyingPrice || Math.round(it.unitPrice * 0.6)) * it.quantity,
                  0
                );
              const orderProfit =
                order.netProfit !== undefined ? order.netProfit : order.totalAmount - orderCost;
              const profitMarginPct =
                order.profitMarginPct !== undefined
                  ? order.profitMarginPct
                  : order.totalAmount > 0
                  ? Math.round((orderProfit / order.totalAmount) * 1000) / 10
                  : 0;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedDetailOrder(order)}
                  className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden hover:border-blue-500 hover:shadow-md transition-all space-y-4 p-6 cursor-pointer group"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-display font-black text-base text-neutral-900 font-mono group-hover:text-blue-700 transition-colors">
                          {order.orderNumber}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          order.status === 'dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {order.status === 'dispatched' ? 'En Route via Bus' : 'Packing at Swan Centre'}
                        </span>
                        {isLipa && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                            Lipa Pole Pole
                          </span>
                        )}
                        {/* Order Profit Margin Badge */}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                          Profit: +KSh {orderProfit.toLocaleString()} ({profitMarginPct}%)
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.courier} · <span className="font-mono">{totalPairs} Pairs</span>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* View Details Modal Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailOrder(order)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        title="View complete line items, profit analysis and customer details"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Details</span>
                      </button>

                      {/* Statement PDF Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedStatementOrder(order)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>M-Pesa Statement</span>
                      </button>

                      {/* 4x6 Thermal Label Trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedLabelOrder(order)}
                        className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 text-neutral-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>4×6" Label</span>
                      </button>

                      {/* Professional Digital Waybill PDF */}
                      <button
                        type="button"
                        onClick={() => setSelectedDigitalWaybillOrder(order)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        title="Download professional digital courier waybill in PDF format"
                      >
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Waybill PDF</span>
                      </button>

                      {/* Lipa Pole Pole Installment Ledger Trigger */}
                      {isLipa && (
                        <button
                          type="button"
                          onClick={() => setSelectedLipaOrder(order)}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          title="Open Lipa Pole Pole layaway installment ledger, record balance payment, and send SMS reminders"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                          <span>Ledger & SMS</span>
                        </button>
                      )}

                      {/* Quick Reorder Button */}
                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                        title={`Quick Reorder all ${totalPairs} pairs from ${order.orderNumber} into active cart`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Quick Reorder</span>
                        <span className="bg-blue-500/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                          {totalPairs} prs
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Destination and Waybill */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Delivery Route:</span>
                      <strong className="text-neutral-900">{order.deliveryTown}</strong> via {order.courier}
                    </div>
                    {order.waybillNumber && (
                      <div className="text-left sm:text-right">
                        <span className="text-neutral-500 block text-[11px]">Courier Waybill:</span>
                        <strong className="font-mono text-blue-800 font-bold">{order.waybillNumber}</strong>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 overflow-hidden bg-neutral-50/40">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 font-mono text-xs shadow-xs">
                            {item.size}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 block">
                              {item.productTitle}
                            </span>
                            <span className="text-neutral-500 text-[11px]">
                              Color: {item.color} · Size: {item.size}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-neutral-900 block font-mono">
                            KSh {item.totalPrice.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {item.quantity} pairs @ KSh {item.unitPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Financial Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
                    <div className="text-neutral-500">
                      Payment: <strong className="text-neutral-800">{order.paymentMethod.replace('_', ' ').toUpperCase()}</strong>
                      {order.mpesaReceipt && (
                        <span className="ml-2">
                          M-Pesa: <strong className="font-mono text-emerald-800">{order.mpesaReceipt}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Secondary Quick Reorder Button in Footer */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(order);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Add all items from this order into active cart"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Quick Reorder ({totalPairs} prs)</span>
                      </button>

                      {isLipa && order.depositAmount ? (
                        <div className="text-right">
                          <span className="text-amber-800 font-bold block text-[11px]">
                            Deposit Paid (30%): KSh {order.depositAmount.toLocaleString()}
                          </span>
                          <span className="text-neutral-500 text-[10px]">
                            Balance Due on Collection: KSh {(order.balanceDue || 0).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-neutral-500 text-[11px] mr-2">Total Paid:</span>
                          <span className="font-display font-black text-base text-neutral-950 font-mono">
                            KSh {order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* M-Pesa Statement PDF Modal */}
      {selectedStatementOrder && (
        <MpesaStatementModal
          order={selectedStatementOrder}
          storeSettings={storeSettings}
          isOpen={!!selectedStatementOrder}
          onClose={() => setSelectedStatementOrder(null)}
        />
      )}

      {/* 4x6 Thermal Waybill Sticker Modal */}
      {selectedLabelOrder && (
        <ThermalWaybillLabelModal
          order={selectedLabelOrder}
          storeSettings={storeSettings}
          isOpen={!!selectedLabelOrder}
          onClose={() => setSelectedLabelOrder(null)}
        />
      )}

      {/* Master Orders & Financial Ledger PDF Report Modal */}
      {isFullPdfReportOpen && (
        <FullOrdersPdfReportModal
          orders={isAdminMode ? orders : displayedOrders}
          storeSettings={storeSettings}
          isOpen={isFullPdfReportOpen}
          onClose={() => setIsFullPdfReportOpen(false)}
          reportTitle={
            isAdminMode
              ? `Master Footwear Wholesale Orders & Financial Ledger (${orders.length} Invoices)`
              : `Purchases & Statement Report: ${activeUser.name} (${displayedOrders.length} Invoices)`
          }
        />
      )}

      {/* Detailed Order View Modal (Triggered on clicking order) */}
      {selectedDetailOrder && (
        <OrderDetailModal
          order={selectedDetailOrder}
          isOpen={!!selectedDetailOrder}
          onClose={() => setSelectedDetailOrder(null)}
          storeSettings={storeSettings}
          onPrintThermalLabel={(o) => setSelectedLabelOrder(o)}
          onPrintStatement={(o) => setSelectedStatementOrder(o)}
          onPrintWaybill={(o) => setSelectedDigitalWaybillOrder(o)}
          onReorder={(o) => handleReorder(o)}
        />
      )}

      {/* Lipa Pole Pole Installment Ledger & SMS Reminders Modal */}
      {selectedLipaOrder && (
        <LipaPolePoleLedgerModal
          order={selectedLipaOrder}
          isOpen={!!selectedLipaOrder}
          onClose={() => setSelectedLipaOrder(null)}
          storeSettings={storeSettings}
          onRecordPayment={(orderId, payment) => {
            if (onRecordPayment) {
              onRecordPayment(orderId, payment);
            }
            setSelectedLipaOrder(null);
          }}
        />
      )}

      {/* Professional Digital Waybill PDF Modal */}
      {selectedDigitalWaybillOrder && (
        <DigitalWaybillPdfModal
          order={selectedDigitalWaybillOrder}
          storeSettings={storeSettings}
          isOpen={!!selectedDigitalWaybillOrder}
          onClose={() => setSelectedDigitalWaybillOrder(null)}
        />
      )}
    </section>
  );
};
