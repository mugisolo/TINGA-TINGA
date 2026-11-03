import React, { useEffect } from 'react';

const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=85';
const DEFAULT_OG_IMAGE_ALT =
  'Mountain Gorilla in Bwindi Impenetrable National Park, Uganda — Enganda Safaris';
const SITE_NAME = 'Enganda Safaris';

export interface SEOProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  canonicalPath?: string;
  keywords?: string[];
  priceAmount?: number;
  priceCurrency?: string;
  availability?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  canonicalPath,
  keywords,
  priceAmount,
  priceCurrency = 'USD',
  availability = 'instock',
  jsonLd,
}) => {
  useEffect(() => {
    const fullTitle = title.includes('Enganda Safaris')
      ? title
      : `${title} | Enganda Safaris Uganda`;
    const resolvedOgTitle = ogTitle || fullTitle;
    const resolvedOgDescription = ogDescription || description;

    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://engandasafaris.com';
    const pathname =
      canonicalPath ||
      (typeof window !== 'undefined' ? window.location.pathname : '/');
    const canonicalUrl = `${origin}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

    document.title = fullTitle;

    const upsertMetaByName = (name: string, content: string) => {
      let el = document.head.querySelector(
        `meta[name="${name}"]`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const upsertMetaByProperty = (property: string, content: string) => {
      let el = document.head.querySelector(
        `meta[property="${property}"]`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeMetaByProperty = (property: string) => {
      const el = document.head.querySelector(`meta[property="${property}"]`);
      if (el) {
        el.remove();
      }
    };

    // Standard SEO Meta
    upsertMetaByName('description', description);
    if (keywords && keywords.length > 0) {
      upsertMetaByName('keywords', keywords.join(', '));
    }

    // OpenGraph Meta Tags
    upsertMetaByProperty('og:site_name', SITE_NAME);
    upsertMetaByProperty('og:type', ogType);
    upsertMetaByProperty('og:title', resolvedOgTitle);
    upsertMetaByProperty('og:description', resolvedOgDescription);
    upsertMetaByProperty('og:url', canonicalUrl);
    upsertMetaByProperty('og:image', ogImage);
    upsertMetaByProperty('og:image:alt', ogImageAlt);
    upsertMetaByProperty('og:image:width', '1200');
    upsertMetaByProperty('og:image:height', '630');
    upsertMetaByProperty('og:locale', 'en_US');

    // Product / Safari Package specific OpenGraph tags
    if (typeof priceAmount === 'number') {
      upsertMetaByProperty('product:price:amount', String(priceAmount));
      upsertMetaByProperty('product:price:currency', priceCurrency);
      upsertMetaByProperty('product:availability', availability);
      upsertMetaByProperty('product:brand', SITE_NAME);
    } else {
      removeMetaByProperty('product:price:amount');
      removeMetaByProperty('product:price:currency');
      removeMetaByProperty('product:availability');
      removeMetaByProperty('product:brand');
    }

    // Twitter / X Card Meta Tags
    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:site', '@engandasafaris');
    upsertMetaByName('twitter:title', resolvedOgTitle);
    upsertMetaByName('twitter:description', resolvedOgDescription);
    upsertMetaByName('twitter:image', ogImage);
    upsertMetaByName('twitter:image:alt', ogImageAlt);

    // Canonical Link Tag
    let canonicalEl = document.head.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // Dynamic JSON-LD script in <head>
    const scriptId = 'enganda-dynamic-jsonld';
    let scriptEl = document.head.querySelector(
      `script#${scriptId}`
    ) as HTMLScriptElement | null;

    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [
    title,
    description,
    ogTitle,
    ogDescription,
    ogType,
    ogImage,
    ogImageAlt,
    canonicalPath,
    keywords,
    priceAmount,
    priceCurrency,
    availability,
    jsonLd,
  ]);

  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
