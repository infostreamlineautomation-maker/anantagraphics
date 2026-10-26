"""Content from the Figma design (page "Ananta Graphics") used by `python -m app.seed`.

Copy is taken from the design; where the design repeats placeholder text (e.g. the second row of
Our Work cards), similar copy was written so every item reads on its own. All of it is editable in the CMS.
Images live in backend/uploads/figma/<section>/.
"""

F = "/uploads/figma"

# ---------------------------------------------------------------- settings

SETTINGS = {
    "brand": {
        "name": "Ananta Graphics",
        "logo": f"{F}/brand/logo.png",
        "logo_badge": f"{F}/brand/logo-badge.png",
        "tagline": "Ideas with passion and purpose",
    },
    "contact": {
        "phone": "+91 773-365-1240",
        "email": "office@anantagraphics.com",
        "address": "LG-04, Hiral Arcade, Opp. New Court, Athwalines, Surat 395 007, Gujarat, India",
        "map_url": "https://www.google.com/maps/search/?api=1&query=Ananta+Graphics+Hiral+Arcade+Athwalines+Surat",
        "map_embed_url": "https://maps.google.com/maps?q=Ananta+Graphics,+LG-04,+Hiral+Arcade,+opp.+New+Court+Building,+Meghdoot+Society,+Athwalines,+Athwa,+Surat,+Gujarat+395007&t=&z=17&ie=UTF8&iwloc=&output=embed",
    },
    "socials": {
        "instagram": "https://www.instagram.com/",
        "facebook": "https://www.facebook.com/",
        "linkedin": "https://www.linkedin.com/",
        "youtube": "https://www.youtube.com/",
    },
    "footer": {
        "tagline": "Let’s build brand, print and digital experiences that feel premium everywhere.",
        "newsletter_text": "First access to launches, campaigns, and studio drops.",
        "copyright": "© 2026 Ananta Graphics. All Rights Reserved.",
    },
    "seo": {
        "default_title": "Ananta Graphics | Design, Print & Packaging",
        "default_description": (
            "Ananta Graphics helps businesses bring brand ideas to life through design, printing, "
            "packaging, signage and corporate gifting."
        ),
        "og_image": f"{F}/home/hero-shopfront.jpg",
    },
    "stats": {
        "title": "Delivering Excellence Across India",
        "total_value": "10M+",
        "total_label": "Total Pieces Crafted",
        "cities_value": "25+",
        "cities_label": "Cities Covered",
        "projects_value": "500+",
        "projects_label": "Projects Completed",
        "clients_value": "150+",
        "clients_label": "Happy Clients",
    },
}

# ---------------------------------------------------------------- page sections: (key, CMS label, content)

GET_IN_TOUCH = {
    "title": "Get In Touch",
    "text": "Get product details, pricing, samples, and support. We'll respond within 24 hours.",
}
IDEA_CTA = {
    "title": "Have an idea in mind?",
    "text": "Let's turn it into something people can see, feel and remember.",
    "cta_label": "Request Quote",
    "cta_href": "/contact?type=quote#contact-form",
}

