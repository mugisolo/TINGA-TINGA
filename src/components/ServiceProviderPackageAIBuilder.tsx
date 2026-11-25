import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Database,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';
import { GUIDES, SHARED_DRIVE_MEDIA_VAULT, TOUR_OPERATORS } from '../data/seedData';
import { ConfirmedPackageEvent, EventDisplayPlacement } from '../types';

export const ServiceProviderPackageAIBuilder: React.FC<{
  defaultProviderName?: string;
}> = ({ defaultProviderName = 'Tingatinga Safaris (Enganda Member)' }) => {
  const { addPackageEvent, formatPrice } = useInquiry();

  const [providerName, setProviderName] = useState(defaultProviderName);
  const [targetPlacement, setTargetPlacement] = useState<EventDisplayPlacement>('both');
  const [fileName, setFileName] = useState('');
  const [mimeType, setMimeType] = useState('text/plain');
  const [fileBase64, setFileBase64] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [pricingAuditNote, setPricingAuditNote] = useState<string | null>(null);
  const [preparedPackage, setPreparedPackage] = useState<ConfirmedPackageEvent | null>(null);
  const [publishedSuccess, setPublishedSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMimeType(file.type || 'application/octet-stream');
    setPublishedSuccess(null);
    setErrorMessage(null);

    const isTextLike =
      file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.json');

    if (isTextLike) {
      const reader = new FileReader();
      reader.onload = () => {
        setDocumentText(String(reader.result || ''));
        setFileBase64('');
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const base64Part = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        setFileBase64(base64Part);
        if (!documentText.trim()) {
          setDocumentText(
            `Uploaded binary document: ${file.name} (${Math.round(file.size / 1024)} KB). Extract East African route, duration, inclusions, and calculate or extract accurate per-person USD pricing.`
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSampleProviderDocument = (preset: 'tingatinga-east-africa' | 'shuma-32-day') => {
    setPublishedSuccess(null);
    setErrorMessage(null);
    setFileBase64('');
    setMimeType('text/plain');

    if (preset === 'shuma-32-day') {
      setProviderName('Shuma Africa Safaris (Enganda Member)');
      setFileName('32_Day_East_African_Grand_Safari_2027_7_Guests_1_Leader.pdf');
      setDocumentText(
        `OPERATOR: Shuma Africa Safaris (Accredited Enganda Member)
PACKAGE: The 32-Day East African Grand Safari 2027 (Tanzania, Kenya, Uganda & Rwanda)
SEASON WINDOW: June – September 2027 (32 Days / 31 Nights)
GROUP FORMULA: 7 Paying Guests + 1 Complimentary / Free Tour Leader (8 Travellers Total)
ROOMING: 4 Twin Rooms + 1 Single Room (Comfortable 4-Star Safari Lodges)
ACTUAL PRICING: $126,550 USD Total Group Cost ($18,078.57 USD Exact Per Paying Guest)
ROUTE & INCLUSIONS:
- Days 1-7 Tanzania: Arusha, Tarangire NP, Ngorongoro Crater Floor Descent, Central & Northern Serengeti Great Migration + Flight Seronera to Arusha & Nairobi
- Days 8-13 Kenya: Lake Nakuru Rhino Sanctuary, Lake Naivasha & Maasai Mara National Reserve + Flight Kisumu to Entebbe
- Days 14-25 Uganda: Mabamba Shoebill Canoe, Jinja Source of the Nile, Sipi Falls, Pian Upe, Karamoja, Kidepo Valley NP + Private Charter Flight Kidepo to Murchison Falls NP, Kibale Chimpanzees ($250 UWA permit), Queen Elizabeth Ishasha Tree-Climbing Lions & Bwindi Mountain Gorillas ($800 UWA permit)
- Days 26-32 Rwanda: Volcanoes NP Golden Monkeys, Lake Kivu Boat Cruise, Nyungwe Chimpanzees & Suspended Canopy Walkway, Kigali Memorial & Akagera Big-Five Safari.`
      );
    } else {
      setProviderName('Tingatinga Safaris (Enganda Member)');
      setFileName('Tingatinga_10_Day_Serengeti_Mara_Bwindi_Gorilla_Circuit.pdf');
      setDocumentText(
        `OPERATOR: Tingatinga Safaris (Accredited Enganda Member Tour Operator)
PACKAGE: 10-Day Tingatinga East Africa Icons: Serengeti, Maasai Mara & Bwindi Mountain Gorillas
SEASON WINDOW: January – October 2027 (10 Days / 9 Nights)
COUNTRIES: Tanzania • Kenya • Uganda (Operated by Enganda Member Guides)
TARIFF & PRICING BRIEF:
- 3 Nights Serengeti & Ngorongoro Crater (Tanzania) with TANAPA park & crater descent fees
- 3 Nights Maasai Mara National Reserve (Kenya) with KWS reserve fees & regional bush link to Entebbe
- 3 Nights Bwindi Impenetrable National Park & Lake Mutanda (Uganda) including official $800 UWA Mountain Gorilla Trekking Permit
- Private 4x4 Pop-Up Roof Land Cruisers, Full-Board Luxury Tented Camps & Named Enganda Member Specialist Daniel Tumusiime
- Target Per-Person Package Price: $6,850 USD per person (6 spots available)`
      );
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!documentText.trim() && !fileBase64.trim()) {
      setErrorMessage('Please upload a document file or load/paste a safari package brief first.');
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);
    setPublishedSuccess(null);

    try {
      const response = await fetch('/api/packages/extract-from-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          fileBase64,
          mimeType,
          fileName: fileName || 'service-provider-package.pdf',
          providerName,
          targetPlacement,
        }),
      });

      if (!response.ok) {
        throw new Error(`Extraction service returned status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.packageData) {
        setPreparedPackage(data.packageData);
        setPricingAuditNote(
          data.pricingAuditNote ||
            'Package structured and priced using verified East African park, lodge, and UWA/TANAPA/KWS/RDB permit tariffs.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to analyze document at this moment.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePublishToLiveDatabase = () => {
    if (!preparedPackage) return;
    addPackageEvent({
      ...preparedPackage,
      placement: targetPlacement,
      operatorName: providerName,
    });
    setPublishedSuccess(
      `Published "${preparedPackage.title}" ($${preparedPackage.pricePerPersonUSD.toLocaleString()} USD/person) to the live Firestore database (/safari_events). Clients can now view and pay for this package directly.`
    );
  };

  return (
    <div className="bg-white border border-[#E4DCCF] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E4DCCF] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#226B3E] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
            <span>Approved Service Provider • AI Document-to-Package &amp; Pricing Engine</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1612] mt-0.5">
            Upload Safari Document &amp; Prepare Live Priced Package
          </h3>
          <p className="text-xs text-[#5A5248] mt-0.5">
            Upload a PDF, image, or text itinerary brief. Our AI pricing engine extracts the East African route, verifies permit &amp; lodge pricing, and publishes the package directly to the live Firestore database for direct client payment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadSampleProviderDocument('tingatinga-east-africa')}
            className="px-3 py-1.5 rounded-md bg-[#F3ECE1] hover:bg-[#E4DCCF] text-[#1A1612] text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            Load Tingatinga 10-Day East Africa Brief
          </button>
          <button
            type="button"
            onClick={() => loadSampleProviderDocument('shuma-32-day')}
            className="px-3 py-1.5 rounded-md bg-[#226B3E]/10 hover:bg-[#226B3E]/20 text-[#226B3E] text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            Load 32-Day Grand Safari PDF Brief ($18,079/pp)
          </button>
        </div>
      </div>

      {/* Step 1: Provider Metadata & File Upload */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#1A1612] mb-1">
            Approved Enganda Member / Service Provider
          </label>
          <select
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1612]"
          >
            {TOUR_OPERATORS.map((op) => (
              <option key={op.id} value={`${op.name} (Enganda Member)`}>
                {op.name} — {op.countriesCovered.join(', ')}
              </option>
            ))}
            <option value="Approved East Africa Partner Lodge">
              Approved East Africa Partner Lodge
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1612] mb-1">
            Live Catalog Placement
          </label>
          <select
            value={targetPlacement}
            onChange={(e) => setTargetPlacement(e.target.value as EventDisplayPlacement)}
            className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1612]"
          >
            <option value="both">Hero Carousel + Upcoming East Africa Programs</option>
            <option value="carousel">Homepage Hero Carousel Only</option>
            <option value="upcoming">Upcoming Safari Programs Grid Only</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1612] mb-1">
            Upload Document (PDF, TXT, CSV, Image)
          </label>
          <label className="flex items-center justify-center gap-2 w-full bg-[#FAF7F2] hover:bg-[#F3ECE1] border border-dashed border-[#226B3E] rounded-md px-3 py-2 text-xs font-semibold text-[#226B3E] cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-[#C85A28]" />
            <span className="truncate">
              {fileName ? fileName : 'Choose PDF / Document File...'}
            </span>
            <input
              type="file"
              accept=".pdf,.txt,.md,.csv,.json,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Document Brief Textarea */}
      <div>
        <label className="block text-xs font-semibold text-[#1A1612] mb-1">
          Document Content / Safari Tariff &amp; Route Brief (Editable before AI Analysis)
        </label>
        <textarea
          rows={4}
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder="Upload a PDF/text document above or paste your East African itinerary brief, park inclusions, and tariff notes here..."
          className="w-full bg-[#FAF7F2] border border-[#E4DCCF] rounded-md p-3 text-xs font-mono text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleAnalyzeWithAI}
          disabled={analyzing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#226B3E] hover:bg-[#194E2D] disabled:opacity-60 text-[#FAF7F2] text-xs font-semibold transition-colors shadow-xs cursor-pointer"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D99B26]" />
              <span>Analyzing Document &amp; Calculating East African Pricing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#D99B26]" />
              <span>Prepare Package &amp; Right Pricing with AI</span>
            </>
          )}
        </button>

        {errorMessage && (
          <span className="text-xs font-medium text-[#B91C1C]">{errorMessage}</span>
        )}
      </div>

      {/* Step 2: Review & Edit AI-Prepared Package before Publishing to Live Firestore */}
      {preparedPackage && (
        <div className="bg-[#FAF7F2] border border-[#226B3E]/30 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DCCF] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#226B3E] font-bold">
                AI-Prepared Package &amp; Verified Pricing Ready for Review
              </span>
              <h4 className="font-serif text-lg font-bold text-[#1A1612]">
                {preparedPackage.title}
              </h4>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#226B3E] text-white font-mono text-xs font-bold">
              <DollarSign className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>{formatPrice(preparedPackage.pricePerPersonUSD)} / person</span>
            </div>
          </div>

          {pricingAuditNote && (
            <div className="p-3 rounded-md bg-[#226B3E]/10 border border-[#226B3E]/25 text-xs text-[#1A1612]">
              <strong className="text-[#226B3E] font-mono uppercase text-[11px]">
                Pricing Actuary Audit:{' '}
              </strong>
              <span>{pricingAuditNote}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#5A5248] mb-1">
                Package Title
              </label>
              <input
                type="text"
                value={preparedPackage.title}
                onChange={(e) =>
                  setPreparedPackage({ ...preparedPackage, title: e.target.value })
                }
                className="w-full bg-white border border-[#E4DCCF] rounded px-3 py-1.5 text-xs font-semibold text-[#1A1612]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A5248] mb-1">
                Verified Price Per Person (USD)
              </label>
              <input
                type="number"
                value={preparedPackage.pricePerPersonUSD}
                onChange={(e) =>
                  setPreparedPackage({
                    ...preparedPackage,
                    pricePerPersonUSD: Math.max(100, Number(e.target.value) || 0),
                  })
                }
                className="w-full bg-white border border-[#E4DCCF] rounded px-3 py-1.5 text-xs font-mono font-bold text-[#226B3E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A5248] mb-1">
                Duration Label
              </label>
              <input
                type="text"
                value={preparedPackage.durationLabel}
                onChange={(e) =>
                  setPreparedPackage({ ...preparedPackage, durationLabel: e.target.value })
                }
                className="w-full bg-white border border-[#E4DCCF] rounded px-3 py-1.5 text-xs text-[#1A1612]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A5248] mb-1">
                East African Countries / Locations
              </label>
              <input
                type="text"
                value={preparedPackage.location}
                onChange={(e) =>
                  setPreparedPackage({ ...preparedPackage, location: e.target.value })
                }
                className="w-full bg-white border border-[#E4DCCF] rounded px-3 py-1.5 text-xs text-[#1A1612]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A5248] mb-1">
                Date Window
              </label>
              <input
                type="text"
                value={preparedPackage.dateWindow}
                onChange={(e) =>
                  setPreparedPackage({ ...preparedPackage, dateWindow: e.target.value })
                }
                className="w-full bg-white border border-[#E4DCCF] rounded px-3 py-1.5 text-xs text-[#1A1612]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A5248] mb-1">
                Lead Enganda Member Guide
              </label>
              <select
                value={preparedPackage.leadGuideSlug}
                onChange={(e) =>
                  setPreparedPackage({ ...preparedPackage, leadGuideSlug: e.target.value })
                }
                className="w-full bg-white border border-[#E4DCCF] rounded px-3 py-1.5 text-xs text-[#1A1612]"
              >
                {GUIDES.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name} ({g.homeRegion})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A5248] mb-1">
                Shared Google Drive Photo
              </label>
              <select
                value={preparedPackage.heroImage}
                onChange={(e) =>
                  setPreparedPackage({ ...preparedPackage, heroImage: e.target.value })
                }
                className="w-full bg-white border border-[#E4DCCF] rounded px-3 py-1.5 text-xs text-[#1A1612]"
              >
                {SHARED_DRIVE_MEDIA_VAULT.map((photo) => (
                  <option key={photo.id} value={photo.url}>
                    {photo.title} ({photo.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5A5248] mb-1">
              Package Subtitle &amp; Inclusions Summary
            </label>
            <input
              type="text"
              value={preparedPackage.subtitle}
              onChange={(e) =>
                setPreparedPackage({ ...preparedPackage, subtitle: e.target.value })
              }
              className="w-full bg-white border border-[#E4DCCF] rounded px-3 py-1.5 text-xs text-[#1A1612]"
            />
          </div>

          {preparedPackage.dayByDaySummary && preparedPackage.dayByDaySummary.length > 0 && (
            <div className="bg-white border border-[#E4DCCF] rounded-md p-3 space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#C85A28] font-semibold">
                Extracted Route &amp; Day-by-Day Highlights
              </div>
              <ul className="text-xs text-[#5A5248] space-y-1 list-disc list-inside">
                {preparedPackage.dayByDaySummary.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handlePublishToLiveDatabase}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C85A28] hover:bg-[#A8481D] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Publish Package &amp; Pricing to Live Firestore Database</span>
            </button>

            {publishedSuccess && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#226B3E]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{publishedSuccess}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
