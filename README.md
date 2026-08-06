# CrestOak College (CCHSMT) Web Application

A Next.js 16 application configured for fully static export (`output: "export"`) paired with a PHP/MySQL backend in `public/api/`.

## Development

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Production Deployment

### 1. Build Static Output

```bash
npm run build
```

This compiles the static pages and includes the PHP backend from `public/api/` directly into the `out/` folder.

### 2. Deployment Instructions

- **Do NOT copy `out/` into your git-tracked root directory.**
- Upload the contents of the generated `out/` folder directly to your hosting provider's web document root (e.g. `public_html/` on DirectAdmin / cPanel / Apache).

## Environment Variables & Configuration

### Database Credentials

`public/api/admin/db.php` checks for database credentials in the following order:

1. **Environment Variables (Preferred)**:
   - `DB_HOST` (e.g. `localhost` or `127.0.0.1`)
   - `DB_NAME` (e.g. `crestoa2_crestoak_db`)
   - `DB_USER` (e.g. `crestoa2_dbuser`)
   - `DB_PASS` (Database password)

2. **PHP Config File (Fallback)**:
   - If server environment variables are unavailable, copy `public/api/config.example.php` to `public/api/config.php` on the hosting server and edit the credentials. `public/api/config.php` is added to `.gitignore` and must never be committed to git.
