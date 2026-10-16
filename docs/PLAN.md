# Ananta Graphics — Project Plan

Website + CMS for **Ananta Graphics** ("Ideas with passion and purpose") — a creative design and
production studio: brand identity, print & editorial, packaging, signage, events and corporate gifting.
Same stack and conventions as Fortune Decor (`D:\work\HomeDecor`); new design.

Figma: file `zpRYKFfXMNxO69RdYXnl1C`, page **Ananta Graphics** (`101:2`), 6 frames at 1728px:

| Frame                | Node      | Route                              |
|----------------------|-----------|------------------------------------|
| Home page            | `101:3`   | `/`                                |
| Our Work Page        | `101:80`  | `/our-work`                        |
| Our Work detail page | `101:141` | `/our-work/[category]`             |
| Product detail page  | `101:401` | `/our-work/[category]/[project]`   |
| About Us page        | `101:274` | `/about`                           |
| Contact us page      | `101:202` | `/contact`                         |

---

## 1. Architecture

| Service    | Tech                       | Dev port | Prod (behind Nginx)     | Folder      |
|------------|----------------------------|----------|-------------------------|-------------|
| Website    | Next.js 16 (App Router)    | 3000     | `example.com`           | `frontend/` |
| CMS        | Next.js 16 (App Router)    | 3001     | `admin.example.com`     | `cms/`      |
| Public API | FastAPI (`app.main`)       | 8000     | `api.example.com`       | `backend/`  |
| Admin API  | FastAPI (`app.admin_main`) | 8001     | `admin-api.example.com` | `backend/`  |
| Database   | PostgreSQL + Alembic       | 5432     | local on VPS            | —           |

- One backend codebase, **two FastAPI apps** sharing models/DB. The public API is read-only (plus
  enquiry / newsletter submit, rate limited); the admin API holds every write route behind JWT auth
  (httpOnly cookie). Website and CMS never share an origin or CORS list.
- Media: uploaded to `backend/uploads/`, served by Nginx directly in production.
- Production: Linux VPS (Hostinger), PM2 runs the 4 processes (`deploy/ecosystem.config.js`),
  Nginx reverse proxy + Certbot SSL (`deploy/nginx/anantagraphics.conf`). Ports are overridable
  (`WEB_PORT`, `CMS_PORT`, `API_PORT`, `ADMIN_API_PORT`) so it can share a VPS with other sites.

```
Anantagraphics/
├── backend/
│   ├── app/
│   │   ├── core/        config, database, security, rate limiter
│   │   ├── models/      SQLAlchemy 2.0 models (import each in models/__init__.py)
│   │   ├── schemas/     Pydantic schemas
│   │   ├── routers/     public/ (website) · admin/ (CMS) · health
│   │   ├── services/    media, mail, audit, revalidate, search
│   │   ├── cli.py       init-env · create-db · create-admin
│   │   ├── main.py      public API  (:8000)
│   │   └── admin_main.py admin API  (:8001)
│   ├── alembic/         migrations (DATABASE_URL from backend/.env)
│   ├── tests/
│   └── uploads/
├── frontend/            website (Next.js)
├── cms/                 CMS (Next.js)
├── deploy/              ecosystem.config.js (PM2), nginx/anantagraphics.conf
├── scripts/             setup.sh/.bat, run.sh/.bat
├── docs/                PLAN.md, DEPLOYMENT.md
└── package.json         dev tooling only (concurrently for run.bat)
```

### Scripts

| Script                     | Does |
|----------------------------|------|
| `setup.bat` / `setup.sh`   | Checks Python 3.11+/Node 20+, creates the venv + installs deps, writes `.env` files with generated secrets, installs both Next apps, creates the database if missing, runs migrations + seed. Safe to re-run. `setup.sh --prod` for servers. |
| `run.bat` / `run.sh`       | Dev: all 4 services with hot reload and coloured, prefixed logs. Checks the ports are free first. **Ctrl+C stops every process tree** (Next workers, uvicorn reloaders) and frees the ports. `run.* prod` builds and serves production mode (`run.sh prod` uses PM2; `run.sh stop/status/logs`). |

---

## 2. Website pages (from Figma)

Shared layout
- **Header**: red pill nav floating over the page (Home · About Us | round logo badge | Our work · Contact Us),
  active link underlined. Mobile: logo + menu button → slide-in drawer.
- **Footer** (light grey): full logo, tagline "Let's build brand, print and digital experiences that feel
  premium everywhere.", newsletter (email + Join), Explore links, Get in Touch (phone, email, address, socials);
  bottom bar © + Sitemap · Privacy Policy · Cookie Policy · Cookie Settings.

