// Josh's Notes: newsletter slide-in for blog posts (option A, compact note).
// Added to each blog post with one line: <script src="/js/newsletter.js?v=1" defer></script>
// Shows bottom-right once a reader is 60% down the post. Closing it with the X
// hides it for 14 days; subscribing hides it for good. Posts to /api/subscribe,
// which already has the honeypot and timing checks.
(function () {
  var KEY = 'bm_nl_slidein';
  var HIDE_DAYS = 14;
  var SCROLL_POINT = 0.6;

  function getState() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function setState(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }

  var state = getState();
  if (state && state.subscribed) return;
  if (state && state.closedAt && Date.now() - state.closedAt < HIDE_DAYS * 864e5) return;

  var loadedAt = Date.now();

  var css = '' +
    '.nl-slide{position:fixed;right:24px;bottom:24px;z-index:900;width:340px;box-sizing:border-box;padding:22px;border-radius:18px;background:#fff;border:0.5px solid rgba(14,14,68,0.1);box-shadow:0 24px 60px rgba(14,14,68,0.2);font-family:"Poppins",sans-serif;color:#0E0E44;display:flex;flex-direction:column;gap:14px;transform:translateY(24px);opacity:0;visibility:hidden;transition:transform .4s ease,opacity .4s ease,visibility 0s linear .4s}' +
    '.nl-slide.is-open{transform:none;opacity:1;visibility:visible;transition:transform .4s ease,opacity .4s ease}' +
    '.nl-slide *{box-sizing:border-box}' +
    '.nl-close{position:absolute;top:10px;right:10px;width:44px;height:44px;border:none;background:transparent;color:rgba(14,14,68,0.45);display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:50%;transition:color .2s}' +
    '.nl-close:hover{color:#0E0E44}' +
    '.nl-close:focus-visible,.nl-btn:focus-visible{outline:2px solid #695AFF;outline-offset:2px}' +
    '.nl-head{display:flex;align-items:center;gap:12px;padding-right:30px}' +
    '.nl-avatar{width:40px;height:40px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#0E0E44,#695AFF);color:#fff;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center}' +
    '.nl-eyebrow{margin:0;font-size:10.5px;font-weight:500;text-transform:uppercase;letter-spacing:.14em;color:#695AFF}' +
    '.nl-when{margin:2px 0 0;font-size:12px;color:rgba(14,14,68,0.6)}' +
    '.nl-headline{margin:0;font-size:15px;font-weight:500;line-height:1.45}' +
    '.nl-sub{margin:0;font-size:13px;line-height:1.55;color:rgba(14,14,68,0.65)}' +
    '.nl-form{display:flex;flex-direction:column;gap:8px;margin:0}' +
    '.nl-input{width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(14,14,68,0.14);background:#fff;font-family:"Poppins",sans-serif;font-size:14px;color:#0E0E44;outline:none}' +
    '.nl-input::placeholder{color:rgba(14,14,68,0.35)}' +
    '.nl-input:focus{border-color:#695AFF}' +
    '.nl-btn{min-height:46px;border:none;border-radius:50px;background:linear-gradient(135deg,#0E0E44,#695AFF);color:#fff;font-family:"Poppins",sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .2s}' +
    '.nl-btn:hover{opacity:.9}.nl-btn:disabled{opacity:.6;cursor:default}' +
    '.nl-micro{margin:0;font-size:11.5px;color:rgba(14,14,68,0.6);text-align:center}' +
    '.nl-hp{position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0}' +
    '.nl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '@media(max-width:600px){.nl-slide{left:12px;right:12px;bottom:12px;width:auto;padding:18px;gap:12px}.nl-sub{display:none}}' +
    '@media(prefers-reduced-motion:reduce){.nl-slide,.nl-slide.is-open{transition:none}}';

  var html = '' +
    '<button class="nl-close" type="button" aria-label="Close">' +
      '<svg aria-hidden="true" width="13" height="13" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
    '</button>' +
    '<div class="nl-head">' +
      '<span class="nl-avatar" aria-hidden="true">JH</span>' +
      '<div><p class="nl-eyebrow">Josh\'s Notes</p><p class="nl-when">Every Tuesday</p></div>' +
    '</div>' +
    '<p class="nl-headline">Found this useful? I write one like it every Tuesday.</p>' +
    '<p class="nl-sub">What\'s working on LinkedIn, what isn\'t, and the mistakes I\'ve made building an agency.</p>' +
    '<form class="nl-form" novalidate>' +
      '<label class="nl-sr" for="nlEmail">Email address</label>' +
      '<input class="nl-input" id="nlEmail" type="email" name="email" placeholder="you@company.com" autocomplete="email" required>' +
      '<input class="nl-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="nl-btn" type="submit">Get Tuesday\'s note</button>' +
    '</form>' +
    '<p class="nl-micro" aria-live="polite">No spam. Unsubscribe in one click.</p>';

  function init() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var box = document.createElement('aside');
    box.className = 'nl-slide';
    box.setAttribute('aria-label', 'Newsletter signup');
    box.innerHTML = html;
    document.body.appendChild(box);

    var closeBtn = box.querySelector('.nl-close');
    var form = box.querySelector('.nl-form');
    var input = box.querySelector('.nl-input');
    var hp = box.querySelector('.nl-hp');
    var btn = box.querySelector('.nl-btn');
    var micro = box.querySelector('.nl-micro');
    var shown = false;

    function track(name) {
      if (typeof window.gtag === 'function') window.gtag('event', name, { location: 'blog_slidein' });
    }

    function open() {
      if (shown) return;
      shown = true;
      box.classList.add('is-open');
      window.removeEventListener('scroll', onScroll);
      track('newsletter_slidein_shown');
    }

    function close() {
      box.classList.remove('is-open');
      setState({ closedAt: Date.now() });
    }

    function onScroll() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= SCROLL_POINT) open();
    }

    function done() {
      setState({ subscribed: true });
      form.style.display = 'none';
      box.querySelector('.nl-headline').textContent = "You're in. Thanks for subscribing.";
      box.querySelector('.nl-sub').textContent = 'Your first note lands on Tuesday.';
      micro.textContent = '';
      track('newsletter_signup');
      setTimeout(function () { box.classList.remove('is-open'); }, 5000);
    }

    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        micro.textContent = 'Please enter a valid email address.';
        input.focus();
        return;
      }
      if (hp.value) { done(); return; }
      btn.disabled = true;
      btn.textContent = 'Subscribing...';
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, source: 'blog-slidein', website: hp.value, ts: loadedAt })
      })
        .then(function (res) {
          if (res.ok) { done(); return; }
          throw new Error('failed');
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = "Get Tuesday's note";
          micro.textContent = 'Something went wrong, please try again.';
        });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
