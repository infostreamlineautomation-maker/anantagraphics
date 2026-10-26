// Server-side data access for the public API. Every function is cached and tagged; after CMS edits
// the admin API calls /api/revalidate with the same tags (backend/app/routers/admin). When the API is
// unreachable the site falls back to the defaults below, cached only briefly.
import { cacheLife, cacheTag } from "next/cache";

import type {
  Client,
  ExploreCard,
  Faq,
  PageKey,
  ProjectDetail,
  Sections,
  Service,
  Settings,
  WorkCategoryCard,
  WorkCategoryDetail,
} from "./types";

const API = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

const DEFAULT_SETTINGS: Settings = {
  brand: {
    name: "Ananta Graphics",
    logo: "/logo.png",
    logo_badge: "/logo-badge.png",
    tagline: "Ideas with passion and purpose",
  },
  contact: {
    phone: "773-365-1240",
    email: "office@anantagraphics.com",
    address: "LG-04, Hiral Arcade, Opp. New Court, Athwalines, Surat 395 007, Gujarat, India",
    map_url: "https://www.google.com/maps/search/?api=1&query=Hiral+Arcade+Athwalines+Surat",
  },
  socials: {},
  footer: {
    tagline: "Let’s build brand, print and digital experiences that feel premium everywhere.",
    newsletter_text: "First access to launches, campaigns, and studio drops.",
    copyright: "© 2026 Ananta Graphics. All Rights Reserved.",
  },
  seo: {
    default_title: "Ananta Graphics | Design, Print & Packaging",
    default_description:
      "Ananta Graphics helps businesses bring brand ideas to life through design, printing, packaging, signage and corporate gifting.",
  },
  stats: {
    title: "Delivering Excellence Across India",
    total_value: "10M+",
    total_label: "Total Pieces Crafted",
    cities_value: "25+",
    cities_label: "Cities Covered",
    projects_value: "500+",
    projects_label: "Projects Completed",
    clients_value: "150+",
    clients_label: "Happy Clients",
  },
};

type Result<T> = { ok: true; data: T } | { ok: false; status: number };

async function get<T>(path: string): Promise<Result<T>> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status !== 404) console.warn(`[API] ${path} returned ${res.status}`);
      return { ok: false, status: res.status };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    console.warn(`[API] Could not fetch ${path} from ${API} (${err}).`);
    return { ok: false, status: 0 };
  }
}

/**
 * Cache a successful answer (or a real 404) for hours; an API outage only for minutes, so the site
 * recovers on its own. ("seconds" would make every page dynamic.)
 */
function safeTag(...tags: string[]) {
  try {
    for (const t of tags) cacheTag(t);
  } catch {
    // Ignore outside 'use cache' scope
  }
}

function safeLife(r: Result<unknown>) {
  try {
    if (r.ok || r.status === 404) cacheLife("hours");
    else cacheLife("minutes");
  } catch {
    // Ignore outside 'use cache' scope
  }
}

export async function getSettings(): Promise<Settings> {
  safeTag("settings");
  const r = await get<Partial<Settings>>("/settings");
  safeLife(r);
  if (!r.ok) return DEFAULT_SETTINGS;
  // Merge per group so a half-filled CMS settings record never blanks the header/footer
  const d = r.data;
  return {
    brand: { ...DEFAULT_SETTINGS.brand, ...d.brand },
    contact: { ...DEFAULT_SETTINGS.contact, ...d.contact },
    socials: d.socials ?? DEFAULT_SETTINGS.socials,
    footer: { ...DEFAULT_SETTINGS.footer, ...d.footer },
    seo: { ...DEFAULT_SETTINGS.seo, ...d.seo },
    stats: { ...DEFAULT_SETTINGS.stats, ...d.stats },
  };
}

export async function getPage(page: PageKey): Promise<Sections> {
  safeTag(`page:${page}`);
  const r = await get<{ sections: Sections }>(`/pages/${page}`);
  safeLife(r);
  return r.ok ? r.data.sections : {};
}

