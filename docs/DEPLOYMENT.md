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
git clone https://github.com/infostreamlineautomation-maker/anantagraphics.git
cd anantagraphics
chmod +x scripts/*.sh
./scripts/setup.sh --prod
```

The first run creates the env files; edit them, then run setup again so it can create and migrate the database
(`NEXT_PUBLIC_*` values are baked in at build time):

| File                  | Set |
|-----------------------|-----|
| `backend/.env`        | `DATABASE_URL=postgresql+psycopg://ananta:strong-password@localhost:5432/ananta_graphics`, `CORS_ORIGINS=https://example.com,https://www.example.com`, `ADMIN_CORS_ORIGINS=https://admin.example.com`, `SITE_URL=https://example.com`, `CMS_URL=https://admin.example.com`, `REVALIDATE_URL=http://127.0.0.1:3100/api/revalidate`. (SMTP is optional; can be set up in CMS). |
| `frontend/.env.local` | `NEXT_PUBLIC_SITE_URL=https://example.com`, `NEXT_PUBLIC_API_URL=https://api.example.com`, `API_INTERNAL_URL=http://127.0.0.1:8100` |
| `cms/.env.local`      | `NEXT_PUBLIC_SITE_URL=https://example.com`, `NEXT_PUBLIC_ADMIN_API_URL=https://admin-api.example.com` |

```bash
cd backend && ./venv/bin/python -m app.cli create-admin --email you@example.com && cd ..
WEB_PORT=3100 CMS_PORT=3101 API_PORT=8100 ADMIN_API_PORT=8101 ./scripts/run.sh prod
pm2 startup                  # run the command it prints (auto-start on reboot)
pm2 save
```

### Enquiry email alerts (Optional)

New enquiries are always safely saved in the CMS database. Outgoing email alerts are optional and can be configured at any time directly through the **CMS Panel** (**Settings → Email notifications & SMTP**) without touching server files or restarting APIs.

You can leave all `SMTP_*` variables empty in `backend/.env`. If you prefer setting them in `.env`, the server will fall back to those values if not configured in the CMS.

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
