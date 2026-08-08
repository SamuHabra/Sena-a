exports.handler = async () => {
  const API_KEY = '499c8c49c2c5e96d1a6538da8dd00c11'; // ← remplacez
  const query   = 'élevage bovin Cameroun agriculture';
  const url     = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=fr&max=6&apikey=${API_KEY}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    const articles = (data.articles || []).map(a => ({
      titre:   a.title,
      resume:  a.description,
      image:   a.image,
      url:     a.url,
      source:  a.source.name,
      date:    new Date(a.publishedAt).toLocaleDateString('fr-FR')
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ articles })
    };
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.toString() })
    };
  }
};