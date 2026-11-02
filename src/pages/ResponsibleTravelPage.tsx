import React from 'react';
import { Heart, ShieldCheck, TreePine, Users, Droplet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResponsibleTravelPage: React.FC = () => {
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Heart className="w-3.5 h-3.5" />
            <span>Ethical Tourism Standard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display">
            Responsible Travel & Community Charter
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            True luxury in Africa is defined by dignity, conservation stewardship, and fair community partnership. Here is how Ganda Safaris puts ethics into practice every day.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="space-y-6">
          {/* Pillar 1: Fair Guide & Porter Wages */}
          <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-3">
            <div className="flex items-center space-x-3 text-amber-400 font-bold text-lg font-display">
              <Users className="w-6 h-6" />
              <span>1. 100% Fair Guide & Porter Living Wages</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              In low-cost budget safari agencies, guides and porters often receive zero baseline wage, forced to rely exclusively on discretionary guest tips to survive.
            </p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              At Ganda Safaris, every naturalist guide and driver receives a premier guaranteed daily salary, comprehensive AMREF health evacuation insurance, and full accommodations in driver quarters. Tips are welcomed as a token of excellence, never as a substitute for fair compensation.
            </p>
          </div>

          {/* Pillar 2: AMREF Flying Doctors */}
          <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-3">
            <div className="flex items-center space-x-3 text-amber-400 font-bold text-lg font-display">
              <ShieldCheck className="w-6 h-6" />
              <span>2. Guaranteed AMREF Flying Doctors Evacuation</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Every guest traveling on a Ganda Safaris circuit is automatically enrolled in AMREF Flying Doctors emergency medical evacuation cover. In the unlikely event of sudden illness or trauma in remote bush locations (such as the northern Serengeti or Bwindi rainforest), a dedicated air ambulance with emergency medical personnel is dispatched immediately to airlift you to premier trauma centers in Nairobi or Dar es Salaam.
            </p>
          </div>

          {/* Pillar 3: Plastic-Free Wilderness & Leave-No-Trace */}
          <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-3">
            <div className="flex items-center space-x-3 text-amber-400 font-bold text-lg font-display">
              <TreePine className="w-6 h-6" />
              <span>3. Plastic Elimination & Leave-No-Trace Operations</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              We provide insulated stainless steel water flasks to all guests upon arrival at Kilimanjaro (JRO) or Entebbe (EBB). Our Land Cruisers are outfitted with 20-liter purified mineral water dispensers, eliminating thousands of single-use plastic bottles annually. Both Tanzania and Rwanda enforce total bans on single-use plastic bags.
            </p>
          </div>

          {/* Pillar 4: Karatu & Bwindi School Initiatives */}
          <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-3">
            <div className="flex items-center space-x-3 text-amber-400 font-bold text-lg font-display">
              <Droplet className="w-6 h-6" />
              <span>4. Grassroots Community Partnerships</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              We partner directly with the Ganako Primary School in Karatu (near Ngorongoro) and the Ride 4 a Woman community cooperative in Buhoma (Uganda). A portion of our company profits directly funds school supplies, solar lighting, and clean rainwater harvesting cisterns. Guests wishing to pack educational materials can participate in our vetted Pack-for-a-Purpose program.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/trip-planner"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
          >
            <span>Plan an Ethical Safari with Akim</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
