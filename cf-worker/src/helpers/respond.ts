/**
 Copyright Findie 2021
 */

export function respondJSON(data: any, statusCode: number): Response {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      'Content-type': 'application/json',
    },
  })
}

