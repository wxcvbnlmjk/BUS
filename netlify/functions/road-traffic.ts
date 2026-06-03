import type { Handler } from '@netlify/functions';

const TRAFFIC_ITEMS_URL =
  'https://data.grandlyon.com/fr/geoserv/ogc/features/v1/collections/metropole-de-lyon:pvo_patrimoine_voirie.pvotrafic/items';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
};

export const handler: Handler = async (event) => {
  try {
    const query = event.rawQuery ? `?${event.rawQuery}` : '';
    const response = await fetch(`${TRAFFIC_ITEMS_URL}${query}`, {
      headers: { Accept: 'application/json' },
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
      body: JSON.stringify({
        error: 'Impossible de joindre l’API trafic Grand Lyon',
      }),
    };
  }
};
