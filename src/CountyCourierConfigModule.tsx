import React, { useState, useMemo } from 'react';
import {
  Truck,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Plus,
  Edit2,
  Sliders,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { CountyShippingRate, CourierPartner, StoreSettings } from '../types';
import { INITIAL_47_COUNTIES_SHIPPING_RATES } from '../data/kenyaCountiesData';

interface CountyCourierConfigModuleProps {
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (settings: StoreSettings) => void;
}

export const CountyCourierConfigModule: React.FC<CountyCourierConfigModuleProps> = ({
  storeSettings,
  onUpdateStoreSettings,
}) => {
  const [shippingRates, setShippingRates] = useState<CountyShippingRate[]>(
    storeSettings.shippingRates && storeSettings.shippingRates.length > 0
      ? storeSettings.shippingRates
      : INITIAL_47_COUNTIES_SHIPPING_RATES
  );

  const [fuelSurgeMultiplier, setFuelSurgeMultiplier] = useState<number>(
    storeSettings.fuelSurgeMultiplier ?? 1.0
  );
  const [fuelSurchargePerCarton, setFuelSurchargePerCarton] = useState<number>(
    storeSettings.fuelSurchargePerCarton ?? 0
  );
  const [fuelSurgeReason, setFuelSurgeReason] = useState<string>(
    storeSettings.fuelSurgeReason || 'Standard EPRA Diesel Tariff (Baseline 1.0x)'
  );
  const [freeShippingEnabled, setFreeShippingEnabled] = useState<boolean>(
    storeSettings.freeShippingEnabled ?? true
  );
  const [freeShippingThresholdPairs, setFreeShippingThresholdPairs] = useState<number>(
    storeSettings.freeShippingThresholdPairs ?? 48
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCourierFilter, setSelectedCourierFilter] = useState<string>('all');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Bulk Adjustment State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkPercent, setBulkPercent] = useState<number>(10);
  const [bulkCourier, setBulkCourier] = useState<string>('all');

  // New Custom Stage Modal
  const [showNewCountyModal, setShowNewCountyModal] = useState(false);
  const [newCountyError, setNewCountyError] = useState<string | null>(null);
  const [newCountyForm, setNewCountyForm] = useState<Partial<CountyShippingRate>>({
    countyCode: '048',
    countyName: '',
    capitalTown: '',
    primaryStage: '',
    courierPartner: 'Guardian Angel',
    parcelRatePerCarton: 350,
    ratePerPair: 45,
    estimatedDeliveryTime: 'Next Morning (8:00 AM - 11:00 AM)',
    dispatchCutoff: '4:00 PM Express Daily',
    isActive: true,
    region: 'Lake Basin & Western',
  });

  const courierOptions: CourierPartner[] = [
    'Guardian Angel',
    'Easy Coach',
    'Fargo Courier',
    'Kisumu Matatu Shuttle',
    'Direct Shop Pickup',
  ];

  const regions = [
    'all',
    'Lake Basin & Western',
    'Rift Valley',
    'Central & Nairobi',
    'Eastern & Coast',
    'Northern Kenya',
  ];

  // Quick ETA presets
  const etaPresets = [
    'Same Day Express (1 - 2 Hours)',
    'Same Day Express (2 - 3 Hours)',
    'Same Day Express (3 - 4 Hours)',
    'Same Day Evening (4 - 5 Hours)',
    'Next Morning (6:00 AM - 8:00 AM)',
    'Next Morning (8:00 AM - 10:00 AM)',
    'Next Morning (9:00 AM - 12:00 PM)',
    'Next Day Afternoon (1:00 PM - 4:00 PM)',
    '24 - 36 Hours Transit',
    '24 - 48 Hours Express Transit',
    '48 Hours Long Haul Transit',
  ];

  // Filtered List
  const filteredRates = useMemo(() => {
    return shippingRates.filter((rate) => {
      const matchesSearch =
        rate.countyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.capitalTown.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.countyCode.includes(searchTerm) ||
        rate.primaryStage.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion = selectedRegion === 'all' || rate.region === selectedRegion;
      const matchesCourier = selectedCourierFilter === 'all' || rate.courierPartner === selectedCourierFilter;

      return matchesSearch && matchesRegion && matchesCourier;
    });
  }, [shippingRates, searchTerm, selectedRegion, selectedCourierFilter]);

  // Handle individual row update
  const handleUpdateRateField = (countyCode: string, field: keyof CountyShippingRate, value: any) => {
    setShippingRates((prev) =>
      prev.map((item) => (item.countyCode === countyCode ? { ...item, [field]: value } : item))
    );
  };

  // Save all changes to parent StoreSettings
  const handleSaveAllChanges = () => {
    onUpdateStoreSettings({
      ...storeSettings,
      shippingRates,
      fuelSurgeMultiplier,
      fuelSurchargePerCarton,
      fuelSurgeReason,
      freeShippingEnabled,
      freeShippingThresholdPairs,
    });
    setSavedNotification(`Saved shipping matrix and fuel surge rules (${fuelSurgeMultiplier}x) successfully!`);
    setTimeout(() => setSavedNotification(null), 3500);
  };

  // Reset to original 47 Kenya counties standards
  const handleResetToDefault = () => {
    if (window.confirm('Reset all 47 counties shipping tariffs and ETAs back to factory defaults?')) {
      setShippingRates(INITIAL_47_COUNTIES_SHIPPING_RATES);
      setFuelSurgeMultiplier(1.0);
      setFuelSurchargePerCarton(0);
      setFuelSurgeReason('Standard EPRA Diesel Tariff (Baseline 1.0x)');
      setFreeShippingEnabled(true);
      setFreeShippingThresholdPairs(48);
      onUpdateStoreSettings({
        ...storeSettings,
        shippingRates: INITIAL_47_COUNTIES_SHIPPING_RATES,
        fuelSurgeMultiplier: 1.0,
        fuelSurchargePerCarton: 0,
        fuelSurgeReason: 'Standard EPRA Diesel Tariff (Baseline 1.0x)',
        freeShippingEnabled: true,
        freeShippingThresholdPairs: 48,
      });
      setSavedNotification('Reset all 47 counties to default bus parcel rates!');
      setTimeout(() => setSavedNotification(null), 3500);
    }
  };

  // Apply Bulk Adjustment
  const handleApplyBulkAdjustment = (isIncrease: boolean) => {
    const factor = isIncrease ? 1 + bulkPercent / 100 : 1 - bulkPercent / 100;

    const updated = shippingRates.map((rate) => {
      if (bulkCourier === 'all' || rate.courierPartner === bulkCourier) {
        return {
          ...rate,
          parcelRatePerCarton: Math.round(rate.parcelRatePerCarton * factor / 10) * 10,
          ratePerPair: Math.round(rate.ratePerPair * factor / 5) * 5,
        };
      }
      return rate;
    });

    setShippingRates(updated);
    onUpdateStoreSettings({
      ...storeSettings,
      shippingRates: updated,
    });
    setShowBulkModal(false);
    setSavedNotification(
      `Applied ${isIncrease ? '+' : '-'}${bulkPercent}% rate adjustment across ${
        bulkCourier === 'all' ? 'all couriers' : bulkCourier
      }!`
    );
    setTimeout(() => setSavedNotification(null), 3500);
  };

  // Add Custom County / Stage
  const handleAddNewCounty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountyForm.countyName || !newCountyForm.capitalTown) {
      setNewCountyError('Please fill in County and Town names');
      return;
    }
    setNewCountyError(null);

    const newEntry: CountyShippingRate = {
      countyCode: newCountyForm.countyCode || `${Math.floor(100 + Math.random() * 900)}`,
      countyName: newCountyForm.countyName,
      capitalTown: newCountyForm.capitalTown,
      primaryStage: newCountyForm.primaryStage || `${newCountyForm.capitalTown} Main Stage`,
      courierPartner: newCountyForm.courierPartner as CourierPartner,
      parcelRatePerCarton: Number(newCountyForm.parcelRatePerCarton) || 350,
      ratePerPair: Number(newCountyForm.ratePerPair) || 45,
      estimatedDeliveryTime: newCountyForm.estimatedDeliveryTime || 'Next Morning (8:00 AM - 11:00 AM)',
      dispatchCutoff: newCountyForm.dispatchCutoff || '4:00 PM Express Daily',
      isActive: true,
      region: (newCountyForm.region as any) || 'Lake Basin & Western',
    };

    const updated = [newEntry, ...shippingRates];
    setShippingRates(updated);
    onUpdateStoreSettings({
      ...storeSettings,
      shippingRates: updated,
    });
    setShowNewCountyModal(false);
    setSavedNotification(`Added route for ${newEntry.countyName} (${newEntry.capitalTown})!`);
    setTimeout(() => setSavedNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {savedNotification && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{savedNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedNotification(null)}
            className="text-emerald-200 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Action Toolbar */}
      <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-950 border border-blue-800 text-blue-400 shadow-md">
            <Truck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-xl text-white">
                47 Counties Courier & Dynamic Transit Matrix
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                {shippingRates.length} County Terminals Configured
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Define shipping rates per carton or pair for all 47 counties in Kenya. Update bus dispatch cutoff
              times and delivery transit estimates dynamically for Guardian Angel, Easy Coach, and Fargo.
            </p>
          </div>
        </div>

        {/* Global Save & Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          {/* Add Custom Stage */}
          <button
            type="button"
            onClick={() => setShowNewCountyModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Sub-Stage</span>
          </button>

          {/* Bulk Adjust Rates */}
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Bulk Tariff Tool</span>
          </button>

          {/* Reset to Defaults */}
          <button
            type="button"
            onClick={handleResetToDefault}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Reset to standard 47 counties tariffs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Changes Button */}
          <button
            type="button"
            onClick={handleSaveAllChanges}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Matrix</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COUNTY FLEET FUEL SURGE & RATE MULTIPLIER CONTROL STATION */}
      {/* ========================================================= */}
      <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                  County Fleet Fuel Surge & Rate Multiplier Engine
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px] font-bold">
                  Active Multiplier: {fuelSurgeMultiplier}x
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Dynamic surcharge indexed against monthly EPRA diesel reviews and seasonal transit road conditions across Kenya.
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-neutral-500 font-semibold">Presets:</span>
            <button
              type="button"
              onClick={() => {
                setFuelSurgeMultiplier(1.0);
                setFuelSurchargePerCarton(0);
                setFuelSurgeReason('Standard EPRA Diesel Tariff (Baseline 1.0x)');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                fuelSurgeMultiplier === 1.0 && fuelSurchargePerCarton === 0
                  ? 'bg-neutral-200 text-neutral-900 font-black'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
              }`}
            >
              1.0x Baseline
            </button>
            <button
              type="button"
              onClick={() => {
                setFuelSurgeMultiplier(1.10);
                setFuelSurchargePerCarton(30);
                setFuelSurgeReason('Rainy Season / Muddy Route Surcharge (+10%)');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                fuelSurgeMultiplier === 1.10
                  ? 'bg-amber-500 text-neutral-950 font-black'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
              }`}
            >
              1.10x Rainy Route
            </button>
            <button
              type="button"
              onClick={() => {
                setFuelSurgeMultiplier(1.15);
                setFuelSurchargePerCarton(50);
                setFuelSurgeReason('December Holiday / Peak Fleet Surge (+15%)');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                fuelSurgeMultiplier === 1.15
                  ? 'bg-amber-500 text-neutral-950 font-black'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
              }`}
            >
              1.15x Holiday Peak
            </button>
            <button
              type="button"
              onClick={() => {
                setFuelSurgeMultiplier(0.90);
                setFuelSurchargePerCarton(0);
                setFuelSurgeReason('Subsidized B2B County Promo (-10%)');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                fuelSurgeMultiplier === 0.90
                  ? 'bg-emerald-500 text-neutral-950 font-black'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
              }`}
            >
              0.90x Promo Discount
            </button>
          </div>
        </div>

        {/* Multiplier Configuration Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Rate Multiplier Dial */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-300">Fuel Surge Multiplier</label>
              <span className="font-mono font-black text-amber-400 text-sm">{fuelSurgeMultiplier}x</span>
            </div>
            <input
              type="range"
              min={0.8}
              max={1.5}
              step={0.05}
              value={fuelSurgeMultiplier}
              onChange={(e) => setFuelSurgeMultiplier(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-neutral-500 block">
              Multiplies carton & pair base rates (0.8x to 1.5x)
            </span>
          </div>

          {/* Flat Surcharge Per Carton */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <label className="font-bold text-neutral-300 block">Flat EPRA Levy / Carton</label>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-mono">KSh</span>
              <input
                type="number"
                min={0}
                max={500}
                step={10}
                value={fuelSurchargePerCarton}
                onChange={(e) => setFuelSurchargePerCarton(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-[10px] text-neutral-500 block">
              Added per master carton (e.g. KSh 0, KSh 50)
            </span>
          </div>

          {/* Free Shipping Threshold */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-300">Free Bulk Parcel Waiver</label>
              <input
                type="checkbox"
                checked={freeShippingEnabled}
                onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={12}
                max={240}
                step={12}
                disabled={!freeShippingEnabled}
                value={freeShippingThresholdPairs}
                onChange={(e) => setFreeShippingThresholdPairs(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono font-bold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-neutral-500 font-mono text-[11px] shrink-0">Pairs</span>
            </div>
            <span className="text-[10px] text-emerald-400 block">
              {freeShippingEnabled ? `Free bus parcel for orders ≥ ${freeShippingThresholdPairs} pairs` : 'Waiver disabled'}
            </span>
          </div>

          {/* Reason / Notice Label */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
            <label className="font-bold text-neutral-300 block">Surge Notice Reason</label>
            <input
              type="text"
              value={fuelSurgeReason}
              onChange={(e) => setFuelSurgeReason(e.target.value)}
              placeholder="e.g. Standard EPRA Diesel Tariff"
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[10px] text-neutral-500 block truncate">
              Shown to resellers in checkout summary
            </span>
          </div>
        </div>

        {/* Live Sample Tariff Simulation */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <span className="text-neutral-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Live Calculated 1-Carton Delivery Sample:</strong></span>
          </span>

          <div className="flex items-center gap-4 flex-wrap font-mono text-[11px]">
            <span className="text-neutral-300">
              Eldoret (Guardian): <strong className="text-white">KSh {Math.round((300 * fuelSurgeMultiplier + fuelSurchargePerCarton) / 10) * 10}</strong>
            </span>
            <span className="text-neutral-300">
              Nairobi (EasyCoach): <strong className="text-white">KSh {Math.round((450 * fuelSurgeMultiplier + fuelSurchargePerCarton) / 10) * 10}</strong>
            </span>
            <span className="text-neutral-300">
              Kakamega (Shuttle): <strong className="text-white">KSh {Math.round((200 * fuelSurgeMultiplier + fuelSurchargePerCarton) / 10) * 10}</strong>
            </span>
            <span className="text-neutral-300">
              Mombasa (Fargo): <strong className="text-white">KSh {Math.round((600 * fuelSurgeMultiplier + fuelSurchargePerCarton) / 10) * 10}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search county (e.g. 027 Uasin Gishu, Eldoret, Nairobi, Kisii)..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Courier Dropdown Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedCourierFilter}
            onChange={(e) => setSelectedCourierFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Courier Partners</option>
            {courierOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Region Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {regions.map((reg) => (
          <button
            key={reg}
            type="button"
            onClick={() => setSelectedRegion(reg)}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedRegion === reg
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {reg === 'all' ? `All 47 Counties (${shippingRates.length})` : reg}
          </button>
        ))}
      </div>

      {/* Counties Grid Matrix Table */}
      <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-900 border-b border-neutral-800 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                <th className="p-3.5 w-12 text-center">Code</th>
                <th className="p-3.5 min-w-[160px]">County & Capital Town</th>
                <th className="p-3.5 min-w-[180px]">Primary Bus Stage Terminal</th>
                <th className="p-3.5 min-w-[150px]">Courier Partner</th>
                <th className="p-3.5 min-w-[110px] text-right">Carton Rate (KSh)</th>
                <th className="p-3.5 min-w-[100px] text-right">Pair Rate (KSh)</th>
                <th className="p-3.5 min-w-[200px]">Estimated Delivery Transit</th>
                <th className="p-3.5 min-w-[90px] text-center">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 font-sans">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500">
                    No county routes found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredRates.map((rate) => (
                  <tr
                    key={rate.countyCode}
                    className={`hover:bg-neutral-900/60 transition-colors ${
                      !rate.isActive ? 'opacity-50 bg-neutral-950/40' : ''
                    }`}
                  >
                    {/* County Code */}
                    <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                      {rate.countyCode}
                    </td>

                    {/* County Name & Capital Town */}
                    <td className="p-3.5">
                      <strong className="text-white block font-display text-sm">{rate.countyName}</strong>
                      <span className="text-neutral-400 text-[11px] block">{rate.capitalTown}</span>
                      <span className="text-[9px] text-blue-400 font-semibold uppercase">{rate.region}</span>
                    </td>

                    {/* Primary Bus Stage */}
                    <td className="p-3.5">
                      <input
                        type="text"
                        value={rate.primaryStage}
                        onChange={(e) => handleUpdateRateField(rate.countyCode, 'primaryStage', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* Preferred Courier */}
                    <td className="p-3.5">
                      <select
                        value={rate.courierPartner}
                        onChange={(e) =>
                          handleUpdateRateField(rate.countyCode, 'courierPartner', e.target.value as CourierPartner)
                        }
                        className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {courierOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Parcel Rate Per Carton */}
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-neutral-500 text-[11px]">KSh</span>
                        <input
                          type="number"
                          value={rate.parcelRatePerCarton}
                          onChange={(e) =>
                            handleUpdateRateField(
                              rate.countyCode,
                              'parcelRatePerCarton',
                              Math.max(0, Number(e.target.value))
                            )
                          }
                          className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-700/80 rounded-lg text-right text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </td>

                    {/* Rate Per Pair */}
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-neutral-500 text-[11px]">KSh</span>
                        <input
                          type="number"
                          value={rate.ratePerPair}
                          onChange={(e) =>
                            handleUpdateRateField(
                              rate.countyCode,
                              'ratePerPair',
                              Math.max(0, Number(e.target.value))
                            )
                          }
                          className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-700/80 rounded-lg text-right text-white font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </td>

                    {/* Estimated Delivery Time (ETA) */}
                    <td className="p-3.5 space-y-1">
                      <input
                        type="text"
                        value={rate.estimatedDeliveryTime}
                        onChange={(e) =>
                          handleUpdateRateField(rate.countyCode, 'estimatedDeliveryTime', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {/* Quick Presets Dropdown */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateRateField(rate.countyCode, 'estimatedDeliveryTime', e.target.value);
                          }
                        }}
                        defaultValue=""
                        className="w-full px-1.5 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-[10px] text-neutral-400"
                      >
                        <option value="" disabled>
                          Select preset ETA...
                        </option>
                        {etaPresets.map((eta) => (
                          <option key={eta} value={eta}>
                            {eta}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Active Route Toggle */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={rate.isActive}
                        onChange={(e) => handleUpdateRateField(rate.countyCode, 'isActive', e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 bg-neutral-900 border-neutral-700 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Matrix Footer Stats */}
        <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Showing {filteredRates.length} of {shippingRates.length} total Kenyan county destinations.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveAllChanges}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Save All Matrix Changes
          </button>
        </div>
      </div>

      {/* MODAL 1: BULK TARIFF MULTIPLIER TOOL */}
      {showBulkModal && (
        <div
          onClick={() => setShowBulkModal(false)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 text-white rounded-3xl max-w-md w-full border border-neutral-700 p-6 space-y-5 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Bulk Tariff Multiplier Tool
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Quickly adjust all shipping parcel rates up or down across multiple counties (e.g. for fuel price
              surges or holiday discounts).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold block mb-1">Percentage Adjustment (%):</label>
                <input
                  type="number"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono font-bold text-sm"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Target Courier Fleet:</label>
                <select
                  value={bulkCourier}
                  onChange={(e) => setBulkCourier(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-medium"
                >
                  <option value="all">Apply to All Courier Fleets</option>
                  {courierOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleApplyBulkAdjustment(true)}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                Increase (+{bulkPercent}%)
              </button>
              <button
                type="button"
                onClick={() => handleApplyBulkAdjustment(false)}
                className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
              >
                Discount (-{bulkPercent}%)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW CUSTOM COUNTY / STAGE */}
      {showNewCountyModal && (
        <div
          onClick={() => setShowNewCountyModal(false)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 text-white rounded-3xl max-w-lg w-full border border-neutral-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Add Custom Destination / Stage
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCountyModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewCounty} className="space-y-3.5 text-xs">
              {newCountyError && (
                <div className="px-3 py-2 rounded-xl bg-red-950/60 border border-red-800 text-red-300 font-medium">
                  {newCountyError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">County Name *</label>
                  <input
                    type="text"
                    required
                    value={newCountyForm.countyName}
                    onChange={(e) => setNewCountyForm({ ...newCountyForm, countyName: e.target.value })}
                    placeholder="e.g. Uasin Gishu"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Capital Town / Hub *</label>
                  <input
                    type="text"
                    required
                    value={newCountyForm.capitalTown}
                    onChange={(e) => setNewCountyForm({ ...newCountyForm, capitalTown: e.target.value })}
                    placeholder="e.g. Turbo / Eldoret"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Primary Bus Stage Terminal *</label>
                <input
                  type="text"
                  required
                  value={newCountyForm.primaryStage}
                  onChange={(e) => setNewCountyForm({ ...newCountyForm, primaryStage: e.target.value })}
                  placeholder="e.g. Turbo Main Stage"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Courier Fleet</label>
                  <select
                    value={newCountyForm.courierPartner}
                    onChange={(e) =>
                      setNewCountyForm({ ...newCountyForm, courierPartner: e.target.value as CourierPartner })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white"
                  >
                    {courierOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Region</label>
                  <select
                    value={newCountyForm.region}
                    onChange={(e) => setNewCountyForm({ ...newCountyForm, region: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white"
                  >
                    <option value="Lake Basin & Western">Lake Basin & Western</option>
                    <option value="Rift Valley">Rift Valley</option>
                    <option value="Central & Nairobi">Central & Nairobi</option>
                    <option value="Eastern & Coast">Eastern & Coast</option>
                    <option value="Northern Kenya">Northern Kenya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Carton Rate (KSh)</label>
                  <input
                    type="number"
                    value={newCountyForm.parcelRatePerCarton}
                    onChange={(e) =>
                      setNewCountyForm({ ...newCountyForm, parcelRatePerCarton: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Pair Rate (KSh)</label>
                  <input
                    type="number"
                    value={newCountyForm.ratePerPair}
                    onChange={(e) =>
                      setNewCountyForm({ ...newCountyForm, ratePerPair: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Estimated Delivery Time</label>
                <input
                  type="text"
                  value={newCountyForm.estimatedDeliveryTime}
                  onChange={(e) =>
                    setNewCountyForm({ ...newCountyForm, estimatedDeliveryTime: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewCountyModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
                >
                  Add Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
