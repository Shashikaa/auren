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

## Project Structure

```text
app/
  page.js                 Home composition
  builds/page.js          Builds composition and metadata
  stock/page.js           Stock composition and metadata
  contact/page.js         Contact composition and metadata
  components/
    layout/               Header, navigation, footer, progress
    home/                 Homepage sections
    builds/               Commissions and approach sections
    stock/                Vehicle showcase and editorial sections
    contact/              Enquiry form and contact sections
    inner/                Shared inner-page shell
    dialogs/              Contact, collection and privacy dialogs
    motion/               React animation lifecycle components
  data/collections.js     Shared vehicles, principles and services
  styles/inner-pages.css  Inner-page layouts and motion styling
  globals.css             Shared styles and homepage choreography
public/
  scripts/                Native browser animation modules
  assets/                 Images, fonts and video
  content.json            Homepage content and asset catalogue
tests/                    Route and browser regression tests
```

Home and inner-page titles share `public/scripts/headings.js`: masked character rise followed by colour fill. The runtime restores its owned DOM on cleanup, rebuilds line wrapping on resize, and respects reduced motion. Scripts remain in `public/scripts/` because the existing Home experience loads native browser modules directly.

## Tests

```bash
npm test
npm run test:browser
```

Browser tests require a running server at `http://localhost:3001` and an installed Chrome browser at the path in the test files. Set `TEST_BASE_URL` to use another server. Run `npm run dev -- --port 3001` if no project server is running; reuse an existing server rather than starting a second.

The persistent Turbopack development cache is disabled in `next.config.mjs` because it repeatedly crashed locally with checksum corruption. This does not disable Turbopack or affect the production cache.

The enquiry form downloads a local file and the collection dialogs are demonstrations. No backend is configured. Confirm media usage rights before client launch.
