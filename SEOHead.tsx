import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  product?: Product;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  image, 
  product 
}) => {
  const { settings, currentPage } = useApp();

  const siteTitle = title 
    ? `${title} | Mahalakshmi Creation` 
    : (settings.metaTitle || 'Mahalakshmi Creation | Royal Hand Embroidery & Luxury Ethnic Couture');

  const siteDescription = description 
    || product?.description 
    || settings.metaDescription 
    || 'Premium Indian hand embroidery, Zardozi necklines, Bridal lehengas & export-quality ethnic panels manufactured in Ahmedabad.';

  const siteImage = image || product?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200';
  const canonicalUrl = window.location.href;

  useEffect(() => {
    // 1. Title
    document.title = siteTitle;

    // Helper to update meta tag
    const updateMeta = (nameAttr: string, attrValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // 2. Standard Meta
    updateMeta('name', 'description', siteDescription);
    updateMeta('name', 'keywords', 'Mahalakshmi Creation, Hand Embroidery, Zardozi, Bridal Lehenga, Mirror Work, Ethnic Couture, Wholesale Embroidery India, Neck Embroidery');

    // 3. Open Graph
    updateMeta('property', 'og:title', siteTitle);
    updateMeta('property', 'og:description', siteDescription);
    updateMeta('property', 'og:image', siteImage);
    updateMeta('property', 'og:url', canonicalUrl);
    updateMeta('property', 'og:type', product ? 'product' : 'website');
    updateMeta('property', 'og:site_name', settings.brandName || 'Mahalakshmi Creation');

    // 4. Twitter Card
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', siteTitle);
    updateMeta('name', 'twitter:description', siteDescription);
    updateMeta('name', 'twitter:image', siteImage);

    // 5. Schema.org JSON-LD
    let schemaData: any = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": settings.brandName || "Mahalakshmi Creation",
      "url": "https://mahalakshmicreation.com",
      "logo": siteImage,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": settings.phone || "+91 98765 12345",
        "contactType": "customer service",
        "areaServed": "Worldwide",
        "availableLanguage": ["English", "Hindi", "Gujarati"]
      }
    };

    if (product) {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.title,
        "image": product.images,
        "description": product.description,
        "sku": product.sku,
        "brand": {
          "@type": "Brand",
          "name": "Mahalakshmi Creation"
        },
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl,
          "priceCurrency": "INR",
          "price": product.price,
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition"
        }
      };
    }

    let scriptTag = document.getElementById('schema-jsonld') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);

  }, [siteTitle, siteDescription, siteImage, canonicalUrl, product, settings]);

  return null;
};
