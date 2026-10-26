// Booking prompt for high-intent pages (option A, "next free times").
// Add to a page with one line, setting that page's question:
// <script src="/js/booking-prompt.js?v=1" data-question="Worried it won't sound like you?" defer></script>
//
// Rules: desktop only. Shows after 45 seconds actively on the page, or straight
// away on the second commercial page in the same visit. Once per visit, three
// times in total, and never again once someone picks a time, opens the
// calendar or heads to the contact page. The X hides it for this visit.
(function () {
  var CAL_LINK = 'https://www.cal.eu/josh-huggins-mkwhu8/30min';
  var DELAY_MS = 45000;
  var MAX_SHOWS = 3;
  var KEY = 'bm_book_prompt';
  var SESSION_KEY = 'bm_book_prompt_session';

  var script = document.currentScript;
  var question = (script && script.getAttribute('data-question')) || 'Rather talk it through?';

  if (!window.matchMedia || !window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches) return;

  function load(store, k) { try { return JSON.parse(store.getItem(k) || 'null'); } catch (e) { return null; } }
  function save(store, k, v) { try { store.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var state = load(localStorage, KEY) || { shows: 0, done: false };
  var session = load(sessionStorage, SESSION_KEY) || { pages: 0, shown: false };
  session.pages += 1;
  save(sessionStorage, SESSION_KEY, session);

  // Anyone who books or heads to contact from these pages never sees it again.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('cal.eu') !== -1 || href.indexOf('cal.com') !== -1 || href === '/contact' || href.indexOf('/contact') === 0) {
      state.done = true; save(localStorage, KEY, state);
    }
  }, true);

  if (state.done || state.shows >= MAX_SHOWS || session.shown) return;

  var css = '' +
    '.bp-card{position:fixed;right:32px;bottom:32px;z-index:900;width:368px;box-sizing:border-box;padding:24px;border-radius:20px;background:#fff;border:0.5px solid rgba(14,14,68,0.1);box-shadow:0 28px 70px rgba(14,14,68,0.22);font-family:"Poppins",sans-serif;color:#0E0E44;display:flex;flex-direction:column;gap:16px;transform:translateY(24px);opacity:0;visibility:hidden;transition:transform .45s ease,opacity .45s ease,visibility 0s linear .45s}' +
    '.bp-card.is-open{transform:none;opacity:1;visibility:visible;transition:transform .45s ease,opacity .45s ease}' +
    '.bp-card *{box-sizing:border-box}' +
    '.bp-close{position:absolute;top:12px;right:12px;width:44px;height:44px;border:none;background:transparent;color:rgba(14,14,68,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:50%;transition:color .2s}' +
    '.bp-close:hover{color:#0E0E44}' +
    '.bp-card a:focus-visible,.bp-close:focus-visible{outline:2px solid #695AFF;outline-offset:2px}' +
    '.bp-live{display:flex;align-items:center;gap:8px;padding-right:40px;font-size:12px;font-weight:500;color:rgba(14,14,68,0.7)}' +
    '.bp-dot{width:8px;height:8px;border-radius:50%;background:#1E9E57;box-shadow:0 0 0 4px rgba(30,158,87,0.15)}' +
    '.bp-q{margin:0;font-size:19px;font-weight:600;line-height:1.3;letter-spacing:-0.01em}' +
    '.bp-sub{margin:8px 0 0;font-size:13.5px;line-height:1.6;color:rgba(14,14,68,0.66)}' +
    '.bp-label{margin:0 0 8px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.14em;color:rgba(14,14,68,0.6)}' +
    '.bp-slots{display:flex;flex-direction:column;gap:8px}' +
    '.bp-slot{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:0 16px;border-radius:12px;border:1.5px solid rgba(14,14,68,0.14);text-decoration:none;font-size:14px;font-weight:500;color:#0E0E44;transition:border-color .2s,background .2s}' +
    '.bp-slot:hover,.bp-slot:first-child{border-color:#695AFF;background:rgba(105,90,255,0.06);color:#0E0E44}' +
    '.bp-cta{display:flex;align-items:center;justify-content:center;min-height:50px;border-radius:50px;background:linear-gradient(135deg,#0E0E44,#695AFF);color:#fff;font-size:15px;font-weight:500;text-decoration:none}' +
    '.bp-cta:hover{color:#fff;opacity:.92}' +
    '.bp-foot{display:flex;align-items:center;justify-content:space-between;gap:12px}' +
    '.bp-all{font-size:13px;font-weight:500;color:#0E0E44;text-underline-offset:4px}' +
    '.bp-all:hover{color:#695AFF}' +
    '.bp-note{font-size:12px;color:rgba(14,14,68,0.6)}' +
    '@media(prefers-reduced-motion:reduce){.bp-card,.bp-card.is-open{transition:none}}';

  function track(name) {
    if (typeof window.gtag === 'function') window.gtag('event', name, { location: 'booking_prompt', page_path: location.pathname });
  }

  function slotUrl(iso) {
    var d = iso.slice(0, 10);
    return CAL_LINK + '?month=' + d.slice(0, 7) + '&date=' + d + '&slot=' + encodeURIComponent(iso);
  }

  // Times are always shown in UK time, and labelled as such.
  var tz = 'Europe/London';
  var dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz });
  var timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
  var tzLabel = 'UK time';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function build(slots) {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var box = document.createElement('aside');
    box.className = 'bp-card';
    box.setAttribute('aria-label', 'Book a call');

    var times;
    if (slots.length) {
      times = '<div><p class="bp-label">Next free times · ' + tzLabel + '</p><div class="bp-slots">' +
        slots.map(function (iso) {
          var t = new Date(iso);
          return '<a class="bp-slot" href="' + esc(slotUrl(iso)) + '" target="_blank" rel="noopener noreferrer"><span>' +
            esc(dayFmt.format(t)) + '</span><span>' + esc(timeFmt.format(t)) + '</span></a>';
        }).join('') + '</div></div>' +
        '<div class="bp-foot"><a class="bp-all" href="' + CAL_LINK + '" target="_blank" rel="noopener noreferrer">See all times</a>' +
        '<span class="bp-note">Then just your name and email</span></div>';
    } else {
      times = '<a class="bp-cta" href="' + CAL_LINK + '" target="_blank" rel="noopener noreferrer">Pick a time</a>' +
        '<p class="bp-note" style="margin:0;text-align:center">Then just your name and email</p>';
    }

    box.innerHTML =
      '<button class="bp-close" type="button" aria-label="Close">' +
        '<svg aria-hidden="true" width="13" height="13" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="bp-live"><span class="bp-dot" aria-hidden="true"></span>30-min call with the team</div>' +
      '<div><p class="bp-q">' + esc(question) + '</p>' +
      '<p class="bp-sub">In 30 minutes we\'ll look at where you are and tell you where we\'d start, even if that isn\'t with us.</p></div>' +
      times;

    document.body.appendChild(box);

    box.querySelector('.bp-close').addEventListener('click', function () {
      box.classList.remove('is-open');
      track('booking_prompt_closed');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('is-open')) box.classList.remove('is-open');
    });
    box.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (a) track(a.classList.contains('bp-slot') ? 'booking_prompt_slot_click' : 'booking_prompt_calendar_click');
    });

    requestAnimationFrame(function () { box.classList.add('is-open'); });
    state.shows += 1; save(localStorage, KEY, state);
    session.shown = true; save(sessionStorage, SESSION_KEY, session);
    track('booking_prompt_shown');
  }

  var fired = false;
  function fire() {
    if (fired) return;
    fired = true;
    fetch('/api/slots')
      .then(function (r) { return r.ok ? r.json() : { slots: [] }; })
      .catch(function () { return { slots: [] }; })
      .then(function (d) { build((d && d.slots) || []); });
  }

  // Second commercial page this visit: show almost straight away.
  if (session.pages >= 2) { setTimeout(fire, 4000); return; }

  // Otherwise count only time the tab is actually in view.
  var visible = 0, last = Date.now();
  var timer = setInterval(function () {
    var now = Date.now();
    if (document.visibilityState === 'visible') visible += now - last;
    last = now;
    if (visible >= DELAY_MS) { clearInterval(timer); fire(); }
  }, 1000);
})();