PAGES = {
    "home": [
        ("hero", "Hero", {
            "image": f"{F}/home/hero-shopfront.jpg",
            "image_alt": "Shopfront with Ananta Graphics window graphics for a coffee roaster",
            "caption": "Ideas Turned Into Visuals.",
            "slides": [
                {
                    "media": f"{F}/home/hero-shopfront.jpg",
                    "caption": "Ideas Turned Into Visuals.",
                    "alt": "Shopfront with Ananta Graphics window graphics for a coffee roaster",
                },
                {
                    "media": f"{F}/home/showcase-brand-identity.jpg",
                    "caption": "Crafted with Luxury & Purpose.",
                    "alt": "Ananta Graphics brand identity craftsmanship",
                },
                {
                    "media": f"{F}/home/showcase-print-editorial.jpg",
                    "caption": "Tactile Printing & Editorial Finishes.",
                    "alt": "Fine luxury foiled editorial spreads",
                },
            ],
        }),
        ("stats", "Impact Counter Stripe", {
            "title": "Delivering Excellence Across India",
            "items": [
                {
                    "id": "total",
                    "value": "10M+",
                    "label": "Total Pieces Crafted",
                    "enabled": True,
                },
                {
                    "id": "cities",
                    "value": "25+",
                    "label": "Cities Covered",
                    "enabled": True,
                },
                {
                    "id": "projects",
                    "value": "500+",
                    "label": "Projects Completed",
                    "enabled": True,
                },
                {
                    "id": "clients",
                    "value": "150+",
                    "label": "Happy Clients",
                    "enabled": True,
                },
            ],
            "total_value": "10M+",
            "total_label": "Total Pieces Crafted",
            "cities_value": "25+",
            "cities_label": "Cities Covered",
            "projects_value": "500+",
            "projects_label": "Projects Completed",
            "clients_value": "150+",
            "clients_label": "Happy Clients",
        }),
        ("intro", "What we create", {
            "eyebrow": "WHAT WE CREATE",
            "title": "Visual ideas, made to leave a mark.",
            "lead": (
                "From identity and print to campaigns, events and experiences, we create visual work "
                "that feels considered, distinctive and built for real-world impact."
            ),
        }),
        ("showcase", "Showcase blocks", {
            "items": [
                {
                    "number": "01",
                    "title": "Printing & Designing",
                    "image": f"{F}/showcase/print-editorial-hero.jpg",
                    "image_alt": "Fine printing, catalog, brochure and stationery designing",
                    "href": "/our-work/printed-materials",
                    "bg_color": "#742423",
                    "gallery": [
                        f"{F}/showcase/print-editorial-card1.jpg",
                        f"{F}/showcase/print-editorial-card2.jpg",
                        f"{F}/work-categories/printed-materials.jpg",
                        f"{F}/services/designing-printing.jpg",
                    ],
                },
                {
                    "number": "02",
                    "title": "Packaging Solutions",
                    "image": f"{F}/projects/custom-printed-boxes.jpg",
                    "image_alt": "Custom printed boxes and branded product packaging",
                    "href": "/our-work/packaging",
                    "bg_color": "#45231a",
                    "gallery": [
                        f"{F}/work-categories/packaging.jpg",
                        f"{F}/projects/custom-retail-packaging.jpg",
                        f"{F}/projects/ecommerce-packaging.jpg",
                        f"{F}/work-categories/pouches.jpg",
                    ],
                },
                {
                    "number": "03",
                    "title": "Signages Solutions",
                    "image": f"{F}/work-categories/signage.jpg",
                    "image_alt": "Architectural, retail and outdoor signage solutions",
                    "href": "/our-work/signage",
                    "bg_color": "#1f2937",
                    "gallery": [
                        f"{F}/home/hero-shopfront.jpg",
                        f"{F}/showcase/brand-identity-card2.jpg",
                        f"{F}/showcase/events-experiences-card2.jpg",
                        f"{F}/work-categories/signage.jpg",
                    ],
                },
                {
                    "number": "04",
                    "title": "Corporate Gifting",
                    "image": f"{F}/showcase/corporate-gifting-hero.jpg",
                    "image_alt": "Brandwater luxury corporate gifting kit",
                    "href": "/our-work/corporate-gifting",
                    "bg_color": "#1e1a17",
                    "gallery": [
                        f"{F}/showcase/corporate-gifting-card1.jpg",
                        f"{F}/showcase/corporate-gifting-card2.jpg",
                        f"{F}/work-categories/corporate-gifting.jpg",
                        f"{F}/projects/corporate-gift-packaging.jpg",
                    ],
                },
                {
                    "number": "05",
                    "title": "Overseas Work",
                    "image": f"{F}/showcase/brand-identity-hero.jpg",
                    "image_alt": "International brand printing and export packaging solutions",
                    "href": "/our-work/overseas-work",
                    "bg_color": "#1d3557",
                    "gallery": [
                        f"{F}/showcase/brand-identity-card1.jpg",
                        f"{F}/showcase/events-experiences-card1.jpg",
                        f"{F}/projects/paper-cup-gallery-1.jpg",
                        f"{F}/about/hero-bazaar-tags.jpg",
                    ],
                },
            ],
        }),
        ("services", "Services We Provide", {
            "eyebrow": "Services We Provide",
            "title": "Creative Design Services for Brands That Want to Stand Out",
            "cta_label": "View Project Work",
        }),
        ("clients", "Our Clients", {"title": "Our Clients"}),
        ("featured", "Featured work strip", {
            "items": [
                {
                    "media_type": "instagram",
                    "instagram_url": "https://www.instagram.com/p/DdSsVGhIurr/",
                    "video_url": "/uploads/reels/DdSsVGhIurr.mp4",
                    "media": "/uploads/reels/DdSsVGhIurr.mp4",
                    "poster": "/uploads/reels/DdSsVGhIurr.jpg",
                    "image": "/uploads/reels/DdSsVGhIurr.jpg",
                    "caption": "Luxury dessert gift packaging — Ananta Graphics",
                    "href": "https://www.instagram.com/p/DdSsVGhIurr/",
                },
                {
                    "media_type": "instagram",
                    "instagram_url": "https://www.instagram.com/p/DbjxF3DzOsy/",
                    "video_url": "/uploads/reels/DbjxF3DzOsy.mp4",
                    "media": "/uploads/reels/DbjxF3DzOsy.mp4",
                    "poster": "/uploads/reels/DbjxF3DzOsy.jpg",
                    "image": "/uploads/reels/DbjxF3DzOsy.jpg",
                    "caption": "PackSavvy cloud kitchen food bags — Ananta Graphics",
                    "href": "https://www.instagram.com/p/DbjxF3DzOsy/",
                },
                {
                    "media_type": "instagram",
                    "instagram_url": "https://www.instagram.com/p/DZWSGgvDkPW/",
                    "video_url": "/uploads/reels/DZWSGgvDkPW.mp4",
                    "media": "/uploads/reels/DZWSGgvDkPW.mp4",
                    "poster": "/uploads/reels/DZWSGgvDkPW.jpg",
                    "image": "/uploads/reels/DZWSGgvDkPW.jpg",
                    "caption": "House-shaped cookie gift bag — Ananta Graphics",
                    "href": "https://www.instagram.com/p/DZWSGgvDkPW/",
                },
            ],
        }),
    ],
    "about": [
        ("hero", "Hero", {
            "title": "Visual ideas, made to leave a mark.",
            "text": (
                "Ananta Graphics is a creative design and production company helping businesses bring their "
                "brand ideas to life through design, printing, packaging, signage and corporate gifting."
            ),
            "cta_label": "Let’s Work Together",
            "cta_href": "/contact",
            "image": f"{F}/about/hero-bazaar-tags.jpg",
            "image_alt": "Bazaar hang tags",
            "stats": [
                {"value": "360", "label": "Brand, print and digital thinking"},
                {"value": "Fast", "label": "Production-ready execution"},
                {"value": "Premium", "label": "Finishes that feel considered"},
            ],
        }),
        ("vision_mission", "Vision & Mission", {
            "items": [
                {
                    "eyebrow": "See beyond the brief",
                    "title": "Our Vision",
                    "paragraphs": [
                        "To become a trusted creative partner for brands everywhere through ideas, quality and "
                        "customer-focused production.",
                        "We aim to help businesses grow with design, print and packaging that is distinctive, "
                        "consistent and built for the real world.",
                    ],
                },
                {
                    "eyebrow": "Deliver with precision",
                    "title": "Our Mission",
                    "paragraphs": [
                        "To deliver high-quality design, printing and packaging solutions that help businesses grow.",
                        "We are committed to creativity, ethical practices, sustainable materials and exceptional "
                        "customer satisfaction to build long-term partnerships.",
                    ],
                },
            ],
        }),
        ("clients", "Our Clients", {"title": "Our Clients"}),
        ("story", "Built around creativity", {
            "title": "Built around creativity. Driven by detail.",
            "paragraphs": [
                "At Ananta Graphics, we believe great design is more than something that looks good — it should "
                "communicate clearly, represent a brand confidently and work in the real world.",
                "From the first concept to the final printed piece, we bring together creative thinking, practical "
                "execution and attention to detail to deliver visual solutions that businesses can use, share and "
                "remember.",
            ],
            "chips": ["Brand Strategy", "AI Production", "Web Experiences", "Print Solutions"],
            "image": f"{F}/about/bazaar-box.jpg",
            "image_alt": "Bazaar printed shipping boxes",
        }),
        ("features", "Feature cards", {
            "items": [
                {"title": "Premium Print", "text": "Luxury business cards, brochures and marketing collaterals finished with crisp detail."},
                {"title": "Creative Branding", "text": "Packaging, mockups and campaign visuals designed to feel polished, modern and memorable."},
                {"title": "Large Format", "text": "Signage, retail panels and exhibition graphics produced to stand out at every scale."},
                {"title": "Packaging Care", "text": "Premium materials, consistent color output and dependable delivery for every production run."},
            ],
        }),
        ("contact_cta", "Get in touch & CTA", {"get_in_touch": GET_IN_TOUCH, "cta": IDEA_CTA}),
    ],
    "contact": [
        ("hero", "Hero", {
            "image": f"{F}/home/hero-shopfront.jpg",
            "image_alt": "Shopfront with Ananta Graphics window graphics",
            "title": "Let’s talk about your next project.",
            "text": (
                "Have a design, printing, packaging, signage or corporate gifting requirement? Tell us what you "
                "have in mind and we’ll get back to you."
            ),
        }),
        ("form", "Contact form", {
            "eyebrow": "Contact Form",
            "title": "Tell us about your project.",
            "submit_label": "Send Message",
        }),
    ],
    "our-work": [
        ("intro", "Our Work header", {
            "eyebrow": "Our Works",
            "title": "Designed to be seen. Made to be remembered.",
            "lead": (
                "Explore our range of printed, packaged and branded products created for businesses, events "
                "and everyday brand communication."
            ),
        }),
        ("project_header", "Project page header", {
            "eyebrow": "Our Work",
            "title": "Selected projects, created with purpose.",
            "lead": (
                "Explore a selection of projects where design, print and brand communication come together to "
                "create meaningful visual experiences."
            ),
        }),
    ],
}

