import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Check,
  Plus,
  AlertCircle,
  Clock,
  X,
  RotateCcw,
  Heart,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Box,
  Smartphone,
  Share2,
  Star,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Bell
} from 'lucide-react';
import { Product, CartItem, ProductReview } from '../types';
import { BulkCartonMatrixModal } from './BulkCartonMatrixModal';
import { MultiSizeSelectorModal } from './MultiSizeSelectorModal';
import { ProductReviewsModal } from './ProductReviewsModal';
import { ProductImageLightboxModal } from './ProductImageLightboxModal';
import { StoreSettings } from '../types';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (item: CartItem) => void;
  onOpenCart?: () => void;
  cartCount?: number;
  onOpen3DViewer: (product: Product) => void;
  onOpenFlyerGenerator?: (product: Product) => void;
  storeSettings: StoreSettings;
  onAddReview?: (productId: string, review: Omit<ProductReview, 'id' | 'productId' | 'reviewDate'>) => void;
  onHelpfulVote?: (productId: string, reviewId: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  if (totalItems === 0) return null;
  return (
    <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-5 bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm">
      {/* Left: Summary text */}
      <div className="text-xs text-neutral-600 font-medium text-center md:text-left">
        Showing <strong className="text-neutral-950 font-mono font-bold">{startIndex + 1}</strong> -{' '}
        <strong className="text-neutral-950 font-mono font-bold">{Math.min(endIndex, totalItems)}</strong> of{' '}
        <strong className="text-blue-700 font-mono font-bold">{totalItems}</strong> shoes
        {totalPages > 1 && (
          <span className="text-neutral-400 ml-2">· Page {currentPage} of {totalPages}</span>
        )}
      </div>

      {/* Middle: Prominent Next Page + Page Numbers */}
      <nav aria-label="Footwear Catalog Pagination" className="flex items-center gap-2 flex-wrap justify-center">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentPage <= 1
              ? 'text-neutral-300 border border-neutral-200 cursor-not-allowed bg-neutral-50'
              : 'text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 active:scale-95 shadow-xs'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            aria-label={`Go to page ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
              currentPage === pageNum
                ? 'bg-blue-700 text-white shadow-md shadow-blue-700/25 ring-2 ring-blue-700/20'
                : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 shadow-xs'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
          className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            currentPage >= totalPages
              ? 'text-neutral-300 border border-neutral-200 cursor-not-allowed bg-neutral-50'
              : 'bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/25 hover:scale-[1.03] active:scale-95'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {onItemsPerPageChange && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="text-[11px] uppercase font-semibold tracking-wider">Per Page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          >
            <option value={6}>6 shoes</option>
            <option value={12}>12 shoes</option>
            <option value={24}>24 shoes</option>
            <option value={100}>All shoes</option>
          </select>
        </div>
      )}
    </div>
  );
};

const STORAGE_KEY = 'blues_recent_searches';
const WISHLIST_STORAGE_KEY = 'blues_wishlist_ids';
const DEFAULT_RECENT_SEARCHES = ['Block heels', 'Italian Loafers', 'Safari boots', 'Runner', 'Slide sandals'];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onOpenCart,
  cartCount = 0,
  onOpen3DViewer,
  onOpenFlyerGenerator,
  storeSettings,
  onAddReview,
  onHelpfulVote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizingRule, setSelectedSizingRule] = useState<string>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [showOnlyWishlist, setShowOnlyWishlist] = useState<boolean>(false);
  const [cartToast, setCartToast] = useState<{
    productTitle: string;
    pairsAdded: number;
    modelImage?: string;
  } | null>(null);

  // Pagination State - default to 12 to show full catalog readily
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Bulk Matrix Modal State
  const [matrixModalProduct, setMatrixModalProduct] = useState<Product | null>(null);

  // Reseller Reviews Modal State
  const [reviewsModalProduct, setReviewsModalProduct] = useState<Product | null>(null);

  // Wishlist state persisted in localStorage
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read wishlist from localStorage', e);
    }
    return ['prod-ladies-01', 'prod-sneakers-01'];
  });

  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save wishlist to localStorage', err);
      }
      return updated;
    });
  };

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch (e) {
      console.warn('Failed to read recent searches from localStorage', e);
    }
    return DEFAULT_RECENT_SEARCHES;
  });

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Computer Friendly Keyboard Shortcut: Press '/' or 'Ctrl+K' / 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT');

      if ((e.key === '/' && !isInput) || ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss floating Add-to-Cart toast after 6 seconds
  useEffect(() => {
    if (!cartToast) return;
    const timer = setTimeout(() => {
      setCartToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [cartToast]);

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent search to localStorage', e);
      }
      return updated;
    });
  };

  const handleSelectRecentSearch = (query: string) => {
    setSearchQuery(query);
    saveSearchQuery(query);
    setIsSearchFocused(false);
  };

  const handleRemoveRecentSearch = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update recent searches', e);
      }
      return updated;
    });
  };

  const handleClearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear recent searches', e);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        saveSearchQuery(searchQuery);
      }
      setIsSearchFocused(false);
    }
  };

  // Multi-Size Custom Quantity Selector Modal state
  const [multiSizeProduct, setMultiSizeProduct] = useState<Product | null>(null);
  const [multiSizeInitialSize, setMultiSizeInitialSize] = useState<number | string | undefined>(undefined);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  const categories = [
    { id: 'all', label: 'All Footwear' },
    { id: 'ladies', label: "Ladies' Heels & Pumps" },
    { id: 'mens', label: "Men's Italian Loafers" },
    { id: 'sneakers', label: 'Athletic Runners' },
    { id: 'boots', label: 'Safari Leather Boots' },
    { id: 'sandals', label: 'Comfort Slides & Sandals' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (showOnlyWishlist && !wishlistIds.includes(p.id)) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedSizingRule !== 'all' && p.sizingRuleType !== selectedSizingRule) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesColor =
          p.allowedColors?.some((c) => c.toLowerCase().includes(query)) ||
          p.variants.some((v) => v.color?.toLowerCase().includes(query));
        const cleanNumber = query.replace(/[^0-9]/g, '');
        const matchesSize = cleanNumber && p.variants.some((v) => String(v.size) === cleanNumber);
        if (!matchesTitle && !matchesBrand && !matchesDesc && !matchesCategory && !matchesSize && !matchesColor) return false;
      }
      if (selectedSizeFilter !== 'all') {
        const hasSize = p.variants.some((v) => String(v.size) === selectedSizeFilter);
        if (!hasSize) return false;
      }
      return true;
    });
  }, [products, showOnlyWishlist, wishlistIds, selectedCategory, selectedSizingRule, searchQuery, selectedSizeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedSizingRule, selectedSizeFilter, showOnlyWishlist]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (catalogTopRef.current) {
        catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleOpenMultiSizeModal = (product: Product, initialSize?: number | string) => {
    setMultiSizeProduct(product);
    setMultiSizeInitialSize(initialSize);
  };

  const handleAddMultiSizesToCart = (items: CartItem[]) => {
    items.forEach((it) => onAddToCart(it));
    const totalPairsAdded = items.reduce((s, it) => s + it.quantity, 0);
    const title = items[0]?.product?.title || (multiSizeProduct ? multiSizeProduct.title : 'Footwear');
    const image = items[0]?.product?.imageUrl || multiSizeProduct?.imageUrl;

    if (multiSizeProduct) {
      setJustAddedId(multiSizeProduct.id);
      setTimeout(() => setJustAddedId(null), 2000);
    }
    setMultiSizeProduct(null);

    // Trigger floating notification for multi-item shoppers ("Tuka, yani! Add to cart and continue")
    setCartToast({
      productTitle: title,
      pairsAdded: totalPairsAdded,
      modelImage: image,
    });
  };

  const handleOrderNowFromModal = (items: CartItem[]) => {
    items.forEach((it) => onAddToCart(it));
    setMultiSizeProduct(null);
    if (onOpenCart) {
      onOpenCart();
    }
  };

  const handleQuickSingleOrderNow = (product: Product, size?: number | string) => {
    handleOpenMultiSizeModal(product, size);
  };

  const handleBulkMatrixAdd = (items: CartItem[]) => {
    items.forEach((it) => onAddToCart(it));
    if (matrixModalProduct) {
      setJustAddedId(matrixModalProduct.id);
      setTimeout(() => setJustAddedId(null), 2000);
    }
  };

  return (
    <section className="py-12 bg-neutral-100/70 border-b border-neutral-200" id="catalog">
      <div ref={catalogTopRef} className="max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Marketplace Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
              <span>B2B & Retail Marketplace</span>
              <span>·</span>
              <span>Swan Centre Kisumu Depot</span>
              {totalPages > 1 && (
                <span className="hidden sm:inline bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-normal mt-1">
              Wholesale Footwear Catalog
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Single wholesale price applied at 2+ pairs. Ladies pairs (42↔37, 41↔38, 40↔39) balanced in master cartons.
            </p>
          </div>

          {/* Search Bar with Recent Searches Dropdown & Desktop Keyboard Shortcut */}
          <div ref={searchContainerRef} className="w-full md:w-96 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search shoes, brands, styles..."
                className="w-full pl-9 pr-14 py-2 bg-white border border-neutral-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition-shadow"
              />
              {!searchQuery && (
                <kbd
                  title="Press / or Ctrl+K anywhere on desktop to search"
                  className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 border border-neutral-300 rounded shadow-2xs pointer-events-none absolute right-2.5 top-2.5"
                >
                  /
                </kbd>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-2.5 top-2.5 p-0.5 text-neutral-400 hover:text-neutral-700 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown for Recent Searches */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-neutral-200 shadow-xl z-30 overflow-hidden text-xs animate-in fade-in duration-150">
                <div className="px-3.5 py-2 bg-neutral-50 border-b border-neutral-200/80 flex items-center justify-between">
                  <span className="font-semibold text-neutral-600 flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recent Searches</span>
                  </span>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllRecentSearches}
                      className="text-[10px] text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {recentSearches.length > 0 ? (
                  <div className="py-1">
                    {recentSearches.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        onClick={() => handleSelectRecentSearch(item)}
                        className="px-3.5 py-2 hover:bg-neutral-50 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <RotateCcw className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-600 shrink-0" />
                          <span className="text-neutral-700 group-hover:text-neutral-900 truncate font-medium">
                            {item}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecentSearch(item, e)}
                          title="Remove from history"
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 rounded transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-neutral-400 text-[11px]">
                    No recent searches stored.
                  </div>
                )}
              </div>
            )}

            {searchQuery && (
              <div className="flex items-center justify-between mt-2 text-[11px] text-blue-800 bg-blue-50/90 px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs animate-in fade-in">
                <span>
                  Real-time Search: <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'model' : 'models'} matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-neutral-500 hover:text-red-600 font-bold ml-2 underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            {recentSearches.length > 0 && !searchQuery && (
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none text-[11px]">
                <span className="text-neutral-400 shrink-0">Recent:</span>
                {recentSearches.slice(0, 3).map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectRecentSearch(item)}
                    className="px-2 py-0.5 rounded-md bg-neutral-200/70 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 transition-colors whitespace-nowrap truncate max-w-[120px] cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowOnlyWishlist(false);
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id && !showOnlyWishlist
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              showOnlyWishlist
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm ring-2 ring-rose-500/20'
                : 'bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showOnlyWishlist ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
            <span>Wishlist ({wishlistIds.length})</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-neutral-200 text-xs shadow-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <span>Sizing Mode:</span>
            </div>
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedSizingRule('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedSizingRule === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                All Rules
              </button>
              <button
                onClick={() => setSelectedSizingRule('paired_ladies')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedSizingRule === 'paired_ladies' ? 'bg-white text-blue-800 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Ladies Paired (42↔37)
              </button>
              <button
                onClick={() => setSelectedSizingRule('flexible_mens')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedSizingRule === 'flexible_mens' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Flexible Men's (40-45)
              </button>
              <button
                onClick={() => setSelectedSizingRule('free_size')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedSizingRule === 'free_size' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Free Size
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Size:</span>
              <select
                value={selectedSizeFilter}
                onChange={(e) => setSelectedSizeFilter(e.target.value)}
                className="bg-neutral-100 border border-neutral-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none"
              >
                <option value="all">All Sizes</option>
                <option value="37">Size 37</option>
                <option value="38">Size 38</option>
                <option value="39">Size 39</option>
                <option value="40">Size 40</option>
                <option value="41">Size 41</option>
                <option value="42">Size 42</option>
                <option value="43">Size 43</option>
                <option value="44">Size 44</option>
                <option value="45">Size 45</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`p-1 rounded-lg transition-colors ${
                    currentPage === 1 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-700 hover:bg-white'
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[11px] font-bold text-neutral-800">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-0.5 transition-colors ${
                    currentPage === totalPages
                      ? 'text-neutral-300 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                  }`}
                  title="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
            <span className="text-neutral-400 font-mono">({filteredProducts.length} models)</span>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4 max-w-md mx-auto my-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-lg text-neutral-900">
              {showOnlyWishlist ? 'Your Wholesale Wishlist is Empty' : 'No Footwear Matches Found'}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {showOnlyWishlist
                ? 'Save your high-turnover footwear models to this wishlist by tapping the heart icon on any shoe card.'
                : 'Try adjusting your search query, size filter, or sizing rule settings.'}
            </p>
            <button
              onClick={() => {
                setShowOnlyWishlist(false);
                setSelectedCategory('all');
                setSelectedSizingRule('all');
                setSelectedSizeFilter('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Browse All Footwear
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => {
              const wholesalePrice = product.wholesalePrice ?? product.wholesaleTiers?.[0]?.pricePerUnit ?? product.retailPrice;
              const savings = Math.max(0, product.retailPrice - wholesalePrice);

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col"
                >
                  {/* Image Frame */}
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden"
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      onClick={() => setLightboxImage({ src: product.imageUrl, title: product.title })}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    />

                    {/* Sizing Rule Pill Banner */}
                    <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-white flex items-center gap-1 border border-white/10">
                      {product.sizingRuleType === 'paired_ladies' ? (
                        <span className="text-amber-400">Paired Matrix (42↔37, 41↔38, 40↔39)</span>
                      ) : product.sizingRuleType === 'flexible_mens' ? (
                        <span className="text-blue-400">Flexible Sizes (40-45)</span>
                      ) : (
                        <span className="text-emerald-400">Free Size (Assorted Carton)</span>
                      )}
                    </div>

                    {/* Top Right Action Cluster: 3D View + Wishlist Heart */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {product.has3DModel && (
                        <button
                          onClick={() => onOpen3DViewer(product)}
                          className="bg-white/95 hover:bg-white text-neutral-900 px-2.5 py-1.5 rounded-xl shadow-md border border-neutral-200 transition-all hover:scale-105 flex items-center gap-1.5 text-xs font-bold backdrop-blur-sm"
                          title="Launch 3D WebGL 360° Studio"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden sm:inline">3D View</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(product.id, e)}
                        aria-label={wishlistIds.includes(product.id) ? "Remove from wishlist" : "Save to wishlist"}
                        className={`p-2 rounded-xl shadow-md border transition-all duration-200 backdrop-blur-sm flex items-center justify-center ${
                          wishlistIds.includes(product.id)
                            ? 'bg-white border-rose-200 text-rose-500 scale-105 shadow-rose-500/10'
                            : 'bg-white/95 hover:bg-white border-neutral-200 text-neutral-400 hover:text-rose-500 hover:scale-105'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform duration-200 active:scale-125 ${
                            wishlistIds.includes(product.id) ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Added Confirmation Overlay */}
                    {justAddedId === product.id && (
                      <div className="absolute inset-0 bg-blue-700/90 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-emerald-300" />
                          <span>Added to Wholesale Order!</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata & Pricing Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span className="uppercase tracking-wider font-semibold text-neutral-500">
                          {product.brand}
                        </span>
                        
                        {/* Rating & Review Count Trigger Pill */}
                        <button
                          type="button"
                          onClick={() => setReviewsModalProduct(product)}
                          title="View Verified Reseller Reviews & Ratings"
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-950 font-bold text-[11px] transition-colors cursor-pointer group/star"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500 group-hover/star:scale-110 transition-transform" />
                          <span className="font-mono">{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
                          <span className="text-amber-800/80 font-normal">
                            ({product.reviews ? product.reviews.length : product.reviewCount || 0})
                          </span>
                        </button>
                      </div>

                      <h3 className="font-display font-bold text-base text-neutral-900 mt-1 line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Verified Reseller Trust Banner Link */}
                      <button
                        type="button"
                        onClick={() => setReviewsModalProduct(product)}
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Reseller Reviews ({product.reviews?.length || product.reviewCount || 0})</span>
                      </button>
                    </div>

                    {/* Wholesale Pricing Module (2+ pairs wholesale) */}
                    <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-neutral-500">Retail (Single 1 pair):</span>
                        <span className="font-semibold text-neutral-500 line-through tabular-nums font-mono">
                          KSh {product.retailPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs font-bold text-emerald-800 pt-1 border-t border-neutral-200/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-neutral-900">Wholesale (2+ pairs):</span>
                          {savings > 0 && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                              Save KSh {savings.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-base font-black tabular-nums text-emerald-700 font-mono">
                          KSh {wholesalePrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Size Pills Strip on Card */}
                    <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                            Available Sizes:
                          </span>
                          {product.variants.some((v) => v.stockQuantity <= (v.lowStockThreshold || 25)) && (
                            <span
                              title="Live browser restock push alerts active for low-stock sizes"
                              className="text-[9px] text-amber-800 bg-amber-100/90 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5"
                            >
                              <Bell className="w-2.5 h-2.5 text-amber-700" />
                              <span>Restock Alerts</span>
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenMultiSizeModal(product)}
                          className="text-blue-700 hover:text-blue-800 font-bold hover:underline"
                        >
                          Pick Any Mix →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants.map((v) => {
                          const isLow = v.stockQuantity <= (v.lowStockThreshold || 25);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleOpenMultiSizeModal(product, v.size)}
                              title={
                                isLow
                                  ? `Size ${v.size} (Only ${v.stockQuantity} pairs left - Restock alert monitored)`
                                  : `Tap to select quantity for Size ${v.size}`
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                                isLow
                                  ? 'bg-amber-50/70 border-amber-300 text-amber-950 hover:bg-amber-100'
                                  : 'bg-neutral-100 hover:bg-blue-50 border-neutral-200 hover:border-blue-400 text-neutral-800'
                              }`}
                            >
                              <span>{v.size}</span>
                              {isLow && <span className="ml-1 text-[9px] text-amber-700 font-black">•</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons: 1. Add to Cart (Tuka, yani - multi-item shopping) & 2. Order Now (Instant single-item checkout) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenMultiSizeModal(product)}
                        className="py-2.5 px-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                        title="Choose colors and sizes, add to cart, and keep shopping for other shoes"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-700" />
                        <span>Add to Cart</span>
                      </button>

                      {/* Order Now Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickSingleOrderNow(product)}
                        className="py-2.5 px-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-700/20 active:scale-95 cursor-pointer"
                        title="Order this shoe now and proceed directly to checkout"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Order Now</span>
                      </button>
                    </div>

                    {/* Secondary Actions: Carton Matrix & WhatsApp Flyer */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatrixModalProduct(product)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors border border-neutral-200 cursor-pointer"
                        title="Bulk 24-Pair Master Carton Matrix"
                      >
                        <Box className="w-3 h-3 text-neutral-500" />
                        <span>Carton Matrix (24 prs)</span>
                      </button>

                      {onOpenFlyerGenerator && (
                        <button
                          type="button"
                          onClick={() => onOpenFlyerGenerator(product)}
                          className="py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Generate branded WhatsApp Status flyer & price card"
                        >
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>Flyer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          startIndex={startIndex}
          endIndex={endIndex}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={(newCount) => {
            setItemsPerPage(newCount);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* 1. B2B BULK CARTON MATRIX & PROFIT SIMULATOR MODAL        */}
      {/* ========================================================= */}
      {matrixModalProduct && (
        <BulkCartonMatrixModal
          product={matrixModalProduct}
          isOpen={!!matrixModalProduct}
          onClose={() => setMatrixModalProduct(null)}
          onAddCartonToCart={handleBulkMatrixAdd}
          storeSettings={storeSettings}
        />
      )}

      {/* ========================================================= */}
      {/* 2. CUSTOM MULTI-SIZE QUANTITY SELECTOR MODAL              */}
      {/* ========================================================= */}
      {multiSizeProduct && (
        <MultiSizeSelectorModal
          product={multiSizeProduct}
          isOpen={!!multiSizeProduct}
          onClose={() => setMultiSizeProduct(null)}
          onAddSizesToCart={handleAddMultiSizesToCart}
          onOrderNow={handleOrderNowFromModal}
          storeSettings={storeSettings}
          initialSize={multiSizeInitialSize}
        />
      )}

      {/* ========================================================= */}
      {/* 3. VERIFIED RESELLER REVIEWS & COMMUNITY TRUST MODAL     */}
      {/* ========================================================= */}
      {reviewsModalProduct && (
        <ProductReviewsModal
          product={reviewsModalProduct}
          isOpen={!!reviewsModalProduct}
          onClose={() => setReviewsModalProduct(null)}
          onAddReview={(productId, newReviewData) => {
            if (onAddReview) {
              onAddReview(productId, newReviewData);
            }
            {/* ========================================================= */}
      {/* 4. PRODUCT PHOTO LIGHTBOX (TAP TO ENLARGE)                */}
      {/* ========================================================= */}
      <ProductImageLightboxModal
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageSrc={lightboxImage?.src}
        title={lightboxImage?.title}
      />
            // Update local modal state immediately
            const createdReview: ProductReview = {
              id: `rev-${Date.now()}`,
              productId,
              reviewDate: new Date().toISOString().split('T')[0],
              ...newReviewData,
            };
            setReviewsModalProduct((prev) => {
              if (!prev) return null;
              const currentReviews = prev.reviews || [];
              const updatedReviews = [createdReview, ...currentReviews];
              const avg = Math.round((updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length) * 10) / 10;
              return {
                ...prev,
                reviews: updatedReviews,
                rating: avg,
                reviewCount: updatedReviews.length,
              };
            });
          }}
          onHelpfulVote={(productId, reviewId) => {
            if (onHelpfulVote) {
              onHelpfulVote(productId, reviewId);
            }
            setReviewsModalProduct((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                reviews: (prev.reviews || []).map((r) =>
                  r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
                ),
              };
            });
          }}
        />
      )}

      {/* Floating Add to Cart Confirmation Notification for Multi-Item Shoppers ("Tuka, yani!") */}
      {cartToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-full bg-neutral-950 text-white rounded-3xl p-4 shadow-2xl border border-neutral-800 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            {cartToast.modelImage && (
              <img
                src={cartToast.modelImage}
                alt={cartToast.productTitle}
                className="w-12 h-12 rounded-2xl object-cover border border-neutral-700 shrink-0"
              />
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Cart!</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCartToast(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-bold text-white line-clamp-1">
                {cartToast.pairsAdded} {cartToast.pairsAdded === 1 ? 'pair' : 'pairs'} of {cartToast.productTitle}
              </p>
              <p className="text-[11px] text-neutral-400">
                Total in cart: <strong className="text-blue-400 font-mono">{cartCount} pairs</strong>. Pick another shoe or checkout anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setCartToast(null)}
              className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Continue Shopping (Add More)
            </button>
            {onOpenCart && (
              <button
                type="button"
                onClick={() => {
                  setCartToast(null);
                  onOpenCart();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
              >
                <span>View Cart & Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
