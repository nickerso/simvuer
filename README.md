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

## Proxying remote assets under COOP/COEP

With threaded WASM enabled, the browser is much stricter about cross-origin access. This is especially important for images and other linked resources that are not part of the OMEX payload itself.

The key rule is: the browser must only see same-origin requests for auxiliary assets. The OMEX file URL can remain as a direct URL when passed to `SimulationVuer`, because that component handles the OMEX fetch internally. In this app, we do not proxy the OMEX URL itself.

For app-level resources such as thumbnails, diagrams, or any external data file referenced in the UI, use a same-origin proxy route instead of hitting the remote host directly from the browser. The proxy pattern is:

```text
browser -> /proxy?url=https://example.com/remote-file
app server -> fetch('https://example.com/remote-file')
response -> returned from the same origin as the site
```

That keeps the browser request inside the same origin, which satisfies the stricter `COEP: require-corp` requirement while still allowing the app to display or fetch remote content.

This pattern is especially useful when embedding SimulationVuer into other apps or static-site deployments where the browser is isolated by policy. It works well both in local development (with a Vite proxy) and in static hosting setups such as Cloudflare Pages (with a worker or Pages function).

### Example pattern for app data

```js
const sameOriginUrl = (url) => `/proxy?url=${encodeURIComponent(url)}`;

const datasetUrls = [
  {
    id: 'example',
    omex: 'https://raw.githubusercontent.com/.../example.omex',
    image: sameOriginUrl('https://example.com/model-image.png')
  }
]
```

The `omex` field is intentionally left as the direct URL because `SimulationVuer` manages that fetch internally. The non-OMEX assets that are displayed by the app should go through the same-origin proxy.

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

## Embedding SimulationVuer in another app

If you are embedding `SimulationVuer` in another Vue app or a static site, the main requirement is the same as in this project: the page must be cross-origin isolated when using the threaded-WASM build.

### Required headers

Your host must send:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

This is required for `@opencor/opencor` and libOpenCOR to initialize correctly in the browser.

### Local development setup

In a Vite app, add the headers in `vite.config.ts`:

```ts
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  },
},
preview: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  },
},
```

### Same-origin proxying for non-OMEX assets

The `omex` URL itself can be passed directly to `SimulationVuer` because the component handles that fetch internally. Do not proxy the OMEX file.

However, any extra asset loaded by your app, such as thumbnails, images, diagrams, or other metadata files, should be served from the same origin as the page. A common pattern is:

```js
const sameOriginUrl = (url) => `/proxy?url=${encodeURIComponent(url)}`;
```

Then use:

```js
const datasetUrls = [
  {
    id: 'example',
    omex: 'https://raw.githubusercontent.com/example/archive.omex',
    image: sameOriginUrl('https://example.com/model-image.png')
  }
]
```

In local development, the Vite dev server can proxy `/proxy` to the upstream host. On Cloudflare Pages, a Pages Function or Worker can perform the same task.

### Minimal component usage

```vue
<template>
  <SimulationVuer :id="omexUrl" style="height: 640px;" />
</template>

<script setup>
import { SimulationVuer } from '@abi-software/simulationvuer'

const omexUrl = 'https://raw.githubusercontent.com/example/archive.omex'
</script>
```

If your app is using additional remote resources, keep them same-origin by rewriting those URLs before they reach the browser.

### Static hosting note

For static deployment targets such as Cloudflare Pages, use a root-level `public/_headers` file with:

```txt
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

And make sure any non-OMEX remote assets are proxied through the same origin rather than being fetched directly from the browser.

### Cloudflare Pages proxy example

If you are deploying to Cloudflare Pages, a small Pages Function can proxy the browser request to the upstream resource while keeping the response on the same origin:

```js
export async function onRequest({ request }) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response('Missing url query parameter', { status: 400 })
  }

  try {
    const upstream = await fetch(targetUrl)
    const headers = new Headers(upstream.headers)
    headers.set('Access-Control-Allow-Origin', '*')

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    })
  } catch (error) {
    return new Response('Proxy fetch failed', { status: 502 })
  }
}
```

This is a convenient way to keep local development and Cloudflare deployment using the same app pattern. The browser still requests `/proxy?...`, but the server fetches the real resource behind the scenes.

## Useful commands

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4173
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## Editor notes

This project is configured for Vue 3 + Vite. If you are using VS Code, the Vue extension and Volar are recommended for the best editor experience.
