export type SizingRuleType = 'paired_ladies' | 'flexible_mens' | 'free_size';

export interface SizingPair {
  primarySize: number;      // e.g. 42
  requiredSize: number;     // e.g. 37
  ratio: number;            // 1:1
}

export interface WholesaleTier {
  minQuantity: number;      // e.g. 2, 6, 24
  pricePerUnit: number;     // in KSh
  label: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  resellerName: string;         // e.g. "Mama Stacy Shoes (Kibuye Market)"
  resellerLocation: string;     // e.g. "Kisumu County (Kibuye Depot)"
  rating: number;               // 1 to 5
  reviewDate: string;           // ISO date string or formatted date
  title?: string;
  comment: string;
  verifiedPurchase: boolean;    // Verified Reseller / Genuine Waybill badge
  businessType?: 'Physical Boutique' | 'Wholesale Carton Merchant' | 'WhatsApp / Instagram Vendor' | 'Open Air Market Stall';
  pairsPurchased?: number;      // e.g. 24 or 48 pairs
  turnoverSpeed?: string;       // e.g. "Sold out in 4 days"
  helpfulCount?: number;
  orderNumberRef?: string;      // e.g. "BC-2026-9104"
  replyFromDepot?: {
    author: string;
    message: string;
    date: string;
  };
}

export interface ProductVariant {
  id: string;
  size: number | string;    // e.g. 37, 42, or "Free Size"
  color: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold?: number; // Minimum stock alert threshold (e.g. 20 pairs)
}

export interface Product {
  id: string;
  title: string;
  category: 'ladies' | 'mens' | 'sneakers' | 'sandals' | 'boots';
  brand: string;
  description: string;
  buyingPrice?: number;      // Landed factory buying cost per pair (e.g. KSh 950)
  retailPrice: number;       // For 1 single pair (e.g. KSh 2800)
  wholesalePrice: number;     // Single wholesale price for 2+ pairs (e.g. KSh 1550)
  wholesaleTiers?: WholesaleTier[];
  sizingRuleType: SizingRuleType;
  pairingRules?: SizingPair[];
  variants: ProductVariant[];
  allowedColors?: string[];
  imageUrl: string;
  additionalImages?: string[];
  has3DModel?: boolean;
  isActive: boolean;
  moq: number;               // Minimum Order Quantity (usually 1 or 2)
  tag?: string;
  defaultLowStockThreshold?: number; // Product-level low stock threshold (e.g. 25)
  rating?: number;                   // Average reseller rating (e.g. 4.9)
  reviewCount?: number;              // Total number of reviews (e.g. 18)
  reviews?: ProductReview[];         // Reseller ratings and comments
}

export interface CartItem {
  id: string;                // `${productId}-${size}-${color}`
  productId: string;
  product: Product;
  size: number | string;
  color: string;
  quantity: number;
  unitPrice: number;         // Current effective unit price
}

export interface PairingDiscrepancy {
  primarySize: number;       // e.g. 42
  primaryQty: number;
  requiredSize: number;      // e.g. 37
  requiredQty: number;
  deficit: number;           // Quantity of requiredSize missing
}

export interface CartValidationResult {
  isValid: boolean;
  hasLadiesPairing: boolean;
  discrepancies: PairingDiscrepancy[];
  notificationMessage?: string;
  standaloneSmallSizesOnly: boolean;
}

export type OrderStatus = 'pending' | 'verified' | 'packing' | 'dispatched' | 'completed' | 'cancelled';
export type PaymentMethod = 'mpesa_stk' | 'mpesa_till' | 'mpesa_paybill' | 'lipa_pole_pole' | 'cash_pickup' | 'wallet_balance';
export type CourierPartner = 'Guardian Angel' | 'Easy Coach' | 'Fargo Courier' | 'Kisumu Matatu Shuttle' | 'Direct Shop Pickup';

export interface OrderItemRecord {
  productId: string;
  productTitle: string;
  size: number | string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitBuyingPrice?: number;  // Cost/buying price per pair
  totalCost?: number;        // unitBuyingPrice * quantity
  itemProfit?: number;       // totalPrice - totalCost
}

