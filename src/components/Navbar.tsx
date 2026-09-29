import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  MapPin,
  X,
  FileText,
  Wifi,
  WifiOff,
  ZoomIn,
  Smartphone,
  Package,
  Printer,
  Bell,
  Wallet,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Mail,
  ChevronDown,
  Menu,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Store,
  Layers,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { StoreSettings } from '../types';
import { isDeviceOnline, getOfflineDrafts } from '../utils/offlineStorage';
import { LogoLightboxModal } from './LogoLightboxModal';
import { InventoryAlertsModal } from './InventoryAlertsModal';
import { useLanguage, SUPPORTED_LANGUAGES } from '../utils/i18n';
import { getAlertsHistory } from '../utils/pushNotificationService';
import { CustomerUser, logoutCustomerAccount } from '../utils/customerAuth';
import { useTheme } from '../utils/theme';
import { Z_INDEX } from '../constants/zIndex';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeTab: 'catalog' | '3d-studio' | 'store' | 'pairing-guide' | 'track-order' | 'order-history' | 'my-orders' | 'admin';
  setActiveTab: (tab: 'catalog' | '3d-studio' | 'store' | 'pairing-guide' | 'track-order' | 'order-history' | 'my-orders' | 'admin') => void;
  onOpenFlyerGenerator?: () => void;
  onOpenPriceSheetPdf?: () => void;
  onOpenStarterPacks?: () => void;
  storeSettings: StoreSettings;
  unbalancedPairsCount: number;
  pendingKisumuCount?: number;
  customer?: CustomerUser;
  onOpenGoogleLogin?: () => void;
  onOpenEmailLogin?: () => void;
  onOpenWallet?: () => void;
  myOrdersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  activeTab,
  setActiveTab,
  onOpenFlyerGenerator,
  onOpenPriceSheetPdf,
  onOpenStarterPacks,
  storeSettings,
  unbalancedPairsCount,
  pendingKisumuCount = 2,
  customer,
  onOpenGoogleLogin,
  onOpenEmailLogin,
  onOpenWallet,
  myOrdersCount = 0,
}) => {
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineDraftCount, setOfflineDraftCount] = useState(0);
  const [isLogoLightboxOpen, setIsLogoLightboxOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(() => {
    return getAlertsHistory().filter((a) => !a.read).length;
  });

  // Close account menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateAlertsCount = () => {
      setUnreadAlertsCount(getAlertsHistory().filter((a) => !a.read).length);
    };

    window.addEventListener('blues_alerts_history_changed', updateAlertsCount);
    window.addEventListener('blues_inventory_alert_broadcast', updateAlertsCount);

    return () => {
      window.removeEventListener('blues_alerts_history_changed', updateAlertsCount);
      window.removeEventListener('blues_inventory_alert_broadcast', updateAlertsCount);
    };
  }, []);

  useEffect(() => {
    setIsOnline(isDeviceOnline());
    setOfflineDraftCount(getOfflineDrafts().length);

    const handleOnline = () => {
      setIsOnline(true);
      setOfflineDraftCount(getOfflineDrafts().length);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineDraftCount(getOfflineDrafts().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className={`sticky top-0 ${Z_INDEX.NAVBAR} bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-2xs transition-colors duration-200`}>
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY BAR (Dispatch Status & Mobile Wallet Placement)           */}
      {/* ========================================================================= */}
      {showTopBanner && (
        <div className="bg-neutral-950 text-white text-xs py-1 px-2.5 sm:px-6 border-b border-neutral-800">
          <div className="max-w-[1580px] mx-auto flex items-center justify-between gap-2">
            
            {/* Left: Live Depot Location Info */}
            <div className="flex items-center gap-1.5 truncate text-[11px]">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="font-bold text-white shrink-0 text-[11px]">Swan Centre Depot</span>
              <span className="text-neutral-600 hidden sm:inline">·</span>
              <span className="text-neutral-300 truncate hidden md:inline text-[11px]">
                Daily Dispatches via Guardian & EasyCoach
              </span>
            </div>

            {/* Right: Mobile Wallet Pill & Desktop Fast Reseller Tools */}
            <div className="flex items-center gap-2 shrink-0">
              {/* On Mobile: Prominent Preloaded Wallet Pill directly in Top Bar */}
              {customer && (
                <button
                  type="button"
                  onClick={onOpenWallet}
                  title="Blues Reseller Preloaded Wallet Balance"
                  className="md:hidden inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  <span className="font-mono text-emerald-400">
                    KSh {customer.walletBalance.toLocaleString()}
                  </span>
                  <span className="text-[9px] bg-blue-600 text-white px-1 rounded font-sans">
                    + Top Up
                  </span>
                </button>
              )}

              {/* Starter Packs Quick Pill (Desktop) */}
              {onOpenStarterPacks && (
                <button
                  type="button"
                  onClick={onOpenStarterPacks}
                  title="Open Pre-Packed Starter Reseller Cartons"
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[10px] transition-colors cursor-pointer"
                >
                  <Package className="w-3 h-3" />
                  <span>Starter Packs</span>
                </button>
              )}

              {/* PDF Price Sheet Pill (Desktop) */}
              {onOpenPriceSheetPdf && (
                <button
                  type="button"
                  onClick={onOpenPriceSheetPdf}
                  title="Download or Print B2B Wholesale Price Sheet PDF"
                  className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-[10px] border border-neutral-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-3 h-3 text-blue-400" />
                  <span>Price Sheet PDF</span>
                </button>
              )}

              {/* Flyer Maker Pill (Desktop) */}
              {onOpenFlyerGenerator && (
                <button
                  type="button"
                  onClick={onOpenFlyerGenerator}
                  title="Open WhatsApp Product Flyer & Price Card Maker"
                  className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold text-[10px] border border-emerald-800 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                  <span>Flyer Maker</span>
                </button>
              )}

              {/* VIP WhatsApp Community Link (Desktop) */}
              <a
                href={storeSettings.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Join VIP Wholesale WhatsApp Group"
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-semibold transition-colors"
              >
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span>VIP WhatsApp</span>
              </a>

              {/* Offline / Cloud Status Pill */}
              {!isOnline ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </span>
              ) : (
                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                  <Wifi className="w-3 h-3" />
                  <span>Cloud Active</span>
                </span>
              )}

              <button
                onClick={() => setShowTopBanner(false)}
                aria-label="Dismiss top banner"
                className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors ml-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN HEADER BAR (Strictly Fits Mobile Displays Without Clipping)       */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1580px] mx-auto px-2 sm:px-6 lg:px-8 h-14 sm:h-18 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* LEFT ZONE: MOBILE HAMBURGER + LOGO & WORDMARK */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          {/* Mobile Hamburger Trigger (Only on screens < lg) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
            title="Open navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-neutral-900 dark:text-white" /> : <Menu className="w-5 h-5 text-neutral-900 dark:text-white" />}
          </button>

          {/* Official Brand Logo Emblem */}
          <button
            type="button"
            onClick={() => setIsLogoLightboxOpen(true)}
            title="Inspect official brand emblem"
            className="group/logo relative w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden ring-1.5 sm:ring-2 ring-blue-600/40 shadow-xs hover:scale-105 transition-all bg-neutral-950 flex items-center justify-center shrink-0 cursor-pointer focus:outline-none"
          >
            <img
              src="/blues_brand_logo_1790333662232.jpg"
              alt="Blues Collection Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover/logo:scale-110"
            />
          </button>

          {/* Brand Name Text */}
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className="text-left group/text focus:outline-none cursor-pointer truncate"
          >
            <span className="font-display font-black text-sm sm:text-lg lg:text-xl tracking-tight text-neutral-950 dark:text-white block leading-tight group-hover/text:text-blue-600 dark:group-hover/text:text-blue-400 transition-colors truncate">
              Blues Collection
            </span>
            <span className="hidden sm:flex text-[10px] font-bold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase items-center gap-1.5">
              <span>Wholesale Depot Kisumu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
          </button>
        </div>

        {/* CENTER ZONE: DESKTOP PRIMARY TABS (Hidden on mobile/tablet) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-semibold text-neutral-600 dark:text-neutral-300 shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`hover:text-blue-700 dark:hover:text-blue-400 transition-colors relative py-1.5 cursor-pointer ${
              activeTab === 'catalog' ? 'text-blue-700 dark:text-blue-400 font-bold' : ''
            }`}
          >
            Wholesale Catalog
            {activeTab === 'catalog' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('3d-studio')}
            className={`hover:text-blue-700 dark:hover:text-blue-400 transition-colors relative py-1.5 flex items-center gap-1.5 cursor-pointer ${
              activeTab === '3d-studio' ? 'text-blue-700 dark:text-blue-400 font-bold' : ''
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            3D Studio & Flex
            {activeTab === '3d-studio' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pairing-guide')}
            className={`hover:text-blue-700 dark:hover:text-blue-400 transition-colors relative py-1.5 cursor-pointer ${
              activeTab === 'pairing-guide' ? 'text-blue-700 dark:text-blue-400 font-bold' : ''
            }`}
          >
            Size Pairing Rules
            {activeTab === 'pairing-guide' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`hover:text-blue-700 dark:hover:text-blue-400 transition-colors relative py-1.5 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'store' ? 'text-blue-700 dark:text-blue-400 font-bold' : ''
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            Kisumu Store
            {activeTab === 'store' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* RIGHT ZONE: ACTIONS (STRICTLY COMPACT & VISIBLE ON ALL SCREENS) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Desktop "My Orders" Button */}
          <button
            type="button"
            onClick={() => setActiveTab('my-orders')}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'my-orders'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-2xs'
                : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700'
            }`}
            title="View My Orders, Bus Tracking & Invoices"
          >
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>My Orders</span>
            {myOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold">
                {myOrdersCount}
              </span>
            )}
          </button>

          {/* Desktop Blues Wallet Pill */}
          {customer && (
            <button
              type="button"
              onClick={onOpenWallet}
              title="Blues Reseller Wallet (Preloaded Funds)"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white transition-all shadow-xs cursor-pointer border border-neutral-700 group/wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left leading-tight">
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider block font-medium">Wallet</span>
                <span className="font-mono text-emerald-400 font-black">
                  KSh {customer.walletBalance.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-blue-300 bg-blue-900/70 group-hover/wallet:bg-blue-800 px-1.5 py-0.5 rounded font-bold transition-colors">
                + Top Up
              </span>
            </button>
          )}

          {/* 1. RESELLER LIVE ALERT BELL (ALWAYS 100% VISIBLE ON MOBILE & DESKTOP) */}
          <button
            type="button"
            onClick={() => setIsAlertsModalOpen(true)}
            title="Warehouse Restock & Live Push Alerts"
            className="relative p-1.5 sm:p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-mono font-bold text-white shadow-xs ring-1 ring-white animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* 2. TAILWIND DARK / LIGHT MODE TOGGLE (SMOOTH THEME SWITCHER) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode (Day)' : 'Switch to Dark Mode (Night)'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="relative p-1.5 sm:p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all cursor-pointer shrink-0 shadow-2xs group"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* 2. RESELLER ACCOUNT / SIGN IN & REGISTRATION (100% VISIBLE ON MOBILE & DESKTOP) */}
          <div className="relative shrink-0" ref={accountMenuRef}>
            {customer && customer.authProvider !== 'guest' && (customer.email || customer.name || customer.phone) ? (
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                title={`Reseller Account: ${customer.name} (${customer.email || customer.phone})`}
                className="inline-flex items-center gap-1 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-blue-400 bg-white dark:bg-neutral-800 hover:bg-blue-50/40 dark:hover:bg-neutral-700 transition-all cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0"
              >
                <div className="relative shrink-0">
                  {customer.avatarUrl ? (
                    <img
                      src={customer.avatarUrl}
                      alt={customer.name}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-blue-500 shadow-2xs"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-neutral-900 rounded-full p-0.5 shadow-2xs border border-neutral-100 dark:border-neutral-800">
                    {customer.authProvider === 'google' ? (
                      <svg className="w-2 sm:w-2.5 h-2 sm:h-2.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
                      </svg>
                    ) : (
                      <span className="text-[8px] leading-none">⚡</span>
                    )}
                  </span>
                </div>
                <span className="hidden sm:inline font-bold text-neutral-900 dark:text-white truncate max-w-[85px]">
                  {customer.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenGoogleLogin}
                title="Create Account or Sign In"
                className="inline-flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-3 sm:py-2 text-xs font-bold rounded-xl border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Sign In / Join</span>
              </button>
            )}

            {/* Reseller Account Dropdown Popover Menu */}
            {isAccountMenuOpen && customer && (
              <div className={`absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl py-3 px-2 ${Z_INDEX.NAVBAR_DROPDOWN} animate-in fade-in zoom-in-95 text-xs text-neutral-800 dark:text-neutral-200`}>
                {/* User Info Header Card */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/70 rounded-xl border border-neutral-100 dark:border-neutral-700/60 space-y-1 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">{customer.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      customer.authProvider === 'google'
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                        : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                    }`}>
                      {customer.authProvider === 'google' ? 'Google' : 'Direct Account'}
                    </span>
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400 truncate text-[11px]">{customer.email || 'No email provided'}</div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-[11px]">Tel: {customer.phone}</div>
                  {customer.businessName && (
                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-[10px] pt-0.5">
                      Shop: {customer.businessName}
                    </div>
                  )}
                </div>

                {/* Wallet Balance Summary Card */}
                <div className="p-3 bg-neutral-950 dark:bg-neutral-800 text-white rounded-xl flex items-center justify-between mb-2 border border-neutral-800 dark:border-neutral-700">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Wallet Balance</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      KSh {customer.walletBalance.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onOpenWallet?.();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    + Top Up
                  </button>
                </div>

                {/* Nav Links */}
                <div className="space-y-1 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setActiveTab('my-orders');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>My Orders & Parcels</span>
                    </span>
                    {myOrdersCount > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                        {myOrdersCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setActiveTab('order-history');
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    <span>Orders & M-Pesa Invoices</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setActiveTab('track-order');
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium transition-colors cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    <span>Track Bus Consignment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setActiveTab(activeTab === 'admin' ? 'catalog' : 'admin');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>Admin Management Portal</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">B2B</span>
                  </button>
                </div>

                {/* Account Switcher & Sign Out */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 mt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onOpenEmailLogin ? onOpenEmailLogin() : onOpenGoogleLogin?.();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Email & Password Auth</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono px-1.5 py-0.5 rounded font-bold">
                      Direct
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onOpenGoogleLogin?.();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-blue-600 dark:text-blue-400 font-semibold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>Switch / Add Account</span>
                    </span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                      + Create
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      logoutCustomerAccount();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. SHOPPING CART BUTTON (ALWAYS 100% VISIBLE ON MOBILE & DESKTOP) */}
          <button
            onClick={onOpenCart}
            aria-label="Open Shopping Cart"
            className="relative flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition-all shadow-md shadow-blue-700/20 active:scale-95 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono tabular-nums leading-none">
              <span className="hidden xs:inline mr-0.5">Cart</span>
              ({cartCount})
            </span>
            {unbalancedPairsCount > 0 && (
              <span
                title={`${unbalancedPairsCount} sizing pairing alert!`}
                className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white shadow-xs ring-1 ring-white"
              >
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE SLIDE-DOWN DRAWER MENU (When Hamburger is Tapped)              */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-2xl px-4 py-4 space-y-4 animate-in slide-in-from-top-2 text-sm max-h-[85vh] overflow-y-auto">
          {/* Mobile User Card & Wallet */}
          {customer && customer.authProvider !== 'guest' && (customer.email || customer.name || customer.phone) ? (
            <div className="bg-neutral-900 dark:bg-neutral-800 text-white p-3.5 rounded-2xl space-y-2.5 shadow-xs border border-neutral-800 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white block">{customer.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-900 text-blue-200 font-mono">
                        {customer.authProvider === 'google' ? 'Google' : 'Direct'}
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-xs">
                      Wallet: KSh {customer.walletBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWallet?.();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  + Top Up
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenGoogleLogin?.();
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  Switch / Add Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logoutCustomerAccount();
                  }}
                  className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenGoogleLogin?.();
              }}
              className="w-full p-3 rounded-2xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account or Sign In</span>
            </button>
          )}

          {/* Theme Mode Segmented Controller in Mobile Drawer */}
          <div className="bg-neutral-50 dark:bg-neutral-800/80 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-200">
              <span className="flex items-center gap-1.5">
                {isDark ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Appearance & Theme</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold">
                {theme}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-200/70 dark:bg-neutral-900 rounded-xl">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              Wholesale Catalog
            </button>

            <button
              onClick={() => {
                setActiveTab('my-orders');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'my-orders'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <span>My Orders</span>
              {myOrdersCount > 0 && (
                <span className="bg-blue-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {myOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('3d-studio');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeTab === '3d-studio'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              3D Studio & Flex
            </button>

            <button
              onClick={() => {
                setActiveTab('pairing-guide');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeTab === 'pairing-guide'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              Size Pairing Rules
            </button>

            <button
              onClick={() => {
                setActiveTab('store');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              Kisumu Store
            </button>

            <button
              onClick={() => {
                setActiveTab('order-history');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                activeTab === 'order-history'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              Invoices & Statements
            </button>
          </div>

          {/* Quick Reseller Tools in Mobile Drawer */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-2 text-xs">
            {onOpenStarterPacks && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenStarterPacks();
                }}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Starter Packs</span>
              </button>
            )}

            {onOpenFlyerGenerator && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenFlyerGenerator();
                }}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Flyer Maker</span>
              </button>
            )}

            {onOpenPriceSheetPdf && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenPriceSheetPdf();
                }}
                className="p-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Price Sheet PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setActiveTab(activeTab === 'admin' ? 'catalog' : 'admin');
              }}
              className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-200 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MOBILE STICKY BOTTOM NAVIGATION BAR (Jumia / Amazon Style)             */}
      {/* Ensures Cart, Orders, Wallet & Catalog are ALWAYS 1 Thumb Away on Mobile  */}
      {/* ========================================================================= */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${Z_INDEX.NAVBAR} bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 py-1.5 px-3 flex items-center justify-around shadow-xl transition-colors`}>
        {/* Catalog */}
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'catalog' ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Catalog</span>
        </button>

        {/* 3D Studio */}
        <button
          type="button"
          onClick={() => setActiveTab('3d-studio')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === '3d-studio' ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3D Studio</span>
        </button>

        {/* My Orders */}
        <button
          type="button"
          onClick={() => setActiveTab('my-orders')}
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'my-orders' ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders</span>
          {myOrdersCount > 0 && (
            <span className="absolute top-0 right-1 px-1 rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold leading-tight">
              {myOrdersCount}
            </span>
          )}
        </button>

        {/* Wallet */}
        {customer && (
          <button
            type="button"
            onClick={onOpenWallet}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-emerald-600 dark:text-emerald-400">KSh {Math.round(customer.walletBalance / 1000)}k</span>
          </button>
        )}

        {/* Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl text-blue-600 dark:text-blue-400 cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold leading-tight">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>
      </div>

      {/* Full-Screen Brand Logo Lightbox Modal */}
      <LogoLightboxModal
        isOpen={isLogoLightboxOpen}
        onClose={() => setIsLogoLightboxOpen(false)}
      />

      {/* Warehouse Restock & New Container Push Alerts Modal */}
      <InventoryAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => {
          setIsAlertsModalOpen(false);
          setUnreadAlertsCount(getAlertsHistory().filter((a) => !a.read).length);
        }}
        onSelectProduct={(productId) => {
          setActiveTab('catalog');
          setTimeout(() => {
            const el = document.getElementById(productId) || document.getElementById('catalog');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />
    </header>
  );
};
