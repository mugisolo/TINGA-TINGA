export type SupportedLanguage = 'en' | 'fr' | 'ar' | 'zh' | 'nl' | 'de';

export interface LanguageMetadata {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  shortLabel: string;
  dir: 'ltr' | 'rtl';
  sampleCountry: string;
  sampleCity: string;
  countryCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMetadata[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    shortLabel: 'EN',
    dir: 'ltr',
    sampleCountry: 'Uganda / United Kingdom',
    sampleCity: 'Entebbe',
    countryCode: 'UG',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    shortLabel: 'FR',
    dir: 'ltr',
    sampleCountry: 'France',
    sampleCity: 'Paris',
    countryCode: 'FR',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    shortLabel: 'AR',
    dir: 'rtl',
    sampleCountry: 'United Arab Emirates',
    sampleCity: 'Dubai',
    countryCode: 'AE',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    shortLabel: 'ZH',
    dir: 'ltr',
    sampleCountry: 'China',
    sampleCity: 'Shanghai',
    countryCode: 'CN',
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    shortLabel: 'NL',
    dir: 'ltr',
    sampleCountry: 'Netherlands',
    sampleCity: 'Amsterdam',
    countryCode: 'NL',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    shortLabel: 'DE',
    dir: 'ltr',
    sampleCountry: 'Germany',
    sampleCity: 'Berlin',
    countryCode: 'DE',
  },
];

export const COUNTRY_TO_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  // French-speaking countries & territories
  FR: 'fr',
  MC: 'fr',
  LU: 'fr',
  SN: 'fr',
  CI: 'fr',
  CM: 'fr',
  CD: 'fr',
  CG: 'fr',
  GA: 'fr',
  ML: 'fr',
  BF: 'fr',
  NE: 'fr',
  TG: 'fr',
  BJ: 'fr',
  MG: 'fr',
  MU: 'fr',
  SC: 'fr',
  DJ: 'fr',
  RW: 'fr',
  BI: 'fr',
  RE: 'fr',
  GP: 'fr',
  MQ: 'fr',

  // Arabic-speaking countries
  AE: 'ar',
  SA: 'ar',
  QA: 'ar',
  KW: 'ar',
  BH: 'ar',
  OM: 'ar',
  EG: 'ar',
  JO: 'ar',
  LB: 'ar',
  MA: 'ar',
  DZ: 'ar',
  TN: 'ar',
  IQ: 'ar',
  SY: 'ar',
  PS: 'ar',
  YE: 'ar',
  SD: 'ar',
  LY: 'ar',
  MR: 'ar',

  // Chinese-speaking countries & regions
  CN: 'zh',
  TW: 'zh',
  HK: 'zh',
  MO: 'zh',
  SG: 'zh',

  // Dutch-speaking countries & territories
  NL: 'nl',
  BE: 'nl',
  SR: 'nl',
  AW: 'nl',
  CW: 'nl',
  SX: 'nl',

  // German-speaking countries
  DE: 'de',
  AT: 'de',
  CH: 'de',
  LI: 'de',
};

export function inferLanguageFromTimezoneOrBrowser(): {
  lang: SupportedLanguage;
  countryName: string;
  countryCode: string;
  city?: string;
} {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = tz.toLowerCase();

    if (
      tzLower.includes('paris') ||
      tzLower.includes('abidjan') ||
      tzLower.includes('dakar') ||
      tzLower.includes('kinshasa') ||
      tzLower.includes('douala')
    ) {
      return { lang: 'fr', countryName: 'France', countryCode: 'FR', city: 'Paris' };
    }
    if (
      tzLower.includes('dubai') ||
      tzLower.includes('riyadh') ||
      tzLower.includes('cairo') ||
      tzLower.includes('Qatar'.toLowerCase()) ||
      tzLower.includes('kuwait') ||
      tzLower.includes('amman') ||
      tzLower.includes('casablanca')
    ) {
      return {
        lang: 'ar',
        countryName: 'United Arab Emirates',
        countryCode: 'AE',
        city: 'Dubai',
      };
    }
    if (
      tzLower.includes('shanghai') ||
      tzLower.includes('chongqing') ||
      tzLower.includes('harbin') ||
      tzLower.includes('taipei') ||
      tzLower.includes('hong_kong') ||
      tzLower.includes('singapore')
    ) {
      return { lang: 'zh', countryName: 'China', countryCode: 'CN', city: 'Shanghai' };
    }
    if (tzLower.includes('amsterdam') || tzLower.includes('paramaribo')) {
      return {
        lang: 'nl',
        countryName: 'Netherlands',
        countryCode: 'NL',
        city: 'Amsterdam',
      };
    }
    if (
      tzLower.includes('berlin') ||
      tzLower.includes('vienna') ||
      tzLower.includes('zurich') ||
      tzLower.includes('busingen')
    ) {
      return { lang: 'de', countryName: 'Germany', countryCode: 'DE', city: 'Berlin' };
    }
    if (tzLower.includes('brussels')) {
      const navLang = (navigator.language || '').toLowerCase();
      if (navLang.startsWith('fr')) {
        return { lang: 'fr', countryName: 'Belgium', countryCode: 'BE', city: 'Brussels' };
      }
      return { lang: 'nl', countryName: 'Belgium', countryCode: 'BE', city: 'Brussels' };
    }

    const navLangs = navigator.languages || [navigator.language || 'en'];
    for (const raw of navLangs) {
      const prefix = raw.toLowerCase().slice(0, 2);
      if (prefix === 'fr') {
        return { lang: 'fr', countryName: 'France', countryCode: 'FR' };
      }
      if (prefix === 'ar') {
        return { lang: 'ar', countryName: 'United Arab Emirates', countryCode: 'AE' };
      }
      if (prefix === 'zh') {
        return { lang: 'zh', countryName: 'China', countryCode: 'CN' };
      }
      if (prefix === 'nl') {
        return { lang: 'nl', countryName: 'Netherlands', countryCode: 'NL' };
      }
      if (prefix === 'de') {
        return { lang: 'de', countryName: 'Germany', countryCode: 'DE' };
      }
    }
  } catch {
    // ignore
  }
  return { lang: 'en', countryName: 'International', countryCode: 'UG' };
}

