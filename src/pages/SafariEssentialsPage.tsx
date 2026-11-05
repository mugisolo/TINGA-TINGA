import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Square,
  Printer,
  Wallet,
  Plus,
  Trash2,
  Compass,
  ShieldCheck,
  Mountain,
  Binoculars,
  Users,
  Trees,
  FileCheck,
  CheckCircle2,
  RotateCcw,
  ArrowUpRight,
  Sparkles,
  Filter,
  Download,
  FolderOpen,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { useWallet } from '../context/WalletContext';
import {
  SafariEssentialCategory,
  SafariChecklistItem,
  SavedSafariChecklist,
} from '../types';

interface CategoryConfig {
  id: SafariEssentialCategory;
  label: string;
  shortLabel: string;
  subtitle: string;
  parks: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
}

const ACTIVITY_CATEGORIES: CategoryConfig[] = [
  {
    id: 'gorilla-trekking',
    label: 'Gorilla Trekking',
    shortLabel: 'Gorilla Trekking',
    subtitle: 'High-altitude montane rainforest gear for Bwindi & Mgahinga',
    parks: 'Bwindi Impenetrable NP • Mgahinga Gorilla NP (1,200m–2,600m)',
    icon: Mountain,
    accentColor: '#226B3E',
  },
  {
    id: 'savannah-game-drive',
    label: 'Savannah Game Drive',
    shortLabel: 'Savannah Game Drive',
    subtitle: 'Optics, neutral field layers & dust protection for open plains',
    parks: 'Murchison Falls NP • Queen Elizabeth NP • Kidepo Valley NP',
    icon: Binoculars,
    accentColor: '#C85A28',
  },
  {
    id: 'cultural-visits',
    label: 'Cultural Visits',
    shortLabel: 'Cultural Visits',
    subtitle: 'Respectful attire & community exchange essentials',
    parks: 'Batwa Heritage • Karamojong Manyattas • Bigodi & Entebbe Cooperatives',
    icon: Users,
    accentColor: '#D99B26',
  },
  {
    id: 'chimpanzee-primate',
    label: 'Chimpanzee & Primate Tracking',
    shortLabel: 'Chimp & Primate Tracking',
    subtitle: 'Humid forest floor footwear, DEET protection & fast optics',
    parks: 'Kibale National Park • Kyambura Gorge • Budongo Forest',
    icon: Trees,
    accentColor: '#1B5632',
  },
  {
    id: 'documents-health',
    label: 'Entry, Health & UWA Documents',
    shortLabel: 'Visas, Health & Permits',
    subtitle: 'Mandatory Entebbe Airport & Uganda Wildlife Authority paperwork',
    parks: 'Entebbe International Airport (EBB) • UWA Park Gates',
    icon: FileCheck,
    accentColor: '#1A1612',
  },
];

