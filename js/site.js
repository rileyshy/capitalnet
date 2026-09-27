(() => {
  const config = window.CAPITAL_CONFIG || {};
  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const toast = document.getElementById('toast');

  const linkMap = {
    connect: config.connectUrl,
    discord: config.discordUrl,
    rules: config.rulesUrl,
    companies: config.companiesUrl,
    support: config.supportUrl,
    tiktok: config.tiktokUrl
  };

  document.querySelectorAll('[data-config-link]').forEach((link) => {
    const key = link.dataset.configLink;
    if (linkMap[key]) link.href = linkMap[key];
  });

  const connectCode = document.getElementById('connectCode');
  if (connectCode && config.serverCode) connectCode.textContent = `cfx.re/join/${config.serverCode}`;

  document.getElementById('currentYear').textContent = new Date().getFullYear();

  const setMenu = (open) => {
    menuToggle.classList.toggle('is-open', open);
    mainNav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle.addEventListener('click', () => setMenu(!mainNav.classList.contains('is-open')));
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  document.getElementById('copyConnect').addEventListener('click', async () => {
    const value = config.connectUrl || `https://cfx.re/join/${config.serverCode || 'v9myj5'}`;
    try {
      await navigator.clipboard.writeText(value);
      showToast('Connect link copied');
    } catch (_) {
      const input = document.createElement('textarea');
      input.value = value;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      showToast('Connect link copied');
    }
  });

  const serverStatus = document.getElementById('serverStatus');
  const serverDot = document.getElementById('serverDot');
  const playerCount = document.getElementById('playerCount');

  const updateServerStatus = async () => {
    if (!config.serverCode) return;
    try {
      const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(config.serverCode)}`, {
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Server status unavailable');
      const payload = await response.json();
      const data = payload.Data || payload.data || payload;
      const players = data.clients ?? data.Clients;
      const maxPlayers = data.sv_maxclients ?? data.svMaxclients ?? data.vars?.sv_maxClients;
      serverStatus.textContent = 'Server online';
      serverDot.classList.add('online');
      if (players != null && maxPlayers != null) playerCount.textContent = `${players} / ${maxPlayers}`;
      else if (players != null) playerCount.textContent = `${players} online`;
    } catch (_) {
      serverStatus.textContent = 'Capital Network';
      serverDot.classList.add('neutral');
      playerCount.textContent = 'Join to play';
    }
  };
  updateServerStatus();

  let pointerTick = null;
  window.addEventListener('pointermove', (event) => {
    if (pointerTick) return;
    pointerTick = requestAnimationFrame(() => {
      root.style.setProperty('--mouse-x', `${event.clientX}px`);
      root.style.setProperty('--mouse-y', `${event.clientY}px`);
      pointerTick = null;
    });
  }, { passive: true });

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
  const activeObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.01, 0.25, 0.5] });
  sections.forEach((section) => activeObserver.observe(section));
})();
