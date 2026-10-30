# Auren Automotive

Next.js App Router website for Auren Automotive. Requires Node.js 20.9 or newer.

## Development

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Production

```bash
npm run build
npm start
```

Homepage structure is composed in `app/page.js`. Reusable page chrome, homepage sections, and dialogs live in `app/components/`. Global styles are in `app/globals.css`, animation and interaction scripts are in `public/`, and media files are in `public/assets/`.

The enquiry form downloads a local file and the collection dialogs are demonstrations. No backend is configured. Confirm media usage rights before client launch.
