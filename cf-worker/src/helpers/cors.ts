/**
 Copyright Findie 2021
 */

export function corsHoF(handler: (e: FetchEvent) => Promise<Response>) {

  return async function _corsed_handler(event: FetchEvent) {
    if (event.request.method === 'OPTIONS') {
      return new Response('', {
        headers: {
          'access-control-allow-origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    let response = await handler(event);

    response = new Response(response.body, response)

    response.headers.append("access-control-allow-origin", `*`);
    response.headers.append("Access-Control-Allow-Methods", `*`);
    response.headers.append("Access-Control-Allow-Headers", `*`);


    return response;
  }

}
