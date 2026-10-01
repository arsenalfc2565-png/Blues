import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Package,
  Layers,
  TrendingUp,
  Settings,
  Plus,
  Trash2,
  Edit,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Truck,
  MessageSquare,
  DollarSign,
  Users,
  Search,
  Check,
  BarChart2,
  Scale,
  FileText,
  ShieldCheck,
  Box,
  X,
  ZoomIn,
  Sparkles,
  Filter,
  Palette,
  Radio,
  Smartphone,
  CreditCard,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  CheckSquare,
  XCircle,
  Archive,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Download
} from 'lucide-react';
import { Product, ProductVariant, Order, StoreSettings, SizingRuleType, CourierPartner, InstallmentPayment } from '../types';
import { MpesaStatementModal } from './MpesaStatementModal';
import { ThermalWaybillLabelModal } from './ThermalWaybillLabelModal';
import { BusDispatchManifestModal } from './BusDispatchManifestModal';
import { BusConductorSmsSimulatorModal } from './BusConductorSmsSimulatorModal';
import { LogoLightboxModal } from './LogoLightboxModal';
import { RichTextDescriptionEditor } from './RichTextDescriptionEditor';
import { CountyCourierConfigModule } from './CountyCourierConfigModule';
import { LowStockAlertModal } from './LowStockAlertModal';
import { SalesTrendsAndReplenishmentModule } from './SalesTrendsAndReplenishmentModule';
import { LipaPolePoleLedgerModal } from './LipaPolePoleLedgerModal';
import { DigitalWaybillPdfModal } from './DigitalWaybillPdfModal';
import { CustomerOrderReceiptModal } from './CustomerOrderReceiptModal';
import { FinancialReportsModule } from './FinancialReportsModule';
import { FullOrdersPdfReportModal } from './FullOrdersPdfReportModal';
import { downloadOrdersCsv } from '../utils/orderExportUtils';
import { triggerRestockAlert, triggerNewInventoryAlert } from '../utils/pushNotificationService';

