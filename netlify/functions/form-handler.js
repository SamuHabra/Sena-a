const https = require('https');

function sendRequest(url, postData) {

  return new Promise((resolve, reject) => {

    const parsed = new URL(url);

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };


    const req = https.request(options, (res) => {

      let body = '';

      console.log("Google status :", res.statusCode);


      // Gestion redirection Google
      if (res.statusCode === 302 || res.statusCode === 301) {

        const redirectUrl = res.headers.location;

        console.log("Redirection vers :", redirectUrl);

        sendRequest(redirectUrl, postData)
          .then(resolve)
          .catch(reject);

        return;
      }


      res.on('data', chunk => {
        body += chunk;
      });


      res.on('end', () => {

        console.log("Réponse finale Google :", body);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error("Google erreur " + res.statusCode));
        }

      });


    });


    req.on('error', reject);

    req.write(postData);
    req.end();

  });

}



exports.handler = async (event) => {


  console.log("===== NOUVELLE REQUÊTE =====");
  console.log("Méthode :", event.httpMethod);
  console.log("Body reçu :", event.body);


  if (event.httpMethod !== 'POST') {

    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };

  }


  try {


    const params = new URLSearchParams(event.body);


    const data = {

      nom: params.get('nom') || '',
      email: params.get('email') || '',
      telephone: params.get('telephone') || '',
      sujet: params.get('sujet') || '',
      message: params.get('message') || '',
      date: new Date().toLocaleString('fr-FR')

    };


    console.log("Données :", JSON.stringify(data));


    const scriptUrl =
    'https://script.google.com/macros/s/AKfycbyfGzkvr3eS-APu2AeXV9-Pq06FpByGXtjjrrLFwk-k5H79ZPgcY1GS7qqBhcyrK8Dt-Q/exec';


    await sendRequest(
      scriptUrl,
      JSON.stringify(data)
    );


    console.log("✅ Google Apps Script terminé");


    return {

      statusCode:200,

      body:JSON.stringify({
        status:'success'
      })

    };


  } catch(error) {


    console.error("❌ ERREUR :", error);


    return {

      statusCode:500,

      body:JSON.stringify({
        status:'error',
        message:error.toString()
      })

    };


  }

};