const DEFAULT_CHECKLIST_ITEMS: Omit<SafariChecklistItem, 'checked'>[] = [
  // 1. Gorilla Trekking
  {
    id: 'gt-boots',
    category: 'gorilla-trekking',
    title: 'Broken-in Waterproof Ankle Hiking Boots',
    description:
      'Sturdy Vibram-sole boots with ankle support for steep, muddy, and off-trail Bwindi slopes.',
    priority: 'essential',
    weightOrSpec: 'Gore-Tex / High-ankle',
    guideTip:
      'Samuel Kato recommends wearing your boots on the flight to Entebbe so you never trek in borrowed footwear.',
  },
  {
    id: 'gt-gloves',
    category: 'gorilla-trekking',
    title: 'Heavy-Duty Gardening or Thorn-Proof Trekking Gloves',
    description:
      'Protects your hands when gripping vines, stinging nettles, and bamboo stems on steep ascents.',
    priority: 'essential',
    weightOrSpec: 'Reinforced palm grip',
    guideTip:
      'Ordinary cycling gloves are too thin for Bwindi stinging nettles—pack proper leather or rubberized gardening gloves.',
  },
  {
    id: 'gt-gaiters',
    category: 'gorilla-trekking',
    title: 'Knee-High Waterproof Trail Gaiters & Thick Merino Socks',
    description:
      'Seals your lower legs against rainforest mud, morning dew, and safari ants (siafu).',
    priority: 'essential',
    weightOrSpec: '2 pairs merino + 1 pair gaiters',
    guideTip:
      'Always tuck your trouser hems inside your socks before strapping on gaiters at the UWA briefing point.',
  },
  {
    id: 'gt-rain-shell',
    category: 'gorilla-trekking',
    title: 'Breathable Waterproof Rain Jacket / Poncho',
    description:
      'Bwindi is a tropical montane rainforest; sudden downpours can occur even in dry months (June–August).',
    priority: 'essential',
    weightOrSpec: 'Olive, forest green, or earth tone',
  },
  {
    id: 'gt-masks',
    category: 'gorilla-trekking',
    title: '2x Surgical or KN95 Face Masks (Mandatory UWA Protocol)',
    description:
      'Required by the Uganda Wildlife Authority during your 1-hour observation with habituated mountain gorillas to prevent respiratory transmission.',
    priority: 'essential',
    weightOrSpec: 'Minimum 2 masks per trek',
  },
  {
    id: 'gt-porter-cash',
    category: 'gorilla-trekking',
    title: 'US$20–$25 Cash in Small Bills for Local Bwindi Porter',
    description:
      'Hiring a community porter at the trailhead carries your daypack, steadies you on steep ravines, and directly funds families bordering the park.',
    priority: 'recommended',
    weightOrSpec: 'Crisp USD or UGX equivalent',
    guideTip:
      'Many Bwindi porters are former poachers or university students—hiring one is the single highest-impact community contribution you can make.',
  },

  // 2. Savannah Game Drive
  {
    id: 'sgd-binoculars',
    category: 'savannah-game-drive',
    title: '8x42 or 10x42 Roof-Prism Binoculars',
    description:
      'Essential for spotting tree-climbing lions in Ishasha figs, leopards in Murchison acacias, and Shoebill storks.',
    priority: 'essential',
    weightOrSpec: '8x42 or 10x42 waterproof',
    guideTip:
      'While every Enganda 4x4 Land Cruiser carries a guide pair, having your own binoculars transforms Kazinga Channel and Kidepo sightings.',
  },
  {
    id: 'sgd-neutral-layers',
    category: 'savannah-game-drive',
    title: 'Breathable Neutral Layers (Khaki, Olive, Tan, Stone)',
    description:
      'Convertible long-sleeve shirts and lightweight fleece for chilly 6:00 AM pop-up roof game drives.',
    priority: 'essential',
    weightOrSpec: 'Avoid bright white, royal blue & camouflage',
    guideTip:
      'Avoid dark blue and black on savanna drives—they attract tsetse flies along woodland tracks. Camouflage clothing is strictly prohibited for civilians in Uganda.',
  },
  {
    id: 'sgd-dust-bag',
    category: 'savannah-game-drive',
    title: 'Microfiber Lens Cloths & Zip-Seal Dust Bag for Camera Gear',
    description:
      'Protects telephoto lenses and camera bodies from fine red laterite dust in Kidepo and Murchison Falls.',
    priority: 'recommended',
    weightOrSpec: '200–400mm zoom recommended',
  },
  {
    id: 'sgd-sun-gear',
    category: 'savannah-game-drive',
    title: 'Wide-Brim Chin-Strap Safari Hat, Polarized Sunglasses & SPF 50+',
    description:
      'Equatorial UV index in Uganda is strong even on overcast mornings, and a chin strap keeps your hat secure in open-roof Land Cruisers.',
    priority: 'essential',
    weightOrSpec: 'UPF 50+ sun protection',
  },
  {
    id: 'sgd-headlamp',
    category: 'savannah-game-drive',
    title: 'Rechargeable LED Headlamp with Red-Light Mode',
    description:
      'Useful for pre-dawn departures, solar-powered eco-camps, and nocturnal bush walks without disturbing wildlife.',
    priority: 'recommended',
    weightOrSpec: 'USB-C rechargeable',
  },

  // 3. Cultural Visits
  {
    id: 'cv-modest-attire',
    category: 'cultural-visits',
    title: 'Respectful Modest Attire Covering Shoulders & Knees',
    description:
      'Lightweight linen trousers or midi/maxi skirts and collared/sleeved tops for visiting rural Ugandan homesteads, kingdoms, and elders.',
    priority: 'essential',
    weightOrSpec: 'Lightweight breathable cotton/linen',
    guideTip:
      'Grace Achieng notes that dressing modestly during Karamojong, Batwa, and Ankole visits immediately signals mutual respect and opens warmer conversations.',
  },
  {
    id: 'cv-small-ugx',
    category: 'cultural-visits',
    title: 'Small Denomination Ugandan Shillings (UGX 5,000–20,000 Notes)',
    description:
      'Enables direct purchase of handwoven baskets, beadwork, and organic Arabica coffee directly from women’s cooperatives.',
    priority: 'essential',
    weightOrSpec: 'UGX 100,000–250,000 in small notes',
    guideTip:
      'Rural artisans rarely have change for US$100 bills—your guide will help you exchange into clean UGX notes in Entebbe before heading upcountry.',
  },
  {
    id: 'cv-phrase-notebook',
    category: 'cultural-visits',
    title: 'Pocket Field Journal & Local Greeting Card (Luganda / Runyankole)',
    description:
      'Jot down local proverbs, clan histories, and greetings like "Oli otya" (Luganda) or "Agandi" (Runyankole).',
    priority: 'recommended',
    weightOrSpec: 'Pocket notebook + pen',
  },
  {
    id: 'cv-slip-on-shoes',
    category: 'cultural-visits',
    title: 'Easy Slip-On Sandals or Shoes for Community Homestays',
    description:
      'Convenient when stepping onto woven mats inside traditional cultural huts or craft centers.',
    priority: 'optional',
  },

  // 4. Chimpanzee & Primate Tracking
  {
    id: 'cp-ripstop-trousers',
    category: 'chimpanzee-primate',
    title: 'Quick-Dry Ripstop Long Trekking Trousers (2 Pairs)',
    description:
      'Protects legs against thorny undergrowth and damp forest trails in Kibale National Park and Kyambura Gorge.',
    priority: 'essential',
    weightOrSpec: 'Lightweight nylon/spandex blend',
  },
  {
    id: 'cp-deet-repellent',
    category: 'chimpanzee-primate',
    title: 'Tropical Insect Repellent (30%+ DEET or Picaridin)',
    description:
      'Essential for humid lower-elevation primate forests, Bigodi Wetland Sanctuary, and Lake Victoria papyrus swamps.',
    priority: 'essential',
    weightOrSpec: '100ml travel pump bottle',
  },
  {
    id: 'cp-daypack-liner',
    category: 'chimpanzee-primate',
    title: '20L–25L Ergonomic Daypack with Waterproof Dry-Bag Liner',
    description:
      'Carries your 2 liters of drinking water, packed lunch, rain shell, and extra camera batteries during 3–5 hour forest treks.',
    priority: 'essential',
    weightOrSpec: '20L–25L with rain cover',
  },

  // 5. Entry, Health & UWA Documents
  {
    id: 'dh-passport-visa',
    category: 'documents-health',
    title: 'Passport (6+ Months Validity) & Printed Uganda / East Africa e-Visa',
    description:
      'Apply solely via the official portal (visas.immigration.go.ug). Carry a printed copy of your e-Visa approval barcode for Entebbe immigration.',
    priority: 'essential',
    weightOrSpec: 'Printed hard copy + digital PDF',
  },
  {
    id: 'dh-yellow-fever',
    category: 'documents-health',
    title: 'Original Yellow Fever Vaccination Certificate (Yellow Card)',
    description:
      'Inspected by Port Health upon arrival at Entebbe International Airport BEFORE the immigration desks.',
    priority: 'essential',
    weightOrSpec: 'Physical WHO Yellow Booklet',
  },
  {
    id: 'dh-crisp-usd',
    category: 'documents-health',
    title: 'Crisp, Unmarked US Dollar Bills Printed 2013 or Newer',
    description:
      'Uganda banks and lodges reject USD bills printed before 2013 or notes with any tears, ink stamps, or heavy creases.',
    priority: 'essential',
    weightOrSpec: 'Series 2013+ clean notes',
    guideTip:
      'Ask your home bank specifically for crisp post-2017 US$50 and US$100 bills for the best exchange rate in Entebbe, plus US$5/$10 notes for tips.',
  },
  {
    id: 'dh-malaria-meds',
    category: 'documents-health',
    title: 'Antimalarial Prophylaxis, Personal First-Aid & Rehydration Salts',
    description:
      'Malarone or Doxycycline as prescribed by your travel clinic, plus blister plasters, antihistamines, and electrolyte sachets.',
    priority: 'essential',
  },
  {
    id: 'dh-type-g-adapter',
    category: 'documents-health',
    title: 'UK 3-Pin Square Plug Adapter (Type G, 240V) & Power Bank',
    description:
      'Uganda uses British Type G wall sockets. Every Enganda 4x4 Land Cruiser also has inverter charging ports between seats.',
    priority: 'essential',
    weightOrSpec: 'Type G (3 rectangular pins)',
  },
];

