import {
  GUIDES,
  EXPERIENCES,
  PERMIT_FACTS,
  PERMIT_FACTS_VERIFIED_NOTE,
  PERMIT_RECEIPT_GUARANTEE,
  AVAILABILITY_PROMISE,
  WHATSAPP_NUMBER,
  CONTACT_EMAIL,
  HQ_ADDRESS,
} from '../data/seedData';
import { Lead, ComfortTier } from '../types';

export function executeConciergeTool(
  name: string,
  args: Record<string, any>,
  onCreateLead?: (lead: Lead) => void
): Record<string, any> {
  switch (name) {
    case 'match_guide': {
      const interest = (args.interest || '').toLowerCase();
      const region = (args.region || '').toLowerCase();
      const language = (args.language || '').toLowerCase();

      let matches = GUIDES.filter((g) => {
        const matchInterest =
          !interest ||
          g.specialties.some((s) => s.toLowerCase().includes(interest)) ||
          g.bio.toLowerCase().includes(interest) ||
          g.tagline.toLowerCase().includes(interest);
        const matchRegion =
          !region ||
          g.homeRegion.toLowerCase().includes(region) ||
          g.regionsCovered.some((r) => r.toLowerCase().includes(region));
        const matchLang =
          !language ||
          g.languages.some((l) => l.toLowerCase().includes(language));
        return matchInterest && matchRegion && matchLang;
      });

      if (matches.length === 0) {
        matches = GUIDES.slice(0, 3);
      }

      return {
        matchedCount: matches.length,
        guides: matches.slice(0, 3).map((g) => ({
          name: g.name,
          slug: g.slug,
          homeRegion: g.homeRegion,
          tagline: g.tagline,
          specialties: g.specialties,
          languages: g.languages,
          yearsExperience: g.yearsExperience,
          rating: g.rating,
          profileUrl: `/guides/${g.slug}`,
        })),
      };
    }

    case 'search_experiences': {
      const maxDays = args.maxDays ? Number(args.maxDays) : undefined;
      const interest = (args.interest || '').toLowerCase();
      const region = (args.region || '').toLowerCase();

      let matches = EXPERIENCES.filter((exp) => {
        const matchDays = !maxDays || exp.durationDays <= maxDays;
        const matchInterest =
          !interest ||
          exp.interests.some((i) => i.toLowerCase().includes(interest)) ||
          exp.title.toLowerCase().includes(interest) ||
          exp.summary.toLowerCase().includes(interest);
        const matchRegion =
          !region ||
          exp.region.toLowerCase().includes(region) ||
          exp.regions.some((r) => r.toLowerCase().includes(region));
        return matchDays && matchInterest && matchRegion;
      });

      if (matches.length === 0) {
        matches = EXPERIENCES.slice(0, 3);
      }

      return {
        count: matches.length,
        experiences: matches.slice(0, 3).map((e) => ({
          title: e.title,
          slug: e.slug,
          durationDays: e.durationDays,
          region: e.region,
          startingUSD: e.priceBands[0]?.perPersonUSD,
          recommendedGuides: e.recommendedGuides,
          url: `/experiences/${e.slug}`,
        })),
      };
    }

    case 'get_permit_info': {
      const query = (args.parkOrSpecies || '').toLowerCase();
      const filtered = PERMIT_FACTS.filter(
        (p) =>
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.park.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
      );
      return {
        verifiedNote: PERMIT_FACTS_VERIFIED_NOTE,
        receiptGuarantee: PERMIT_RECEIPT_GUARANTEE,
        permits: filtered.length > 0 ? filtered : PERMIT_FACTS,
      };
    }

    case 'build_custom_quote': {
      const days = Math.max(1, Number(args.days) || 5);
      const partySize = Math.max(1, Number(args.partySize) || 2);
      const tier = ((args.comfortTier || 'luxury').toLowerCase() as ComfortTier);
      const includeGorillas = args.includeGorillas !== false;
      const includeChimps = Boolean(args.includeChimps);

      const baseDailyPerPerson =
        tier === 'mid-range' ? 390 : tier === 'signature' ? 890 : 590;
      const permitAddOn = (includeGorillas ? 800 : 0) + (includeChimps ? 250 : 0);
      const lowEstimate = days * baseDailyPerPerson + permitAddOn;
      const highEstimate = Math.round(lowEstimate * 1.18);

      return {
        days,
        partySize,
        comfortTier: tier,
        indicativePerPersonBandUSD: `US$${lowEstimate.toLocaleString()} – US$${highEstimate.toLocaleString()} per person`,
        inclusionsSummary:
          'Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional Enganda guide, full-board lodges, park entrance fees, and specified UWA permits.',
        approvalNote:
          'Indicative price band only. Every final quote is confirmed by an Enganda coordinator in Entebbe within 12 hours.',
      };
    }

    case 'create_lead': {
      const newLead: Lead = {
        id: 'eng_lead_' + Date.now(),
        name: args.name || 'Safari Guest',
        email: args.email || '',
        whatsapp: args.whatsapp || '',
        partySize: Number(args.partySize) || 2,
        targetDates: args.targetDates || 'Flexible 2026/2027',
        budgetTier: (args.budgetTier as ComfortTier) || 'luxury',
        interests: Array.isArray(args.interests) ? args.interests : ['gorillas'],
        preferredGuideSlug: args.preferredGuideSlug,
        experienceSlug: args.experienceSlug,
        notes: args.notes || 'Submitted via Enganda Guide Matcher Concierge',
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      if (onCreateLead) {
        onCreateLead(newLead);
      }
      return {
        success: true,
        leadId: newLead.id,
        message: `Thank you, ${newLead.name}. Our Entebbe coordination team has received your inquiry. ${AVAILABILITY_PROMISE}`,
      };
    }

    case 'check_availability': {
      return {
        liveAvailabilityClaimed: false,
        datesRequested: args.dates || 'Requested dates',
        promise: AVAILABILITY_PROMISE,
        permitGuarantee: PERMIT_RECEIPT_GUARANTEE,
      };
    }

    case 'handoff_to_human': {
      return {
        handoff: true,
        office: HQ_ADDRESS,
        whatsapp: WHATSAPP_NUMBER,
        email: CONTACT_EMAIL,
        reason: args.reason || 'Direct coordinator & guide consultation',
        promise: 'A real Enganda coordinator in Entebbe replies within 12 hours (often immediately on WhatsApp during East Africa Time hours).',
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export function generateRuleBasedConciergeReply(
  message: string,
  onCreateLead?: (lead: Lead) => void
): {
  reply: string;
  toolCalls: { name: string; arguments: Record<string, any>; result: any }[];
} {
  const lower = (message || '').toLowerCase();
  const toolCalls: { name: string; arguments: Record<string, any>; result: any }[] = [];

  if (lower.includes('permit') || lower.includes('2027') || lower.includes('tariff') || lower.includes('habituation')) {
    const res = executeConciergeTool('get_permit_info', { parkOrSpecies: '' });
    toolCalls.push({ name: 'get_permit_info', arguments: {}, result: res });
    return {
      reply:
        `Here are the official Uganda Wildlife Authority (UWA) primate permit tariffs (${PERMIT_FACTS_VERIFIED_NOTE}):\n\n` +
        `• **Bwindi & Mgahinga Gorilla Trekking:** **US$800** per person (or **US$600** in low season: April, May & November — strictly date-fixed and non-reschedulable). Minimum age 15; max 8 guests per family.\n` +
        `• **Bwindi Gorilla Habituation (Rushaga):** **US$1,500** per person (rising to **US$1,800 from 1 January 2027**). 4 hours with researchers; max 4 guests.\n` +
        `• **Kibale Chimpanzee Tracking:** **US$250** per person (**US$200** low season Apr/May/Nov 2026), rising to **US$300 from 1 January 2027**. Minimum age 12.\n` +
        `• **Kibale Chimpanzee Habituation:** **US$300** per person, rising to **US$400 from 1 January 2027**.\n` +
        `• **Kyambura Gorge Chimp Tracking:** **US$100** per person, rising to **US$200 from 1 January 2027**.\n\n` +
        `${PERMIT_RECEIPT_GUARANTEE} ${AVAILABILITY_PROMISE}`,
      toolCalls,
    };
  }

  if (
    lower.includes('match') ||
    lower.includes('guide') ||
    lower.includes('who') ||
    lower.includes('bird') ||
    lower.includes('shoebill') ||
    lower.includes('photo') ||
    lower.includes('kidepo') ||
    lower.includes('rwenzori')
  ) {
    let interest = '';
    if (lower.includes('bird') || lower.includes('shoebill')) interest = 'birding';
    else if (lower.includes('chimp')) interest = 'chimps';
    else if (lower.includes('photo')) interest = 'photography';
    else if (lower.includes('hike') || lower.includes('rwenzori')) interest = 'hiking';
    else if (lower.includes('culture') || lower.includes('community')) interest = 'culture';
    else if (lower.includes('kidepo') || lower.includes('murchison') || lower.includes('lion')) interest = 'big-game';
    else interest = 'gorillas';

    const res = executeConciergeTool('match_guide', { interest });
    toolCalls.push({ name: 'match_guide', arguments: { interest }, result: res });

    const topGuides = res.guides
      .map(
        (g: any) =>
          `• **${g.name}** (*${g.homeRegion}*, ${g.yearsExperience} yrs experience) — ${g.tagline} Speaks: ${g.languages.join(', ')}.`
      )
      .join('\n');

    return {
      reply:
        `As the Enganda AI Concierge, I would love to introduce you to our Ugandan guides best matched to your interests:\n\n${topGuides}\n\n` +
        `Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional guide from arrival in Entebbe to departure. Would you like to request one of these guides for your dates?`,
      toolCalls,
    };
  }

  if (lower.includes('whatsapp') || lower.includes('human') || lower.includes('coordinator') || lower.includes('office') || lower.includes('entebbe')) {
    const res = executeConciergeTool('handoff_to_human', { reason: 'Guest requested human coordinator' }, onCreateLead);
    toolCalls.push({ name: 'handoff_to_human', arguments: { reason: 'Guest requested human coordinator' }, result: res });
    return {
      reply:
        `You can reach our Entebbe coordination team directly on WhatsApp at **${WHATSAPP_NUMBER}** or by email at **${CONTACT_EMAIL}**.\n\n` +
        `Our head office is at **${HQ_ADDRESS}** — just 5 minutes from Entebbe International Airport. ${AVAILABILITY_PROMISE}`,
      toolCalls,
    };
  }

  if (lower.includes('available') || lower.includes('availability') || lower.includes('dates')) {
    const res = executeConciergeTool('check_availability', { dates: message });
    toolCalls.push({ name: 'check_availability', arguments: { dates: message }, result: res });
    return {
      reply:
        `${AVAILABILITY_PROMISE}\n\n` +
        `Once you share your preferred travel window and party size, our Entebbe desk checks directly with UWA for your gorilla/chimpanzee permit slots and matches your named Ugandan guide.`,
      toolCalls,
    };
  }

  if (lower.includes('7-day') || lower.includes('7 day') || lower.includes('plan') || lower.includes('quote') || lower.includes('price') || lower.includes('cost')) {
    const expRes = executeConciergeTool('search_experiences', { maxDays: 7 });
    const quoteRes = executeConciergeTool('build_custom_quote', {
      days: 7,
      partySize: 2,
      comfortTier: 'luxury',
      includeGorillas: true,
      includeChimps: true,
    });
    toolCalls.push(
      { name: 'search_experiences', arguments: { maxDays: 7 }, result: expRes },
      { name: 'build_custom_quote', arguments: { days: 7, comfortTier: 'luxury' }, result: quoteRes }
    );

    return {
      reply:
        `For a 7-day Uganda journey, our signature circuit is the **7-Day Best of Uganda: Murchison Falls, Kibale, Queen Elizabeth & Bwindi**, typically led by **Daniel Tumusiime**, **Robert Mugisha**, or **Samuel Kato**.\n\n` +
        `• **Indicative Price Band (Luxury Tier, incl. US$800 Gorilla & US$250 Chimp Permits):** ${quoteRes.indicativePerPersonBandUSD}\n` +
        `• **Mid-Range Tier:** Starting from **US$3,690 per person**\n` +
        `• **Inclusions:** Your safari includes a private 4x4 Land Cruiser with pop-up roof, driven by your professional guide, full-board lodges, park fees, and airport meet & greet in Entebbe.\n\n` +
        `${AVAILABILITY_PROMISE} Would you like to customize this in our Trip Planner or chat with our Entebbe team on WhatsApp?`,
      toolCalls,
    };
  }

  // Default helpful response combining guide match and experiences
  const guideRes = executeConciergeTool('match_guide', {});
  const expRes = executeConciergeTool('search_experiences', {});
  toolCalls.push(
    { name: 'match_guide', arguments: {}, result: guideRes },
    { name: 'search_experiences', arguments: {}, result: expRes }
  );

  return {
    reply:
      `Oli otya! I am the Enganda AI Concierge. At Enganda Safaris, **the guide is the product** — you travel with a named, licensed Ugandan guide who calls these landscapes home.\n\n` +
      `Here are three ways I can help right now:\n` +
      `1. **Match you with a Ugandan guide** — such as **Samuel Kato** (Bwindi gorillas), **Grace Namukasa** (Kibale chimpanzees), **David Ssekandi** (Mabamba Shoebill & birding), or **Moses Okello** (Kidepo Valley).\n` +
      `2. **Explore our Uganda experiences** — from the *1-Day Mabamba Shoebill Excursion* and *3-Day Bwindi Gorilla Trek* to the *10-Day Uganda Grand Circuit incl. Kidepo*.\n` +
      `3. **Explain verified UWA permit tariffs** — including US$600 low-season gorilla permits (April, May, November) and 1 January 2027 UWA tariff updates.\n\n` +
      `Tell me what wildlife or regions excite you most, and I will match your guide!`,
    toolCalls,
  };
}