export interface TranslationDictionary {
  // Geo Banner & Language Switcher
  geoBanner: {
    detectedFrom: string;
    proposeSwitch: string;
    switchButton: string;
    keepCurrent: string;
    locateMe: string;
    locating: string;
    selectLanguagePrompt: string;
    testGeoLabel: string;
  };
  // Navbar & Navigation
  nav: {
    ourGuides: string;
    experiences: string;
    destinations: string;
    howWeWork: string;
    tripPlanner: string;
    safariWallet: string;
    reviews: string;
    journal: string;
    about: string;
    contact: string;
    planMySafari: string;
    topBarCollective: string;
    topBarPromise: string;
    whatsappEntebbe: string;
    walletShort: string;
    currencyLabel: string;
    languageLabel: string;
  };
  // Hero & HomePage
  home: {
    heroBadge: string;
    heroTitle: string;
    heroParagraph: string;
    ctaMeetGuides: string;
    ctaPlanSafari: string;
    ctaWhatsappDesk: string;
    trustUtb: string;
    trustUwa: string;
    trustHq: string;
    followDispatches: string;
    confirmedPackagesHeader: string;
    ledBySpecialist: string;
    confirmedFrom: string;
    perPerson: string;
    reserveSpot: string;
    left: string;
    itineraryBtn: string;
    howItWorksTag: string;
    howItWorksTitle: string;
    howItWorksLink: string;
    step1Tag: string;
    step1Title: string;
    step1Desc: string;
    step2Tag: string;
    step2Title: string;
    step2Desc: string;
    step3Tag: string;
    step3Title: string;
    step3Desc: string;
    guidesSectionTag: string;
    guidesSectionTitle: string;
    guidesSectionDesc: string;
    experiencesSectionTag: string;
    experiencesSectionTitle: string;
    experiencesSectionDesc: string;
    filterAllExperiences: string;
    bottomCtaTag: string;
    bottomCtaTitle: string;
    bottomCtaDesc: string;
    whatsappUs: string;
  };
  // Custom Safari Itinerary Generator (strictly no "AI" mention)
  generator: {
    badge: string;
    title: string;
    subtitle: string;
    walletBalanceLabel: string;
    savedPlansCount: string;
    step1Region: string;
    step1Hint: string;
    step2Duration: string;
    daysUnit: string;
    step3Travelers: string;
    step3Hint: string;
    step4Budget: string;
    step5Activities: string;
    selectedCount: string;
    step6Notes: string;
    notesPlaceholder: string;
    generateBtn: string;
    generatingBtn: string;
    matchedSpecialistTag: string;
    viewProfile: string;
    sendToEntebbe: string;
    includedPermitsTitle: string;
    recommendedPartnersTitle: string;
    dayByDayTitle: string;
    vehicleBadge: string;
    saveToWalletBtn: string;
    savedInWalletBtn: string;
    payDepositBtn: string;
    depositPaidBadge: string;
    morningProgram: string;
    afternoonProgram: string;
    overnightStay: string;
    keyWildlife: string;
  };
  // Concierge Widget (strictly no "AI" mention)
  concierge: {
    launcherOpen: string;
    launcherClose: string;
    headerTitle: string;
    headerBadge: string;
    headerSubtitle: string;
    welcomeMessage: string;
    loadingMessage: string;
    inputPlaceholder: string;
    footerGuarantee: string;
    quickPrompts: string[];
  };
  // Footer
  footer: {
    utbTitle: string;
    utbDesc: string;
    autoTitle: string;
    autoDesc: string;
    uwaTitle: string;
    uwaDesc: string;
    brandBio: string;
    headOfficeLabel: string;
    airportPickupLabel: string;
    connectSocials: string;
    colGuidesPartners: string;
    colRegions: string;
    colPlanning: string;
    rightsReserved: string;
  };
  // Common / Shared
  common: {
    requestGuide: string;
    viewDetails: string;
    inquireNow: string;
    days: string;
    from: string;
    languagesSpoken: string;
    yearsExperience: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    geoBanner: {
      detectedFrom: 'Visiting from',
      proposeSwitch: 'Would you like to view Enganda Safaris in',
      switchButton: 'Switch to',
      keepCurrent: 'Continue in English',
      locateMe: 'Detect My Location',
      locating: 'Detecting location...',
      selectLanguagePrompt: 'Choose your preferred language:',
      testGeoLabel: 'Preview region:',
    },
    nav: {
      ourGuides: 'Guides & Partners',
      experiences: 'Experiences',
      destinations: 'Destinations',
      howWeWork: 'How We Work',
      tripPlanner: 'Trip Planner',
      safariWallet: 'Safari Wallet',
      reviews: 'Reviews',
      journal: 'Journal',
      about: 'About',
      contact: 'Contact',
      planMySafari: 'Plan My Safari',
      topBarCollective: 'Entebbe Head Office — 5 mins from Entebbe International Airport',
      topBarPromise: 'We confirm availability with lodges & UWA within 12 hours',
      whatsappEntebbe: 'WhatsApp Entebbe',
      walletShort: 'Wallet',
      currencyLabel: 'Currency',
      languageLabel: 'Language',
    },
    home: {
      heroBadge: 'Curated Ugandan Guide Collective • Coordinated from Entebbe',
      heroTitle: 'Uganda, shown to you by the people who call it home.',
      heroParagraph:
        'At Enganda Safaris, the guide is the product. Instead of being assigned an anonymous driver on arrival, you choose and travel with a named, licensed Ugandan specialist — from Bwindi’s gorilla ridges and Kibale’s chimpanzee canopy to the Shoebill channels of Mabamba and the plains of Kidepo Valley.',
      ctaMeetGuides: 'Meet Our Guides and Partners',
      ctaPlanSafari: 'Plan My Safari',
      ctaWhatsappDesk: 'WhatsApp Entebbe Desk',
      trustUtb: 'UTB Licensed & AUTO Member',
      trustUwa: 'Official UWA Permit Receipts Provided',
      trustHq: 'Entebbe HQ — 5 mins from Entebbe Airport',
      followDispatches: 'Follow Field Dispatches:',
      confirmedPackagesHeader: 'Confirmed Packages & Events',
      ledBySpecialist: 'Led by Ugandan Specialist',
      confirmedFrom: 'Confirmed Package From',
      perPerson: '/ person',
      reserveSpot: 'Reserve Spot',
      left: 'Left',
      itineraryBtn: 'Itinerary',
      howItWorksTag: 'How Enganda Works',
      howItWorksTitle: 'From Your First Message to the Forest Trailhead',
      howItWorksLink: 'Read our full guide-network model & deposit protection',
      step1Tag: '01. Tell Us Your Interests',
      step1Title: 'Share What You Want to Experience in Uganda',
      step1Desc:
        'Tell us your travel dates, comfort tier, and wildlife priorities — whether it is Bwindi mountain gorillas, Kibale chimpanzees, Shoebill storks at Mabamba, or remote Kidepo lions.',
      step2Tag: '02. We Match Your Guide',
      step2Title: 'Meet Your Named Ugandan Specialist Before You Book',
      step2Desc:
        'Within 12 hours, our Entebbe coordination desk confirms UWA permit and lodge availability and pairs you with the specific Enganda guide whose home region, languages, and specialty fit your trip.',
      step3Tag: '03. Your Guide Leads Your Safari',
      step3Title: 'One Accountable Host from Entebbe to Every Park',
      step3Desc:
        'Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional guide from airport welcome in Entebbe to your final farewell.',
      guidesSectionTag: 'The Guide Is The Product',
      guidesSectionTitle: 'Meet Our Guides and Partners',
      guidesSectionDesc:
        'Every Enganda safari is designed and led by a licensed Ugandan naturalist and paired with our verified partner lodges, hotels, motels, and camp sites across Uganda.',
      experiencesSectionTag: '100% Uganda • Private Departures',
      experiencesSectionTitle: 'Signature Uganda Safari Experiences',
      experiencesSectionDesc:
        'Every route stays strictly within Uganda and can be customized around your pace, comfort tier, and preferred Enganda guide.',
      filterAllExperiences: 'Filter All 6 Experiences',
      bottomCtaTag: '5 Minutes from Entebbe International Airport',
      bottomCtaTitle: 'Ready to Match With Your Ugandan Guide?',
      bottomCtaDesc:
        'Our coordination team in Bugonga, Entebbe works directly with our 8 guides and the Uganda Wildlife Authority. We confirm availability within 12 hours.',
      whatsappUs: 'WhatsApp Us',
    },
    generator: {
      badge: 'Bespoke Expedition Architect • Entebbe Planning Desk',
      title: 'Custom Uganda Safari Itinerary Generator',
      subtitle:
        'Select your preferred Uganda region, comfort budget, and wildlife or cultural activities. Our Expedition Architect builds a bespoke day-by-day safari plan matched with a named Ugandan specialist — ready to save directly to your',
      walletBalanceLabel: 'Your Safari Wallet Balance',
      savedPlansCount: 'saved plans',
      step1Region: '1. Preferred Uganda Region / Circuit',
      step1Hint: '100% Uganda routes beginning and ending at our Entebbe head office.',
      step2Duration: '2. Duration:',
      daysUnit: 'Days',
      step3Travelers: '3. Travelers (4x4 Guests)',
      step3Hint: 'Private Land Cruiser with pop-up roof included.',
      step4Budget: '4. Budget & Accommodation Comfort Tier',
      step5Activities: '5. Safari Activities & Experiences (Select 1 or More)',
      selectedCount: 'selected',
      step6Notes:
        'Optional Custom Requests (Photography focus, dietary needs, pace, specific park sector)',
      notesPlaceholder:
        'e.g. Prefer Rushaga gorilla habituation, crater lake walks, and golden-hour photography...',
      generateBtn: 'Generate Custom Safari Plan',
      generatingBtn: 'Building Your Custom Uganda Itinerary...',
      matchedSpecialistTag: 'Matched Ugandan Specialist',
      viewProfile: 'View Specialist Profile',
      sendToEntebbe: 'Send to Entebbe Desk',
      includedPermitsTitle: 'Included UWA Permits & Park Fees',
      recommendedPartnersTitle: 'Recommended Partner Stays',
      dayByDayTitle: 'Day-by-Day Custom Expedition Schedule',
      vehicleBadge: 'Private 4x4 Land Cruiser with Pop-Up Roof',
      saveToWalletBtn: 'Save Itinerary to User Wallet',
      savedInWalletBtn: 'Saved in Your Safari Wallet',
      payDepositBtn: 'Pay 30% Deposit from Wallet',
      depositPaidBadge: '30% Deposit Paid via Safari Wallet',
      morningProgram: 'Morning Field Program',
      afternoonProgram: 'Afternoon & Evening Program',
      overnightStay: 'Overnight Partner Stay:',
      keyWildlife: 'Key Wildlife:',
    },
    concierge: {
      launcherOpen: 'Ask Guide Matcher',
      launcherClose: 'Close Guide Matcher',
      headerTitle: 'Enganda Guide Matcher',
      headerBadge: 'Entebbe Concierge',
      headerSubtitle: 'Matches Ugandan guides & verified UWA permit tariffs',
      welcomeMessage:
        'Oli otya! Welcome to the Enganda Guide Matcher. At Enganda Safaris, the guide is the product — tell me what you want to see in Uganda (mountain gorillas, Kibale chimpanzees, the Shoebill at Mabamba, or Kidepo lions) and I will match you with a named Ugandan guide and verified UWA permit tariffs.',
      loadingMessage: 'Consulting Enganda guide profiles & UWA permit schedule...',
      inputPlaceholder: 'Ask about guides, Bwindi permits, or a 7-day plan...',
      footerGuarantee: '12-hr Entebbe human confirmation',
      quickPrompts: [
        'Match me with a guide',
        'Gorilla permit prices',
        'Plan a 7-day safari',
        'Talk to a human on WhatsApp',
      ],
    },
    footer: {
      utbTitle: 'Uganda Tourism Board (UTB) Registered',
      utbDesc:
        'Licensed Ugandan safari operator coordinated from our Entebbe head office with verified USAGA & UWA guide credentials.',
      autoTitle: 'Association of Uganda Tour Operators (AUTO)',
      autoDesc:
        'Committed to fair living wages for Ugandan safari guides and mountain porters, deposit protection, and ethical park operations.',
      uwaTitle: 'Official UWA Permit Receipts Provided',
      uwaDesc:
        'Official UWA receipts are shared with you before we collect your balance. Every gorilla and chimpanzee permit is booked directly with Uganda Wildlife Authority.',
      brandBio:
        'A curated collective of professional, licensed local Ugandan safari guides spread across every major region of Uganda, coordinated from our head office in Entebbe.',
      headOfficeLabel: 'Entebbe Head Office',
      airportPickupLabel: '5 minutes from Entebbe International Airport — Airport pickup available',
      connectSocials: 'Connect on X, Instagram & LinkedIn',
      colGuidesPartners: 'Guides, Partners & Safaris',
      colRegions: 'Uganda Regions',
      colPlanning: 'Planning & Transparency',
      rightsReserved: 'All safaris operated exclusively within Uganda.',
    },
    common: {
      requestGuide: 'Request This Guide',
      viewDetails: 'View Safari Details',
      inquireNow: 'Inquire Now',
      days: 'Days',
      from: 'From',
      languagesSpoken: 'Languages',
      yearsExperience: 'yrs experience',
    },
  },