| Route                            | Sections |
|----------------------------------|----------|
| `/`                              | Full-bleed hero image + caption "Ideas Turned Into Visuals." · "What we create — Visual ideas, made to leave a mark." · 4 numbered showcase blocks with notched title tab (01 Brand Identity, 02 Print & Editorial, 03 Events & Experiences, 04 Corporate Gifting), each an image collage · "Services We Provide" carousel (active card expands red with text + "Our Services" button; others are image cards with arrow + label) · "Our Clients" logo rows (marquee) · featured projects image carousel · footer |
| `/our-work`                      | "Our Works — Designed to be seen. Made to be remembered." · grid of work categories (01 Printed Materials, 02 Packaging, 03 Signage, …): image, title, text, **View Work** |
| `/our-work/[category]`           | e.g. "Packaging Solutions" + intro · grid of projects (01. Premium Product Packaging …): image, title, text, **View Project** |
| `/our-work/[category]/[project]` | "Selected projects, created with purpose." · intro image + title, description, Client / Project / Services · full-width gallery images · "Explore more projects" (3 cards) |
| `/about`                         | Hero "Visual ideas, made to leave a mark." + text + "Let's Work Together" + 3 stat cards (360 / Fast / Premium) + image · Vision & Mission cards · Our Clients grid · "Built around creativity. Driven by detail." + text + capability chips · 4 feature cards (Premium Print, Creative Branding, Large Format, Packaging Care) · dark Get In Touch card + FAQs accordion + red "Have an idea in mind?" CTA (Request Quote) |
| `/contact`                       | Hero image · red panel: "Let's talk about your next project." + contact rows + socials · Contact form (Full name, Phone, Email, Service required, Message → Send Message) · Google map |
| `/privacy`, `/cookies`, `/terms`, `/sitemap.xml`, `robots.txt` | Footer links + SEO; cookie-consent banner behind "Cookie Settings" |

Rendering: server components fetching the public API with `'use cache'` + tags; CMS edits trigger
on-demand revalidation through `/api/revalidate`.

Sizing: Figma type is presentation-sized (1728px frames). Keep the hierarchy, colours and layout
but use the scaled token set in `src/styles/theme.css` (as in Fortune Decor) — never copy px 1:1.

---

## 3. Data model (Postgres, via Alembic)

| Table                    | Key fields |
|--------------------------|-----------|
| `admin_users`            | email, full_name, password_hash, role (superadmin/editor), is_active, last_login_at |
| `work_categories`        | name, slug, short_description, card_image, heading, intro, sequence, is_active, SEO (card numbers "01" come from the order) |
| `projects`               | category_id, title, slug, short_description, cover_image, intro_image, description, client, project_type, services[], gallery[], is_featured ("Explore more projects" picks these first), sequence, is_active, SEO |
| `services`               | title, description, image, link, sequence, is_active — home "Services We Provide" + contact form "Service required" options |
| `clients`                | name, logo, website, sequence, is_active |
| `faqs`                   | question, answer, sequence, is_active |
| `page_sections`          | page (home/about/contact/our-work), key (hero, showcase, vision_mission, features…), content JSONB, sequence, is_active |
| `site_settings`          | key/value JSONB: brand, contact, socials, footer, map embed, SEO defaults |
| `enquiries`              | type (contact / quote), name, email, phone, service_id + service_name, message, status (new/in_progress/closed), notes, source_page, ip |
| `newsletter_subscribers` | email, status (subscribed/unsubscribed), source_page, ip |
| `media`                  | filename, url, mime, size, width, height, alt_text, uploaded_by |
| `audit_logs`             | admin_id, action, entity, entity_id, summary, ip, created_at |

---

## 4. CMS (same brand theme as the website)

| CMS page        | Does |
|-----------------|------|
| Login           | Email + password → httpOnly cookie |
| Dashboard       | Counts (new enquiries, subscribers, projects), latest enquiries |
| Work categories | CRUD, drag-sort, card image, intro, SEO, active toggle |
| Projects        | CRUD per category, cover/intro image, gallery, client/services, featured + explore flags, drag-sort, SEO |
| Services        | CRUD, image, drag-sort |
| Clients         | Logos CRUD, drag-sort |
| Pages           | Edit Home / About / Contact / Our Work sections (hero, showcase blocks, stats, vision/mission, features…) |
| FAQs            | CRUD, sort |
| Enquiries       | List/filter (type, status, date), detail, status + notes, CSV export |
| Newsletter      | Subscriber list, CSV export |
| Media Library   | Upload, alt text, reuse, in-use guard on delete |
| Settings        | Contact details, socials, footer, map, SEO defaults |
| Users · Audit log · Profile | Superadmin manages editors; who changed what; change password |

---

## 5. Backend API

Public (`:8000`, GET only except forms): `/health` ✅ · `/settings` · `/pages/{page}` · `/work-categories` ·
`/work-categories/{slug}` · `/projects/{slug}` (+ 3 "explore" projects) · `/services` · `/clients` · `/faqs` ·
`POST /enquiries` · `POST /newsletter` (rate limited, honeypot, email notify). No site search (not in the design).

Admin (`:8001`, cookie session except login): `/auth/login|logout|me|password` · CRUD for every table above ·
`PUT …/reorder` · `/pages/sections/{id}` · `/settings/{key}` + `/settings/publish` · `/media` (+ usage guard) ·
`/enquiries` + CSV · `/newsletter` + CSV · `/dashboard` · `/users` + `/audit-logs` (superadmin). Full list at `:8001/docs`.

