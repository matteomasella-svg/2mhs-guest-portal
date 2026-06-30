// 2MHS Guest Portal proxy
// Netlify path: /.netlify/functions/guest-portal
// Required environment variable in Netlify: APPS_SCRIPT_ENDPOINT

const corsHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const endpoint = process.env.APPS_SCRIPT_ENDPOINT;
  if (!endpoint) {
    return response(500, { error: 'Server not configured' });
  }

  try {
    if (event.httpMethod === 'GET') {
      const code = (event.queryStringParameters && event.queryStringParameters.code) || '';
      if (!code) return response(400, { error: 'Missing booking code' });

      const upstream = await fetch(endpoint + '?code=' + encodeURIComponent(code), {
        method: 'GET',
        redirect: 'follow'
      });
      const text = await upstream.text();
      return {
        statusCode: upstream.status,
        headers: corsHeaders,
        body: safeJsonText(text)
      };
    }

    if (event.httpMethod === 'POST') {
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body || '{}',
        redirect: 'follow'
      });
      const text = await upstream.text();
      return {
        statusCode: upstream.status,
        headers: corsHeaders,
        body: safeJsonText(text)
      };
    }

    return response(405, { error: 'Method not allowed' });
  } catch (err) {
    return response(502, { error: 'Backend connection failed' });
  }
};

function response(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

function safeJsonText(text) {
  try {
    JSON.parse(text);
    return text;
  } catch (e) {
    return JSON.stringify({ error: 'Invalid backend response' });
  }
}
