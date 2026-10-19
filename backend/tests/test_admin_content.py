"""CMS editing: work categories, projects, sortable lists, pages, settings."""


def test_category_slugs_and_delete_guard(admin_client):
    a = admin_client.post("/work-categories", json={"name": "Brand Identity"}).json()
    assert a["slug"] == "brand-identity"
    b = admin_client.post("/work-categories", json={"name": "Brand Identity"}).json()
    assert b["slug"] == "brand-identity-2"
    assert admin_client.post("/work-categories", json={"name": "X", "slug": "brand-identity"}).status_code == 409
    assert admin_client.post("/work-categories", json={"name": "X", "slug": "Not A Slug"}).status_code == 422

    admin_client.post("/projects", json={"category_id": a["id"], "title": "Luxe"})
    assert admin_client.delete(f"/work-categories/{a['id']}").status_code == 409
    assert admin_client.delete(f"/work-categories/{b['id']}").status_code == 204


def test_project_crud_reorder_and_move(admin_client):
    cat = admin_client.post("/work-categories", json={"name": "Print"}).json()
    other = admin_client.post("/work-categories", json={"name": "Signs"}).json()
    ids = [
        admin_client.post("/projects", json={"category_id": cat["id"], "title": t, "services": [" Design ", "", "Print"]}).json()["id"]
        for t in ("One", "Two", "Three")
    ]
    p = admin_client.get(f"/projects/{ids[0]}").json()
    assert p["services"] == ["Design", "Print"] and p["category_name"] == "Print"

    assert admin_client.put(f"/projects/reorder?category_id={cat['id']}", json={"ids": ids[::-1]}).status_code == 204
    listed = admin_client.get(f"/projects?category_id={cat['id']}").json()["items"]
    assert [x["id"] for x in listed] == ids[::-1]
    # Reordering can't pull in projects from another category
    stray = admin_client.post("/projects", json={"category_id": other["id"], "title": "Stray"}).json()["id"]
    assert admin_client.put(f"/projects/reorder?category_id={cat['id']}", json={"ids": [stray]}).status_code == 400

    moved = admin_client.patch(f"/projects/{ids[0]}", json={"category_id": other["id"]}).json()
    assert moved["category_id"] == other["id"] and moved["sequence"] == 1
    assert admin_client.get("/projects?q=thr").json()["total"] == 1
    assert admin_client.delete(f"/projects/{ids[1]}").status_code == 204


def test_media_and_link_fields_reject_unsafe_values(admin_client):
    cat = admin_client.post("/work-categories", json={"name": "Safe"}).json()
    for bad in ("javascript:alert(1)", "http://evil.example/x.png", "/uploads/../.env", "/etc/passwd"):
        res = admin_client.post("/projects", json={"category_id": cat["id"], "title": "x", "cover_image": bad})
        assert res.status_code == 422, bad
    assert admin_client.post("/services", json={"title": "S", "link": "javascript:alert(1)"}).status_code == 422
    assert admin_client.post("/services", json={"title": "S", "link": "//evil.example"}).status_code == 422
    assert admin_client.post("/services", json={"title": "S", "link": "/our-work/packaging"}).status_code == 201
    assert admin_client.post("/clients", json={"name": "No logo"}).status_code == 422


def test_sortable_lists(admin_client):
    ids = [admin_client.post("/faqs", json={"question": f"Question {i}?", "answer": "A"}).json()["id"] for i in range(3)]
    assert admin_client.put("/faqs/reorder", json={"ids": [ids[2], ids[0], ids[1]]}).status_code == 204
    assert [f["id"] for f in admin_client.get("/faqs").json()] == [ids[2], ids[0], ids[1]]
    assert admin_client.patch(f"/faqs/{ids[0]}", json={"answer": "Updated"}).json()["answer"] == "Updated"
    assert admin_client.delete(f"/faqs/{ids[1]}").status_code == 204
    assert admin_client.get(f"/faqs/{ids[1]}").status_code == 404


def test_pages_and_settings(admin_client, public_client, seeded, monkeypatch):
    hero = next(s for s in admin_client.get("/pages/home").json() if s["key"] == "hero")
    content = {**hero["content"], "caption": "New caption"}
    assert admin_client.patch(f"/pages/sections/{hero['id']}", json={"content": content}).status_code == 200
    assert public_client.get("/pages/home").json()["sections"]["hero"]["caption"] == "New caption"

    contact = admin_client.get("/settings").json()["contact"]
    res = admin_client.put("/settings/contact", json={"value": {**contact, "phone": "+91 99999 99999"}})
    assert res.status_code == 200
    assert public_client.get("/settings").json()["contact"]["phone"] == "+91 99999 99999"
    assert admin_client.put("/settings/unknown", json={"value": {}}).status_code == 404

    # "Refresh website" reports a server that can't reach the website instead of pretending it worked
    from app.services import revalidate

    assert admin_client.post("/settings/publish").status_code == 502  # tests run without REVALIDATE_SECRET
    sent: list[tuple[str, ...]] = []
    monkeypatch.setattr("app.routers.admin.settings.revalidate_site", lambda *tags: sent.append(tags) or True)
    assert admin_client.post("/settings/publish").json() == {"ok": True}
    assert "settings" in sent[0]
    assert revalidate.revalidate_site("settings") is False


def test_dashboard_counts(admin_client, seeded):
    d = admin_client.get("/dashboard").json()
    assert d["work_categories"] == 6 and d["projects"] >= 10 and d["clients"] >= 8
    assert d["enquiries_total"] == 0
