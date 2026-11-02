// Cookie consent for blueberry-media.co.uk (option C, corner card).
// Added to each page with one line, directly above the Google Analytics snippet:
// <script src="/js/consent.js?v=1"></script>
// It loads before the analytics snippet so Google's consent defaults are set
// first. Analytics cookies stay off until a visitor clicks Accept. The Google
// Analytics snippet itself stays in each page because Search Console uses it to
// verify ownership of the site.
// The choice is kept for 6 months. Raise VERSION when a new tool is added so
// everyone is asked again. Any element with data-cookie-settings reopens the card.
(function () {
  var KEY = 'bm_consent';
  var VERSION = 1;
  var MAX_AGE = 182 * 864e5;
  var RELEASE_DELAY = 1500;

  function read() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s || s.v !== VERSION || !s.ts || Date.now() - s.ts > MAX_AGE) return null;
      return s.choice === 'accepted' || s.choice === 'rejected' ? s.choice : null;
    } catch (e) { return null; }
  }
  function write(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, choice: choice, ts: Date.now() })); } catch (e) {}
  }

  var choice = read();
  var doc = document.documentElement;

  // Google consent defaults. These run before the analytics snippet on the page.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    analytics_storage: choice === 'accepted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  gtag('set', 'ads_data_redaction', true);

  var css = '' +
    '.bmc-card{position:fixed;left:24px;bottom:24px;z-index:950;width:348px;box-sizing:border-box;padding:22px 22px 20px;border-radius:18px;background:#fff;border:0.5px solid rgba(14,14,68,0.1);box-shadow:0 24px 60px rgba(14,14,68,0.2);font-family:"Poppins",sans-serif;color:#0E0E44;display:flex;flex-direction:column;gap:12px;-webkit-font-smoothing:antialiased;opacity:0;transform:translateY(16px);transition:opacity .35s ease,transform .35s ease}' +
    '.bmc-card.bmc-in{opacity:1;transform:none}' +
    '.bmc-card *{box-sizing:border-box}' +
    '.bmc-title{margin:0;font-size:15px;font-weight:600;letter-spacing:-0.01em;color:#0E0E44}' +
    '.bmc-body{margin:0;font-size:13px;line-height:1.6;color:rgba(14,14,68,0.68)}' +
    '.bmc-btns{display:flex;gap:8px}' +
    '.bmc-btn{flex:1;height:44px;padding:0 22px;border-radius:10px;font-family:"Poppins",sans-serif;font-size:14px;font-weight:500;background:hsl(247,60%,95%);border:1.5px solid hsl(247,60%,95%);color:#0E0E44;cursor:pointer;transition:border-color .2s}' +
    '.bmc-btn:hover{border-color:rgba(105,90,255,0.45)}' +
    '.bmc-link{font-size:12px;color:rgba(14,14,68,0.68);text-decoration:underline;text-underline-offset:2px;white-space:nowrap}' +
    '.bmc-link:hover{color:#695AFF}' +
    '.bmc-btn:focus-visible,.bmc-link:focus-visible{outline:2px solid #695AFF;outline-offset:2px}' +
    '.bmc-short{display:none}' +
    '@media (max-width:760px){' +
      '.bmc-card{left:12px;right:12px;bottom:12px;width:auto;padding:16px 18px;border-radius:16px}' +
      '.bmc-title,.bmc-long,.bmc-foot{display:none}' +
      '.bmc-short{display:inline}' +
      '.bmc-body{line-height:1.5}' +
      '.bmc-body .bmc-link{font-size:13px;color:#0E0E44}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){.bmc-card{transition:none;transform:none}}' +
    // While the card is waiting for an answer, hold the newsletter note and
    // booking prompt so two cards never arrive at once.
    'html.bmc-hold .nl-slide,html.bmc-hold .bp-card{opacity:0!important;visibility:hidden!important;pointer-events:none!important}';

  var style = document.createElement('style');
  style.textContent = css;
  (document.head || doc).appendChild(style);

  if (!choice) doc.classList.add('bmc-hold');

  var card = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function clearGaCookies() {
    var host = location.hostname.replace(/^www\./, '');
    var domains = ['', host, '.' + host, location.hostname, '.' + location.hostname];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function decide(value) {
    write(value);
    choice = value;
    gtag('consent', 'update', { analytics_storage: value === 'accepted' ? 'granted' : 'denied' });
    if (value === 'rejected') clearGaCookies();
    close();
    if (doc.classList.contains('bmc-hold')) {
      setTimeout(function () { doc.classList.remove('bmc-hold'); }, RELEASE_DELAY);
    }
  }

  function close() {
    if (!card) return;
    var c = card;
    card = null;
    c.classList.remove('bmc-in');
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 400);
  }

  function open() {
    if (card || !document.body) return;
    card = el('div', 'bmc-card');
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Cookie choices');
    card.setAttribute('data-nosnippet', '');

    var body = el('p', 'bmc-body');
    body.appendChild(el('span', 'bmc-long', "We'd like to use analytics cookies to see which pages are useful. They stay off unless you accept."));
    body.appendChild(el('span', 'bmc-short', "We'd like to use analytics cookies to see which pages are useful. "));
    var inline = el('a', 'bmc-link bmc-short', 'Privacy policy');
    inline.href = '/privacy#cookies';
    body.appendChild(inline);

    var btns = el('div', 'bmc-btns');
    var reject = el('button', 'bmc-btn', 'Reject');
    var accept = el('button', 'bmc-btn', 'Accept');
    reject.type = accept.type = 'button';
    reject.addEventListener('click', function () { decide('rejected'); });
    accept.addEventListener('click', function () { decide('accepted'); });
    btns.appendChild(reject);
    btns.appendChild(accept);

    var foot = el('div', 'bmc-foot');
    var link = el('a', 'bmc-link', 'Privacy policy');
    link.href = '/privacy#cookies';
    foot.appendChild(link);

    card.appendChild(el('p', 'bmc-title', 'Cookies on this site'));
    card.appendChild(body);
    card.appendChild(btns);
    card.appendChild(foot);
    document.body.appendChild(card);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (card) card.classList.add('bmc-in'); }); });
  }

  // "Cookie settings" links and buttons reopen the card.
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
    if (!t) return;
    e.preventDefault();
    open();
  });

  window.bmConsent = { open: open, get: function () { return choice; } };

  if (!choice) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open);
    else open();
  }
})();
