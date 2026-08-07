exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ status: 'error', message: 'Method Not Allowed' })
    };
  }

  const contentType =
    event.headers['content-type'] || event.headers['Content-Type'] || '';

  const sanitize = (value, max = 1000) => {
    return String(value || '')
      .trim()
      .replace(/\r?\n/g, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, max);
  };

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPhone = (value) => {
    if (!value) return true;
    return /^[0-9+()\-.\s]{6,25}$/.test(value);
  };

  const parseBody = () => {
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(event.body || '{}');
      } catch {
        return {};
      }
    }
    return Object.fromEntries(new URLSearchParams(event.body || ''));
  };

  const payload = parseBody();

  const nom = sanitize(payload.nom, 100);
  const email = sanitize(payload.email, 120);
  const telephone = sanitize(payload.telephone, 40);
  const sujet = sanitize(payload.sujet, 120);
  const message = sanitize(payload.message, 1200);

  const errors = [];

  if (!nom) errors.push('Le nom est requis.');
  if (!email) errors.push('L’email est requis.');
  else if (!isEmail(email)) errors.push('L’email est invalide.');
  if (!sujet) errors.push('Le sujet est requis.');
  if (!message) errors.push('Le message est requis.');
  if (!isPhone(telephone)) errors.push('Le téléphone est invalide.');

  if (errors.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'error', errors })
    };
  }

  const data = {
    nom,
    email,
    telephone,
    sujet,
    message,
    date: new Date().toLocaleString('fr-FR')
  };

  try {
    const scriptUrl =
      'https://script.google.com/macros/s/AKfycbyfGzkvr3eS-APu2AeXV9-Pq06FpByGXtjjrrLFwk-k5H79ZPgcY1GS7qqBhcyrK8Dt-Q/exec';

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      redirect: 'follow'
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('Google Apps Script erreur :', response.status, text);
      return {
        statusCode: 502,
        body: JSON.stringify({ status: 'error', message: 'Problème de transmission des données.' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success' })
    };
  } catch (error) {
    console.error('❌ ERREUR :', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: 'Erreur serveur interne.' })
    };
  }
};