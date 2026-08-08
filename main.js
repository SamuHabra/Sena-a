'use strict';

/* ── NAV ── */
const bur = document.getElementById('bur');
const nl = document.getElementById('nl');
bur.addEventListener('click', () => {
  const o = bur.classList.toggle('x');
  nl.classList.toggle('open', o);
  bur.setAttribute('aria-expanded', o);
});
nl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  bur.classList.remove('x');
  nl.classList.remove('open');
  bur.setAttribute('aria-expanded', false);
}));

/* ── NAV ACTIVE LINK ON SCROLL ── */
const sections = [...document.querySelectorAll('section[id],div[id]')];
const navLinks = [...document.querySelectorAll('.nl a')];
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
  navLinks.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
}, { passive: true });

/* ── REVEAL ── */
const robs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      robs.unobserve(entry.target);
    }
  });
}, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.rv,.rl,.rr').forEach(el => robs.observe(el));

/* ── COUNTERS ── */
let counted = false;
const cobs = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting || counted) return;
  counted = true;
  cobs.disconnect();

  document.querySelectorAll('[data-t]').forEach(el => {
    const end = +el.dataset.t;
    const dur = 1600;
    let start = null;
    const step = timestamp => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - progress, 3)) * end);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = end;
    };
    requestAnimationFrame(step);
  });
}, { threshold: .3 });
cobs.observe(document.querySelector('.hstats'));

/* ── QUIZ FERME ── */
const quizChoices = { 1: null, 2: null, 3: null };
const quizButtons = document.querySelectorAll('.qq-btn');
const quizSubmit = document.getElementById('quiz-submit');
const quizReset = document.getElementById('quiz-reset');
const quizResult = document.getElementById('quiz-result');

const quizBreeds = {
  goudali: {
    title: 'Goudali',
    description: 'Votre profil ambitionne la performance et la robustesse : vous incarnez la race Goudali, puissante, rapide et bien adaptée à l’élevage intensif.',
    emoji: '🐂'
  },
  kouri: {
    title: 'Kouri',
    description: 'Vous êtes flexible et équilibré. Le Kouri combine polyvalence, qualité et adaptation locale, parfait pour un projet moderne et durable.',
    emoji: '🐄'
  },
  mbororo: {
    title: 'Mbororo',
    description: 'Vous misez sur l’héritage et la communauté. Le profil Mbororo valorise le savoir-faire traditionnel et l’ancrage culturel.',
    emoji: '🐃'
  }
};

quizButtons.forEach(button => {
  button.addEventListener('click', () => {
    const q = button.dataset.q;
    const breed = button.dataset.breed;
    quizChoices[q] = breed;
    document.querySelectorAll(`.qq-btn[data-q="${q}"]`).forEach(btn => btn.classList.toggle('active', btn === button));
    quizResult.innerHTML = '';
  });
});

const computeQuizResult = () => {
  const counts = { goudali: 0, kouri: 0, mbororo: 0 };
  Object.values(quizChoices).forEach(value => { if (value) counts[value] += 1; });
  const maxScore = Math.max(counts.goudali, counts.kouri, counts.mbororo);
  const winner = ['goudali', 'kouri', 'mbororo'].find(key => counts[key] === maxScore) || 'goudali';
  return quizBreeds[winner];
};

quizSubmit.addEventListener('click', () => {
  if (!quizChoices[1] || !quizChoices[2] || !quizChoices[3]) {
    quizResult.innerHTML = '<p>⚠️ Répondez aux trois questions pour découvrir votre type de bétail.</p>';
    quizResult.classList.remove('show');
    return;
  }
  const result = computeQuizResult();
  quizResult.innerHTML = `<h3>${result.emoji} ${result.title}</h3><p>${result.description}</p>`;
  requestAnimationFrame(() => quizResult.classList.add('show'));
});

quizReset.addEventListener('click', () => {
  quizChoices[1] = quizChoices[2] = quizChoices[3] = null;
  quizButtons.forEach(button => button.classList.remove('active'));
  quizResult.innerHTML = '';
  quizResult.classList.remove('show');
});

/* ── LIGHTBOX with navigation ── */
const lb = document.getElementById('lb');
const lbi = document.getElementById('lbi');
const galItems = [...document.querySelectorAll('.gi[data-img]')];
let lbIdx = 0;
const openLb = idx => {
  lbIdx = idx;
  lbi.src = galItems[lbIdx].dataset.img;
  lbi.alt = galItems[lbIdx].getAttribute('aria-label') || '';
  lb.classList.add('open');
};

