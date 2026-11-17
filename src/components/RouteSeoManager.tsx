import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { EXPERIENCES, GUIDES, BRAND_NAME, drivePhotoUrl } from '../data/seedData';

export interface RouteSeoMetadata {
  title: string;
  description: string;
  keywords: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  schemaType?: string;
}

const DEFAULT_OG_IMAGE = drivePhotoUrl('1LwS0m-x4TsmxpgBaeByqmJkI-e_UPjiE');

export const STATIC_ROUTE_SEO_MAP: Record<string, RouteSeoMetadata> = {
  '/': {
    title: 'WildLife Safaris | Uganda Gorilla Trekking & Local Safari Guides',
    description:
      'Book private Uganda safaris led by named, UTB-licensed local guides with Enganda / WildLife Safaris, Tingatinga Safaris, and Shuma Africa Safaris.',
    keywords:
      'Uganda safari, Bwindi gorilla trekking, Tingatinga Safaris, Enganda Safaris, Shuma Africa Safaris, Uganda safari guides, Kibale chimpanzee tracking, Murchison Falls safari, Kidepo Valley tours, UWA gorilla permits',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    schemaType: 'TravelAgency',
  },
  '/experiences': {
    title: 'Uganda Safari Experiences & Gorilla Trekking Tours | WildLife Safaris',
    description:
      'Explore curated 1-to-10-day Uganda safari experiences: Bwindi mountain gorilla treks, Kibale chimpanzees, Queen Elizabeth tree-climbing lions, and Kidepo Valley circuits.',
    keywords:
      'Uganda safari packages, 3-day Bwindi gorilla trek, 5-day gorillas and chimps, 7-day best of Uganda safari, 10-day Kidepo grand circuit, Mabamba shoebill tour, private 4x4 Uganda tours',
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  '/guides': {
    title: 'Meet Our Licensed Ugandan Safari Guides & Specialists | WildLife Safaris',
    description:
      'Browse profiles of UTB-licensed Ugandan safari guides, primate trackers, and ornithology specialists. Book your specific named guide directly from our Entebbe desk.',
    keywords:
      'Ugandan safari guides, UTB licensed guides Uganda, Bwindi gorilla guide, Uganda birding guide, French speaking safari guide Uganda, German speaking safari guide Uganda',
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  '/partners': {
    title: 'Verified Uganda Safari Lodges, Eco-Camps & Hotels | WildLife Safaris',
    description:
      'Discover vetted partner safari lodges, tented wilderness camps, and regional hotels across Bwindi, Kibale, Queen Elizabeth, Murchison Falls, Kidepo, and Entebbe.',
    keywords:
      'Uganda safari lodges, Bwindi eco lodges, Queen Elizabeth NP tented camps, Entebbe airport hotels, Kidepo safari camp, Uganda accommodation booking',
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  '/destinations': {
    title: 'Uganda National Parks & Safari Destinations Guide | WildLife Safaris',
    description:
      'Complete field guide to Uganda’s national parks: Bwindi Impenetrable Forest, Kibale, Queen Elizabeth, Murchison Falls, Kidepo Valley, Rwenzori Mountains, and Mabamba Swamp.',
    keywords:
      'Uganda national parks, Bwindi Impenetrable National Park, Kibale National Park, Queen Elizabeth National Park, Murchison Falls, Kidepo Valley, Lake Bunyonyi, Mabamba Swamp',
    ogType: 'website',
    schemaType: 'TouristDestination',
  },
  '/trip-planner': {
    title: 'Custom Uganda Safari Trip Planner & Cost Estimator | WildLife Safaris',
    description:
      'Design your custom Uganda gorilla and wildlife safari in minutes. Calculate official UWA permit costs, match with a specialist guide, and lock in your 30% deposit.',
    keywords:
      'custom Uganda safari planner, Uganda safari cost calculator, Bwindi gorilla permit booking, tailor-made Uganda itinerary, private Uganda safari quote',
    ogType: 'website',
    schemaType: 'WebApplication',
  },
  '/wallet': {
    title: 'Safari Wallet & Official UWA Gorilla Permit Escrow | WildLife Safaris',
    description:
      'Manage your Uganda safari funds, lock $800 Bwindi gorilla and $250 Kibale chimpanzee permits in UWA escrow, and book partner safari lodges with multi-currency support.',
    keywords:
      'UWA gorilla permit escrow, Uganda Wildlife Authority permit cost, Safari Wallet Uganda, MTN Mobile Money safari payment, Uganda gorilla permit receipt',
    ogType: 'website',
    schemaType: 'FinancialProduct',
  },
  '/safari-essentials': {
    title: 'Uganda Gorilla Trekking & Safari Packing Checklist | WildLife Safaris',
    description:
      'Interactive packing and readiness checklist for Bwindi gorilla trekking, savannah game drives, chimpanzee tracking, and Uganda Yellow Fever & e-Visa entry requirements.',
    keywords:
      'gorilla trekking packing list, what to pack for Uganda safari, Bwindi hiking gear, Uganda Yellow Fever certificate, Uganda tourist e-Visa checklist',
    ogType: 'article',
    schemaType: 'HowTo',
  },
  '/how-we-work': {
    title: 'How We Work & 2026/2027 UWA Permit Tariffs | WildLife Safaris',
    description:
      'Learn how our Entebbe operations desk procures official Uganda Wildlife Authority permits, assigns named 4x4 Land Cruiser guides, and guarantees 12-hour confirmation.',
    keywords:
      'how to book Uganda gorilla permits, UWA tariff 2026 2027, Entebbe safari coordination, private 4x4 Land Cruiser Uganda, AUTO member tour operator',
    ogType: 'website',
    schemaType: 'FAQPage',
  },
  '/reviews': {
    title: 'Verified Guest Reviews & Uganda Safari Testimonials | WildLife Safaris',
    description:
      'Read verified traveler reviews of our Ugandan safari guides across Bwindi gorilla treks, Mabamba Shoebill birding, Kibale chimpanzee tracking, and Kidepo expeditions.',
    keywords:
      'Uganda safari reviews, WildLife Safaris reviews, Enganda Safaris testimonials, Bwindi gorilla trek guest stories, best Uganda tour operator reviews',
    ogType: 'website',
    schemaType: 'CollectionPage',
  },
  '/journal': {
    title: 'Uganda Field Notes, Birding & Conservation Journal | WildLife Safaris',
    description:
      'Field dispatches written by our Ugandan guides: Bwindi gorilla habituation insights, Albertine Rift birding checklists, UWA permit tips, and seasonal travel updates.',
    keywords:
      'Uganda safari blog, Bwindi gorilla trekking tips, Mabamba Shoebill field notes, best time to visit Uganda for gorillas, Albertine Rift endemics birding',
    ogType: 'article',
    schemaType: 'Blog',
  },
  '/responsible-travel': {
    title: 'Conservation Ethics & Community Revenue Sharing | WildLife Safaris',
    description:
      'How your Uganda safari directly funds UWA ranger patrols, Batwa and Karamojong community initiatives, porter welfare, and low-impact eco-lodge conservation.',
    keywords:
      'sustainable safari Uganda, UWA community revenue sharing, Bwindi porter association, ethical gorilla trekking rules, eco tourism Uganda',
    ogType: 'website',
    schemaType: 'WebPage',
  },
  '/about': {
    title: 'About Our Ugandan Guide Collective in Entebbe | WildLife Safaris',
    description:
      'Founded by veteran Ugandan field guides on Mugwanya Road, Bugonga, Entebbe — 5 minutes from Entebbe International Airport. UTB licensed and AUTO accredited.',
    keywords:
      'about WildLife Safaris Uganda, Entebbe safari company, local Ugandan owned tour operator, UTB licensed safari operator, Bugonga Entebbe head office',
    ogType: 'website',
    schemaType: 'AboutPage',
  },
  '/contact': {
    title: 'Contact Our Entebbe Safari Desk | WildLife Safaris Uganda',
    description:
      'Reach our Entebbe safari coordination desk via WhatsApp, email, or in person on Mugwanya Road, Bugonga (5 mins from EBB Airport). 12-hour UWA permit & lodge availability.',
    keywords:
      'contact Uganda safari operator, Entebbe safari office address, Uganda gorilla trek inquiry, WhatsApp Uganda safari guide',
    ogType: 'website',
    schemaType: 'ContactPage',
  },
  '/portals': {
    title: 'Role Portals: Client, Specialist, Partner, Staff & Admin | WildLife Safaris',
    description:
      'Access the multi-role operational portals for Clients, UTB Field Specialists, Partner Safari Lodges, Entebbe Operations Staff, and Executive Admin Governance.',
    keywords:
      'safari client portal, Uganda guide dispatch portal, partner lodge allocation portal, safari admin dashboard',
    ogType: 'website',
    schemaType: 'WebApplication',
  },
};

function setOrUpdateMetaTag(
  attrName: 'name' | 'property',
  attrValue: string,
  content: string
) {
  let element = document.querySelector(
    `meta[${attrName}="${attrValue}"]`
  ) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function resolveRouteSeo(pathname: string): RouteSeoMetadata {
  const cleanPath =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  if (STATIC_ROUTE_SEO_MAP[cleanPath]) {
    return STATIC_ROUTE_SEO_MAP[cleanPath];
  }

  // Dynamic Experience Detail Route: /experiences/:slug
  if (cleanPath.startsWith('/experiences/')) {
    const slug = cleanPath.replace('/experiences/', '');
    const exp = EXPERIENCES.find((e) => e.slug === slug);
    if (exp) {
      const lowestPrice = exp.priceBands[0]?.perPersonUSD || 1650;
      return {
        title: `${exp.title} (${exp.durationDays} Days) | WildLife Safaris Uganda`,
        description: `${exp.subtitle}. ${exp.durationDays}-day private Uganda safari across ${exp.regions.join(
          ', '
        )} from $${lowestPrice}/person including official UWA permits & 4x4 Land Cruiser.`,
        keywords: `${exp.title}, ${exp.regions.join(
          ', '
        )}, ${exp.interests.join(', ')}, Uganda safari itinerary, Bwindi gorilla permit`,
        ogType: 'article',
        ogImage: exp.heroImage,
        schemaType: 'TouristTrip',
      };
    }
  }

  // Dynamic Guide Profile Route: /guides/:slug
  if (cleanPath.startsWith('/guides/')) {
    const slug = cleanPath.replace('/guides/', '');
    const guide = GUIDES.find((g) => g.slug === slug);
    if (guide) {
      return {
        title: `${guide.name} – ${guide.homeRegion} Safari Specialist | WildLife Safaris`,
        description: `Book Ugandan specialist guide ${guide.name} (${
          guide.yearsExperience
        } yrs experience, ${guide.rating.toFixed(1)}★). "${
          guide.tagline
        }" Speaks ${guide.languages.join(', ')}.`,
        keywords: `${guide.name}, Uganda safari guide, ${guide.homeRegion}, ${guide.specialties.join(
          ', '
        )}, ${guide.languages.join(' guide, ')} guide`,
        ogType: 'profile',
        ogImage: guide.photo,
        schemaType: 'Person',
      };
    }
  }

  // Dynamic Portal Route: /portals/:role or /portal/:role
  if (cleanPath.startsWith('/portals/') || cleanPath.startsWith('/portal/')) {
    const roleSlug = cleanPath.split('/')[2] || 'client';
    const roleTitle =
      roleSlug.charAt(0).toUpperCase() + roleSlug.slice(1).toLowerCase();
    return {
      title: `${roleTitle} Portal Workspace | WildLife Safaris Uganda`,
      description: `Role-based ${roleTitle} Portal for managing Uganda safari itineraries, UWA permit escrow holds, field guide dispatches, and homepage events.`,
      keywords: `Uganda safari ${roleSlug} portal, UWA permit escrow, safari operations workspace`,
      ogType: 'website',
      schemaType: 'WebApplication',
    };
  }

  return STATIC_ROUTE_SEO_MAP['/'];
}

export const RouteSeoManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const seo = resolveRouteSeo(location.pathname);
    const canonicalUrl = `${window.location.origin}${location.pathname}`;
    const imageUrl = seo.ogImage || DEFAULT_OG_IMAGE;

    // 1. Update Document Title
    document.title = seo.title;

    // 2. Standard Meta Tags
    setOrUpdateMetaTag('name', 'description', seo.description);
    setOrUpdateMetaTag('name', 'keywords', seo.keywords);

    // 3. OpenGraph Tags
    setOrUpdateMetaTag('property', 'og:title', seo.title);
    setOrUpdateMetaTag('property', 'og:description', seo.description);
    setOrUpdateMetaTag('property', 'og:type', seo.ogType || 'website');
    setOrUpdateMetaTag('property', 'og:url', canonicalUrl);
    setOrUpdateMetaTag('property', 'og:site_name', 'WildLife Safaris');
    setOrUpdateMetaTag('property', 'og:image', imageUrl);

    // 4. Twitter Card Tags
    setOrUpdateMetaTag('name', 'twitter:card', 'summary_large_image');
    setOrUpdateMetaTag('name', 'twitter:title', seo.title);
    setOrUpdateMetaTag('name', 'twitter:description', seo.description);
    setOrUpdateMetaTag('name', 'twitter:image', imageUrl);

    // 5. Canonical Link
    let canonicalLink = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. Dynamic Route-Specific Schema.org JSON-LD
    let ldScript = document.getElementById(
      'dynamic-route-schema-ld'
    ) as HTMLScriptElement | null;
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'dynamic-route-schema-ld';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': seo.schemaType || 'WebPage',
      name: seo.title,
      description: seo.description,
      url: canonicalUrl,
      image: imageUrl,
      provider: {
        '@type': 'TravelAgency',
        name: BRAND_NAME,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Mugwanya Road, Bugonga',
          addressLocality: 'Entebbe',
          addressCountry: 'UG',
        },
      },
    };
    ldScript.textContent = JSON.stringify(structuredData);
  }, [location.pathname]);

  return null;
};
