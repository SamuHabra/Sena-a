const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parser les données du formulaire
    const params = new URLSearchParams(event.body);
    const data = {
      nom:       params.get('nom')       || '',
      email:     params.get('email')     || '',
      telephone: params.get('telephone') || '',
      sujet:     params.get('sujet')     || '',
      message:   params.get('message')   || '',
      date:      new Date().toLocaleString('fr-FR')
    };

    // Envoyer à Google Apps Script
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyfGzkvr3eS-APu2AeXV9-Pq06FpByGXtjjrrLFwk-k5H79ZPgcY1GS7qqBhcyrK8Dt-Q/exec';
    
    const postData = JSON.stringify(data);

    await new Promise((resolve, reject) => {
      const url = new URL(scriptUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', resolve);
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: err.toString() })
    };
  }
};