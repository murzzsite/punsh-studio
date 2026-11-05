'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = () => reducedMotion() ? 'instant' : 'smooth';
  const telegramUrl = window.PUNSH_CONFIG?.telegramUrl || 'https://t.me/Punsh_E';
  $$('[data-telegram]').forEach(link => { link.href = telegramUrl; });

  const nav = $('#navigation');
  const menu = $('.menu-toggle');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Открыть меню');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });

  const stories = {
    book: {
      inquiry: 'Сайт для автора или книги',
      address: 'Для мира вашей книги',
      eyebrow: 'Для автора и его читателей',
      lines: ['Ваша книга.', 'Целый мир.'],
      description: 'Покажите атмосферу романа, познакомьте с героями и пригласите читателя открыть первую страницу. У книги появится собственный мир по ссылке.',
      image: 'assets/envelope-book-cover.webp',
      alt: 'Обложка романа «Не возвращайся, генерал», автор Роза Френд',
      caption: 'Книжный проект / Не возвращайся, генерал',
      link: 'https://general.пуншсерия.рф/',
      order: 'Хочу сайт для книги'
    },
    gift: {
      inquiry: 'Сайт в подарок',
      address: 'Для вашего особенного человека',
      eyebrow: 'Для вашего близкого человека',
      lines: ['Эта история —', 'про вас.'],
      description: 'Ваша дружба, общие воспоминания и вы сами — герои отдельного мира. Такой подарок можно открыть одной ссылкой.',
      image: 'assets/envelope-gift-cover.webp',
      alt: 'Педролий — четыре подруги на диване',
      caption: 'Персональный проект / Педролий',
      link: 'https://pedroliy.пуншсерия.рф/',
      order: 'Хочу похожий подарок'
    },
    business: {
      inquiry: 'Коммерческий лендинг',
      address: 'Для вашего дела',
      eyebrow: 'Для брендов, экспертов и команд',
      lines: ['Ваш бренд.', 'Ваш характер.'],
      description: 'Посмотрите, как я представила свои услуги и работы на сайте «Пунш Серия». Для вашего проекта так же соберем предложение и проложим путь от знакомства до заявки.',
      image: 'assets/envelope-business-cover.webp',
      alt: 'Пунш Серия — у каждой истории свой сайт',
      caption: 'Собственный лендинг / Пунш Серия',
      link: 'https://пуншсерия.рф/',
      order: 'Обсудить мой лендинг'
    }
  };
  let selected = 'gift';
  const stage = $('#envelope-stage');
  const preview = $('#story-preview');
  const seal = $('#open-story');
  const title = $('#demo-title');
  let focusTimer;
  let hideTimer;
  let openingFrame;

  const renderStory = key => {
    selected = key;
    const story = stories[key];
    $$('[data-story]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.story === key)));
    $('#envelope-address').textContent = story.address;
    $('#demo-eyebrow').textContent = story.eyebrow;
    title.replaceChildren();
    story.lines.forEach((line, index) => {
      if (index) title.append(document.createTextNode(' '), document.createElement('br'));
      title.append(document.createTextNode(line));
    });
    $('#demo-description').textContent = story.description;
    $('#demo-visual-caption').textContent = story.caption;
    const order = $('#demo-order');
    order.replaceChildren(document.createTextNode(story.order + ' '));
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    order.append(arrow);
    const image = $('#demo-image');
    const link = $('#demo-project-link');
    image.src = story.image;
    image.alt = story.alt;
    link.href = story.link;
    $('#demo-ardmore-link').hidden = key !== 'book';
    $('#demo-magic-link').hidden = key !== 'gift';
    if (stage.classList.contains('is-open')) $('#story-status').textContent = 'Открыта история: ' + story.eyebrow.toLowerCase() + '.';
  };
  const showCoverOnMobile = () => {
    if (matchMedia('(max-width:640px)').matches) {
      stage.scrollIntoView({behavior:scrollBehavior(), block:'start'});
    }
  };
  $$('[data-story]').forEach(button => button.addEventListener('click', () => {
    renderStory(button.dataset.story);
    if (stage.classList.contains('is-open')) showCoverOnMobile();
  }));

  const openStory = () => {
    if (stage.classList.contains('is-open')) return;
    clearTimeout(hideTimer);
    clearTimeout(focusTimer);
    preview.hidden = false;
    preview.inert = false;
    stage.classList.add('is-open');
    seal.setAttribute('aria-expanded', 'true');
    seal.tabIndex = -1;
    seal.disabled = true;
    openingFrame = requestAnimationFrame(() => preview.classList.add('is-visible'));
    $('#story-status').textContent = 'Открыта история: ' + stories[selected].eyebrow.toLowerCase() + '.';
    focusTimer = setTimeout(() => {
      title.focus({preventScroll: true});
      showCoverOnMobile();
    }, reducedMotion() ? 0 : 850);
  };
  const closeStory = () => {
    if (!stage.classList.contains('is-open')) return;
    clearTimeout(focusTimer);
    cancelAnimationFrame(openingFrame);
    preview.inert = true;
    preview.classList.remove('is-visible');
    stage.classList.remove('is-open');
    seal.setAttribute('aria-expanded', 'false');
    seal.tabIndex = 0;
    seal.disabled = false;
    seal.focus({preventScroll: true});
    $('#story-status').textContent = 'История закрыта. Можно выбрать другое направление.';
    hideTimer = setTimeout(() => { preview.hidden = true; }, reducedMotion() ? 0 : 400);
  };
  seal.addEventListener('click', openStory);
  $('#close-story').addEventListener('click', closeStory);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || $('dialog[open]')) return;
    if (menu.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    } else closeStory();
  });

  const goToInquiry = kind => {
    const storyKey = Object.keys(stories).find(key => stories[key].inquiry === kind);
    if (storyKey) renderStory(storyKey);
    $('#project-kind').value = kind;
    $('#contact').scrollIntoView({behavior:scrollBehavior(), block:'start'});
    $('#client-name').focus({preventScroll:true});
  };
  $$('[data-inquiry]').forEach(button => button.addEventListener('click', () => goToInquiry(button.dataset.inquiry)));
  $('#hero-order').addEventListener('click', () => goToInquiry(stories[selected].inquiry));
  $('#demo-order').addEventListener('click', () => goToInquiry(stories[selected].inquiry));
  $$('[data-order-selected]').forEach(button => button.addEventListener('click', () => goToInquiry(stories[selected].inquiry)));

  if ('IntersectionObserver' in window) {
    let heroVisible = true;
    let contactVisible = false;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target.classList.contains('invitation-hero')) heroVisible = entry.isIntersecting;
        if (entry.target.id === 'contact') contactVisible = entry.isIntersecting;
      });
      $('#mobile-order-bar').hidden = heroVisible || contactVisible;
    }, {threshold:0});
    observer.observe($('.invitation-hero'));
    observer.observe($('#contact'));
  }

  $$('[data-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal()));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));

  const form = $('#inquiry-form');
  $$('input, textarea', form).forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = ['client-name','client-contact','project-idea'].map(id => document.getElementById(id));
    let valid = true;
    fields.forEach(field => {
      field.setCustomValidity(field.value.trim() ? '' : 'Пожалуйста, заполните это поле.');
      if (!field.checkValidity()) valid = false;
    });
    if (!valid) { form.reportValidity(); return; }
    const name = $('#client-name').value.trim();
    const contact = $('#client-contact').value.trim();
    const kind = $('#project-kind').value;
    const idea = $('#project-idea').value.trim();
    $('#brief-text').value = `Здравствуйте, Пунш! Хочу обсудить проект.\n\nМеня зовут: ${name}\nСвязаться со мной: ${contact}\nФормат: ${kind}\n\nМоя идея:\n${idea}`;
    $('#copy-status').textContent = '';
    $('#brief-dialog').showModal();
  });
  $('#copy-brief').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#brief-text').value);
      $('#copy-status').textContent = 'Текст скопирован. Откройте Telegram и вставьте его в сообщение.';
    } catch {
      $('#brief-text').focus();
      $('#brief-text').select();
      $('#copy-status').textContent = 'Текст выделен. Скопируйте его вручную и отправьте в Telegram.';
    }
  });
  $('#download-brief').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + $('#brief-text').value],{type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'punsh-project.txt';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  });
})();
