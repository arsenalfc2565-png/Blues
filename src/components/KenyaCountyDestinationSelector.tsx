import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  Search,
  Check,
  ChevronDown,
  X,
  Truck,
  Clock,
  Navigation,
  Sparkles,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { KENYA_47_COUNTIES, KenyaCounty, KENYA_REGIONAL_CORRIDORS } from '../data/kenyaCounties';
import { CourierPartner } from '../types';

interface KenyaCountyDestinationSelectorProps {
  selectedCountyCode?: string;
  selectedDestinationText: string;
  onSelectDestination: (county: KenyaCounty, dropPoint?: string) => void;
  onSelectCourier?: (courier: CourierPartner) => void;
  className?: string;
  label?: string;
  required?: boolean;
}

export const KenyaCountyDestinationSelector: React.FC<KenyaCountyDestinationSelectorProps> = ({
  selectedCountyCode,
  selectedDestinationText,
  onSelectDestination,
  onSelectCourier,
  className = '',
  label = 'Select Parcel Delivery Destination (All 47 Kenya Counties)',
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('All 47 Counties');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find currently selected county object
  const activeCounty = useMemo(() => {
    if (selectedCountyCode) {
      return KENYA_47_COUNTIES.find((c) => c.code === selectedCountyCode || String(c.number) === selectedCountyCode);
    }
    // Match by text (e.g. "Eldoret", "Nairobi", "Kakamega")
    return KENYA_47_COUNTIES.find((c) =>
      selectedDestinationText.toLowerCase().includes(c.name.toLowerCase()) ||
      selectedDestinationText.toLowerCase().includes(c.capital.toLowerCase())
    ) || KENYA_47_COUNTIES.find((c) => c.code === '027'); // Default Uasin Gishu / Eldoret
  }, [selectedCountyCode, selectedDestinationText]);

  // Filtered counties by search query and corridor tab
  const filteredCounties = useMemo(() => {
    return KENYA_47_COUNTIES.filter((county) => {
      // Filter by regional corridor
      if (selectedCorridor !== 'All 47 Counties' && county.region !== selectedCorridor) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = county.name.toLowerCase().includes(q);
        const matchesCapital = county.capital.toLowerCase().includes(q);
        const matchesCode = county.code.includes(q) || String(county.number) === q;
        const matchesStage = county.primaryStage.toLowerCase().includes(q);
        const matchesDropPoints = county.popularDropPoints.some((dp) => dp.toLowerCase().includes(q));

        if (!matchesName && !matchesCapital && !matchesCode && !matchesStage && !matchesDropPoints) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCorridor]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handlePickCounty = (county: KenyaCounty, dropPoint?: string) => {
    onSelectDestination(county, dropPoint);
    // Auto-suggest best courier if callback provided
    if (onSelectCourier && county.recommendedCouriers.length > 0) {
      const best = county.recommendedCouriers[0];
      if (
        best === 'Guardian Angel' ||
        best === 'Easy Coach' ||
        best === 'Fargo Courier' ||
        best === 'Kisumu Matatu Shuttle'
      ) {
        onSelectCourier(best as CourierPartner);
      } else if (county.recommendedCouriers.includes('Guardian Angel')) {
        onSelectCourier('Guardian Angel');
      } else if (county.recommendedCouriers.includes('Easy Coach')) {
        onSelectCourier('Easy Coach');
      }
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className={`relative space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            47 Counties Active
          </span>
        </div>
      )}

      {/* Selected Value Trigger Card */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-md'
            : 'bg-white hover:bg-neutral-50/90 border-neutral-300 hover:border-neutral-400'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-mono font-black text-xs flex flex-col items-center justify-center shrink-0 shadow-xs">
            <span className="text-[8px] uppercase tracking-tighter opacity-80 leading-none">Code</span>
            <span className="text-sm font-extrabold leading-none mt-0.5">{activeCounty?.code || '027'}</span>
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xs sm:text-sm text-neutral-950 truncate">
                {activeCounty ? `${activeCounty.name} County (${activeCounty.capital})` : selectedDestinationText}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 uppercase hidden sm:inline">
                {activeCounty?.region || 'Corridor'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5 truncate">
              <span className="flex items-center gap-1 font-medium text-neutral-700 truncate">
                <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                <span>{activeCounty?.primaryStage || 'Express Stage Terminal'}</span>
              </span>
              <span>·</span>
              <span className="font-semibold text-emerald-700 shrink-0">{activeCounty?.transitHours}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-neutral-400 shrink-0">
          <span className="text-[11px] font-bold text-blue-600 hidden sm:inline">Change</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </div>
      </button>

      {/* Pop-Out Kenya 47 Counties Selection Drawer / Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-neutral-300 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px] animate-in fade-in zoom-in-95 duration-150">
          {/* Top Search & Filter Header */}
          <div className="p-3.5 bg-neutral-900 text-white space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-display font-bold text-xs sm:text-sm">
                  Kenya 47 Counties Dispatch Directory
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by County name, code (e.g. 047), town (Eldoret, Kisii, Kakamega), or stage..."
                className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Regional Corridor Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              {KENYA_REGIONAL_CORRIDORS.map((corridor) => (
                <button
                  key={corridor}
                  type="button"
                  onClick={() => setSelectedCorridor(corridor)}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCorridor === corridor
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {corridor}
                </button>
              ))}
            </div>
          </div>

          {/* Counties List with Rich Information Badges */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-neutral-100 bg-neutral-50/50">
            {filteredCounties.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-neutral-300" />
                <p className="text-xs font-semibold">No county or town found matching "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCorridor('All 47 Counties');
                  }}
                  className="text-xs text-blue-600 font-bold underline"
                >
                  Reset filters & view all 47 counties
                </button>
              </div>
            ) : (
              filteredCounties.map((county) => {
                const isSelected = activeCounty?.code === county.code;

                return (
                  <div
                    key={county.code}
                    className={`pt-2 first:pt-0 p-2.5 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border border-blue-400 shadow-2xs'
                        : 'hover:bg-white hover:shadow-xs border border-transparent'
                    }`}
                    onClick={() => handlePickCounty(county)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {/* County Official Code Badge */}
                        <div
                          className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex flex-col items-center justify-center shrink-0 shadow-2xs ${
                            isSelected ? 'bg-blue-700 text-white' : 'bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          <span className="text-[7px] uppercase leading-none opacity-80 font-bold">No.</span>
                          <span className="text-xs font-extrabold leading-tight mt-0.5">{county.code}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-xs sm:text-sm text-neutral-900">
                              {county.name} County
                            </span>
                            <span className="text-xs text-neutral-500 font-medium">({county.capital})</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-200 text-neutral-700">
                              {county.region}
                            </span>
                          </div>

                          <p className="text-[11px] text-neutral-600 mt-0.5 flex items-center gap-1.5">
                            <Navigation className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="font-semibold text-neutral-800 truncate">
                              Primary Stage: {county.primaryStage}
                            </span>
                          </p>

                          {/* Quick popular drop points */}
                          <div className="flex items-center gap-1 flex-wrap mt-1.5">
                            <span className="text-[10px] text-neutral-400 font-bold">Drops:</span>
                            {county.popularDropPoints.slice(0, 3).map((dp) => (
                              <button
                                key={dp}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePickCounty(county, dp);
                                }}
                                className="px-2 py-0.5 rounded-md bg-white border border-neutral-300 hover:border-blue-500 hover:bg-blue-50 text-[10px] font-medium text-neutral-700 hover:text-blue-900 transition-colors"
                              >
                                {dp}
                              </button>
                            ))}
                            {county.popularDropPoints.length > 3 && (
                              <span className="text-[9px] text-neutral-400">
                                +{county.popularDropPoints.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Transit Time & Select Check */}
                      <div className="text-right shrink-0 space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {county.transitHours}
                        </span>

                        <div className="text-[10px] text-neutral-500 font-medium">
                          {county.recommendedCouriers[0]}
                        </div>

                        {isSelected && (
                          <div className="flex items-center justify-end text-blue-600 text-[11px] font-bold gap-0.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer Strip */}
          <div className="p-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-600 shrink-0">
            <span>
              All parcels dispatched daily at <strong>4:00 PM</strong> from Kisumu Main Bus Park
            </span>
            <span className="font-bold text-blue-700">
              {filteredCounties.length} of 47 Counties
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