const FALLBACK_CATEGORIES: Record<string, WorkCategoryDetail> = {
  "printed-materials": {
    id: 1,
    name: "Printed Materials",
    slug: "printed-materials",
    short_description: "Professional print products created for everyday business and marketing needs.",
    card_image: "/uploads/figma/work-categories/printed-materials.jpg",
    secondary_image: "/uploads/figma/services/designing-printing.jpg",
    craft_tags: ["350 GSM Velvet Board", "Soft-Touch Matte", "Spot Gloss UV", "Metallic Foil Stamp"],
    color_palette: ["#BB1E23", "#EE3050", "#E5C158", "#2B070B"],
    heading: "Printed Materials",
    intro: "Business stationery, brochures and marketing collateral, designed and printed with care for every detail.",
    meta_title: "Printed Materials | Our Work | Ananta Graphics",
    meta_description: "Browse Printed Materials projects created by Ananta Graphics.",
    og_image: "/uploads/figma/work-categories/printed-materials.jpg",
    projects: [
      {
        id: 28,
        title: "Kalamandir Jewellery Catalogue & Suite",
        slug: "kalamandir-jewellery-catalogue",
        short_description: "Bespoke gold-foiled luxury jewellery catalogues, certificates & textured brand collateral.",
        cover_image: "/uploads/services/kalamandir-jewellery-catalogue.jpg",
        client: "Kalamandir Jewellers",
        description: "Bespoke gold-foiled luxury jewellery catalogues, certificate folders, and textured brand collateral designed and printed for Kalamandir Jewellers' flagship collections.",
        intro_image: "/uploads/services/kalamandir-jewellery-catalogue.jpg",
        is_featured: true,
      },
      {
        id: 29,
        title: "Gujarat Gas Corporate Annual Report & Collateral",
        slug: "gujarat-gas-corporate-suite",
        short_description: "Precision printed corporate annual reports, technical publications & executive stationery suites.",
        cover_image: "/uploads/figma/showcase/print-editorial-hero.jpg",
        client: "Gujarat Gas",
        description: "High-volume corporate annual report publications, safety documentation, and premium branded executive stationery suites for Gujarat Gas.",
        intro_image: "/uploads/figma/showcase/print-editorial-hero.jpg",
        is_featured: false,
      },
      {
        id: 30,
        title: "Amardeep Aggregates Corporate Profile",
        slug: "amardeep-aggregates-profile",
        short_description: "Multi-page industrial company profiles and infrastructure product catalogues with matte finish.",
        cover_image: "/uploads/figma/showcase/brand-identity-hero.jpg",
        client: "Amardeep Aggregates",
        description: "Heavy-weight multi-page company profiles, technical specification sheets, and marketing brochures designed and produced for Amardeep Aggregates.",
        intro_image: "/uploads/figma/showcase/brand-identity-hero.jpg",
        is_featured: false,
      },
    ],
  },
  "packaging": {
    id: 2,
    name: "Packaging",
    slug: "packaging",
    short_description: "Custom packaging solutions designed to protect, present and promote your products.",
    card_image: "/uploads/figma/work-categories/packaging.jpg",
    secondary_image: "/uploads/figma/projects/custom-retail-packaging.jpg",
    craft_tags: ["Rigid Boxboard", "Custom Die-Cut", "Gold Foil Deboss", "Matte Lamination"],
    color_palette: ["#BB1E23", "#D4AF37", "#D97724", "#4A5A72"],
    heading: "Packaging Solutions",
    intro: "Discover our selected packaging projects, showcasing creative concepts, custom designs, and print-ready solutions tailored to each client's needs.",
    meta_title: "Packaging Solutions | Our Work | Ananta Graphics",
    meta_description: "Browse Packaging projects created by Ananta Graphics.",
    og_image: "/uploads/figma/work-categories/packaging.jpg",
    projects: [
      {
        id: 31,
        title: "Mahalaxmi Juice & Fast Food Packaging",
        slug: "mahalaxmi-juice-packaging",
        short_description: "Custom food-grade takeaway boxes, beverage bottle labels & eco-friendly packaging.",
        cover_image: "/uploads/services/mahalaxmi-juice-packaging.jpg",
        client: "Mahalaxmi Juice & Fast Food Corner",
        description: "Custom food-grade takeaway boxes, beverage bottle labels, and eco-friendly packaging solutions engineered for quick-service food presentation and durability.",
        intro_image: "/uploads/services/mahalaxmi-juice-packaging.jpg",
        is_featured: true,
      },
      {
        id: 32,
        title: "Dero Custom Retail Packaging",
        slug: "dero-retail-packaging",
        short_description: "Custom rigid presentation boxes and branded retail product packaging with spot UV.",
        cover_image: "/uploads/figma/projects/custom-printed-boxes.jpg",
        client: "Dero",
        description: "Custom die-cut packaging boxes engineered with rigid board, precision spot UV, and vibrant brand graphics for Dero retail merchandise.",
        intro_image: "/uploads/figma/projects/custom-printed-boxes.jpg",
        is_featured: false,
      },
      {
        id: 33,
        title: "BA Prerna Cleanearth Eco Packaging",
        slug: "ba-prerna-eco-packaging",
        short_description: "100% recyclable kraft mailer boxes, biodegradable food containers & soy-ink printed sleeves.",
        cover_image: "/uploads/figma/projects/ecommerce-packaging.jpg",
        client: "BA Prerna Cleanearth",
        description: "Environmentally conscious packaging solutions manufactured with certified post-consumer recycled fiber and non-toxic soy inks for BA Prerna Cleanearth.",
        intro_image: "/uploads/figma/projects/ecommerce-packaging.jpg",
        is_featured: false,
      },
    ],
  },
  "signage": {
    id: 3,
    name: "Signage",
    slug: "signage",
    short_description: "Branded signage that makes your business easy to find, recognize, and remember.",
    card_image: "/uploads/figma/work-categories/signage.jpg",
    secondary_image: "/uploads/figma/showcase/brand-identity-card2.jpg",
    craft_tags: ["Brushed Aluminium", "UV Weather-Shield", "Backlit Acrylic", "Precision CNC Cut"],
    color_palette: ["#E31E24", "#00A3E0", "#6B7C96", "#1C1C24"],
    heading: "Signages Solutions",
    intro: "Shop signs, A-frames, window graphics and wayfinding that make a brand easy to spot.",
    meta_title: "Signage Solutions | Our Work | Ananta Graphics",
    meta_description: "Browse Signage projects created by Ananta Graphics.",
    og_image: "/uploads/figma/work-categories/signage.jpg",
    projects: [
      {
        id: 34,
        title: "Svaraa Diamond Jewellery Store Signage",
        slug: "svaraa-store-signage",
        short_description: "Precision laser-cut 3D architectural signage & illuminated store identity displays.",
        cover_image: "/uploads/services/svaraa-store-signage.jpg",
        client: "Svaraa Diamond Jewellery",
        description: "Precision laser-cut 3D architectural signage and illuminated store identity displays crafted for Svaraa Diamond Jewellery flagship showrooms.",
        intro_image: "/uploads/services/svaraa-store-signage.jpg",
        is_featured: true,
      },
      {
        id: 35,
        title: "Gujarat Gas Industrial & Safety Signage",
        slug: "gujarat-gas-safety-signage",
        short_description: "Reflective outdoor regulatory signs, wayfinding totems & industrial plant safety signage.",
        cover_image: "/uploads/figma/work-categories/signage.jpg",
        client: "Gujarat Gas",
        description: "High-durability reflective outdoor signs, emergency route wayfinding totems, and facility safety indicators engineered for Gujarat Gas industrial plants.",
        intro_image: "/uploads/figma/work-categories/signage.jpg",
        is_featured: false,
      },
      {
        id: 36,
        title: "Kalamandir Luxury Boutique Signage",
        slug: "kalamandir-showroom-signage",
        short_description: "Warm backlit 3D acrylic & gold PVD coated architectural lettering for luxury jewellery boutiques.",
        cover_image: "/uploads/figma/home/hero-shopfront.jpg",
        client: "Kalamandir Jewellers",
        description: "Architectural boutique storefront signage featuring gold PVD stainless steel lettering and diffused warm LED halo illumination for luxury showrooms.",
        intro_image: "/uploads/figma/home/hero-shopfront.jpg",
        is_featured: false,
      },
    ],
  },
  "corporate-gifting": {
    id: 4,
    name: "Corporate Gifting",
    slug: "corporate-gifting",
    short_description: "Branded gift sets and kits your clients and teams will actually keep.",
    card_image: "/uploads/figma/work-categories/corporate-gifting.jpg",
    secondary_image: "/uploads/figma/showcase/corporate-gifting-card2.jpg",
    craft_tags: ["Debossed Leatherette", "Precision Laser Engraving", "Custom Foam Inlay", "Curated Gift Curation"],
    color_palette: ["#1C2A39", "#C5A059", "#8A9BA8", "#F5F2EB"],
    heading: "Corporate Gifting",
    intro: "Thoughtfully assembled and branded gift boxes for clients, teams and company events.",
    meta_title: "Corporate Gifting | Our Work | Ananta Graphics",
    meta_description: "Browse Corporate Gifting projects created by Ananta Graphics.",
    og_image: "/uploads/figma/work-categories/corporate-gifting.jpg",
    projects: [
      {
        id: 37,
        title: "Mountain Rocko Executive Gift Kit",
        slug: "mountain-rocko-gifting",
        short_description: "Premium executive gift hampers, matte-finish insulated drinkware & custom desk kits.",
        cover_image: "/uploads/services/mountain-rocko-gifting.jpg",
        client: "Mountain Rocko",
        description: "Premium executive gift hampers, matte-finish insulated drinkware, and custom desk kits fabricated for Mountain Rocko corporate partners.",
        intro_image: "/uploads/services/mountain-rocko-gifting.jpg",
        is_featured: true,
      },
      {
        id: 38,
        title: "BA Prerna Cleanearth Sustainable Hamper",
        slug: "ba-prerna-gift-hamper",
        short_description: "Eco-friendly bamboo desk sets, organic cotton canvas totes & recycled paper notebooks.",
        cover_image: "/uploads/figma/showcase/corporate-gifting-card1.jpg",
        client: "BA Prerna Cleanearth",
        description: "Eco-friendly corporate gift hamper made with bamboo desktop organizers, organic cotton canvas conference bags, and recycled seed-paper stationery.",
        intro_image: "/uploads/figma/showcase/corporate-gifting-card1.jpg",
        is_featured: false,
      },
      {
        id: 39,
        title: "Amardeep Aggregates Executive Milestone Kit",
        slug: "amardeep-milestone-kit",
        short_description: "Custom engraved brass mementos, leatherette organizer folios & executive writing instruments.",
        cover_image: "/uploads/figma/showcase/corporate-gifting-hero.jpg",
        client: "Amardeep Aggregates",
        description: "Anniversary milestone presentation kits featuring heavy metal etched awards, leatherette executive portfolios, and custom pens in keepsake gift packaging.",
        intro_image: "/uploads/figma/showcase/corporate-gifting-hero.jpg",
        is_featured: false,
      },
    ],
  },
  "overseas-work": {
    id: 5,
    name: "Overseas Work",
    slug: "overseas-work",
    short_description: "International print, packaging and identity projects produced to global export specifications.",
    card_image: "/uploads/figma/work-categories/overseas-work.jpg",
    secondary_image: "/uploads/figma/showcase/brand-identity-card1.jpg",
    craft_tags: ["ISO Certified Print", "Export Duty Packaging", "Multilingual Typesetting", "International Air Freight"],
    color_palette: ["#1B365D", "#4B6B94", "#C49A45", "#F7F5F0"],
    heading: "Overseas Work",
    intro: "Export-grade packaging, luxury catalogues and exhibition collateral delivered to international standards.",
    meta_title: "Overseas Work | Our Work | Ananta Graphics",
    meta_description: "Browse Overseas Work projects created by Ananta Graphics.",
    og_image: "/uploads/figma/work-categories/overseas-work.jpg",
    projects: [
      {
        id: 40,
        title: "DGLA International Diamond Certification Suite",
        slug: "dgla-certification-packaging",
        short_description: "Tamper-evident holographic certificate wallets, secure sleeves & diamond grading documentation.",
        cover_image: "/uploads/figma/work-categories/overseas-work.jpg",
        client: "DGLA – Diamond & Gem Laboratories of America",
        description: "High-security tamper-evident diamond grading certificates, hologram-stamped certificate wallets, and international presentation boxes for DGLA.",
        intro_image: "/uploads/figma/work-categories/overseas-work.jpg",
        is_featured: false,
      },
      {
        id: 41,
        title: "Dero Global Export Merchandise & Packaging",
        slug: "dero-export-merchandise",
        short_description: "Export-grade presentation boxes, multilingual product sleeves & shipping carton branding.",
        cover_image: "/uploads/figma/projects/stationery-mockup.jpg",
        client: "Dero",
        description: "Export-grade packaging suites designed for global transit durability with international barcode compliance, multilingual typography, and tamper-resistant sealing.",
        intro_image: "/uploads/figma/projects/stationery-mockup.jpg",
        is_featured: false,
      },
    ],
  },
};