# ---------------------------------------------------------------- our work

PAPER_CUP_GALLERY = [f"{F}/projects/paper-cup-gallery-1.jpg"]


def _project(slug, title, text, cover, **extra):
    return {
        "slug": slug,
        "title": title,
        "short_description": text,
        "cover_image": cover,
        "gallery": extra.pop("gallery", [cover]),
        **extra,
    }


WORK_CATEGORIES = [
    {
        "slug": "printed-materials", "name": "Printed Materials",
        "short_description": "Professional print products created for everyday business and marketing needs.",
        "card_image": f"{F}/work-categories/printed-materials.jpg",
        "heading": "Printed Materials",
        "intro": "Business stationery, brochures and marketing collateral, designed and printed with care for every detail.",
        "projects": [
            _project("kalamandir-jewellery-catalogue", "Kalamandir Jewellery Catalogue & Suite",
                     "Bespoke gold-foiled luxury jewellery catalogues, certificates & textured brand collateral.",
                     "/uploads/services/kalamandir-jewellery-catalogue.jpg",
                     intro_image="/uploads/services/kalamandir-jewellery-catalogue.jpg",
                     description=(
                         "Bespoke gold-foiled luxury jewellery catalogues, certificate folders, and textured brand collateral "
                         "designed and printed for Kalamandir Jewellers' flagship collections."
                     ),
                     client="Kalamandir Jewellers", project_type="Luxury Jewellery Catalogue & Suite",
                     services=["Fine Printing", "Graphic Design", "Gold Foiling", "Textured Papers"], is_featured=True),
            _project("gujarat-gas-corporate-suite", "Gujarat Gas Corporate Annual Report & Collateral",
                     "Precision printed corporate annual reports, technical publications & executive stationery suites.",
                     f"{F}/showcase/print-editorial-hero.jpg",
                     intro_image=f"{F}/showcase/print-editorial-hero.jpg",
                     description=(
                         "High-volume corporate annual report publications, safety documentation, and premium branded "
                         "executive stationery suites for Gujarat Gas."
                     ),
                     client="Gujarat Gas", project_type="Annual Report & Stationery Suite",
                     services=["Editorial Design", "Corporate Printing", "Foil Stamping", "Executive Stationery"]),
            _project("amardeep-aggregates-profile", "Amardeep Aggregates Corporate Profile",
                     "Multi-page industrial company profiles and infrastructure product catalogues with matte finish.",
                     f"{F}/showcase/brand-identity-hero.jpg",
                     intro_image=f"{F}/showcase/brand-identity-hero.jpg",
                     description=(
                         "Heavy-weight multi-page company profiles, technical specification sheets, and marketing brochures "
                         "designed and produced for Amardeep Aggregates."
                     ),
                     client="Amardeep Aggregates", project_type="Industrial Corporate Brochure",
                     services=["Graphic Design", "Brochure Printing", "Matte Lamination", "Die-Cut Folders"]),
        ],
    },
    {
        "slug": "packaging", "name": "Packaging",
        "short_description": "Custom packaging solutions designed to protect, present and promote your products.",
        "card_image": f"{F}/work-categories/packaging.jpg",
        "heading": "Packaging Solutions",
        "intro": (
            "Discover our selected packaging projects, showcasing creative concepts, custom designs, and "
            "print-ready solutions tailored to each client's needs."
        ),
        "projects": [
            _project("mahalaxmi-juice-packaging", "Mahalaxmi Juice & Fast Food Packaging",
                     "Custom food-grade takeaway boxes, beverage bottle labels & eco-friendly packaging.",
                     "/uploads/services/mahalaxmi-juice-packaging.jpg",
                     intro_image="/uploads/services/mahalaxmi-juice-packaging.jpg",
                     description=(
                         "Custom food-grade takeaway boxes, beverage bottle labels, and eco-friendly packaging solutions "
                         "engineered for quick-service food presentation and durability."
                     ),
                     client="Mahalaxmi Juice & Fast Food Corner", project_type="Food & Beverage Packaging",
                     services=["Packaging Design", "Food Grade Printing", "Eco Takeaway Boxes", "Label Design"], is_featured=True),
            _project("dero-retail-packaging", "Dero Custom Retail Packaging",
                     "Custom rigid presentation boxes and branded retail product packaging with spot UV.",
                     f"{F}/projects/custom-printed-boxes.jpg",
                     intro_image=f"{F}/projects/custom-printed-boxes.jpg",
                     description=(
                         "Custom die-cut packaging boxes engineered with rigid board, precision spot UV, and vibrant brand "
                         "graphics for Dero retail merchandise."
                     ),
                     client="Dero", project_type="Retail Product Packaging",
                     services=["Packaging Design", "Custom Die-Cut Boxes", "Spot UV", "Offset Printing"]),
            _project("ba-prerna-eco-packaging", "BA Prerna Cleanearth Eco Packaging",
                     "100% recyclable kraft mailer boxes, biodegradable food containers & soy-ink printed sleeves.",
                     f"{F}/projects/ecommerce-packaging.jpg",
                     intro_image=f"{F}/projects/ecommerce-packaging.jpg",
                     description=(
                         "Environmentally conscious packaging solutions manufactured with certified post-consumer recycled "
                         "fiber and non-toxic soy inks for BA Prerna Cleanearth."
                     ),
                     client="BA Prerna Cleanearth", project_type="Sustainable Packaging",
                     services=["Sustainable Packaging", "Kraft Paper Boxes", "Soy Inks", "Biodegradable Sleeves"]),
        ],
    },
    {
        "slug": "signage", "name": "Signage",
        "short_description": "Branded signage that makes your business easy to find, recognize, and remember.",
        "card_image": f"{F}/work-categories/signage.jpg",
        "heading": "Signage",
        "intro": "Shop signs, A-frames, window graphics and wayfinding that make a brand easy to spot.",
        "projects": [
            _project("svaraa-store-signage", "Svaraa Diamond Jewellery Store Signage",
                     "Precision laser-cut 3D architectural signage & illuminated store identity displays.",
                     "/uploads/services/svaraa-store-signage.jpg",
                     intro_image="/uploads/services/svaraa-store-signage.jpg",
                     description=(
                         "Precision laser-cut 3D architectural signage and illuminated store identity displays crafted "
                         "for Svaraa Diamond Jewellery flagship showrooms."
                     ),
                     client="Svaraa Diamond Jewellery", project_type="3D Architectural Signage",
                     services=["Signage Design", "Laser Cutting", "Illuminated Displays", "Architectural Brass"], is_featured=True),
            _project("gujarat-gas-safety-signage", "Gujarat Gas Industrial & Safety Signage",
                     "Reflective outdoor regulatory signs, wayfinding totems & industrial plant safety signage.",
                     f"{F}/work-categories/signage.jpg",
                     intro_image=f"{F}/work-categories/signage.jpg",
                     description=(
                         "High-durability reflective outdoor signs, emergency route wayfinding totems, and facility safety "
                         "indicators engineered for Gujarat Gas industrial plants."
                     ),
                     client="Gujarat Gas", project_type="Industrial Safety & Wayfinding Signage",
                     services=["Industrial Signage", "Reflective Graphics", "Wayfinding Totems", "Safety Displays"]),
            _project("kalamandir-showroom-signage", "Kalamandir Luxury Boutique Signage",
                     "Warm backlit 3D acrylic & gold PVD coated architectural lettering for luxury jewellery boutiques.",
                     f"{F}/home/hero-shopfront.jpg",
                     intro_image=f"{F}/home/hero-shopfront.jpg",
                     description=(
                         "Architectural boutique storefront signage featuring gold PVD stainless steel lettering and diffused "
                         "warm LED halo illumination for luxury showrooms."
                     ),
                     client="Kalamandir Jewellers", project_type="Luxury Boutique Acrylic Signage",
                     services=["Storefront Signage", "Backlit 3D Letters", "Gold PVD Coating", "Boutique Fabrication"]),
        ],
    },
    {
        "slug": "corporate-gifting", "name": "Corporate Gifting",
        "short_description": "Branded gift sets and kits your clients and teams will actually keep.",
        "card_image": f"{F}/work-categories/corporate-gifting.jpg",
        "heading": "Corporate Gifting",
        "intro": "Curated, branded gift kits for clients, teams and events — designed, printed and packed in-house.",
        "projects": [
            _project("mountain-rocko-gifting", "Mountain Rocko Executive Gift Kit",
                     "Premium executive gift hampers, matte-finish insulated drinkware & custom desk kits.",
                     "/uploads/services/mountain-rocko-gifting.jpg",
                     intro_image="/uploads/services/mountain-rocko-gifting.jpg",
                     description=(
                         "Premium executive gift hampers, matte-finish insulated drinkware, and custom desk kits fabricated "
                         "for Mountain Rocko corporate partners."
                     ),
                     client="Mountain Rocko", project_type="Executive Gift Hamper",
                     services=["Corporate Gifting", "Custom Fabrication", "Branded Merchandise", "Rigid Box Hamper"], is_featured=True),
            _project("ba-prerna-gift-hamper", "BA Prerna Cleanearth Sustainable Hamper",
                     "Eco-friendly corporate gift hampers with wooden keepsakes, seed paper notebooks & bamboo drinkware.",
                     f"{F}/showcase/corporate-gifting-hero.jpg",
                     intro_image=f"{F}/showcase/corporate-gifting-hero.jpg",
                     description=(
                         "Curated sustainable gift hampers featuring custom engraved pine wood boxes, recycled paper journals, "
                         "and seed pens for eco-conscious events."
                     ),
                     client="BA Prerna Cleanearth", project_type="Sustainable Corporate Gifting Suite",
                     services=["Eco Gifting", "Custom Wooden Hampers", "Seed Paper Stationery", "Laser Engraving"]),
            _project("amardeep-milestone-kit", "Amardeep Aggregates Executive Milestone Kit",
                     "Foil-stamped rigid magnetic gift boxes with engraved executive pens, leather diaries & tech accessories.",
                     f"{F}/showcase/corporate-gifting-card1.jpg",
                     intro_image=f"{F}/showcase/corporate-gifting-card1.jpg",
                     description=(
                         "Commemorative corporate milestone gift boxes featuring soft-touch lamination, laser-engraved metal items, "
                         "and custom presentation packaging."
                     ),
                     client="Amardeep Aggregates", project_type="Executive Milestone Kit",
                     services=["Rigid Magnetic Boxes", "Laser Engraving", "Executive Diaries", "Custom Inserts"]),
        ],
    },
    {
        "slug": "overseas-work", "name": "Overseas Work",
        "short_description": "International brand printing, export packaging and global brand communication.",
        "card_image": f"{F}/showcase/brand-identity-hero.jpg",
        "heading": "Overseas Work",
        "intro": "Custom packaging, print collateral and branding solutions delivered for international clients.",
        "projects": [
            _project("dgla-certification-packaging", "DGLA International Diamond Certification Suite",
                     "Security-printed gemological certificate folders, holographic seal wallets & diamond parcel boxes.",
                     f"{F}/showcase/events-experiences-card1.jpg",
                     intro_image=f"{F}/showcase/events-experiences-card1.jpg",
                     description=(
                         "Tamper-evident international gemological certificate wallets, custom foil-embossed grading report "
                         "folders, and presentation diamond parcels for DGLA."
                     ),
                     client="DGLA – Diamond & Gem Laboratories of America", project_type="Gemological Security Packaging",
                     services=["Security Printing", "Holographic Foil", "Rigid Certificate Folders", "Export Packaging"]),
            _project("dero-export-merchandise", "Dero Global Export Merchandise & Packaging",
                     "High-density packaging and export-grade branded merchandise for international retail distribution.",
                     f"{F}/showcase/brand-identity-card1.jpg",
                     intro_image=f"{F}/showcase/brand-identity-card1.jpg",
                     description=(
                         "International-standard export packaging and branded apparel merchandise designed and fabricated "
                         "for global retail fulfillment."
                     ),
                     client="Dero", project_type="Global Export Product Packaging",
                     services=["Export Packaging", "Die-Cut Fabrication", "Apparel Branding", "Global Fulfillment"]),
        ],
    },
]

