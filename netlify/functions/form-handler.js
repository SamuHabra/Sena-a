const https = require('https');

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

    // Parser les données du formulaire
    const params = new URLSearchParams(event.body);

    const data = {
      nom: params.get('nom') || '',
      email: params.get('email') || '',
      telephone: params.get('telephone') || '',
      sujet: params.get('sujet') || '',
      message: params.get('message') || '',
      date: new Date().toLocaleString('fr-FR')
    };

    console.log("Données reçues :", JSON.stringify(data));


    // URL Google Apps Script
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyfGzkvr3eS-APu2AeXV9-Pq06FpByGXtjjrrLFwk-k5H79ZPgcY1GS7qqBhcyrK8Dt-Q/exec';

    console.log("Envoi vers Google Apps Script :", scriptUrl);


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

        let responseBody = '';

        console.log("Réponse Google - Status :", res.statusCode);


        res.on('data', (chunk) => {
          responseBody += chunk;
        });


        res.on('end', () => {

          console.log("Réponse Google - Body :", responseBody);


          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(
              "Google Apps Script erreur : " + res.statusCode
            ));
          }

        });

      });


      req.on('error', (error) => {
        console.error("Erreur connexion Google :", error);
        reject(error);
      });


      req.write(postData);
      req.end();

    });


    console.log("✅ Données envoyées avec succès à Google");


    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success'
      })
    };


  } catch (err) {

    console.error("❌ ERREUR FONCTION :", err);


    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: err.toString()
      })
    };

  }

};