document.getElementById('lbc').addEventListener('click', () => lb.classList.remove('open'));
lb.addEventListener('click', event => { if (event.target === lb) lb.classList.remove('open'); });
document.getElementById('lbprev').addEventListener('click', () => openLb((lbIdx - 1 + galItems.length) % galItems.length));
document.getElementById('lbnext').addEventListener('click', () => openLb((lbIdx + 1) % galItems.length));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') lb.classList.remove('open');
  if (event.key === 'ArrowLeft' && lb.classList.contains('open')) openLb((lbIdx - 1 + galItems.length) % galItems.length);
  if (event.key === 'ArrowRight' && lb.classList.contains('open')) openLb((lbIdx + 1) % galItems.length);
});

galItems.forEach((gi, index) => {
  gi.addEventListener('click', () => openLb(index));
  gi.addEventListener('keydown', event => { if (event.key === 'Enter') openLb(index); });
});

/* ── SCROLL TOP ── */
const stb = document.getElementById('stb');
window.addEventListener('scroll', () => stb.classList.toggle('v', window.scrollY > 400), { passive: true });
stb.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── CONTACT FORM (Netlify Forms) */
const cform = document.getElementById('cform');
const fmsgr = document.getElementById('fmsgr');
const fsub = document.getElementById('fsub');
const formControls = [...cform.querySelectorAll('input, textarea, select')].filter(input => input.type !== 'hidden');
let sending = false;

const resetValidation = () => {
  formControls.forEach(control => {
    const wrapper = control.closest('.fg');
    if (wrapper) wrapper.classList.remove('invalid');
    control.removeAttribute('aria-invalid');
  });
};

const markInvalidFields = () => {
  const invalidControls = formControls.filter(control => !control.checkValidity());
  invalidControls.forEach(control => {
    const wrapper = control.closest('.fg');
    if (wrapper) wrapper.classList.add('invalid');
    control.setAttribute('aria-invalid', 'true');
  });
  return invalidControls;
};

formControls.forEach(control => {
  control.addEventListener('input', () => {
    const wrapper = control.closest('.fg');
    if (wrapper && wrapper.classList.contains('invalid')) wrapper.classList.remove('invalid');
    control.removeAttribute('aria-invalid');
    fmsgr.textContent = '';
    fmsgr.className = 'fmsg';
  });
});

cform.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending) return;

  resetValidation();
  if (!cform.checkValidity()) {
    const invalidControls = markInvalidFields();
    const firstInvalid = invalidControls[0];
    if (firstInvalid) firstInvalid.focus({ preventScroll: true });

    fmsgr.textContent = '⚠️ Merci de vérifier les champs en surbrillance.';
    fmsgr.className = 'fmsg err';
    return;
  }

  sending = true;
  fsub.textContent = 'Envoi…';
  fsub.disabled = true;
  fmsgr.textContent = '⏳ Envoi en cours…';
  fmsgr.className = 'fmsg';

  const formData = new URLSearchParams(new FormData(cform)).toString();

  try {
    await Promise.all([
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      }),
      fetch('/.netlify/functions/form-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      })
    ]);

    fmsgr.textContent = '✅ Message envoyé ! Réponse sous 24h.';
    fmsgr.className = 'fmsg ok';
    cform.reset();
  } catch {
    fmsgr.textContent = '❌ Erreur d’envoi. Essayez de nouveau ou écrivez sur WhatsApp.';
    fmsgr.className = 'fmsg err';
  } finally {
    fsub.textContent = 'Envoyer le message →';
    fsub.disabled = false;
    sending = false;
  }
});

/* ── COOKIE ── */
if (!localStorage.getItem('senna_ck')) {
  setTimeout(() => document.getElementById('ck').classList.add('show'), 1800);
}

document.getElementById('ckok').addEventListener('click', () => {
  localStorage.setItem('senna_ck', '1');
  document.getElementById('ck').classList.remove('show');
});

/* ── CONTENU DYNAMIQUE GOOGLE SHEETS ── */
const API_URL = 'https://script.google.com/macros/s/AKfycbyfGzkvr3eS-APu2AeXV9-Pq06FpByGXtjjrrLFwk-k5H79ZPgcY1GS7qqBhcyrK8Dt-Q/exec?type=all';

async function loadDynamicContent() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.temoignages) renderTemoignages(data.temoignages);
    if (data.blog) renderBlog(data.blog);
    if (data.faq) renderFaq(data.faq);
  } catch (err) {
    console.log('Contenu statique affiché');
  }
}

/* ── TÉMOIGNAGES ── */
function renderTemoignages(items) {
  if (!items.length) return;
  const track = document.getElementById('fb-track');
  if (!track) return;

  const stars = n => '★'.repeat(+n) + '☆'.repeat(5 - +n);

  track.innerHTML = [...items, ...items].map(t => `
    <div class="fc">
      <div class="fstars">${stars(t.note)}</div>
      <p class="ftxt">"${t.texte}"</p>
      <div class="fauth">
        <div class="fav">${t.initiales}</div>
        <div>
          <div class="fn">${t.nom}</div>
          <div class="fro">${t.role}</div>
        </div>
      </div>
    </div>
  `).join('');
}


