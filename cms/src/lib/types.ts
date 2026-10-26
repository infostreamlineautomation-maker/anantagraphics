// Shapes returned by the admin API (backend/app/schemas)

export type Page<T> = { items: T[]; total: number; page: number; page_size: number };

type Seo = { meta_title: string | null; meta_description: string | null; og_image: string | null };

export type WorkCategory = Seo & {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  card_image: string | null;
  secondary_image?: string | null;
  heading: string | null;
  intro: string | null;
  craft_tags?: string[];
  color_palette?: string[];
  is_active: boolean;
  sequence: number;
  project_count: number;
  created_at: string;
  updated_at: string;
};

export type Project = Seo & {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  slug: string;
  short_description?: string | null;
  cover_image: string | null;
  secondary_image?: string | null;
  description: string | null;
  intro_image: string | null;
  client: string | null;
  project_type: string | null;
  services: string[];
  craft_tags?: string[];
  color_palette?: string[];
  gallery: string[];
  is_featured?: boolean;
  is_active: boolean;
  sequence: number;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: number;
  title: string;
  client_name?: string | null;
  description: string | null;
  image: string | null;
  link: string | null;
  sequence: number;
  is_active: boolean;
  updated_at: string;
};

export type Client = {
  id: number;
  name: string;
  logo: string;
  website: string | null;
  sequence: number;
  is_active: boolean;
  updated_at: string;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
  sequence: number;
  is_active: boolean;
  updated_at: string;
};

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type PageSection = {
  id: number;
  page: string;
  key: string;
  label: string;
  content: JsonObject;
  sequence: number;
  is_active: boolean;
  updated_at: string;
};

export type Media = {
  id: number;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  folder: string;
  created_at: string;
};

export type EnquiryType = "contact" | "quote";
export type EnquiryStatus = "new" | "in_progress" | "closed";

export type Enquiry = {
  id: number;
  type: EnquiryType;
  status: EnquiryStatus;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  service_id: number | null;
  service_name: string | null;
  notes: string | null;
  source_page: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriberStatus = "subscribed" | "unsubscribed";

export type Subscriber = {
  id: number;
  email: string;
  status: SubscriberStatus;
  source_page: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "superadmin" | "editor";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type AuditEntry = {
  id: number;
  admin_id: number | null;
  admin_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  summary: string;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};

export type Dashboard = {
  work_categories: number;
  projects: number;
  services: number;
  clients: number;
  media: number;
  enquiries_total: number;
  enquiries_new: number;
  subscribers: number;
  latest_enquiries: { id: number; name: string; type: EnquiryType; status: EnquiryStatus; service: string | null; created_at: string }[];
};

export type Settings = Record<"brand" | "contact" | "socials" | "footer" | "seo" | "stats", Record<string, string>>;
