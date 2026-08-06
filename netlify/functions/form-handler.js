exports.handler = async (event) => {

  console.log("===== NOUVELLE REQUÊTE =====");
  console.log("Méthode :", event.httpMethod);
  console.log("Body reçu :", event.body);


  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }


  try {

    const params = new URLSearchParams(event.body);


    const data = {
      nom: params.get("nom") || "",
      email: params.get("email") || "",
      telephone: params.get("telephone") || "",
      sujet: params.get("sujet") || "",
      message: params.get("message") || "",
      date: new Date().toLocaleString("fr-FR")
    };


    console.log("Données :", JSON.stringify(data));


    const scriptUrl =
      "https://script.google.com/macros/s/AKfycbyfGzkvr3eS-APu2AeXV9-Pq06FpByGXtjjrrLFwk-k5H79ZPgcY1GS7qqBhcyrK8Dt-Q/exec";


    const response = await fetch(scriptUrl, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data),

      redirect: "follow"

    });


    const text = await response.text();


    console.log("Google status :", response.status);
    console.log("Google réponse :", text);


    if (!response.ok) {

      throw new Error(
        "Google Apps Script erreur : " + response.status
      );

    }


    return {

      statusCode: 200,

      body: JSON.stringify({
        status: "success"
      })

    };


  } catch(error) {


    console.error("❌ ERREUR :", error);


    return {

      statusCode: 500,

      body: JSON.stringify({
        status:"error",
        message:error.toString()
      })

    };

  }

};