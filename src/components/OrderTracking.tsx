import React, { useState } from 'react';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MessageSquare,
  FileText,
  Printer,
  Phone,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Info,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { Order, StoreSettings, CourierPartner } from '../types';
import { MpesaStatementModal } from './MpesaStatementModal';
import { ThermalWaybillLabelModal } from './ThermalWaybillLabelModal';
import { BusConductorSmsSimulatorModal } from './BusConductorSmsSimulatorModal';

interface OrderTrackingProps {
  orders: Order[];
  storeSettings: StoreSettings;
}

// Stage waypoint simulator data per route
interface HighwayWaypoint {
  stageName: string;
  town: string;
  expectedTime: string;
  status: 'passed' | 'current' | 'upcoming';
  note: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orders, storeSettings }) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [statementOrder, setStatementOrder] = useState<Order | null>(null);
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);
  const [smsSimulatorOrder, setSmsSimulatorOrder] = useState<Order | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'in_transit' | 'ready_collection'>('all');

  const matchedOrders = orders.filter((o) => {
    if (!query.trim()) return true; // Show all if no query typed, or search specifically
    const cleanQ = query.trim().toLowerCase();
    const cleanPhone = cleanQ.replace(/[^0-9]/g, '');
    return (
      o.orderNumber.toLowerCase().includes(cleanQ) ||
      (cleanPhone && o.customerPhone.includes(cleanPhone)) ||
      (o.waybillNumber && o.waybillNumber.toLowerCase().includes(cleanQ)) ||
      (o.deliveryTown && o.deliveryTown.toLowerCase().includes(cleanQ))
    );
  });

  const getStatusStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'verified':
        return 1;
      case 'packing':
        return 2;
      case 'dispatched':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Order Verified', desc: 'M-Pesa daraja confirmed' },
    { title: 'Depot Carton Sealed', desc: 'Size ratios paired & inspected' },
    { title: 'Bus Bay Loaded', desc: 'Handed to bus conductor at 4:00 PM' },
    { title: 'Highway Transit', desc: 'En route via Western highway corridor' },
    { title: 'Destination Stage Arrival', desc: 'Ready for parcel collection' },
  ];

  // Helper to generate simulated live highway waypoints based on order status and town
  const getHighwayWaypoints = (order: Order): HighwayWaypoint[] => {
    const isDispatched = order.status === 'dispatched' || order.status === 'completed';
    const isCompleted = order.status === 'completed';

    return [
      {
        stageName: 'Kisumu Main Bus Park Terminus',
        town: 'Kisumu County',
        expectedTime: '4:00 PM (Dispatched)',
        status: isDispatched ? 'passed' : 'current',
        note: 'Loaded in Guardian/EasyCoach lower luggage bay with tamper-evident seal.',
      },
      {
        stageName: 'Kericho High Altitude Stage Checkpoint',
        town: 'Kericho County',
        expectedTime: '6:15 PM',
        status: isCompleted ? 'passed' : isDispatched ? 'current' : 'upcoming',
        note: 'Transit bus manifest stamped by route inspector.',
      },
      {
        stageName: 'Mau Summit / Nakuru West Junction',
        town: 'Nakuru County',
        expectedTime: '8:45 PM',
        status: isCompleted ? 'passed' : 'upcoming',
        note: 'Scheduled highway rest stop & luggage bay security check.',
      },
      {
        stageName: `${order.deliveryTown} Stage Terminus`,
        town: order.deliveryTown,
        expectedTime: 'Next Morning 6:30 AM - 8:00 AM',
        status: isCompleted ? 'passed' : 'upcoming',
        note: `Arrives at ${order.courier || 'Guardian Angel'} office for customer parcel pickup.`,
      },
    ];
  };

  return (
    <section className="py-12 bg-neutral-900 text-white border-b border-neutral-800" id="order-tracking">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-bold">
            <Truck className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>47 Counties Live Bus Parcel & Stage Status Portal</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight">
            Live Bus Parcel Tracking & Stage Portal
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Real-time transit telemetry for footwear cartons departing Kisumu Bus Park. Track bus registration numbers, conductor luggage tags, and stage collection readiness.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-neutral-950 p-4 rounded-3xl border border-neutral-800 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearched(true);
                }}
                placeholder="Search Waybill (GA-84012), Phone (0714...), or Order # (BC-2026-9104)"
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-2xl font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => setSearched(true)}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Track Bus Parcel</span>
            </button>
          </div>

          {/* Quick Filter & Sample Waybills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-neutral-400">
              <span>Quick Sample Waybills:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery('GA-84012');
                  setSearched(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-mono text-[10px] font-bold border border-neutral-700 transition-colors"
              >
                GA-84012 (Eldoret)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('BUSPK-4109');
                  setSearched(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-300 font-mono text-[10px] font-bold border border-neutral-700 transition-colors"
              >
                BUSPK-4109 (Kakamega)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('0722123456');
                  setSearched(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-blue-300 font-mono text-[10px] font-bold border border-neutral-700 transition-colors"
              >
                0722123456 (Nairobi)
              </button>
            </div>

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Reset Search
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        {matchedOrders.length === 0 ? (
          <div className="bg-neutral-950 p-10 rounded-3xl border border-neutral-800 text-center space-y-4 shadow-sm">
            <Package className="w-12 h-12 text-neutral-600 mx-auto" />
            <div>
              <h4 className="font-bold text-white text-base">No active parcel found matching "{query}"</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                Please double check the waybill or phone number. If dispatched today after 4:00 PM, bus records update within 30 minutes of terminal departure.
              </p>
            </div>
            <a
              href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Blues%20Collection,%20please%20help%20me%20track%20my%20bus%20waybill%20parcel:%20${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquire with Kisumu Stage Attendant on WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {matchedOrders.map((order) => {
              const stepIdx = getStatusStepIndex(order.status);
              const waypoints = getHighwayWaypoints(order);
              const courier = order.courier || 'Guardian Angel';

              return (
                <div
                  key={order.id}
                  className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 text-xs"
                >
                  {/* Order Header Badge & Courier Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-black text-lg text-white font-mono">
                          {order.orderNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wide bg-blue-900 text-blue-200 border border-blue-700">
                          {order.orderType}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>{courier}</span>
                        </span>
                        {order.waybillNumber && (
                          <span className="font-mono text-[11px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            Waybill: {order.waybillNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-neutral-400 text-xs mt-1.5 flex-wrap">
                        <span>Buyer: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-blue-300">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span>Destination: <strong>{order.deliveryTown}</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSmsSimulatorOrder(order)}
                        className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-purple-300" />
                        <span>Simulate Conductor SMS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatementOrder(order)}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>M-Pesa Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLabelOrder(order)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Luggage Tag Label</span>
                      </button>
                    </div>
                  </div>

                  {/* 5-Step Progress Timeline */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Standard Dispatch Pipeline
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {steps.map((st, i) => {
                        const isDone = i <= stepIdx;
                        const isCurrent = i === stepIdx;
                        return (
                          <div
                            key={st.title}
                            className={`p-3 rounded-2xl border text-xs transition-all ${
                              isCurrent
                                ? 'bg-blue-950 border-blue-500 text-white ring-2 ring-blue-500/30'
                                : isDone
                                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                                : 'bg-neutral-900/50 border-neutral-800 text-neutral-500'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                              )}
                              <span className="font-bold truncate">{st.title}</span>
                            </div>
                            <p className="text-[10px] leading-tight text-neutral-400">{st.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Highway Telemetry & Waypoints */}
                  <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <h4 className="font-bold text-white text-xs">
                          Live Western Corridor Highway Transit Telemetry
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                        Bus GPS Signal Active
                      </span>
                    </div>

                    {/* Bus Manifest & Conductor Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px]">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Bus Registration & Model:</span>
                        <strong className="text-white font-mono">KDE 842X (Scania F310 Luxury Express)</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Conductor on Duty:</span>
                        <span className="text-white font-semibold">Juma Wekesa (+254 712 998 811)</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Luggage Bay Tag Ref:</span>
                        <span className="font-mono text-amber-400 font-bold">BAY-TAG-4109-SEAL</span>
                      </div>
                    </div>

                    {/* Interactive Highway Waypoints */}
                    <div className="space-y-2.5 pt-2">
                      {waypoints.map((wp, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                            wp.status === 'passed'
                              ? 'bg-neutral-950 border-emerald-800/80 text-neutral-300'
                              : wp.status === 'current'
                              ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500/50'
                              : 'bg-neutral-950/40 border-neutral-800 text-neutral-500'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">
                              {wp.status === 'passed' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : wp.status === 'current' ? (
                                <Truck className="w-4 h-4 text-blue-400 animate-bounce" />
                              ) : (
                                <Clock className="w-4 h-4 text-neutral-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{wp.stageName}</span>
                                <span className="text-[10px] text-neutral-400">({wp.town})</span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                                {wp.note}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-[11px] font-bold text-amber-400 block">
                              {wp.expectedTime}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider ${
                                wp.status === 'passed'
                                  ? 'text-emerald-400'
                                  : wp.status === 'current'
                                  ? 'text-blue-400'
                                  : 'text-neutral-500'
                              }`}
                            >
                              {wp.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footwear Cartons & Balance Summary */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                    <span className="font-bold text-neutral-400 block">Footwear Package Manifest:</span>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 text-neutral-200 border border-neutral-800"
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold text-white">{item.productTitle}</span>
                            <span className="text-neutral-400 ml-2">
                              (Size {item.size} · {item.color})
                            </span>
                          </div>
                          <div className="text-right shrink-0 font-mono font-bold text-amber-300">
                            {item.quantity} pairs @ KSh {item.unitPrice.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 font-bold text-sm text-white gap-2">
                      <div>
                        <span>Total Parcel Value: </span>
                        <span className="tabular-nums font-mono text-emerald-400">
                          KSh {order.totalAmount.toLocaleString()}
                        </span>
                        {order.paymentMethod === 'lipa_pole_pole' && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px]">
                            Lipa Pole Pole Layaway
                          </span>
                        )}
                      </div>

                      <a
                        href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Blues%20Depot,%20following%20up%20on%20parcel%20${order.orderNumber}%20(${order.waybillNumber || 'Waybill'})`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Report Delay / Contact Kisumu Stage Desk</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {statementOrder && (
        <MpesaStatementModal
          order={statementOrder}
          storeSettings={storeSettings}
          isOpen={!!statementOrder}
          onClose={() => setStatementOrder(null)}
        />
      )}

      {labelOrder && (
        <ThermalWaybillLabelModal
          order={labelOrder}
          storeSettings={storeSettings}
          isOpen={!!labelOrder}
          onClose={() => setLabelOrder(null)}
        />
      )}

      {smsSimulatorOrder && (
        <BusConductorSmsSimulatorModal
          order={smsSimulatorOrder}
          orders={orders}
          storeSettings={storeSettings}
          isOpen={!!smsSimulatorOrder}
          onClose={() => setSmsSimulatorOrder(null)}
        />
      )}
    </section>
  );
};