  fr: {
    geoBanner: {
      detectedFrom: 'Visite détectée depuis',
      proposeSwitch: 'Souhaitez-vous consulter Enganda Safaris en',
      switchButton: 'Passer en Français',
      keepCurrent: 'Garder la langue actuelle',
      locateMe: 'Me géolocaliser',
      locating: 'Localisation en cours...',
      selectLanguagePrompt: 'Choisissez votre langue :',
      testGeoLabel: 'Tester la région :',
    },
    nav: {
      ourGuides: 'Guides & Partenaires',
      experiences: 'Safaris',
      destinations: 'Régions',
      howWeWork: 'Notre Modèle',
      tripPlanner: 'Sur-Mesure',
      safariWallet: 'Portefeuille Safari',
      reviews: 'Avis Clients',
      journal: 'Journal',
      about: 'À Propos',
      contact: 'Contact',
      planMySafari: 'Créer Mon Safari',
      topBarCollective: 'Siège d’Entebbe — à 5 min de l’Aéroport International d’Entebbe',
      topBarPromise: 'Disponibilité des lodges et permis UWA confirmée sous 12h',
      whatsappEntebbe: 'WhatsApp Entebbe',
      walletShort: 'Portefeuille',
      currencyLabel: 'Devise',
      languageLabel: 'Langue',
    },
    home: {
      heroBadge: 'Collectif de Guides Ougandais Certifiés • Coordonné depuis Entebbe',
      heroTitle: 'L’Ouganda, raconté par ceux qui l’appellent chez eux.',
      heroParagraph:
        'Chez Enganda Safaris, le guide est le cœur du voyage. Au lieu d’un chauffeur anonyme attribué à la dernière minute, vous choisissez et voyagez avec un spécialiste ougandais agréé et nommé — des crêtes des gorilles de Bwindi aux chimpanzés de Kibale, du Bec-en-sabot de Mabamba aux lions de la vallée de Kidepo.',
      ctaMeetGuides: 'Découvrir Nos Guides et Partenaires',
      ctaPlanSafari: 'Créer Mon Safari',
      ctaWhatsappDesk: 'WhatsApp Bureau d’Entebbe',
      trustUtb: 'Agréé UTB & Membre AUTO',
      trustUwa: 'Reçus Officiels de Permis UWA Fournis',
      trustHq: 'Siège Entebbe — à 5 min de l’aéroport',
      followDispatches: 'Suivre nos carnets de terrain :',
      confirmedPackagesHeader: 'Départs & Événements Confirmés',
      ledBySpecialist: 'Guidé par le spécialiste ougandais',
      confirmedFrom: 'Forfait Confirmé dès',
      perPerson: '/ pers.',
      reserveSpot: 'Réserver',
      left: 'places',
      itineraryBtn: 'Itinéraire',
      howItWorksTag: 'Comment Fonctionne Enganda',
      howItWorksTitle: 'De Votre Premier Message au Sentier de la Forêt',
      howItWorksLink: 'Découvrir notre modèle collectif et la protection des acomptes',
      step1Tag: '01. Partagez Vos Envies',
      step1Title: 'Dites-nous ce que vous rêvez de voir en Ouganda',
      step1Desc:
        'Indiquez vos dates, votre niveau de confort et vos priorités : gorilles des montagnes à Bwindi, chimpanzés à Kibale, Bec-en-sabot à Mabamba ou lions de Kidepo.',
      step2Tag: '02. Votre Guide Attitré',
      step2Title: 'Rencontrez Votre Spécialiste Ougandais Avant de Réserver',
      step2Desc:
        'Sous 12 heures, notre bureau d’Entebbe vérifie les permis UWA et les lodges, et vous associe au guide Enganda dont la région natale et les langues correspondent à votre voyage.',
      step3Tag: '03. Guidé à Travers l’Ouganda',
      step3Title: 'Un Seul Hôte Dédié d’Entebbe à Chaque Parc National',
      step3Desc:
        'Votre safari inclut un Land Cruiser 4x4 privé à toit ouvrant, conduit par votre guide professionnel depuis votre accueil à l’aéroport d’Entebbe jusqu’au départ.',
      guidesSectionTag: 'Le Guide Est Notre Signature',
      guidesSectionTitle: 'Rencontrez Nos Guides et Partenaires',
      guidesSectionDesc:
        'Chaque safari Enganda est conçu et mené par un naturaliste ougandais agréé, en partenariat avec nos lodges, hôtels, motels et campements vérifiés à travers l’Ouganda.',
      experiencesSectionTag: '100% Ouganda • Départs Privés',
      experiencesSectionTitle: 'Nos Expériences Safari Signature en Ouganda',
      experiencesSectionDesc:
        'Chaque itinéraire se déroule exclusivement en Ouganda et s’adapte à votre rythme, votre catégorie de lodges et votre guide Enganda préféré.',
      filterAllExperiences: 'Filtrer les 6 Expériences',
      bottomCtaTag: 'À 5 Minutes de l’Aéroport International d’Entebbe',
      bottomCtaTitle: 'Prêt à Choisir Votre Guide Ougandais ?',
      bottomCtaDesc:
        'Notre équipe de coordination à Bugonga, Entebbe travaille en direct avec nos 8 guides et l’Uganda Wildlife Authority. Réponse garantie sous 12 heures.',
      whatsappUs: 'Écrire sur WhatsApp',
    },
    generator: {
      badge: 'Architecte d’Expédition Sur-Mesure • Bureau d’Entebbe',
      title: 'Générateur d’Itinéraire Safari Sur-Mesure en Ouganda',
      subtitle:
        'Sélectionnez votre région d’Ouganda, votre budget confort et vos activités. Notre architecte d’expédition élabore un programme jour par jour associé à un guide spécialiste ougandais — prêt à être sauvegardé dans votre',
      walletBalanceLabel: 'Solde Portefeuille Safari',
      savedPlansCount: 'itinéraires sauvegardés',
      step1Region: '1. Région ou Circuit d’Ouganda Préféré',
      step1Hint: 'Itinéraires 100% en Ouganda au départ de notre siège d’Entebbe.',
      step2Duration: '2. Durée :',
      daysUnit: 'Jours',
      step3Travelers: '3. Voyageurs (4x4 Privé)',
      step3Hint: 'Land Cruiser 4x4 privé à toit ouvrant inclus.',
      step4Budget: '4. Catégorie de Confort & Hébergements',
      step5Activities: '5. Activités & Expériences Safari (1 ou plusieurs)',
      selectedCount: 'sélectionné(s)',
      step6Notes: 'Demandes Particulières (Photographie, rythme, secteur de Bwindi, régime)',
      notesPlaceholder:
        'ex. Habituation des gorilles à Rushaga, marche autour des lacs de cratère, photographie...',
      generateBtn: 'Générer Mon Plan de Safari Sur-Mesure',
      generatingBtn: 'Création de votre itinéraire ougandais sur-mesure...',
      matchedSpecialistTag: 'Spécialiste Ougandais Recommandé',
      viewProfile: 'Voir le Profil du Guide',
      sendToEntebbe: 'Envoyer au Bureau d’Entebbe',
      includedPermitsTitle: 'Permis UWA & Droits de Parc Inclus',
      recommendedPartnersTitle: 'Hébergements Partenaires Recommandés',
      dayByDayTitle: 'Programme Détaillé Jour par Jour',
      vehicleBadge: 'Land Cruiser 4x4 Privé à Toit Ouvrant',
      saveToWalletBtn: 'Sauvegarder dans Mon Portefeuille Safari',
      savedInWalletBtn: 'Sauvegardé dans Votre Portefeuille',
      payDepositBtn: 'Régler l’Acompte de 30% via le Portefeuille',
      depositPaidBadge: 'Acompte de 30% Réglé via le Portefeuille',
      morningProgram: 'Programme du Matin',
      afternoonProgram: 'Programme de l’Après-Midi & Soirée',
      overnightStay: 'Hébergement Partenaire :',
      keyWildlife: 'Faune Phare :',
    },
    concierge: {
      launcherOpen: 'Conseiller Guides',
      launcherClose: 'Fermer le Conseiller',
      headerTitle: 'Conseiller Guides Enganda',
      headerBadge: 'Conciergerie Entebbe',
      headerSubtitle: 'Association de guides ougandais & tarifs officiels UWA',
      welcomeMessage:
        'Oli otya ! Bienvenue sur le Conseiller Guides Enganda. Chez Enganda Safaris, le guide fait toute la différence — dites-moi ce que vous souhaitez découvrir en Ouganda (gorilles de Bwindi, chimpanzés de Kibale, Bec-en-sabot de Mabamba ou lions de Kidepo) et je vous présenterai le guide ougandais idéal ainsi que les tarifs officiels des permis UWA.',
      loadingMessage: 'Consultation des profils de guides Enganda et des tarifs UWA...',
      inputPlaceholder: 'Posez une question sur nos guides, les permis Bwindi ou un circuit...',
      footerGuarantee: 'Confirmation humaine à Entebbe sous 12h',
      quickPrompts: [
        'Trouver mon guide francophone',
        'Prix des permis gorilles',
        'Idée de safari 7 jours',
        'Parler à un coordinateur sur WhatsApp',
      ],
    },
    footer: {
      utbTitle: 'Agréé par l’Uganda Tourism Board (UTB)',
      utbDesc:
        'Opérateur de safari ougandais agréé, coordonné depuis notre siège d’Entebbe avec des guides certifiés USAGA et UWA.',
      autoTitle: 'Membre de l’Association des Tour-Opérateurs d’Ouganda (AUTO)',
      autoDesc:
        'Engagé pour une rémunération équitable des guides et porteurs de montagne ougandais et la protection intégrale des acomptes.',
      uwaTitle: 'Reçus Officiels de Permis UWA Garantis',
      uwaDesc:
        'Les reçus officiels UWA vous sont transmis avant le règlement du solde. Chaque permis gorille et chimpanzé est réservé directement auprès de l’UWA.',
      brandBio:
        'Un collectif de guides de safari ougandais professionnels et licenciés présents dans chaque grande région d’Ouganda, coordonné depuis notre siège à Entebbe.',
      headOfficeLabel: 'Siège Social d’Entebbe',
      airportPickupLabel:
        'À 5 minutes de l’Aéroport International d’Entebbe — Accueil aéroport inclus',
      connectSocials: 'Suivez-nous sur X, Instagram & LinkedIn',
      colGuidesPartners: 'Guides, Partenaires & Safaris',
      colRegions: 'Régions d’Ouganda',
      colPlanning: 'Planification & Transparence',
      rightsReserved: 'Tous nos safaris sont opérés exclusivement en Ouganda.',
    },
    common: {
      requestGuide: 'Demander ce Guide',
      viewDetails: 'Voir l’Itinéraire',
      inquireNow: 'Demander un Devis',
      days: 'Jours',
      from: 'Dès',
      languagesSpoken: 'Langues',
      yearsExperience: 'ans d’expérience',
    },
  },

