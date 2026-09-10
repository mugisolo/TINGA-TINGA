import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ITINERARIES, GROUND_PARTNERS } from '../data/seedData';
import { Currency, DestinationCountry } from '../types';
import { ItineraryCard } from '../components/ItineraryCard';
import { MapPin, ShieldCheck, Sparkles, Calendar, ArrowRight, Compass } from 'lucide-react';

interface DestinationDetailPageProps {
  currency: Currency;
}

const DESTINATION_PROFILES: Record<string, {
  name: DestinationCountry;
  title: string;
  tagline: string;
  heroImage: string;
  overview: string;
  bestMonths: string;
  signatureSpecies: string[];
  permitFact: string;
}> = {
  tanzania: {
    name: 'Tanzania',
    title: 'Tanzania: The Great Plains, Calderas & Coral Atolls',
    tagline: 'Home of the Great Migration, Ngorongoro Crater, and Mount Kilimanjaro',
    heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&auto=format&fit=crop&q=80',
    overview: 'Tanzania offers the most expansive protected wilderness on earth. From the legendary short-grass plains of the Serengeti to the primeval amphitheater of Ngorongoro and the secluded elephant havens of Tarangire and Ruaha.',
    bestMonths: 'Year-Round (Jul–Oct for Mara River crossings; Jan–Mar for Ndutu calving)',
    signatureSpecies: ['Black-maned Lions', 'Cheetahs', 'Wildebeest', 'Leopards', 'African Elephants'],
    permitFact: 'TANAPA park entry fees included in all quotes. No special primate permits needed unless visiting Mahale/Gombe chimps.',
  },
  uganda: {
    name: 'Uganda',
    title: 'Uganda: The Primate Kingdom & Rwenzori Foothills',
    tagline: 'Bwindi Impenetrable Mountain Gorillas, Kibale Chimpanzees & Murchison Falls',
    heroImage: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e12?w=1600&auto=format&fit=crop&q=80',
    overview: 'Where the East African savannah collides with the West African rainforest. Uganda holds over 50% of the world’s surviving mountain gorillas in Bwindi, alongside 13 primate species in Kibale Forest and tree-climbing lions in Ishasha.',
    bestMonths: 'June to September & December to February (drier forest trails)',
    signatureSpecies: ['Mountain Gorillas', 'Chimpanzees', 'Tree-Climbing Lions', 'Shoebill Stork'],
    permitFact: 'Official UWA Gorilla Permit: $800 USD. Habituation Experience (4 hours): $1,500 USD. Minimum age 15.',
  },
  rwanda: {
    name: 'Rwanda',
    title: 'Rwanda: Land of a Thousand Mist-Shrouded Hills',
    tagline: 'Volcanoes National Park, Golden Monkeys & High-End Luxury Lodges',
    heroImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&auto=format&fit=crop&q=80',
    overview: 'Clean, safe, and breathtakingly dramatic. Rwanda offers Africa’s most accessible high-altitude mountain gorilla trekking on the bamboo slopes of the Virunga Volcanoes, just 2.5 hours from Kigali International Airport.',
    bestMonths: 'June to October & December to March',
    signatureSpecies: ['Mountain Gorillas', 'Golden Monkeys', 'Giant Forest Hogs', 'Virunga Endemic Birds'],
    permitFact: 'Official RDB Gorilla Permit: $1,500 USD. Golden Monkey Permit: $100 USD. High-season luxury circuit.',
  },
  kenya: {
    name: 'Kenya',
    title: 'Kenya: The Cradle of Safari & Maasai Mara Savannahs',
    tagline: 'Maasai Mara Big Cats, Amboseli Kilimanjaro Vistas & Samburu Semi-Arid North',
    heroImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=1600&auto=format&fit=crop&q=80',
    overview: 'Kenya is the birthplace of the modern wildlife safari. Experience exceptional predator density in the Maasai Mara, colossal tuskers with Mount Kilimanjaro backgrounds in Amboseli, and rare northern species in Samburu.',
    bestMonths: 'July to October (Great Migration) & January to March',
    signatureSpecies: ['Cheetah Coalitions', 'Big Tuskers', 'Reticulated Giraffes', 'Grevy’s Zebra'],
    permitFact: 'Maasai Mara Conservation fees ($100–$200/day) included in all private circuit bookings.',
  },
};

export const DestinationDetailPage: React.FC<DestinationDetailPageProps> = ({ currency }) => {
  const { country } = useParams<{ country: string }>();
  const profileKey = (country || 'tanzania').toLowerCase();
  const profile = DESTINATION_PROFILES[profileKey] || DESTINATION_PROFILES.tanzania;

  const relevantItineraries = ITINERARIES.filter((it) =>
    it.countries.includes(profile.name)
  );

  const partner = GROUND_PARTNERS.find((p) => p.country === profile.name) || GROUND_PARTNERS[0];

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen pb-20">
      {/* Hero */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden bg-stone-900">
        <img
          src={profile.heroImage}
          alt={profile.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30"></div>

        <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-600 text-stone-950 shadow-md">
            Destination Focus
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display mt-3 leading-tight">
            {profile.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-2xl font-light">
            {profile.tagline}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Overview & Key Facts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-4">
            <h2 className="text-xl font-bold text-white font-display">Wilderness Character & Ecology</h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {profile.overview}
            </p>

            <div className="pt-4 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <strong className="text-amber-400 block font-semibold mb-1">Optimal Season:</strong>
                <span className="text-stone-300">{profile.bestMonths}</span>
              </div>
              <div>
                <strong className="text-amber-400 block font-semibold mb-1">Key Wildlife:</strong>
                <span className="text-stone-300">{profile.signatureSpecies.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Ground Partner & Permits</span>
            </div>
            <div className="text-xs text-stone-300 space-y-2">
              <p>
                <strong>Vetted Partner:</strong> {partner.partnerName} ({partner.accreditationBody} Lic #{partner.licenseNumber})
              </p>
              <p>
                <strong>Regulatory Rules:</strong> {profile.permitFact}
              </p>
            </div>
            <Link
              to="/trip-planner"
              className="block w-full text-center py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Plan {profile.name} Safari
            </Link>
          </div>
        </div>

        {/* Itineraries */}
        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-1">
              Curated Circuits
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Featured Safaris in {profile.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relevantItineraries.map((it) => (
              <ItineraryCard key={it.id} itinerary={it} currency={currency} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
