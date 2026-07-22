import { Product, CategoryItem, CollectionItem, GalleryItem, VideoShowcaseItem, HeroBanner, CustomerReview, WebsiteSettings, CustomerInquiry, Order } from '../types';

export const INITIAL_SETTINGS: WebsiteSettings = {
  brandName: "Mahalakshmi Creation",
  tagline: "Haute Couture Luxury Embroidery & Artisanal Craftsmanship",
  email: "info@mahalakshmicreation.com",
  phone: "+91 98765 43210",
  whatsappNumber: "+919876543210",
  address: "Plot 108, Textile Elegance Hub, Ring Road",
  cityCountry: "Surat, Gujarat - India 395002",
  businessHours: "Mon - Sat: 10:00 AM - 8:00 PM IST",
  announcementText: "✨ Global Priority Express Shipping Available Across USA, UK, UAE & Worldwide | Contact for Custom Embroidery Orders",
  showAnnouncement: true,
  instagramUrl: "https://instagram.com/mahalakshmicreation_official",
  facebookUrl: "https://facebook.com/mahalakshmicreation.couture",
  pinterestUrl: "https://pinterest.com/mahalakshmicreation",
  youtubeUrl: "https://youtube.com/@mahalakshmicreation",
  metaTitle: "Mahalakshmi Creation | Luxury Embroidery, Bridal Couture & Handwork Designs",
  metaDescription: "Discover exquisite hand and machine embroidery, bridal lehengas, neck embroidery, zari work, mirror work, and international haute couture collections by Mahalakshmi Creation.",
  currencySymbol: "₹",
  currencyCode: "INR"
};

export const INITIAL_HERO_BANNERS: HeroBanner[] = [
  {
    id: "hero-1",
    tag: "HAUTE COUTURE 2026",
    title: "Royal Heritage Embroidery",
    subtitle: "Exquisite hand-carved Zardozi, Kashmiri Tilla & Royal Zari work crafted for timeless magnificence.",
    ctaText: "Explore Bridal Collection",
    ctaLink: "bridal",
    secondaryCtaText: "WhatsApp Inquiry",
    secondaryCtaLink: "whatsapp",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1920&auto=format&fit=crop",
    active: true
  },
  {
    id: "hero-2",
    tag: "INTERNATIONAL COUTURE",
    title: "Opulent Arabic & Gulf Floral Designs",
    subtitle: "Precision-engineered machine and hand embroidery adorned with crystals and delicate sequin borders.",
    ctaText: "View International Collection",
    ctaLink: "international",
    secondaryCtaText: "Request Custom Design",
    secondaryCtaLink: "contact",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1920&auto=format&fit=crop",
    active: true
  },
  {
    id: "hero-3",
    tag: "LUXURY CREATION",
    title: "Masterpiece Neck & Panel Embroidery",
    subtitle: "Intricate cutwork, mirror brilliance, and bespoke embellishments engineered for regal apparel.",
    ctaText: "Explore Luxury Line",
    ctaLink: "luxury",
    secondaryCtaText: "View Gallery",
    secondaryCtaLink: "gallery",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1920&auto=format&fit=crop",
    active: true
  }
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Neck Embroidery",
    description: "Royal necklines crafted with delicate Zari, Swaroop mirrors and Pearl embellishments.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    itemCount: 24,
    featured: true
  },
  {
    id: "cat-2",
    name: "Front Panel",
    description: "Full front panel embroidery art with intricate floral motifs and gold wire work.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
    itemCount: 32,
    featured: true
  },
  {
    id: "cat-3",
    name: "Back Design",
    description: "Captivating rear back panel patterns designed for statement regal gowns and blouses.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    itemCount: 18,
    featured: true
  },
  {
    id: "cat-4",
    name: "Sleeves",
    description: "Intricate cuff and full sleeve embroidery patterns featuring heavy zari lace.",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop",
    itemCount: 15
  },
  {
    id: "cat-5",
    name: "Dupatta Border",
    description: "Opulent border laces and corners embellished with cutwork and micro-sequins.",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
    itemCount: 28,
    featured: true
  },
  {
    id: "cat-6",
    name: "Full Suit Embroidery",
    description: "Complete matching front, back, neck, sleeves and dupatta co-ord embroidery sets.",
    image: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=800&auto=format&fit=crop",
    itemCount: 40,
    featured: true
  },
  {
    id: "cat-7",
    name: "Bridal Embroidery",
    description: "Heavy heritage bridal motifs featuring genuine Zardozi, Resham and crystal stones.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    itemCount: 35,
    featured: true
  },
  {
    id: "cat-8",
    name: "Arabic Floral Embroidery",
    description: "Contemporary Middle Eastern floral branches and fluid Arabesque vine designs.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    itemCount: 22,
    featured: true
  },
  {
    id: "cat-9",
    name: "International Collection",
    description: "Global fusion embroidery crafted for international luxury boutiques across UK, USA & GCC.",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop",
    itemCount: 29,
    featured: true
  },
  {
    id: "cat-10",
    name: "Luxury Collection",
    description: "Limited edition masterpieces created by our chief master artisans.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
    itemCount: 19,
    featured: true
  },
  {
    id: "cat-11",
    name: "Mirror Work",
    description: "Radiant royal reflective mirror craft bound by hand-embroidered silk threads.",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
    itemCount: 16
  },
  {
    id: "cat-12",
    name: "Stone Work",
    description: "High-grade Swarovski crystals and glass stone embellishments.",
    image: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=800&auto=format&fit=crop",
    itemCount: 20
  },
  {
    id: "cat-13",
    name: "Zari Work",
    description: "Metallic antique gold and metallic silver thread work woven with precision.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    itemCount: 38
  },
  {
    id: "cat-14",
    name: "Sequins Work",
    description: "Dual-tone matte and high-shine micro sequins for glamorous evening attire.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    itemCount: 24
  },
  {
    id: "cat-15",
    name: "Hand Embroidery",
    description: "Authentic needlecraft created by master artisans with over 30 years experience.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
    itemCount: 45
  },
  {
    id: "cat-16",
    name: "Machine Embroidery",
    description: "Ultra-precise multi-needle embroidery engineered for consistent high-volume luxury production.",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop",
    itemCount: 50
  },
  {
    id: "cat-17",
    name: "Custom Embroidery",
    description: "Tailor-made patterns created according to designer client specs and tech packs.",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
    itemCount: 12
  }
];

