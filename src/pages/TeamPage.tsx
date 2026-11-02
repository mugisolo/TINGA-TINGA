import React from 'react';
import { TEAM_MEMBERS } from '../data/seedData';
import { Compass, Award, Globe, MessageCircle, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamPage: React.FC = () => {
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Compass className="w-3.5 h-3.5" />
            <span>The People Behind the Craft</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display">
            Meet Our Arusha Team & Naturalist Guides
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            We are a tight, dedicated boutique operation headquartered in Arusha, Tanzania (P.O. Box 2751). Led by founder Akim Mmari, our team combines decades of deep East African bush expertise with fluent multi-lingual fluency.
          </p>
        </div>

        {/* Founder Spotlight */}
        <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 border border-stone-800 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <div className="rounded-2xl overflow-hidden aspect-[4/5] border-2 border-amber-500/40 shadow-xl relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
                  alt="Akim Mmari - Founder Ganda Safaris"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-stone-950/90 backdrop-blur-sm border border-stone-800 text-[11px] text-stone-300">
                  <span className="font-bold text-amber-400 block">Akim Mmari</span>
                  Founder & Principal Safari Architect
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Born and Raised in Arusha, Tanzania</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                "We Build Safaris We Would Take Our Own Families On."
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                "After fifteen years guiding international expeditions through the Serengeti, Ngorongoro, and the Ugandan rain forests, I founded Ganda Safaris to strip away the impersonal brokerages and generic itineraries that dominate modern travel."
              </p>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                "When you write to us, you are speaking directly to someone who knows the dust of the Ndutu plains and the smell of the Bwindi canopy. I stay on WhatsApp 24/7 for every single guest until they are safely through the departure gates."
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs text-stone-300">
                <span className="px-3 py-1 rounded-full bg-stone-950 border border-stone-800">
                  Languages: English, Kiswahili, French
                </span>
                <span className="px-3 py-1 rounded-full bg-stone-950 border border-stone-800">
                  Field Experience: 16+ Years
                </span>
              </div>

              <div className="pt-3">
                <a
                  href="https://wa.me/255784123456?text=Hello%20Akim,%20I%20would%20love%20to%20connect%20about%20a%20safari."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reach Akim on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white font-display text-center">
            Our Core Staff & Senior Naturalists
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-4 flex flex-col justify-between hover:border-stone-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/40">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{member.name}</h4>
                    <p className="text-xs text-amber-400 font-semibold">{member.role}</p>
                    <p className="text-[11px] text-stone-500">Based in {member.location}</p>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-stone-800 text-[11px] text-stone-400">
                  <div className="flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-stone-400" />
                    <span><strong>Languages:</strong> {member.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span><strong>Expertise:</strong> {member.specialties.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-6">
          <Link
            to="/trip-planner"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
          >
            <span>Plan Your Journey with Akim & Our Team</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