  ar: {
    geoBanner: {
      detectedFrom: 'يبدو أنك تزورنا من',
      proposeSwitch: 'هل تود تصفح موقع إنغاندا سفاريز باللغة',
      switchButton: 'التبديل إلى العربية',
      keepCurrent: 'البقاء على اللغة الحالية',
      locateMe: 'تحديد موقعي الجغرافي',
      locating: 'جاري تحديد الموقع...',
      selectLanguagePrompt: 'اختر لغتك المفضلة:',
      testGeoLabel: 'معاينة المنطقة:',
    },
    nav: {
      ourGuides: 'المرشدون والشركاء',
      experiences: 'رحلات السفاري',
      destinations: 'الوجهات',
      howWeWork: 'كيف نعمل',
      tripPlanner: 'مصمم الرحلات',
      safariWallet: 'محفظة السفاري',
      reviews: 'آراء الضيوف',
      journal: 'المدونة الميدانية',
      about: 'من نحن',
      contact: 'اتصل بنا',
      planMySafari: 'خطط رحلتي',
      topBarCollective: 'المقر الرئيسي في عنتيبي — على بُعد 5 دقائق من مطار عنتيبي الدولي',
      topBarPromise: 'نؤكد توفر تصاريح UWA والنُزل خلال 12 ساعة',
      whatsappEntebbe: 'واتساب عنتيبي',
      walletShort: 'المحفظة',
      currencyLabel: 'العملة',
      languageLabel: 'اللغة',
    },
    home: {
      heroBadge: 'نخبة المرشدين الأوغنديين المرخصين • بإدارة مكتبنا في عنتيبي',
      heroTitle: 'أوغندا، كما يرويها لك أهلها الذين يعرفون أسرارها.',
      heroParagraph:
        'في إنغاندا سفاريز، المرشد السياحي هو جوهر التجربة. بدلاً من تعيين سائق مجهول عند وصولك، تختار وتسافر مع خبير أوغندي مرخص ومعروف بالاسم — من غابات غوريلا الجبال في بويندي وشمبانزي كيبالي إلى طائر حذاء النيل في مابامبا وسهول وادي كيديبو.',
      ctaMeetGuides: 'تعرف على مرشدينا وشركائنا',
      ctaPlanSafari: 'صمّم رحلة السفاري',
      ctaWhatsappDesk: 'تواصل عبر واتساب عنتيبي',
      trustUtb: 'مرخص من هيئة السياحة الأوغندية UTB وعضو AUTO',
      trustUwa: 'إيصالات رسمية لتصاريح هيئة الحياة البرية UWA',
      trustHq: 'مقر عنتيبي — 5 دقائق من المطار',
      followDispatches: 'تابع تقاريرنا الميدانية:',
      confirmedPackagesHeader: 'الباقات والفعاليات المؤكدة',
      ledBySpecialist: 'بقيادة الخبير الأوغندي',
      confirmedFrom: 'تبدأ الباقة المؤكدة من',
      perPerson: '/ للشخص',
      reserveSpot: 'احجز مقعدك',
      left: 'مقاعد متبقية',
      itineraryBtn: 'البرنامج',
      howItWorksTag: 'كيف تعمل إنغاندا',
      howItWorksTitle: 'من رسالتك الأولى وحتى مسارات الغابات المطيرة',
      howItWorksLink: 'اقرأ المزيد عن نظام شبكة المرشدين وحماية الودائع',
      step1Tag: '01. شاركنا اهتماماتك',
      step1Title: 'أخبرنا بما ترغب في استكشافه في أوغندا',
      step1Desc:
        'شاركنا مواعيد سفرك ومستوى الإقامة المفضل وأولوياتك في الحياة البرية — سواء كانت غوريلا بويندي أو شمبانزي كيبالي أو أسود كيديبو.',
      step2Tag: '02. نرشح لك المرشد الأنسب',
      step2Title: 'تعرف على مرشدك الأوغندي بالاسم قبل الحجز',
      step2Desc:
        'خلال 12 ساعة، يتحقق مكتبنا في عنتيبي من توفر تصاريح UWA والنُزل، ويربطك بالمرشد الأوغندي الذي تتطابق منطقته ولغاته وتخصصه مع رحلتك.',
      step3Tag: '03. مرشدك يقود رحلتك بالكامل',
      step3Title: 'مضيف واحد مسؤول من مطار عنتيبي إلى كل متنزه وطني',
      step3Desc:
        'تشمل رحلتك سيارة لاند كروزر دفع رباعي خاصة بسقف مفتوح، يقودها مرشدك المحترف منذ استقبالك في مطار عنتيبي وحتى توديعك.',
      guidesSectionTag: 'المرشد هو جوهر الرحلة',
      guidesSectionTitle: 'تعرف على مرشدينا وشركائنا',
      guidesSectionDesc:
        'كل رحلة مع إنغاندا يصممها ويقودها خبير طبيعة أوغندي مرخص، بالتعاون مع أفضل النُزل والفنادق والمخيمات المعتمدة في جميع أنحاء أوغندا.',
      experiencesSectionTag: '100% داخل أوغندا • رحلات خاصة',
      experiencesSectionTitle: 'تجارب سفاري أوغندا المميزة',
      experiencesSectionDesc:
        'تبقى جميع المسارات داخل حدود أوغندا ويمكن تخصيصها بالكامل حسب وتيرتك ومستوى الفخامة والمرشد المفضل لديك.',
      filterAllExperiences: 'تصفية جميع التجارب الـ 6',
      bottomCtaTag: 'على بُعد 5 دقائق من مطار عنتيبي الدولي',
      bottomCtaTitle: 'هل أنت مستعد لاختيار مرشدك الأوغندي؟',
      bottomCtaDesc:
        'يعمل فريق التنسيق لدينا في بوغونغا، عنتيبي مباشرة مع مرشدينا الثمانية وهيئة الحياة البرية الأوغندية. نؤكد التوفر خلال 12 ساعة.',
      whatsappUs: 'راسلنا على واتساب',
    },
    generator: {
      badge: 'مصمم رحلات السفاري المخصصة • مكتب تخطيط عنتيبي',
      title: 'أداة تصميم برنامج سفاري أوغندا المخصص',
      subtitle:
        'اختر المنطقة المفضلة في أوغندا وميزانية الإقامة والأنشطة البرية أو الثقافية. يقوم نظام التخطيط لدينا ببناء جدول يومي مفصل مع ترشيح المرشد الأوغندي الأنسب — وجاهز للحفظ مباشرة في',
      walletBalanceLabel: 'رصيد محفظة السفاري الخاصة بك',
      savedPlansCount: 'برامج محفوظة',
      step1Region: '1. المنطقة أو المسار المفضل في أوغندا',
      step1Hint: 'مسارات 100% داخل أوغندا تبدأ وتنتهي في مكتبنا الرئيسي في عنتيبي.',
      step2Duration: '2. مدة الرحلة:',
      daysUnit: 'أيام',
      step3Travelers: '3. عدد المسافرين (سيارة 4x4 خاصة)',
      step3Hint: 'تشمل سيارة لاند كروزر خاصة بسقف مرفوع للمشاهدة.',
      step4Budget: '4. فئة الميزانية ومستوى الإقامة',
      step5Activities: '5. أنشطة وتجارب السفاري (اختر واحداً أو أكثر)',
      selectedCount: 'محدد',
      step6Notes: 'طلبات خاصة اختيارية (تصوير فوتوغرافي، متطلبات غذائية، وتيرة الرحلة)',
      notesPlaceholder: 'مثال: أفضل تجربة تعايش الغوريلا في روشاغا، والتصوير وقت الغروب...',
      generateBtn: 'إنشاء برنامج السفاري المخصص',
      generatingBtn: 'جاري إعداد برنامج السفاري الأوغندي المخصص...',
      matchedSpecialistTag: 'المرشد الأوغندي المرشح لرحلتك',
      viewProfile: 'عرض ملف المرشد',
      sendToEntebbe: 'إرسال لمكتب عنتيبي',
      includedPermitsTitle: 'تصاريح UWA ورسوم المتنزهات المشمولة',
      recommendedPartnersTitle: 'الإقامات الشريكة الموصى بها',
      dayByDayTitle: 'الجدول اليومي التفصيلي للرحلة',
      vehicleBadge: 'سيارة لاند كروزر 4x4 خاصة بسقف مفتوح',
      saveToWalletBtn: 'حفظ البرنامج في محفظة السفاري',
      savedInWalletBtn: 'تم الحفظ في محفظة السفاري',
      payDepositBtn: 'دفع عربون 30% من المحفظة',
      depositPaidBadge: 'تم دفع عربون 30% عبر محفظة السفاري',
      morningProgram: 'البرنامج الميداني الصباحي',
      afternoonProgram: 'برنامج الظهيرة والمساء',
      overnightStay: 'الإقامة الشريكة:',
      keyWildlife: 'أبرز المشاهدات البرية:',
    },
    concierge: {
      launcherOpen: 'مستشار اختيار المرشد',
      launcherClose: 'إغلاق المستشار',
      headerTitle: 'مستشار مرشدي إنغاندا',
      headerBadge: 'مكتب عنتيبي',
      headerSubtitle: 'يربطك بالمرشدين الأوغنديين وأسعار تصاريح UWA الرسمية',
      welcomeMessage:
        'أولي أوتيا! مرحباً بك في مستشار مرشدي إنغاندا. في إنغاندا سفاريز، المرشد هو أساس الرحلة — أخبرني بما تود رؤيته في أوغندا (غوريلا الجبال في بويندي، شمبانزي كيبالي، طائر حذاء النيل في مابامبا، أو أسود كيديبو) وسأرشح لك المرشد الأوغندي الأنسب مع أسعار تصاريح UWA المعتمدة.',
      loadingMessage: 'جاري مراجعة ملفات مرشدي إنغاندا وجدول تصاريح UWA...',
      inputPlaceholder: 'اسأل عن المرشدين، تصاريح غوريلا بويندي، أو برنامج 7 أيام...',
      footerGuarantee: 'تأكيد بشري من مكتب عنتيبي خلال 12 ساعة',
      quickPrompts: [
        'رشح لي مرشداً مناسباً',
        'أسعار تصاريح الغوريلا',
        'خطة سفاري لمدة 7 أيام',
        'التحدث مع منسق عبر واتساب',
      ],
    },
    footer: {
      utbTitle: 'مسجل لدى هيئة السياحة الأوغندية (UTB)',
      utbDesc:
        'مشغل سفاري أوغندي مرخص يتم تنسيقه من مكتبنا الرئيسي في عنتيبي مع مرشدين معتمدين من USAGA وUWA.',
      autoTitle: 'عضو رابطة منظمي الرحلات في أوغندا (AUTO)',
      autoDesc:
        'ملتزمون بأجور عادلة للمرشدين والحمالين الأوغنديين، وحماية الودائع، والعمل البيئي المسؤول.',
      uwaTitle: 'تقديم إيصالات تصاريح UWA الرسمية',
      uwaDesc:
        'نشاركك إيصالات UWA الرسمية قبل تحصيل الرصيد المتبقي. يتم حجز كل تصريح غوريلا وشمبانزي مباشرة من هيئة الحياة البرية الأوغندية.',
      brandBio:
        'مجموعة منتقاة من مرشدي السفاري الأوغنديين المحترفين والمرخصين في جميع مناطق أوغندا، بإدارة مكتبنا الرئيسي في عنتيبي.',
      headOfficeLabel: 'المقر الرئيسي في عنتيبي',
      airportPickupLabel: 'على بُعد 5 دقائق من مطار عنتيبي الدولي — تتوفر خدمة الاستقبال بالمطار',
      connectSocials: 'تواصل معنا عبر X وإنستغرام ولينكدإن',
      colGuidesPartners: 'المرشدون والشركاء والرحلات',
      colRegions: 'مناطق أوغندا',
      colPlanning: 'التخطيط والشفافية',
      rightsReserved: 'تُقام جميع رحلات السفاري حصرياً داخل أوغندا.',
    },
    common: {
      requestGuide: 'اطلب هذا المرشد',
      viewDetails: 'عرض تفاصيل الرحلة',
      inquireNow: 'استفسر الآن',
      days: 'أيام',
      from: 'يبدأ من',
      languagesSpoken: 'اللغات',
      yearsExperience: 'سنوات خبرة',
    },
  },