export const INITIAL_COLLECTIONS: CollectionItem[] = [
  {
    id: "col-1",
    name: "Bridal Collection",
    tagline: "Eternal Heritage for the Royal Bride",
    description: "Our crowning achievement in bridal couture featuring pure gold-plated Zardozi wire, hand-strung pearls and micro crystals on heavy velvet & silk.",
    bannerImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop",
    productCount: 35,
    featured: true
  },
  {
    id: "col-2",
    name: "International Collection",
    tagline: "Contemporary Arabesque & Global Grace",
    description: "Refined, minimalistic and dramatic embroidery patterns designed tailored for Middle Eastern Kaftans, Abayas, and European high-fashion houses.",
    bannerImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop",
    productCount: 29,
    featured: true
  },
  {
    id: "col-3",
    name: "Luxury Collection",
    tagline: "Limited Edition Artisanal Sculptures",
    description: "Each design requires over 200 artisan hours of hand needlework, featuring cutwork lace, multi-dimensional thread gradients, and real crystal accents.",
    bannerImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1600&auto=format&fit=crop",
    productCount: 19,
    featured: true
  },
  {
    id: "col-4",
    name: "Royal Heritage",
    tagline: "Inspired by Mughal Architecture & Palaces",
    description: "Symmetrical arches, floral filigree, and royal motif medallions that exude regal charisma.",
    bannerImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1600&auto=format&fit=crop",
    productCount: 24
  },
  {
    id: "col-5",
    name: "Velvet Couture",
    tagline: "Opulence Woven on Plush German Velvet",
    description: "Rich burgundy, emerald, royal navy, and jet black velvet panels laden with dense antique gold embroidery.",
    bannerImage: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1600&auto=format&fit=crop",
    productCount: 18
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    sku: "MC-BRD-801",
    title: "Maharani Royal Zardozi Velvet Bridal Panel Set",
    category: "Bridal Embroidery",
    collections: ["Bridal Collection", "Royal Heritage", "Velvet Couture"],
    price: 48500,
    originalPrice: 58000,
    description: "A breathtaking bridal masterwork engineered on premium German velvet. Features hand-worked antique gold Zardozi, real pearl work, French knot Resham vines, and Swaroop mirror borders. Includes complete front panel, royal neck border, full sleeves, rear medallion and heavy dupatta cutwork border.",
    fabric: "German Micro Velvet & Pure Silk Organza",
    workType: ["Hand Embroidery", "Zari Work", "Stone Work", "Mirror Work"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop"
    ],
    virtualModel: {
      detectedClothingType: "Bridal Lehenga / Salwar Suit Set",
      detectedGender: "women",
      imageSourceType: "flat_lay",
      originalImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
      modelViews: [
        { viewType: "front", label: "Front Studio Model View", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop" },
        { viewType: "side", label: "3/4 Side Profile Pose", imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop" },
        { viewType: "back", label: "Back Tailoring & Embroidery View", imageUrl: "https://images.unsplash.com/photo-1583391733975-ac90184c2f4d?q=80&w=1000&auto=format&fit=crop" },
        { viewType: "detail", label: "Macro Detail Craftsmanship", imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop" }
      ],
      generatedAt: "2026-07-21T09:00:00Z",
      description: "Super Admin AI photoshoot generated on female fashion model wearing Maharani Royal Zardozi Velvet Bridal Set."
    },
    aiGeneratedImages: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733975-ac90184c2f4d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop"
    ],
    threeSixtyImages: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop"
    ],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    availableColors: [
      { name: "Royal Maroon", hex: "#620002" },
      { name: "Emerald Green", hex: "#043927" },
      { name: "Deep Navy", hex: "#000f35" },
      { name: "Antique Gold", hex: "#C5A059" }
    ],
    availableSizes: ["Unstitched Fabric Set", "Semi-Stitched", "Custom Tailored"],
    isNewArrival: true,
    isTrending: true,
    isFeatured: true,
    isPopular: true,
    status: "published",
    createdAt: "2026-07-01T10:00:00Z",
    tags: ["bridal", "zardozi", "velvet", "luxury", "heavy"],
    minOrderQty: 1
  },
  {
    id: "prod-2",
    sku: "MC-INT-304",
    title: "Arabic Floral Crystal Abaya Neck & Sleeve Motif",
    category: "Arabic Floral Embroidery",
    collections: ["International Collection", "Luxury Collection"],
    price: 24500,
    originalPrice: 29000,
    description: "Designed for international luxury kaftans and abayas. Features fluid metallic silver & champage gold thread vines studded with genuine Swarovski crystal highlights and micro sequins. Precision cutwork edges allow seamless applique onto organza, silk, or crepe fabrics.",
    fabric: "High-Density Japanese Net & Organza Base",
    workType: ["Machine Embroidery", "Sequins Work", "Stone Work", "Cutwork Embroidery"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop"
    ],
    threeSixtyImages: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop"
    ],
    availableColors: [
      { name: "Champagne Gold", hex: "#F3E5AB" },
      { name: "Metallic Silver", hex: "#C0C0C0" },
      { name: "Rose Gold", hex: "#B76E79" },
      { name: "Jet Black", hex: "#1A1A1A" }
    ],
    availableSizes: ["Neck + Sleeve Set", "Full Dress Applique Roll"],
    isNewArrival: true,
    isTrending: true,
    isFeatured: true,
    status: "published",
    createdAt: "2026-07-05T12:00:00Z",
    tags: ["arabic", "international", "crystals", "abayawork"],
    minOrderQty: 1
  },
  {
    id: "prod-3",
    sku: "MC-NCK-112",
    title: "Imperial Antique Gold Dori & Mirror Neckline",
    category: "Neck Embroidery",
    collections: ["Luxury Collection", "Royal Heritage"],
    price: 12800,
    originalPrice: 15500,
    description: "An intricate neck yoke featuring double-twisted metallic gold dori threadwork, hand-bound convex mirror medallions, and fine dabka wire accents. Perfect for regal lehenga blouses, anarkalis, and lawn suit necklines.",
    fabric: "Raw Silk Base with Tissue Facing",
    workType: ["Hand Embroidery", "Mirror Work", "Zari Work"],
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1000&auto=format&fit=crop"
    ],
    availableColors: [
      { name: "Antique Gold", hex: "#D4AF37" },
      { name: "Ivory Cream", hex: "#FFFDD0" },
      { name: "Ruby Red", hex: "#9B111E" }
    ],
    availableSizes: ["Standard Yoke Pattern", "Deep V Neck", "Round Neck"],
    isNewArrival: false,
    isTrending: true,
    isFeatured: true,
    isPopular: true,
    status: "published",
    createdAt: "2026-06-20T08:00:00Z",
    tags: ["neckline", "mirror", "dori", "royal"],
    minOrderQty: 1
  },
  {
    id: "prod-4",
    sku: "MC-BDR-405",
    title: "Heritage Cutwork & Pearl Dupatta Border Lace (9 Meters)",
    category: "Dupatta Border",
    collections: ["Bridal Collection", "Luxury Collection"],
    price: 18900,
    originalPrice: 22500,
    description: "A grand 4-inch wide cutwork scalloped dupatta border lace. Features micro pearl hangings, dense gold zari leaves, and subtle sequin shimmer. Supplied in 9-meter full rolls suitable for bridal dupattas and saree borders.",
    fabric: "Organza Tissue with Silk Thread Reinforcement",
    workType: ["Cutwork Embroidery", "Zari Work", "Sequins Work"],
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
    ],
    availableColors: [
      { name: "Gold Pearl", hex: "#E6CA65" },
      { name: "Deep Scarlet", hex: "#800020" },
      { name: "Pearl White", hex: "#FDFBF7" }
    ],
    availableSizes: ["9 Meters Full Roll", "12 Meters Heavy Pack"],
    isNewArrival: true,
    isTrending: false,
    isFeatured: true,
    status: "published",
    createdAt: "2026-07-10T09:00:00Z",
    tags: ["dupatta", "border", "cutwork", "pearls"],
    minOrderQty: 1
  },
  {
    id: "prod-5",
    sku: "MC-FLS-502",
    title: "Kashmiri Resham & Zari Full Suit Embroidery Package",
    category: "Full Suit Embroidery",
    collections: ["Royal Heritage", "International Collection"],
    price: 36000,
    originalPrice: 42000,
    description: "Complete full suit designer embroidery package featuring front daman motif, neck yoke, sleeve wrist bands, back neck motif, and trouser/salwar border patches. Inspired by Kashmiri Chinar leaf and Mughal lattice geometry.",
    fabric: "Chanderi Silk & Chiffon Co-Ord Set",
    workType: ["Hand Embroidery", "Zari Work", "Resham Embroidery"],
    images: [
      "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop"
    ],
    availableColors: [
      { name: "Royal Teal", hex: "#005F73" },
      { name: "Blush Pink", hex: "#FFB6C1" },
      { name: "Mustard Gold", hex: "#E5A93C" }
    ],
    availableSizes: ["Full Unstitched 3-Piece Set", "Custom Tailored"],
    isNewArrival: true,
    isTrending: true,
    isFeatured: true,
    isPopular: true,
    status: "published",
    createdAt: "2026-07-12T14:30:00Z",
    tags: ["fullsuit", "kashmiri", "resham", "chanderi"],
    minOrderQty: 1
  },
  {
    id: "prod-6",
    sku: "MC-MIR-209",
    title: "Swaroop Mirror & Gota Patti Front Panel Mesh",
    category: "Mirror Work",
    collections: ["Luxury Collection"],
    price: 19800,
    originalPrice: 24000,
    description: "Sparkling real glass mirror work framed with authentic Gota Patti ribbons and gold badla wire. Creates an ethereal glimmer under light, ideal for festive choli tops, jacket fronts, and statement gowns.",
    fabric: "Pure Georgette & Net Overlay",
    workType: ["Mirror Work", "Gota Patti", "Hand Embroidery"],
    images: [
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop"
    ],
    availableColors: [
      { name: "Gota Gold", hex: "#D4AF37" },
      { name: "Pastel Mint", hex: "#98FF98" },
      { name: "Peach Blossom", hex: "#FFDAB9" }
    ],
    availableSizes: ["Front Panel 1.5 Mtr", "Jacket Set"],
    isNewArrival: false,
    isTrending: true,
    isFeatured: false,
    status: "published",
    createdAt: "2026-06-15T11:00:00Z",
    tags: ["mirrorwork", "gotapatti", "festive"],
    minOrderQty: 1
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [];

export const INITIAL_VIDEOS: VideoShowcaseItem[] = [];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    clientName: "Fatima Al-Mansoor",
    location: "Dubai, United Arab Emirates",
    rating: 5,
    comment: "The Arabic Floral embroidery set we ordered for our boutique in Dubai exceeded every expectation. The metallic thread quality and crystal precision are unmatched!",
    productTitle: "Arabic Floral Crystal Abaya Neck Motif",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    verifiedPurchase: true,
    createdAt: "2026-07-10T10:00:00Z",
    status: "approved"
  },
  {
    id: "rev-2",
    clientName: "Priya Sharma",
    location: "London, United Kingdom",
    rating: 5,
    comment: "I customized my royal bridal lehenga panel set with Mahalakshmi Creation. The Zardozi and velvet finish brought tears of joy on my wedding day. True haute couture craftsmanship!",
    productTitle: "Maharani Royal Zardozi Velvet Bridal Set",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
    verifiedPurchase: true,
    createdAt: "2026-07-05T14:00:00Z",
    status: "approved"
  },
  {
    id: "rev-3",
    clientName: "Ayesha Khan",
    location: "Toronto, Canada",
    rating: 5,
    comment: "Prompt communication over WhatsApp and ultra-fast international express shipping! The Dupatta border lace is heavy, rich, and stitched to perfection.",
    productTitle: "Heritage Cutwork & Pearl Dupatta Border",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    verifiedPurchase: true,
    createdAt: "2026-06-28T09:00:00Z",
    status: "approved"
  }
];