const CHECKLIST_LOCAL_KEY = 'enganda_active_safari_checklist_v1';

export const SafariEssentialsPage: React.FC = () => {
  const { savedChecklists, saveChecklistToWallet, removeSavedChecklist } =
    useWallet();
  const [searchParams] = useSearchParams();

  // Checklist Title & Notes
  const [checklistId, setChecklistId] = useState<string>(() => `chk_custom_main`);
  const [referenceCode, setReferenceCode] = useState<string>(() => 'ENG-CHK-2026');
  const [checklistTitle, setChecklistTitle] = useState<string>(
    'My Uganda Gorilla & Savanna Packing Dossier'
  );
  const [checklistNotes, setChecklistNotes] = useState<string>(
    '15kg soft-sided duffel bag limit for domestic bush flights (AeroLink Entebbe–Kihihi/Kidepo).'
  );

  // Selected activity categories included in the traveler's safari
  const [selectedActivities, setSelectedActivities] = useState<
    SafariEssentialCategory[]
  >([
    'gorilla-trekking',
    'savannah-game-drive',
    'cultural-visits',
    'chimpanzee-primate',
    'documents-health',
  ]);

  // Active tab filter ('all' or specific category)
  const [activeCategoryView, setActiveCategoryView] = useState<
    'all' | SafariEssentialCategory
  >('all');
  const [showUncheckedOnly, setShowUncheckedOnly] = useState<boolean>(false);

  // Checked Item IDs & Custom Items
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_LOCAL_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.checkedIds)) return parsed.checkedIds;
      }
    } catch {
      // ignore
    }
    return ['dh-passport-visa', 'dh-yellow-fever', 'gt-boots'];
  });

  const [customItems, setCustomItems] = useState<SafariChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_LOCAL_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.customItems)) return parsed.customItems;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // New Custom Item Form State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] =
    useState<SafariEssentialCategory>('gorilla-trekking');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<
    'essential' | 'recommended' | 'optional'
  >('essential');

  // Status banner
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  // Load saved checklist if `?checklistId=` is passed in URL
  useEffect(() => {
    const requestedId = searchParams.get('checklistId');
    if (requestedId && savedChecklists.length > 0) {
      const found = savedChecklists.find((c) => c.id === requestedId);
      if (found) {
        setChecklistId(found.id);
        setReferenceCode(found.referenceCode);
        setChecklistTitle(found.title);
        setSelectedActivities(
          found.selectedActivities.length > 0
            ? found.selectedActivities
            : ACTIVITY_CATEGORIES.map((c) => c.id)
        );
        setCheckedIds(found.checkedItemIds || []);
        setCustomItems(found.customItems || []);
        if (found.notes !== undefined) setChecklistNotes(found.notes);
        setFeedbackBanner({
          type: 'info',
          message: `Loaded saved checklist "${found.title}" (${found.referenceCode}) from your Safari Wallet.`,
        });
      }
    }
  }, [searchParams, savedChecklists]);

  // Persist current working state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        CHECKLIST_LOCAL_KEY,
        JSON.stringify({
          checklistId,
          referenceCode,
          checklistTitle,
          checklistNotes,
          selectedActivities,
          checkedIds,
          customItems,
        })
      );
    } catch {
      // ignore
    }
  }, [
    checklistId,
    referenceCode,
    checklistTitle,
    checklistNotes,
    selectedActivities,
    checkedIds,
    customItems,
  ]);

  // Merge default items and custom items for active selectedActivities
  const allActiveItems: SafariChecklistItem[] = useMemo(() => {
    const baseItems: SafariChecklistItem[] = DEFAULT_CHECKLIST_ITEMS.filter(
      (item) => selectedActivities.includes(item.category)
    ).map((item) => ({
      ...item,
      checked: checkedIds.includes(item.id),
    }));

    const userItems: SafariChecklistItem[] = customItems
      .filter((item) => selectedActivities.includes(item.category))
      .map((item) => ({
        ...item,
        checked: checkedIds.includes(item.id),
      }));

    return [...baseItems, ...userItems];
  }, [selectedActivities, checkedIds, customItems]);

  const totalCount = allActiveItems.length;
  const completedCount = allActiveItems.filter((i) => i.checked).length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleActivityInclusion = (catId: SafariEssentialCategory) => {
    setSelectedActivities((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Keep at least 1 category active
        const next = prev.filter((c) => c !== catId);
        if (activeCategoryView === catId) setActiveCategoryView('all');
        return next;
      }
      return [...prev, catId];
    });
  };

  const toggleItemChecked = (itemId: string) => {
    setCheckedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCheckAllInCategory = (catId: SafariEssentialCategory) => {
    const categoryItemIds = allActiveItems
      .filter((i) => i.category === catId)
      .map((i) => i.id);
    const allAlreadyChecked = categoryItemIds.every((id) =>
      checkedIds.includes(id)
    );
    if (allAlreadyChecked) {
      setCheckedIds((prev) =>
        prev.filter((id) => !categoryItemIds.includes(id))
      );
    } else {
      setCheckedIds((prev) =>
        Array.from(new Set([...prev, ...categoryItemIds]))
      );
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newItemTitle.trim();
    if (!cleanTitle) return;

    const newItem: SafariChecklistItem = {
      id: `custom_${Date.now()}`,
      category: newItemCategory,
      title: cleanTitle,
      description:
        newItemDescription.trim() ||
        'Custom traveler equipment added to personal Uganda expedition checklist.',
      priority: newItemPriority,
      checked: true,
      isCustom: true,
    };

    if (!selectedActivities.includes(newItemCategory)) {
      setSelectedActivities((prev) => [...prev, newItemCategory]);
    }

    setCustomItems((prev) => [...prev, newItem]);
    setCheckedIds((prev) => [...prev, newItem.id]);
    setNewItemTitle('');
    setNewItemDescription('');
    setFeedbackBanner({
      type: 'success',
      message: `Added "${cleanTitle}" to ${
        ACTIVITY_CATEGORIES.find((c) => c.id === newItemCategory)?.label ||
        'your checklist'
      }.`,
    });
  };

  const handleRemoveCustomItem = (itemId: string) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== itemId));
    setCheckedIds((prev) => prev.filter((id) => id !== itemId));
  };

  const handleSaveToWallet = () => {
    const payload: SavedSafariChecklist = {
      id: checklistId || `chk_${Date.now()}`,
      referenceCode:
        referenceCode ||
        `ENG-CHK-${Math.floor(100000 + Math.random() * 900000)}`,
      title:
        checklistTitle.trim() || 'My Uganda Gorilla & Savanna Packing Dossier',
      selectedActivities,
      totalItems: totalCount,
      checkedCount: completedCount,
      checkedItemIds: checkedIds,
      customItems,
      notes: checklistNotes.trim(),
      updatedAt: new Date().toISOString(),
    };

    const res = saveChecklistToWallet(payload);
    setChecklistId(res.savedChecklist.id);
    setReferenceCode(res.savedChecklist.referenceCode);
    setFeedbackBanner({
      type: 'success',
      message: res.message,
    });
  };

  const handleLoadSavedChecklist = (saved: SavedSafariChecklist) => {
    setChecklistId(saved.id);
    setReferenceCode(saved.referenceCode);
    setChecklistTitle(saved.title);
    setSelectedActivities(
      saved.selectedActivities.length > 0
        ? saved.selectedActivities
        : ACTIVITY_CATEGORIES.map((c) => c.id)
    );
    setCheckedIds(saved.checkedItemIds || []);
    setCustomItems(saved.customItems || []);
    setChecklistNotes(saved.notes || '');
    setFeedbackBanner({
      type: 'info',
      message: `Loaded "${saved.title}" (${saved.referenceCode}) from your Safari Wallet.`,
    });
  };

  const handleStartFreshChecklist = () => {
    const newCode = `ENG-CHK-${Math.floor(100000 + Math.random() * 900000)}`;
    setChecklistId(`chk_${Date.now()}`);
    setReferenceCode(newCode);
    setChecklistTitle('Custom Uganda Safari Packing List');
    setCheckedIds([]);
    setCustomItems([]);
    setFeedbackBanner({
      type: 'info',
      message: `Started a fresh custom checklist (${newCode}). Check your items and click "Save to Safari Wallet" when ready.`,
    });
  };

  const handlePrintChecklist = () => {
    window.print();
  };

  const visibleCategories = useMemo(() => {
    return ACTIVITY_CATEGORIES.filter((cat) => {
      if (!selectedActivities.includes(cat.id)) return false;
      if (activeCategoryView !== 'all' && activeCategoryView !== cat.id) {
        return false;
      }
      return true;
    });
  }, [selectedActivities, activeCategoryView]);

  return (
    <div className="bg-[#FAF7F2] text-[#1A1612] min-h-screen pb-24">
      <SEO
        title="Safari Essentials Interactive Checklist | Gorilla Trekking, Savanna & Cultural Packing Guide | Enganda Safaris"
        description="Interactive Uganda Safari Essentials checklist categorized by Gorilla Trekking, Savannah Game Drives, Cultural Visits, and Chimpanzee Tracking. Customize, print, or save directly to your Safari Wallet."
      />

      {/* Top Editorial Header (Hidden in raw print if needed, or styled cleanly) */}
      <section className="bg-[#226B3E] text-[#FAF7F2] py-14 lg:py-18 border-b border-[#2E8550] print:bg-white print:text-[#1A1612] print:py-6 print:border-b-2 print:border-[#1A1612]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#144225] border border-[#D99B26]/40 text-xs font-mono uppercase tracking-wider text-[#D99B26] print:bg-[#FAF7F2] print:text-[#1A1612]">
                <Compass className="w-3.5 h-3.5" />
                <span>Field-Tested by Our 8 Ugandan Specialist Guides</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                Safari Essentials Interactive Checklist
              </h1>
              <p className="text-base sm:text-lg text-[#E4DCCF] leading-relaxed print:text-[#5A5248]">
                Tailor your packing and readiness dossier by activity—from
                high-altitude Bwindi mountain gorilla trekking and Murchison
                savanna game drives to respectful community visits. Print your
                field sheet or save your custom list directly to your Safari
                Wallet.
              </p>
            </div>

            {/* Readiness Score Card */}
            <div className="bg-[#144225] border border-[#D99B26]/40 rounded-xl p-5 sm:p-6 min-w-[290px] space-y-3 shadow-xl print:bg-[#FAF7F2] print:text-[#1A1612] print:border-[#1A1612]">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs uppercase tracking-wider text-[#D99B26] font-semibold print:text-[#1A1612]">
                  Expedition Readiness
                </span>
                <span className="font-mono text-xs text-[#D6CEC2] print:text-[#5A5248]">
                  {referenceCode}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="font-mono text-3xl sm:text-4xl font-bold text-white tabular-nums print:text-[#1A1612]">
                  {progressPercent}%
                </div>
                <div className="font-mono text-xs text-[#E4DCCF] tabular-nums print:text-[#5A5248]">
                  {completedCount} of {totalCount} items packed
                </div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-[#1A1612]/60 overflow-hidden">
                <div
                  className="h-full bg-[#D99B26] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handleSaveToWallet}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Save to Safari Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintChecklist}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-white border border-white/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Status Notification Banner */}
        {feedbackBanner && (
          <div
            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden ${
              feedbackBanner.type === 'success'
                ? 'bg-[#226B3E]/10 border-[#226B3E] text-[#144225]'
                : 'bg-[#D99B26]/15 border-[#D99B26] text-[#1A1612]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-[#226B3E] shrink-0" />
              <span>{feedbackBanner.message}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/wallet"
                className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-[#226B3E] hover:text-[#C85A28]"
              >
                <span>Open Safari Wallet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setFeedbackBanner(null)}
                className="text-xs font-mono text-[#5A5248] hover:text-[#1A1612] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Select Your Safari Activities & Customize Dossier Name */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 cols: Activity Toggles + Dossier Header */}
          <div className="lg:col-span-8 bg-white border border-[#E4DCCF] rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DCCF] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#C85A28] font-semibold">
                  Step 1 • Activity Configuration
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1A1612]">
                  Customize Your Safari Activity Modules
                </h2>
              </div>
              <button
                type="button"
                onClick={handleStartFreshChecklist}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] text-xs font-mono font-medium transition-colors cursor-pointer self-start print:hidden"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#226B3E]" />
                <span>New Blank Checklist</span>
              </button>
            </div>

            {/* Checklist Name & Luggage Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checklist-title-input"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#5A5248] font-semibold mb-1.5"
                >
                  Custom Checklist Title
                </label>
                <input
                  id="checklist-title-input"
                  type="text"
                  value={checklistTitle}
                  onChange={(e) => setChecklistTitle(e.target.value)}
                  placeholder="e.g., November Bwindi & Queen Elizabeth Safari"
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612] font-medium focus:outline-none focus:border-[#226B3E]"
                />
              </div>
              <div>
                <label
                  htmlFor="checklist-notes-input"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#5A5248] font-semibold mb-1.5"
                >
                  Personal Flight / Luggage Notes
                </label>
                <input
                  id="checklist-notes-input"
                  type="text"
                  value={checklistNotes}
                  onChange={(e) => setChecklistNotes(e.target.value)}
                  placeholder="e.g., 15kg soft duffel limit, prescription lenses..."
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF7F2] border border-[#D6CEC2] text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>
            </div>

            {/* Activity Module Checkboxes */}
            <div className="space-y-2 print:hidden">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#5A5248] font-semibold">
                Toggle Activities Included in Your Itinerary:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {ACTIVITY_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isIncluded = selectedActivities.includes(cat.id);
                  const catItems = allActiveItems.filter(
                    (i) => i.category === cat.id
                  );
                  const catChecked = catItems.filter((i) => i.checked).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleActivityInclusion(cat.id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isIncluded
                          ? 'bg-[#226B3E]/8 border-[#226B3E] text-[#1A1612]'
                          : 'bg-[#FAF7F2] border-[#E4DCCF] text-[#5A5248] opacity-65 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md shrink-0 mt-0.5 ${
                          isIncluded
                            ? 'bg-[#226B3E] text-white'
                            : 'bg-[#E4DCCF] text-[#5A5248]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#1A1612] truncate">
                          {cat.shortLabel}
                        </div>
                        <div className="text-[11px] font-mono text-[#5A5248] mt-0.5">
                          {isIncluded
                            ? `${catChecked}/${catItems.length} packed`
                            : 'Excluded from trip'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 4 cols: Saved Wallet Checklists & Quick Add Custom Item */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            {/* Add Custom Item Card */}
            <form
              onSubmit={handleAddCustomItem}
              className="bg-white border border-[#E4DCCF] rounded-xl p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#226B3E] font-semibold">
                    Personalize Gear
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A1612]">
                    Add Custom Packing Item
                  </h3>
                </div>
                <Plus className="w-4 h-4 text-[#C85A28]" />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="e.g., Carbon Monopod or Extra Inhaler"
                  className="w-full px-3 py-2 rounded bg-[#FAF7F2] border border-[#D6CEC2] text-xs text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] mb-1">
                    Activity Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) =>
                      setNewItemCategory(
                        e.target.value as SafariEssentialCategory
                      )
                    }
                    className="w-full px-2.5 py-2 rounded bg-[#FAF7F2] border border-[#D6CEC2] text-xs text-[#1A1612]"
                  >
                    {ACTIVITY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.shortLabel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#5A5248] mb-1">
                    Priority
                  </label>
                  <select
                    value={newItemPriority}
                    onChange={(e) =>
                      setNewItemPriority(
                        e.target.value as
                          | 'essential'
                          | 'recommended'
                          | 'optional'
                      )
                    }
                    className="w-full px-2.5 py-2 rounded bg-[#FAF7F2] border border-[#D6CEC2] text-xs text-[#1A1612]"
                  >
                    <option value="essential">Essential</option>
                    <option value="recommended">Recommended</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#5A5248] mb-1">
                  Notes / Specification (Optional)
                </label>
                <input
                  type="text"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="e.g., Pack in carry-on daypack"
                  className="w-full px-3 py-2 rounded bg-[#FAF7F2] border border-[#D6CEC2] text-xs text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to My Checklist</span>
              </button>
            </form>

            {/* Saved Checklists in Safari Wallet */}
            <div className="bg-white border border-[#E4DCCF] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A28] font-semibold">
                    Safari Wallet Sync
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A1612]">
                    Saved Wallet Checklists ({savedChecklists.length})
                  </h3>
                </div>
                <FolderOpen className="w-4 h-4 text-[#226B3E]" />
              </div>

              {savedChecklists.length === 0 ? (
                <p className="text-xs text-[#5A5248] leading-relaxed">
                  Click <strong>“Save to Safari Wallet”</strong> at any time to
                  store your custom packing checklist alongside your UWA permit
                  escrow and safari itineraries.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {savedChecklists.map((saved) => (
                    <div
                      key={saved.id}
                      className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E4DCCF] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#226B3E] text-white">
                            {saved.referenceCode}
                          </span>
                          <span className="font-mono text-[10px] text-[#5A5248]">
                            {saved.checkedCount}/{saved.totalItems} packed
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#1A1612] truncate mt-1">
                          {saved.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadSavedChecklist(saved)}
                          className="px-2.5 py-1 rounded bg-[#F3ECE1] hover:bg-[#226B3E] hover:text-white text-[#1A1612] font-mono text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSavedChecklist(saved.id)}
                          aria-label={`Delete ${saved.title}`}
                          className="p-1 text-[#5A5248] hover:text-[#C85A28] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Bar + Unchecked Filter + Action Bar */}
        <div className="bg-white border border-[#E4DCCF] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-[#5A5248] mr-1">
              <Filter className="w-3.5 h-3.5 text-[#226B3E]" />
              <span>Filter Activity:</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveCategoryView('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeCategoryView === 'all'
                  ? 'bg-[#226B3E] text-white'
                  : 'bg-[#FAF7F2] text-[#5A5248] border border-[#E4DCCF] hover:text-[#1A1612]'
              }`}
            >
              All Selected ({totalCount})
            </button>
            {ACTIVITY_CATEGORIES.filter((c) =>
              selectedActivities.includes(c.id)
            ).map((cat) => {
              const count = allActiveItems.filter(
                (i) => i.category === cat.id
              ).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryView(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategoryView === cat.id
                      ? 'bg-[#226B3E] text-white'
                      : 'bg-[#FAF7F2] text-[#5A5248] border border-[#E4DCCF] hover:text-[#1A1612]'
                  }`}
                >
                  {cat.shortLabel} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1A1612] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showUncheckedOnly}
                onChange={(e) => setShowUncheckedOnly(e.target.checked)}
                className="rounded border-[#D6CEC2] text-[#226B3E] focus:ring-[#226B3E]"
              />
              <span>Show unpacked items only</span>
            </label>
          </div>
        </div>

        {/* Categorized Checklist Sections */}
        <div className="space-y-8">
          {visibleCategories.map((cat) => {
            const Icon = cat.icon;
            const categoryItems = allActiveItems.filter((item) => {
              if (item.category !== cat.id) return false;
              if (showUncheckedOnly && item.checked) return false;
              return true;
            });

            const totalCatItems = allActiveItems.filter(
              (i) => i.category === cat.id
            );
            const checkedCatCount = totalCatItems.filter(
              (i) => i.checked
            ).length;

            return (
              <section
                key={cat.id}
                className="bg-white border border-[#E4DCCF] rounded-xl overflow-hidden shadow-sm break-inside-avoid"
              >
                {/* Category Header */}
                <div className="bg-[#F3ECE1] px-6 py-5 border-b border-[#E4DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="p-3 rounded-lg text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: cat.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-2xl font-bold text-[#1A1612]">
                          {cat.label}
                        </h3>
                        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-white border border-[#D6CEC2] text-[#226B3E] font-semibold">
                          {checkedCatCount} / {totalCatItems.length} Packed
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#5A5248] mt-0.5">
                        {cat.subtitle} •{' '}
                        <span className="font-mono text-[11px] text-[#1A1612]">
                          {cat.parks}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCheckAllInCategory(cat.id)}
                    className="px-3 py-1.5 rounded-md bg-white hover:bg-[#226B3E] hover:text-white text-[#1A1612] border border-[#D6CEC2] text-xs font-mono font-semibold transition-colors cursor-pointer self-start sm:self-center print:hidden"
                  >
                    {checkedCatCount === totalCatItems.length
                      ? 'Uncheck Section'
                      : 'Check All in Section'}
                  </button>
                </div>

                {/* Items List */}
                {categoryItems.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#5A5248]">
                    All items in <strong>{cat.label}</strong> are packed and
                    checked!
                  </div>
                ) : (
                  <div className="divide-y divide-[#E4DCCF]">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemChecked(item.id)}
                        className={`p-5 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                          item.checked
                            ? 'bg-[#226B3E]/[0.04]'
                            : 'hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <button
                            type="button"
                            aria-label={`Toggle ${item.title}`}
                            className="mt-0.5 text-[#226B3E] shrink-0 cursor-pointer"
                          >
                            {item.checked ? (
                              <CheckSquare className="w-5 h-5 text-[#226B3E]" />
                            ) : (
                              <Square className="w-5 h-5 text-[#9E9385]" />
                            )}
                          </button>

                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4
                                className={`font-serif text-lg font-bold leading-snug ${
                                  item.checked
                                    ? 'line-through text-[#5A5248]'
                                    : 'text-[#1A1612]'
                                }`}
                              >
                                {item.title}
                              </h4>

                              <span
                                className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${
                                  item.priority === 'essential'
                                    ? 'bg-[#C85A28]/15 text-[#C85A28]'
                                    : item.priority === 'recommended'
                                    ? 'bg-[#226B3E]/15 text-[#226B3E]'
                                    : 'bg-[#F3ECE1] text-[#5A5248]'
                                }`}
                              >
                                {item.priority}
                              </span>

                              {item.weightOrSpec && (
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E4DCCF] text-[#5A5248]">
                                  {item.weightOrSpec}
                                </span>
                              )}

                              {item.isCustom && (
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#D99B26]/20 text-[#9E6B0E]">
                                  Custom Item
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                              {item.description}
                            </p>

                            {item.guideTip && (
                              <div className="p-2.5 rounded-md bg-[#FAF7F2] border-l-2 border-[#D99B26] text-xs text-[#1A1612] flex items-start gap-2 mt-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#C85A28] shrink-0 mt-0.5" />
                                <span>
                                  <strong>Ugandan Guide Tip:</strong>{' '}
                                  {item.guideTip}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCustomItem(item.id);
                            }}
                            aria-label={`Remove custom item ${item.title}`}
                            className="p-1.5 text-[#5A5248] hover:text-[#C85A28] shrink-0 print:hidden cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Bottom Print & Wallet Persistence Action Bar */}
        <div className="bg-[#144225] text-[#FAF7F2] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#D99B26]">
              <ShieldCheck className="w-4 h-4" />
              <span>Entebbe Pre-Departure Briefing Ready</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Save Your Custom Checklist to Your Safari Wallet
            </h3>
            <p className="text-sm text-[#D6CEC2] leading-relaxed">
              Your saved checklist stays linked to your Safari Wallet alongside
              your UWA gorilla permit escrow receipts, accommodation vouchers,
              and bespoke safari itinerary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSaveToWallet}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white text-sm font-semibold transition-colors shadow-lg cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Save Custom List to Wallet</span>
            </button>

            <button
              type="button"
              onClick={handlePrintChecklist}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-md bg-[#226B3E] hover:bg-[#2E8550] text-white border border-white/20 text-sm font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Print / Save PDF Dossier</span>
            </button>

            <Link
              to="/wallet"
              className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-md bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#144225] text-sm font-semibold transition-colors"
            >
              <span>View Wallet</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
