import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Package,
  Calendar,
  AlertTriangle,
  FileText,
  User,
  Clock,
  Sparkles,
  QrCode
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import jsPDF from 'jspdf';

interface DigitalWaybillPdfModalProps {
  order: Order;
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalWaybillPdfModal: React.FC<DigitalWaybillPdfModalProps> = ({
  order,
  storeSettings,
  isOpen,
  onClose,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalPairs = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartons = Math.max(1, Math.ceil(totalPairs / 24));
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const dispatchTime = '4:00 PM Daily Express Dispatch';
  const waybillNo = order.waybillNumber || `WB-${order.orderNumber.replace(/[^0-9]/g, '') || '9842'}-KIS`;
  const isLipa = order.paymentMethod === 'lipa_pole_pole';

  // Native Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Direct jsPDF Vector / Clean Document Exporter
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 36, 'F');

      // Title & Depot Info
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('BLUES COLLECTION FOOTWEAR', 14, 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text('OFFICIAL COMMERCIAL CONSIGNMENT & BUS WAYBILL', 14, 20);
      doc.text('Swan Centre, Kisumu Bus Park Depot · Hotline: ' + storeSettings.kisumuPhone1, 14, 26);

      // Waybill Number Badge (Right Side)
      doc.setFillColor(37, 99, 235); // blue-600
      doc.roundedRect(135, 8, 62, 20, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('WAYBILL REFERENCE NO:', 140, 14);
      doc.setFontSize(12);
      doc.text(waybillNo, 140, 22);

      // Courier & Route Strip
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(14, 42, 182, 16, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, 42, 182, 16, 'S');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`COURIER: ${order.courier.toUpperCase()}`, 18, 49);
      doc.text(`DESTINATION: ${order.deliveryTown.toUpperCase()}`, 100, 49);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Dispatch Hub: Kisumu Main Bus Park (${dispatchTime})`, 18, 54);
      doc.text(`Booking Date: ${orderDate}`, 100, 54);

      // Consignor & Consignee Columns
      let y = 64;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);

      // Consignor Box (From)
      doc.rect(14, y, 88, 38, 'F');
      doc.rect(14, y, 88, 38, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('CONSIGNOR (SENDER / DISPATCH):', 18, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Blues Collection Wholesale & Logistics Depot', 18, y + 12);
      doc.text('Swan Centre, Ground Floor, Kisumu Bus Park', 18, y + 17);
      doc.text(`Phone: ${storeSettings.kisumuPhone1} / ${storeSettings.kisumuPhone2}`, 18, y + 22);
      doc.text(`Email: support@bluescollection.co.ke`, 18, y + 27);
      doc.text(`M-Pesa Till: ${storeSettings.mpesaTill} (Buy Goods)`, 18, y + 32);

      // Consignee Box (To)
      doc.rect(108, y, 88, 38, 'F');
      doc.rect(108, y, 88, 38, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('CONSIGNEE (RECIPIENT / BUYER):', 112, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Name: ${order.customerName}`, 112, y + 12);
      doc.text(`Phone: ${order.customerPhone}`, 112, y + 17);
      doc.text(`Destination Town: ${order.deliveryTown}`, 112, y + 22);
      doc.text(`Parcel Collection Stage: ${order.deliveryTown} Stage / Depot`, 112, y + 27);
      doc.text(`Order Reference: ${order.orderNumber}`, 112, y + 32);

      // Package Summary Box
      y = 108;
      doc.setFillColor(238, 242, 255); // indigo-50
      doc.rect(14, y, 182, 22, 'F');
      doc.setDrawColor(199, 210, 254);
      doc.rect(14, y, 182, 22, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('CONSIGNMENT PACKAGE SUMMARY & FREIGHT METRICS', 18, y + 6);

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Volume: ${totalCartons} Master Carton(s)`, 18, y + 12);
      doc.text(`Total Footwear Pairs: ${totalPairs} Pairs`, 75, y + 12);
      doc.text(`Estimated Gross Weight: ~${(totalPairs * 0.45).toFixed(1)} KG`, 135, y + 12);

      doc.text(`Security Bag/Carton Seal #: KIS-${order.orderNumber.replace(/[^0-9]/g, '') || '772'}-SEAL`, 18, y + 17);
      doc.text(`Handling: FRAGILE FOOTWEAR - KEEP DRY`, 105, y + 17);

      // Package Line Items Table
      y = 136;
      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 182, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('LINE', 17, y + 5);
      doc.text('FOOTWEAR MODEL & SPECIFICATION', 30, y + 5);
      doc.text('SIZE', 105, y + 5);
      doc.text('COLOR', 125, y + 5);
      doc.text('QTY (PRS)', 150, y + 5);
      doc.text('LINE TOTAL', 175, y + 5);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      order.items.forEach((it, idx) => {
        const rowBg = idx % 2 === 0 ? 255 : 248;
        doc.setFillColor(rowBg, rowBg, rowBg);
        doc.rect(14, y, 182, 7, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(14, y + 7, 196, y + 7);

        doc.text(String(idx + 1), 17, y + 5);
        doc.text(it.productTitle.substring(0, 38), 30, y + 5);
        doc.text(String(it.size), 105, y + 5);
        doc.text(it.color.substring(0, 14), 125, y + 5);
        doc.text(`${it.quantity} prs`, 150, y + 5);
        doc.text(`KSh ${it.totalPrice.toLocaleString()}`, 175, y + 5);
        y += 7;
      });

      // Financial & Waybill Settlement Strip
      y += 3;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 24, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, y, 182, 24, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`INVOICE TOTAL: KSh ${order.totalAmount.toLocaleString()}`, 18, y + 6);
      doc.text(`PAYMENT METHOD: ${order.paymentMethod.replace('_', ' ').toUpperCase()}`, 18, y + 12);
      if (order.mpesaReceipt) {
        doc.text(`M-PESA REF: ${order.mpesaReceipt}`, 18, y + 18);
      }

      if (isLipa && order.depositAmount) {
        doc.setTextColor(180, 83, 9); // amber-700
        doc.text(`LIPA POLE POLE (30% DEPOSIT PAID): KSh ${order.depositAmount.toLocaleString()}`, 105, y + 6);
        doc.setFontSize(9);
        doc.setTextColor(220, 38, 38); // red-600
        doc.text(`BALANCE DUE ON COLLECTION: KSh ${(order.balanceDue || 0).toLocaleString()}`, 105, y + 13);
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`* Parcel released only upon M-Pesa clearance of balance at bus stage.`, 105, y + 19);
      } else {
        doc.setTextColor(16, 185, 129); // emerald-600
        doc.text(`PAYMENT STATUS: FULLY PAID & CLEARED`, 105, y + 6);
        doc.setTextColor(71, 85, 105);
        doc.text(`Zero balance due. Cleared for immediate stage handover.`, 105, y + 12);
      }

      // Verification & Signature Boxes
      y += 28;
      const sigBoxWidth = 58;

      // Box 1: Depot Dispatcher
      doc.rect(14, y, sigBoxWidth, 26, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text('1. KISUMU DEPOT DISPATCHER', 16, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Checked & Sealed: Swan Centre', 16, y + 10);
      doc.text('Sign: ____________________', 16, y + 18);
      doc.text(`Date: ${orderDate}`, 16, y + 23);

      // Box 2: Bus Conductor / Carrier
      doc.rect(76, y, sigBoxWidth, 26, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(`2. ${order.courier.toUpperCase()} STAGE`, 78, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Received for Luggage Bay Transit', 78, y + 10);
      doc.text('Driver/Cond Sign: ___________', 78, y + 18);
      doc.text('Bus Reg Plate: ______________', 78, y + 23);

      // Box 3: Consignee Acceptance
      doc.rect(138, y, sigBoxWidth, 26, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('3. CONSIGNEE RECIPIENT', 140, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Carton Seal Intact & Inspected', 140, y + 10);
      doc.text('Recipient Sign: ______________', 140, y + 18);
      doc.text('National ID #: ______________', 140, y + 23);

      // Footer Terms
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Terms of Carriage: Parcels insured under standard carrier carriage rules. Inspect security seal before sign-off. Report issues within 24hrs of stage arrival.',
        14,
        286
      );
      doc.text('Generated electronically via Blues Collection Logistics Engine · Kisumu, Kenya', 14, 290);

      // Trigger Save
      doc.save(`Waybill-${order.orderNumber}-${order.deliveryTown}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF waybill:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-4xl w-full border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Action Toolbar (Hidden during print) */}
        <div className="px-6 py-4 bg-neutral-900 text-white border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  Official Digital Waybill
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs text-neutral-300 font-mono font-bold">{waybillNo}</span>
              </div>
              <h3 className="font-display font-black text-lg text-white">
                {order.courier} Consignment Note
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF via jsPDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* Native Browser Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Digital Waybill Sheet */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-neutral-50 print:p-0 print:bg-white print:space-y-4">
          {/* Document Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-300 shadow-xs print:rounded-none print:border-black print:p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-200 pb-4 print:border-black">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block">
                  Official Freight Consignment Document
                </span>
                <h1 className="font-display font-black text-2xl text-neutral-950 tracking-tight">
                  BLUES COLLECTION LOGISTICS
                </h1>
                <p className="text-xs text-neutral-600 font-medium mt-0.5">
                  Swan Centre, Ground Floor, Kisumu Bus Park Depot · Kisumu, Kenya
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  Depot Hotline: {storeSettings.kisumuPhone1} · Dispatch Desk: {storeSettings.kisumuPhone2}
                </p>
              </div>

              <div className="text-left sm:text-right bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200/90 print:bg-transparent print:border-black print:p-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  Consignment / Waybill No:
                </span>
                <span className="font-display font-black text-xl text-blue-900 font-mono block print:text-black">
                  {waybillNo}
                </span>
                <span className="text-[11px] text-neutral-600 font-medium">
                  Order Ref: <strong className="font-mono">{order.orderNumber}</strong>
                </span>
              </div>
            </div>

            {/* Courier & Route Spotlight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-900 text-white rounded-2xl print:bg-neutral-100 print:text-black print:border print:border-black">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-bold print:text-neutral-600">
                  Assigned Bus Courier:
                </span>
                <span className="font-display font-black text-base text-blue-300 print:text-black">
                  {order.courier}
                </span>
                <span className="text-[10px] text-neutral-400 block print:text-neutral-600">
                  Luggage Bay Express
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-bold print:text-neutral-600">
                  Destination County & Stage:
                </span>
                <span className="font-display font-black text-base text-white print:text-black">
                  {order.deliveryTown}
                </span>
                <span className="text-[10px] text-neutral-400 block print:text-neutral-600">
                  Collection Stage / Terminus
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-bold print:text-neutral-600">
                  Dispatch Schedule:
                </span>
                <span className="font-bold text-sm text-emerald-400 print:text-black">
                  4:00 PM Express Daily
                </span>
                <span className="text-[10px] text-neutral-400 block print:text-neutral-600">
                  Date: {orderDate}
                </span>
              </div>
            </div>

            {/* Consignor (From) & Consignee (To) Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Consignor Card */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 print:border-black print:bg-white">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-1.5 print:border-black">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                    Consignor (Sender / Depot)
                  </span>
                </div>
                <div className="text-xs space-y-1 text-neutral-700">
                  <p className="font-bold text-neutral-900">Blues Collection Wholesale Depot</p>
                  <p className="text-neutral-600">Swan Centre, Kisumu Bus Park Depot</p>
                  <p className="font-mono text-neutral-600">Tel: {storeSettings.kisumuPhone1}</p>
                  <p className="text-neutral-500 text-[11px]">County: Kisumu (042)</p>
                </div>
              </div>

              {/* Consignee Card */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 print:border-black print:bg-white">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-1.5 print:border-black">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                    Consignee (Recipient / Merchant)
                  </span>
                </div>
                <div className="text-xs space-y-1 text-neutral-700">
                  <p className="font-bold text-neutral-900">{order.customerName}</p>
                  <p className="font-mono font-bold text-blue-700 print:text-black">
                    Phone: {order.customerPhone}
                  </p>
                  <p className="text-neutral-600">
                    Destination: <strong>{order.deliveryTown}</strong>
                  </p>
                  <p className="text-neutral-500 text-[11px]">
                    Delivery: Bus Stage Collection ({order.courier})
                  </p>
                </div>
              </div>
            </div>

            {/* Package Summary & Metrics Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 print:border-black print:bg-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-700 text-white print:bg-black">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 print:text-black">
                    Consignment Package Summary
                  </span>
                  <p className="text-xs text-indigo-800 print:text-neutral-800">
                    <strong>{totalCartons} Master Carton(s)</strong> containing{' '}
                    <strong>{totalPairs} Footwear Pairs</strong>
                  </p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-neutral-500 block text-[11px]">Carton Security Seal:</span>
                <span className="font-mono font-bold text-indigo-900 print:text-black">
                  KIS-{order.orderNumber.replace(/[^0-9]/g, '') || '8942'}-SEAL
                </span>
              </div>
            </div>

            {/* Footwear Line Items Table */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden print:border-black">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 text-white uppercase text-[10px] tracking-wider print:bg-neutral-200 print:text-black">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Footwear Model & Spec</th>
                    <th className="py-2.5 px-3 text-center">Shoe Size</th>
                    <th className="py-2.5 px-3">Color</th>
                    <th className="py-2.5 px-3 text-center">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Value (KSh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-800 print:divide-black">
                  {order.items.map((it, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50 print:bg-white'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-neutral-500">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <strong className="text-neutral-950 block">{it.productTitle}</strong>
                        <span className="text-[11px] text-neutral-500">Unit: KSh {it.unitPrice.toLocaleString()}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-neutral-200/80 font-mono font-black text-xs">
                          {it.size}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{it.color}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {it.quantity} prs
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-950">
                        KSh {it.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Status & Settlement Details */}
            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 print:border-black print:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-neutral-500 block text-[11px]">Payment Terms & Reference:</span>
                <p className="font-bold text-neutral-900">
                  {order.paymentMethod.replace('_', ' ').toUpperCase()}
                  {order.mpesaReceipt && (
                    <span className="ml-2 font-mono text-emerald-800 font-bold">
                      (M-Pesa Ref: {order.mpesaReceipt})
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-neutral-500">
                  Total Wholesale Value:{' '}
                  <strong className="font-mono text-neutral-900">
                    KSh {order.totalAmount.toLocaleString()}
                  </strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                {isLipa && order.depositAmount ? (
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                      Lipa Pole Pole Layaway
                    </span>
                    <p className="text-neutral-700 text-xs">
                      Deposit Paid (30%):{' '}
                      <strong className="font-mono">KSh {order.depositAmount.toLocaleString()}</strong>
                    </p>
                    <p className="font-display font-black text-sm text-red-700 print:text-black font-mono">
                      Balance Due on Collection: KSh {(order.balanceDue || 0).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      Paid in Full & Cleared
                    </span>
                    <p className="text-xs text-neutral-500">
                      Zero balance due. Cleared for immediate stage handover.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Signatures & Seal Verification Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 rounded-2xl border border-neutral-300 space-y-4 print:border-black">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  1. Kisumu Depot Attendant
                </span>
                <div className="pt-6 border-b border-dashed border-neutral-400" />
                <div className="text-[10px] text-neutral-500 flex justify-between">
                  <span>Sign & Stamp</span>
                  <span>Date: {orderDate}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-neutral-300 space-y-4 print:border-black">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  2. {order.courier} Conductor
                </span>
                <div className="pt-6 border-b border-dashed border-neutral-400" />
                <div className="text-[10px] text-neutral-500 flex justify-between">
                  <span>Luggage Bay Custody</span>
                  <span>Bus Reg Plate: _____</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-neutral-300 space-y-4 print:border-black">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  3. Consignee Customer Acceptance
                </span>
                <div className="pt-6 border-b border-dashed border-neutral-400" />
                <div className="text-[10px] text-neutral-500 flex justify-between">
                  <span>Recipient Sign</span>
                  <span>National ID: _________</span>
                </div>
              </div>
            </div>

            {/* Bottom Notice */}
            <div className="text-center text-[10px] text-neutral-400 pt-3 border-t border-neutral-200 print:text-black">
              Official electronic waybill generated by Blues Collection Kisumu Depot Engine. Standard carriage terms apply.
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