SERVICES = [
    {
        "title": "Designing & Printing",
        "client_name": "Kalamandir Jewellers",
        "image": "/uploads/services/kalamandir-jewellery-catalogue.jpg",
        "link": "/our-work/printed-materials/kalamandir-jewellery-catalogue",
        "description": "Bespoke gold-foiled luxury jewellery catalogues, certificates & textured brand collateral.",
    },
    {
        "title": "Packaging Solutions",
        "client_name": "Mahalaxmi Juice & Fast Food",
        "image": "/uploads/services/mahalaxmi-juice-packaging.jpg",
        "link": "/our-work/packaging/mahalaxmi-juice-packaging",
        "description": "Custom food-grade takeaway boxes, beverage bottle labels & eco-friendly packaging.",
    },
    {
        "title": "Corporate Gifting",
        "client_name": "Mountain Rocko",
        "image": "/uploads/services/mountain-rocko-gifting.jpg",
        "link": "/our-work/corporate-gifting/mountain-rocko-gifting",
        "description": "Premium executive gift hampers, matte-finish insulated drinkware & custom desk kits.",
    },
    {
        "title": "Signage Solutions",
        "client_name": "Svaraa Diamond Jewellery",
        "image": "/uploads/services/svaraa-store-signage.jpg",
        "link": "/our-work/signage/svaraa-store-signage",
        "description": "Precision laser-cut 3D architectural signage & illuminated store identity displays.",
    },
]

