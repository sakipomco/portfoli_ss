/* Sticky header border */
const hdr = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  hdr.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

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