export async function getWorkCategories(): Promise<WorkCategoryCard[]> {
  safeTag("work");
  const r = await get<WorkCategoryCard[]>("/work-categories");
  safeLife(r);
  if (r.ok && r.data && r.data.length > 0) return r.data;
  return Object.values(FALLBACK_CATEGORIES).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    short_description: c.short_description,
    card_image: c.card_image,
    secondary_image: c.secondary_image,
    craft_tags: c.craft_tags,
    color_palette: c.color_palette,
  }));
}

const FALLBACK_PROJECTS: Record<string, ProjectDetail> = {
  "kalamandir-jewellery-catalogue": {
    id: 28,
    title: "Kalamandir Jewellery Catalogue & Suite",
    slug: "kalamandir-jewellery-catalogue",
    client: "Kalamandir Jewellers",
    project_type: "Luxury Jewellery Catalogue",
    cover_image: "/uploads/services/kalamandir-jewellery-catalogue.jpg",
    intro_image: "/uploads/services/kalamandir-jewellery-catalogue.jpg",
    short_description: "Bespoke gold-foiled luxury jewellery catalogues, certificates & textured brand collateral.",
    description: "Bespoke gold-foiled luxury jewellery catalogues, certificate folders, and textured brand collateral designed and printed for Kalamandir Jewellers' flagship collections.",
    services: ["Graphic Design", "Fine Printing", "Gold Foiling", "Textured Paper"],
    gallery: ["/uploads/services/kalamandir-jewellery-catalogue.jpg", "/uploads/figma/showcase/print-editorial-hero.jpg"],
    category: { id: 1, name: "Printed Materials", slug: "printed-materials", short_description: null, card_image: "/uploads/figma/work-categories/printed-materials.jpg" },
    meta_title: "Kalamandir Jewellery Catalogue & Suite | Ananta Graphics",
    meta_description: "Bespoke gold-foiled luxury jewellery catalogues, certificates & textured brand collateral.",
    og_image: "/uploads/services/kalamandir-jewellery-catalogue.jpg",
    explore: [],
  },
  "gujarat-gas-corporate-suite": {
    id: 29,
    title: "Gujarat Gas Corporate Annual Report & Collateral",
    slug: "gujarat-gas-corporate-suite",
    client: "Gujarat Gas",
    project_type: "Annual Report & Stationery Suite",
    cover_image: "/uploads/figma/showcase/print-editorial-hero.jpg",
    intro_image: "/uploads/figma/showcase/print-editorial-hero.jpg",
    short_description: "Precision printed corporate annual reports, technical publications & executive stationery suites.",
    description: "High-volume corporate annual report publications, safety documentation, and premium branded executive stationery suites for Gujarat Gas.",
    services: ["Editorial Design", "Corporate Printing", "Foil Stamping", "Executive Stationery"],
    gallery: ["/uploads/figma/showcase/print-editorial-hero.jpg"],
    category: { id: 1, name: "Printed Materials", slug: "printed-materials", short_description: null, card_image: "/uploads/figma/work-categories/printed-materials.jpg" },
    meta_title: "Gujarat Gas Corporate Annual Report & Collateral | Ananta Graphics",
    meta_description: "Precision printed corporate annual reports & executive stationery suites.",
    og_image: "/uploads/figma/showcase/print-editorial-hero.jpg",
    explore: [],
  },
  "amardeep-aggregates-profile": {
    id: 30,
    title: "Amardeep Aggregates Corporate Profile",
    slug: "amardeep-aggregates-profile",
    client: "Amardeep Aggregates",
    project_type: "Industrial Company Profile",
    cover_image: "/uploads/figma/showcase/brand-identity-hero.jpg",
    intro_image: "/uploads/figma/showcase/brand-identity-hero.jpg",
    short_description: "Multi-page industrial company profiles and infrastructure product catalogues with matte finish.",
    description: "Heavy-weight multi-page company profiles, technical specification sheets, and marketing brochures designed and produced for Amardeep Aggregates.",
    services: ["Company Profile Design", "Commercial Offset Printing", "Matte Lamination"],
    gallery: ["/uploads/figma/showcase/brand-identity-hero.jpg"],
    category: { id: 1, name: "Printed Materials", slug: "printed-materials", short_description: null, card_image: "/uploads/figma/work-categories/printed-materials.jpg" },
    meta_title: "Amardeep Aggregates Corporate Profile | Ananta Graphics",
    meta_description: "Multi-page industrial company profiles and infrastructure product catalogues.",
    og_image: "/uploads/figma/showcase/brand-identity-hero.jpg",
    explore: [],
  },
  "mahalaxmi-juice-packaging": {
    id: 31,
    title: "Mahalaxmi Juice & Fast Food Packaging",
    slug: "mahalaxmi-juice-packaging",
    client: "Mahalaxmi Juice & Fast Food Corner",
    project_type: "Food & Beverage Packaging",
    cover_image: "/uploads/services/mahalaxmi-juice-packaging.jpg",
    intro_image: "/uploads/services/mahalaxmi-juice-packaging.jpg",
    short_description: "Custom food-grade takeaway boxes, beverage bottle labels & eco-friendly packaging.",
    description: "Custom food-grade takeaway boxes, beverage bottle labels, and eco-friendly packaging solutions engineered for quick-service food presentation and durability.",
    services: ["Packaging Design", "Food Grade Printing", "Eco Takeaway Boxes", "Label Design"],
    gallery: ["/uploads/services/mahalaxmi-juice-packaging.jpg"],
    category: { id: 2, name: "Packaging", slug: "packaging", short_description: null, card_image: "/uploads/figma/work-categories/packaging.jpg" },
    meta_title: "Mahalaxmi Juice & Fast Food Packaging | Ananta Graphics",
    meta_description: "Custom food-grade takeaway boxes, beverage bottle labels & eco-friendly packaging.",
    og_image: "/uploads/services/mahalaxmi-juice-packaging.jpg",
    explore: [],
  },
  "dero-retail-packaging": {
    id: 32,
    title: "Dero Custom Retail Packaging",
    slug: "dero-retail-packaging",
    client: "Dero",
    project_type: "Retail Packaging Boxes",
    cover_image: "/uploads/figma/projects/custom-printed-boxes.jpg",
    intro_image: "/uploads/figma/projects/custom-printed-boxes.jpg",
    short_description: "Custom rigid presentation boxes and branded retail product packaging with spot UV.",
    description: "Custom die-cut packaging boxes engineered with rigid board, precision spot UV, and vibrant brand graphics for Dero retail merchandise.",
    services: ["Structural Box Design", "Custom Die Cutting", "Spot UV Coating"],
    gallery: ["/uploads/figma/projects/custom-printed-boxes.jpg"],
    category: { id: 2, name: "Packaging", slug: "packaging", short_description: null, card_image: "/uploads/figma/work-categories/packaging.jpg" },
    meta_title: "Dero Custom Retail Packaging | Ananta Graphics",
    meta_description: "Custom rigid presentation boxes and branded retail product packaging.",
    og_image: "/uploads/figma/projects/custom-printed-boxes.jpg",
    explore: [],
  },
  "ba-prerna-eco-packaging": {
    id: 33,
    title: "BA Prerna Cleanearth Eco Packaging",
    slug: "ba-prerna-eco-packaging",
    client: "BA Prerna Cleanearth",
    project_type: "Sustainable Packaging Solutions",
    cover_image: "/uploads/figma/projects/ecommerce-packaging.jpg",
    intro_image: "/uploads/figma/projects/ecommerce-packaging.jpg",
    short_description: "100% recyclable kraft mailer boxes, biodegradable food containers & soy-ink printed sleeves.",
    description: "Environmentally conscious packaging solutions manufactured with certified post-consumer recycled fiber and non-toxic soy inks for BA Prerna Cleanearth.",
    services: ["Sustainable Packaging", "Kraft Box Manufacturing", "Soy Ink Printing"],
    gallery: ["/uploads/figma/projects/ecommerce-packaging.jpg"],
    category: { id: 2, name: "Packaging", slug: "packaging", short_description: null, card_image: "/uploads/figma/work-categories/packaging.jpg" },
    meta_title: "BA Prerna Cleanearth Eco Packaging | Ananta Graphics",
    meta_description: "100% recyclable kraft mailer boxes & biodegradable food containers.",
    og_image: "/uploads/figma/projects/ecommerce-packaging.jpg",
    explore: [],
  },
  "svaraa-store-signage": {
    id: 34,
    title: "Svaraa Diamond Jewellery Store Signage",
    slug: "svaraa-store-signage",
    client: "Svaraa Diamond Jewellery",
    project_type: "3D Architectural Signage",
    cover_image: "/uploads/services/svaraa-store-signage.jpg",
    intro_image: "/uploads/services/svaraa-store-signage.jpg",
    short_description: "Precision laser-cut 3D architectural signage & illuminated store identity displays.",
    description: "Precision laser-cut 3D architectural signage and illuminated store identity displays crafted for Svaraa Diamond Jewellery flagship showrooms.",
    services: ["Signage Design", "Laser Cutting", "Illuminated Displays"],
    gallery: ["/uploads/services/svaraa-store-signage.jpg"],
    category: { id: 3, name: "Signage", slug: "signage", short_description: null, card_image: "/uploads/figma/work-categories/signage.jpg" },
    meta_title: "Svaraa Diamond Jewellery Store Signage | Ananta Graphics",
    meta_description: "Precision laser-cut 3D architectural signage & illuminated store identity displays.",
    og_image: "/uploads/services/svaraa-store-signage.jpg",
    explore: [],
  },
  "gujarat-gas-safety-signage": {
    id: 35,
    title: "Gujarat Gas Industrial & Safety Signage",
    slug: "gujarat-gas-safety-signage",
    client: "Gujarat Gas",
    project_type: "Industrial & Wayfinding Signage",
    cover_image: "/uploads/figma/work-categories/signage.jpg",
    intro_image: "/uploads/figma/work-categories/signage.jpg",
    short_description: "Reflective outdoor regulatory signs, wayfinding totems & industrial plant safety signage.",
    description: "High-durability reflective outdoor signs, emergency route wayfinding totems, and facility safety indicators engineered for Gujarat Gas industrial plants.",
    services: ["Safety Signage Systems", "Reflective Vinyl Printing", "Metal Fabrication"],
    gallery: ["/uploads/figma/work-categories/signage.jpg"],
    category: { id: 3, name: "Signage", slug: "signage", short_description: null, card_image: "/uploads/figma/work-categories/signage.jpg" },
    meta_title: "Gujarat Gas Industrial & Safety Signage | Ananta Graphics",
    meta_description: "Reflective outdoor regulatory signs & industrial plant safety signage.",
    og_image: "/uploads/figma/work-categories/signage.jpg",
    explore: [],
  },
  "kalamandir-showroom-signage": {
    id: 36,
    title: "Kalamandir Luxury Boutique Signage",
    slug: "kalamandir-showroom-signage",
    client: "Kalamandir Jewellers",
    project_type: "Luxury Showroom Facade Signage",
    cover_image: "/uploads/figma/home/hero-shopfront.jpg",
    intro_image: "/uploads/figma/home/hero-shopfront.jpg",
    short_description: "Warm backlit 3D acrylic & gold PVD coated architectural lettering for luxury jewellery boutiques.",
    description: "Architectural boutique storefront signage featuring gold PVD stainless steel lettering and diffused warm LED halo illumination for luxury showrooms.",
    services: ["PVD Coating", "Backlit Acrylic Fabrication", "Showroom Facade Branding"],
    gallery: ["/uploads/figma/home/hero-shopfront.jpg"],
    category: { id: 3, name: "Signage", slug: "signage", short_description: null, card_image: "/uploads/figma/work-categories/signage.jpg" },
    meta_title: "Kalamandir Luxury Boutique Signage | Ananta Graphics",
    meta_description: "Warm backlit 3D acrylic & gold PVD coated architectural lettering.",
    og_image: "/uploads/figma/home/hero-shopfront.jpg",
    explore: [],
  },
  "mountain-rocko-gifting": {
    id: 37,
    title: "Mountain Rocko Executive Gift Kit",
    slug: "mountain-rocko-gifting",
    client: "Mountain Rocko",
    project_type: "Executive Gift Hamper",
    cover_image: "/uploads/services/mountain-rocko-gifting.jpg",
    intro_image: "/uploads/services/mountain-rocko-gifting.jpg",
    short_description: "Premium executive gift hampers, matte-finish insulated drinkware & custom desk kits.",
    description: "Premium executive gift hampers, matte-finish insulated drinkware, and custom desk kits fabricated for Mountain Rocko corporate partners.",
    services: ["Corporate Gifting", "Custom Fabrication", "Branded Merchandise"],
    gallery: ["/uploads/services/mountain-rocko-gifting.jpg"],
    category: { id: 4, name: "Corporate Gifting", slug: "corporate-gifting", short_description: null, card_image: "/uploads/figma/work-categories/corporate-gifting.jpg" },
    meta_title: "Mountain Rocko Executive Gift Kit | Ananta Graphics",
    meta_description: "Premium executive gift hampers, matte-finish insulated drinkware & custom desk kits.",
    og_image: "/uploads/services/mountain-rocko-gifting.jpg",
    explore: [],
  },
  "ba-prerna-gift-hamper": {
    id: 38,
    title: "BA Prerna Cleanearth Sustainable Hamper",
    slug: "ba-prerna-gift-hamper",
    client: "BA Prerna Cleanearth",
    project_type: "Eco Corporate Gift Collection",
    cover_image: "/uploads/figma/showcase/corporate-gifting-card1.jpg",
    intro_image: "/uploads/figma/showcase/corporate-gifting-card1.jpg",
    short_description: "Eco-friendly bamboo desk sets, organic cotton canvas totes & recycled paper notebooks.",
    description: "Eco-friendly corporate gift hamper made with bamboo desktop organizers, organic cotton canvas conference bags, and recycled seed-paper stationery.",
    services: ["Sustainable Gifting", "Custom Wood Engraving", "Eco Merchandise"],
    gallery: ["/uploads/figma/showcase/corporate-gifting-card1.jpg"],
    category: { id: 4, name: "Corporate Gifting", slug: "corporate-gifting", short_description: null, card_image: "/uploads/figma/work-categories/corporate-gifting.jpg" },
    meta_title: "BA Prerna Cleanearth Sustainable Hamper | Ananta Graphics",
    meta_description: "Eco-friendly bamboo desk sets & organic cotton canvas totes.",
    og_image: "/uploads/figma/showcase/corporate-gifting-card1.jpg",
    explore: [],
  },
  "amardeep-milestone-kit": {
    id: 39,
    title: "Amardeep Aggregates Executive Milestone Kit",
    slug: "amardeep-milestone-kit",
    client: "Amardeep Aggregates",
    project_type: "Milestone Celebration Box",
    cover_image: "/uploads/figma/showcase/corporate-gifting-hero.jpg",
    intro_image: "/uploads/figma/showcase/corporate-gifting-hero.jpg",
    short_description: "Custom engraved brass mementos, leatherette organizer folios & executive writing instruments.",
    description: "Anniversary milestone presentation kits featuring heavy metal etched awards, leatherette executive portfolios, and custom pens in keepsake gift packaging.",
    services: ["Etched Metal Awards", "Leatherette Debossing", "Premium Presentation Packaging"],
    gallery: ["/uploads/figma/showcase/corporate-gifting-hero.jpg"],
    category: { id: 4, name: "Corporate Gifting", slug: "corporate-gifting", short_description: null, card_image: "/uploads/figma/work-categories/corporate-gifting.jpg" },
    meta_title: "Amardeep Aggregates Executive Milestone Kit | Ananta Graphics",
    meta_description: "Custom engraved brass mementos & executive writing instruments.",
    og_image: "/uploads/figma/showcase/corporate-gifting-hero.jpg",
    explore: [],
  },
  "dgla-certification-packaging": {
    id: 40,
    title: "DGLA International Diamond Certification Suite",
    slug: "dgla-certification-packaging",
    client: "DGLA – Diamond & Gem Laboratories of America",
    project_type: "High-Security Diamond Documentation Suite",
    cover_image: "/uploads/figma/work-categories/overseas-work.jpg",
    intro_image: "/uploads/figma/work-categories/overseas-work.jpg",
    short_description: "Tamper-evident holographic certificate wallets, secure sleeves & diamond grading documentation.",
    description: "High-security tamper-evident diamond grading certificates, hologram-stamped certificate wallets, and international presentation boxes for DGLA.",
    services: ["Hologram Foil Stamping", "Security Printing", "Speciality Wallets"],
    gallery: ["/uploads/figma/work-categories/overseas-work.jpg"],
    category: { id: 5, name: "Overseas Work", slug: "overseas-work", short_description: null, card_image: "/uploads/figma/work-categories/overseas-work.jpg" },
    meta_title: "DGLA International Diamond Certification Suite | Ananta Graphics",
    meta_description: "Tamper-evident holographic certificate wallets & diamond grading documentation.",
    og_image: "/uploads/figma/work-categories/overseas-work.jpg",
    explore: [],
  },
  "dero-export-merchandise": {
    id: 41,
    title: "Dero Global Export Merchandise & Packaging",
    slug: "dero-export-merchandise",
    client: "Dero",
    project_type: "Export Packaging & Merchandise",
    cover_image: "/uploads/figma/projects/stationery-mockup.jpg",
    intro_image: "/uploads/figma/projects/stationery-mockup.jpg",
    short_description: "Export-grade presentation boxes, multilingual product sleeves & shipping carton branding.",
    description: "Export-grade packaging suites designed for global transit durability with international barcode compliance, multilingual typography, and tamper-resistant sealing.",
    services: ["Export Packaging", "Multilingual Typesetting", "Heavy Duty Rigids"],
    gallery: ["/uploads/figma/projects/stationery-mockup.jpg"],
    category: { id: 5, name: "Overseas Work", slug: "overseas-work", short_description: null, card_image: "/uploads/figma/work-categories/overseas-work.jpg" },
    meta_title: "Dero Global Export Merchandise & Packaging | Ananta Graphics",
    meta_description: "Export-grade presentation boxes & multilingual product sleeves.",
    og_image: "/uploads/figma/projects/stationery-mockup.jpg",
    explore: [],
  },
};