export const INITIAL_INQUIRIES: CustomerInquiry[] = [
  {
    id: "inq-101",
    name: "Sheikha Maryam",
    email: "maryam.couture@dubai.ae",
    phone: "+971 50 123 4567",
    country: "United Arab Emirates",
    productTitle: "Arabic Floral Crystal Abaya Neck & Sleeve Motif",
    productSku: "MC-INT-304",
    message: "Greetings. We are seeking custom bulk ordering of 50 units for our autumn fashion week line in Dubai. Please provide wholesale quote and swatch samples.",
    status: "new",
    createdAt: "2026-07-20T11:30:00Z"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2026-8819",
    customerEmail: "parmarjaydip881987@gmail.com",
    customerName: "Parmar Jaydip",
    customerPhone: "+91 98765 12345",
    shippingAddress: "Elegance Tower, Sector 4, Ahmedabad, Gujarat, India - 380015",
    items: [
      {
        productId: "prod-1",
        productTitle: "Maharani Royal Zardozi Velvet Bridal Set",
        sku: "MC-BRD-101",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
        quantity: 1,
        price: 48500,
        fabric: "German Micro Velvet & Pure Silk",
        color: "Royal Maroon (#620002)",
        notes: "Heavy hand zardozi work with gold dabka and ruby stones"
      },
      {
        productId: "prod-3",
        productTitle: "Arabic Floral Crystal Abaya Neck & Sleeve Motif",
        sku: "MC-INT-304",
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
        quantity: 2,
        price: 18500,
        fabric: "Organza Tissue with Swarovski Crystals",
        color: "Champagne Gold (#D4AF37)"
      }
    ],
    totalAmount: 85500,
    orderDate: "2026-07-18T14:30:00Z",
    status: "In Production (Embroidery)",
    paymentStatus: "Advance Received",
    trackingNumber: "DHL-IN-9812441",
    courierName: "DHL Express Air Freight",
    estimatedDelivery: "26 July 2026",
    notes: "Custom size panel specifications confirmed with master artisan."
  },
  {
    id: "ORD-2026-7730",
    customerEmail: "parmarjaydip881987@gmail.com",
    customerName: "Parmar Jaydip",
    customerPhone: "+91 98765 12345",
    shippingAddress: "Elegance Tower, Sector 4, Ahmedabad, Gujarat, India - 380015",
    items: [
      {
        productId: "prod-2",
        productTitle: "Kashmiri Tilla & Resham Cutwork Front Panel",
        sku: "MC-PNL-202",
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
        quantity: 1,
        price: 24000,
        fabric: "Pure Silk Organza",
        color: "Ivory Pearl (#FDFCF9)"
      }
    ],
    totalAmount: 24000,
    orderDate: "2026-07-10T09:15:00Z",
    status: "Dispatched (Priority Air Express)",
    paymentStatus: "Paid",
    trackingNumber: "FDX-INT-8812903",
    courierName: "FedEx International Priority",
    estimatedDelivery: "22 July 2026",
    notes: "Dispatched from Surat hub. Express tracking active."
  },
  {
    id: "ORD-2026-5501",
    customerEmail: "admin@mahalakshmicreation.com",
    customerName: "Mahalakshmi Admin",
    customerPhone: "+91 98765 43210",
    shippingAddress: "Plot 108, Textile Elegance Hub, Ring Road, Surat, Gujarat 395002",
    items: [
      {
        productId: "prod-4",
        productTitle: "Royal Swaroop Mirror Work Neckline",
        sku: "MC-NCK-108",
        image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop",
        quantity: 5,
        price: 12500,
        fabric: "Raw Silk",
        color: "Emerald Green (#004B23)"
      }
    ],
    totalAmount: 62500,
    orderDate: "2026-06-25T11:00:00Z",
    status: "Delivered",
    paymentStatus: "Paid",
    trackingNumber: "DHL-IN-7712399",
    courierName: "DHL Express",
    estimatedDelivery: "01 July 2026"
  }
];
