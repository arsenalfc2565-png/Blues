import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Building,
  AlertTriangle
} from 'lucide-react';
import { CustomerUser, topUpCustomerWallet, WalletTransaction } from '../utils/customerAuth';
import { StoreSettings } from '../types';
import { Z_INDEX } from '../constants/zIndex';

interface CustomerWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser;
  onWalletUpdated: (updatedUser: CustomerUser) => void;
  storeSettings: StoreSettings;
}

export const CustomerWalletModal: React.FC<CustomerWalletModalProps> = ({
  isOpen,
  onClose,
  customer,
  onWalletUpdated,
  storeSettings,
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'mpesa_stk' | 'mpesa_till' | 'mpesa_paybill'>('mpesa_stk');
  const [depositSuccessNotice, setDepositSuccessNotice] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const PRESETS = [5000, 10000, 25000, 50000];

  const handleDeposit = () => {
    const finalAmount = customAmount ? parseInt(customAmount, 10) : depositAmount;
    if (!finalAmount || finalAmount < 500) {
      setDepositError('Please enter a minimum deposit of KSh 500');
      return;
    }
    setDepositError(null);

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDepositError(
        `Automatic M-Pesa top-up failed. This feature is coming soon and is not connected yet. Please pay manually via Paybill ${storeSettings.mpesaPaybill} (Account: ${storeSettings.mpesaPaybillAccountNumber}) or Till ${storeSettings.mpesaTill}, then contact admin to confirm your wallet top-up.`
      );
    }, 1500);
  };

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 ${Z_INDEX.MODAL} overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-neutral-950 via-blue-950 to-neutral-950 text-white border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  Preloaded Account Balance
                </span>
              </div>
              <h3 className="font-display font-black text-lg text-white">
                Blues Reseller Wallet
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50 text-xs">
          {/* Success Banner */}
          {depositSuccessNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{depositSuccessNotice}</span>
            </div>
          )}

          {depositError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{depositError}</span>
            </div>
          )}

          {/* Current Wallet Balance Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white shadow-xl border border-neutral-800 space-y-3 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs uppercase tracking-wider font-semibold">Available Shopping Funds</span>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                ● 1-Click Checkout Active
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-neutral-400 font-mono">KSh</span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                {customer.walletBalance.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Account: <strong className="text-white">{customer.name}</strong> ({customer.email})</span>
              <span className="text-blue-300">Zero STK Delay</span>
            </div>
          </div>

          {/* Top Up Section */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Load Money to Account Wallet</span>
              </h4>
              <span className="text-[11px] text-neutral-500">M-Pesa Instant Credit</span>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1.5">
                Select Amount (KSh):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESETS.map((amt) => {
                  const isSelected = !customAmount && depositAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDepositAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-3 rounded-2xl font-bold font-mono text-xs border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-neutral-50 hover:bg-blue-50 text-neutral-800 border-neutral-200'
                      }`}
                    >
                      KSh {amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Or Enter Custom Deposit Amount (KSh):
              </label>
              <input
                type="number"
                min="500"
                step="500"
                placeholder="e.g. 15000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono"
              />
            </div>

            {/* Top Up Channel Choice */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-neutral-600 block">
                Deposit Channel:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="walletChannel"
                    value="mpesa_stk"
                    checked={selectedChannel === 'mpesa_stk'}
                    onChange={() => setSelectedChannel('mpesa_stk')}
                    className="text-blue-600"
                  />
                  <div>
                    <strong className="block font-bold text-neutral-900">Safaricom STK Push</strong>
                    <span className="text-[10px] text-neutral-500">Prompt sent to {customer.phone || '0722...'}</span>
                  </div>
                </label>

                <label className="p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="walletChannel"
                    value="mpesa_till"
                    checked={selectedChannel === 'mpesa_till'}
                    onChange={() => setSelectedChannel('mpesa_till')}
                    className="text-blue-600"
                  />
                  <div>
                    <strong className="block font-bold text-neutral-900">M-Pesa Buy Goods Till</strong>
                    <span className="text-[10px] text-neutral-500">Till: {storeSettings.mpesaTill}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDeposit}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Deposit KSh {(customAmount ? parseInt(customAmount, 10) || 0 : depositAmount).toLocaleString()} to Wallet
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Wallet Ledger / Recent Transactions */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-sm">
              Wallet Transaction History
            </h4>

            <div className="space-y-2">
              {customer.walletTransactions && customer.walletTransactions.length > 0 ? (
                customer.walletTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-white border border-neutral-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'topup'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tx.type === 'order_refund'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {tx.type === 'topup' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : tx.type === 'order_refund' ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-neutral-900 block">
                          {tx.description}
                        </strong>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                          <span>Ref: {tx.reference}</span>
                          <span>•</span>
                          <span>{new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-black font-mono tabular-nums ${
                          tx.type === 'topup' || tx.type === 'order_refund'
                            ? 'text-emerald-600'
                            : 'text-neutral-900'
                        }`}
                      >
                        {tx.type === 'topup' || tx.type === 'order_refund' ? '+' : '-'} KSh{' '}
                        {tx.amount.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-neutral-400 capitalize">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500">
                  No wallet transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>Funds protected under Blues Kisumu Depot Merchant Account</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
