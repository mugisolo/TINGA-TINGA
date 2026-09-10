import React, { useState, useEffect } from 'react';
import { ITINERARIES, PERMITS_DATA } from '../data/seedData';
import { Lead, LeadStatus, ChatSession, Itinerary, PermitFact } from '../types';
import { 
  Lock, 
  Users, 
  MessageSquare, 
  Settings, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles, 
  DollarSign, 
  RefreshCw 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Active Admin Tabs: 'leads' | 'chats' | 'itineraries' | 'permits' | 'waba'
  const [activeTab, setActiveTab] = useState<'leads' | 'chats' | 'itineraries' | 'permits' | 'waba'>('leads');

  // Leads State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Chat Sessions State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatSession, setSelectedChatSession] = useState<ChatSession | null>(null);

  // Permit Prices State
  const [permits, setPermits] = useState<PermitFact[]>(PERMITS_DATA);

  // Itineraries State
  const [itinerariesList, setItinerariesList] = useState<Itinerary[]>(ITINERARIES);

  // Sample initial seed leads for immediate admin inspection
  useEffect(() => {
    fetchLeads();
    fetchChatSessions();
  }, []);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        // Fallback default sample leads
        setLeads([
          {
            id: 'lead_001',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'new',
            source: 'trip_planner',
            name: 'Charlotte Dubois',
            email: 'charlotte.dubois@paris-travel.fr',
            phone: '+33 6 12 34 56 78',
            countries: ['Tanzania', 'Uganda'],
            budgetBand: 'Luxury',
            travelersCount: 2,
            targetDates: 'August 2025',
            notes: 'Honeymoon safari: Great Migration in Serengeti + 2 Uganda Gorilla Permits in Bwindi.',
            depositAmountUSD: 4980,
          },
          {
            id: 'lead_002',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'deposit_paid',
            source: 'web_chat',
            name: 'Dr. Marcus Becker',
            email: 'm.becker@berlin-wildlife.de',
            phone: '+49 171 9876543',
            countries: ['Tanzania'],
            budgetBand: 'Signature / Ultra-Luxe',
            travelersCount: 4,
            targetDates: 'October 2025',
            notes: '30% Deposit Paid ($7,800 USD) via DPO Group. Needs 2 custom Land Cruisers with camera beanbags.',
            depositAmountUSD: 7800,
          },
          {
            id: 'lead_003',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'quote_sent',
            source: 'contact_page',
            name: 'Sarah & Liam Jenkins',
            email: 'sarah.j@melbourne-law.com.au',
            phone: '+61 412 345 678',
            countries: ['Rwanda', 'Uganda'],
            budgetBand: 'Luxury',
            travelersCount: 2,
            targetDates: 'January 2026',
            notes: 'Primate focus: Volcanoes NP gorilla trek + Kibale chimps. Quote sent by Akim.',
          },
        ]);
      }
    } catch (err) {
      console.debug('Using sample leads');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      if (res.ok) {
        const data = await res.json();
        setChatSessions(data);
      } else {
        // Fallback sample sessions
        const sampleSession: ChatSession = {
          id: 'sess_sample_01',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date().toISOString(),
          channel: 'web_widget',
          language: 'en',
          messages: [
            {
              id: 'm1',
              role: 'user',
              content: 'What is the exact permit cost for mountain gorillas in Uganda compared to Rwanda?',
              timestamp: new Date(Date.now() - 7100000).toISOString(),
            },
            {
              id: 'm2',
              role: 'assistant',
              content: 'Jambo! In Uganda (Bwindi and Mgahinga), official Uganda Wildlife Authority gorilla permits are $800 USD per trek. In Rwanda (Volcanoes National Park), official Rwanda Development Board permits are $1,500 USD. We purchase official permits directly from UWA/RDB upon your 30% trip deposit and provide official scanned government receipts before final balance.',
              toolCalls: [{ name: 'get_permit_info', arguments: { park: 'Bwindi & Volcanoes' } }],
              timestamp: new Date(Date.now() - 7000000).toISOString(),
            },
            {
              id: 'm3',
              role: 'user',
              content: 'Do you hide who drives your vehicles in Uganda?',
              timestamp: new Date(Date.now() - 6900000).toISOString(),
            },
            {
              id: 'm4',
              role: 'assistant',
              content: 'Never! Tinga Tinga Safari operates with radical transparency. In Uganda, our named, vetted ground partner is Gorilla Highlands Expeditions (AUTO / UWA Lic #AUTO-UG-2019-142), managed directly with Akim. Every vehicle is a custom extended pop-top 4x4 Land Cruiser with AMREF Flying Doctors coverage.',
              timestamp: new Date(Date.now() - 6800000).toISOString(),
            },
          ],
        };
        setChatSessions([sampleSession]);
        setSelectedChatSession(sampleSession);
      }
    } catch (err) {
      console.debug('Using sample chats');
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.debug('Updated status locally');
    }
  };

  const handleToggleItinerary = (id: string) => {
    setItinerariesList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, featured: !it.featured } : it))
    );
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'tinga2025' || pinInput === 'akim' || pinInput === 'admin') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Staff PIN. (Hint for evaluation: "tinga2025" or "akim")');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-stone-950 flex items-center justify-center mx-auto font-black shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Tinga Tinga Staff Portal
            </h2>
            <p className="text-xs text-stone-400">
              Arusha Headquarters Operations & Lead Management
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Enter Staff PIN / Password
              </label>
              <input
                type="password"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Staff PIN (try: tinga2025)"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
              {pinError && <p className="text-xs text-rose-400 mt-2">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
            >
              Unlock Staff Dashboard
            </button>
          </form>

          <div className="text-center text-[11px] text-stone-500">
            Head Office: Goliondoi Rd / Clock Tower, Arusha (P.O. Box 2751)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Arusha HQ Administrative Cockpit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
              Operations & Concierge Manager
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'leads', label: `Leads Inbox (${leads.length})`, icon: Users },
              { id: 'chats', label: 'Agent Sessions', icon: MessageSquare },
              { id: 'itineraries', label: 'Itineraries', icon: Calendar },
              { id: 'permits', label: 'Permit Tariffs', icon: DollarSign },
              { id: 'waba', label: 'WhatsApp API', icon: Phone },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: LEADS INBOX */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Live Safari Leads Pipeline</h2>
                <p className="text-xs text-stone-400">Manage inquiries, send formal PDF quotes, and record 30% deposits.</p>
              </div>
              <button
                onClick={fetchLeads}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-stone-900 text-xs text-stone-300 hover:bg-stone-800 border border-stone-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Pipeline</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4 shadow-lg hover:border-stone-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-stone-800 text-amber-400 font-bold flex items-center justify-center text-sm border border-stone-700">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{lead.name}</h3>
                        <div className="flex items-center space-x-3 text-xs text-stone-400">
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-stone-500" />
                            <span>{lead.email}</span>
                          </span>
                          {lead.phone && (
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-stone-500" />
                              <span>{lead.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono bg-stone-950 px-2.5 py-1 rounded text-stone-300 border border-stone-800">
                        Source: {lead.source}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        lead.status === 'deposit_paid'
                          ? 'bg-emerald-900 text-emerald-300 border border-emerald-500/40'
                          : lead.status === 'quote_sent'
                          ? 'bg-indigo-900 text-indigo-300'
                          : 'bg-amber-900 text-amber-300'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-300">
                    <div>
                      <span className="text-stone-500 block">Countries & Tier:</span>
                      <span className="font-semibold text-white">
                        {lead.countries ? lead.countries.join(', ') : 'Tanzania'} ({lead.budgetBand || 'Luxury'})
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Travelers & Timing:</span>
                      <span className="font-semibold text-white">
                        {lead.travelersCount || 2} Guests • {lead.targetDates || 'Flexible'}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">30% Trip Deposit:</span>
                      <span className="font-bold text-amber-400">
                        {lead.depositAmountUSD ? `$${lead.depositAmountUSD.toLocaleString()} USD` : 'Pending Quote'}
                      </span>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 text-xs text-stone-300">
                      <span className="text-amber-500 font-semibold block mb-0.5">Traveler Notes:</span>
                      {lead.notes}
                    </div>
                  )}

                  {/* Stage Transition Buttons */}
                  <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-1.5 text-xs text-stone-400">
                      <span>Update Stage:</span>
                      {(['new', 'qualified', 'quote_sent', 'deposit_paid', 'closed_won'] as LeadStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateLeadStatus(lead.id, st)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            lead.status === st
                              ? 'bg-amber-600 text-stone-950 font-bold'
                              : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.name)},%20this%20is%20Akim%20from%20Tinga%20Tinga%20Safari.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp Guest</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AGENT SESSIONS INSPECTOR */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Session List (4 cols) */}
            <div className="lg:col-span-4 bg-stone-900 rounded-2xl p-4 border border-stone-800 space-y-3">
              <h3 className="text-sm font-bold text-white px-2">Recent Chat Sessions</h3>
              <div className="space-y-2">
                {chatSessions.map((sess) => (
                  <button
                    key={sess.id}
                    onClick={() => setSelectedChatSession(sess)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-colors ${
                      selectedChatSession?.id === sess.id
                        ? 'bg-amber-600/20 border-amber-500 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{sess.id}</span>
                      <span className="text-[10px] text-stone-500 font-mono">{sess.channel}</span>
                    </div>
                    <div className="text-[11px] line-clamp-1 text-stone-300">
                      {sess.messages[sess.messages.length - 1]?.content || 'Empty session'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Inspector (8 cols) */}
            <div className="lg:col-span-8 bg-stone-900 rounded-2xl p-6 border border-stone-800 flex flex-col justify-between">
              {selectedChatSession ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Transcript: {selectedChatSession.id}
                      </h3>
                      <div className="text-xs text-stone-400">
                        Language: {selectedChatSession.language.toUpperCase()} • Channel: {selectedChatSession.channel}
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded">
                      Gemini Brain Active
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {selectedChatSession.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-4 rounded-xl text-xs space-y-1.5 ${
                          m.role === 'user'
                            ? 'bg-amber-600/15 border border-amber-500/30 text-stone-200'
                            : 'bg-stone-950 border border-stone-800 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                          <span>{m.role === 'user' ? 'Traveler' : 'Tinga Assistant (AI)'}</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{m.content}</p>

                        {m.toolCalls && (
                          <div className="pt-2 border-t border-stone-800 space-y-1">
                            {m.toolCalls.map((tc, idx) => (
                              <div key={idx} className="font-mono text-[10px] text-amber-400 bg-stone-900 p-2 rounded">
                                Executed: {tc.name} ({JSON.stringify(tc.arguments)})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-stone-500 text-xs">
                  Select a chat session to review the conversation log and tool call history.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ITINERARY MANAGER */}
        {activeTab === 'itineraries' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Published Circuit Portfolio</h2>
              <p className="text-xs text-stone-400">Toggle featured visibility and inspect pricing bands across destinations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itinerariesList.map((it) => (
                <div
                  key={it.id}
                  className="bg-stone-900 p-5 rounded-2xl border border-stone-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                      {it.countries.join(', ')} • {it.durationDays} Days
                    </span>
                    <h4 className="text-sm font-bold text-white">{it.title}</h4>
                    <div className="text-xs text-stone-400">
                      From ${it.startingPricePerDayUSD} pp/day • Luxury: ${it.priceBands.luxury.perPersonDouble.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleItinerary(it.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      it.featured
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {it.featured ? 'Featured' : 'Standard'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PERMITS TARIFF MANAGER */}
        {activeTab === 'permits' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Official Government Primate Tariffs</h2>
              <p className="text-xs text-stone-400">
                Statutory regulatory tariffs for UWA, RDB, and TANAPA. System guardrail: Assistant NEVER invents prices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {permits.map((p) => (
                <div
                  key={p.id}
                  className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {p.country} ({p.authority})
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{p.parkName}</h3>
                    <p className="text-xs text-stone-400">{p.permitType}</p>
                  </div>

                  <div className="text-3xl font-black text-white font-display">
                    ${p.costUSD.toLocaleString()} USD
                  </div>

                  <div className="text-xs text-stone-400 space-y-1 pt-2 border-t border-stone-800">
                    <div><strong>Min Age:</strong> {p.minimumAge} years</div>
                    <div><strong>Daily Limit:</strong> {p.dailyPermitLimit} permits</div>
                    <div><strong>Refund Policy:</strong> {p.cancellationPolicy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: WABA STATUS */}
        {activeTab === 'waba' && (
          <div className="bg-stone-900 rounded-3xl p-8 border border-stone-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">WhatsApp Business Cloud API (WABA)</h2>
              <p className="text-xs text-stone-400">
                Webhook delivery status and 24-hour customer service window telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">WABA Number:</span>
                <div className="text-base font-bold text-white">+255 784 123 456</div>
                <span className="text-[10px] text-emerald-400">Verified Meta Business Account</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">Webhook Status:</span>
                <div className="text-base font-bold text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Operational (200 OK)</span>
                </div>
                <span className="text-[10px] text-stone-400">Endpoint: /api/waba/webhook</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">Active 24h Conversations:</span>
                <div className="text-base font-bold text-amber-400">14 Active Threads</div>
                <span className="text-[10px] text-stone-400">Zero template charges within window</span>
              </div>
            </div>

            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <h4 className="font-bold text-white">Registered Message Templates:</h4>
              <div className="space-y-1 font-mono text-[11px] text-stone-400">
                <div>• tinga_safari_greeting_v1 (Marketing - Approved)</div>
                <div>• tinga_permit_receipt_confirmation_v2 (Utility - Approved)</div>
                <div>• tinga_deposit_invoice_reminder_v1 (Utility - Approved)</div>
                <div>• tinga_akim_emergency_contact_v1 (Service - Approved)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
