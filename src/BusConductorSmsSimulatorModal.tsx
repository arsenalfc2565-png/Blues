import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Smartphone,
  Send,
  Truck,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Share2,
  User,
  MapPin,
  FileText,
  AlertCircle,
  Radio,
  PhoneCall
} from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface BusConductorSmsSimulatorModalProps {
  order?: Order | null;
  orders: Order[];
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

interface SimulatedSmsMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'depot' | 'conductor' | 'courier_office' | 'mpesa';
  text: string;
  timestamp: string;
  stageName: string;
  status: 'sent' | 'delivered' | 'read';
}

export const BusConductorSmsSimulatorModal: React.FC<BusConductorSmsSimulatorModalProps> = ({
  order: initialOrder,
  orders,
  storeSettings,
  isOpen,
  onClose,
}) => {
  // Order selection
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrder?.id || (orders.length > 0 ? orders[0].id : '')
  );

  const currentOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || initialOrder || orders[0] || null;
  }, [orders, selectedOrderId, initialOrder]);

  // Customizable dispatch parameters for the simulation
  const [customerName, setCustomerName] = useState(currentOrder?.customerName || 'Achieng Grace');
  const [customerPhone, setCustomerPhone] = useState(currentOrder?.customerPhone || '0722 345 678');
  const [deliveryTown, setDeliveryTown] = useState(currentOrder?.deliveryTown || 'Eldoret');
  const [courierName, setCourierName] = useState(currentOrder?.courier || 'Guardian Angel');
  const [waybillNo, setWaybillNo] = useState(currentOrder?.waybillNumber || 'GA-ELD-49210');
  const [busRegistration, setBusRegistration] = useState('KDF 849Z');
  const [conductorName, setConductorName] = useState('Omondi Peter');
  const [conductorPhone, setConductorPhone] = useState('0712 884 921');
  const [totalPairs, setTotalPairs] = useState(
    currentOrder?.items.reduce((s, it) => s + it.quantity, 0) || 12
  );
  const [balanceDue, setBalanceDue] = useState(currentOrder?.balanceDue || 0);

  // Sync state when selected order changes
  useEffect(() => {
    if (currentOrder) {
      setCustomerName(currentOrder.customerName);
      setCustomerPhone(currentOrder.customerPhone);
      setDeliveryTown(currentOrder.deliveryTown);
      setCourierName(currentOrder.courier);
      setWaybillNo(currentOrder.waybillNumber || `GA-${currentOrder.deliveryTown.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`);
      setTotalPairs(currentOrder.items.reduce((s, it) => s + it.quantity, 0) || 12);
      setBalanceDue(currentOrder.balanceDue || 0);
    }
  }, [currentOrder]);

  // Audio Sound & Vibration Toggle
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [customSmsInput, setCustomSmsInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Conversation history in phone simulator
  const [messages, setMessages] = useState<SimulatedSmsMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Web Audio API Synth SMS Chime (0 external assets, works reliably everywhere)
  const playSmsTone = () => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Kenyan classic phone SMS two-tone chime (880Hz -> 1760Hz)
      const now = ctx.currentTime;
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(1760, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);

      // Trigger haptic vibration if supported
      if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  // Helper to format current time
  const getCurrentTimeFormatted = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Pre-configured SMS Stages
  const handleTriggerStage1 = () => {
    const text = `BLUES DEPOT: Habari ${customerName}! Your footwear wholesale order (${totalPairs} pairs) has been securely loaded onto ${courierName} Bus Reg: ${busRegistration}. Waybill #${waybillNo}. Daily 4:00 PM Express dispatch from Kisumu Central Stage. Collect at ${deliveryTown} Stage tomorrow 7:30 AM. Helpline: ${storeSettings.kisumuPhone1}.`;
    
    addMessage({
      senderId: 'BLUES_DEPOT',
      senderName: 'Blues Footwear Wholesale Depot',
      senderType: 'depot',
      text,
      stageName: 'Stage 1: 4:00 PM Kisumu Bus Park Loading Alert',
    });
  };

  const handleTriggerStage2 = () => {
    const text = `CONDUCTOR ALERT: Conductor ${conductorName} (${conductorPhone}) here on ${courierName} (${busRegistration}). We are approaching ${deliveryTown} highway stage. Estimated Arrival: 30 minutes. Please have your National ID ready at the parcel bay.`;
    
    addMessage({
      senderId: 'CONDUCTOR',
      senderName: `Bus Conductor (${conductorName})`,
      senderType: 'conductor',
      text,
      stageName: 'Stage 2: 30-Min Arrival ETA Notification',
    });
  };

  const handleTriggerStage3 = () => {
    const text = `${courierName.toUpperCase()} PARCELS: Your carton from BLUES DEPOT Kisumu has arrived safely at ${deliveryTown} Terminal Counter 2. Shelf Ref: #SH-${Math.floor(100 + Math.random() * 900)}. Please collect within 48 hrs with Waybill #${waybillNo} and ID.`;
    
    addMessage({
      senderId: `${courierName.replace(/\s+/g, '_').toUpperCase()}`,
      senderName: `${courierName} Parcel Office`,
      senderType: 'courier_office',
      text,
      stageName: 'Stage 3: Parcel Ready for Collection at Terminal',
    });
  };

  const handleTriggerStage4 = () => {
    const text = `BLUES DEPOT: Lipa Pole Pole Balance of KSh ${balanceDue > 0 ? balanceDue.toLocaleString() : '3,500'} received via M-Pesa Till ${storeSettings.mpesaTill || '492019'}. Account Cleared! PARCEL RELEASE PASSCODE: #REL-${Math.floor(1000 + Math.random() * 9000)}. Show this SMS to clerk to claim shoe carton.`;
    
    addMessage({
      senderId: 'BLUES_DEPOT',
      senderName: 'Blues Footwear Wholesale Depot',
      senderType: 'depot',
      text,
      stageName: 'Stage 4: M-Pesa Balance Clearance & Release OTP',
    });
  };

  const handleTriggerStage5 = () => {
    const text = `BLUES DEPOT: Waybill #${waybillNo} confirmed DELIVERED to ${customerName} at ${deliveryTown}. Asante sana for partnering with us! Ready for your next weekly stock carton? WhatsApp us: ${storeSettings.kisumuPhone1} for new arrivals catalog.`;
    
    addMessage({
      senderId: 'BLUES_DEPOT',
      senderName: 'Blues Footwear Wholesale Depot',
      senderType: 'depot',
      text,
      stageName: 'Stage 5: Restock & Partnership Follow-up',
    });
  };

  const handleSendCustomSms = () => {
    if (!customSmsInput.trim()) return;
    addMessage({
      senderId: 'BLUES_DEPOT',
      senderName: 'Blues Footwear Wholesale Depot',
      senderType: 'depot',
      text: customSmsInput.trim(),
      stageName: 'Custom Dispatch Alert',
    });
    setCustomSmsInput('');
  };

  const addMessage = (params: {
    senderId: string;
    senderName: string;
    senderType: 'depot' | 'conductor' | 'courier_office' | 'mpesa';
    text: string;
    stageName: string;
  }) => {
    const newMsg: SimulatedSmsMessage = {
      id: `sms-${Date.now()}-${Math.random()}`,
      senderId: params.senderId,
      senderName: params.senderName,
      senderType: params.senderType,
      text: params.text,
      timestamp: getCurrentTimeFormatted(),
      stageName: params.stageName,
      status: 'delivered',
    };

    setMessages((prev) => [...prev, newMsg]);
    playSmsTone();
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleCopySmsText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareViaWhatsApp = (text: string) => {
    const cleanNum = customerPhone.replace(/[^0-9]/g, '');
    const formattedNum = cleanNum.startsWith('0') ? `254${cleanNum.substring(1)}` : cleanNum;
    const url = `https://wa.me/${formattedNum}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Initialize with the first dispatch alert on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleTriggerStage1();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-neutral-900 text-white rounded-3xl max-w-5xl w-full border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Fixed Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-950 border border-blue-800 text-blue-400 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 rounded-md">
                  Logistics Dispatch Hub
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs text-neutral-300 font-semibold">Kisumu Main Bus Park</span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Bus Conductor & Parcel Depot SMS Simulator
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSoundEnabled
                  ? 'bg-blue-950 border-blue-700 text-blue-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500'
              }`}
              title={isSoundEnabled ? 'Mute SMS Chimes' : 'Enable SMS Chimes'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns (Left: Dispatch Stage Triggers & Settings, Right: Realistic Smartphone Simulator) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left Column: Dispatch Controls & Triggers (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Select Order / Parcel Manifest */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-neutral-200 font-bold flex items-center gap-1.5 text-xs">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Select Consignment Order to Track:</span>
                </label>
                <span className="text-neutral-500 text-[10px]">
                  {orders.length} Active Dispatches
                </span>
              </div>

              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.orderNumber} - {ord.customerName} ({ord.deliveryTown} via {ord.courier})
                  </option>
                ))}
              </select>

              {/* Editable Trip & Conductor Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Consignee Name:</span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-medium text-xs"
                  />
                </div>

                <div>
                  <span className="text-neutral-400 block mb-0.5">Phone Number:</span>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <span className="text-neutral-400 block mb-0.5">Destination Town:</span>
                  <input
                    type="text"
                    value={deliveryTown}
                    onChange={(e) => setDeliveryTown(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-medium text-xs"
                  />
                </div>

                <div>
                  <span className="text-neutral-400 block mb-0.5">Courier Carrier:</span>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-medium text-xs"
                  >
                    <option value="Guardian Angel">Guardian Angel</option>
                    <option value="Easy Coach">Easy Coach</option>
                    <option value="Ena Coach">Ena Coach</option>
                    <option value="Climax Coach">Climax Coach</option>
                    <option value="Transline Classic">Transline Classic</option>
                    <option value="Eldoret Express">Eldoret Express</option>
                    <option value="Fargo Courier">Fargo Courier</option>
                  </select>
                </div>

                <div>
                  <span className="text-neutral-400 block mb-0.5">Bus Reg. Plate:</span>
                  <input
                    type="text"
                    value={busRegistration}
                    onChange={(e) => setBusRegistration(e.target.value)}
                    placeholder="KDF 849Z"
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-amber-400 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <span className="text-neutral-400 block mb-0.5">Conductor Name:</span>
                  <input
                    type="text"
                    value={conductorName}
                    onChange={(e) => setConductorName(e.target.value)}
                    placeholder="Omondi Peter"
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-medium text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Lifecycle Dispatch SMS Triggers */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-neutral-200 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Real-Time Dispatch Triggers:</span>
                </label>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-neutral-400 hover:text-rose-400 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Screen</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Stage 1 Button */}
                <button
                  type="button"
                  onClick={handleTriggerStage1}
                  className="p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-blue-500 text-left transition-all group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-400 text-xs">Stage 1: Kisumu Loading</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[9px] font-bold">
                      4:00 PM
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Depot SMS confirming shoes loaded onto bus with Waybill #{waybillNo}.
                  </p>
                </button>

                {/* Stage 2 Button */}
                <button
                  type="button"
                  onClick={handleTriggerStage2}
                  className="p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-left transition-all group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-400 text-xs">Stage 2: Conductor On-Route</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[9px] font-bold">
                      ETA 30m
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Conductor SMS alert notifying buyer bus is 30 mins from {deliveryTown}.
                  </p>
                </button>

                {/* Stage 3 Button */}
                <button
                  type="button"
                  onClick={handleTriggerStage3}
                  className="p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500 text-left transition-all group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-400 text-xs">Stage 3: Ready at Terminal</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold">
                      Office
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Terminal office SMS with shelf reference for parcel collection.
                  </p>
                </button>

                {/* Stage 4 Button */}
                <button
                  type="button"
                  onClick={handleTriggerStage4}
                  className="p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500 text-left transition-all group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-purple-400 text-xs">Stage 4: M-Pesa Release OTP</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[9px] font-bold">
                      Lipa Pole
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Depot SMS confirming balance payment and generating parcel release code.
                  </p>
                </button>
              </div>

              {/* Stage 5 Full Width Button */}
              <button
                type="button"
                onClick={handleTriggerStage5}
                className="w-full p-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500 text-left transition-all flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-bold text-neutral-200">
                    Stage 5: Successful Delivery & Weekly Restock Re-order Invite
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-[10px] font-bold">
                  Complete
                </span>
              </button>
            </div>

            {/* Manual Custom SMS Dispatcher */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
              <label className="text-neutral-300 font-bold flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Send Custom SMS Notification to Customer:</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSmsInput}
                  onChange={(e) => setCustomSmsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendCustomSms();
                    }
                  }}
                  placeholder="Type custom SMS alert (e.g. Bus delayed by 15 mins due to rain at Mau Summit)..."
                  className="flex-1 px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendCustomSms}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Smartphone Simulator (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {/* Phone Bezel */}
            <div className="w-full max-w-[340px] bg-neutral-950 border-[6px] border-neutral-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col h-[590px] relative ring-1 ring-neutral-700/50">
              {/* Dynamic Island / Top Speaker */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
              </div>

              {/* iOS / Android Status Bar */}
              <div className="px-6 pt-3 pb-1 bg-neutral-900 flex items-center justify-between text-[10px] text-neutral-400 font-mono z-20">
                <span className="font-bold text-neutral-300">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-emerald-400">Safaricom 4G</span>
                  <span className="w-4 h-2 rounded-sm border border-neutral-400 relative">
                    <span className="absolute inset-0.5 bg-emerald-400 rounded-2xs" />
                  </span>
                </div>
              </div>

              {/* Messages App Header */}
              <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    BL
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white text-xs">BLUES_DEPOT</span>
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-[9px] text-emerald-400 font-medium">Verified Carrier SMS</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-neutral-400">
                  <PhoneCall className="w-3.5 h-3.5 hover:text-white transition-colors" />
                </div>
              </div>

              {/* Chat Body (Scrollable SMS Stream) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-neutral-950/90 text-xs">
                {/* Simulated Date Separator */}
                <div className="text-center my-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-400 font-medium">
                    Today · Dispatch Day
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-neutral-500 space-y-2">
                    <Smartphone className="w-8 h-8 opacity-40 text-blue-400" />
                    <p className="text-[11px]">No simulated SMS yet. Tap any trigger on the left to test live alerts.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isConductor = msg.senderType === 'conductor';
                    const isOffice = msg.senderType === 'courier_office';

                    return (
                      <div key={msg.id} className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Stage Tag */}
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tight truncate max-w-[200px]">
                            {msg.stageName}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">{msg.timestamp}</span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`p-3 rounded-2xl border text-xs leading-relaxed relative group ${
                            isConductor
                              ? 'bg-amber-950/60 border-amber-700/70 text-amber-100 rounded-tl-sm'
                              : isOffice
                              ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-100 rounded-tl-sm'
                              : 'bg-neutral-900 border-neutral-700 text-neutral-100 rounded-tl-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1 pb-1 border-b border-white/10">
                            <span className="text-blue-400">{msg.senderId}</span>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleCopySmsText(msg.text, msg.id)}
                                title="Copy SMS text"
                                className="text-neutral-400 hover:text-white"
                              >
                                {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShareViaWhatsApp(msg.text)}
                                title="Send via WhatsApp"
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <Share2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <p className="font-sans text-[11px] whitespace-pre-wrap">{msg.text}</p>

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-neutral-400">
                            <span>Delivered</span>
                            <CheckCircle2 className="w-3 h-3 text-blue-400 inline" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Phone Bar */}
              <div className="p-2 bg-neutral-900 border-t border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500 font-mono">
                <span>Text Message · SMS Carrier Rates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-3.5 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Real SMS gateway ready with Safaricom & Airtel Kenya bulk SMS integration templates.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-semibold transition-colors cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
