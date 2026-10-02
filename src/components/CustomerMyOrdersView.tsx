import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  FileText,
  Printer,
  Edit3,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  MapPin,
  Phone,
  Wallet,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { Order, StoreSettings, CartItem, CourierPartner } from '../types';
import { CustomerUser, refundCustomerWallet } from '../utils/customerAuth';
import { DigitalWaybillPdfModal } from './DigitalWaybillPdfModal';
import { MpesaStatementModal } from './MpesaStatementModal';
import { CustomerOrderReceiptModal } from './CustomerOrderReceiptModal';

interface CustomerMyOrdersViewProps {
  orders: Order[];
  customer: CustomerUser;
  storeSettings: StoreSettings;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onCancelOrder: (orderId: string, reason: string) => void;
  onReorder: (order: Order) => void;
  onOpenWallet: () => void;
  onOpenGoogleLogin: () => void;
}

export const CustomerMyOrdersView: React.FC<CustomerMyOrdersViewProps> = ({
  orders,
  customer,
  storeSettings,
  onUpdateOrder,
  onCancelOrder,
  onReorder,
  onOpenWallet,
  onOpenGoogleLogin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'dispatched' | 'completed_cancelled' | 'completed' | 'cancelled'>('all');
  
  // Modals for Actions
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<Order | null>(null);
  const [selectedStatementOrder, setSelectedStatementOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Changed delivery town or date');
  const [updatingDestinationOrder, setUpdatingDestinationOrder] = useState<Order | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);

  const handlePrintReceipt = (order: Order) => {
    setSelectedReceiptOrder(order);
    setAutoPrintReceipt(true);
  };

  // Edit destination state
  const [newTown, setNewTown] = useState('');
  const [newStage, setNewStage] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Expandable item cards
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter orders for this customer (matches customer's phone or email or customerName, or all demo orders if logged in as Brian)
  const customerOrders = useMemo(() => {
    return orders.filter((order) => {
      const phoneDigits = customer.phone.replace(/[^0-9]/g, '');
      const orderPhoneDigits = (order.customerPhone || '').replace(/[^0-9]/g, '');
      return phoneDigits.length >= 9 && orderPhoneDigits.slice(-9) === phoneDigits.slice(-9);
    });
  }, [orders, customer]);

  // Apply filters & search
  const filteredOrders = useMemo(() => {
    return customerOrders.filter((order) => {
      // Status filter
      if (statusFilter === 'active') {
        if (!['pending', 'verified', 'packing'].includes(order.status)) return false;
      } else if (statusFilter === 'dispatched') {
        if (order.status !== 'dispatched') return false;
      } else if (statusFilter === 'completed_cancelled') {
        if (!['completed', 'cancelled'].includes(order.status)) return false;
      } else if (statusFilter === 'completed') {
        if (order.status !== 'completed') return false;
      } else if (statusFilter === 'cancelled') {
        if (order.status !== 'cancelled') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesWaybill = order.waybillNumber?.toLowerCase().includes(q);
        const matchesTown = order.deliveryTown.toLowerCase().includes(q);
        const matchesItems = order.items.some((it) => it.productTitle.toLowerCase().includes(q));
        return matchesNumber || matchesWaybill || matchesTown || matchesItems;
      }

      return true;
    });
  }, [customerOrders, statusFilter, searchQuery]);

  // Confirm cancellation
  const handleConfirmCancel = () => {
    if (!cancellingOrder) return;
    onCancelOrder(cancellingOrder.id, cancelReason);
    setCancellingOrder(null);
  };

  // Open Edit destination modal
  const handleOpenEditDestination = (order: Order) => {
    setUpdatingDestinationOrder(order);
    setNewTown(order.deliveryTown);
    setNewStage(order.notes?.includes('Stage:') ? order.notes : `${order.deliveryTown} Bus Park Terminal`);
    setNewPhone(order.customerPhone);
    setNewNotes(order.notes || '');
  };

  const handleSaveDestination = () => {
    if (!updatingDestinationOrder) return;
    onUpdateOrder(updatingDestinationOrder.id, {
      deliveryTown: newTown,
      customerPhone: newPhone,
      notes: `${newNotes ? `${newNotes} | ` : ''}Updated Destination Stage: ${newStage}`,
    });
    setUpdatingDestinationOrder(null);
  };

  // Helper for tracking steps
  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'verified':
        return 1;
      case 'packing':
        return 2;
      case 'dispatched':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const TRACKING_STEPS = [
    { title: 'Order Placed', desc: 'Received at Kisumu Swan Centre' },
    { title: 'Payment Verified', desc: 'Wallet / M-Pesa cleared' },
    { title: 'Bale Packed & Sealed', desc: 'Depot Security Seal applied' },
    { title: 'On Bus Highway', desc: 'En route via Daily Courier' },
    { title: 'Ready for Collection', desc: 'At destination stage terminal' },
  ];

  return (
    <div className="py-8 bg-neutral-100 min-h-screen text-neutral-900">
      <div className="max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Customer Header Banner */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {customer.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt={customer.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                  {customer.name.charAt(0)}
                </div>
              )}
              {customer.authProvider === 'google' && (
                <span className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-neutral-200" title="Signed in with Google">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
                  </svg>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl text-neutral-950">
                  My Orders & Parcel Tracking
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold font-mono uppercase">
                  Jumia-Style Hub
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Logged in as <strong className="text-neutral-900">{customer.name}</strong> ({customer.email || customer.phone})
              </p>
            </div>
          </div>

          {/* Account Balance & Wallet Box */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-neutral-950 text-white rounded-2xl px-4 py-3 border border-neutral-800 flex items-center gap-3 shadow-md">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                  Account Wallet Balance
                </span>
                <span className="font-mono font-black text-lg text-emerald-400">
                  KSh {customer.walletBalance.toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenWallet}
                className="ml-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                + Top Up
              </button>
            </div>

            {customer.authProvider !== 'google' && (
              <button
                type="button"
                onClick={onOpenGoogleLogin}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs border border-neutral-300 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
                </svg>
                <span>Link Google Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Primary Filter Toggles */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 sm:px-3.5 py-2 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
              >
                <span>All Orders</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  statusFilter === 'all' ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {customerOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 sm:px-3.5 py-2 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  statusFilter === 'active'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
                title="Pending, Verified, and Packing orders"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Active Orders</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  statusFilter === 'active' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
                }`}>
                  {customerOrders.filter((o) => ['pending', 'verified', 'packing'].includes(o.status)).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('dispatched')}
                className={`px-3 sm:px-3.5 py-2 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  statusFilter === 'dispatched'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>In Transit</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  statusFilter === 'dispatched' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-700'
                }`}>
                  {customerOrders.filter((o) => o.status === 'dispatched').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('completed_cancelled')}
                className={`px-3 sm:px-3.5 py-2 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  statusFilter === 'completed_cancelled' || statusFilter === 'completed' || statusFilter === 'cancelled'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
                title="Delivered, Completed, or Cancelled orders"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed / Cancelled</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  statusFilter === 'completed_cancelled' || statusFilter === 'completed' || statusFilter === 'cancelled'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {customerOrders.filter((o) => ['completed', 'cancelled'].includes(o.status)).length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by Order #, Waybill, shoe name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-300 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Sub-filter drilldown when viewing Completed / Cancelled */}
          {(statusFilter === 'completed_cancelled' || statusFilter === 'completed' || statusFilter === 'cancelled') && (
            <div className="flex items-center gap-2 pl-1 animate-in fade-in slide-in-from-top-1 text-xs">
              <span className="text-neutral-400 text-[11px] font-medium">Sub-filter:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('completed_cancelled')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'completed_cancelled'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All Completed & Cancelled ({customerOrders.filter((o) => ['completed', 'cancelled'].includes(o.status)).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Delivered Only ({customerOrders.filter((o) => o.status === 'completed').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('cancelled')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Cancelled Only ({customerOrders.filter((o) => o.status === 'cancelled').length})
              </button>
            </div>
          )}
        </div>

        {/* Orders Feed */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 space-y-3">
            <Package className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="font-bold text-neutral-800 text-base">No orders found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              You don't have any orders matching this filter. Start shopping from our wholesale shoe catalog!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const stepIdx = getStepIndex(order.status);
              const isCancelled = order.status === 'cancelled';
              const canCancelOrUpdate = ['pending', 'verified', 'packing'].includes(order.status);
              const isExpanded = expandedOrderIds.includes(order.id);
              const totalPairs = order.items.reduce((s, it) => s + it.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="p-5 sm:p-6 bg-neutral-50/80 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-black text-lg text-neutral-950 font-mono">
                          {order.orderNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wide bg-blue-100 text-blue-900 border border-blue-200">
                          {order.orderType}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            isCancelled
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : order.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : order.status === 'dispatched'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isCancelled
                            ? 'Cancelled'
                            : order.status === 'dispatched'
                            ? 'On Bus Highway'
                            : order.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-800 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-neutral-600" />
                          <span>{order.courier}</span>
                        </span>
                        {order.waybillNumber && (
                          <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            Waybill: {order.waybillNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-neutral-500 text-xs flex-wrap">
                        <span>Placed on {new Date(order.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-neutral-800">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>Destination: <strong>{order.deliveryTown}</strong></span>
                        </span>
                        <span>•</span>
                        <span>Payment: <strong className="text-neutral-900 uppercase">{order.paymentMethod.replace('_', ' ')}</strong></span>
                      </div>
                    </div>

                    {/* Total Amount & Action CTA */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                      <div className="text-left sm:text-right mr-1">
                        <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider">Total Amount</span>
                        <span className="font-mono font-black text-lg text-emerald-700">
                          KSh {order.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Cancel Order Button */}
                        {canCancelOrUpdate && (
                          <button
                            type="button"
                            onClick={() => setCancellingOrder(order)}
                            className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Update Delivery Town/Stage Button ("where they go") */}
                        {canCancelOrUpdate && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditDestination(order)}
                            className="px-3 py-1.5 rounded-xl border border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Update delivery town or bus stage"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Destination</span>
                          </button>
                        )}

                        {/* Reorder Button */}
                        <button
                          type="button"
                          onClick={() => onReorder(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>

                        {/* Print Receipt Quick Button */}
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(order)}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                          title={`Print official receipt for ${order.orderNumber}`}
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden xs:inline">Print Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Visual 5-Step Order Progress Tracker (Like Jumia) */}
                    {!isCancelled ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">
                            Live Bus Parcel Progress
                          </span>
                          <span className="font-semibold text-blue-700 text-[11px] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Estimated Arrival: Next Morning 8:30 AM at {order.deliveryTown}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
                          {TRACKING_STEPS.map((step, i) => {
                            const isDone = i <= stepIdx;
                            const isCurrent = i === stepIdx;

                            return (
                              <div
                                key={step.title}
                                className={`p-3 rounded-2xl border transition-all ${
                                  isCurrent
                                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                    : isDone
                                    ? 'bg-emerald-50/70 border-emerald-300'
                                    : 'bg-neutral-50 border-neutral-200 opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-neutral-300 text-[10px] flex items-center justify-center font-bold text-neutral-400">
                                      {i + 1}
                                    </div>
                                  )}
                                  <strong className="text-xs font-bold text-neutral-900 leading-tight">
                                    {step.title}
                                  </strong>
                                </div>
                                <p className="text-[10px] text-neutral-500 leading-tight">{step.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs font-bold block">This order was cancelled</strong>
                          <span className="text-xs text-red-700">
                            {order.notes || 'Cancelled by customer request.'} If paid via Account Wallet, 100% of the funds were refunded back to your wallet.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Shoe Items Summary & Toggle Accordion */}
                    <div className="pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-neutral-400" />
                          <span className="font-bold text-neutral-800">
                            Items in Parcel: {totalPairs} Pairs ({order.items.length} shoe models)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(order.id)}
                          className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Items' : 'View Item Breakdown'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Expanded Items Manifest */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 animate-in fade-in">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-neutral-200 text-xs"
                            >
                              <div className="space-y-0.5">
                                <strong className="font-bold text-neutral-900 block">{item.productTitle}</strong>
                                <span className="text-[11px] text-neutral-500">
                                  Size {item.size} • Color: {item.color} • {item.quantity} {item.quantity === 1 ? 'pair' : 'pairs'}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-neutral-900">
                                  KSh {item.totalPrice.toLocaleString()}
                                </span>
                                <span className="block text-[10px] text-neutral-400 font-mono">
                                  @ KSh {item.unitPrice.toLocaleString()}/pr
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions: Digital Waybill & WhatsApp Bus Conductor Link */}
                    <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {/* Digital Waybill PDF */}
                        <button
                          type="button"
                          onClick={() => setSelectedWaybillOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Digital Waybill (PDF)</span>
                        </button>

                        {/* M-Pesa Receipt */}
                        <button
                          type="button"
                          onClick={() => setSelectedStatementOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>M-Pesa Receipt</span>
                        </button>

                        {/* Official Print Receipt Button */}
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                          title={`Print official clean receipt for ${order.orderNumber}`}
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-400" />
                          <span>Print Receipt</span>
                        </button>
                      </div>

                      {/* Direct WhatsApp Stage Conductor Link */}
                      <a
                        href={`https://wa.me/254${storeSettings.whatsappNumber.replace(/[^0-9]/g, '').substring(1)}?text=Hello%20Blues%20Collection%20Kisumu,%20I%20am%20tracking%20my%20order%20${order.orderNumber}%20bound%20for%20${encodeURIComponent(order.deliveryTown)}.%20Waybill:%20${order.waybillNumber || 'Pending'}.%20Please%20confirm%20bus%20schedule.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Depot Conductor</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. CANCEL ORDER CONFIRMATION MODAL (WITH INSTANT WALLET REFUND)          */}
      {/* ========================================================================= */}
      {cancellingOrder && (
        <div
          onClick={() => setCancellingOrder(null)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-neutral-300 shadow-2xl animate-in zoom-in-95 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  Cancel Order {cancellingOrder.orderNumber}?
                </h3>
                <p className="text-neutral-500 text-[11px]">
                  Total Order Amount: <strong>KSh {cancellingOrder.totalAmount.toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <span className="font-bold block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Instant 100% Account Wallet Refund</span>
              </span>
              <p className="text-[11px] text-emerald-800">
                Because this order has not yet been loaded onto the courier bus, <strong>KSh {cancellingOrder.totalAmount.toLocaleString()}</strong> will be immediately refunded directly back into your Blues Account Wallet.
              </p>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1.5">
                Reason for Cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white text-xs"
              >
                <option value="Changed delivery town or date">Changed delivery destination or date</option>
                <option value="Ordered wrong sizes or color">Selected wrong shoe sizes or colors</option>
                <option value="Added more items to order">Want to create a larger combined order</option>
                <option value="Financial adjustment">Cashflow adjustment</option>
                <option value="Customer request">Boutique retail customer cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-bold"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/30"
              >
                Yes, Cancel & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. UPDATE DESTINATION MODAL ("where they go")                             */}
      {/* ========================================================================= */}
      {updatingDestinationOrder && (
        <div
          onClick={() => setUpdatingDestinationOrder(null)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-neutral-300 shadow-2xl animate-in zoom-in-95 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">
                    Update Delivery Destination
                  </h3>
                  <span className="text-neutral-500 text-[11px] font-mono">
                    Order {updatingDestinationOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUpdatingDestinationOrder(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-neutral-500 text-[11px]">
              You can update where your parcel should go as long as the bus hasn't left Kisumu Depot.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Destination County / Town:
                </label>
                <select
                  value={newTown}
                  onChange={(e) => setNewTown(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white text-xs font-bold"
                >
                  <option value="Eldoret">Eldoret (Uasin Gishu)</option>
                  <option value="Kakamega">Kakamega Central</option>
                  <option value="Bungoma">Bungoma Town</option>
                  <option value="Nairobi CBD">Nairobi CBD (OTC Terminal)</option>
                  <option value="Kisii">Kisii Town</option>
                  <option value="Kitale">Kitale Bus Stage</option>
                  <option value="Nakuru">Nakuru Town</option>
                  <option value="Busia">Busia Border Point</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Specific Destination Bus Stage / Terminal:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Zion Mall Stage, OTC Terminal, Bungoma Posta Stage"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Recipient Contact Phone Number:
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Special Instructions for Conductor / Stage Clerk:
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Call Collins when bus arrives at Zion Mall"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUpdatingDestinationOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDestination}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
              >
                Save Destination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DIGITAL WAYBILL PDF MODAL                                              */}
      {/* ========================================================================= */}
      {selectedWaybillOrder && (
        <DigitalWaybillPdfModal
          order={selectedWaybillOrder}
          isOpen={!!selectedWaybillOrder}
          onClose={() => setSelectedWaybillOrder(null)}
          storeSettings={storeSettings}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. M-PESA STATEMENT MODAL                                                 */}
      {/* ========================================================================= */}
      {selectedStatementOrder && (
        <MpesaStatementModal
          order={selectedStatementOrder}
          isOpen={!!selectedStatementOrder}
          onClose={() => setSelectedStatementOrder(null)}
          storeSettings={storeSettings}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. OFFICIAL ORDER RECEIPT PRINT MODAL                                     */}
      {/* ========================================================================= */}
      {selectedReceiptOrder && (
        <CustomerOrderReceiptModal
          order={selectedReceiptOrder}
          isOpen={!!selectedReceiptOrder}
          onClose={() => {
            setSelectedReceiptOrder(null);
            setAutoPrintReceipt(false);
          }}
          storeSettings={storeSettings}
          autoPrint={autoPrintReceipt}
        />
      )}
    </div>
  );
};
