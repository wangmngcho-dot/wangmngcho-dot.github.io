/* Navigation and restrained motion, with a fully readable static fallback. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const header = document.querySelector('.studio-header');
  const nav = [...header.querySelectorAll('nav a')];
  const data = window.__ARCHIVE_PROJECT_DATA__;
  const escapeTitle = title => title.replace(/\.$/, '');
  const populateArchive = items => {
    const list = document.querySelector('#studio-archive');
    items.filter(p => p.kind !== 'system' && p.kind !== 'collection').forEach(p => {
      const a = document.createElement('a');
      a.href = '#project/' + p.slug;
      const name = document.createElement('span');
      const medium = document.createElement('small');
      name.textContent = escapeTitle(p.title);
      medium.textContent = p.kind === 'media' ? 'Moving image' : 'Fashion';
      a.append(name, medium);
      list.append(a);
    });
  };
  (data ? Promise.resolve(data) : fetch('content/projects.json').then(r => {if (!r.ok) throw Error(r.status);return r.json();}))
    .then(populateArchive).catch(() => {
      const a = document.createElement('a'); a.href = '#work'; a.textContent = 'Explore selected work';
      document.querySelector('#studio-archive').append(a);
    });

  document.addEventListener('click', event => {
    const a = event.target.closest('.studio-main a[href^="#project/"]');
    if (a && window.__openProjectFromApproach) {
      event.preventDefault();
      window.__openProjectFromApproach(decodeURIComponent(a.hash.split('/')[1]));
    }
  });
  document.querySelectorAll('.studio-header a,.studio-main a[href^="#"]').forEach(a => {
    if (a.hash.startsWith('#project/') || a.hash.startsWith('#approach/')) return;
    a.addEventListener('click', event => {
      const target = document.getElementById(a.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      window.__closeProjectForApproach?.();
      history.pushState({}, '', a.hash);
      target.scrollIntoView({behavior: 'instant', block: 'start'});
    });
  });
  // Observe a narrow reading band rather than requiring tall sections to fit the screen.
  const sections = [...document.querySelectorAll('.studio-main>section[id],.studio-main>footer[id]')];
  const sectionObserver = new IntersectionObserver(entries => {
    const entered = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!entered.length) return;
    const hash = '#' + entered[0].target.id;
    nav.forEach(a => a.hash === hash ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
  }, {rootMargin: '-15% 0px -65% 0px', threshold: 0});
  sections.forEach(s => sectionObserver.observe(s));

  const revealTargets = [...document.querySelectorAll('.studio-intro,.studio-card,.research-columns article,.studio-about-image,.studio-about-copy,.studio-contact h2')];
  const revealObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
  }), {rootMargin: '0px 0px 30px 0px', threshold: .05});
  // Very tall portraits must become visible as soon as their edge enters the viewport.
  revealTargets.forEach(el => {el.classList.add('reveal');revealObserver.observe(el);});
  root.classList.add('motion-ready');

  const images = [...document.querySelectorAll('.portrait-motion img')];
  const activeImages = new Set();
  const imageObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) activeImages.add(e.target); else activeImages.delete(e.target);
  }), {rootMargin: '80px 0px'});
  images.forEach(img => imageObserver.observe(img));
  let frame = 0;
  function renderScroll() {
    frame = 0;
    header.classList.toggle('is-scrolled', scrollY > 40);
    if (reduced.matches || mobile.matches) return;
    activeImages.forEach(img => {
      const box = img.parentElement.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (box.top + box.height / 2 - innerHeight / 2) / ((innerHeight + box.height) / 2)));
      img.style.setProperty('--drift', (progress * 16).toFixed(2) + 'px');
    });
  }
  const schedule = () => {if (!frame) frame = requestAnimationFrame(renderScroll);};
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  const resetMotion = () => {
    images.forEach(img => img.style.removeProperty('--drift'));
    if (reduced.matches) revealTargets.forEach(el => el.classList.add('is-visible'));
    schedule();
  };
  reduced.addEventListener('change', resetMotion);
  mobile.addEventListener('change', resetMotion);
  resetMotion();

  // Keep keyboard focus inside the active case or research publication.
  document.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const dialog = document.querySelector('#approach-view.open') || document.querySelector('#project-view.open');
    if (!dialog) return;
    const targets = [...dialog.querySelectorAll('a[href],button,video[controls],input,select,textarea,[tabindex="0"]')].filter(x => !x.disabled && x.getClientRects().length);
    if (!targets.length) return;
    const first = targets[0], last = targets[targets.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {e.preventDefault();last.focus();}
    else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {e.preventDefault();first.focus();}
  });
})();
