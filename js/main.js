/* Sticky header: white and compact once the page is scrolled */
const hdr = document.getElementById('site-header');
const syncHeader = () => hdr.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', syncHeader, { passive: true });
/* Reloading mid-page should start compact too */
syncHeader();

/* Works tab filter */
const tabBtns  = document.querySelectorAll('.tab-btn');
const workCards = document.querySelectorAll('.work-card');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const tab = btn.dataset.tab;
    workCards.forEach(card => {
      const show = tab === 'all' || card.dataset.category === tab;
      card.style.display = show ? '' : 'none';
    });
  });
});

/* Scroll reveal with stagger */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
);

/* Stagger siblings in the same parent */
const revealEls = document.querySelectorAll('.reveal');
let siblingIndex = new Map();

revealEls.forEach(el => {
  const parent = el.parentElement;
  const idx = (siblingIndex.get(parent) || 0);
  siblingIndex.set(parent, idx + 1);
  el.style.transitionDelay = `${idx * 0.06}s`;
  revealObserver.observe(el);
});

/* Contact form: send to Formspree, then go to thanks page */
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit');
    btn.disabled = true;
    formStatus.textContent = '送信しています…';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) {
        /* 失敗の理由を特定できるよう、送信先が返した内容をコンソールに残す */
        const detail = await res.text().catch(() => '');
        console.error('[contact] 送信失敗', res.status, res.statusText, detail);
        throw new Error(res.status);
      }
      window.location.href = '/thanks.html';
    } catch (err) {
      console.error('[contact]', err);
      formStatus.textContent = '送信できませんでした。時間をおいて再度お試しいただくか、InstagramのDMからご連絡ください。';
      btn.disabled = false;
    }
  });
}

/* Lightbox: click a work card to view it large, arrow through extra shots */
const lb       = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbCount  = document.getElementById('lb-count');
const lbPrev   = document.getElementById('lb-prev');
const lbNext   = document.getElementById('lb-next');
const lbClose  = document.getElementById('lb-close');

if (lb) {
  let shots = [];
  let index = 0;
  let lastFocus = null;

  const render = () => {
    lbImg.src = shots[index].src;
    lbImg.alt = shots[index].alt;
    lbCount.textContent = `${index + 1} / ${shots.length}`;
    lb.classList.toggle('is-single', shots.length < 2);
  };

  const open = card => {
    const first = card.querySelector('img');
    const extra = (card.dataset.more || '').split(',').filter(Boolean);
    shots = [{ src: first.src, alt: first.alt }]
      .concat(extra.map(src => ({ src, alt: first.alt })));
    index = 0;
    lastFocus = document.activeElement;
    render();
    lb.hidden = false;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  };

  const close = () => {
    lb.classList.remove('is-open');
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  const step = n => {
    index = (index + n + shots.length) % shots.length;
    render();
  };

  workCards.forEach(card => {
    card.addEventListener('click', () => open(card));
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(card);
      }
    });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => step(-1));
  lbNext.addEventListener('click', () => step(1));

  /* Clicking the backdrop closes; clicking the image itself does not */
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.classList.contains('lightbox-figure')) close();
  });

  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}