CLIENTS = [
    ("Kalamandir", "kalamandir.png"),
    ("Svaraa", "svaraa.png"),
    ("Gujarat Gas", "gujarat-gas.png"),
    ("Mahalaxmi Juice & Fast Food Corner", "mahalaxmi.png"),
    ("Amardeep Aggregates", "amardeep-aggregates.png"),
    ("DGLA – Diamond & Gem Laboratories of America", "dgla.png"),
    ("Dero", "dero.png"),
    ("Mountain Rocko", "mountain-rocko.png"),
    ("BA Prerna Cleanearth", "ba-prerna.png"),
]

FAQS = [
    ("Can I customize products?",
     "Yes. Every piece is designed around your brand — sizes, materials, finishes and artwork are all tailored to your requirement."),
    ("What is MOQ?",
     "Minimum order quantities depend on the product and print process. We'll confirm the MOQ with your quote, and small runs are often possible."),
    ("Do you provide samples?",
     "Yes. We share digital proofs for approval and can produce physical samples or a pre-production piece before the full run."),
]

# Alt text for the media library, keyed by path under uploads/figma/
MEDIA_ALT = {
    "brand/logo.png": "Ananta Graphics logo",
    "brand/logo-badge.png": "Ananta Graphics badge",
    "home/hero-shopfront.jpg": "Shopfront window graphics for a coffee roaster",
    "home/showcase-brand-identity.jpg": "LUXE brand identity",
    "home/showcase-print-editorial.jpg": "Men's Folio magazine spread",
    "home/showcase-events-experiences.jpg": "Charlotte Jackson business cards",
    "home/showcase-corporate-gifting.jpg": "Brandwater corporate gift set",
    "home/featured-mirel-box.jpg": "Mirél dessert gift box",
    "home/featured-packsavvy.jpg": "PackSavvy food bags",
    "home/featured-cookie-bag.jpg": "Cookie gift bag",
    "services/designing-printing.jpg": "Oat Haven bottle label",
    "services/packaging-solutions.jpg": "Embossed membership cards",
    "services/gift-box.jpg": "Cookie gift box",
    "work-categories/printed-materials.jpg": "Nura printed boxes",
    "work-categories/packaging.jpg": "Pasta packaging boxes",
    "work-categories/signage.jpg": "Bowl'd salad bar A-frame sign",
    "work-categories/tags-labels.jpg": "Bazaar hang tags",
    "work-categories/pouches.jpg": "Naturo mango pouch",
    "work-categories/corporate-gifting.jpg": "Branded gift box",
    "projects/premium-product-packaging.jpg": "Ritu perfume box",
    "projects/custom-retail-packaging.jpg": "Drip tea retail boxes",
    "projects/food-beverage-packaging.jpg": "Quickbite meal box",
    "projects/corporate-gift-packaging.jpg": "Brandwater gift set",
    "projects/ecommerce-packaging.jpg": "Meeline mailer box",
    "projects/custom-printed-boxes.jpg": "Oula printed boxes",
    "projects/paper-cup-intro.jpg": "Nam Nam café sign",
    "projects/paper-cup-gallery-1.jpg": "Paper cups in branded carriers",
    "projects/explore-nura-boxes.jpg": "Nura candle boxes",
    "projects/explore-glow-box.jpg": "Glow serum carton",
    "projects/explore-bazaar-box.jpg": "Bazaar shipping boxes",
    "about/hero-bazaar-tags.jpg": "Bazaar hang tags",
    "about/bazaar-box.jpg": "Bazaar shipping boxes",
}
