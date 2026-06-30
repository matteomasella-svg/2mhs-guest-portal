const https = require("https");

const APPS_SCRIPT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzfelg-0p1xuHhSINGBPKHveYEtuJu6pruflAeElV0ezHZBrWDDM7622YdDbyc_i6Xh/exec";

function requestUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        });
      })
      .on("error", reject);
  });
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const action = params.action || "getBooking";
    const code = params.code || params.booking || "";

    const url =
      APPS_SCRIPT_ENDPOINT +
      "?action=" +
      encodeURIComponent(action) +
      "&code=" +
      encodeURIComponent(code);

    const result = await requestUrl(url);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: result.body,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        ok: false,
        error: "Netlify function error",
        details: err.message,
      }),
    };
  }
};
