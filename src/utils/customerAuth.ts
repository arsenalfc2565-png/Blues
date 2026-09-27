// Customer Authentication & Blues Reseller Account Wallet Service

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'order_payment' | 'order_refund';
  amount: number;
  description: string;
  timestamp: string;
  reference: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  authProvider: 'google' | 'direct' | 'phone' | 'guest';
  walletBalance: number;
  savedDeliveryTown?: string;
  savedDeliveryStage?: string;
  businessName?: string;
  password?: string;
  createdAt?: string;
  walletTransactions: WalletTransaction[];
}

const STORAGE_KEY = 'blues_active_customer_profile';
const ACCOUNTS_STORAGE_KEY = 'blues_registered_accounts_registry';

// Default initial logged-in user pre-configured with active wallet
const DEFAULT_CUSTOMER: CustomerUser = {
  id: 'usr-google-2565',
  name: 'Brian Otieno',
  email: 'seapower2565@gmail.com',
  phone: '0722894210',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  authProvider: 'google',
  walletBalance: 32500, // Preloaded balance so they can test instant wallet checkout right away!
  savedDeliveryTown: 'Eldoret',
  savedDeliveryStage: 'Zion Mall Stage (Guardian Angel)',
  businessName: 'Otieno Premium Footwear Eldoret',
  password: 'password123',
  createdAt: '2026-01-15T08:00:00.000Z',
  walletTransactions: [
    {
      id: 'tx-init-1',
      type: 'topup',
      amount: 40000,
      description: 'M-Pesa Till Deposit via 0722894210',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      reference: 'QGK7824190',
    },
    {
      id: 'tx-init-2',
      type: 'order_payment',
      amount: 7500,
      description: 'Order Payment for BC-2026-8942 (Milan Loafers)',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      reference: 'ORD-BC-8942',
    },
  ],
};

const SEED_ACCOUNTS: CustomerUser[] = [
  DEFAULT_CUSTOMER,
  {
    id: 'usr-direct-101',
    name: 'Grace Wanjiku',
    email: 'wanjiku.footwear@gmail.com',
    phone: '0711456789',
    avatarUrl: '',
    authProvider: 'direct',
    walletBalance: 15000,
    savedDeliveryTown: 'Nakuru',
    savedDeliveryStage: 'Gate House Stage (EasyCoach)',
    businessName: 'Wanjiku Classic Shoes Nakuru',
    password: 'password123',
    createdAt: '2026-02-10T10:30:00.000Z',
    walletTransactions: [
      {
        id: 'tx-init-wanjiku-1',
        type: 'topup',
        amount: 15000,
        description: 'M-Pesa Till Deposit via 0711456789',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        reference: 'QHL9941201',
      }
    ]
  }
];

export const getRegisteredAccounts = (): CustomerUser[] => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse registered accounts', e);
  }
  return SEED_ACCOUNTS;
};

export const saveRegisteredAccounts = (accounts: CustomerUser[]): void => {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to save registered accounts', e);
  }
};

export const getCurrentCustomer = (): CustomerUser => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.email || parsed.phone || parsed.name)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse customer profile', e);
  }
  return DEFAULT_CUSTOMER;
};

export const saveCurrentCustomer = (user: CustomerUser): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('blues_customer_auth_changed', { detail: user }));
  } catch (e) {
    console.warn('Failed to save customer profile', e);
  }
};

/**
 * Direct Account Registration (Email/Phone + Password without Google)
 */