  zh: {
    geoBanner: {
      detectedFrom: '检测到您访问自',
      proposeSwitch: '是否将 Enganda Safaris 切换为',
      switchButton: '切换为中文',
      keepCurrent: '保持当前语言',
      locateMe: '定位我的位置',
      locating: '正在定位...',
      selectLanguagePrompt: '选择您的首选语言：',
      testGeoLabel: '预览地区：',
    },
    nav: {
      ourGuides: '向导与合作伙伴',
      experiences: '精选行程',
      destinations: '目的地',
      howWeWork: '服务模式',
      tripPlanner: '行程定制',
      safariWallet: '猎游钱包',
      reviews: '客户评价',
      journal: '野外日志',
      about: '关于我们',
      contact: '联系我们',
      planMySafari: '定制我的猎游',
      topBarCollective: '恩德培总部 — 距恩德培国际机场仅 5 分钟车程',
      topBarPromise: '我们在 12 小时内与营地及乌干达野生动物管理局（UWA）确认预订名额',
      whatsappEntebbe: 'WhatsApp 恩德培客服',
      walletShort: '钱包',
      currencyLabel: '货币',
      languageLabel: '语言',
    },
    home: {
      heroBadge: '乌干达持证向导联盟 • 恩德培总部统筹调度',
      heroTitle: '乌干达，由世代居住于此的向导为您呈现。',
      heroParagraph:
        '在 Enganda Safaris，向导本身就是最核心的体验。我们绝不在您抵达时临时指派陌生司机，而是让您提前选择并与一位实名认证的乌干达持证自然学家同行——从布温迪的山地大猩猩山脊、基巴莱的黑猩猩树冠，到马班巴湿地的鲸头鹳水道与基德坡谷的狮群平原。',
      ctaMeetGuides: '认识我们的向导与合作伙伴',
      ctaPlanSafari: '定制我的猎游',
      ctaWhatsappDesk: 'WhatsApp 联系恩德培总部',
      trustUtb: 'UTB 官方注册 & AUTO 协会成员',
      trustUwa: '提供 UWA 官方许可证收据',
      trustHq: '恩德培总部 — 距机场 5 分钟',
      followDispatches: '关注前线向导动态：',
      confirmedPackagesHeader: '已确认发团行程与特别活动',
      ledBySpecialist: '由乌干达资深专家带队',
      confirmedFrom: '确认发团价格起',
      perPerson: '/ 人',
      reserveSpot: '立即预订名额',
      left: '席剩余',
      itineraryBtn: '查看行程',
      howItWorksTag: 'Enganda 运作方式',
      howItWorksTitle: '从您的第一条咨询到步入热带雨林步道',
      howItWorksLink: '了解我们的向导联盟模式与定金保障机制',
      step1Tag: '01. 告诉我们您的兴趣',
      step1Title: '分享您在乌干达最想体验的自然奇观',
      step1Desc:
        '告诉我们您的出行日期、住宿舒适度偏好和野生动物重点——无论是布温迪山地大猩猩、基巴莱黑猩猩、马班巴鲸头鹳还是基德坡谷雄狮。',
      step2Tag: '02. 专属向导精准匹配',
      step2Title: '在预订前认识您的实名乌干达专家向导',
      step2Desc:
        '12 小时内，我们的恩德培调度中心将核实 UWA 许可证与营地房态，并为您匹配熟悉该区域、语言相通的专属向导。',
      step3Tag: '03. 专属向导全程带领',
      step3Title: '从恩德培接机到各大国家公园的全程专属托管',
      step3Desc:
        '您的猎游包含一辆配备升降顶篷的私人 4x4 陆地巡洋舰越野车，由您的专业向导从恩德培机场迎接直至圆满送机。',
      guidesSectionTag: '向导即核心体验',
      guidesSectionTitle: '认识我们的向导与合作伙伴',
      guidesSectionDesc:
        '每一次 Enganda 猎游均由持证乌干达自然向导亲自设计并带队，配合遍布乌干达的认证生态旅馆、酒店、汽车旅馆及露营地。',
      experiencesSectionTag: '100% 乌干达深度纯玩 • 私人独立成团',
      experiencesSectionTitle: '乌干达王牌猎游路线',
      experiencesSectionDesc:
        '所有路线均严格在乌干达境内运营，并可根据您的节奏、住宿等级和心仪向导量身定制。',
      filterAllExperiences: '筛选全部 6 条经典路线',
      bottomCtaTag: '距离恩德培国际机场仅 5 分钟车程',
      bottomCtaTitle: '准备好匹配您的乌干达专属向导了吗？',
      bottomCtaDesc:
        '我们位于恩德培 Bugonga 的协调团队直接与 8 位资深向导及乌干达野生动物管理局（UWA）紧密合作，12 小时内确认许可与房态。',
      whatsappUs: 'WhatsApp 在线咨询',
    },
    generator: {
      badge: '专属探险行程规划师 • 恩德培规划中心',
      title: '乌干达私人猎游行程定制器',
      subtitle:
        '选择您心仪的乌干达地区、住宿预算以及野生动物或文化体验。我们的行程规划系统将为您生成逐日详细计划并匹配专属乌干达向导——可直接保存至您的',
      walletBalanceLabel: '您的猎游钱包可用余额',
      savedPlansCount: '份已存方案',
      step1Region: '1. 首选乌干达区域 / 环线',
      step1Hint: '100% 乌干达境内路线，由恩德培总部接送起止。',
      step2Duration: '2. 行程天数：',
      daysUnit: '天',
      step3Travelers: '3. 同行人数（4x4 私人越野车）',
      step3Hint: '含私人升降顶篷 4x4 陆地巡洋舰。',
      step4Budget: '4. 预算与住宿舒适度等级',
      step5Activities: '5. 猎游活动与体验偏好（可多选）',
      selectedCount: '项已选',
      step6Notes: '其他定制需求（摄影题材、饮食要求、行程节奏、指定保护区）',
      notesPlaceholder: '例如：希望安排 Rushaga 大猩猩习惯化体验、火山口湖徒步与黄金时刻摄影...',
      generateBtn: '生成专属猎游方案',
      generatingBtn: '正在为您构建专属乌干达行程...',
      matchedSpecialistTag: '为您匹配的乌干达资深向导',
      viewProfile: '查看向导档案',
      sendToEntebbe: '发送至恩德培客服台',
      includedPermitsTitle: '包含的 UWA 许可证及公园门票',
      recommendedPartnersTitle: '推荐合作住宿营地',
      dayByDayTitle: '逐日详细探险日程表',
      vehicleBadge: '私人 4x4 升降顶篷陆地巡洋舰',
      saveToWalletBtn: '保存行程至猎游钱包',
      savedInWalletBtn: '已保存在您的猎游钱包',
      payDepositBtn: '使用钱包支付 30% 定金',
      depositPaidBadge: '已通过猎游钱包支付 30% 定金',
      morningProgram: '上午野外行程',
      afternoonProgram: '下午及晚间安排',
      overnightStay: '下榻合作营地/酒店：',
      keyWildlife: '核心野生动物看点：',
    },
    concierge: {
      launcherOpen: '向导匹配顾问',
      launcherClose: '关闭向导顾问',
      headerTitle: 'Enganda 向导匹配顾问',
      headerBadge: '恩德培礼宾台',
      headerSubtitle: '为您匹配乌干达向导并查询 UWA 官方许可证价格',
      welcomeMessage:
        'Oli otya（您好）！欢迎使用 Enganda 向导匹配顾问。在 Enganda Safaris，向导是旅程的灵魂——请告诉我您最想在乌干达看到什么（布温迪山地大猩猩、基巴莱黑猩猩、马班巴鲸头鹳或基德坡狮群），我将为您推荐最合适的实名乌干达向导及 UWA 官方许可证报价。',
      loadingMessage: '正在检索 Enganda 向导档案与 UWA 许可证价目表...',
      inputPlaceholder: '咨询向导信息、布温迪大猩猩许可证或 7 日行程...',
      footerGuarantee: '恩德培人工团队 12 小时内确认',
      quickPrompts: [
        '为我匹配乌干达向导',
        '山地大猩猩许可证价格',
        '规划 7 天乌干达猎游',
        '通过 WhatsApp 联系人工顾问',
      ],
    },
    footer: {
      utbTitle: '乌干达旅游局 (UTB) 官方注册',
      utbDesc: '由恩德培总部统筹的持证乌干达猎游运营商，所有向导均具备 USAGA 与 UWA 官方资质。',
      autoTitle: '乌干达旅行社协会 (AUTO) 正式成员',
      autoDesc: '致力于保障乌干达向导及山地背夫的优厚薪资、定金托管安全与生态保护运营。',
      uwaTitle: '提供 UWA 官方许可证收据',
      uwaDesc: '在收取尾款前向您提供 UWA 官方收据。所有大猩猩与黑猩猩许可证均直接向乌干达野生动物管理局预订。',
      brandBio: '由遍布乌干达各大区域的持证本土猎游向导组成的精品联盟，由恩德培总部统一协调。',
      headOfficeLabel: '恩德培总部地址',
      airportPickupLabel: '距恩德培国际机场仅 5 分钟车程 — 提供免费接机欢迎服务',
      connectSocials: '在 X、Instagram 和 LinkedIn 上关注我们',
      colGuidesPartners: '向导、合作伙伴与行程',
      colRegions: '乌干达核心区域',
      colPlanning: '行程规划与透明承诺',
      rightsReserved: '所有猎游行程均 100% 在乌干达境内独立运营。',
    },
    common: {
      requestGuide: '预约此向导',
      viewDetails: '查看行程详情',
      inquireNow: '立即咨询',
      days: '天',
      from: '起价',
      languagesSpoken: '语言',
      yearsExperience: '年带队经验',
    },
  },

