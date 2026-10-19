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
        "map_url": "https://www.google.com/maps/search/?api=1&query=Hiral+Arcade+Athwalines+Surat",
        "map_embed_url": "https://www.google.com/maps?q=Hiral+Arcade,+Athwalines,+Surat,+Gujarat&output=embed",
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
                    "title": "Brand Identity",
                    "image": f"{F}/showcase/brand-identity-hero.jpg",
                    "image_alt": "LUXE brand identity tote bag",
                    "href": "/our-work",
                    "bg_color": "#45231a",
                    "gallery": [
                        f"{F}/showcase/brand-identity-card1.jpg",
                        f"{F}/showcase/brand-identity-card2.jpg",
                        f"{F}/work-categories/tags-labels.jpg",
                        f"{F}/projects/custom-retail-packaging.jpg",
                    ],
                },
                {
                    "number": "02",
                    "title": "Print & Editorial",
                    "image": f"{F}/showcase/print-editorial-hero.jpg",
                    "image_alt": "Men's Folio magazine spread",
                    "href": "/our-work",
                    "bg_color": "#742423",
                    "gallery": [
                        f"{F}/showcase/print-editorial-card1.jpg",
                        f"{F}/showcase/print-editorial-card2.jpg",
                        f"{F}/work-categories/printed-materials.jpg",
                        f"{F}/services/designing-printing.jpg",
                    ],
                },
                {
                    "number": "03",
                    "title": "Events & Experiences",
                    "image": f"{F}/showcase/events-experiences-hero.jpg",
                    "image_alt": "Charlotte Jackson business cards",
                    "href": "/our-work",
                    "bg_color": "#c8302b",
                    "gallery": [
                        f"{F}/showcase/events-experiences-card1.jpg",
                        f"{F}/showcase/events-experiences-card2.jpg",
                        f"{F}/work-categories/signage.jpg",
                        f"{F}/about/hero-bazaar-tags.jpg",
                    ],
                },
                {
                    "number": "04",
                    "title": "Corporate Gifting",
                    "image": f"{F}/showcase/corporate-gifting-hero.jpg",
                    "image_alt": "Brandwater corporate gift set",
                    "href": "/our-work",
                    "bg_color": "#1e1a17",
                    "gallery": [
                        f"{F}/showcase/corporate-gifting-card1.jpg",
                        f"{F}/showcase/corporate-gifting-card2.jpg",
                        f"{F}/work-categories/corporate-gifting.jpg",
                        f"{F}/projects/corporate-gift-packaging.jpg",
                    ],
                },
            ],
        }),
        ("services", "Services We Provide", {
            "eyebrow": "Services We Provide",
            "title": "Creative Design Services for Brands That Want to Stand Out",
            "cta_label": "Our Services",
        }),
        ("clients", "Our Clients", {"title": "Our Clients"}),
        ("featured", "Featured work strip", {
            "items": [
                {"image": f"{F}/home/featured-mirel-box.jpg", "image_alt": "Mirél dessert gift box", "href": "/our-work/packaging"},
                {"image": f"{F}/home/featured-packsavvy.jpg", "image_alt": "PackSavvy cloud kitchen food bags", "href": "/our-work/packaging"},
                {"image": f"{F}/home/featured-cookie-bag.jpg", "image_alt": "House-shaped cookie gift bag", "href": "/our-work/packaging"},
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
            "explore_title": "Explore more projects",
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
            _project("nura-candle-boxes", "Nura Candle Boxes", "Printed boxes with bold lettering for a home fragrance range.",
                     f"{F}/projects/explore-nura-boxes.jpg", client="Nura", project_type="Candle Box Design",
                     services=["Graphic Design", "Printing"], is_featured=True),
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
            _project("premium-product-packaging", "Premium Product Packaging",
                     "Custom packaging design with branded graphics and print-ready artwork.",
                     f"{F}/projects/premium-product-packaging.jpg", client="Ritu", project_type="Perfume Box Design",
                     services=["Packaging Design", "Printing"]),
            _project("custom-retail-packaging", "Custom Retail Packaging",
                     "Branded retail packaging that boosts shelf appeal and highlights products.",
                     f"{F}/projects/custom-retail-packaging.jpg", project_type="Retail Box Design",
                     services=["Packaging Design", "Printing"]),
            _project("food-beverage-packaging", "Food & Beverage Packaging",
                     "Clear, branded packaging designs that showcase product information.",
                     f"{F}/projects/food-beverage-packaging.jpg", client="Quickbite", project_type="Food Packaging",
                     services=["Packaging Design", "Printing"]),
            _project("corporate-gift-packaging", "Corporate Gift Packaging",
                     "Branded gift packaging that makes every corporate gift feel considered.",
                     f"{F}/projects/corporate-gift-packaging.jpg", client="Brandwater", project_type="Gift Set Packaging",
                     services=["Brand Identity", "Packaging Design", "Printing"]),
            _project("ecommerce-product-packaging", "E-commerce Product Packaging",
                     "Branded mailer boxes designed for memorable unboxing experiences.",
                     f"{F}/projects/ecommerce-packaging.jpg", client="Meeline", project_type="Mailer Box Design",
                     services=["Packaging Design", "Printing"]),
            _project("custom-printed-boxes", "Custom Printed Boxes",
                     "Custom box packaging with branded designs and print-ready artwork.",
                     f"{F}/projects/custom-printed-boxes.jpg", client="Oula", project_type="Custom Box Design",
                     services=["Illustration", "Packaging Design", "Printing"]),
            _project("paper-cup-packaging", "Paper Cup Packaging",
                     "A clean and simple paper cup design for a café's takeaway range.",
                     f"{F}/projects/paper-cup-gallery-1.jpg",
                     description=(
                         "A clean and simple paper cup design created to give the café a recognizable and "
                         "professional brand presence."
                     ),
                     intro_image=f"{F}/projects/paper-cup-intro.jpg",
                     client="ABC Café", project_type="Paper Cup Design", services=["Graphic Design", "Printing"],
                     gallery=PAPER_CUP_GALLERY),
        ],
    },
    {
        "slug": "signage", "name": "Signage",
        "short_description": "Branded signage that makes your business easy to find, recognize, and remember.",
        "card_image": f"{F}/work-categories/signage.jpg",
        "heading": "Signage",
        "intro": "Shop signs, A-frames, window graphics and wayfinding that make a brand easy to spot.",
        "projects": [],
    },
    {
        "slug": "tags-labels", "name": "Tags & Labels",
        "short_description": "Hang tags, labels and stickers that carry your brand onto every product.",
        "card_image": f"{F}/work-categories/tags-labels.jpg",
        "heading": "Tags & Labels",
        "intro": "Hang tags, product labels and stickers printed on premium stocks with finishes that stand out.",
        "projects": [
            _project("bazaar-gift-packaging", "Bazaar Gift Packaging", "Printed shipping boxes and tags for a gift store.",
                     f"{F}/projects/explore-bazaar-box.jpg", client="Bazaar", project_type="Box & Tag Design",
                     services=["Brand Identity", "Packaging Design"], is_featured=True),
        ],
    },
    {
        "slug": "pouches", "name": "Pouches",
        "short_description": "Flexible pouches and sachets designed to grab attention on the shelf.",
        "card_image": f"{F}/work-categories/pouches.jpg",
        "heading": "Pouches & Flexible Packaging",
        "intro": "Stand-up pouches, sachets and flexible packs designed for shelf impact and print-ready production.",
        "projects": [
            _project("glow-serum-box", "Glow Serum Box", "A die-cut carton and dropper label for a skincare serum.",
                     f"{F}/projects/explore-glow-box.jpg", client="Glow", project_type="Carton Design",
                     services=["Packaging Design", "Printing"], is_featured=True),
        ],
    },
    {
        "slug": "corporate-gifting", "name": "Corporate Gifting",
        "short_description": "Branded gift sets and kits your clients and teams will actually keep.",
        "card_image": f"{F}/work-categories/corporate-gifting.jpg",
        "heading": "Corporate Gifting",
        "intro": "Curated, branded gift kits for clients, teams and events — designed, printed and packed in-house.",
        "projects": [],
    },
]

SERVICES = [
    {"title": "Designing & Printing", "image": f"{F}/services/designing-printing.jpg", "link": "/our-work/printed-materials",
     "description": "Creative graphic design and high-quality printing for branding, marketing and promotional materials."},
    {"title": "Packaging Solutions", "image": f"{F}/services/packaging-solutions.jpg", "link": "/our-work/packaging",
     "description": "Custom packaging designed to protect, present and promote your products on the shelf and online."},
    {"title": "Corporate Gifting", "image": f"{F}/services/gift-box.jpg", "link": "/our-work/corporate-gifting",
     "description": "Branded gift boxes and kits that leave a lasting impression on clients and teams."},
    {"title": "Signage", "image": f"{F}/work-categories/signage.jpg", "link": "/our-work/signage",
     "description": "Shop signs, A-frames and window graphics that make your business easy to find and remember."},
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
