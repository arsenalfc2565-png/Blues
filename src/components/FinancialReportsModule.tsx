import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Printer,
  FileText,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Users,
  Package,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { getCurrentCustomer, CustomerUser, WalletTransaction } from '../utils/customerAuth';
import { FullOrdersPdfReportModal } from './FullOrdersPdfReportModal';
import { downloadOrdersCsv } from '../utils/orderExportUtils';

interface FinancialReportsModuleProps {
  orders: Order[];
  storeSettings: StoreSettings;
}

export const FinancialReportsModule: React.FC<FinancialReportsModuleProps> = ({
  orders,
  storeSettings,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [activeFinanceTab, setActiveFinanceTab] = useState<'profitability' | 'wallet_ledger' | 'payment_channels'>('profitability');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active' | 'cancelled'>('all');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Customer Wallet Data
  const currentCustomer: CustomerUser = useMemo(() => {
    return getCurrentCustomer();
  }, []);

  // Filter orders by timeframe
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((ord) => {
      const ordDate = new Date(ord.createdAt);
      if (timeframe === 'today') {
        return ordDate.toDateString() === now.toDateString();
      }
      if (timeframe === 'week') {
        const diffDays = (now.getTime() - ordDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (timeframe === 'month') {
        const diffDays = (now.getTime() - ordDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  }, [orders, timeframe]);

  // Apply search and status filter to orders in profit ledger
  const displayedLedgerOrders = useMemo(() => {
    return filteredOrders.filter((ord) => {
      if (statusFilter === 'completed' && ord.status !== 'completed') return false;
      if (statusFilter === 'active' && ['completed', 'cancelled'].includes(ord.status)) return false;
      if (statusFilter === 'cancelled' && ord.status !== 'cancelled') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesBasic =
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.customerName.toLowerCase().includes(q) ||
          ord.customerPhone.toLowerCase().includes(q) ||
          ord.deliveryTown.toLowerCase().includes(q) ||
          (ord.mpesaReceipt && ord.mpesaReceipt.toLowerCase().includes(q));

        const matchesItems = ord.items.some((it) => it.productTitle.toLowerCase().includes(q));
        return matchesBasic || matchesItems;
      }

      return true;
    });
  }, [filteredOrders, statusFilter, searchQuery]);

  // Aggregate Metrics for Selected Timeframe
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCOGS = filteredOrders.reduce((sum, o) => {
      if (o.totalCost) return sum + o.totalCost;
      const computedCost = o.items.reduce(
        (iSum, it) => iSum + (it.unitBuyingPrice || Math.round(it.unitPrice * 0.6)) * it.quantity,
        0
      );
      return sum + computedCost;
    }, 0);

    const netProfit = totalRevenue - totalCOGS;
    const marginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;
    const totalPairs = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, it) => iSum + it.quantity, 0),
      0
    );

    // Channel breakdowns
    const mpesaRevenue = filteredOrders
      .filter((o) => ['mpesa_stk', 'mpesa_till', 'mpesa_paybill'].includes(o.paymentMethod))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const walletRevenue = filteredOrders
      .filter((o) => o.paymentMethod === 'wallet_balance')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lipaDepositRevenue = filteredOrders
      .filter((o) => o.paymentMethod === 'lipa_pole_pole')
      .reduce((sum, o) => sum + (o.depositAmount || Math.round(o.totalAmount * 0.3)), 0);

    return {
      totalRevenue,
      totalCOGS,
      netProfit,
      marginPct,
      totalPairs,
      avgProfitPerPair: totalPairs > 0 ? Math.round(netProfit / totalPairs) : 0,
      mpesaRevenue,
      walletRevenue,
      lipaDepositRevenue,
    };
  }, [filteredOrders]);

  // Aggregate Customer Wallet Metrics
  const walletStats = useMemo(() => {
    const transactions: WalletTransaction[] = currentCustomer.walletTransactions || [];
    const totalTopups = transactions
      .filter((t) => t.type === 'topup')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSpend = transactions
      .filter((t) => t.type === 'order_payment')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalRefunds = transactions
      .filter((t) => t.type === 'order_refund')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance: currentCustomer.walletBalance,
      totalTopups,
      totalSpend,
      totalRefunds,
      transactions,
    };
  }, [currentCustomer]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner with Timeframe Period Buttons */}
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <span>Executive Financial Intelligence & Profit Reports</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                    eTIMS KRA COMPLIANT
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Decoupled financial reporting, factory cost of goods sold (COGS), net margins, customer prepay wallet ledger & M-Pesa inflows.
                </p>
              </div>
            </div>
          </div>

          {/* Timeframe Scope Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 text-xs self-start lg:self-auto overflow-x-auto">
            <span className="text-[11px] text-neutral-400 font-semibold px-2 hidden sm:inline">Period:</span>
            <button
              type="button"
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                timeframe === 'today'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                timeframe === 'week'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              This Week (7D)
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                timeframe === 'month'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              This Month (30D)
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                timeframe === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              All-Time ({orders.length})
            </button>
          </div>
        </div>

        {/* 4 Financial KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Card 1: Net Gross Profit */}
          <div className="p-4 bg-gradient-to-br from-emerald-950/90 to-neutral-950 rounded-2xl border border-emerald-700/80 space-y-1 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Net Gross Profit
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 font-mono font-bold text-[10px]">
                {metrics.marginPct}% Margin
              </span>
            </div>
            <p className="font-mono font-black text-2xl text-emerald-400">
              +KSh {metrics.netProfit.toLocaleString()}
            </p>
            <span className="text-[10px] text-neutral-400 block">
              Selling Wholesale minus Factory Landed Cost
            </span>
          </div>

          {/* Card 2: Gross Invoiced Turnover */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                Gross Turnover
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {filteredOrders.length} Invoices
              </span>
            </div>
            <p className="font-mono font-black text-2xl text-white">
              KSh {metrics.totalRevenue.toLocaleString()}
            </p>
            <span className="text-[10px] text-neutral-400 block">
              Total Invoiced Reseller Volume
            </span>
          </div>

          {/* Card 3: Landed Factory Buying Cost (COGS) */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                Landed Buying Cost
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">Factory COGS</span>
            </div>
            <p className="font-mono font-black text-2xl text-amber-400">
              KSh {metrics.totalCOGS.toLocaleString()}
            </p>
            <span className="text-[10px] text-neutral-400 block">
              Wholesale Acquisition & Freight Expense
            </span>
          </div>

          {/* Card 4: Customer Prepay Wallet Balance */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-blue-900/60 space-y-1 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                Reseller Wallet Balances
              </span>
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="font-mono font-black text-2xl text-blue-400">
              KSh {walletStats.balance.toLocaleString()}
            </p>
            <span className="text-[10px] text-neutral-400 block">
              Deposited Prepay Balance Available
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs for Deep Financial Inspection */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveFinanceTab('profitability')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeFinanceTab === 'profitability'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-300" />
          <span>Profit & Order Margins Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceTab('wallet_ledger')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeFinanceTab === 'wallet_ledger'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Wallet className="w-4 h-4 text-blue-300" />
          <span>Customer Reseller Wallet History</span>
          <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono text-[10px]">
            {walletStats.transactions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceTab('payment_channels')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeFinanceTab === 'payment_channels'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Safaricom Daraja Inflows</span>
        </button>
      </div>

      {/* 3. SUB-TAB 1: ORDER PROFITABILITY & MARGINS LEDGER */}
      {activeFinanceTab === 'profitability' && (
        <div className="bg-neutral-950 rounded-3xl border border-neutral-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Itemized Order Profitability Statement
              </h3>
              <p className="text-xs text-neutral-400">
                Landed acquisition costs vs wholesale selling prices per transaction.
              </p>
            </div>

            {/* Filter, Search & Export Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search order #, customer, town..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              >
                <option value="all">All Orders</option>
                <option value="completed">Delivered Only</option>
                <option value="active">Active Live Orders</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Export Buttons */}
              <button
                type="button"
                onClick={() => {
                  downloadOrdersCsv(displayedLedgerOrders, `blues_financial_ledger_${timeframe}`);
                  setExportNotice(`Exported ${displayedLedgerOrders.length} ledger rows to CSV!`);
                  setTimeout(() => setExportNotice(null), 4000);
                }}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download CSV for Excel or Google Sheets"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Open printable / downloadable PDF report"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>PDF Report</span>
              </button>
            </div>
          </div>

          {exportNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between">
              <span>{exportNotice}</span>
              <button onClick={() => setExportNotice(null)} className="text-neutral-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Table of Orders & Margin Breakdown */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="w-full text-left text-xs text-neutral-300 min-w-[760px]">
              <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Order # & Date</th>
                  <th className="py-3 px-4">Customer & Destination</th>
                  <th className="py-3 px-4">Footwear Items</th>
                  <th className="py-3 px-4 text-right">Landed Cost</th>
                  <th className="py-3 px-4 text-right">Invoiced Revenue</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-center">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
                {displayedLedgerOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      No order records found for this period.
                    </td>
                  </tr>
                ) : (
                  displayedLedgerOrders.map((ord) => {
                    const totalCost =
                      ord.totalCost ||
                      ord.items.reduce(
                        (sum, it) => sum + (it.unitBuyingPrice || Math.round(it.unitPrice * 0.6)) * it.quantity,
                        0
                      );
                    const netProfit = ord.netProfit !== undefined ? ord.netProfit : ord.totalAmount - totalCost;
                    const margin = ord.totalAmount > 0 ? Math.round((netProfit / ord.totalAmount) * 1000) / 10 : 0;
                    const totalPairs = ord.items.reduce((s, it) => s + it.quantity, 0);

                    return (
                      <tr key={ord.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{ord.orderNumber}</div>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-white">{ord.customerName}</div>
                          <span className="text-[11px] text-blue-300">{ord.deliveryTown}</span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[11px] text-neutral-300">
                            {totalPairs} pairs ({ord.items.length} styles)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-amber-400 font-bold">
                          KSh {totalCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-white font-bold">
                          KSh {ord.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-400">
                          +KSh {netProfit.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            {margin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: CUSTOMER RESELLER PREPAY WALLET HISTORY */}
      {activeFinanceTab === 'wallet_ledger' && (
        <div className="space-y-4">
          {/* Wallet Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                Total Wallet Top-ups / Inflow
              </span>
              <span className="text-xl font-mono font-black text-emerald-400">
                +KSh {walletStats.totalTopups.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-500 block">Safaricom Till M-Pesa Prepay</span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                Total Order Deductions / Spend
              </span>
              <span className="text-xl font-mono font-black text-blue-400">
                -KSh {walletStats.totalSpend.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-500 block">Auto-debited on Wholesale Orders</span>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-emerald-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                Available Wallet Balance
              </span>
              <span className="text-xl font-mono font-black text-emerald-300">
                KSh {walletStats.balance.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-500 block">Active Account Liquidity</span>
            </div>
          </div>

          {/* Wallet Transaction Ledger */}
          <div className="bg-neutral-950 rounded-3xl border border-neutral-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Reseller Account Wallet Ledger
                </h3>
                <p className="text-xs text-neutral-400">
                  Full transaction log of prepay deposits, order checkout debits, and credit refunds.
                </p>
              </div>

              <div className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 font-mono">
                Account: {currentCustomer.name} ({currentCustomer.email})
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-800">
              <table className="w-full text-left text-xs text-neutral-300 min-w-[700px]">
                <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Transaction Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Reference Code</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
                  {walletStats.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3 px-4 text-neutral-400">
                        {new Date(tx.timestamp).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.type === 'topup'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : tx.type === 'order_payment'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {tx.type === 'topup'
                            ? 'Deposit (Top-Up)'
                            : tx.type === 'order_payment'
                            ? 'Order Payment'
                            : 'Refund'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-white font-medium">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-amber-300 font-bold">
                        {tx.reference}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-black ${
                          tx.type === 'topup' || tx.type === 'order_refund'
                            ? 'text-emerald-400'
                            : 'text-neutral-300'
                        }`}
                      >
                        {tx.type === 'topup' || tx.type === 'order_refund' ? '+' : '-'}
                        KSh {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 3: SAFARICOM DARAJA INFLOWS & PAYMENT CHANNELS */}
      {activeFinanceTab === 'payment_channels' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              <span>Safaricom Daraja Till / STK</span>
            </div>
            <div className="text-2xl font-mono font-black text-white">
              KSh {metrics.mpesaRevenue.toLocaleString()}
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div>Till: <strong className="text-white font-mono">{storeSettings.mpesaTill || '5422109'}</strong></div>
              <div>Settlement: Auto-credited via Daraja STK</div>
            </div>
          </div>

          <div className="p-5 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <Wallet className="w-4 h-4" />
              <span>Prepay Account Wallet</span>
            </div>
            <div className="text-2xl font-mono font-black text-white">
              KSh {metrics.walletRevenue.toLocaleString()}
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div>Instant 1-Click Wholesale Checkout</div>
              <div>Zero checkout friction for verified resellers</div>
            </div>
          </div>

          <div className="p-5 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <CreditCard className="w-4 h-4" />
              <span>Lipa Pole Pole (30% Booking)</span>
            </div>
            <div className="text-2xl font-mono font-black text-white">
              KSh {metrics.lipaDepositRevenue.toLocaleString()}
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div>Initial 30% layaway carton lock</div>
              <div>Balance cleared upon bus arrival</div>
            </div>
          </div>
        </div>
      )}

      {/* Master PDF Financial Orders Ledger Modal */}
      {isPdfModalOpen && (
        <FullOrdersPdfReportModal
          orders={displayedLedgerOrders}
          storeSettings={storeSettings}
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          reportTitle={`Blues Wholesale Financial Statement & Margins (${timeframe.toUpperCase()})`}
        />
      )}
    </div>
  );
};