Security: bcrypt, JWT only in an httpOnly cookie (never in the response body), split CORS, image uploads checked by content and re-encoded (EXIF stripped, no SVG), media/link fields reject unsafe URLs, rate-limit key from Nginx's X-Real-IP (not the spoofable X-Forwarded-For), CSV formula-injection guard,
slowapi rate limits, API docs disabled in production.

---

## 6. Phases

1. **Setup** ✅ — folder structure, both Next apps, FastAPI skeleton (2 apps) with config/DB/auth,
   Alembic + first migration (`admin_users`), `scripts/setup.*` + `scripts/run.*` (Windows + Linux/macOS,
   graceful Ctrl+C), PM2 + Nginx templates, docs.
2. **Design system** ✅ — tokens + the 9 Figma fonts in `src/styles/theme.css` / `src/lib/fonts.ts` (identical in
   both apps); logo, badge, favicons and social icons; Header (pill nav + logo badge, mobile drawer), Footer
   (newsletter form), buttons, section heading, notched showcase block, service carousel, work/project card,
   client logos (marquee + grid), FAQ accordion, Get-in-Touch card, CTA card, stat/feature/info cards, chips
   — previewed at `/styleguide`. CMS login (httpOnly cookie session) + admin shell, tested end to end.
   Content images (from the designer's export + Figma) are in `backend/uploads/figma/{home,services,work-categories,projects,about,clients,brand}`.
   The four `home/showcase-*.jpg` images have the notched title-tab corner baked in.
   **Still missing:** client logos for Prakash Electronics, Archwall and Zero (to be added in the CMS), and paper-cup
   gallery images 2–3 (generated in Canva; add them to the project's gallery in the CMS).
3. **Backend models + APIs** ✅ — 12 tables (migration `23eeb8c3742e`), public + admin routers, media upload
   (content-checked, in-use guard), enquiries + newsletter (honeypot, rate limits, SMTP notify), CSV exports, audit log,
   users, `python -m app.seed` (idempotent: 6 categories, 10 projects, 4 services, 9 clients, 3 FAQs, 16 page sections,
   41 media files). 25 pytest tests against a separate `ananta_graphics_test` database.
4. **Website pages** ✅ — Home, Our Work, `/our-work/[category]`, `/our-work/[category]/[project]` (+ Explore more),
   About, Contact (enquiry form, `?type=quote`, live Google Map), Privacy, Cookies, 404, sitemap/robots,
   `/api/revalidate`. All content from the API via `'use cache'` + tags; CMS edits refresh pages within seconds
   (tested end to end). Production build prerenders every page; category/project routes are blocking so unknown
   slugs return a real 404 and moved projects a 308. No horizontal overflow at 375px.
5. **CMS** ✅ — Dashboard, Work Categories + Projects (drag order, image/gallery pickers, services tags, featured/
   visible toggles, SEO), Services, Clients, FAQs (shared sortable list editor), Pages (form editor generated from
   each section's JSON), Media Library, Enquiries (filters, follow-up status + notes, CSV), Newsletter (CSV, unsubscribe),
   Settings, Users, Audit Log, Profile, "Refresh website". Edits tested end to end: CMS save → live site within seconds.
6. **Forms & email** ✅ — contact/quote/newsletter → DB → SMTP alert to `ENQUIRY_NOTIFY_TO` (Reply-To = visitor,
   header-injection safe, failures never break the form); CMS **Settings → Email notifications** shows the setup
   and sends a test email (also `python -m app.cli send-test-email`). Cookies: no tracking cookies; the Google Map
   loads only after consent ("Show map" / "Always show maps"), changeable under Cookie Settings. 31 backend tests.
7. **QA & deploy** — QA ✅ (production build, Lighthouse 12): Accessibility / Best Practices / SEO **100** on all 6 pages
   (mobile + desktop); Performance **100** desktop, **86–99** mobile (simulated slow 4G; heaviest is Home). Fixed: contrast,
   heading order, redundant alt, 12px minimum text, image sizes, font preloading, AVIF, local-API image optimisation;
   added canonical URLs, LocalBusiness JSON-LD, security headers (nosniff, referrer, frame, permissions, HSTS; CMS also
   noindex + no framing). **Deploy:** pending domain + VPS access — follow `DEPLOYMENT.md`.

## 7. Decisions

- **Footer "Services" link:** left out for now. Footer links are CMS-editable, so it can be added later.
- **Address:** Ananta Graphics, LG-04, Hiral Arcade, Opp. New Court, Athwalines, Surat 395 007, Gujarat, India
  (the Elgin, IL details in the design are placeholders). Phone/email stay CMS-editable settings.
- **Newsletter:** subscribers stored in the CMS with CSV export. A mailing-list service (Brevo recommended)
  can be connected later by pushing new subscribers to its API — no schema change needed.
- **Header search:** none (not in the design).

## 8. Open questions

- Final domain(s), and which mailbox sends/receives enquiry emails (fill `SMTP_*` + `ENQUIRY_NOTIFY_TO`).
- Real phone number and email (the design shows US placeholders).
