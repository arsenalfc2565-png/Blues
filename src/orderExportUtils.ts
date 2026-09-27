import { Order } from '../types';

/**
 * Cleanly escapes text fields for CSV RFC 4180 compatibility.
 */
function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const stringVal = String(val);
  if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return `"${stringVal}"`;
}

/**
 * Converts a list of Orders into a formatted CSV string for accounting & bookkeeping.
 */
export function generateOrdersCsv(orders: Order[]): string {
  const headers = [
    'Order Number',
    'Date Placed',
    'Customer Name',
    'Phone Number',
    'Delivery Town / County',
    'Stage / Bus Depot',
    'Courier Partner',
    'Waybill Number',
    'Order Status',
    'Payment Method',
    'M-Pesa Receipt Code',
    'Total Pairs',
    'Order Total (KSh)',
    'Landed Buying Cost (KSh)',
    'Net Profit (KSh)',
    'Deposit Amount (KSh)',
    'Balance Due (KSh)',
    'Itemized Footwear Specifications (Model, Color, Sizes, Qty)'
  ];

  const rows = orders.map((ord) => {
    const totalPairs = ord.items.reduce((sum, it) => sum + it.quantity, 0);
    const totalCost =
      ord.totalCost ||
      ord.items.reduce(
        (sum, it) => sum + (it.unitBuyingPrice || Math.round(it.unitPrice * 0.6)) * it.quantity,
        0
      );
    const netProfit = ord.netProfit !== undefined ? ord.netProfit : ord.totalAmount - totalCost;

    const itemsSummary = ord.items
      .map((it) => `${it.productTitle} [${it.color}, Size ${it.size}, Qty: ${it.quantity} @ KSh ${it.unitPrice}]`)
      .join('; ');

    const dateFormatted = new Date(ord.createdAt).toISOString().replace('T', ' ').substring(0, 19);

    return [
      escapeCsvCell(ord.orderNumber),
      escapeCsvCell(dateFormatted),
      escapeCsvCell(ord.customerName),
      escapeCsvCell(ord.customerPhone),
      escapeCsvCell(ord.deliveryTown),
      escapeCsvCell(ord.busStage || 'Main Depot Stage'),
      escapeCsvCell(ord.courier || 'Guardian Angel'),
      escapeCsvCell(ord.waybillNumber || 'PENDING'),
      escapeCsvCell(ord.status.toUpperCase()),
      escapeCsvCell(ord.paymentMethod.replace(/_/g, ' ').toUpperCase()),
      escapeCsvCell(ord.mpesaReceipt || 'PENDING'),
      escapeCsvCell(totalPairs),
      escapeCsvCell(ord.totalAmount),
      escapeCsvCell(totalCost),
      escapeCsvCell(netProfit),
      escapeCsvCell(ord.depositAmount || (ord.paymentMethod === 'lipa_pole_pole' ? Math.round(ord.totalAmount * 0.3) : ord.totalAmount)),
      escapeCsvCell(ord.balanceDue || 0),
      escapeCsvCell(itemsSummary),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a client-side CSV file download in the browser.
 */
export function downloadOrdersCsv(orders: Order[], filenamePrefix: string = 'blues_wholesale_orders'): void {
  const csvContent = generateOrdersCsv(orders);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().substring(0, 10);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.setAttribute('download', `${filenamePrefix}_${timestamp}.csv`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
