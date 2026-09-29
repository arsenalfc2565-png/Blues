import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ThreeStudioView } from './components/ThreeStudioView';
import { KisumuStoreLocator } from './components/KisumuStoreLocator';
import { SizePairingGuide } from './components/SizePairingGuide';
import { OrderTracking } from './components/OrderTracking';
import { WhatsAppCommunityHub } from './components/WhatsAppCommunityHub';
import { CartDrawer } from './components/CartDrawer';
import { AdminPortal } from './components/AdminPortal';
import { OrderHistoryDashboard } from './components/OrderHistoryDashboard';
import { BulkCartonMatrixModal } from './components/BulkCartonMatrixModal';
import { WhatsAppFlyerGeneratorModal } from './components/WhatsAppFlyerGeneratorModal';
import { WhatsAppCatalogPdfModal } from './components/WhatsAppCatalogPdfModal';
import { StarterResellerPacksModal } from './components/StarterResellerPacksModal';
import { StarterPacksSection } from './components/StarterPacksSection';
import { Footer } from './components/Footer';
import { LiveAlertToast } from './components/LiveAlertToast';
import { InventoryAlertsModal } from './components/InventoryAlertsModal';
import { CustomerMyOrdersView } from './components/CustomerMyOrdersView';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { EmailAuthModal } from './components/EmailAuthModal';
import { CustomerWalletModal } from './components/CustomerWalletModal';
import {
  CustomerUser,
  getCurrentCustomer,
  deductCustomerWallet,
  refundCustomerWallet,
} from './utils/customerAuth';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STORE_SETTINGS, STARTER_RESELLER_PACKS } from './data/mockData';
import { Product, CartItem, Order, StoreSettings, ProductReview, StarterPack, InstallmentPayment } from './types';
import { validateCartSizing } from './utils/sizingValidator';
import { isDeviceOnline, getOfflineDrafts, clearAllOfflineDrafts } from './utils/offlineStorage';
import { Z_INDEX } from './constants/zIndex';
import { useFirebaseState } from './utils/useFirebaseState';
import { Wifi, RefreshCw, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [products, setProducts] = useFirebaseState<Product[]>('products', INITIAL_PRODUCTS);
  const [orders, setOrders] = useFirebaseState<Order[]>('orders', INITIAL_ORDERS);
  const [storeSettings, setStoreSettings] = useFirebaseState<StoreSettings>('storeSettings', INITIAL_STORE_SETTINGS);

  // Cart state - seed with an unbalanced pair to showcase pairing alert
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'seed-42',
      productId: 'prod-ladies-01',
      product: INITIAL_PRODUCTS[0],
      size: 42,
      color: 'Nude Beige',
      quantity: 6,
      unitPrice: 1550,
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'catalog' | '3d-studio' | 'store' | 'pairing-guide' | 'track-order' | 'order-history' | 'my-orders' | 'admin'
  >('catalog');

  // Customer Account & Blues Reseller Wallet State
  const [customer, setCustomer] = useState<CustomerUser>(() => getCurrentCustomer());
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const [isEmailAuthModalOpen, setIsEmailAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setCustomer(e.detail || getCurrentCustomer());
    };
    window.addEventListener('blues_customer_auth_changed', handleAuthChange);
    return () => window.removeEventListener('blues_customer_auth_changed', handleAuthChange);
  }, []);

  // Hero Quick Matrix Simulator Modal state
  const [isHeroMatrixOpen, setIsHeroMatrixOpen] = useState(false);

  // Reseller WhatsApp Flyer & Price Card Generator Modal State
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [flyerProduct, setFlyerProduct] = useState<Product | null>(null);

  // WhatsApp Price Sheet & Catalog PDF Modal State
  const [isPdfPriceSheetOpen, setIsPdfPriceSheetOpen] = useState(false);

  // Pre-Packed Assorted Carton Bundles ("Starter Reseller Packs") Modal State
  const [isStarterPacksModalOpen, setIsStarterPacksModalOpen] = useState(false);

  // Warehouse Restock & New Container Push Alerts Modal
  const [isGlobalAlertsModalOpen, setIsGlobalAlertsModalOpen] = useState(false);

  const handleOpenFlyerGenerator = (prod?: Product) => {
    setFlyerProduct(prod || products[0]);
    setIsFlyerModalOpen(true);
  };

  const handleAddStarterPackToCart = (pack: StarterPack) => {
    const newCartItemsToAdd: CartItem[] = [];

    pack.includedItems.forEach((incItem) => {
      const parentProduct = products.find((p) => p.id === incItem.productId) || products[0];

      // Convert size breakdown to cart items
      Object.entries(incItem.sizeBreakdown).forEach(([sizeKey, qty]) => {
        if (qty > 0) {
          // Determine unit price based on bundle price
          const unitBundlePrice = Math.round(pack.bundleWholesalePrice / pack.totalPairs);

          newCartItemsToAdd.push({
            id: `bundle-${pack.id}-${incItem.productId}-${sizeKey}-${Date.now()}-${Math.random()}`,
            productId: incItem.productId,
            product: parentProduct,
            size: isNaN(Number(sizeKey)) ? sizeKey : Number(sizeKey),
            color: incItem.color,
            quantity: qty,
            unitPrice: unitBundlePrice,
          });
        }
      });
    });

    setCartItems((prev) => [...newCartItemsToAdd, ...prev]);
    setIsCartOpen(true);
  };

  // Offline reconnection sync toast
  const [offlineDraftsCount, setOfflineDraftsCount] = useState(0);
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);

  useEffect(() => {
    const checkDrafts = () => {
      const drafts = getOfflineDrafts();
      setOfflineDraftsCount(drafts.length);
      if (drafts.length > 0 && isDeviceOnline()) {
        setShowSyncPrompt(true);
      }
    };

    checkDrafts();
    window.addEventListener('online', checkDrafts);
    return () => window.removeEventListener('online', checkDrafts);
  }, []);

  const handleSyncOfflineDrafts = () => {
    const drafts = getOfflineDrafts();
    if (drafts.length === 0) return;

    // Convert drafts to orders
    const newSyncedOrders: Order[] = drafts.map((draft, idx) => ({
      id: `ord-offline-${draft.timestamp}-${idx}`,
      orderNumber: `BC-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      deliveryTown: draft.deliveryTown,
      deliveryType: 'parcel_delivery',
      courier: draft.courier,
      items: draft.items.map((it) => ({
        productId: it.productId,
        productTitle: it.product.title,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.unitPrice * it.quantity,
      })),
      subtotal: draft.totalAmount,
      wholesaleSavings: 0,
      totalAmount: draft.totalAmount,
      depositAmount: draft.isLipaPolePole ? Math.round(draft.totalAmount * 0.3) : undefined,
      balanceDue: draft.isLipaPolePole ? draft.totalAmount - Math.round(draft.totalAmount * 0.3) : undefined,
      paymentMethod: draft.isLipaPolePole ? 'lipa_pole_pole' : 'mpesa_stk',
      paymentStatus: draft.isLipaPolePole ? 'deposit_paid' : 'paid',
      mpesaReceipt: 'TK' + Math.floor(10000000 + Math.random() * 90000000).toString(36).toUpperCase(),
      status: 'verified',
      waybillNumber: `GA-OFF-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: 'Market Day offline draft synchronized successfully upon internet reconnection.',
      createdAt: new Date(draft.timestamp).toISOString(),
      orderType: 'wholesale',
      kraEtimSerial: `ETIMS-KE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    }));

    setOrders((prev) => [...newSyncedOrders, ...prev]);
    clearAllOfflineDrafts();
    setOfflineDraftsCount(0);
    setShowSyncPrompt(false);

    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
  };

  // Real-time cart sizing pairing validation
  const validation = useMemo(() => validateCartSizing(cartItems), [cartItems]);
  const unbalancedPairsCount = validation.discrepancies.reduce((sum, d) => sum + d.deficit, 0);

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === newItem.productId && i.size === newItem.size && i.color === newItem.color
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: copy[existingIdx].quantity + newItem.quantity,
        };
        return copy;
      }
      return [newItem, ...prev];
    });
    setIsCartOpen(true);
  };

  const handleAddProductReview = (
    productId: string,
    newReviewData: Omit<ProductReview, 'id' | 'productId' | 'reviewDate'>
  ) => {
    const createdReview: ProductReview = {
      id: `rev-${Date.now()}`,
      productId,
      reviewDate: new Date().toISOString().split('T')[0],
      ...newReviewData,
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const currentReviews = p.reviews || [];
          const updatedReviews = [createdReview, ...currentReviews];
          const avg =
            Math.round(
              (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length) * 10
            ) / 10;
          return {
            ...p,
            reviews: updatedReviews,
            rating: avg,
            reviewCount: updatedReviews.length,
          };
        }
        return p;
      })
    );

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleHelpfulVote = (productId: string, reviewId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            reviews: (p.reviews || []).map((r) =>
              r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
            ),
          };
        }
        return p;
      })
    );
  };

  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handlePayWithWallet = (amount: number, orderNumber: string) => {
    const res = deductCustomerWallet(amount, orderNumber);
    if (res.success) {
      setCustomer(getCurrentCustomer());
    }
    return res;
  };

  const handleCancelCustomerOrder = (orderId: string, reason: string) => {
    const orderToCancel = orders.find((o) => o.id === orderId);
    if (!orderToCancel) return;

    // Refund customer wallet if paid
    if (orderToCancel.paymentStatus === 'paid' || orderToCancel.paymentStatus === 'deposit_paid') {
      const refundAmount =
        orderToCancel.paymentMethod === 'lipa_pole_pole'
          ? orderToCancel.depositAmount || 0
          : orderToCancel.totalAmount;
      refundCustomerWallet(refundAmount, orderToCancel.orderNumber, reason);
      setCustomer(getCurrentCustomer());
    }

    // Update order status in orders list
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled',
              notes: `${o.notes ? `${o.notes} | ` : ''}Cancelled by customer (${reason}). Full 100% refund credited back to Blues Account Wallet.`,
            }
          : o
      )
    );
  };

  const handleUpdateCustomerOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  const handleReorderOrder = (order: Order) => {
    const newItems: CartItem[] = order.items.map((item) => {
      const parentProd =
        products.find((p) => p.id === item.productId) ||
        products.find((p) => p.title.toLowerCase() === item.productTitle.toLowerCase()) ||
        products[0];
      return {
        id: `${item.productId}-${item.size}-${item.color}-${Date.now()}-${Math.random()}`,
        productId: item.productId,
        product: parentProd,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      };
    });
    setCartItems((prev) => [...newItems, ...prev]);
    setIsCartOpen(true);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
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

  // Computer Friendly Global Keyboard Shortcuts (Esc closes, C toggles cart)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.tagName === 'SELECT');

      if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsGlobalAlertsModalOpen(false);
        setIsHeroMatrixOpen(false);
        setIsFlyerModalOpen(false);
        setIsPdfPriceSheetOpen(false);
        setIsStarterPacksModalOpen(false);
      }

      if (!isInput && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsCartOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Full-screen admin layout
  if (activeTab === 'admin') {
    return (
      <AdminPortal
        products={products}
        setProducts={setProducts}
        orders={orders}
        setOrders={setOrders}
        storeSettings={storeSettings}
        setStoreSettings={setStoreSettings}
        onClose={() => setActiveTab('catalog')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Offline Draft Synchronizer Toast */}
      {showSyncPrompt && offlineDraftsCount > 0 && (
        <div className={`bg-blue-900 text-white px-4 py-3 border-b border-blue-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in slide-in-from-top relative ${Z_INDEX.NAVBAR}`}>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Connected! You have <strong>{offlineDraftsCount}</strong> Market Day offline draft order{offlineDraftsCount > 1 ? 's' : ''} saved locally.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncOfflineDrafts}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Orders to Cloud Now</span>
            </button>
            <button
              onClick={() => setShowSyncPrompt(false)}
              className="p-1 text-blue-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFlyerGenerator={() => handleOpenFlyerGenerator()}
        onOpenPriceSheetPdf={() => setIsPdfPriceSheetOpen(true)}
        onOpenStarterPacks={() => setIsStarterPacksModalOpen(true)}
        storeSettings={storeSettings}
        unbalancedPairsCount={unbalancedPairsCount}
        customer={customer}
        onOpenGoogleLogin={() => setIsGoogleAuthModalOpen(true)}
        onOpenEmailLogin={() => setIsEmailAuthModalOpen(true)}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        myOrdersCount={orders.filter((o) => ['pending', 'verified', 'packing', 'dispatched'].includes(o.status)).length}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 pb-20 lg:pb-0">
        {activeTab === 'catalog' && (
          <>
            <HeroSection
              onBrowseCatalog={() => {
                const el = document.getElementById('catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenKisumuStore={() => setActiveTab('store')}
              storeSettings={storeSettings}
              onOpenBulkMatrixDemo={() => setIsHeroMatrixOpen(true)}
            />
            {/* Curated Pre-Packed Starter Reseller Bundles Section */}
            <StarterPacksSection
              starterPacks={STARTER_RESELLER_PACKS}
              onOpenStarterPacksModal={() => setIsStarterPacksModalOpen(true)}
              onAddStarterPackToCart={handleAddStarterPackToCart}
            />
            <ProductCatalog
              products={products}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              onOpen3DViewer={() => setActiveTab('3d-studio')}
              onOpenFlyerGenerator={(prod) => handleOpenFlyerGenerator(prod)}
              storeSettings={storeSettings}
              onAddReview={handleAddProductReview}
              onHelpfulVote={handleHelpfulVote}
            />
            <SizePairingGuide />
            <WhatsAppCommunityHub storeSettings={storeSettings} />
            <KisumuStoreLocator storeSettings={storeSettings} />
          </>
        )}

        {activeTab === '3d-studio' && (
          <ThreeStudioView
            products={products}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === 'store' && (
          <KisumuStoreLocator storeSettings={storeSettings} />
        )}

        {activeTab === 'pairing-guide' && (
          <SizePairingGuide />
        )}

        {activeTab === 'my-orders' && (
          <CustomerMyOrdersView
            orders={orders}
            customer={customer}
            storeSettings={storeSettings}
            onUpdateOrder={handleUpdateCustomerOrder}
            onCancelOrder={handleCancelCustomerOrder}
            onReorder={handleReorderOrder}
            onOpenWallet={() => setIsWalletModalOpen(true)}
            onOpenGoogleLogin={() => setIsGoogleAuthModalOpen(true)}
          />
        )}

        {activeTab === 'track-order' && (
          <OrderTracking orders={orders} storeSettings={storeSettings} />
        )}

        {activeTab === 'order-history' && (
          <OrderHistoryDashboard
            orders={orders}
            storeSettings={storeSettings}
            products={products}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onRecordPayment={handleRecordInstallmentPayment}
          />
        )}
      </main>

      {/* Slide-over Cart & Checkout Drawer with Real-Time Pairing & Lipa Pole Pole */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        validation={validation}
        storeSettings={storeSettings}
        onOrderCreated={handleOrderCreated}
        customer={customer}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenGoogleLogin={() => setIsGoogleAuthModalOpen(true)}
        onPayWithWallet={handlePayWithWallet}
        onNavigateToMyOrders={() => setActiveTab('my-orders')}
      />

      {/* Standard Email/Password Authentication Modal (Fallback to Google OAuth) */}
      <EmailAuthModal
        isOpen={isEmailAuthModalOpen}
        onClose={() => setIsEmailAuthModalOpen(false)}
        onSuccess={(updatedUser) => setCustomer(updatedUser)}
        onSwitchToGoogle={() => {
          setIsEmailAuthModalOpen(false);
          setIsGoogleAuthModalOpen(true);
        }}
        currentUser={customer}
      />

      {/* Google Account Authentication Modal */}
      <GoogleAuthModal
        isOpen={isGoogleAuthModalOpen}
        onClose={() => setIsGoogleAuthModalOpen(false)}
        onSuccess={(updatedUser) => setCustomer(updatedUser)}
        currentUser={customer}
      />

      {/* Blues Reseller Account Wallet Top-up & Ledger Modal */}
      <CustomerWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        customer={customer}
        onWalletUpdated={(updatedUser) => setCustomer(updatedUser)}
        storeSettings={storeSettings}
      />

      {/* Hero Quick Carton Matrix Modal */}
      {isHeroMatrixOpen && (
        <BulkCartonMatrixModal
          product={products[0]}
          isOpen={isHeroMatrixOpen}
          onClose={() => setIsHeroMatrixOpen(false)}
          onAddCartonToCart={(items) => {
            items.forEach((it) => handleAddToCart(it));
            setIsHeroMatrixOpen(false);
          }}
          storeSettings={storeSettings}
        />
      )}

      {/* Reseller WhatsApp Product Flyer & Price Card Generator Modal */}
      {isFlyerModalOpen && (
        <WhatsAppFlyerGeneratorModal
          product={flyerProduct}
          allProducts={products}
          isOpen={isFlyerModalOpen}
          onClose={() => setIsFlyerModalOpen(false)}
          storeSettings={storeSettings}
        />
      )}

      {/* WhatsApp Catalog PDF & Price Sheet Auto-Exporter Modal */}
      {isPdfPriceSheetOpen && (
        <WhatsAppCatalogPdfModal
          products={products}
          storeSettings={storeSettings}
          isOpen={isPdfPriceSheetOpen}
          onClose={() => setIsPdfPriceSheetOpen(false)}
        />
      )}

      {/* Pre-Packed Assorted Carton Bundles ("Starter Reseller Packs") Modal */}
      {isStarterPacksModalOpen && (
        <StarterResellerPacksModal
          isOpen={isStarterPacksModalOpen}
          onClose={() => setIsStarterPacksModalOpen(false)}
          starterPacks={STARTER_RESELLER_PACKS}
          products={products}
          onAddStarterPackToCart={(pack) => {
            handleAddStarterPackToCart(pack);
            setIsStarterPacksModalOpen(false);
          }}
        />
      )}

      {/* Persistent WhatsApp Floating Quick Widget */}
      <WhatsAppCommunityHub storeSettings={storeSettings} />

      {/* Real-time In-App Restock & Container Arrival Live Toast */}
      <LiveAlertToast
        onOpenAlertsModal={() => setIsGlobalAlertsModalOpen(true)}
        onSelectProduct={(productId) => {
          setActiveTab('catalog');
          setTimeout(() => {
            const el = document.getElementById(productId) || document.getElementById('catalog');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />

      {/* Global Warehouse Restock & Container Push Alerts Modal */}
      <InventoryAlertsModal
        isOpen={isGlobalAlertsModalOpen}
        onClose={() => setIsGlobalAlertsModalOpen(false)}
        onSelectProduct={(productId) => {
          setActiveTab('catalog');
          setTimeout(() => {
            const el = document.getElementById(productId) || document.getElementById('catalog');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />

      {/* Footer */}
      <Footer storeSettings={storeSettings} onNavigate={setActiveTab} />
    </div>
  );
}
