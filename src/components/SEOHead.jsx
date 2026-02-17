import { useEffect } from 'react';

/**
 * SEOHead - Actualiza meta tags dinamicamente por página
 * Usa document.head directamente (sem dependências externas)
 */
const SEO_DEFAULTS = {
  title: 'SETE ECOS - Sistema de Transmutação Feminina',
  description: 'Sete caminhos para despertar cada dimensão da tua essência feminina. Uma jornada completa de transformação.',
  image: 'https://app.seteecos.com/og-image.png',
  url: 'https://app.seteecos.com/',
  type: 'website'
};

function setMetaTag(property, content, isName = false) {
  const attr = isName ? 'name' : 'property';
  let tag = document.querySelector(`meta[${attr}="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd
}) {
  useEffect(() => {
    const t = title || SEO_DEFAULTS.title;
    const d = description || SEO_DEFAULTS.description;
    const img = image || SEO_DEFAULTS.image;
    const u = url || SEO_DEFAULTS.url;

    // Titulo
    document.title = t;

    // Meta description
    setMetaTag('description', d, true);

    // Open Graph
    setMetaTag('og:title', t);
    setMetaTag('og:description', d);
    setMetaTag('og:image', img);
    setMetaTag('og:url', u);
    setMetaTag('og:type', type);

    // Twitter
    setMetaTag('twitter:title', t, true);
    setMetaTag('twitter:description', d, true);
    setMetaTag('twitter:image', img, true);

    // Canonical
    setCanonical(u);

    // JSON-LD
    if (jsonLd) {
      let script = document.querySelector('script[data-seo-jsonld]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup
    return () => {
      document.title = SEO_DEFAULTS.title;
      const script = document.querySelector('script[data-seo-jsonld]');
      if (script) script.remove();
    };
  }, [title, description, image, url, type, jsonLd]);

  return null;
}
