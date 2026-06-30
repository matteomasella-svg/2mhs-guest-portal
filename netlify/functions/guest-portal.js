const https = require("https");

const APPS_SCRIPT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzfelg-0p1xuHhSINGBPKHveYEtuJu6pruflAeElV0ezHZBrWDDM7622YdDbyc_i6Xh/exec";

function requestUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (redirects > 5) return reject(new Error("Too many redirects"));
        return resolve(requestUrl(res.headers.location, redirects + 1));
      }

      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

exports.handler = async function(event) {
  try {
    const params = event.queryStringParameters || {};
    const action = params.action || "getBooking";
    const code = params.code || params.booking || "";

    const url =
      APPS_SCRIPT_ENDPOINT +
      "?action=" + encodeURIComponent(action) +
      "&code=" + encodeURIComponent(code);

    const body = await requestUrl(url);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        ok: false,
        error: "Proxy error",
        details: err.message
      })
    };
  }
};
