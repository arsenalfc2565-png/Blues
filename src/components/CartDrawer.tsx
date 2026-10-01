import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageSquare,
  ShoppingBag,
  CreditCard,
  Building,
  Truck,
  ShieldCheck,
  FileText,
  Clock,
  WifiOff
} from 'lucide-react';
import { CartItem, CartValidationResult, Order, StoreSettings, CourierPartner, PaymentMethod } from '../types';
import { calculateCartSummary, autoBalanceCartItems } from '../utils/sizingValidator';
import { isDeviceOnline, saveOfflineDraft } from '../utils/offlineStorage';
import { MpesaStatementModal } from './MpesaStatementModal';
import { KenyaCountyDestinationSelector } from './KenyaCountyDestinationSelector';
import { KenyaCounty } from '../data/kenyaCounties';
import { CustomerUser } from '../utils/customerAuth';
import { Z_INDEX } from '../constants/zIndex';
import { Wallet } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  validation: CartValidationResult;
  storeSettings: StoreSettings;
  onOrderCreated: (order: Order) => void;
  customer?: CustomerUser;
  onOpenWallet?: () => void;
  onOpenGoogleLogin?: () => void;
  onPayWithWallet?: (amount: number, orderNumber: string) => { success: boolean; error?: string };
  onNavigateToMyOrders?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  setCartItems,
  validation,
  storeSettings,
  onOrderCreated,
  customer,
  onOpenWallet,
  onOpenGoogleLogin,
  onPayWithWallet,
  onNavigateToMyOrders,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'mpesa_prompt' | 'success'>('cart');
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '07');
  const [deliveryTown, setDeliveryTown] = useState(customer?.savedDeliveryTown || 'Kisumu CBD & Mega City');
  const [deliveryType, setDeliveryType] = useState<'parcel_delivery' | 'shop_pickup'>('parcel_delivery');
  const [courier, setCourier] = useState<CourierPartner>('Guardian Angel');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    customer && customer.walletBalance >= 1000 ? 'wallet_balance' : 'mpesa_stk'
  );

  // M-Pesa STK simulation state
  const [stkStatus, setStkStatus] = useState<'idle' | 'sending' | 'awaiting_pin' | 'confirmed' | 'failed'>('idle');
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [offlineSavedNotice, setOfflineSavedNotice] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const summary = calculateCartSummary(cartItems);

  if (!isOpen) return null;

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleAutoBalance = () => {
    const balanced = autoBalanceCartItems(cartItems);
    setCartItems(balanced);
  };

  const handleGenerateWhatsAppMessage = () => {
    const lines = [
      `*NEW WHOLESALE ORDER - BLUES COLLECTION KISUMU*`,
      `Customer / Shop: ${customerName || 'Reseller'} (${customerPhone})`,
      `Delivery Destination: ${deliveryTown} (${deliveryType === 'shop_pickup' ? 'Kisumu Bus Park Shop Pickup' : `Via ${courier}`})`,
      `Payment Plan: ${paymentMethod === 'lipa_pole_pole' ? 'LIPA POLE POLE (30% Deposit Booking)' : paymentMethod.replace('_', ' ').toUpperCase()}`,
      `---------------------------------`,
      `*ITEMIZED FOOTWEAR BREAKDOWN:*`,
    ];
    cartItems.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. ${item.product.title} - Size: ${item.size} (${item.color}) x ${item.quantity} prs @ KSh ${item.unitPrice.toLocaleString()}`
      );
    });
    lines.push(`---------------------------------`);
    lines.push(`Total Quantity: ${summary.totalItems} Pairs`);
    if (summary.wholesaleSavings > 0) {
      lines.push(`Wholesale Volume Discount: - KSh ${summary.wholesaleSavings.toLocaleString()}`);
    }
    if (paymentMethod === 'lipa_pole_pole') {
      lines.push(`*30% Deposit Due: KSh ${summary.depositAmount.toLocaleString()}*`);
      lines.push(`Balance Due on Collection: KSh ${summary.balanceDue.toLocaleString()}`);
    } else {
      lines.push(`*Final Total: KSh ${summary.finalTotal.toLocaleString()}*`);
    }
    lines.push(`Please confirm inventory and 4:00 PM bus parcel slot.`);

    const encoded = encodeURIComponent(lines.join('\n'));
    const cleanNumber = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
  };

  const handleProcessMpesaSTK = () => {
    setCheckoutError(null);
    if (!customerPhone || customerPhone.length < 10) {
      setCheckoutError('Please enter a valid phone number (e.g. 0712345678)');
      return;
    }

    const isLipa = paymentMethod === 'lipa_pole_pole';
    const amountToPay = isLipa ? summary.depositAmount : summary.finalTotal;

    // Handle 1-Click Instant Account Wallet Payment
    if (paymentMethod === 'wallet_balance') {
      if (!customer) {
        if (onOpenGoogleLogin) onOpenGoogleLogin();
        return;
      }
      if (customer.walletBalance < amountToPay) {
        setCheckoutError(
          `Insufficient account wallet balance. You have KSh ${customer.walletBalance.toLocaleString()}, but need KSh ${amountToPay.toLocaleString()}. Please top up your wallet or choose M-Pesa.`
        );
        if (onOpenWallet) onOpenWallet();
        return;
      }

      const orderNum = `BC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      if (onPayWithWallet) {
        const result = onPayWithWallet(amountToPay, orderNum);
        if (!result.success) {
          setCheckoutError(result.error || 'Failed to deduct from wallet balance');
          return;
        }
      }

      // Calculate Landed Cost and Gross Profit
      let orderTotalCost = 0;
      const processedItems = cartItems.map((item) => {
        const unitBuying = item.product.buyingPrice || Math.round(item.unitPrice * 0.6);
        const lineCost = unitBuying * item.quantity;
        const lineRevenue = item.unitPrice * item.quantity;
        orderTotalCost += lineCost;

        return {
          productId: item.productId,
          productTitle: item.product.title,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: lineRevenue,
          unitBuyingPrice: unitBuying,
          totalCost: lineCost,
          itemProfit: lineRevenue - lineCost,
        };
      });

      const orderNetProfit = summary.finalTotal - orderTotalCost;
      const profitMarginPct = summary.finalTotal > 0 ? Math.round((orderNetProfit / summary.finalTotal) * 1000) / 10 : 0;
      const walletReceipt = `WLT-${Math.floor(10000000 + Math.random() * 90000000).toString(36).toUpperCase()}`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: orderNum,
        customerName: customerName || customer.name || 'Valued Reseller',
        customerPhone: customerPhone || customer.phone || '0722000000',
        deliveryTown,
        deliveryType,
        courier,
        items: processedItems,
        subtotal: summary.subtotal,
        wholesaleSavings: summary.wholesaleSavings,
        totalAmount: summary.finalTotal,
        totalCost: orderTotalCost,
        netProfit: orderNetProfit,
        profitMarginPct,
        depositAmount: isLipa ? summary.depositAmount : undefined,
        balanceDue: isLipa ? summary.balanceDue : undefined,
        paymentMethod: 'wallet_balance',
        paymentStatus: 'paid',
        mpesaReceipt: walletReceipt,
        kraEtimSerial: `ETIMS-KE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'verified',
        waybillNumber: `${courier.substring(0, 2).toUpperCase()}-${deliveryTown.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
        notes: `Paid instantly with Blues Account Wallet Balance (Ref: ${walletReceipt}). Zero STK delay. Scheduled for packaging at Kisumu Bus Park depot.`,
        createdAt: new Date().toISOString(),
        orderType: summary.isWholesaleOrder ? 'wholesale' : 'retail',
      };

      setCompletedOrder(newOrder);
      onOrderCreated(newOrder);
      setCheckoutStep('success');
      return;
    }

    // Check offline status
    const online = isDeviceOnline();
    if (!online) {
      // Save as Offline Draft Order
      saveOfflineDraft({
        items: cartItems,
        customerPhone,
        customerName: customerName || 'Market Reseller',
        deliveryTown,
        courier,
        isLipaPolePole: paymentMethod === 'lipa_pole_pole',
        totalAmount: summary.finalTotal,
      });
      setOfflineSavedNotice(true);
      setTimeout(() => setOfflineSavedNotice(false), 4000);
      return;
    }

    setCheckoutStep('mpesa_prompt');
    setStkStatus('sending');

    // Step 1: Simulate STK Push Sent
    setTimeout(() => {
      setStkStatus('awaiting_pin');
      // Step 2: Simulate User entering PIN on phone (no real Safaricom Daraja integration yet)
      setTimeout(() => {
        setStkStatus('failed');
      }, 3500);
    }, 1500);
  };

  return (
    <div className={`fixed inset-0 ${Z_INDEX.CART_DRAWER} overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end`}>
      <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-neutral-900">
                {checkoutStep === 'cart'
                  ? 'Your Wholesale Cart'
                  : checkoutStep === 'details'
                  ? 'Delivery & Settlement'
                  : checkoutStep === 'mpesa_prompt'
                  ? 'Safaricom M-Pesa STK Push'
                  : 'Order Confirmed!'}
              </h2>
              <span className="text-xs text-neutral-500">
                {cartItems.length} line items · {summary.totalItems} pairs total
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* REAL-TIME NOTIFICATION BANNER: FOOTWEAR SIZING PAIRING   */}
        {/* ======================================================== */}
        {cartItems.length > 0 && !validation.isValid && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Footwear Size-Pairing Requirement
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {validation.notificationMessage ||
                    'Wholesale ladies shoes are sold in matched pairs (Size 42 with 37, 41 with 38, 40 with 39) to protect inventory balance.'}
                </p>
                {validation.discrepancies.map((d, i) => (
                  <div key={i} className="text-xs font-semibold text-amber-900 mt-1">
                    Need {d.deficit} pair{d.deficit > 1 ? 's' : ''} of Size {d.requiredSize} to balance your Size {d.primarySize} selection.
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleAutoBalance}
              className="mt-1 w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Balance Paired Sizes in Cart</span>
            </button>
          </div>
        )}

        {/* Offline Notice Toast */}
        {offlineSavedNotice && (
          <div className="bg-neutral-900 text-white p-3.5 px-6 border-b border-neutral-700 text-xs flex items-center gap-2 animate-in slide-in-from-top">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Market Day Offline: Your wholesale draft has been stored locally. It will auto-sync when network is restored!</span>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-neutral-800">Your wholesale cart is empty</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Explore our wholesale footwear catalog with bulk pricing tiers and live sizing pairing rules.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors shadow-sm"
              >
                Browse Shoe Catalog
              </button>
            </div>
          ) : checkoutStep === 'cart' ? (
            /* ================= VIEW 1: CART ITEM LIST ================= */
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex gap-3 items-center"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-neutral-900 truncate">
                      {item.product.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                      <span className="font-bold text-neutral-800">Size: {item.size}</span>
                      <span>·</span>
                      <span>{item.color}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900 tabular-nums font-mono">
                          KSh {item.unitPrice.toLocaleString()}
                        </span>
                        {summary.isWholesaleOrder && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Wholesale Tier
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold tabular-nums text-neutral-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Wholesale Savings Banner */}
              {summary.wholesaleSavings > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold">Bulk Wholesale Savings Applied!</span>
                  </div>
                  <span className="font-extrabold font-mono tabular-nums">
                    - KSh {summary.wholesaleSavings.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ) : checkoutStep === 'details' ? (
            /* ================= VIEW 2: CUSTOMER & PAYMENT DETAILS ================= */
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                <span className="font-bold block">Delivery & Parcel Dispatch from Kisumu</span>
                <span>We dispatch daily at 4:00 PM to bus terminals in Eldoret, Nairobi, Kakamega, Bungoma, and Kisii.</span>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Reseller / Boutique Shop Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Achieng Ouma (Mega Shoes Eldoret)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Safaricom Phone Number (for M-Pesa STK & Waybill)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Delivery Choice */}
              <div>
                <label className="font-semibold text-neutral-700 block mb-1.5">
                  Fulfillment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('parcel_delivery')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                      deliveryType === 'parcel_delivery'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Daily Bus Parcel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('shop_pickup')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                      deliveryType === 'shop_pickup'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>Bus Park Shop Pickup</span>
                  </button>
                </div>
              </div>

              {deliveryType === 'parcel_delivery' && (
                <>
                  {/* Kenya 47 Counties Customized Destination Selector */}
                  <div>
                    <KenyaCountyDestinationSelector
                      selectedDestinationText={deliveryTown}
                      onSelectDestination={(county: KenyaCounty, dropPoint?: string) => {
                        const formatted = dropPoint
                          ? `${county.name} County (${dropPoint} Stage)`
                          : `${county.name} County (${county.capital} - ${county.primaryStage})`;
                        setDeliveryTown(formatted);
                      }}
                      onSelectCourier={(recCourier: CourierPartner) => {
                        setCourier(recCourier);
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-neutral-700 text-xs">
                        Preferred Courier / Bus Carrier
                      </label>
                      <span className="text-[10px] text-blue-700 font-bold">
                        Daily 4:00 PM Express
                      </span>
                    </div>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value as CourierPartner)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-semibold bg-white"
                    >
                      <option value="Guardian Angel">Guardian Angel (Direct Western, Rift & Nairobi Express)</option>
                      <option value="Easy Coach">Easy Coach (Reliable Daily Parcel Luggage Service)</option>
                      <option value="Fargo Courier">Fargo Courier (Secure Town & Office Doorstep Drop)</option>
                      <option value="Kisumu Matatu Shuttle">Kisumu Matatu Shuttle (Rapid 1-3 hr Lake Basin Transit)</option>
                    </select>
                  </div>

                  {/* DYNAMIC COUNTY FLEET FUEL SURGE & FREE WAIVER BANNER */}
                  <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Bus Parcel Freight Rate:</span>
                      </span>
                      {storeSettings.freeShippingEnabled && summary.totalItems >= (storeSettings.freeShippingThresholdPairs || 48) ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                          FREE (Wholesale Waiver ≥{storeSettings.freeShippingThresholdPairs || 48} prs)
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-neutral-900">
                          ~KSh {Math.round(((350 * Math.max(1, Math.ceil(summary.totalItems / 24))) * (storeSettings.fuelSurgeMultiplier || 1.0) + (storeSettings.fuelSurchargePerCarton || 0) * Math.max(1, Math.ceil(summary.totalItems / 24))) / 10) * 10}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5 border-t border-neutral-200">
                      <span>Fuel Surge Index:</span>
                      <span className="font-mono font-bold text-amber-800">
                        {storeSettings.fuelSurgeMultiplier ? `${storeSettings.fuelSurgeMultiplier}x` : '1.0x'} ({storeSettings.fuelSurgeReason || 'EPRA Baseline'})
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* PAYMENT UPGRADE: LIPA POLE POLE & M-PESA GATEWAYS */}
              <div>
                <label className="font-semibold text-neutral-700 block mb-1.5">
                  Payment Gateway & Terms
                </label>
                <div className="space-y-2">
                  {/* Option 0: Blues Reseller Account Wallet Balance (Instant 1-Click Checkout) */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'wallet_balance'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet_balance"
                      checked={paymentMethod === 'wallet_balance'}
                      onChange={() => setPaymentMethod('wallet_balance')}
                      className="text-blue-600 mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 block">Blues Reseller Account Wallet</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ⚡ 1-Click Instant
                          </span>
                        </div>
                        {customer && (
                          <span className="font-mono font-black text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Balance: KSh {customer.walletBalance.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-neutral-500 text-[11px] block">
                        Pay using money already in your account — no M-Pesa STK prompts or SMS delays!
                      </span>
                      {customer &&
                        customer.walletBalance <
                          (paymentMethod === 'lipa_pole_pole' ? summary.depositAmount : summary.finalTotal) && (
                          <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-1">
                            <span>Balance is below order total.</span>
                            {onOpenWallet && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onOpenWallet();
                                }}
                                className="text-blue-700 font-bold hover:underline cursor-pointer"
                              >
                                + Top Up Wallet
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  </label>

                  {/* Option 1: Safaricom STK Push (100% full payment) */}
                  <label className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa_stk"
                      checked={paymentMethod === 'mpesa_stk'}
                      onChange={() => setPaymentMethod('mpesa_stk')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 block">Safaricom M-Pesa STK Push (100% Full Payment)</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wide">
                          Lipa Na M-Pesa
                        </span>
                      </div>
                      <span className="text-neutral-500">Instant prompt sent to your Safaricom phone SIM for immediate clearance.</span>
                    </div>
                  </label>

                  {/* Option 2: Lipa Pole Pole (30% Deposit & Hold at Depot) */}
                  <label className="flex items-center gap-3 p-3 rounded-2xl border border-amber-300 bg-amber-50/50 cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="lipa_pole_pole"
                      checked={paymentMethod === 'lipa_pole_pole'}
                      onChange={() => setPaymentMethod('lipa_pole_pole')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-950 block">Lipa Pole Pole (30% Deposit to Book Cartons)</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px] uppercase">
                          B2B Layaway
                        </span>
                      </div>
                      <span className="text-amber-900 text-[11px] block mt-0.5">
                        Pay <strong>KSh {summary.depositAmount.toLocaleString()}</strong> (30%) now to lock stock. Pay balance <strong>KSh {summary.balanceDue.toLocaleString()}</strong> upon bus collection!
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Buy Goods Till */}
                  <label className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa_till"
                      checked={paymentMethod === 'mpesa_till'}
                      onChange={() => setPaymentMethod('mpesa_till')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 block">Buy Goods Till Number: <strong>{storeSettings.mpesaTill}</strong></span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wide">
                          Lipa Na M-Pesa
                        </span>
                      </div>
                      <span className="text-neutral-500">Pay directly from Safaricom Sim Toolkit menu to Blues Collection Till.</span>
                    </div>
                  </label>

                  {/* Option 4: Paybill */}
                  <label className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa_paybill"
                      checked={paymentMethod === 'mpesa_paybill'}
                      onChange={() => setPaymentMethod('mpesa_paybill')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 block">Pay via Paybill</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wide">
                          Lipa Na M-Pesa
                        </span>
                      </div>
                      <span className="text-neutral-500 block">
                        Paybill: <strong className="text-neutral-900 font-mono">{storeSettings.mpesaPaybill}</strong>
                        {'  '}&middot;{'  '}
                        Account Number: <strong className="text-neutral-900 font-mono">{storeSettings.mpesaPaybillAccountNumber}</strong>
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ) : checkoutStep === 'mpesa_prompt' ? (
            stkStatus === 'failed' ? (
              /* ================= VIEW 3B: AUTOMATIC PAYMENT FAILED - PAY MANUALLY ================= */
              <div className="py-6 space-y-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto text-red-600 shadow-md">
                  <AlertTriangle className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-neutral-900">
                    Automatic Payment Failed
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    Automatic M-Pesa STK Push is coming soon and is not connected yet. Please pay manually using the details below, then our team will confirm your order.
                  </p>
                </div>

                <div className="max-w-xs mx-auto p-4 rounded-3xl bg-neutral-50 border border-neutral-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Paybill Number:</span>
                    <span className="font-bold font-mono text-neutral-900">{storeSettings.mpesaPaybill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Account Number:</span>
                    <span className="font-bold font-mono text-neutral-900">{storeSettings.mpesaPaybillAccountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Till Number:</span>
                    <span className="font-bold font-mono text-neutral-900">{storeSettings.mpesaTill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Amount:</span>
                    <span className="font-bold font-mono text-neutral-900">
                      KSh {paymentMethod === 'lipa_pole_pole' ? summary.depositAmount.toLocaleString() : summary.finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutStep('details')}
                  className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Back to Order Details
                </button>
              </div>
            ) : (
              /* ================= VIEW 3A: LIVE M-PESA STK MODAL SIMULATION ================= */
              <div className="py-6 space-y-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-md">
                  <CreditCard className="w-10 h-10 animate-bounce" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-neutral-900">
                    {stkStatus === 'sending'
                      ? 'Connecting to Safaricom Daraja API...'
                      : 'Enter M-Pesa PIN on Your Phone'}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    STK Push prompt sent to <strong className="font-mono text-neutral-800">{customerPhone}</strong> for{' '}
                    <strong className="text-neutral-900 font-bold font-mono">
                      KSh {paymentMethod === 'lipa_pole_pole' ? summary.depositAmount.toLocaleString() : summary.finalTotal.toLocaleString()}
                    </strong>.
                  </p>
                </div>

                {/* Realistic Kenyan USSD Phone Pop-up Simulation */}
                <div className="max-w-xs mx-auto p-4 rounded-3xl bg-neutral-900 text-white shadow-xl text-left border border-neutral-700 font-sans">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                    <span className="text-[11px] font-bold text-emerald-400">SAFARICOM M-PESA</span>
                    <span className="text-[10px] text-neutral-400">Prompt</span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    Do you want to pay <strong>KSh {paymentMethod === 'lipa_pole_pole' ? summary.depositAmount.toLocaleString() : summary.finalTotal.toLocaleString()}</strong> to{' '}
                    <span className="text-emerald-400">BLUES COLLECTION KISUMU</span> Till {storeSettings.mpesaTill}?
                  </p>
                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Enter PIN to confirm</span>
                    <span className="font-mono text-emerald-400 animate-pulse">••••</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Waiting for Safaricom Daraja callback verification...</span>
                </div>
              </div>
            )
          ) : (
            /* ================= VIEW 4: ORDER SUCCESS & RECEIPT ================= */
            <div className="py-6 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-neutral-900">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Thank you! Your order has been registered in our Kisumu Bus Park dispatch system.
                </p>
              </div>

              {completedOrder && (
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Order Reference:</span>
                    <span className="font-bold font-mono text-neutral-800">{completedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">M-Pesa Receipt Code:</span>
                    <span className="font-bold font-mono text-emerald-700">{completedOrder.mpesaReceipt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">KRA eTIMS Serial:</span>
                    <span className="font-mono text-neutral-800">{completedOrder.kraEtimSerial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Destination & Courier:</span>
                    <span className="font-medium text-neutral-800">{completedOrder.deliveryTown} ({completedOrder.courier})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Waybill Number:</span>
                    <span className="font-mono text-blue-800 font-bold">{completedOrder.waybillNumber}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-sm">
                    <span>
                      {completedOrder.paymentMethod === 'lipa_pole_pole' ? 'Deposit Paid (30%):' : 'Total Settled:'}
                    </span>
                    <span className="text-emerald-800 font-mono">
                      KSh {completedOrder.paymentMethod === 'lipa_pole_pole' ? (completedOrder.depositAmount || 0).toLocaleString() : completedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons Strip */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsStatementModalOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-700/20 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>View & Download Official M-Pesa Statement PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateWhatsAppMessage}
                  className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Notify Kisumu Dispatch Desk on WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {cartItems.length > 0 && checkoutStep !== 'success' && checkoutStep !== 'mpesa_prompt' && (
          <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
            {/* Totals Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal ({summary.totalItems} pairs)</span>
                <span className="tabular-nums font-mono">KSh {summary.subtotal.toLocaleString()}</span>
              </div>
              {summary.wholesaleSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Wholesale Volume Savings</span>
                  <span className="tabular-nums font-mono">- KSh {summary.wholesaleSavings.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-1 border-t border-neutral-200">
                <span>Total Value</span>
                <span className="tabular-nums font-mono">KSh {summary.finalTotal.toLocaleString()}</span>
              </div>
              {paymentMethod === 'lipa_pole_pole' && checkoutStep === 'details' && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex justify-between font-bold text-xs">
                  <span>30% Deposit Due Today:</span>
                  <span className="font-mono">KSh {summary.depositAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Step navigation buttons */}
            {checkoutStep === 'cart' ? (
              <div className="space-y-2">
                <button
                  disabled={!validation.isValid}
                  onClick={() => setCheckoutStep('details')}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    validation.isValid
                      ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <span>Proceed to Delivery & Settlement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGenerateWhatsAppMessage}
                  className="w-full py-2.5 px-4 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Send Order to WhatsApp</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {checkoutError && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}
                <button
                  onClick={handleProcessMpesaSTK}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    Send M-Pesa STK (KSh {paymentMethod === 'lipa_pole_pole' ? summary.depositAmount.toLocaleString() : summary.finalTotal.toLocaleString()})
                  </span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="py-2 px-3 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100"
                  >
                    Back to Items
                  </button>
                  <button
                    onClick={handleGenerateWhatsAppMessage}
                    className="py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Order</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Official M-Pesa Statement PDF Modal */}
      {completedOrder && (
        <MpesaStatementModal
          order={completedOrder}
          storeSettings={storeSettings}
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
        />
      )}
    </div>
  );
};