/* ── BLOG ── */
function renderBlog(items) {
  if (!items.length) return;
  const grid = document.querySelector('.bgrid');
  if (!grid) return;

  const photos = [
    'images/hero.webp','images/troupeau.webp',
    'images/equipe-sena.webp','images/equipe-terrain.webp',
    'images/veau.webp','images/veau-soleil.webp'
  ];

  grid.innerHTML = items.map((b, i) => `
    <article class="bc" style="cursor:pointer"
      data-titre="${(b.titre||'').replace(/"/g,'&quot;')}"
      data-resume="${(b.resume||'').replace(/"/g,'&quot;')}"
      data-contenu="${(b.contenu||'').replace(/"/g,'&quot;')}"
      data-image="${b.image || photos[i % photos.length]}"
      data-date="${b.date||''}"
      data-categorie="${b.categorie||''}">
      <div class="bt" style="position:relative;height:185px;overflow:hidden;">
        <img src="${b.image || photos[i % photos.length]}"
             alt="${b.titre}"
             loading="lazy"
             onerror="this.src='${photos[i % photos.length]}'"
             style="width:100%;height:100%;object-fit:cover;display:block;">
        <span class="bcat">${b.categorie}</span>
      </div>
      <div class="bb">
        <h4>${b.titre}</h4>
        <p>${(b.resume||'').substring(0,100)}…</p>
        <div class="bmeta">
          <span>🗓 ${b.date}</span>
          <span>⏱ ${b.lecture} min</span>
        </div>
        <span class="brd">Lire l'article →</span>
      </div>
    </article>
  `).join('');

  // Ouvrir modal au clic
  grid.querySelectorAll('.bc').forEach(card => {
    card.addEventListener('click', () => openBlogModal(card.dataset));
  });
}

/* ── Lancer au chargement ── */
loadDynamicContent();

/* ── MODE SOMBRE / CLAIR ── */
const themeBtn = document.getElementById('theme-toggle');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('senna_theme') || (systemPrefersDark ? 'dark' : 'light');
const setTheme = theme => {
  document.documentElement.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre');
};

setTheme(savedTheme);

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('senna_theme', next);
  setTheme(next);
});

/* ══ TYPEWRITER EFFECT ═══════════════════════════════════ */
function typeWriter(el, text, speed, onDone) {
  let i = 0;
  el.textContent = '';
  el.style.width = '0';
  el.style.borderRight = '3px solid #C4892B';

  const type = () => {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      el.style.width = 'auto';
      i++;
      setTimeout(type, speed);
    } else {
      let blinks = 0;
      const blink = setInterval(() => {
        el.style.borderRight = blinks % 2 === 0 ? 'none' : '3px solid #C4892B';
        blinks++;
        if (blinks >= 6) {
          clearInterval(blink);
          el.style.borderRight = 'none';
          el.classList.add('done');
          if (onDone) onDone();
        }
      }, 300);
    }
  };

  type();
}

window.addEventListener('load', () => {
  const lines = document.querySelectorAll('.tw-line');
  if (!lines.length) return;

  // Rendre le titre visible d'abord
  const titre = document.querySelector('.ht');
  if(titre) {
    titre.style.opacity = '1';
    titre.style.animation = 'none';
  }

  const texts = [...lines].map(l => l.dataset.text || '');
  const speeds = [55, 65, 50];

  function runLine(index) {
    if (index >= lines.length) return;
    lines[index].style.opacity = '1';
    typeWriter(lines[index], texts[index], speeds[index], () => {
      setTimeout(() => runLine(index + 1), 200);
    });
  }

  setTimeout(() => runLine(0), 600);
});


/* ── FAQ ── */
function renderFaq(items) {
  const grid = document.getElementById('faq-grid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '<div class="faq-loading">Aucune question disponible.</div>';
    return;
  }

  grid.innerHTML = items.map((f, i) => `
    <div class="faq-item rv" data-c="${f.categorie}" style="transition-delay:${i * .08}s">
      <span class="faq-cat">${f.categorie}</span>
      <button class="faq-q" aria-expanded="false">
        <span class="faq-q-text">${f.question}</span>
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-a"><p>${f.reponse}</p></div>
    </div>
  `).join('');

  // Accordion
  grid.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Fermer tous
      grid.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      // Ouvrir celui cliqué
      if (!isOpen) item.classList.add('open');
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });

  // Filtres
  document.querySelectorAll('.faqbtn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.faqbtn').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const f = b.dataset.f;
      grid.querySelectorAll('.faq-item').forEach(item =>
        item.classList.toggle('hid', f !== 'all' && item.dataset.c !== f)
      );
    });
  });

  // Reveal
  grid.querySelectorAll('.rv').forEach(el => robs.observe(el));
}

