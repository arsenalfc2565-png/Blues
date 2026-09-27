import { CartItem, CartValidationResult, PairingDiscrepancy, Product } from '../types';

/**
 * Standard Ladies Footwear Pairing Matrix in Kenya:
 * - Size 42 <-> Size 37 (1:1 ratio)
 * - Size 41 <-> Size 38 (1:1 ratio)
 * - Size 40 <-> Size 39 (1:1 ratio)
 */
export const LADIES_PAIRING_MATRIX = [
  { primarySize: 42, requiredSize: 37 },
  { primarySize: 41, requiredSize: 38 },
  { primarySize: 40, requiredSize: 39 },
];

/**
 * Validates cart contents against footwear sizing rules.
 * Supports:
 * 1. 'paired_ladies': Enforces 42<->37, 41<->38, 40<->39 ratio, with standalone small size exception.
 * 2. 'flexible_mens': Allows free pick between sizes 40-45.
 * 3. 'free_size': No specific sizing required.
 */
export function validateCartSizing(cartItems: CartItem[]): CartValidationResult {
  const discrepancies: PairingDiscrepancy[] = [];
  let hasLadiesPairing = false;

  // Group items by product ID
  const productItemMap = new Map<string, CartItem[]>();
  for (const item of cartItems) {
    const list = productItemMap.get(item.productId) || [];
    list.push(item);
    productItemMap.set(item.productId, list);
  }

  let allSmallSizesOnly = true;

  productItemMap.forEach((items) => {
    const product = items[0]?.product;
    if (!product || product.sizingRuleType !== 'paired_ladies') {
      return;
    }
    hasLadiesPairing = true;

    // Size quantity map for this product
    const sizeQtyMap = new Map<number, number>();
    for (const item of items) {
      const numSize = typeof item.size === 'number' ? item.size : parseInt(String(item.size), 10);
      if (!isNaN(numSize)) {
        sizeQtyMap.set(numSize, (sizeQtyMap.get(numSize) || 0) + item.quantity);
      }
    }

    // Check Standalone Small Size Exception:
    // If the customer selects ONLY small sizes (37, 38, or 39 alone), they can purchase individually.
    const hasLargeSizes = (sizeQtyMap.get(42) || 0) > 0 || (sizeQtyMap.get(41) || 0) > 0 || (sizeQtyMap.get(40) || 0) > 0;
    
    if (hasLargeSizes) {
      allSmallSizesOnly = false;
      // Evaluate the paired matrix:
      // 42 requires 37
      // 41 requires 38
      // 40 requires 39
      for (const pair of LADIES_PAIRING_MATRIX) {
        const primaryQty = sizeQtyMap.get(pair.primarySize) || 0;
        const requiredQty = sizeQtyMap.get(pair.requiredSize) || 0;
        if (primaryQty > requiredQty) {
          const deficit = primaryQty - requiredQty;
          discrepancies.push({
            primarySize: pair.primarySize,
            primaryQty,
            requiredSize: pair.requiredSize,
            requiredQty,
            deficit,
          });
        }
      }
    }
  });

  const isValid = discrepancies.length === 0;

  // Build user-friendly notification message
  let notificationMessage = '';
  if (!isValid && discrepancies.length > 0) {
    const parts = discrepancies.map(
      (d) => `Size ${d.primarySize} requires ${d.deficit} more pair${d.deficit > 1 ? 's' : ''} of Size ${d.requiredSize}`
    );
    notificationMessage = `Wholesale Pairing Rule: ${parts.join(', ')}. Large sizes are sold paired with matching small sizes to balance inventory.`;
  }

  return {
    isValid,
    hasLadiesPairing,
    discrepancies,
    notificationMessage: notificationMessage || undefined,
    standaloneSmallSizesOnly: allSmallSizesOnly && hasLadiesPairing && cartItems.length > 0,
  };
}

/**
 * Automatically balances the cart by adding the missing required paired sizes.
 * If 1 pair of 42 is selected, adds 1 pair of 37 to the cart.
 */
