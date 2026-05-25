import type { Handler } from '@netlify/functions';

const GRANDLYON_API =
  'https://data.grandlyon.com/siri-lite/2.0/vehicle-monitoring.json';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export const handler: Handler = async () => {
  const user = process.env.GRANDLYON_USER;
  const password = process.env.GRANDLYON_PASSWORD;

  if (!user || !password) {
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        error: 'Variables GRANDLYON_USER et GRANDLYON_PASSWORD non configurées',
      }),
    };
  }

  try {
    const credentials = Buffer.from(`${user}:${password}`).toString('base64');
    const response = await fetch(GRANDLYON_API, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    const body = await response.text();

    return {
      statusCode: response.status,
      headers: JSON_HEADERS,
      body,
    };
  } catch {
    return {
      statusCode: 502,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Impossible de joindre l’API Grand Lyon' }),
    };
  }
};
