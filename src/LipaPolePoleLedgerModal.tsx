import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  DollarSign,
  Plus,
  Send,
  Copy,
  Check,
  Calendar,
  ShieldCheck,
  Truck,
  User,
  MapPin,
  FileText,
  Volume2,
  Sparkles
} from 'lucide-react';
import { Order, InstallmentPayment, StoreSettings } from '../types';
import confetti from 'canvas-confetti';

interface LipaPolePoleLedgerModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
  onRecordPayment: (orderId: string, payment: Omit<InstallmentPayment, 'id' | 'recordedAt'>) => void;
}

export const LipaPolePoleLedgerModal: React.FC<LipaPolePoleLedgerModalProps> = ({
  order,
  isOpen,
  onClose,
  storeSettings,
  onRecordPayment,
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'record_payment' | 'sms_reminders'>('ledger');
  
  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(order.balanceDue || Math.round(order.totalAmount * 0.7));
  const [paymentMethod, setPaymentMethod] = useState<'mpesa_stk' | 'mpesa_till' | 'mpesa_paybill' | 'cash_pickup'>('mpesa_till');
  const [mpesaReceipt, setMpesaReceipt] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('Kisumu Depot Attendant');
  const [stageLocation, setStageLocation] = useState<string>(`${order.deliveryTown} Stage`);
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // SMS Reminder State
  const [reminderType, setReminderType] = useState<'stage_arrival' | 'mid_term_due' | 'urgent_final'>('stage_arrival');
  const [customSmsText, setCustomSmsText] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [simulatedSentNotice, setSimulatedSentNotice] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate totals
  const totalAmount = order.totalAmount;
  const depositPaid = order.depositAmount || Math.round(totalAmount * 0.3);
  const paymentsList = order.installmentPayments || [
    {
      id: 'initial-deposit',
      amount: depositPaid,
      paymentMethod: order.paymentMethod,
      mpesaReceipt: order.mpesaReceipt || 'TK95L9P11B',
      recordedAt: order.createdAt,
      recordedBy: 'Safaricom Daraja STK (Initial 30% Booking)',
      stageLocation: 'Swan Centre, Kisumu Depot',
      notes: 'Initial 30% layaway deposit to lock master cartons.',
    },
  ];

  const totalPaidSoFar = paymentsList.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = Math.max(0, totalAmount - totalPaidSoFar);
  const isFullySettled = remainingBalance === 0;

  // Generate automated Kenyan SMS reminder texts
  const getReminderTemplate = (type: 'stage_arrival' | 'mid_term_due' | 'urgent_final') => {
    const buyerName = order.customerName || 'Reseller';
    const ref = order.orderNumber;
    const stage = order.deliveryTown;
    const courier = order.courier || 'Guardian Angel';

    if (type === 'stage_arrival') {
      return `Habari ${buyerName}, your footwear parcel (Ref: ${ref}) on ${courier} has arrived at ${stage} Stage. Balance due: KSh ${remainingBalance.toLocaleString()}. Pay via Till ${storeSettings.mpesaTill} or cash to the stage clerk for immediate release. Helpline: ${storeSettings.kisumuPhone1}`;
    } else if (type === 'mid_term_due') {
      return `Jambo ${buyerName}, this is Blues Collection Kisumu Depot. Friendly reminder of your Lipa Pole Pole layaway balance of KSh ${remainingBalance.toLocaleString()} for Order ${ref}. Pay via Till ${storeSettings.mpesaTill} to fast-track bus dispatch. Asante!`;
    } else {
      return `URGENT NOTICE: ${buyerName}, your booked carton inventory (Ref: ${ref}) is currently held at ${stage}. Final balance of KSh ${remainingBalance.toLocaleString()} is due within 24 hours to prevent parcel cancellation. Contact ${storeSettings.kisumuPhone1}`;
    }
  };

  const handleRecordNewPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      setPaymentError('Please enter a valid payment amount');
      return;
    }
    setPaymentError(null);

    const generatedReceipt = mpesaReceipt.trim() || 'TK' + Math.floor(10000000 + Math.random() * 90000000).toString(36).toUpperCase();

    onRecordPayment(order.id, {
      amount: paymentAmount,
      paymentMethod,
      mpesaReceipt: generatedReceipt,
      recordedBy: recordedBy.trim() || 'Kisumu Central Stage Desk',
      stageLocation: stageLocation.trim() || 'Kisumu Depot',
      notes: paymentNotes.trim() || 'Installment settlement recorded in ledger.',
    });

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    setPaymentSuccessNotice(`Payment of KSh ${paymentAmount.toLocaleString()} recorded! Receipt: ${generatedReceipt}`);
    setTimeout(() => {
      setPaymentSuccessNotice(null);
      setActiveTab('ledger');
      setMpesaReceipt('');
      setPaymentNotes('');
    }, 2000);
  };

  const handleCopySms = async () => {
    const text = customSmsText || getReminderTemplate(reminderType);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {}
  };

  const handleSendWhatsAppReminder = () => {
    const text = customSmsText || getReminderTemplate(reminderType);
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneFormatted = cleanPhone.startsWith('0') ? `254${cleanPhone.substring(1)}` : cleanPhone;
    window.open(`https://wa.me/${phoneFormatted}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSimulateSms = () => {
    setSimulatedSentNotice(true);
    setTimeout(() => setSimulatedSentNotice(false), 3500);
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-4xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 text-white border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Lipa Pole Pole Layaway Ledger
                </span>
                <span className="font-mono text-xs text-amber-400 font-bold">{order.orderNumber}</span>
              </div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                Installment Payment Ledger & SMS Reminders
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Payment Ledger ({paymentsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('record_payment')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'record_payment'
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Installment</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sms_reminders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'sms_reminders'
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                  : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS & WhatsApp Reminders</span>
            </button>
          </div>

          {/* Status Chip */}
          <div>
            {isFullySettled ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Fully Settled</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Balance Due: KSh {remainingBalance.toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-neutral-50">
          {paymentSuccessNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{paymentSuccessNotice}</span>
            </div>
          )}

          {/* Quick Financial Summary Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold uppercase block">
                Total Order Value
              </span>
              <span className="text-lg font-black font-mono text-neutral-900">
                KSh {totalAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-500 block">
                {order.items.reduce((s, i) => s + i.quantity, 0)} Pairs Wholesale
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-1">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                Total Paid So Far
              </span>
              <span className="text-lg font-black font-mono text-emerald-700">
                KSh {totalPaidSoFar.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">
                {Math.round((totalPaidSoFar / totalAmount) * 100)}% Cleared
              </span>
            </div>

            <div className={`p-4 rounded-2xl border shadow-xs space-y-1 ${
              remainingBalance > 0 ? 'bg-amber-50 border-amber-200' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <span className={`text-[10px] font-bold uppercase block ${
                remainingBalance > 0 ? 'text-amber-800' : 'text-neutral-500'
              }`}>
                Remaining Balance
              </span>
              <span className={`text-lg font-black font-mono ${
                remainingBalance > 0 ? 'text-amber-900' : 'text-neutral-400'
              }`}>
                KSh {remainingBalance.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-500 block">
                {remainingBalance > 0 ? 'Due upon stage arrival' : 'Zero balance remaining'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs space-y-1">
              <span className="text-[10px] text-blue-800 font-bold uppercase block">
                Destination & Stage
              </span>
              <span className="text-xs font-black text-blue-950 block truncate">
                {order.deliveryTown}
              </span>
              <span className="text-[10px] text-blue-700 font-medium block">
                Carrier: {order.courier || 'Guardian Angel'}
              </span>
            </div>
          </div>

          {/* TAB 1: INSTALLMENT LEDGER VIEW */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-700" />
                  <span>Itemized Payment History & Stage Receipts</span>
                </h4>
                {remainingBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('record_payment')}
                    className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>

              <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-200 text-[10px] font-bold uppercase text-neutral-600 tracking-wider">
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Method & M-Pesa Code</th>
                      <th className="p-3">Location / Stage</th>
                      <th className="p-3">Recorded By</th>
                      <th className="p-3 text-right">Amount Settled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {paymentsList.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-neutral-600">
                          {p.recordedAt ? new Date(p.recordedAt).toLocaleDateString('en-GB') : '2026-09-25'}
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-emerald-700 block">
                            {p.mpesaReceipt}
                          </span>
                          <span className="text-[10px] text-neutral-500 uppercase">
                            {p.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-700 font-medium">
                          {p.stageLocation || 'Swan Centre Kisumu Depot'}
                        </td>
                        <td className="p-3 text-neutral-600 text-[11px]">
                          {p.recordedBy}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-neutral-900 text-sm">
                          KSh {p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Next Steps / Layaway Agreement Terms */}
              <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                <span className="font-bold text-neutral-800 block">Lipa Pole Pole Layaway Policy:</span>
                <p>
                  • Master cartons remain reserved exclusively for the buyer for up to 14 days.<br />
                  • Bus parcel luggage is released immediately once the final balance of <strong>KSh {remainingBalance.toLocaleString()}</strong> is verified by the conductor or stage clerk.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: RECORD NEW PAYMENT FORM */}
          {activeTab === 'record_payment' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Record Installment or Stage Balance Settlement</h4>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Log cash received at destination stage or M-Pesa transaction reference to update this order's ledger.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRecordNewPayment} className="space-y-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
                {paymentError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Payment Amount (KSh) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      max={remainingBalance}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-sm font-bold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      Max due: KSh {remainingBalance.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Payment Channel <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="mpesa_till">M-Pesa Buy Goods Till ({storeSettings.mpesaTill})</option>
                      <option value="mpesa_stk">Safaricom Daraja STK Push</option>
                      <option value="mpesa_paybill">M-Pesa Paybill ({storeSettings.mpesaPaybill})</option>
                      <option value="cash_pickup">Cash Collected at Bus Stage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      M-Pesa Receipt Code <span className="text-neutral-400 font-normal">(Leave blank to auto-generate)</span>
                    </label>
                    <input
                      type="text"
                      value={mpesaReceipt}
                      onChange={(e) => setMpesaReceipt(e.target.value)}
                      placeholder="e.g. TK98R104MN"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-xs font-bold uppercase focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Recorded By / Station Attendant <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={recordedBy}
                      onChange={(e) => setRecordedBy(e.target.value)}
                      placeholder="e.g. Conductor Juma / Eldoret Clerk"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Settlement Notes / Stage Comments
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Final balance cleared at Eldoret Zion Mall stage. Handed 2 cartons to customer."
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ledger')}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-700/20 active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Record KSh {paymentAmount.toLocaleString()}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SMS & WHATSAPP REMINDERS STATION */}
          {activeTab === 'sms_reminders' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Automated Kenyan Trader Reminder Templates</h4>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Send real-time SMS alerts or WhatsApp direct notifications to <strong>{order.customerName}</strong> ({order.customerPhone}).
                  </p>
                </div>
              </div>

              {simulatedSentNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Simulated Safaricom Bulk SMS sent to {order.customerPhone}!</span>
                </div>
              )}

              {/* Reminder Type Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReminderType('stage_arrival');
                    setCustomSmsText(getReminderTemplate('stage_arrival'));
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    reminderType === 'stage_arrival'
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <Truck className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="font-bold text-neutral-900 block text-xs">Stage Arrival</span>
                  <span className="text-[10px] text-neutral-500">Bus arrived at destination stage</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReminderType('mid_term_due');
                    setCustomSmsText(getReminderTemplate('mid_term_due'));
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    reminderType === 'mid_term_due'
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="font-bold text-neutral-900 block text-xs">Friendly Reminder</span>
                  <span className="text-[10px] text-neutral-500">Layaway balance due notice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReminderType('urgent_final');
                    setCustomSmsText(getReminderTemplate('urgent_final'));
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    reminderType === 'urgent_final'
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 mb-1" />
                  <span className="font-bold text-neutral-900 block text-xs">Final Notice</span>
                  <span className="text-[10px] text-neutral-500">24-hour clearance warning</span>
                </button>
              </div>

              {/* Message Editor Box */}
              <div className="space-y-1.5 bg-white p-5 rounded-3xl border border-neutral-200">
                <label className="font-bold text-neutral-800 block text-xs">
                  SMS / WhatsApp Broadcast Message Text
                </label>
                <textarea
                  rows={4}
                  value={customSmsText || getReminderTemplate(reminderType)}
                  onChange={(e) => setCustomSmsText(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />
              </div>

              {/* Broadcast Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopySms}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-neutral-300 text-neutral-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateSms}
                    className="px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simulate SMS Send</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsAppReminder}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
