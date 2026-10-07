# SimVuer

This app wraps the `@abi-software/simulationvuer` component in a small Vue 3 example for browsing SPARC/COMBINE simulation archives.

## Requirements

The latest upstream `simulationvuer` package uses threaded WebAssembly. That requires cross-origin isolation headers on the page:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

The app already sets these in the Vite dev and preview configs.

For compatibility with the current upstream package, use Node 24.20 or newer.

## Local development

### Install dependencies

```sh
npm install
```

### Start the app in development mode

```sh
npm run dev -- --host 127.0.0.1 --port 4173
```

Then open:

- http://127.0.0.1:4173/

### Verify the required headers are present

```sh
curl -I http://127.0.0.1:4173/
```

You should see the following response headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Production build

```sh
npm run build
```

To preview the production build locally:

```sh
npm run preview -- --host 127.0.0.1 --port 4173
```

## Why the headers matter

`simulationvuer` depends on `@opencor/opencor` and threaded WASM. Without the COOP/COEP headers, libOpenCOR cannot initialize correctly in the browser.

The Vite config is set up for this, but if you deploy the app behind a different server (Apache, Nginx, custom hosting) you must also ensure those headers are sent for the HTML page that loads the app.

## GitHub Actions / deployment notes

The repo's existing deployment workflow used Node 18, which is too old for the current upstream SimulationVuer package. Update it to a recent 24.x runtime before pushing changes.

The workflow file in `.github/workflows/deploy.yml` should use Node 24.20.0 or newer.

For the threaded-WASM release of SimulationVuer, the recommended hosting option is Cloudflare Pages with explicit headers. This keeps the app on GitHub Actions for the build while allowing the deployed site to emit the required COOP/COEP response headers.

For a root-level deployment at `simvuer.pages.dev`, add a `public/_headers` file with:

```txt
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

GitHub Pages is not suitable for this app because it does not allow custom COOP/COEP headers on the deployed HTML response.

## Useful commands

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4173
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## Editor notes

This project is configured for Vue 3 + Vite. If you are using VS Code, the Vue extension and Volar are recommended for the best editor experience.