/* ── BARRE DE PROGRESSION ── */
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled     = (scrollTop / docHeight) * 100;
  progressBar.style.width = scrolled + '%';
}, { passive: true });

/* ══ EFFET LUMIÈRE CURSEUR ══════════════════════════════════ */
const glowCards = document.querySelectorAll('.pc,.mvc,.ec,.bc,.fc,.eqcard');

glowCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    card.style.setProperty('--mouse-x', x);
    card.style.setProperty('--mouse-y', y);
  });
});


/* ── BLOG ARTICLES EXTERNES ── */
async function loadBlogArticles() {
  try {
    const res  = await fetch('/.netlify/functions/blog-articles');
    const data = await res.json();
    if (!data.articles || !data.articles.length) return;

    const grid = document.querySelector('.bgrid');
    if (!grid) return;

    const photos = [
      'images/hero.webp','images/troupeau.webp',
      'images/equipe-sena.webp','images/equipe-terrain.webp',
      'images/veau.webp','images/veau-soleil.webp'
    ];

    grid.innerHTML = data.articles.map((a, i) => `
      <article class="bc" style="cursor:pointer"
        data-titre="${(a.titre||'').replace(/"/g,'&quot;')}"
        data-resume="${(a.resume||'').replace(/"/g,'&quot;')}"
        data-image="${a.image || photos[i % photos.length]}"
        data-url="${a.url || '#'}"
        data-source="${a.source || 'GIC SE-NA\'A'}"
        data-date="${a.date || ''}">
        <div class="bt" style="position:relative;height:185px;overflow:hidden;">
          <img src="${a.image || photos[i % photos.length]}"
               alt="${a.titre}"
               loading="lazy"
               onerror="this.src='${photos[i % photos.length]}'"
               style="width:100%;height:100%;object-fit:cover;display:block;">
          <span class="bcat">Élevage</span>
        </div>
        <div class="bb">
          <h4>${a.titre}</h4>
          <p>${(a.resume || '').substring(0, 100)}…</p>
          <div class="bmeta">
            <span>🗓 ${a.date}</span>
            <span>📰 ${a.source}</span>
          </div>
          <span class="brd">Lire l'article →</span>
        </div>
      </article>
    `).join('');

    // Ouvrir modal au clic
    grid.querySelectorAll('.bc').forEach(card => {
      card.addEventListener('click', () => openBlogModal(card.dataset));
    });

  } catch(err) {
    console.log('Articles externes non disponibles');
  }
}

/* ── MODAL BLOG ── */
/*function openBlogModal(d) {
  document.getElementById('bmi').src        = d.image || '';
  document.getElementById('bm-titre').textContent  = d.titre || '';
  document.getElementById('bm-resume').textContent = d.resume || '';
  document.getElementById('bm-source').textContent = d.source || '';
  document.getElementById('bm-lire').href   = d.url || '#';
  document.getElementById('bm-wa').href     =
    `https://wa.me/?text=${encodeURIComponent(d.titre + ' ' + d.url)}`;

  const modal = document.getElementById('blog-modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

document.getElementById('blog-modal-close').addEventListener('click', () => {
  document.getElementById('blog-modal').style.display = 'none';
  document.body.style.overflow = '';
});

document.getElementById('blog-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.style.display = 'none';
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('blog-modal').style.display = 'none';
    document.body.style.overflow = '';
  }
});

// Lancer au chargement
loadBlogArticles();*/



/* ── MODAL BLOG ── */
function openBlogModal(d) {
  document.getElementById('bmi').src = d.image || '';
  document.getElementById('bm-titre').textContent   = d.titre || '';
  document.getElementById('bm-cat').textContent     = d.categorie || '';
  document.getElementById('bm-date').textContent    = '🗓 ' + (d.date || '');
  document.getElementById('bm-contenu').textContent = d.contenu || d.resume || '';
  document.getElementById('bm-wa').href =
    `https://wa.me/?text=${encodeURIComponent((d.titre||'') + ' — GIC SE-NA\'A sena-a.netlify.app')}`;

  const modal = document.getElementById('blog-modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Scroll en haut du modal
  document.getElementById('blog-modal-inner').scrollTop = 0;
}

document.getElementById('blog-modal-close').addEventListener('click', () => {
  document.getElementById('blog-modal').style.display = 'none';
  document.body.style.overflow = '';
});

document.getElementById('blog-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.style.display = 'none';
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('blog-modal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
  }
});
