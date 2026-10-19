"""Website forms (enquiries, newsletter), CMS inbox, CSV export and media uploads."""
from tests.conftest import png_bytes


def test_enquiry_keeps_service_name_and_drops_honeypot(public_client, admin_client, seeded):
    service = public_client.get("/services").json()[1]
    res = public_client.post("/enquiries", json={
        "name": "Riya Shah", "email": "Riya@Example.com", "phone": "+91 98250 00000",
        "service_id": service["id"], "message": "Need 500 boxes", "source_page": "/contact",
    })
    assert res.status_code == 201 and res.json()["ok"]
    bot = public_client.post("/enquiries", json={"name": "Bot", "email": "bot@example.com", "website": "spam"})
    assert bot.status_code == 201

    items = admin_client.get("/enquiries").json()["items"]
    assert len(items) == 1
    e = items[0]
    assert e["email"] == "riya@example.com" and e["service_name"] == service["title"] and e["status"] == "new"

    # The name survives the service being deleted
    admin_client.delete(f"/services/{service['id']}")
    assert admin_client.get(f"/enquiries/{e['id']}").json()["service_name"] == service["title"]

    updated = admin_client.patch(f"/enquiries/{e['id']}", json={"status": "in_progress", "notes": "Called back"}).json()
    assert updated["status"] == "in_progress"
    assert admin_client.get("/enquiries?status=new").json()["total"] == 0


def test_anti_spam_filters_and_phone_normalization(public_client, admin_client):
    # Secondary honeypot dropped
    r1 = public_client.post("/enquiries", json={"name": "Bot Two", "email": "b2@example.com", "user_company_url": "https://evil.com"})
    assert r1.status_code == 201

    # Velocity / time-to-submit dropped
    r2 = public_client.post("/enquiries", json={"name": "Fast Bot", "email": "fast@example.com", "elapsed_ms": 350})
    assert r2.status_code == 201

    # Disposable burner email dropped
    r3 = public_client.post("/enquiries", json={"name": "Spam Lead", "email": "spammer@mailinator.com", "message": "hello"})
    assert r3.status_code == 201

    # Cyrillic bot spam dropped
    r4 = public_client.post("/enquiries", json={"name": "Иван Смирнов", "email": "ivan@example.com", "message": "Привет качественная раскрутка сайта"})
    assert r4.status_code == 201

    # Spam keyword dropped
    r5 = public_client.post("/enquiries", json={"name": "SEO Seller", "email": "seller@example.com", "message": "Check our seo ranking and backlink service"})
    assert r5.status_code == 201

    # None of the spam attempts should reach admin inbox
    assert admin_client.get("/enquiries").json()["total"] == 0

    # Legitimate submission with raw phone number auto-normalizes with +91
    legit = public_client.post("/enquiries", json={
        "name": "Arjun Patel",
        "email": "arjun@example.com",
        "phone": "98250 12345",
        "message": "We need custom brochure printing for our launch.",
        "elapsed_ms": 8500,
    })
    assert legit.status_code == 201
    items = admin_client.get("/enquiries").json()["items"]
    assert len(items) == 1
    assert items[0]["name"] == "Arjun Patel"
    assert items[0]["phone"] == "+91 98250 12345"


def test_enquiry_validation_and_rate_limit(public_client):
    from app.core.limiter import limiter

    assert public_client.post("/enquiries", json={"name": "A", "email": "a@example.com"}).status_code == 422
    assert public_client.post("/enquiries", json={"name": "Ann", "email": "not-an-email"}).status_code == 422
    assert public_client.post("/enquiries", json={"name": "Ann", "email": "a@example.com", "phone": "<script>"}).status_code == 422
    # Too short / too long for India, and too short for other countries
    for phone in ("123", "8555", "451236", "98250 123456", "+44 12"):
        assert public_client.post("/enquiries", json={"name": "Ann", "email": "a@example.com", "phone": phone}).status_code == 422, phone

    limiter.enabled = True
    codes = [public_client.post("/enquiries", json={"name": "Ann", "email": "a@example.com"}).status_code for _ in range(6)]
    assert codes[:5] == [201] * 5 and codes[5] == 429


def test_phone_formats():
    from app.schemas.inbox import normalize_phone

    assert normalize_phone("98250 12345") == "+91 98250 12345"
    assert normalize_phone("09825012345") == "+91 98250 12345"
    assert normalize_phone("+91-98250-12345") == "+91 98250 12345"
    assert normalize_phone("919825012345") == "+91 98250 12345"
    assert normalize_phone("+971 50 123 4567") == "+971501234567"
    assert normalize_phone("  ") is None


def test_enquiry_csv_neutralises_formulas(public_client, admin_client):
    public_client.post("/enquiries", json={"name": "=HYPERLINK(1)", "email": "x@example.com", "message": "+cmd", "phone": "98250 12345"})
    res = admin_client.get("/enquiries/export.csv")
    assert res.status_code == 200 and res.headers["content-type"].startswith("text/csv")
    assert "'=HYPERLINK(1)" in res.text and "'+cmd" in res.text
    # Phones are plain text in Excel without a visible apostrophe
    assert " +91 98250 12345" in res.text and "'+91" not in res.text


def test_newsletter_subscribe_resubscribe_and_export(public_client, admin_client):
    body = {"email": "Fan@Example.com", "source_page": "/"}
    assert public_client.post("/newsletter", json=body).status_code == 201
    assert public_client.post("/newsletter", json=body).status_code == 201  # same answer for duplicates
    subs = admin_client.get("/newsletter").json()
    assert subs["total"] == 1 and subs["items"][0]["email"] == "fan@example.com"

    sid = subs["items"][0]["id"]
    admin_client.patch(f"/newsletter/{sid}", json={"status": "unsubscribed"})
    assert admin_client.get("/dashboard").json()["subscribers"] == 0
    public_client.post("/newsletter", json=body)
    assert admin_client.get("/newsletter?status=subscribed").json()["total"] == 1
    assert "fan@example.com" in admin_client.get("/newsletter/export.csv").text

    assert public_client.post("/newsletter", json={"email": "bot@example.com", "website": "x"}).status_code == 201
    assert admin_client.get("/newsletter").json()["total"] == 1


def test_media_upload_rejects_fakes_and_guards_in_use_files(admin_client):
    res = admin_client.post("/media", files={"file": ("pic.png", png_bytes(), "image/png")}, data={"alt_text": "Red"})
    assert res.status_code == 201
    media = res.json()
    assert media["url"].startswith("/uploads/library/") and media["width"] == 40

    fake = admin_client.post("/media", files={"file": ("evil.png", b"<svg onload=alert(1)>", "image/png")})
    assert fake.status_code == 400

    # AVIF is accepted and stored as WebP
    import io

    from PIL import Image

    buf = io.BytesIO()
    Image.new("RGB", (20, 10), (10, 120, 60)).save(buf, "AVIF")
    avif = admin_client.post("/media", files={"file": ("pouches.avif", buf.getvalue(), "image/avif")})
    assert avif.status_code == 201, avif.text
    assert avif.json()["url"].endswith(".webp") and avif.json()["mime_type"] == "image/webp"

    admin_client.post("/clients", json={"name": "Acme", "logo": media["url"]})
    assert admin_client.get(f"/media/{media['id']}/usage").json() == ["Client: Acme"]
    assert admin_client.delete(f"/media/{media['id']}").status_code == 409
