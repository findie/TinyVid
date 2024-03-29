/**
 Copyright Findie 2021
 */

// https://developers.cloudflare.com/workers/examples/cache-api

export function cacheHoF(handler: (e: FetchEvent) => Promise<Response>, ttl : number) {

  return async function _cached_handler(event: FetchEvent) {
    const request = event.request
    const cacheUrl = new URL(request.url)

    // Construct the cache key from the cache URL
    const cacheKey = new Request(cacheUrl.toString(), request)
    const cache = caches.default

    // Check whether the value is already available in the cache
    // if not, you will need to fetch it from origin, and store it in the cache
    // for future access
    let response = await cache.match(cacheKey)

    if (!response) {
      // If not in cache, get it from origin
      response = await handler(event);

      // Must use Response constructor to inherit all of response's fields
      response = new Response(response.body, response)

      // Cache API respects Cache-Control headers. Setting s-max-age to 10
      // will limit the response to be in cache for 10 seconds max

      // Any changes made to the response here will be reflected in the cached value
      response.headers.append("Cache-Control", `s-maxage=${ttl}`)

      // Store the fetched response as cacheKey
      // Use waitUntil so you can return the response without blocking on
      // writing to cache
      event.waitUntil(cache.put(cacheKey, response.clone()))
    }
    return response;
  }

}
