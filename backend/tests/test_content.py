"""Public website API, against the seeded Figma content."""


def test_seed_is_idempotent(seeded):
    from app.seed import run

    assert seeded["work"] > 0 and seeded["pages"] > 0
    assert all(v == 0 for v in run().values())


def test_settings_and_pages(public_client, seeded):
    s = public_client.get("/settings").json()
    assert s["brand"]["name"] == "Ananta Graphics"
    assert "Surat" in s["contact"]["address"]

    home = public_client.get("/pages/home").json()["sections"]
    assert [i["number"] for i in home["showcase"]["items"]] == ["01", "02", "03", "04"]
    assert public_client.get("/pages/our-work").status_code == 200
    assert public_client.get("/pages/secret").status_code == 404


def test_work_category_lists_only_active_projects(public_client, admin_client, seeded):
    cats = public_client.get("/work-categories").json()
    assert [c["slug"] for c in cats][:3] == ["printed-materials", "packaging", "signage"]

    packaging = public_client.get("/work-categories/packaging").json()
    assert packaging["heading"] == "Packaging Solutions"
    first = packaging["projects"][0]
    admin_client.patch(f"/projects/{first['id']}", json={"is_active": False})
    slugs = [p["slug"] for p in public_client.get("/work-categories/packaging").json()["projects"]]
    assert first["slug"] not in slugs
    assert public_client.get(f"/projects/{first['slug']}").status_code == 404


def test_project_detail_and_explore_more(public_client, seeded):
    p = public_client.get("/projects/paper-cup-packaging").json()
    assert p["client"] == "ABC Café"
    assert p["services"] == ["Graphic Design", "Printing"]
    assert p["category"]["slug"] == "packaging"
    explore = p["explore"]
    assert len(explore) == 3
    assert "paper-cup-packaging" not in [e["slug"] for e in explore]
    # Featured projects come first in "Explore more projects"
    assert {e["slug"] for e in explore} == {"nura-candle-boxes", "bazaar-gift-packaging", "glow-serum-box"}
    assert all(e["category_name"] for e in explore)


def test_hidden_category_hides_its_projects(public_client, admin_client, seeded):
    cat = next(c for c in admin_client.get("/work-categories").json() if c["slug"] == "pouches")
    admin_client.patch(f"/work-categories/{cat['id']}", json={"is_active": False})
    assert public_client.get("/work-categories/pouches").status_code == 404
    assert public_client.get("/projects/glow-serum-box").status_code == 404
    explore = public_client.get("/projects/paper-cup-packaging").json()["explore"]
    assert "glow-serum-box" not in [e["slug"] for e in explore]


def test_services_clients_faqs(public_client, admin_client, seeded):
    services = public_client.get("/services").json()
    assert services[0]["title"] == "Designing & Printing"
    clients = public_client.get("/clients").json()
    assert len(clients) >= 8 and all(c["logo"].startswith("/uploads/") for c in clients)
    faqs = public_client.get("/faqs").json()
    admin_client.patch(f"/faqs/{faqs[0]['id']}", json={"is_active": False})
    assert len(public_client.get("/faqs").json()) == len(faqs) - 1
