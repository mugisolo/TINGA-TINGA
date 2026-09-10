import React from 'react';
import { BookOpen, Clock, Calendar, ArrowRight, Camera, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const JournalPage: React.FC = () => {
  const articles = [
    {
      id: 'mara-river-crossings',
      title: 'Mara River Crossings: Decoding the Northern Serengeti from July to October',
      category: 'Wildlife Migration',
      date: 'Field Note • August 2024',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80',
      excerpt: 'Why wildebeest hesitate for hours at Kogatende crossing points, how to position Land Cruisers without blocking herd exits, and why midday heat triggers the greatest plunges.',
      author: 'Akim Mmari, Founder',
    },
    {
      id: 'bwindi-habituation-experience',
      title: 'The Gorilla Habituation Experience in Bwindi: 4 Hours with Researchers',
      category: 'Primate Expeditions',
      date: 'Field Note • June 2024',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e12?w=800&auto=format&fit=crop&q=80',
      excerpt: 'Standard gorilla permits grant 60 minutes. Rushaga’s $1,500 habituation permit allows 4 full hours alongside UWA rangers and primatologists gently acclimating a wild silverback group.',
      author: 'Akim Mmari & Denis Mugisha',
    },
    {
      id: 'ndutu-calving-season',
      title: 'Ndutu Calving Season: 8,000 Wildebeest Born Daily on the Short-Grass Plains',
      category: 'Predator Ecology',
      date: 'Field Note • February 2024',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80',
      excerpt: 'Between January and March, the southern Serengeti explodes with new life—and the highest concentration of cheetah hunts and lion prides in Africa. Why off-road driving permits matter here.',
      author: 'Akim Mmari',
    },
    {
      id: 'photography-safari-gear',
      title: 'Safari Photography Gear: Lenses, Dust Protection, and Pop-Top Hatch Technique',
      category: 'Photography Technique',
      date: 'Field Note • November 2023',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800&auto=format&fit=crop&q=80',
      excerpt: 'A 100-400mm zoom lens vs. a 600mm prime: which is best in a pop-top Land Cruiser? How we outfit our safari vehicles with custom window beanbags and dual 220V inverter charging strips.',
      author: 'Akim Mmari',
    },
  ];

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Field Dispatches from Arusha</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-display">
            The Safari Field Journal
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            In-depth dispatches from the bush: wildlife migration mechanics, primate conservation, camera craft, and honest travel advice written directly by our naturalist team.
          </p>
        </div>

        {/* Featured Story */}
        <div className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl grid grid-cols-1 md:grid-cols-12 group">
          <div className="md:col-span-6 relative aspect-[16/10] md:aspect-auto overflow-hidden bg-stone-950">
            <img
              src={articles[0].image}
              alt={articles[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 bg-amber-600 text-stone-950 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              Featured Dispatch
            </div>
          </div>

          <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs text-stone-400">
                <span className="text-amber-400 font-semibold">{articles[0].category}</span>
                <span>•</span>
                <span>{articles[0].readTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-white font-display group-hover:text-amber-400 transition-colors">
                {articles[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {articles[0].excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400">By {articles[0].author}</span>
              <Link
                to="/trip-planner"
                className="text-amber-400 font-bold hover:underline flex items-center space-x-1"
              >
                <span>Plan Migration Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Other Field Dispatches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(1).map((art) => (
            <div
              key={art.id}
              className="bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-stone-700 flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden bg-stone-950 relative">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-stone-900/90 text-amber-400 text-[10px] font-semibold border border-stone-700">
                    {art.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] text-stone-400 flex items-center space-x-2">
                    <span>{art.date}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-stone-800/80 mt-2 flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[11px]">{art.author}</span>
                <Link
                  to="/trip-planner"
                  className="text-amber-400 font-semibold hover:underline"
                >
                  Plan Safari →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