export async function getWorkCategory(slug: string): Promise<WorkCategoryDetail | null> {
  safeTag("work", `work-category:${slug}`);
  const r = await get<WorkCategoryDetail>(`/work-categories/${encodeURIComponent(slug)}`);
  safeLife(r);
  if (r.ok && r.data) return r.data;
  return FALLBACK_CATEGORIES[slug] ?? null;
}

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  safeTag("projects", `project:${slug}`);
  const r = await get<ProjectDetail>(`/projects/${encodeURIComponent(slug)}`);
  safeLife(r);
  if (r.ok && r.data) return r.data;
  return FALLBACK_PROJECTS[slug] ?? null;
}

export async function getAllProjects(): Promise<ExploreCard[]> {
  safeTag("projects");
  const r = await get<ExploreCard[]>("/projects");
  safeLife(r);
  if (r.ok && r.data && r.data.length > 0) return r.data;
  return Object.values(FALLBACK_PROJECTS).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    short_description: p.short_description,
    cover_image: p.cover_image,
    secondary_image: null,
    craft_tags: [],
    color_palette: [],
    client: p.client,
    description: p.description,
    intro_image: p.intro_image,
    is_featured: p.slug === "kalamandir-jewellery-catalogue" || p.slug === "mahalaxmi-juice-packaging" || p.slug === "svaraa-store-signage" || p.slug === "mountain-rocko-gifting",
    category_slug: p.category.slug,
    category_name: p.category.name,
  }));
}