  nl: {
    geoBanner: {
      detectedFrom: 'Bezoek gedetecteerd vanuit',
      proposeSwitch: 'Wilt u Enganda Safaris bekijken in het',
      switchButton: 'Overschakelen naar Nederlands',
      keepCurrent: 'Huidige taal behouden',
      locateMe: 'Mijn locatie detecteren',
      locating: 'Locatie bepalen...',
      selectLanguagePrompt: 'Kies uw voorkeurstaal:',
      testGeoLabel: 'Regio bekijken:',
    },
    nav: {
      ourGuides: 'Gidsen & Partners',
      experiences: 'Safari’s',
      destinations: 'Bestemmingen',
      howWeWork: 'Hoe Wij Werken',
      tripPlanner: 'Reisplanner',
      safariWallet: 'Safari Portemonnee',
      reviews: 'Beoordelingen',
      journal: 'Velddagboek',
      about: 'Over Ons',
      contact: 'Contact',
      planMySafari: 'Plan Mijn Safari',
      topBarCollective: 'Hoofdkantoor Entebbe — op 5 min. van Entebbe International Airport',
      topBarPromise: 'Wij bevestigen beschikbaarheid bij lodges & UWA binnen 12 uur',
      whatsappEntebbe: 'WhatsApp Entebbe',
      walletShort: 'Wallet',
      currencyLabel: 'Valuta',
      languageLabel: 'Taal',
    },
    home: {
      heroBadge: 'Collectief van Gecertificeerde Oegandese Gidsen • Gecoördineerd vanuit Entebbe',
      heroTitle: 'Oeganda, aan u getoond door de mensen die er thuis zijn.',
      heroParagraph:
        'Bij Enganda Safaris staat de gids centraal. In plaats van bij aankomst een willekeurige chauffeur toegewezen te krijgen, kiest en reist u met een bij naam genoemde, gelicentieerde Oegandese specialist — van de gorillabossen van Bwindi en de chimpansees van Kibale tot de schoenbekooievaar in Mabamba en de vlaktes van Kidepo Valley.',
      ctaMeetGuides: 'Ontmoet Onze Gidsen en Partners',
      ctaPlanSafari: 'Plan Mijn Safari',
      ctaWhatsappDesk: 'WhatsApp Entebbe Desk',
      trustUtb: 'UTB Gelicentieerd & AUTO Lid',
      trustUwa: 'Officiële UWA Vergunningsbewijzen',
      trustHq: 'Entebbe HQ — 5 min. van de luchthaven',
      followDispatches: 'Volg onze veldverslagen:',
      confirmedPackagesHeader: 'Bevestigde Reizen & Evenementen',
      ledBySpecialist: 'Onder leiding van Oegandese specialist',
      confirmedFrom: 'Bevestigd Pakket Vanaf',
      perPerson: '/ persoon',
      reserveSpot: 'Reserveer Plek',
      left: 'plekken vrij',
      itineraryBtn: 'Route',
      howItWorksTag: 'Hoe Enganda Werkt',
      howItWorksTitle: 'Van Uw Eerste Bericht tot het Begin van het Bospad',
      howItWorksLink: 'Lees alles over ons gidsenmodel & aanbetalingsbescherming',
      step1Tag: '01. Deel Uw Wensen',
      step1Title: 'Vertel Ons Wat U Wilt Beleven in Oeganda',
      step1Desc:
        'Geef uw reisdata, comfortniveau en natuurwensen door — of het nu gaat om berggorilla’s in Bwindi, chimpansees in Kibale, de schoenbekooievaar in Mabamba of leeuwen in Kidepo.',
      step2Tag: '02. Wij Matchen Uw Gids',
      step2Title: 'Maak Kennis Met Uw Persoonlijke Oegandese Gids Vóór U Boekt',
      step2Desc:
        'Binnen 12 uur controleert ons kantoor in Entebbe de beschikbaarheid van UWA-vergunningen en lodges en koppelt u aan de Enganda-gids wiens regio en expertise bij uw reis passen.',
      step3Tag: '03. Uw Gids Leidt Uw Safari',
      step3Title: 'Één Vertrouwde Gastheer van Entebbe tot Elk Nationaal Park',
      step3Desc:
        'Uw safari is inclusief een privé 4x4 Land Cruiser met klapdak, bestuurd door uw professionele gids vanaf het welkom op de luchthaven van Entebbe tot uw vertrek.',
      guidesSectionTag: 'De Gids Maakt Het Verschil',
      guidesSectionTitle: 'Ontmoet Onze Gidsen en Partners',
      guidesSectionDesc:
        'Elke Enganda-safari wordt ontworpen en geleid door een gecertificeerde Oegandese natuurgids en gecombineerd met onze geverifieerde partnerlodges, hotels, motels en campings.',
      experiencesSectionTag: '100% Oeganda • Privévertrekken',
      experiencesSectionTitle: 'Onze Kenmerkende Oeganda Safari’s',
      experiencesSectionDesc:
        'Elke route blijft volledig binnen Oeganda en kan op maat worden aangepast aan uw tempo, comfortklasse en favoriete Enganda-gids.',
      filterAllExperiences: 'Filter Alle 6 Safari’s',
      bottomCtaTag: 'Op 5 Minuten van Entebbe International Airport',
      bottomCtaTitle: 'Klaar om Uw Oegandese Gids te Kiezen?',
      bottomCtaDesc:
        'Ons coördinatieteam in Bugonga, Entebbe werkt rechtstreeks samen met onze 8 gidsen en de Uganda Wildlife Authority. Beschikbaarheid binnen 12 uur bevestigd.',
      whatsappUs: 'Stuur een WhatsApp',
    },
    generator: {
      badge: 'Maatwerk Safari Architect • Planningsteam Entebbe',
      title: 'Maatwerk Oeganda Safari Routeplanner',
      subtitle:
        'Kies uw gewenste Oegandese regio, comfortklasse en activiteiten. Onze routeplanner stelt een dag-tot-dag safariprogramma samen met een bijpassende Oegandese gids — direct op te slaan in uw',
      walletBalanceLabel: 'Uw Safari Portemonnee Saldo',
      savedPlansCount: 'opgeslagen routes',
      step1Region: '1. Gewenste Regio / Route in Oeganda',
      step1Hint: '100% Oegandese routes met start en einde bij ons hoofdkantoor in Entebbe.',
      step2Duration: '2. Reisduur:',
      daysUnit: 'Dagen',
      step3Travelers: '3. Reizigers (Privé 4x4)',
      step3Hint: 'Inclusief privé Land Cruiser met pop-up dak.',
      step4Budget: '4. Comfortklasse & Accommodatiestijl',
      step5Activities: '5. Safari Activiteiten & Belevingen (Kies 1 of meer)',
      selectedCount: 'geselecteerd',
      step6Notes: 'Optionele Wensen (Fotografie, dieetwensen, reistempo, specifieke sector)',
      notesPlaceholder:
        'bijv. Voorkeur voor Rushaga gorilla habituatie, kratermeerwandelingen en fotografie...',
      generateBtn: 'Genereer Maatwerk Safariplan',
      generatingBtn: 'Uw Oegandese maatwerkroute wordt samengesteld...',
      matchedSpecialistTag: 'Aanbevolen Oegandese Specialist',
      viewProfile: 'Bekijk Gidsprofiel',
      sendToEntebbe: 'Stuur naar Entebbe Desk',
      includedPermitsTitle: 'Inbegrepen UWA Vergunningen & Parkgelden',
      recommendedPartnersTitle: 'Aanbevolen Partnerverblijven',
      dayByDayTitle: 'Dag-tot-Dag Safariprogramma',
      vehicleBadge: 'Privé 4x4 Land Cruiser met Klapdak',
      saveToWalletBtn: 'Bewaar Route in Safari Portemonnee',
      savedInWalletBtn: 'Opgeslagen in Uw Safari Portemonnee',
      payDepositBtn: 'Betaal 30% Aanbetaling via Portemonnee',
      depositPaidBadge: '30% Aanbetaling Voldaan via Portemonnee',
      morningProgram: 'Ochtendprogramma',
      afternoonProgram: 'Middag- & Avondprogramma',
      overnightStay: 'Overnachting bij Partner:',
      keyWildlife: 'Belangrijkste Dieren:',
    },
    concierge: {
      launcherOpen: 'Gidsenwijzer',
      launcherClose: 'Sluit Gidsenwijzer',
      headerTitle: 'Enganda Gidsenwijzer',
      headerBadge: 'Entebbe Concierge',
      headerSubtitle: 'Koppelt Oegandese gidsen & officiële UWA-tarieven',
      welcomeMessage:
        'Oli otya! Welkom bij de Enganda Gidsenwijzer. Bij Enganda Safaris staat de gids centraal — vertel mij wat u in Oeganda wilt zien (berggorilla’s in Bwindi, chimpansees in Kibale, de schoenbekooievaar in Mabamba of leeuwen in Kidepo) en ik koppel u aan een Oegandese specialist en officiële UWA-vergunningstarieven.',
      loadingMessage: 'Enganda gidsprofielen & UWA-vergunningstarieven raadplegen...',
      inputPlaceholder: 'Vraag over onze gidsen, Bwindi-vergunningen of een 7-daagse reis...',
      footerGuarantee: 'Persoonlijke bevestiging vanuit Entebbe binnen 12 uur',
      quickPrompts: [
        'Koppel mij aan een gids',
        'Prijzen gorillavergunningen',
        'Plan een 7-daagse safari',
        'Spreek een coördinator op WhatsApp',
      ],
    },
    footer: {
      utbTitle: 'Geregistreerd bij Uganda Tourism Board (UTB)',
      utbDesc:
        'Erkende Oegandese safari-operator gecoördineerd vanuit ons hoofdkantoor in Entebbe met geverifieerde USAGA- en UWA-gidsen.',
      autoTitle: 'Lid van Association of Uganda Tour Operators (AUTO)',
      autoDesc:
        'Toegewijd aan eerlijke beloning voor Oegandese gidsen en bergdragers, aanbetalingsgarantie en duurzaam parkbeheer.',
      uwaTitle: 'Officiële UWA Vergunningsbewijzen Geleverd',
      uwaDesc:
        'U ontvangt de officiële UWA-bewijzen voordat wij het restbedrag innen. Elke gorilla- en chimpanseevergunning wordt rechtstreeks bij UWA geboekt.',
      brandBio:
        'Een zorgvuldig geselecteerd collectief van gelicentieerde lokale Oegandese safarigidsen in alle regio’s van Oeganda, gecoördineerd vanuit Entebbe.',
      headOfficeLabel: 'Hoofdkantoor Entebbe',
      airportPickupLabel:
        'Op 5 minuten van Entebbe International Airport — Luchthaventransfer beschikbaar',
      connectSocials: 'Volg ons op X, Instagram & LinkedIn',
      colGuidesPartners: 'Gidsen, Partners & Safari’s',
      colRegions: 'Oegandese Regio’s',
      colPlanning: 'Reisplanning & Transparantie',
      rightsReserved: 'Alle safari’s worden uitsluitend binnen Oeganda uitgevoerd.',
    },
    common: {
      requestGuide: 'Vraag Deze Gids Aan',
      viewDetails: 'Bekijk Safaridetails',
      inquireNow: 'Vraag Offerte Aan',
      days: 'Dagen',
      from: 'Vanaf',
      languagesSpoken: 'Talen',
      yearsExperience: 'jaar ervaring',
    },
  },

