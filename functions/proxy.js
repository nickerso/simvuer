export async function onRequest({ request }) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response('Missing url query parameter', { status: 400 })
  }

  try {
    const upstreamResponse = await fetch(targetUrl)
    const headers = new Headers(upstreamResponse.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    })
  } catch (error) {
    return new Response('Proxy fetch failed', { status: 502 })
  }
}