export function autoBalanceCartItems(currentItems: CartItem[]): CartItem[] {
  const updatedItems = [...currentItems];

  // Group by product
  const productIds = Array.from(new Set(currentItems.map((i) => i.productId)));

  for (const pid of productIds) {
    const itemsForProduct = updatedItems.filter((i) => i.productId === pid);
    const product = itemsForProduct[0]?.product;
    if (!product || product.sizingRuleType !== 'paired_ladies') {
      continue;
    }

    // Check pairing requirements
    for (const pair of LADIES_PAIRING_MATRIX) {
      const primaryItems = itemsForProduct.filter(
        (i) => (typeof i.size === 'number' ? i.size : parseInt(String(i.size), 10)) === pair.primarySize
      );
      const primaryTotal = primaryItems.reduce((sum, i) => sum + i.quantity, 0);

      const requiredItems = itemsForProduct.filter(
        (i) => (typeof i.size === 'number' ? i.size : parseInt(String(i.size), 10)) === pair.requiredSize
      );
      const requiredTotal = requiredItems.reduce((sum, i) => sum + i.quantity, 0);

      if (primaryTotal > requiredTotal) {
        const missingCount = primaryTotal - requiredTotal;
        const color = primaryItems[0]?.color || 'Standard';

        // Check if an existing cart item for this required size exists
        const existingRequiredIndex = updatedItems.findIndex(
          (i) =>
            i.productId === pid &&
            (typeof i.size === 'number' ? i.size : parseInt(String(i.size), 10)) === pair.requiredSize &&
            i.color === color
        );

        if (existingRequiredIndex >= 0) {
          updatedItems[existingRequiredIndex] = {
            ...updatedItems[existingRequiredIndex],
            quantity: updatedItems[existingRequiredIndex].quantity + missingCount,
          };
        } else {
          // Find matching variant
          const variant = product.variants.find((v) => Number(v.size) === pair.requiredSize) || {
            id: `${pid}-var-${pair.requiredSize}`,
            size: pair.requiredSize,
            color,
            sku: `${product.brand.substring(0, 3).toUpperCase()}-${pair.requiredSize}`,
            stockQuantity: 50,
          };

          updatedItems.push({
            id: `${pid}-${pair.requiredSize}-${color}-${Date.now()}`,
            productId: pid,
            product,
            size: pair.requiredSize,
            color,
            quantity: missingCount,
            unitPrice: product.wholesalePrice || product.retailPrice,
          });
        }
      }
    }
  }

  return updatedItems;
}

/**
 * Calculate effective unit price and total savings based on total cart or product volume.
 * As long as you take two pairs and above, it's the wholesale price!
 */
export function calculateItemPrice(product: Product, totalProductQuantity: number): {
  unitPrice: number;
  appliedTierLabel: string;
  isWholesale: boolean;
  savingsPerUnit: number;
} {
  const retail = product.retailPrice;
  const wholesale = product.wholesalePrice ?? product.wholesaleTiers?.[0]?.pricePerUnit ?? retail;

  if (totalProductQuantity >= 2) {
    return {
      unitPrice: wholesale,
      appliedTierLabel: 'Wholesale (2+ pairs)',
      isWholesale: true,
      savingsPerUnit: Math.max(0, retail - wholesale),
    };
  }

  return {
    unitPrice: retail,
    appliedTierLabel: 'Retail (1 pair)',
    isWholesale: false,
    savingsPerUnit: 0,
  };
}

/**
 * Calculate cart summary with single wholesale price applied for 2+ pairs.
 * Includes Lipa Pole Pole deposit calculation (30% deposit, 70% on bus parcel collection).
 */
export function calculateCartSummary(items: CartItem[]): {
  totalItems: number;
  subtotal: number;
  wholesaleSavings: number;
  finalTotal: number;
  depositAmount: number;
  balanceDue: number;
  isWholesaleOrder: boolean;
} {
  // Aggregate total quantities per product
  const productQtyMap = new Map<string, number>();
  for (const item of items) {
    productQtyMap.set(item.productId, (productQtyMap.get(item.productId) || 0) + item.quantity);
  }

  let subtotal = 0;
  let retailTotal = 0;
  let totalItems = 0;

  for (const item of items) {
    const productTotalQty = productQtyMap.get(item.productId) || item.quantity;
    const { unitPrice } = calculateItemPrice(item.product, productTotalQty);
    subtotal += unitPrice * item.quantity;
    retailTotal += item.product.retailPrice * item.quantity;
    totalItems += item.quantity;
  }

  const wholesaleSavings = Math.max(0, retailTotal - subtotal);
  const isWholesaleOrder = totalItems >= 2 || wholesaleSavings > 0;
  const depositAmount = Math.round(subtotal * 0.3); // 30% deposit for Lipa Pole Pole
  const balanceDue = subtotal - depositAmount;

  return {
    totalItems,
    subtotal,
    wholesaleSavings,
    finalTotal: subtotal,
    depositAmount,
    balanceDue,
    isWholesaleOrder,
  };
}
