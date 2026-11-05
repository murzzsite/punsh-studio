const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/LGKYQLXNPA';

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const vh = () => window.innerHeight;

  $('#year').textContent = new Date().getFullYear();

  // intro: имя въезжает из масок
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('loaded')));

  // ---------- reveal (rAF по скроллу, без IntersectionObserver) ----------
  const groups = [
    ['.panel__text > *', 0.12],
    ['.panel__cap', 0],
    ['.series__list .head', 0],
    ['.who__body .head', 0],
    ['.who__list li', 0.1],
    ['.who__note', 0],
    ['.works .head', 0],
    ['.work', 0.1],
    ['.works__more', 0],
    ['.how__h', 0],
    ['.how__cap', 0],
    ['.price .head', 0],
    ['.price__lead', 0.1],
    ['.ticket', 0.15],
    ['.faq__col .head', 0],
    ['.faq__facts', 0.1],
    ['.faq__acc details', 0.08],
    ['.faq__end', 0],
    ['.faq__tall', 0],
    ['.faq__sq', 0.2],
    ['.contact__card', 0]
  ];
  const rv = [];
  groups.forEach(([sel, step]) => $$(sel).forEach((el, i) => {
    el.classList.add('rv');
    el.style.setProperty('--d', (i * step).toFixed(2) + 's');
    rv.push(el);
  }));

  // параллакс и масштаб входа фото
  const parImgs = $$('.panel__ph img');
  const parBg = $('.contact__bg');

  let ticking = false;
  const frame = () => {
    ticking = false;
    const h = vh();
    for (let i = rv.length - 1; i >= 0; i--) {
      const r = rv[i].getBoundingClientRect();
      if (r.top < h * 0.94 && r.bottom > 0) { rv[i].classList.add('in'); rv.splice(i, 1); }
    }
    if (!reduce) {
      parImgs.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        const p = (r.top + r.height / 2 - h / 2) / h;
        const k = Math.max(-1, Math.min(1, p));
        img.style.setProperty('--py', (-k * 7).toFixed(2) + '%');
        img.style.setProperty('--sc', (1.04 + Math.abs(k) * 0.08).toFixed(3));
      });
      if (parBg) {
        const r = parBg.parentElement.getBoundingClientRect();
        if (r.top < h && r.bottom > 0) parBg.style.transform = `translate3d(0, ${(r.top * -0.08).toFixed(1)}px, 0) scale(1.1)`;
      }
    }
    topcta.classList.toggle('is-off', $('#series').getBoundingClientRect().top < h * 0.5);
    seriesTick();
    whoTick();
  };
  const topcta = $('.topcta');
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);

  // ---------- серии: активное имя по центру экрана ----------
  const sLinks = $$('.series__list a');
  const sImgs = $$('.series__frame img');
  const sKind = $('#sKind'), sPrice = $('#sPrice');
  let sCur = -1;
  const setSeries = i => {
    if (i === sCur || i < 0) return;
    sCur = i;
    sLinks.forEach((a, k) => a.classList.toggle('is-active', k === i));
    sImgs.forEach((im, k) => im.classList.toggle('on', k === i));
    sKind.textContent = sLinks[i].dataset.kind;
    sPrice.textContent = sLinks[i].dataset.price;
  };
  const seriesTick = () => {
    const mid = vh() / 2;
    let best = -1, bd = 1e9;
    sLinks.forEach((a, i) => {
      const r = a.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    const first = sLinks[0].getBoundingClientRect(), last = sLinks[sLinks.length - 1].getBoundingClientRect();
    if (first.top < vh() && last.bottom > 0) setSeries(best);
  };
  sLinks.forEach((a, i) => {
    a.addEventListener('mouseenter', () => setSeries(i));
    a.addEventListener('focus', () => setSeries(i));
    const b = a.dataset.base;
    if (b) a.addEventListener('click', () => { const r = $(`input[name=base][value=${b}]`); if (r) { r.checked = true; calc(); } });
  });
  setSeries(0);

  // ---------- для кого ----------
  const wRows = $$('.who__list li');
  const wImgs = $$('.who__ph img');
  let wCur = 0;
  const setWho = i => {
    if (i === wCur) return;
    wCur = i;
    wRows.forEach((li, k) => li.classList.toggle('is-active', k === i));
    wImgs.forEach((im, k) => im.classList.toggle('on', k === i));
  };
  const whoTick = () => {
    const sec = $('.who').getBoundingClientRect();
    if (sec.top > vh() * 0.6 || sec.bottom < 0) return;
    const mid = vh() * 0.55;
    let best = 0, bd = 1e9;
    wRows.forEach((li, i) => {
      const r = $('.who__row', li).getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    setWho(best);
  };
  wRows.forEach((li, i) => {
    li.addEventListener('mouseenter', () => setWho(i));
    li.addEventListener('focus', () => setWho(i));
    li.addEventListener('click', () => setWho(i));
  });

  // ---------- билет ----------
  const fmt = n => n.toLocaleString('ru-RU').replace(/ /g, ' ');
  const bases = $$('input[name=base]');
  const xs = $$('input[name=x]');
  const rush = $('input[name=rush]');
  const tName = $('#tName'), tTotal = $('#tTotal'), tFrom = $('#tFrom'), tLines = $('#tLines');
  let shown = 0, tween = 0;
  const countTo = to => {
    cancelAnimationFrame(tween);
    const from = shown, t0 = performance.now(), dur = reduce ? 1 : 650;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur);
      shown = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      tTotal.textContent = fmt(shown);
      if (p < 1) tween = requestAnimationFrame(tick);
    };
    tween = requestAnimationFrame(tick);
  };
  let order = '';
  function calc() {
    const b = bases.find(x => x.checked) || bases[3];
    let sum = +b.dataset.price;
    const lines = [b.dataset.name];
    xs.forEach(x => { if (x.checked) { sum += +x.dataset.price; lines.push(x.dataset.name); } });
    if (rush.checked) { sum = Math.round(sum * 1.3 / 100) * 100; lines.push('Срочное выполнение +30%'); }
    tName.textContent = b.dataset.name;
    tFrom.textContent = b.dataset.from ? 'от' : '';
    tLines.innerHTML = lines.map(l => `<li>${l}</li>`).join('');
    countTo(sum);
    order = `${b.dataset.name}${xs.filter(x => x.checked).map(x => ' + ' + x.dataset.name).join('')}${rush.checked ? ' (срочно)' : ''}: ${b.dataset.from ? 'от ' : ''}${fmt(sum)} ₽`;
  }
  [...bases, ...xs, rush].forEach(i => i.addEventListener('change', calc));
  calc();
  $('#tGo').addEventListener('click', () => {
    $('#orderField').value = order;
    $('#orderNote').textContent = 'В заявку добавим: ' + order;
  });

  // ---------- магнитные кнопки ----------
  if (fine && !reduce) {
    $$('[data-magnet]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- плавный якорь ----------
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    const t = $(href);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  // ---------- форма → Worker → Telegram ----------
  const form = $('#leadForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('.form__btn', form);
    const orig = btn.textContent;
    const fd = new FormData(form);
    const p = {};
    fd.forEach((v, k) => { p[k] = v; });
    if (p._gotcha) return;
    if (!p.name || !p.contact) { alert('Заполните имя и контакт'); return; }
    if (!p.agree) { alert('Нужно согласие на обработку данных'); return; }
    const msg = [p.order ? 'Заказ: ' + p.order : '', p.message || ''].filter(Boolean).join('\n');
    const payload = { name: p.name, contact: p.contact, message: msg };
    btn.disabled = true; btn.textContent = 'Отправляем...';
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      btn.textContent = 'Заявка отправлена';
      form.reset();
      $('#orderNote').textContent = '';
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });

  frame();
})();