export const registerDirectAccount = (params: {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  businessName?: string;
  deliveryTown?: string;
  deliveryStage?: string;
}): { success: boolean; user?: CustomerUser; error?: string } => {
  const name = params.name.trim();
  const phone = params.phone.trim().replace(/\s+/g, '');
  const email = (params.email || '').trim().toLowerCase();
  const password = params.password || 'password123';
  const businessName = (params.businessName || `${name.split(' ')[0]}'s Reseller Shop`).trim();
  const deliveryTown = params.deliveryTown || 'Nairobi';
  const deliveryStage = params.deliveryStage || 'Main Town Bus Stage';

  if (!name || name.length < 2) {
    return { success: false, error: 'Please enter your full legal or trading name.' };
  }

  if (!phone || phone.length < 9) {
    return { success: false, error: 'Please enter a valid Safaricom phone number (e.g., 0712345678).' };
  }

  const existingAccounts = getRegisteredAccounts();
  const emailExists = email && existingAccounts.some((a) => a.email && a.email.toLowerCase() === email);
  const phoneExists = existingAccounts.some((a) => a.phone && a.phone.replace(/\s+/g, '') === phone);

  if (emailExists) {
    return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
  }

  if (phoneExists) {
    return { success: false, error: 'An account with this phone number already exists. Please sign in instead.' };
  }

  const newAccountId = `usr-direct-${Date.now()}`;
  const initialWalletBonus = 5000; // Welcome promotional credit to test checkout

  const newUser: CustomerUser = {
    id: newAccountId,
    name,
    email: email || `${phone}@blueswholesale.co.ke`,
    phone,
    authProvider: 'direct',
    walletBalance: initialWalletBonus,
    savedDeliveryTown: deliveryTown,
    savedDeliveryStage: deliveryStage,
    businessName,
    password,
    createdAt: new Date().toISOString(),
    walletTransactions: [
      {
        id: `tx-welcome-${Date.now()}`,
        type: 'topup',
        amount: initialWalletBonus,
        description: 'Blues Wholesale New Reseller Welcome Credit',
        timestamp: new Date().toISOString(),
        reference: `WELCOME-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    ],
  };

  const updatedRegistry = [newUser, ...existingAccounts];
  saveRegisteredAccounts(updatedRegistry);
  saveCurrentCustomer(newUser);

  return { success: true, user: newUser };
};

/**
 * Direct Account Sign In (Email or Phone + Password)
 */
export const loginWithDirectAccount = (
  identifier: string,
  password?: string
): { success: boolean; user?: CustomerUser; error?: string } => {
  const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, '');
  const accounts = getRegisteredAccounts();

  const user = accounts.find((a) => {
    const emailMatch = a.email && a.email.toLowerCase() === cleanId;
    const phoneMatch = a.phone && a.phone.replace(/\s+/g, '').toLowerCase() === cleanId;
    return emailMatch || phoneMatch;
  });

  if (!user) {
    return {
      success: false,
      error: 'No account found matching this email or phone number. Please check your credentials or create a new account.',
    };
  }

  if (password && user.password && user.password !== password) {
    return {
      success: false,
      error: 'Incorrect password entered. Please check your password or reset it.',
    };
  }

  saveCurrentCustomer(user);
  return { success: true, user };
};

/**
 * Fast Google OAuth Sign In
 */
export const loginWithGoogleAccount = (
  email: string = 'seapower2565@gmail.com',
  name: string = 'Brian Otieno',
  avatarUrl?: string
): CustomerUser => {
  const existing = getCurrentCustomer();
  const updatedUser: CustomerUser = {
    ...existing,
    id: `usr-google-${Date.now()}`,
    name,
    email,
    avatarUrl:
      avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authProvider: 'google',
  };

  // Also add to registry if not present
  const accounts = getRegisteredAccounts();
  if (!accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
    saveRegisteredAccounts([updatedUser, ...accounts]);
  }

  saveCurrentCustomer(updatedUser);
  return updatedUser;
};

export const logoutCustomerAccount = (): void => {
  const guestUser: CustomerUser = {
    id: `usr-guest-${Date.now()}`,
    name: 'Guest Reseller',
    email: '',
    phone: '',
    authProvider: 'guest',
    walletBalance: 0,
    walletTransactions: [],
  };
  saveCurrentCustomer(guestUser);
};

// Wallet operations
export const topUpCustomerWallet = (
  amount: number,
  mpesaRef: string = `MP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
): CustomerUser => {
  const current = getCurrentCustomer();
  const tx: WalletTransaction = {
    id: `tx-topup-${Date.now()}`,
    type: 'topup',
    amount,
    description: `M-Pesa Deposit to Blues Wallet (Ref: ${mpesaRef})`,
    timestamp: new Date().toISOString(),
    reference: mpesaRef,
  };

  const updated: CustomerUser = {
    ...current,
    walletBalance: current.walletBalance + amount,
    walletTransactions: [tx, ...(current.walletTransactions || [])],
  };

  saveCurrentCustomer(updated);

  // Also update registry
  const accounts = getRegisteredAccounts().map((a) => (a.id === updated.id ? updated : a));
  saveRegisteredAccounts(accounts);

  return updated;
};

export const deductCustomerWallet = (
  amount: number,
  orderNumber: string
): { success: boolean; newBalance: number; error?: string } => {
  const current = getCurrentCustomer();
  if (current.walletBalance < amount) {
    return {
      success: false,
      newBalance: current.walletBalance,
      error: `Insufficient wallet balance. Available: KSh ${current.walletBalance.toLocaleString()}, Needed: KSh ${amount.toLocaleString()}. Please top up your wallet or pay with M-Pesa.`,
    };
  }

  const tx: WalletTransaction = {
    id: `tx-pay-${Date.now()}`,
    type: 'order_payment',
    amount,
    description: `1-Click Wallet Checkout for Order ${orderNumber}`,
    timestamp: new Date().toISOString(),
    reference: orderNumber,
  };

  const updated: CustomerUser = {
    ...current,
    walletBalance: current.walletBalance - amount,
    walletTransactions: [tx, ...(current.walletTransactions || [])],
  };

  saveCurrentCustomer(updated);

  // Also update registry
  const accounts = getRegisteredAccounts().map((a) => (a.id === updated.id ? updated : a));
  saveRegisteredAccounts(accounts);

  return { success: true, newBalance: updated.walletBalance };
};

export const refundCustomerWallet = (
  amount: number,
  orderNumber: string,
  reason: string
): CustomerUser => {
  const current = getCurrentCustomer();
  const tx: WalletTransaction = {
    id: `tx-ref-${Date.now()}`,
    type: 'order_refund',
    amount,
    description: `Instant 100% Refund for Cancelled Order ${orderNumber} (${reason})`,
    timestamp: new Date().toISOString(),
    reference: orderNumber,
  };

  const updated: CustomerUser = {
    ...current,
    walletBalance: current.walletBalance + amount,
    walletTransactions: [tx, ...(current.walletTransactions || [])],
  };

  saveCurrentCustomer(updated);

  // Also update registry
  const accounts = getRegisteredAccounts().map((a) => (a.id === updated.id ? updated : a));
  saveRegisteredAccounts(accounts);

  return updated;
};