interface AdminPortalProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  setProducts,
  orders,
  setOrders,
  storeSettings,
  setStoreSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'financial_reports' | 'products' | 'analytics' | 'courier_matrix' | 'manifest' | 'settings'>('orders');

  // Modal states
  const [selectedStatementOrder, setSelectedStatementOrder] = useState<Order | null>(null);
  const [selectedThermalLabelOrder, setSelectedThermalLabelOrder] = useState<Order | null>(null);
  const [selectedDigitalWaybillOrder, setSelectedDigitalWaybillOrder] = useState<Order | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [selectedSmsOrder, setSelectedSmsOrder] = useState<Order | null>(null);
  const [selectedLipaOrder, setSelectedLipaOrder] = useState<Order | null>(null);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [isMasterPdfModalOpen, setIsMasterPdfModalOpen] = useState(false);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);
  const [isLogoLightboxOpen, setIsLogoLightboxOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [orderTimeframe, setOrderTimeframe] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Product editor modal
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newColorInput, setNewColorInput] = useState('');
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');
  const [bulkThresholdInput, setBulkThresholdInput] = useState<number>(25);

  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '',
    category: 'ladies',
    brand: 'Blues Collection',
    description: '',
    buyingPrice: 950,
    retailPrice: 2800,
    wholesalePrice: 1550,
    sizingRuleType: 'paired_ladies',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    moq: 2,
    defaultLowStockThreshold: 25,
    allowedColors: ['Classic Black', 'Cognac Tan'],
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...storeSettings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Clean Order Queue Management (Live Active vs Delivered History)
  const [orderQueueFilter, setOrderQueueFilter] = useState<'live' | 'history' | 'all'>('live');
  const [orderSubStatus, setOrderSubStatus] = useState<'all' | 'pending' | 'verified' | 'packing' | 'dispatched' | 'completed' | 'cancelled'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderSearchScope, setOrderSearchScope] = useState<'all' | 'customer' | 'order_number' | 'product_title'>('all');
  const [showFinancialsInOrders, setShowFinancialsInOrders] = useState<boolean>(false);

  // Deletion & Cancellation modals
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // Instant M-Pesa SDK Verification & Balance Adjuster
  const [activeMpesaVerifyOrderId, setActiveMpesaVerifyOrderId] = useState<string | null>(null);
  const [mpesaVerifyInputCode, setMpesaVerifyInputCode] = useState<string>('');
  const [mpesaVerifyInputAmount, setMpesaVerifyInputAmount] = useState<number>(0);
  const [mpesaVerificationNotice, setMpesaVerificationNotice] = useState<{ orderId: string; message: string; type: 'success' | 'error' } | null>(null);

  // Compute all variants below their threshold across the catalog
  const lowStockAlerts = useMemo(() => {
    const list: { product: Product; variant: ProductVariant; threshold: number; deficit: number }[] = [];
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        const threshold =
          v.lowStockThreshold ??
          p.defaultLowStockThreshold ??
          storeSettings.globalLowStockThreshold ??
          25;

        if (v.stockQuantity <= threshold) {
          list.push({
            product: p,
            variant: v,
            threshold,
            deficit: threshold - v.stockQuantity,
          });
        }
      });
    });
    return list;
  }, [products, storeSettings]);

  const lowStockProductIds = useMemo(() => {
    return new Set(lowStockAlerts.map((a) => a.product.id));
  }, [lowStockAlerts]);

  // Quick Restock Handler with Live Push Notification Trigger
  const handleRestockVariant = (productId: string, variantId: string, addedQty: number) => {
    const targetProduct = products.find((p) => p.id === productId);
    const targetVariant = targetProduct?.variants.find((v) => v.id === variantId);
    if (targetProduct && targetVariant) {
      triggerRestockAlert(
        targetProduct.title,
        targetVariant.size,
        targetVariant.color || 'Standard',
        addedQty,
        targetProduct.imageUrl,
        targetProduct.id
      );
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            variants: p.variants.map((v) =>
              v.id === variantId ? { ...v, stockQuantity: v.stockQuantity + addedQty } : v
            ),
          };
        }
        return p;
      })
    );
  };

  const handleRecordInstallmentPayment = (
    orderId: string,
    paymentData: Omit<InstallmentPayment, 'id' | 'recordedAt'>
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newPayment: InstallmentPayment = {
            id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            recordedAt: new Date().toISOString(),
            ...paymentData,
          };
          const existingPayments = ord.installmentPayments || [
            {
              id: 'initial-deposit',
              amount: ord.depositAmount || Math.round(ord.totalAmount * 0.3),
              paymentMethod: ord.paymentMethod,
              mpesaReceipt: ord.mpesaReceipt || 'TK95L9P11B',
              recordedAt: ord.createdAt,
              recordedBy: 'Safaricom Daraja STK (Initial 30% Booking)',
              stageLocation: 'Swan Centre, Kisumu Depot',
              notes: 'Initial 30% layaway deposit to lock master cartons.',
            },
          ];
          const updatedPayments = [...existingPayments, newPayment];
          const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
          const newBalance = Math.max(0, ord.totalAmount - totalPaid);
          const newStatus = newBalance === 0 ? 'paid' : 'deposit_paid';
          return {
            ...ord,
            installmentPayments: updatedPayments,
            balanceDue: newBalance,
            paymentStatus: newStatus,
          };
        }
        return ord;
      })
    );
  };

  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setNewColorInput('');
    setProductForm({
      title: '',
      category: 'ladies',
      brand: 'Blues Collection',
      description: '',
      buyingPrice: 950,
      retailPrice: 2800,
      wholesalePrice: 1550,
      sizingRuleType: 'paired_ladies',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      moq: 2,
      defaultLowStockThreshold: 25,
      allowedColors: ['Nude Beige', 'Classic Black', 'Crimson Red'],
      variants: [
        { id: 'v-37', size: 37, color: 'Standard', sku: 'BLU-NEW-37', stockQuantity: 50, lowStockThreshold: 25 },
        { id: 'v-38', size: 38, color: 'Standard', sku: 'BLU-NEW-38', stockQuantity: 50, lowStockThreshold: 25 },
        { id: 'v-39', size: 39, color: 'Standard', sku: 'BLU-NEW-39', stockQuantity: 50, lowStockThreshold: 25 },
        { id: 'v-40', size: 40, color: 'Standard', sku: 'BLU-NEW-40', stockQuantity: 50, lowStockThreshold: 25 },
        { id: 'v-41', size: 41, color: 'Standard', sku: 'BLU-NEW-41', stockQuantity: 50, lowStockThreshold: 25 },
        { id: 'v-42', size: 42, color: 'Standard', sku: 'BLU-NEW-42', stockQuantity: 50, lowStockThreshold: 25 },
      ],
    });
    setBulkThresholdInput(25);
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setNewColorInput('');
    const wholesale = prod.wholesalePrice ?? prod.wholesaleTiers?.[0]?.pricePerUnit ?? Math.round(prod.retailPrice * 0.6);
    
    // Ensure allowedColors has valid list
    const existingColors = prod.allowedColors && prod.allowedColors.length > 0
      ? prod.allowedColors
      : Array.from(new Set(prod.variants.map((v) => v.color || 'Standard')));

    const defThreshold = prod.defaultLowStockThreshold || 25;

    // Ensure variants have lowStockThreshold populated
    const populatedVariants = (prod.variants || []).map((v) => ({
      ...v,
      lowStockThreshold: v.lowStockThreshold ?? defThreshold,
    }));

    setProductForm({
      ...prod,
      description: prod.description || '',
      wholesalePrice: wholesale,
      defaultLowStockThreshold: defThreshold,
      allowedColors: existingColors,
      variants: populatedVariants,
    });
    setBulkThresholdInput(defThreshold);
    setIsEditingProduct(true);
  };

  const handleAddAllowedColor = (colorName: string) => {
    const trimmed = colorName.trim();
    if (!trimmed) return;
    const current = productForm.allowedColors || [];
    if (!current.includes(trimmed)) {
      setProductForm({
        ...productForm,
        allowedColors: [...current, trimmed],
      });
    }
    setNewColorInput('');
  };

  const handleRemoveAllowedColor = (colorToRemove: string) => {
    const current = productForm.allowedColors || [];
    setProductForm({
      ...productForm,
      allowedColors: current.filter((c) => c !== colorToRemove),
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title) {
      setProductFormError('Please provide a shoe title');
      return;
    }
    setProductFormError(null);
    const retail = Number(productForm.retailPrice) || 2800;
    const wholesale = Number(productForm.wholesalePrice) || Math.round(retail * 0.6);
    const desc = (productForm.description || '').trim();
    const colors = productForm.allowedColors && productForm.allowedColors.length > 0
      ? productForm.allowedColors
      : ['Classic Black', 'Standard'];

    if (editingProductId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? ({
                ...p,
                ...productForm,
                description: desc,
                retailPrice: retail,
                wholesalePrice: wholesale,
                allowedColors: colors,
              } as Product)
            : p
        )
      );
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        title: productForm.title || 'New Shoe Model',
        category: productForm.category || 'ladies',
        brand: productForm.brand || 'Blues Collection',
        description: desc,
        retailPrice: retail,
        wholesalePrice: wholesale,
        sizingRuleType: productForm.sizingRuleType || 'paired_ladies',
        allowedColors: colors,
        variants: productForm.variants || [
          { id: 'v1', size: 38, color: colors[0] || 'Standard', sku: `BLU-${Date.now()}`, stockQuantity: 60 },
        ],
        imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
        isActive: true,
        moq: 2,
      };
      setProducts((prev) => [newProd, ...prev]);
      triggerNewInventoryAlert(newProd.title, newProd.category, newProd.wholesalePrice, 60, newProd.imageUrl, newProd.id);
    }
    setIsEditingProduct(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this footwear item from the catalog?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Permanently delete order
  const handleConfirmDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setOrderToDelete(null);
  };

  // Cancel order (moves to history)
  const handleConfirmCancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    setOrderToCancel(null);
  };

  // Confirm Delivered / Completed -> immediately marks completed and moves from Live queue to History
  const handleConfirmDelivered = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
    );
  };

  // Step-by-step workflow progressor
  const handleAdvanceOrderStatus = (order: Order) => {
    let nextStatus: Order['status'] = 'verified';
    if (order.status === 'pending') nextStatus = 'verified';
    else if (order.status === 'verified') nextStatus = 'packing';
    else if (order.status === 'packing') nextStatus = 'dispatched';
    else if (order.status === 'dispatched') nextStatus = 'completed';

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
    );
  };

  // M-Pesa SDK instant payment validation & auto-balance adjustment
  const handleVerifyMpesaSdkPayment = (order: Order) => {
    const code = (mpesaVerifyInputCode || '').trim().toUpperCase();
    if (!code || code.length < 5) {
      setMpesaVerificationNotice({
        orderId: order.id,
        message: 'Please enter a valid Safaricom transaction reference (e.g. QK891HD72A).',
        type: 'error',
      });
      return;
    }

    const payAmount = Number(mpesaVerifyInputAmount) > 0
      ? Number(mpesaVerifyInputAmount)
      : (order.balanceDue || Math.round(order.totalAmount * 0.7));

    handleRecordInstallmentPayment(order.id, {
      amount: payAmount,
      paymentMethod: 'mpesa_stk',
      mpesaReceipt: code,
      recordedBy: 'Safaricom Daraja SDK API (Auto-Verified)',
      stageLocation: `${order.deliveryTown} Depot Stage`,
      notes: `Verified via Safaricom STK/C2B for KSh ${payAmount.toLocaleString()}. Ref: ${code}`,
    });

    setMpesaVerificationNotice({
      orderId: order.id,
      message: `✓ Safaricom M-Pesa ${code} Verified! KSh ${payAmount.toLocaleString()} credited and balance adjusted.`,
      type: 'success',
    });

    setActiveMpesaVerifyOrderId(null);
    setMpesaVerifyInputCode('');
  };

  // Helper to resolve product image thumbnail for order items
  const getProductImage = (productId?: string, itemTitle?: string) => {
    const prod = products.find(
      (p) => (productId && p.id === productId) || (itemTitle && p.title.toLowerCase() === itemTitle.toLowerCase())
    );
    return prod?.imageUrl || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80';
  };

  // Active Live Orders Queue vs Completed/Cancelled History
  const liveOrders = useMemo(() => {
    return orders.filter((o) => ['pending', 'verified', 'packing', 'dispatched'].includes(o.status));
  }, [orders]);

  const historyOrders = useMemo(() => {
    return orders.filter((o) => ['completed', 'cancelled'].includes(o.status));
  }, [orders]);

  const displayedOrders = useMemo(() => {
    let list = orders;
    if (orderQueueFilter === 'live') {
      list = liveOrders;
    } else if (orderQueueFilter === 'history') {
      list = historyOrders;
    }

    if (orderSubStatus !== 'all') {
      list = list.filter((o) => o.status === orderSubStatus);
    }

    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      list = list.filter((o) => {
        if (orderSearchScope === 'customer') {
          return (
            o.customerName.toLowerCase().includes(q) ||
            o.customerPhone.toLowerCase().includes(q) ||
            (o.recipientPhone && o.recipientPhone.toLowerCase().includes(q))
          );
        }

        if (orderSearchScope === 'order_number') {
          return o.orderNumber.toLowerCase().includes(q);
        }

        if (orderSearchScope === 'product_title') {
          return o.items.some((it) => it.productTitle.toLowerCase().includes(q));
        }

        // 'all' scope: matches customer name, order number, product titles, phone, town, waybill, mpesa ref
        const matchesCustomer =
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          (o.recipientPhone && o.recipientPhone.toLowerCase().includes(q));

        const matchesOrderNumber = o.orderNumber.toLowerCase().includes(q);

        const matchesProductTitle = o.items.some(
          (it) =>
            it.productTitle.toLowerCase().includes(q) ||
            it.color.toLowerCase().includes(q) ||
            String(it.size).includes(q)
        );

        const matchesLogistics =
          o.deliveryTown.toLowerCase().includes(q) ||
          (o.courier && o.courier.toLowerCase().includes(q)) ||
          (o.waybillNumber && o.waybillNumber.toLowerCase().includes(q)) ||
          (o.mpesaReceipt && o.mpesaReceipt.toLowerCase().includes(q));

        return matchesCustomer || matchesOrderNumber || matchesProductTitle || matchesLogistics;
      });
    }

    return list;
  }, [orders, orderQueueFilter, orderSubStatus, orderSearchQuery, orderSearchScope, liveOrders, historyOrders]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Quick stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDispatchedPairs = orders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* 1. ADMIN EXECUTIVE HEADER BAR                                             */}
      {/* ========================================================================= */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1580px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Branding & Depot Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLogoLightboxOpen(true)}
              title="Inspect official brand emblem"
              className="group/logo relative w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-blue-500/50 shadow-md shadow-blue-600/30 bg-neutral-950 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-all"
            >
              <img
                src="/blues_brand_logo_1790333662232.jpg"
                alt="Blues Collection Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/logo:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-lg text-white tracking-tight">
                  Blues Wholesale Operations Hub
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[10px] font-bold">
                  B2B DEPOT
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Swan Centre Kisumu · Kenyan Courier Parcel Logistics & Wholesale Sizing Depot
              </p>
            </div>
          </div>

          {/* Right: Operational Status Badges & Quick Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Low Stock Depleted Alert Pill */}
            {lowStockAlerts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsLowStockModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-700/80 text-red-300 hover:bg-red-900 font-bold text-xs transition-all shadow-sm cursor-pointer animate-pulse"
                title="View depleted shoe sizes and generate supplier orders"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{lowStockAlerts.length} Sizes Low Stock</span>
              </button>
            )}

            {/* Live Daraja M-Pesa Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Daraja Till #5422109 Active</span>
            </div>

            {/* Quick 4:00 PM Bus Manifest Tool */}
            <button
              type="button"
              onClick={() => setIsManifestOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              title="Open Daily 4:00 PM Bus Parcel Dispatch Manifest"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>4:00 PM Bus Manifest</span>
            </button>

            {/* Conductor SMS Alert Simulator Tool */}
            <button
              type="button"
              onClick={() => setIsSmsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-700 text-blue-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Simulate SMS notifications sent to bus conductors & customers"
            >
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>SMS Simulator</span>
            </button>

            {/* Return to Customer Storefront */}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Storefront</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. INTUITIVE 6-TAB NAVIGATION (Decoupled, Clean, Focused)                  */}
      {/* ========================================================================= */}
      <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 sm:px-6 py-2 sticky top-[69px] z-20 backdrop-blur-md">
        <div className="max-w-[1580px] mx-auto flex items-center gap-2 overflow-x-auto">
          {/* Tab 1: Orders Management & Dispatches */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders & Dispatches</span>
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
              activeTab === 'orders' ? 'bg-blue-800 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {liveOrders.length} Live
            </span>
          </button>

          {/* Tab 2: Dedicated Financial Reports & Net Profit */}
          <button
            onClick={() => setActiveTab('financial_reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'financial_reports'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-300" />
            <span>Financial Reports & Net Profit</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
              Ledger & Wallet
            </span>
          </button>

          {/* Tab 3: Footwear Catalog */}
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Footwear Inventory & Sizing</span>
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
              activeTab === 'products' ? 'bg-blue-800 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {products.length}
            </span>
            {lowStockAlerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title={`${lowStockAlerts.length} depleted sizes`} />
            )}
          </button>

          {/* Tab 4: Sales Trends Analytics */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Sales Trends & Replenishment</span>
          </button>

          {/* Tab 5: 47 Counties Logistics */}
          <button
            onClick={() => setActiveTab('courier_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'courier_matrix'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>47 Counties Courier Matrix</span>
          </button>

          {/* Tab 6: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Depot & Settlement Settings</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT AREA                                            */}
      {/* ========================================================================= */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1580px] mx-auto w-full space-y-6">
        
        {/* Top Executive KPI Cards (High Contrast & Clear Typography) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Gross Turnover */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Gross Turnover</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">
              KSh {totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +28% MoM
              </span>
              <span>{orders.length} Wholesale Orders</span>
            </div>
          </div>

          {/* Card 2: Net Profit Margin */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-emerald-900/60 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Net Gross Profit</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              +KSh {Math.round(totalRevenue * 0.38).toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
              <span className="text-emerald-300 font-bold">~38% Wholesale Margin</span>
              <span>Factory vs Selling</span>
            </div>
          </div>

          {/* Card 3: Footwear Volume */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Dispatched Footwear</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black font-mono text-blue-400">
              {totalDispatchedPairs} Pairs
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
              <span>{Math.max(1, Math.ceil(totalDispatchedPairs / 24))} Master Cartons</span>
              <span>Eldoret, Nairobi, Kisii</span>
            </div>
          </div>

          {/* Card 4: Daily Bus Dispatch Schedule */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Daily Bus Dispatch</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              4:00 PM Daily
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
              <span>Guardian & Easy Coach</span>
              <span className="text-emerald-400 font-bold">On Schedule</span>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TAB 1: ORDER FULFILLMENT & WAYBILLS (CLEAN, UNCONGESTED, ACCURATE)      */}
        {/* ======================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {/* 1. Header Banner & Quick Manifest */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm">
              <div>
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <span>Wholesale Order Fulfillment & Parcel Logistics</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-mono">
                    {liveOrders.length} Pending Delivery
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Clear customer packing lists, exact shoe models, colors & sizes, Safaricom Daraja M-Pesa verification, and bus dispatch queue.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Export to CSV Button */}
                <button
                  type="button"
                  onClick={() => {
                    downloadOrdersCsv(
                      displayedOrders,
                      orderQueueFilter === 'live' ? 'blues_wholesale_live_orders' : 'blues_wholesale_orders'
                    );
                    setExportSuccessNotice(`Successfully exported ${displayedOrders.length} orders to CSV spreadsheet!`);
                    setTimeout(() => setExportSuccessNotice(null), 4000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-neutral-700 shadow-sm transition-all cursor-pointer"
                  title="Download spreadsheet CSV file for offline accounting, Excel, or Google Sheets"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-neutral-900 text-emerald-300 text-[10px] font-mono font-bold">
                    {displayedOrders.length}
                  </span>
                </button>

                {/* Export PDF Report Button */}
                <button
                  type="button"
                  onClick={() => setIsMasterPdfModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-neutral-700 shadow-sm transition-all cursor-pointer"
                  title="Open formatted printable / downloadable PDF order ledger and statement"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Export PDF</span>
                </button>

                {/* Bus Manifest Button */}
                <button
                  type="button"
                  onClick={() => setIsManifestOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>4:00 PM Bus Manifest</span>
                </button>
              </div>
            </div>

            {/* 2. Primary Queue Toggles & Search Bar (Customer Name, Order #, Product Title) */}
            <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800 space-y-4 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Main Queue Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderQueueFilter('live');
                      setOrderSubStatus('all');
                    }}
                    className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                      orderQueueFilter === 'live'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    }`}
                  >
                    <Package className="w-4 h-4 text-blue-200" />
                    <span>Live Orders to Deliver</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      orderQueueFilter === 'live' ? 'bg-blue-800 text-white' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {liveOrders.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderQueueFilter('history');
                      setOrderSubStatus('all');
                    }}
                    className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                      orderQueueFilter === 'history'
                        ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    }`}
                  >
                    <Archive className="w-4 h-4 text-emerald-200" />
                    <span>Delivered & Cancelled History</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      orderQueueFilter === 'history' ? 'bg-emerald-900 text-white' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {historyOrders.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderQueueFilter('all');
                      setOrderSubStatus('all');
                    }}
                    className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      orderQueueFilter === 'all'
                        ? 'bg-neutral-800 text-white border border-neutral-600'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    <span>All Orders ({orders.length})</span>
                  </button>
                </div>

                {/* Upgraded Multi-Criteria Search Bar */}
                <div className="w-full lg:max-w-md relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by customer name, order #, or product title..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-24 py-2.5 bg-neutral-900 border border-neutral-700 focus:border-blue-500 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
                    />
                    
                    {/* Clear Button / Match Badge */}
                    <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                      {orderSearchQuery && (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-blue-900/90 text-blue-200 text-[10px] font-mono font-bold">
                            {displayedOrders.length} {displayedOrders.length === 1 ? 'match' : 'matches'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOrderSearchQuery('')}
                            className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Clear search query"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Scope Filter & Quick Search Chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-neutral-800/80 text-xs">
                {/* Search Scope Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider pr-1">Search Scope:</span>
                  <button
                    type="button"
                    onClick={() => setOrderSearchScope('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      orderSearchScope === 'all'
                        ? 'bg-neutral-800 text-white border border-neutral-600'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    All Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSearchScope('customer')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      orderSearchScope === 'customer'
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Customer Name</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSearchScope('order_number')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      orderSearchScope === 'order_number'
                        ? 'bg-amber-600 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Order Number</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSearchScope('product_title')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      orderSearchScope === 'product_title'
                        ? 'bg-emerald-600 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Product Title</span>
                  </button>
                </div>

                {/* Quick 1-Click Search Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-neutral-500 text-[10px] hidden md:inline">Quick Find:</span>
                  {['Brian Otieno', 'Milan Loafers', 'Monaco', 'Safari Boots', 'BC-2026'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setOrderSearchQuery(chip);
                        setOrderSearchScope('all');
                      }}
                      className="px-2 py-0.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap text-[10px]"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-status filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-2 border-t border-neutral-800/80">
                <span className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider pr-1">Filter Status:</span>
                
                {orderQueueFilter === 'live' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOrderSubStatus('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        orderSubStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      All Live ({liveOrders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSubStatus('pending')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        orderSubStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Pending Payment ({liveOrders.filter((o) => o.status === 'pending').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSubStatus('verified')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        orderSubStatus === 'verified' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Payment Verified ({liveOrders.filter((o) => o.status === 'verified').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSubStatus('packing')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        orderSubStatus === 'packing' ? 'bg-purple-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Packing at Depot ({liveOrders.filter((o) => o.status === 'packing').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSubStatus('dispatched')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        orderSubStatus === 'dispatched' ? 'bg-cyan-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Dispatched on Bus ({liveOrders.filter((o) => o.status === 'dispatched').length})
                    </button>
                  </>
                )}

                {orderQueueFilter === 'history' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOrderSubStatus('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        orderSubStatus === 'all' ? 'bg-emerald-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      All Archived ({historyOrders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSubStatus('completed')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        orderSubStatus === 'completed' ? 'bg-emerald-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Delivered / Completed ({historyOrders.filter((o) => o.status === 'completed').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSubStatus('cancelled')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        orderSubStatus === 'cancelled' ? 'bg-red-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Cancelled ({historyOrders.filter((o) => o.status === 'cancelled').length})
                    </button>
                  </>
                )}

                {orderQueueFilter === 'all' && (
                  <>
                    {['all', 'pending', 'verified', 'packing', 'dispatched', 'completed', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOrderSubStatus(st as any)}
                        className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                          orderSubStatus === st ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {st} ({orders.filter((o) => (st === 'all' ? true : o.status === st)).length})
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Feedback / Notification Banner */}
            {exportSuccessNotice && (
              <div className="p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 bg-emerald-950/90 border-emerald-700 text-emerald-200 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{exportSuccessNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExportSuccessNotice(null)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {mpesaVerificationNotice && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
                  mpesaVerificationNotice.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                    : 'bg-red-950/90 border-red-700 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {mpesaVerificationNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{mpesaVerificationNotice.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMpesaVerificationNotice(null)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Active Search Result Banner */}
            {orderSearchQuery && (
              <div className="px-4 py-2.5 bg-blue-950/60 border border-blue-800/80 rounded-2xl flex items-center justify-between text-xs text-blue-300 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>
                    Showing <strong>{displayedOrders.length}</strong> matching order{displayedOrders.length === 1 ? '' : 's'} for{' '}
                    <span className="text-white font-mono font-bold bg-blue-900/80 px-2 py-0.5 rounded">
                      "{orderSearchQuery}"
                    </span>{' '}
                    {orderSearchScope !== 'all' && (
                      <span className="text-blue-200">
                        (Scope: {orderSearchScope === 'customer' ? 'Customer Name' : orderSearchScope === 'order_number' ? 'Order #' : 'Product Title'})
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderSearchQuery('')}
                  className="text-xs font-bold text-blue-300 hover:text-white underline cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Empty State */}
            {displayedOrders.length === 0 && (
              <div className="p-12 text-center bg-neutral-950 rounded-3xl border border-neutral-800 space-y-3">
                <Package className="w-12 h-12 text-neutral-600 mx-auto" />
                <h3 className="font-display font-bold text-base text-white">No Orders in this Queue</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  {orderQueueFilter === 'live'
                    ? 'All customer orders are delivered and fulfilled! Incoming orders will appear here for packing and dispatch.'
                    : 'No matching orders found for the selected filter.'}
                </p>
                {orderSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderSearchQuery('')}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 text-white font-bold text-xs"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

            {/* 3. Orders List (Clean, Structured & Focused on What Was Ordered) */}
            <div className="space-y-5">
              {displayedOrders.map((order) => {
                const isLipa = order.paymentMethod === 'lipa_pole_pole';
                const totalPairs = order.items.reduce((s, it) => s + it.quantity, 0);

                // Installments calculation
                const totalPaidSoFar = (order.installmentPayments || []).reduce(
                  (sum, p) => sum + p.amount,
                  order.depositAmount || (isLipa ? Math.round(order.totalAmount * 0.3) : order.totalAmount)
                );
                const computedBalance = Math.max(0, order.totalAmount - totalPaidSoFar);
                const isFullyPaid = isLipa ? computedBalance === 0 || order.paymentStatus === 'paid' : true;

                // Landed buying cost & profit (optional view)
                const orderTotalCost =
                  order.totalCost ||
                  order.items.reduce(
                    (sum, it) => sum + (it.unitBuyingPrice || Math.round(it.unitPrice * 0.6)) * it.quantity,
                    0
                  );
                const orderNetProfit = order.netProfit !== undefined ? order.netProfit : order.totalAmount - orderTotalCost;
                const orderProfitMargin =
                  order.totalAmount > 0 ? Math.round((orderNetProfit / order.totalAmount) * 1000) / 10 : 0;

                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.id}
                    className={`rounded-3xl border transition-all shadow-xl ${
                      order.status === 'completed'
                        ? 'bg-neutral-950 border-neutral-800/80 opacity-90'
                        : order.status === 'cancelled'
                        ? 'bg-neutral-950 border-red-950/80 opacity-80'
                        : 'bg-neutral-950 border-neutral-700/90'
                    }`}
                  >
                    {/* Top Order Card Header */}
                    <div className="p-5 pb-4 border-b border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-2xl shrink-0 ${
                            order.status === 'completed'
                              ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                              : order.status === 'cancelled'
                              ? 'bg-red-950 border border-red-800 text-red-400'
                              : order.status === 'dispatched'
                              ? 'bg-blue-950 border border-blue-800 text-blue-400'
                              : 'bg-neutral-900 border border-neutral-700 text-amber-400'
                          }`}
                        >
                          <Package className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-lg text-white tracking-tight">
                              {order.orderNumber}
                            </span>
                            
                            {/* Order Status Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                order.status === 'completed'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : order.status === 'dispatched'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : order.status === 'packing'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : order.status === 'verified'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {order.status === 'dispatched'
                                ? '🚚 In Transit (Bus Courier)'
                                : order.status === 'packing'
                                ? '📦 Packing at Depot'
                                : order.status === 'verified'
                                ? '🔵 Payment Verified'
                                : order.status === 'completed'
                                ? '✓ Delivered / Completed'
                                : order.status === 'cancelled'
                                ? '✕ Cancelled'
                                : '⏳ Pending Payment'}
                            </span>

                            {/* Payment Method Badge */}
                            {isLipa ? (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                                  isFullyPaid
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>{isFullyPaid ? 'Lipa Pole Pole: FULLY PAID' : 'Lipa Pole Pole (30% Deposit)'}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-900 text-emerald-400 border border-neutral-700">
                                Prepaid Full
                              </span>
                            )}

                            {/* Order Type */}
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase">
                              {order.orderType}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Placed: {formattedDate}</span>
                            <span>·</span>
                            <span className="text-neutral-300 font-semibold">{totalPairs} Pairs Total</span>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Amount Summary */}
                      <div className="text-left md:text-right bg-neutral-900/90 px-4 py-2.5 rounded-2xl border border-neutral-800 shrink-0">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">
                          Total Invoice Value
                        </span>
                        <span className="text-xl font-mono font-black text-white">
                          KSh {order.totalAmount.toLocaleString()}
                        </span>
                        {showFinancialsInOrders && (
                          <div className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                            Profit: +KSh {orderNetProfit.toLocaleString()} ({orderProfitMargin}%)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer & Destination Info Grid (Uncluttered, High Contrast) */}
                    <div className="p-5 py-4 bg-neutral-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs border-b border-neutral-800">
                      {/* Buyer Identity */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1">
                          <Users className="w-3 h-3 text-neutral-400" />
                          <span>Customer / Reseller</span>
                        </span>
                        <div className="text-white font-bold text-sm">
                          {order.customerName}
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="font-mono text-blue-400 hover:underline font-semibold"
                          >
                            {order.customerPhone}
                          </a>
                          {order.recipientPhone && order.recipientPhone !== order.customerPhone && (
                            <span className="text-neutral-400 font-mono text-[11px]">
                              (Receiver: {order.recipientPhone})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Destination & Bus Stage */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1">
                          <Truck className="w-3 h-3 text-neutral-400" />
                          <span>Destination & Courier</span>
                        </span>
                        <div className="text-blue-300 font-bold text-sm">
                          {order.deliveryTown}
                        </div>
                        <div className="text-neutral-300 flex items-center gap-1.5">
                          <span className="font-semibold text-white">{order.courier}</span>
                          {order.busStage && (
                            <span className="text-neutral-400">· Stage: {order.busStage}</span>
                          )}
                        </div>
                      </div>

                      {/* Logistics References: Waybill & M-Pesa Code */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-neutral-400" />
                          <span>Payment & Dispatch Ref</span>
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                            Waybill: <strong className="text-amber-400">{order.waybillNumber || 'Pending'}</strong>
                          </span>
                          {order.mpesaReceipt && (
                            <span className="font-mono text-xs text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                              M-Pesa: <strong>{order.mpesaReceipt}</strong>
                            </span>
                          )}
                        </div>
                        {order.kraEtimSerial && (
                          <div className="text-[10px] text-neutral-400 font-mono">
                            eTIMS: {order.kraEtimSerial}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* DEDICATED EXACT ORDERED ITEMS & SIZING BREAKDOWN TABLE                    */}
                    {/* ========================================================================= */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-blue-400" />
                          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                            Exact Ordered Footwear & Sizing Specifications ({order.items.length} Model{order.items.length > 1 ? 's' : ''})
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          Total: {totalPairs} Pairs to Pick
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {order.items.map((it, itemIdx) => {
                          const shoeImg = getProductImage(it.productId, it.productTitle);
                          const buyingCost = it.unitBuyingPrice || Math.round(it.unitPrice * 0.6);
                          const totalLineCost = it.totalCost || buyingCost * it.quantity;
                          const lineProfit = it.itemProfit !== undefined ? it.itemProfit : it.totalPrice - totalLineCost;

                          return (
                            <div
                              key={itemIdx}
                              className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              {/* Left: Shoe Preview, Name, Color & Size Specs */}
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={shoeImg}
                                  alt={it.productTitle}
                                  className="w-14 h-14 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />

                                <div className="space-y-1.5">
                                  <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                                    <span>{it.productTitle}</span>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap text-xs">
                                    {/* Color Swatch Badge */}
                                    <span className="px-2.5 py-0.5 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-200 font-medium flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                                      <span>Color: <strong className="text-white">{it.color || 'Standard'}</strong></span>
                                    </span>

                                    {/* High-Visibility Size Number Badge */}
                                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/80 border border-amber-700 text-amber-300 font-bold flex items-center gap-1">
                                      <span>Size / Number:</span>
                                      <strong className="text-white text-xs bg-amber-900/90 px-1.5 py-0.2 rounded font-mono">
                                        {it.size}
                                      </strong>
                                    </span>

                                    {/* Quantity Badge */}
                                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-300 font-bold font-mono">
                                      Qty: {it.quantity} {it.quantity === 1 ? 'Pair' : 'Pairs'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Pricing & Subtotal */}
                              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800 shrink-0">
                                <div className="text-xs font-mono text-neutral-400">
                                  {it.quantity} × KSh {it.unitPrice.toLocaleString()}
                                </div>
                                <div className="text-sm font-mono font-black text-white">
                                  KSh {it.totalPrice.toLocaleString()}
                                </div>
                                {showFinancialsInOrders && (
                                  <div className="text-[10px] font-mono text-emerald-400">
                                    Profit: +KSh {lineProfit.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Lipa Pole Pole Layaway Status & Instant M-Pesa SDK Verifier */}
                      {isLipa && (
                        <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-800/60 space-y-3 mt-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="font-bold text-xs text-amber-200">
                                Lipa Pole Pole Installment Ledger:
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isFullyPaid
                                    ? 'bg-emerald-900 text-emerald-300'
                                    : 'bg-amber-900 text-amber-300'
                                }`}
                              >
                                {isFullyPaid ? '100% Fully Cleared' : `KSh ${computedBalance.toLocaleString()} Balance Pending`}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (activeMpesaVerifyOrderId === order.id) {
                                  setActiveMpesaVerifyOrderId(null);
                                } else {
                                  setActiveMpesaVerifyOrderId(order.id);
                                  setMpesaVerifyInputAmount(computedBalance);
                                  setMpesaVerifyInputCode('');
                                }
                              }}
                              className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>
                                {activeMpesaVerifyOrderId === order.id ? 'Close Verifier' : '⚡ M-Pesa SDK Verify Payment'}
                              </span>
                            </button>
                          </div>

                          {/* Progress summary */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 bg-neutral-900/90 rounded-xl border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 block">Total Invoiced</span>
                              <span className="font-mono font-bold text-white">KSh {order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="p-2 bg-emerald-950/60 rounded-xl border border-emerald-800/80">
                              <span className="text-[10px] text-emerald-400 block">Total Amount Paid</span>
                              <span className="font-mono font-bold text-emerald-300">KSh {totalPaidSoFar.toLocaleString()}</span>
                            </div>
                            <div className="p-2 bg-neutral-900/90 rounded-xl border border-amber-800/80">
                              <span className="text-[10px] text-amber-400 block">Remaining Balance</span>
                              <span className="font-mono font-black text-amber-300">KSh {computedBalance.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Inline Instant M-Pesa SDK Verification Panel */}
                          {activeMpesaVerifyOrderId === order.id && (
                            <div className="p-3.5 bg-neutral-950 rounded-2xl border border-amber-700/80 space-y-3 animate-in fade-in">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Safaricom Daraja STK / C2B Payment Verifier</span>
                                </span>
                                <span className="text-[10px] text-neutral-400">Auto-adjusts order balance</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div>
                                  <label className="text-neutral-400 block mb-1 text-[11px]">M-Pesa Transaction Code</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={mpesaVerifyInputCode}
                                      onChange={(e) => setMpesaVerifyInputCode(e.target.value.toUpperCase())}
                                      placeholder="e.g. QK891HD72A"
                                      className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono uppercase text-xs focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setMpesaVerifyInputCode(`QK${Math.floor(100000 + Math.random() * 900000)}B`)}
                                      className="px-2 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono shrink-0"
                                      title="Auto-generate simulated Daraja STK ref"
                                    >
                                      Auto-Fill
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-neutral-400 block mb-1 text-[11px]">Payment Amount (KSh)</label>
                                  <input
                                    type="number"
                                    value={mpesaVerifyInputAmount}
                                    onChange={(e) => setMpesaVerifyInputAmount(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyMpesaSdkPayment(order)}
                                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Verify & Auto-Adjust</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ========================================================================= */}
                    {/* BOTTOM ACTION BAR: WORKFLOW ADVANCEMENT, DELIVERED, CANCEL, PRINT TOOLS   */}
                    {/* ========================================================================= */}
                    <div className="p-4 bg-neutral-950 rounded-b-3xl border-t border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                      
                      {/* Left: Primary Workflow Step Advancer */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceOrderStatus(order)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>✓ Verify Payment</span>
                          </button>
                        )}

                        {order.status === 'verified' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceOrderStatus(order)}
                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Package className="w-4 h-4" />
                            <span>📦 Start Packing at Depot</span>
                          </button>
                        )}

                        {order.status === 'packing' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceOrderStatus(order)}
                            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Truck className="w-4 h-4" />
                            <span>🚚 Mark Dispatched on Bus</span>
                          </button>
                        )}

                        {/* One-Click Confirm Delivered -> Moves Order to History */}
                        {(order.status === 'pending' ||
                          order.status === 'verified' ||
                          order.status === 'packing' ||
                          order.status === 'dispatched') && (
                          <button
                            type="button"
                            onClick={() => handleConfirmDelivered(order.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
                            title="Confirm parcel was collected/delivered. Instantly moves order to History!"
                          >
                            <Check className="w-4 h-4" />
                            <span>Confirm Delivered (Move to History)</span>
                          </button>
                        )}

                        {/* Workflow Status Dropdown for granular override */}
                        <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded-xl border border-neutral-700">
                          <span className="text-[10px] text-neutral-400">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="pending" className="bg-neutral-900">Pending</option>
                            <option value="verified" className="bg-neutral-900">Payment Verified</option>
                            <option value="packing" className="bg-neutral-900">Packing at Depot</option>
                            <option value="dispatched" className="bg-neutral-900">Dispatched via Bus</option>
                            <option value="completed" className="bg-neutral-900">Delivered / Completed</option>
                            <option value="cancelled" className="bg-neutral-900">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Right: Print Actions, Customer WhatsApp, Cancel & Delete Order */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 4x6 Thermal Label */}
                        <button
                          type="button"
                          onClick={() => setSelectedThermalLabelOrder(order)}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1 transition-all border border-neutral-700 cursor-pointer"
                          title="Print 4×6 inch thermal shipping label"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-400" />
                          <span>4×6 Label</span>
                        </button>

                        {/* Tax Receipt */}
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1 transition-all border border-neutral-700 cursor-pointer"
                          title="Print official customer order tax receipt"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Receipt</span>
                        </button>

                        {/* Digital Waybill PDF */}
                        <button
                          type="button"
                          onClick={() => setSelectedDigitalWaybillOrder(order)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 font-bold text-xs flex items-center gap-1 transition-all border border-blue-800 cursor-pointer"
                          title="Download professional PDF Waybill"
                        >
                          <Truck className="w-3.5 h-3.5 text-blue-300" />
                          <span>Waybill</span>
                        </button>

                        {/* M-Pesa Statement PDF */}
                        <button
                          type="button"
                          onClick={() => setSelectedStatementOrder(order)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs flex items-center gap-1 transition-all border border-emerald-800 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>M-Pesa Statement</span>
                        </button>

                        {/* Conductor SMS Alert */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSmsOrder(order);
                            setIsSmsModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center gap-1 transition-all border border-neutral-700 cursor-pointer"
                          title="Simulate SMS notifications"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          <span>SMS</span>
                        </button>

                        {/* Lipa Pole Pole Full Ledger Modal */}
                        {isLipa && (
                          <button
                            type="button"
                            onClick={() => setSelectedLipaOrder(order)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold text-xs flex items-center gap-1 transition-all border border-amber-800 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Ledger</span>
                          </button>
                        )}

                        {/* WhatsApp Message */}
                        <a
                          href={`https://wa.me/254${order.customerPhone.replace(/[^0-9]/g, '').substring(1)}?text=Hello%20${encodeURIComponent(order.customerName)},%20your%20Blues%20Collection%20footwear%20order%20${order.orderNumber}%20is%20now%20${order.status.toUpperCase()}.%20Courier:%20${order.courier}%20Waybill:%20${order.waybillNumber || 'Pending'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors"
                          title="Send WhatsApp update to customer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Cancel Order Button */}
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => setOrderToCancel(order)}
                            className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 text-xs font-bold transition-colors cursor-pointer"
                            title="Cancel order and move to history"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Delete Order Button */}
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-xl bg-neutral-900 hover:bg-red-950/80 text-neutral-400 hover:text-red-300 border border-neutral-700 hover:border-red-700 transition-colors cursor-pointer"
                          title="Permanently delete order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT CATALOG & SIZING RULES */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Footwear Catalog & Wholesale Sizing Rules
                </h2>
                <p className="text-xs text-neutral-400">
                  Configure wholesale bulk tiers, single wholesale pricing, allowed colors, and enforce Ladies Pairing (42↔37) or Men's Flexible Sizing.
                </p>
              </div>

              <button
                onClick={handleOpenCreateProduct}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Shoe Model</span>
              </button>
            </div>

            {/* Real-Time Filter & Search Toolbar */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={adminProductSearch}
                  onChange={(e) => setAdminProductSearch(e.target.value)}
                  placeholder="Search footwear by title, brand, or color..."
                  className="w-full pl-9 pr-8 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {adminProductSearch && (
                  <button
                    type="button"
                    onClick={() => setAdminProductSearch('')}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <span className="text-neutral-400 text-[11px] font-semibold">Filter:</span>
                {['all', 'low_stock', 'ladies', 'mens', 'sneakers', 'boots', 'sandals'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAdminCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-semibold capitalize text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      adminCategoryFilter === cat
                        ? cat === 'low_stock'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : cat === 'low_stock'
                        ? 'bg-red-950/80 text-red-300 border border-red-800/80 hover:bg-red-900'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {cat === 'low_stock' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                    <span>{cat === 'low_stock' ? `Low Stock Alert (${lowStockProductIds.size})` : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table with Responsive Scrolling */}
            <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left text-xs text-neutral-300 min-w-[700px]">
                  <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-[11px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Item & Brand</th>
                      <th className="py-3 px-4">Allowed Colors</th>
                      <th className="py-3 px-4">Sizing Rule Configuration</th>
                      <th className="py-3 px-4">Retail (1 pr)</th>
                      <th className="py-3 px-4">Wholesale (≥2 prs)</th>
                      <th className="py-3 px-4">Inventory & Threshold</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {products
                      .filter((p) => {
                        if (adminCategoryFilter === 'low_stock') {
                          const hasLow = p.variants?.some((v) => {
                            const thr =
                              v.lowStockThreshold ??
                              p.defaultLowStockThreshold ??
                              storeSettings.globalLowStockThreshold ??
                              25;
                            return v.stockQuantity <= thr;
                          });
                          if (!hasLow) return false;
                        } else if (adminCategoryFilter !== 'all' && p.category !== adminCategoryFilter) {
                          return false;
                        }

                        if (adminProductSearch.trim()) {
                          const q = adminProductSearch.toLowerCase().trim();
                          const matchesTitle = p.title.toLowerCase().includes(q);
                          const matchesBrand = p.brand.toLowerCase().includes(q);
                          const matchesColor = p.allowedColors?.some((c) => c.toLowerCase().includes(q));
                          if (!matchesTitle && !matchesBrand && !matchesColor) return false;
                        }
                        return true;
                      })
                      .map((p) => {
                        const wholesalePrice = p.wholesalePrice ?? p.wholesaleTiers?.[0]?.pricePerUnit ?? p.retailPrice;
                        const colors = p.allowedColors || Array.from(new Set(p.variants.map((v) => v.color || 'Standard')));

                        // Count low stock variants in this shoe model
                        const lowVariantsInProduct = (p.variants || []).filter((v) => {
                          const thr =
                            v.lowStockThreshold ??
                            p.defaultLowStockThreshold ??
                            storeSettings.globalLowStockThreshold ??
                            25;
                          return v.stockQuantity <= thr;
                        });

                        return (
                          <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt={p.title}
                                className="w-12 h-12 rounded-xl object-cover bg-neutral-800 shrink-0 border border-neutral-700"
                              />
                              <div className="max-w-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white block text-sm">{p.title}</span>
                                  {lowVariantsInProduct.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-800 text-red-300 font-bold text-[9px] uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                                      <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                                      <span>{lowVariantsInProduct.length} Low</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-neutral-400 block">{p.brand} · {p.category}</span>
                                {p.description && (
                                  <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 italic">
                                    "{p.description.replace(/[*#<u>[\]]/g, '')}"
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[160px]">
                                {colors.slice(0, 3).map((col) => (
                                  <span
                                    key={col}
                                    className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] font-medium"
                                  >
                                    {col}
                                  </span>
                                ))}
                                {colors.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] font-bold">
                                    +{colors.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {p.sizingRuleType === 'paired_ladies' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400 font-semibold text-[11px]">
                                  <Scale className="w-3.5 h-3.5" />
                                  <span>Ladies Pairing (42↔37)</span>
                                </span>
                              ) : p.sizingRuleType === 'flexible_mens' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400 font-semibold text-[11px]">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Flexible Sizes (40-45)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-semibold text-[11px]">
                                  <Box className="w-3.5 h-3.5" />
                                  <span>Free Size Assorted</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 font-mono font-medium text-neutral-400">
                              KSh {p.retailPrice.toLocaleString()}
                            </td>

                            <td className="py-3 px-4 font-mono">
                              <div className="font-black text-emerald-400 text-sm">
                                KSh {wholesalePrice.toLocaleString()}
                              </div>
                              <span className="text-[10px] text-emerald-300/80">Wholesale tier</span>
                            </td>

                            {/* Stock & Threshold Status Column */}
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white font-mono text-sm">
                                    {p.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0}
                                  </span>
                                  <span className="text-neutral-400 text-[10px]">pairs total</span>
                                </div>
                                {lowVariantsInProduct.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => setIsLowStockModalOpen(true)}
                                    className="px-2 py-0.5 rounded bg-red-950/90 border border-red-800 text-red-300 text-[10px] font-bold flex items-center gap-1 hover:bg-red-900 transition-colors cursor-pointer"
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5 text-red-400 animate-pulse" />
                                    <span>{lowVariantsInProduct.length} sizes depleted</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-emerald-400 font-medium">
                                    ✓ All sizes optimal
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                title="Edit shoe model, inventory & thresholds"
                                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Delete shoe"
                                className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS & SAFARICOM M-PESA */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-neutral-950 p-6 sm:p-8 rounded-3xl border border-neutral-800 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                Kisumu Store Depot & Settlement Settings
              </h2>
              <p className="text-xs text-neutral-400">
                Manage physical depot contacts, VIP WhatsApp Group invite URL, and Safaricom Till/Paybill numbers.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Store integration settings successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Business Name</label>
                <input
                  type="text"
                  value={settingsForm.shopName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Physical Location Address</label>
                <input
                  type="text"
                  value={settingsForm.locationAddress}
                  onChange={(e) => setSettingsForm({ ...settingsForm, locationAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Landmark Directions</label>
                <input
                  type="text"
                  value={settingsForm.landmark}
                  onChange={(e) => setSettingsForm({ ...settingsForm, landmark: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Primary Kisumu Phone</label>
                  <input
                    type="text"
                    value={settingsForm.kisumuPhone1}
                    onChange={(e) => setSettingsForm({ ...settingsForm, kisumuPhone1: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Secondary Kisumu Phone</label>
                  <input
                    type="text"
                    value={settingsForm.kisumuPhone2}
                    onChange={(e) => setSettingsForm({ ...settingsForm, kisumuPhone2: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">
                  VIP Wholesale WhatsApp Group Invite URL
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappGroupUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappGroupUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Safaricom Till Number</label>
                  <input
                    type="text"
                    value={settingsForm.mpesaTill}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mpesaTill: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Safaricom Paybill Number</label>
                  <input
                    type="text"
                    value={settingsForm.mpesaPaybill}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mpesaPaybill: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Paybill Account Number</label>
                  <input
                    type="text"
                    value={settingsForm.mpesaPaybillAccountNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mpesaPaybillAccountNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">KRA PIN Number</label>
                  <input
                    type="text"
                    value={settingsForm.kraPin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, kraPin: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Save Integration Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: DEDICATED FINANCIAL REPORTS & PROFIT INTELLIGENCE */}
        {activeTab === 'financial_reports' && (
          <FinancialReportsModule
            orders={orders}
            storeSettings={storeSettings}
          />
        )}

        {/* 4. 47 COUNTIES COURIER MATRIX & DYNAMIC TRANSIT CONFIG */}
        {activeTab === 'courier_matrix' && (
          <CountyCourierConfigModule
            storeSettings={storeSettings}
            onUpdateStoreSettings={(newSettings) => setStoreSettings(newSettings)}
          />
        )}

        {/* 5. RECHARTS SALES TRENDS & PREDICTIVE INVENTORY REPLENISHMENT */}
        {activeTab === 'analytics' && (
          <SalesTrendsAndReplenishmentModule
            products={products}
            orders={orders}
            storeSettings={storeSettings}
            onRestockVariant={handleRestockVariant}
            onOpenEditProduct={handleOpenEditProduct}
          />
        )}
      </main>

      {/* Product Edit / Create Modal with Full Viewport Portal & Fixed Scroll Structure */}
      {isEditingProduct &&
        createPortal(
          <div
            onClick={() => setIsEditingProduct(false)}
            className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-neutral-900 text-white rounded-3xl max-w-2xl w-full border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
            >
              {/* Fixed Header */}
              <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="font-display font-bold text-base text-white">
                    {editingProductId ? 'Edit Footwear Model & Wholesale Specs' : 'Create New Footwear Model'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body (All Fields 100% Accessible) */}
              <form id="product-admin-form" onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {productFormError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{productFormError}</span>
                  </div>
                )}
                {/* 1. Shoe Title */}
                <div>
                  <label className="text-neutral-300 font-bold block mb-1.5">
                    Shoe Title / Model Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Monaco Comfort Block Heel Pumps"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                {/* 2. Category & Brand Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-300 font-bold block mb-1.5">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="ladies">Ladies' Heels, Pumps & Flats</option>
                      <option value="mens">Men's Loafers & Brogues</option>
                      <option value="sneakers">Athletic Sneakers & Runners</option>
                      <option value="boots">Safari Heavy-Duty Boots</option>
                      <option value="sandals">Slides & Comfort Sandals</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-300 font-bold block mb-1.5">Brand Label</label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="e.g. Blues Elegance, Blues Sartorial"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* 3. RICH-TEXT PRODUCT DESCRIPTION EDITOR */}
                <RichTextDescriptionEditor
                  value={productForm.description || ''}
                  onChange={(val) => setProductForm({ ...productForm, description: val })}
                  category={productForm.category}
                />

                {/* 4. ALLOWED COLORS MANAGER (Admin sets which colors customers can choose) */}
                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-neutral-300 font-bold flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-400" />
                      <span>Allowed Colors for Customers</span>
                    </label>
                    <span className="text-[10px] text-neutral-400">
                      {(productForm.allowedColors || []).length} colors active
                    </span>
                  </div>

                  {/* Active allowed colors chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {(productForm.allowedColors || []).map((col) => (
                      <span
                        key={col}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-medium text-xs shadow-xs"
                      >
                        <span>{col}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAllowedColor(col)}
                          className="text-neutral-400 hover:text-red-400 p-0.5 rounded"
                          title={`Remove ${col}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(productForm.allowedColors || []).length === 0 && (
                      <span className="text-neutral-500 italic text-[11px]">
                        No specific colors defined. Customers will see "Standard".
                      </span>
                    )}
                  </div>

                  {/* Add new color input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newColorInput}
                      onChange={(e) => setNewColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAllowedColor(newColorInput);
                        }
                      }}
                      placeholder="Add custom color name (e.g. Cognac Tan, Crimson Red)..."
                      className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddAllowedColor(newColorInput)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Quick Color Preset Suggestions */}
                  <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px]">
                    <span className="text-neutral-500 font-semibold">Quick Presets:</span>
                    {['Classic Black', 'Cognac Tan', 'Dark Navy', 'Gold Sheen', 'Nude Beige', 'Crimson Red', 'Triple White', 'Dark Rust'].map((pre) => (
                      <button
                        key={pre}
                        type="button"
                        onClick={() => handleAddAllowedColor(pre)}
                        className="px-2 py-0.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-colors"
                      >
                        + {pre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Pricing & Profit Margin Module (Buying Cost vs Wholesale vs Retail) */}
                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-neutral-200 font-bold flex items-center gap-1.5 text-xs">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pricing Structure & Landed Factory Cost</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-md">
                      Auto-Calculates Profit Per Order/Day/Week
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Buying Price Input */}
                    <div>
                      <label className="text-amber-400 font-bold block mb-1">
                        Buying Price (Factory Cost) <span className="text-neutral-400 font-normal">(KSh)</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.buyingPrice ?? ''}
                        onChange={(e) => setProductForm({ ...productForm, buyingPrice: Number(e.target.value) })}
                        placeholder="950"
                        className="w-full px-3 py-2 bg-neutral-900 border border-amber-700/80 rounded-xl text-amber-400 font-mono font-black text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        Factory/Landed acquisition cost
                      </span>
                    </div>

                    {/* Wholesale Price Input */}
                    <div>
                      <label className="text-emerald-400 font-bold block mb-1">
                        Wholesale Price (≥2 Pairs) <span className="text-neutral-400 font-normal">(KSh)</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.wholesalePrice ?? ''}
                        onChange={(e) => setProductForm({ ...productForm, wholesalePrice: Number(e.target.value) })}
                        placeholder="1550"
                        className="w-full px-3 py-2 bg-neutral-900 border border-emerald-700/80 rounded-xl text-emerald-400 font-mono font-black text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        Selling price to bulk resellers
                      </span>
                    </div>

                    {/* Retail Price Input */}
                    <div>
                      <label className="text-neutral-300 font-bold block mb-1">
                        Retail Price (1 Pair) <span className="text-neutral-400 font-normal">(KSh)</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.retailPrice ?? ''}
                        onChange={(e) => setProductForm({ ...productForm, retailPrice: Number(e.target.value) })}
                        placeholder="2800"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        Walk-in single pair price
                      </span>
                    </div>
                  </div>

                  {/* Live Profit Margin Analysis Display */}
                  {(() => {
                    const buy = productForm.buyingPrice || 0;
                    const ws = productForm.wholesalePrice || 0;
                    const rt = productForm.retailPrice || 0;
                    const wsProfit = ws - buy;
                    const wsMargin = ws > 0 ? Math.round((wsProfit / ws) * 1000) / 10 : 0;
                    const rtProfit = rt - buy;
                    const rtMargin = rt > 0 ? Math.round((rtProfit / rt) * 1000) / 10 : 0;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
                        <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between">
                          <span className="text-emerald-300 font-medium">Wholesale Profit / Pair:</span>
                          <span className="font-mono font-black text-emerald-400">
                            +KSh {wsProfit.toLocaleString()} ({wsMargin}% margin)
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/80 flex items-center justify-between">
                          <span className="text-blue-300 font-medium">Retail Profit / Pair:</span>
                          <span className="font-mono font-black text-blue-400">
                            +KSh {rtProfit.toLocaleString()} ({rtMargin}% margin)
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 6. Sizing Rule Selection */}
                <div>
                  <label className="text-neutral-300 font-bold block mb-1.5">Sizing Distribution Rule</label>
                  <select
                    value={productForm.sizingRuleType}
                    onChange={(e) => setProductForm({ ...productForm, sizingRuleType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="paired_ladies">Enforce Ladies' Pairing (42↔37, 41↔38, 40↔39 Ratio)</option>
                    <option value="flexible_mens">Flexible Individual Sizing (Sizes 40 through 45 - No Pairing)</option>
                    <option value="free_size">Free Size Assorted Carton (Pre-Mixed Sizes)</option>
                  </select>
                </div>

                {/* 7. SIZES, INVENTORY & LOW STOCK ALERT THRESHOLD MATRIX */}
                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                    <div>
                      <label className="text-neutral-200 font-bold flex items-center gap-1.5 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sizes, Inventory & Minimum Stock Thresholds</span>
                      </label>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        Set minimum safety threshold per size to trigger UI notifications when stock runs low.
                      </span>
                    </div>

                    {/* Batch Threshold Tool */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[10px] text-neutral-400">Batch Threshold:</span>
                      <input
                        type="number"
                        value={bulkThresholdInput}
                        onChange={(e) => setBulkThresholdInput(Number(e.target.value))}
                        className="w-14 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono text-xs text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (productForm.variants || []).map((v) => ({
                            ...v,
                            lowStockThreshold: bulkThresholdInput,
                          }));
                          setProductForm({
                            ...productForm,
                            defaultLowStockThreshold: bulkThresholdInput,
                            variants: updated,
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        Apply to All
                      </button>
                    </div>
                  </div>

                  {/* Product Variants Matrix Table */}
                  <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-900 border-b border-neutral-800 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                          <th className="p-2.5">Size</th>
                          <th className="p-2.5">Color / Variant</th>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5 text-center">Current Stock (Pairs)</th>
                          <th className="p-2.5 text-center">Min Alert Threshold</th>
                          <th className="p-2.5 text-center">Alert Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80 font-sans">
                        {(productForm.variants || []).map((v, idx) => {
                          const threshold =
                            v.lowStockThreshold ??
                            productForm.defaultLowStockThreshold ??
                            25;
                          const isLow = v.stockQuantity <= threshold;

                          return (
                            <tr
                              key={v.id || idx}
                              className={`hover:bg-neutral-900/80 transition-colors ${
                                isLow ? 'bg-red-950/20' : ''
                              }`}
                            >
                              {/* Size */}
                              <td className="p-2.5 font-mono font-bold text-amber-400">
                                Size {v.size}
                              </td>

                              {/* Color */}
                              <td className="p-2.5">
                                <select
                                  value={v.color}
                                  onChange={(e) => {
                                    const updated = [...(productForm.variants || [])];
                                    updated[idx] = { ...v, color: e.target.value };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="px-2 py-1 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-200 text-xs focus:outline-none"
                                >
                                  {(productForm.allowedColors && productForm.allowedColors.length > 0
                                    ? productForm.allowedColors
                                    : ['Standard']
                                  ).map((col) => (
                                    <option key={col} value={col}>
                                      {col}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* SKU */}
                              <td className="p-2.5 font-mono text-[10px] text-neutral-400">
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={(e) => {
                                    const updated = [...(productForm.variants || [])];
                                    updated[idx] = { ...v, sku: e.target.value };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-24 px-1.5 py-0.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-300 text-[10px] font-mono"
                                />
                              </td>

                              {/* Current Stock */}
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={v.stockQuantity}
                                  onChange={(e) => {
                                    const updated = [...(productForm.variants || [])];
                                    updated[idx] = { ...v, stockQuantity: Math.max(0, Number(e.target.value)) };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className={`w-16 px-2 py-1 bg-neutral-950 border rounded-lg text-center font-mono font-bold text-xs ${
                                    isLow
                                      ? 'border-red-600 text-red-400 focus:ring-red-500'
                                      : 'border-neutral-700 text-white focus:ring-blue-500'
                                  }`}
                                />
                              </td>

                              {/* Min Threshold */}
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  value={threshold}
                                  onChange={(e) => {
                                    const updated = [...(productForm.variants || [])];
                                    updated[idx] = { ...v, lowStockThreshold: Math.max(0, Number(e.target.value)) };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-16 px-2 py-1 bg-neutral-950 border border-amber-700/80 rounded-lg text-center font-mono font-bold text-amber-400 text-xs focus:ring-amber-500"
                                />
                              </td>

                              {/* Live Status Pill */}
                              <td className="p-2.5 text-center">
                                {isLow ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950 border border-red-800 text-red-300 font-bold text-[10px]">
                                    <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                                    <span>Low ({v.stockQuantity}/{threshold})</span>
                                  </span>
                                ) : (
                                  <span className="text-emerald-400 text-[10px] font-medium">
                                    ✓ Optimal
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 8. Image URL */}
                <div>
                  <label className="text-neutral-300 font-bold block mb-1.5">Product Image Web URL</label>
                  <input
                    type="text"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {productForm.imageUrl && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                      <img
                        src={productForm.imageUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover bg-neutral-800 border border-neutral-700 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="text-[11px] text-neutral-400 truncate">
                        Image Preview loaded successfully
                      </span>
                    </div>
                  )}
                </div>
              </form>

              {/* Fixed Sticky Footer (Always Visible & Clickable) */}
              <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3 shrink-0">
                <span className="text-[11px] text-neutral-400 hidden sm:inline">
                  Changes sync immediately to Kisumu Depot Storefront
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="product-admin-form"
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Shoe Model</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

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
      {selectedThermalLabelOrder && (
        <ThermalWaybillLabelModal
          order={selectedThermalLabelOrder}
          storeSettings={storeSettings}
          isOpen={!!selectedThermalLabelOrder}
          onClose={() => setSelectedThermalLabelOrder(null)}
        />
      )}

      {/* 4:00 PM Daily Bus Parcel Dispatch Manifest Modal */}
      <BusDispatchManifestModal
        orders={orders}
        storeSettings={storeSettings}
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
      />

      {/* Bus Conductor & Parcel Depot SMS Alert Simulator Modal */}
      {isSmsModalOpen && (
        <BusConductorSmsSimulatorModal
          order={selectedSmsOrder}
          orders={orders}
          storeSettings={storeSettings}
          isOpen={isSmsModalOpen}
          onClose={() => {
            setIsSmsModalOpen(false);
            setSelectedSmsOrder(null);
          }}
        />
      )}

      {/* Full-Screen Brand Logo Lightbox Modal */}
      <LogoLightboxModal
        isOpen={isLogoLightboxOpen}
        onClose={() => setIsLogoLightboxOpen(false)}
      />

      {/* Low Stock & Factory Reorder Alert Hub Modal */}
      {isLowStockModalOpen && (
        <LowStockAlertModal
          isOpen={isLowStockModalOpen}
          onClose={() => setIsLowStockModalOpen(false)}
          products={products}
          storeSettings={storeSettings}
          onRestockVariant={handleRestockVariant}
          onOpenEditProduct={handleOpenEditProduct}
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
            handleRecordInstallmentPayment(orderId, payment);
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

      {/* Official Order Receipt Print Modal */}
      {selectedReceiptOrder && (
        <CustomerOrderReceiptModal
          order={selectedReceiptOrder}
          storeSettings={storeSettings}
          isOpen={!!selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
          autoPrint={true}
        />
      )}

      {/* Delete Order Confirmation Dialog */}
      {orderToDelete &&
        createPortal(
          <div
            onClick={() => setOrderToDelete(null)}
            className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-neutral-900 text-white rounded-3xl max-w-md w-full border border-red-800/80 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-2.5 rounded-2xl bg-red-950 border border-red-800 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Permanently Delete Order?</h3>
                  <p className="text-xs text-neutral-400">This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Order Reference:</span>
                  <span className="font-mono font-bold text-white">{orderToDelete.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Customer:</span>
                  <span className="font-bold text-white">{orderToDelete.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Invoice:</span>
                  <span className="font-mono font-bold text-emerald-400">KSh {orderToDelete.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Pairs:</span>
                  <span className="font-mono text-neutral-300">
                    {orderToDelete.items.reduce((s, it) => s + it.quantity, 0)} Pairs
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDeleteOrder(orderToDelete.id)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Order</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Cancel Order Confirmation Dialog */}
      {orderToCancel &&
        createPortal(
          <div
            onClick={() => setOrderToCancel(null)}
            className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-neutral-900 text-white rounded-3xl max-w-md w-full border border-amber-800/80 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2.5 rounded-2xl bg-amber-950 border border-amber-800 shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Cancel Wholesale Order?</h3>
                  <p className="text-xs text-neutral-400">The order will be moved to History as Cancelled.</p>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Order Reference:</span>
                  <span className="font-mono font-bold text-white">{orderToCancel.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Customer:</span>
                  <span className="font-bold text-white">{orderToCancel.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Destination:</span>
                  <span className="text-blue-300 font-semibold">{orderToCancel.deliveryTown}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-bold text-xs cursor-pointer"
                >
                  Keep Active
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmCancelOrder(orderToCancel.id)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Cancel</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Master PDF Orders Ledger Modal */}
      {isMasterPdfModalOpen && (
        <FullOrdersPdfReportModal
          orders={displayedOrders}
          storeSettings={storeSettings}
          isOpen={isMasterPdfModalOpen}
          onClose={() => setIsMasterPdfModalOpen(false)}
          reportTitle={
            orderQueueFilter === 'live'
              ? 'Blues Wholesale Live Orders & Parcel Fulfillment Ledger'
              : orderQueueFilter === 'history'
              ? 'Blues Wholesale Fulfilled & Archived Orders Ledger'
              : 'Blues Wholesale Master Orders Ledger & Accounts Statement'
          }
        />
      )}
    </div>
  );
};
