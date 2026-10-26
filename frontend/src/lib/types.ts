/** Shapes returned by the public API (backend/app/schemas/content.py). */

export type Settings = {
  brand: {
    name: string;
    logo: string;        // full horizontal logo (footer)
    logo_badge: string;  // round "A" badge (header)
    tagline: string;     // "Ideas with passion and purpose"
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    map_url: string;
  };
  socials: Partial<Record<SocialKey, string>>;
  footer: {
    tagline: string;
    newsletter_text: string;
    copyright: string;
  };
  seo: {
    default_title: string;
    default_description: string;
    og_image?: string;
  };
  stats?: StatsSettings;
};

export type CounterItem = {
  id?: string;
  value: string;
  label: string;
  enabled?: boolean;
};

export type StatsSettings = {
  title?: string;
  items?: CounterItem[];
  total_value?: string;
  total_label?: string;
  cities_value?: string;
  cities_label?: string;
  projects_value?: string;
  projects_label?: string;
  clients_value?: string;
  clients_label?: string;
};

export type SocialKey = "instagram" | "facebook" | "linkedin" | "youtube";

export type Seo = {
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
};

export type Faq = { id?: number; question: string; answer: string };

export type Service = {
  id: number;
  title: string;
  client_name?: string | null;
  description: string | null;
  image: string | null;
  link: string | null;
};

export type Client = { id: number; name: string; logo: string; website: string | null };

export type WorkCategoryCard = {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  card_image: string | null;
  secondary_image?: string | null;
  craft_tags?: string[];
  color_palette?: string[];
};

export type ProjectCard = {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  cover_image: string | null;
  secondary_image?: string | null;
  craft_tags?: string[];
  color_palette?: string[];
  client?: string | null;
  description?: string | null;
  intro_image?: string | null;
  is_featured?: boolean;
};

export type WorkCategoryDetail = WorkCategoryCard &
  Seo & {
    heading: string | null;
    intro: string | null;
    projects: ProjectCard[];
  };

export type ExploreCard = ProjectCard & { category_slug: string; category_name: string };

export type ProjectDetail = ProjectCard &
  Seo & {
    description: string | null;
    intro_image: string | null;
    client: string | null;
    project_type: string | null;
    services: string[];
    gallery: string[];
    category: WorkCategoryCard;
    explore: ExploreCard[];
  };

export type PageKey = "home" | "about" | "contact" | "our-work";

/** Editable page sections: free-form JSON per section (backend/app/seed_data.py PAGES). */
export type Sections = Record<string, Record<string, unknown>>;
