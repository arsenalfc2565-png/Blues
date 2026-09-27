import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'sw' | 'luo' | 'sheng';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English (Kenya)',
    flag: '🇰🇪',
    region: 'Standard National B2B Wholesale',
  },
  {
    code: 'sw',
    label: 'Kiswahili',
    nativeLabel: 'Kiswahili Safi',
    flag: '🇹🇿🇰🇪',
    region: 'Biashara ya Jumla Afrika Mashariki',
  },
  {
    code: 'luo',
    label: 'Dholuo',
    nativeLabel: 'Dholuo (Nyanza)',
    flag: '🌊',
    region: 'Kisumu, Siaya, Homa Bay, Migori',
  },
  {
    code: 'sheng',
    label: 'Sheng',
    nativeLabel: 'Sheng / Mtaa Slang',
    flag: '⚡',
    region: 'Nairobi & Urban Street Vendors',
  },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    depot_location_tag: 'Kisumu Bus Park Depot · Swan Centre Terminus',
    daily_bus_dispatch: 'Daily Bus Parcel Dispatches to Eldoret, Nairobi, Kakamega, Bungoma & Kisii via Guardian & EasyCoach',
    nav_wholesale_catalog: 'Wholesale Catalog',
    nav_3d_studio: '3D Studio & Flex',
    nav_size_pairing: 'Size Pairing Rules',
    nav_kisumu_store: 'Kisumu Store',
    nav_track_order: 'Track Bus Parcel',
    nav_orders_mpesa: 'Orders & M-Pesa Statements',
    nav_starter_packs: 'Starter Packs',
    nav_price_sheet_pdf: 'Price Sheet PDF',
    nav_flyer_maker: 'Flyer Maker',
    nav_admin: 'Admin Portal',
    nav_cart: 'Cart',
    
    // Hero
    hero_badge: 'Direct Factory Landed Prices in Western Kenya',
    hero_title: 'Direct Footwear Wholesale from Kisumu Bus Park to All 47 Counties',
    hero_subtitle: 'No middleman markups. Order balanced master cartons with zero dead stock guarantee, 3D footwear preview, and 4:00 PM same-day bus parcel express dispatches.',
    hero_btn_browse: 'Browse Wholesale Models',
    hero_btn_matrix: 'Simulate Carton Matrix (24 Pairs)',
    
    // Lipa Pole Pole & Badges
    lipa_pole_pole_title: 'Lipa Pole Pole Layaway (30% Deposit)',
    lipa_pole_pole_desc: 'Pay 30% deposit now to lock master carton inventory. Clear remaining balance upon bus collection at your destination stage.',
    paired_sizing_tag: '100% Balanced Paired Sizing (42↔37, 41↔38, 40↔39)',
    zero_dead_stock: 'Zero Orphan Size Guarantee',
    
    // Catalog & Commercial
    wholesale_price: 'Wholesale Price',
    suggested_retail: 'Suggested Retail',
    reseller_profit: 'Reseller Net Margin',
    moq_notice: 'MOQ: 2 Pairs Wholesale',
    add_to_cart: 'Add to Cart',
    pairs: 'Pairs',
    cartons: 'Master Cartons',
    
    // Logistics
    bus_dispatch_time: '4:00 PM Express Daily Dispatch',
    bus_carriers: 'Guardian Angel, Easy Coach, Fargo Courier, North Rift Shuttle',
  },
  
  sw: {
    depot_location_tag: 'Bohari Kuu ya Kisumu Bus Park · Swan Centre',
    daily_bus_dispatch: 'Mizigo inasafirishwa kila siku saa 10:00 jioni kuelekea Eldoret, Nairobi, Kakamega, Bungoma na Kisii kupitia Guardian & EasyCoach',
    nav_wholesale_catalog: 'Katalogi ya Jumla',
    nav_3d_studio: 'Studio ya Picha za 3D',
    nav_size_pairing: 'Kanuni za Nambari za Viatu',
    nav_kisumu_store: 'Duka la Kisumu',
    nav_track_order: 'Fuata Mzigo wa Basi',
    nav_orders_mpesa: 'Maagizo & Taarifa ya M-Pesa',
    nav_starter_packs: 'Maboksi ya Kuanzia Biashara',
    nav_price_sheet_pdf: 'Orodha ya Bei (PDF)',
    nav_flyer_maker: 'Tengeneza Bango la WhatsApp',
    nav_admin: 'Usimamizi (Admin)',
    nav_cart: 'Kikapu',
    
    // Hero
    hero_badge: 'Bei Nafuu Moja kwa Moja kutoka Kiwandani Kisumu',
    hero_title: 'Viatu vya Jumla kutoka Kisumu Bus Park hadi Kaunti Zote 47 za Kenya',
    hero_subtitle: 'Bila madalali. Nunua maboksi yaliyopimwa nambari sawia kuzuia viatu vilivyosalia, tazama modeli za 3D, na upokee mzigo wa basi uliotumwa saa 10:00 jioni.',
    hero_btn_browse: 'Tazama Viatu vya Jumla',
    hero_btn_matrix: 'Pima Boksi la Jozi 24',
    
    // Lipa Pole Pole & Badges
    lipa_pole_pole_title: 'Lipia Pole Pole (Amana ya 30%)',
    lipa_pole_pole_desc: 'Lipa amana ya 30% sasa ili kufunga mzigo wako kwenye bohari. Malizia salio lililobaki wakati unachukua mzigo kwenye kituo cha basi mjini mwako.',
    paired_sizing_tag: 'Nambari Zilizooanishwa (42↔37, 41↔38, 40↔39)',
    zero_dead_stock: 'Hakikisho la Kutobakiwa na Viatu Visivyouzika',
    
    // Catalog & Commercial
    wholesale_price: 'Bei ya Jumla',
    suggested_retail: 'Bei ya Kuuza Rejareja',
    reseller_profit: 'Faida Safi ya Mfanyabiashara',
    moq_notice: 'Kiwango cha Chini: Jozi 2 za Jumla',
    add_to_cart: 'Weka Kwenye Kikapu',
    pairs: 'Jozi',
    cartons: 'Maboksi Makuu',
    
    // Logistics
    bus_dispatch_time: 'Usafirishaji wa Basi Saa 10:00 Jioni Kila Siku',
    bus_carriers: 'Guardian Angel, Easy Coach, Fargo Courier, North Rift Shuttle',
  },
  
  luo: {
    depot_location_tag: 'Chiro Maduong mar Basi Kisumu · Swan Centre',
    daily_bus_dispatch: 'Mizigo mag wuoche idhigo sa ang\'wen (4:00 PM) odhi Eldoret, Nairobi, Kakamega, Bungoma gi Kisii gi Guardian gi EasyCoach',
    nav_wholesale_catalog: 'Katalogi mar Wuoche',
    nav_3d_studio: 'Studio mar 3D',
    nav_size_pairing: 'Chike mag Namba mag Wuoche',
    nav_kisumu_store: 'Duka mar Kisumu',
    nav_track_order: 'Rang Mzigo mar Basi',
    nav_orders_mpesa: 'Choke & Risiti mar M-Pesa',
    nav_starter_packs: 'Kateni mag Chako Biashara',
    nav_price_sheet_pdf: 'Bei mag Wuoche (PDF)',
    nav_flyer_maker: 'Loso Flyer mar WhatsApp',
    nav_admin: 'Jatelo mar Duka',
    nav_cart: 'Okapu',
    
    // Hero
    hero_badge: 'Wuoche mag Bei Miyo e Lake Basin',
    hero_title: 'Wuoche mag Jumla kowuok Kisumu Bus Park nyaka Kaunti Duto 47 e Kenya',
    hero_subtitle: 'Onge joma golo faida e diere. Ng\'iew kateni moriwore maber mondo namba duto orumi, neny wuoche e 3D, kendo iyud mzigo idhigo sa ang\'wen odhiango.',
    hero_btn_browse: 'Rang Wuoche Duto',
    hero_btn_matrix: 'Tem Katen mar Jozi 24',
    
    // Lipa Pole Pole & Badges
    lipa_pole_pole_title: 'Chul Moten-moten (30% Deposit)',
    lipa_pole_pole_desc: 'Chul 30% sani mondo imaki kateni mari e bohari. Ibiro tieko chudo ma odong\' ka ikawoni mzigo e stage mar basi e taon mari.',
    paired_sizing_tag: 'Namba Mowinjore (42↔37, 41↔38, 40↔39)',
    zero_dead_stock: 'Singruok ni Wuoche Ok Bi Dong\' e Chiro',
    
    // Catalog & Commercial
    wholesale_price: 'Bei mar Jumla',
    suggested_retail: 'Bei mar Uso e Chiro',
    reseller_profit: 'Ohala Maber ma Iyudo',
    moq_notice: 'Tindo: Jozi 2 mar Jumla',
    add_to_cart: 'Ket e Okapu',
    pairs: 'Jozi',
    cartons: 'Kateni Madongo',
    
    // Logistics
    bus_dispatch_time: 'Idhigo Basi Saa Ang\'wen Gik Okinyi',
    bus_carriers: 'Guardian Angel, Easy Coach, Fargo Courier, North Rift Shuttle',
  },
  
  sheng: {
    depot_location_tag: 'Stage ya Basi Kisumu · Swan Centre Base',
    daily_bus_dispatch: 'Parcels zinatep daily 4:00 PM zikishika Eldoret, Kanairo, Kakamega, Bungoma na Kisii via Guardian na EasyCoach',
    nav_wholesale_catalog: 'Katalogi ya Jumla',
    nav_3d_studio: '3D Studio ya Msee',
    nav_size_pairing: 'Rada ya Size Ratios',
    nav_kisumu_store: 'Duka Base ya Kisumu',
    nav_track_order: 'Track Ndinga ya Parcel',
    nav_orders_mpesa: 'Orders & Statements za M-Pesa',
    nav_starter_packs: 'Starter Packs za Risto',
    nav_price_sheet_pdf: 'Price Sheet ya WhatsApp (PDF)',
    nav_flyer_maker: 'Unda Poster ya WhatsApp',
    nav_admin: 'Admin Rada',
    nav_cart: 'Cart / Trolley',
    
    // Hero
    hero_badge: 'Bei ya Kiwanda Bila Madalali Kisumu Base',
    hero_title: 'Kiatu za Jumla Kutoka Kisumu Bus Park Hadi County Zote 47 za 254',
    hero_subtitle: 'Bila broker yeyote. Agiza master carton iliyo na size zote zilizobalance ndio usikwame na dead stock, cheki viatu 3D, na parcels zikishuka saa kumi jioni.',
    hero_btn_browse: 'Cheki Viatu Zote',
    hero_btn_matrix: 'Calculate Carton ya Pairs 24',
    
    // Lipa Pole Pole & Badges
    lipa_pole_pole_title: 'Lipia Mdogo Mdogo (30% Deposit)',
    lipa_pole_pole_desc: 'Toa deposit ya 30% kwanza ili tublock box yako. Balance utalipa ukipick kwa stage ya bus mtaani kwako.',
    paired_sizing_tag: 'Size Zimebalance (42↔37, 41↔38, 40↔39)',
    zero_dead_stock: 'Zero Dead Stock - Kila Kiatu Lazima Isonge',
    
    // Catalog & Commercial
    wholesale_price: 'Bei ya Jumla',
    suggested_retail: 'Bei ya Retail Mtaani',
    reseller_profit: 'Faida Safi ya Msee',
    moq_notice: 'MOQ: Pairs 2 za Wholesale',
    add_to_cart: 'Weka kwa Cart',
    pairs: 'Pairs',
    cartons: 'Cartons za Jumla',
    
    // Logistics
    bus_dispatch_time: 'Ndinga Inaondoka 4:00 PM Daily',
    bus_carriers: 'Guardian Angel, Easy Coach, Fargo Courier, North Rift Shuttle',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('blues_app_language');
      if (saved && (saved === 'en' || saved === 'sw' || saved === 'luo' || saved === 'sheng')) {
        return saved as LanguageCode;
      }
    } catch (e) {}
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('blues_app_language', lang);
    } catch (e) {}
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
