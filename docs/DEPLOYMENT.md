# Deploying to a Linux VPS (Hostinger, Ubuntu)

Needs a **VPS** plan — shared hosting can't run Node/Python processes.
Replace `example.com` with the real domain throughout.

## 1. Server packages (once)

```bash
apt update && apt upgrade -y
apt install -y git curl python3 python3-venv python3-pip nginx certbot python3-certbot-nginx postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
npm install -g pm2
```

## 2. Database user (once)

```bash
sudo -u postgres psql -c "CREATE USER ananta WITH ENCRYPTED PASSWORD 'strong-password' CREATEDB;"
```

Setup creates the `ananta_graphics` database itself.

## 3. Code + setup

```bash
mkdir -p /var/www && cd /var/www
git clone <repo-url> anantagraphics && cd anantagraphics
chmod +x scripts/*.sh
./scripts/setup.sh --prod
```

The first run creates the env files; edit them, then run setup again so it can create and migrate the database
(`NEXT_PUBLIC_*` values are baked in at build time):

| File                  | Set |
|-----------------------|-----|
| `backend/.env`        | `DATABASE_URL=postgresql+psycopg://ananta:strong-password@localhost:5432/ananta_graphics`, `CORS_ORIGINS=https://example.com,https://www.example.com`, `ADMIN_CORS_ORIGINS=https://admin.example.com`, `SITE_URL`, `CMS_URL`, `SMTP_*` + `ENQUIRY_NOTIFY_TO`. `APP_ENV`, `SECRET_KEY` and `REVALIDATE_SECRET` are set by setup. |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL=https://api.example.com`, `API_INTERNAL_URL=http://127.0.0.1:8000`, `NEXT_PUBLIC_SITE_URL=https://example.com` |
| `cms/.env.local`      | `NEXT_PUBLIC_ADMIN_API_URL=https://admin-api.example.com`, `NEXT_PUBLIC_SITE_URL=https://example.com` |

```bash
cd backend && ./venv/bin/python -m app.cli create-admin --email you@example.com && cd ..
./scripts/run.sh prod        # migrate + seed, start APIs, build website + CMS, start all under PM2
pm2 startup                  # run the command it prints (auto-start on reboot)
```

Sharing the VPS with another site? Start with other ports, e.g.
`WEB_PORT=3100 CMS_PORT=3101 API_PORT=8100 ADMIN_API_PORT=8101 ./scripts/run.sh prod`, and use the same ports
in the Nginx file and `API_INTERNAL_URL` / `REVALIDATE_URL`.

### Enquiry email alerts

New enquiries are always saved in the CMS; the email alert is extra. In `backend/.env`:

| Key | Example (Hostinger mailbox) |
|-----|-----------------------------|
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` / `SMTP_SSL` | `465` / `true` (or `587` / `false` for STARTTLS) |
| `SMTP_USER` / `SMTP_PASSWORD` | the mailbox login, e.g. `alerts@yourdomain.com` |
| `SMTP_FROM` | `Ananta Graphics <alerts@yourdomain.com>` (must be that mailbox or an alias of it) |
| `ENQUIRY_NOTIFY_TO` | who gets alerts, comma-separated: `office@yourdomain.com, sales@yourdomain.com` |

Restart the APIs (`./scripts/run.sh prod`), then check it from the CMS (**Settings → Email notifications →
Send test email**) or on the server:

```bash
cd backend && ./venv/bin/python -m app.cli send-test-email --to you@yourdomain.com
```

Alerts come from your own mailbox with **Reply-To** set to the visitor, so "Reply" answers them directly.

## 4. DNS

A records → VPS IP: `@`, `www`, `api`, `admin`, `admin-api`.

## 5. Nginx + SSL

```bash
sed -i 's/example\.com/yourdomain.com/g' deploy/nginx/anantagraphics.conf
cp deploy/nginx/anantagraphics.conf /etc/nginx/sites-available/anantagraphics
ln -s /etc/nginx/sites-available/anantagraphics /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com -d api.yourdomain.com -d admin-api.yourdomain.com
```

If the project is not in `/var/www/anantagraphics`, fix the `/uploads/` alias path in the Nginx file.

## 6. Updating

```bash
cd /var/www/anantagraphics && git pull
./scripts/setup.sh --prod
./scripts/run.sh prod
```

## Useful

```bash
./scripts/run.sh status | logs | stop
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable    # only 22/80/443 exposed; app ports bind to 127.0.0.1
```
