exports.handler = async function(event) {
  const endpoint = process.env.APPS_SCRIPT_ENDPOINT;
  if (!endpoint) {
    return json(500, { ok:false, error:'Missing APPS_SCRIPT_ENDPOINT' });
  }
  try {
    if (event.httpMethod === 'GET') {
      const qs = event.rawQuery ? '?' + event.rawQuery : '';
      const r = await fetch(endpoint + qs);
      const text = await r.text();
      return { statusCode: 200, headers: cors(), body: text };
    }
    if (event.httpMethod === 'POST') {
      const r = await fetch(endpoint, {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body:event.body || '{}'
      });
      const text = await r.text();
      return { statusCode: 200, headers: cors(), body: text };
    }
    return json(405, { ok:false, error:'Method not allowed' });
  } catch (e) {
    return json(500, { ok:false, error:String(e.message || e) });
  }
};
function cors(){return {'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'};}
function json(statusCode, body){return {statusCode, headers:cors(), body:JSON.stringify(body)};}