  de: {
    geoBanner: {
      detectedFrom: 'Besuch erkannt aus',
      proposeSwitch: 'Möchten Sie Enganda Safaris auf',
      switchButton: 'Auf Deutsch wechseln',
      keepCurrent: 'Aktuelle Sprache beibehalten',
      locateMe: 'Meinen Standort erkennen',
      locating: 'Standort wird ermittelt...',
      selectLanguagePrompt: 'Wählen Sie Ihre bevorzugte Sprache:',
      testGeoLabel: 'Region testen:',
    },
    nav: {
      ourGuides: 'Guides & Partner',
      experiences: 'Safaris',
      destinations: 'Regionen',
      howWeWork: 'Arbeitsweise',
      tripPlanner: 'Reiseplaner',
      safariWallet: 'Safari-Wallet',
      reviews: 'Bewertungen',
      journal: 'Journal',
      about: 'Über Uns',
      contact: 'Kontakt',
      planMySafari: 'Safari Planen',
      topBarCollective: 'Hauptsitz Entebbe — 5 Min. vom Internationalen Flughafen Entebbe',
      topBarPromise: 'Bestätigung von Lodges & UWA-Permits innerhalb von 12 Stunden',
      whatsappEntebbe: 'WhatsApp Entebbe',
      walletShort: 'Wallet',
      currencyLabel: 'Währung',
      languageLabel: 'Sprache',
    },
    home: {
      heroBadge: 'Kuratiertes Ugandisches Guide-Kollektiv • Koordiniert aus Entebbe',
      heroTitle: 'Uganda, gezeigt von den Menschen, die es ihr Zuhause nennen.',
      heroParagraph:
        'Bei Enganda Safaris steht der Guide im Mittelpunkt. Statt bei der Ankunft einem anonymen Fahrer zugewiesen zu werden, wählen und reisen Sie mit einem namentlich bekannten, lizenzierten ugandischen Spezialisten — von den Berggorillas in Bwindi und den Schimpansen in Kibale bis zum Schuhschnabel in Mabamba und den Löwen im Kidepo-Tal.',
      ctaMeetGuides: 'Unsere Guides und Partner entdecken',
      ctaPlanSafari: 'Meine Safari planen',
      ctaWhatsappDesk: 'WhatsApp Büro Entebbe',
      trustUtb: 'UTB-Lizenziert & AUTO-Mitglied',
      trustUwa: 'Offizielle UWA-Permit-Quittungen inklusive',
      trustHq: 'Büro Entebbe — 5 Min. vom Flughafen',
      followDispatches: 'Aktuelle Berichte aus dem Busch:',
      confirmedPackagesHeader: 'Bestätigte Reisen & Events',
      ledBySpecialist: 'Geführt vom ugandischen Spezialisten',
      confirmedFrom: 'Bestätigtes Paket ab',
      perPerson: '/ Person',
      reserveSpot: 'Platz reservieren',
      left: 'frei',
      itineraryBtn: 'Reiseverlauf',
      howItWorksTag: 'Wie Enganda funktioniert',
      howItWorksTitle: 'Von Ihrer ersten Anfrage bis zum Pfad im Regenwald',
      howItWorksLink: 'Mehr über unser Guide-Netzwerk & den Anzahlungsschutz erfahren',
      step1Tag: '01. Ihre Wünsche teilen',
      step1Title: 'Verraten Sie uns, was Sie in Uganda erleben möchten',
      step1Desc:
        'Nennen Sie uns Ihre Reisedaten, Ihre gewünschte Komfortklasse und Ihre Tierwelt-Prioritäten — ob Bwindi-Berggorillas, Kibale-Schimpansen, Mabamba-Schuhschnäbel oder Kidepo-Löwen.',
      step2Tag: '02. Wir finden Ihren Guide',
      step2Title: 'Lernen Sie Ihren ugandischen Spezialisten vor der Buchung kennen',
      step2Desc:
        'Innerhalb von 12 Stunden prüft unser Büro in Entebbe die Verfügbarkeit von UWA-Permits und Lodges und stellt Ihnen den passenden Enganda-Guide (inkl. deutschsprachiger Guides wie Grace Namukasa) vor.',
      step3Tag: '03. Ihr Guide führt Ihre Safari',
      step3Title: 'Ein fester Ansprechpartner von Entebbe bis in jeden Nationalpark',
      step3Desc:
        'Ihre Safari beinhaltet einen privaten 4x4 Land Cruiser mit Hubdach, gesteuert von Ihrem professionellen Guide von der Begrüßung am Flughafen Entebbe bis zum Abschied.',
      guidesSectionTag: 'Der Guide macht den Unterschied',
      guidesSectionTitle: 'Unsere Guides und Partner kennenlernen',
      guidesSectionDesc:
        'Jede Enganda-Safari wird von einem lizenzierten ugandischen Naturführer geleitet und mit geprüften Partner-Lodges, Hotels, Motels und Campsites in ganz Uganda kombiniert.',
      experiencesSectionTag: '100% Uganda • Privatreisen',
      experiencesSectionTitle: 'Ausgewählte Uganda-Safari-Erlebnisse',
      experiencesSectionDesc:
        'Jede Route verläuft ausschließlich innerhalb Ugandas und wird individuell an Ihr Tempo, Ihre Komfortstufe und Ihren Wunsch-Guide angepasst.',
      filterAllExperiences: 'Alle 6 Erlebnisse filtern',
      bottomCtaTag: 'Nur 5 Minuten vom Internationalen Flughafen Entebbe entfernt',
      bottomCtaTitle: 'Bereit für Ihren persönlichen Uganda-Guide?',
      bottomCtaDesc:
        'Unser Koordinationsteam in Bugonga, Entebbe arbeitet direkt mit unseren 8 Guides und der Uganda Wildlife Authority zusammen. Bestätigung innerhalb von 12 Stunden.',
      whatsappUs: 'Per WhatsApp schreiben',
    },
    generator: {
      badge: 'Maßgeschneiderte Expeditionsplanung • Planungsbüro Entebbe',
      title: 'Individueller Uganda-Safari-Routenplaner',
      subtitle:
        'Wählen Sie Ihre bevorzugte Region in Uganda, Ihr Komfort-Budget sowie Tierwelt- und Kulturaktivitäten. Unser Routenplaner erstellt einen maßgeschneiderten Tagesplan inklusive passendem ugandischen Spezialisten — direkt speicherbar in Ihrem',
      walletBalanceLabel: 'Ihr Safari-Wallet-Guthaben',
      savedPlansCount: 'gespeicherte Pläne',
      step1Region: '1. Bevorzugte Region / Route in Uganda',
      step1Hint: '100% Uganda-Routen mit Start und Ziel an unserem Hauptsitz in Entebbe.',
      step2Duration: '2. Reisedauer:',
      daysUnit: 'Tage',
      step3Travelers: '3. Reisende (Privater 4x4)',
      step3Hint: 'Privater Land Cruiser mit Aufstelldach inklusive.',
      step4Budget: '4. Budget & Unterkunfts-Komfortstufe',
      step5Activities: '5. Safari-Aktivitäten & Erlebnisse (1 oder mehrere wählen)',
      selectedCount: 'ausgewählt',
      step6Notes: 'Optionale Sonderwünsche (Fotografie, Ernährung, Reisetempo, Parksektor)',
      notesPlaceholder:
        'z. B. Gorilla-Habituierung in Rushaga, Kratersee-Wanderungen, Fotografie zur goldenen Stunde...',
      generateBtn: 'Individuellen Safari-Plan erstellen',
      generatingBtn: 'Ihr maßgeschneiderter Uganda-Reiseplan wird erstellt...',
      matchedSpecialistTag: 'Empfohlener Ugandischer Spezialist',
      viewProfile: 'Guide-Profil ansehen',
      sendToEntebbe: 'An Büro Entebbe senden',
      includedPermitsTitle: 'Enthaltene UWA-Permits & Parkgebühren',
      recommendedPartnersTitle: 'Empfohlene Partner-Unterkünfte',
      dayByDayTitle: 'Detaillierter Reiseverlauf Tag für Tag',
      vehicleBadge: 'Privater 4x4 Land Cruiser mit Hubdach',
      saveToWalletBtn: 'Reiseplan im Safari-Wallet speichern',
      savedInWalletBtn: 'Im Safari-Wallet gespeichert',
      payDepositBtn: '30% Anzahlung über Wallet begleichen',
      depositPaidBadge: '30% Anzahlung über Safari-Wallet bezahlt',
      morningProgram: 'Vormittagsprogramm',
      afternoonProgram: 'Nachmittags- & Abendprogramm',
      overnightStay: 'Übernachtung bei Partner:',
      keyWildlife: 'Wildtier-Highlights:',
    },
    concierge: {
      launcherOpen: 'Guide-Berater fragen',
      launcherClose: 'Guide-Berater schließen',
      headerTitle: 'Enganda Guide-Berater',
      headerBadge: 'Entebbe Concierge',
      headerSubtitle: 'Vermittelt ugandische Guides & offizielle UWA-Permit-Tarife',
      welcomeMessage:
        'Oli otya! Willkommen beim Enganda Guide-Berater. Bei Enganda Safaris steht der Guide im Mittelpunkt — verraten Sie mir, was Sie in Uganda erleben möchten (Berggorillas in Bwindi, Schimpansen in Kibale, den Schuhschnabel in Mabamba oder Löwen im Kidepo-Tal), und ich empfehle Ihnen den passenden ugandischen Guide samt offiziellen UWA-Permit-Tarifen.',
      loadingMessage: 'Enganda-Guide-Profile & UWA-Permit-Tarife werden geprüft...',
      inputPlaceholder: 'Fragen Sie nach Guides, Bwindi-Permits oder einer 7-Tage-Safari...',
      footerGuarantee: 'Persönliche Bestätigung aus Entebbe innerhalb von 12 Std.',
      quickPrompts: [
        'Deutschsprachigen Guide finden',
        'Preise für Gorilla-Permits',
        '7-tägige Safari planen',
        'Mit Koordinator per WhatsApp sprechen',
      ],
    },
    footer: {
      utbTitle: 'Registriert beim Uganda Tourism Board (UTB)',
      utbDesc:
        'Lizenzierter ugandischer Safari-Veranstalter mit Hauptsitz in Entebbe und geprüften USAGA- & UWA-Guides.',
      autoTitle: 'Mitglied der Association of Uganda Tour Operators (AUTO)',
      autoDesc:
        'Verpflichtet zu fairen Löhnen für ugandische Safari-Guides und Bergträger, Anzahlungsschutz und nachhaltigem Naturschutz.',
      uwaTitle: 'Offizielle UWA-Permit-Quittungen garantiert',
      uwaDesc:
        'Sie erhalten die offiziellen UWA-Quittungen vor Zahlung des Restbetrags. Jedes Gorilla- und Schimpansen-Permit wird direkt bei der Uganda Wildlife Authority gebucht.',
      brandBio:
        'Ein kuratiertes Kollektiv lizenzierter einheimischer Safari-Guides in allen wichtigen Regionen Ugandas, koordiniert von unserem Hauptsitz in Entebbe.',
      headOfficeLabel: 'Hauptsitz Entebbe',
      airportPickupLabel:
        '5 Minuten vom Internationalen Flughafen Entebbe — Abholung am Flughafen verfügbar',
      connectSocials: 'Folgen Sie uns auf X, Instagram & LinkedIn',
      colGuidesPartners: 'Guides, Partner & Safaris',
      colRegions: 'Regionen in Uganda',
      colPlanning: 'Planung & Transparenz',
      rightsReserved: 'Alle Safaris werden ausschließlich innerhalb Ugandas durchgeführt.',
    },
    common: {
      requestGuide: 'Diesen Guide anfragen',
      viewDetails: 'Safari-Details ansehen',
      inquireNow: 'Jetzt anfragen',
      days: 'Tage',
      from: 'Ab',
      languagesSpoken: 'Sprachen',
      yearsExperience: 'Jahre Erfahrung',
    },
  },
};