export interface InstallmentPayment {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  mpesaReceipt: string;
  recordedAt: string;
  recordedBy: string; // e.g. "Kisumu Depot Daraja API", "Eldoret Stage Conductor Juma"
  stageLocation?: string; // e.g. "Eldoret Zion Mall Guardian Stage"
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;       // e.g. "BC-2026-8942"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  recipientPhone?: string;
  deliveryTown: string;
  busStage?: string;
  deliveryType: 'parcel_delivery' | 'shop_pickup';
  courier: CourierPartner;
  items: OrderItemRecord[];
  subtotal: number;
  wholesaleSavings: number;
  totalAmount: number;
  totalCost?: number;        // Total landed buying cost
  netProfit?: number;        // Net gross profit = totalAmount - totalCost
  profitMarginPct?: number;  // Margin percentage = (netProfit / totalAmount) * 100
  depositAmount?: number;    // For Lipa Pole Pole (30%)
  balanceDue?: number;       // Remaining 70% upon bus collection
  layawayDueDate?: string;   // Due date for balance clearance
  installmentPayments?: InstallmentPayment[]; // Ledger of installment entries
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'deposit_paid' | 'pending' | 'failed';
  mpesaReceipt?: string;
  status: OrderStatus;
  waybillNumber?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  orderType: 'wholesale' | 'retail';
  kraEtimSerial?: string;
}

export interface CountyShippingRate {
  countyCode: string;          // e.g. "047", "001", "027"
  countyName: string;          // e.g. "Nairobi", "Mombasa", "Uasin Gishu"
  capitalTown: string;         // e.g. "Eldoret", "Kisumu", "Nairobi CBD"
  primaryStage: string;        // e.g. "Zion Mall Stage", "OTC Stage", "Swan Centre"
  courierPartner: CourierPartner; // e.g. "Guardian Angel", "Easy Coach", "Fargo Courier"
  parcelRatePerCarton: number; // e.g. KSh 350
  ratePerPair: number;         // e.g. KSh 40
  estimatedDeliveryTime: string; // e.g. "Next Morning (8:00 AM - 10:00 AM)", "Same Day (4 Hours)"
  dispatchCutoff: string;      // e.g. "4:00 PM Express Daily"
  isActive: boolean;
  region: 'Lake Basin & Western' | 'Rift Valley' | 'Central & Nairobi' | 'Eastern & Coast' | 'Northern Kenya';
}

export interface StoreSettings {
  shopName: string;
  locationAddress: string;
  landmark: string;
  city: string;
  country: string;
  kisumuPhone1: string;
  kisumuPhone2: string;
  whatsappNumber: string;
  whatsappGroupUrl: string;
  mpesaPaybill: string;
  mpesaPaybillAccountNumber: string;
  mpesaTill: string;
  kraPin: string;
  workingHours: string;
  shippingRates?: CountyShippingRate[];
  globalLowStockThreshold?: number; // Global threshold fallback (e.g. 20 pairs)
  fuelSurgeMultiplier?: number;     // e.g. 1.0 (baseline), 1.15 (+15% holiday/fuel surge), 0.9 (-10% promo)
  fuelSurchargePerCarton?: number;  // e.g. KSh 0 or KSh 50 flat EPRA fuel levy
  fuelSurgeReason?: string;         // e.g. "Standard EPRA Fuel Tariff", "December Peak Fleet Surge", "Subsidized County Promo"
  freeShippingEnabled?: boolean;    // Free parcel delivery for bulk wholesale
  freeShippingThresholdPairs?: number; // e.g. 48 pairs (2 master cartons)
}

// Reseller Profit & Margin Simulator Profile
export interface ResellerProfitModel {
  townName: string;
  suggestedRetailPrice: number;
  estimatedPairsPerMonth: number;
  localTransportPerPair: number;
}

// Pre-Packed Assorted Carton Bundle ("Starter Reseller Pack")
export interface StarterPackIncludedItem {
  productId: string;
  productTitle: string;
  imageUrl: string;
  color: string;
  pairs: number;
  sizeBreakdown: { [size: string]: number };
}

export interface StarterPack {
  id: string;
  title: string;
  badge: string; // e.g. "Best for Boutiques", "Fastest Turnover", "Campus Hot Pick"
  category: 'ladies' | 'mens' | 'sneakers' | 'boots' | 'sandals' | 'mixed';
  targetMerchant: string; // e.g. "Physical Town Boutiques & High-Traffic Malls"
  description: string;
  totalPairs: number;
  totalCartons: number;
  bundleWholesalePrice: number;
  originalWholesalePrice: number;
  bundleDiscountPct: number;
  suggestedRetailRevenue: number;
  estimatedNetProfit: number;
  expectedTurnoverDays: string; // e.g. "4 - 7 Days"
  marginPct: number; // e.g. 48.5%
  includedItems: StarterPackIncludedItem[];
  highlights: string[];
  recommendedCounties: string[]; // e.g. ["Kisumu", "Eldoret", "Kakamega", "Nairobi", "Nakuru"]
}

// Offline Market Day Draft Order
export interface OfflineDraftOrder {
  id: string;
  timestamp: number;
  items: CartItem[];
  customerPhone: string;
  customerName: string;
  deliveryTown: string;
  courier: CourierPartner;
  isLipaPolePole: boolean;
  totalAmount: number;
}