export async function getServices(): Promise<Service[]> {
  safeTag("services");
  const r = await get<Service[]>("/services");
  safeLife(r);
  return r.ok ? r.data : [];
}

export async function getFeaturedProjects(): Promise<ExploreCard[]> {
  safeTag("projects", "home");
  const r = await get<ExploreCard[]>("/featured-projects");
  safeLife(r);
  if (r.ok && r.data && r.data.length > 0) return r.data;
  const featuredSlugs = [
    "kalamandir-jewellery-catalogue",
    "mahalaxmi-juice-packaging",
    "svaraa-store-signage",
    "mountain-rocko-gifting",
  ];
  return featuredSlugs
    .map((s) => FALLBACK_PROJECTS[s])
    .filter((p): p is ProjectDetail => Boolean(p))
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      short_description: p.short_description,
      cover_image: p.cover_image,
      secondary_image: null,
      craft_tags: [],
      color_palette: [],
      client: p.client,
      description: p.description,
      intro_image: p.intro_image,
      is_featured: true,
      category_slug: p.category.slug,
      category_name: p.category.name,
    }));
}

const FALLBACK_CLIENTS: Client[] = [
  { id: 1, name: "Kalamandir", logo: "/uploads/figma/clients/kalamandir.png", website: null },
  { id: 2, name: "Svaraa", logo: "/uploads/figma/clients/svaraa.png", website: null },
  { id: 3, name: "Gujarat Gas", logo: "/uploads/figma/clients/gujarat-gas.png", website: null },
  { id: 4, name: "Mahalaxmi Juice & Fast Food Corner", logo: "/uploads/figma/clients/mahalaxmi.png", website: null },
  { id: 5, name: "Amardeep Aggregates", logo: "/uploads/figma/clients/amardeep-aggregates.png", website: null },
  { id: 6, name: "DGLA – Diamond & Gem Laboratories of America", logo: "/uploads/figma/clients/dgla.png", website: null },
  { id: 7, name: "Dero", logo: "/uploads/figma/clients/dero.png", website: null },
  { id: 8, name: "Mountain Rocko", logo: "/uploads/figma/clients/mountain-rocko.png", website: null },
  { id: 9, name: "BA Prerna Cleanearth", logo: "/uploads/figma/clients/ba-prerna.png", website: null },
];

export async function getClients(): Promise<Client[]> {
  safeTag("clients");
  const r = await get<Client[]>("/clients");
  safeLife(r);
  return r.ok && r.data && r.data.length > 0 ? r.data : FALLBACK_CLIENTS;
}

export async function getFaqs(): Promise<Faq[]> {
  safeTag("faqs");
  const r = await get<Faq[]>("/faqs");
  safeLife(r);
  return r.ok ? r.data : [];
}
