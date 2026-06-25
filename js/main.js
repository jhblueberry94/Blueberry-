// Scroll reveal
const scrollRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      scrollRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.scroll-reveal').forEach(el => scrollRevealObserver.observe(el));

// Pink circle draw animation
const circleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const path = entry.target.querySelector('.circle-path');
      if (path) path.style.animation = 'drawCircle 1s ease-out forwards';
      circleObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
const buyingJourney = document.querySelector('.buying-journey');
if (buyingJourney) circleObserver.observe(buyingJourney);

// Hero fade-in on load
window.addEventListener('load', () => {
  document.querySelectorAll('.animate-fade-in-up').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});

// Mobile navigation
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// Content framework tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
if (tabBtns.length) {
  let activeIndex = 0;
  let progress = 0;
  let paused = false;
  let resumeTimer = null;
  const CYCLE_MS = 4000;
  const TICK_MS = 50;
  function setTab(index) {
    tabBtns.forEach((btn, i) => btn.classList.toggle('active', i === index));
    tabPanels.forEach((panel, i) => panel.classList.toggle('active', i === index));
    tabBtns.forEach(btn => { const bar = btn.querySelector('.progress-bar'); if (bar) bar.style.width = '0%'; });
  }
  setTab(0);
  const ticker = setInterval(() => {
    if (paused) return;
    progress += (TICK_MS / CYCLE_MS) * 100;
    const bar = tabBtns[activeIndex].querySelector('.progress-bar');
    if (bar) bar.style.width = Math.min(progress, 100) + '%';
    if (progress >= 100) {
      progress = 0;
      activeIndex = (activeIndex + 1) % tabBtns.length;
      setTab(activeIndex);
    }
  }, TICK_MS);
  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      clearTimeout(resumeTimer);
      activeIndex = i;
      progress = 0;
      paused = true;
      setTab(i);
      resumeTimer = setTimeout(() => { paused = false; }, 3000);
    });
  });
  const framework = document.querySelector('.content-framework');
  if (framework) {
    framework.addEventListener('mouseenter', () => { clearTimeout(resumeTimer); paused = true; });
    framework.addEventListener('mouseleave', () => { resumeTimer = setTimeout(() => { paused = false; }, 3000); });
  }
}

// Testimonial story panels
function toggleStory(person) {
  const normCard = document.getElementById('card-norm');
  const markCard = document.getElementById('card-mark');
  const normPanel = document.getElementById('story-norm');
  const markPanel = document.getElementById('story-mark');
  if (person === 'norm') {
    const isOpen = normCard && normCard.classList.contains('active');
    if (normCard) normCard.classList.toggle('active', !isOpen);
    if (markCard) markCard.classList.remove('active');
    if (normPanel) { normPanel.style.display = isOpen ? 'none' : 'grid'; if (!isOpen) normPanel.style.animation = 'storyFadeUp 0.3s ease-out forwards'; }
    if (markPanel) markPanel.style.display = 'none';
  } else {
    const isOpen = markCard && markCard.classList.contains('active');
    if (markCard) markCard.classList.toggle('active', !isOpen);
    if (normCard) normCard.classList.remove('active');
    if (markPanel) { markPanel.style.display = isOpen ? 'none' : 'grid'; if (!isOpen) markPanel.style.animation = 'storyFadeUp 0.3s ease-out forwards'; }
    if (normPanel) normPanel.style.display = 'none';
  }
}

// Process step accordion (how-it-works page)
function setStep(index) {
  document.querySelectorAll('.process-step-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.process-panel').forEach((panel, i) => {
    panel.style.display = i === index ? 'block' : 'none';
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  const chevron = item.querySelector('.faq-chevron');
  if (question) {
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const a = i.querySelector('.faq-answer');
        const c = i.querySelector('.faq-chevron');
        if (a) a.style.maxHeight = '0';
        if (c) c.style.transform = 'rotate(0deg)';
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      }
    });
  }
});

// ICP accordion (who-its-for page)
document.querySelectorAll('.icp-panel').forEach(panel => {
  const header = panel.querySelector('.icp-header');
  const body = panel.querySelector('.icp-body');
  if (header) {
    header.addEventListener('click', () => {
      const isOpen = panel.classList.contains('open');
      document.querySelectorAll('.icp-panel').forEach(p => {
        p.classList.remove('open');
        const b = p.querySelector('.icp-body');
        if (b) b.style.maxHeight = '0';
      });
      if (!isOpen) {
        panel.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  }
});



// Contact form
const contactForm = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: contactForm.elements['name'].value,
      company: contactForm.elements['company'].value,
      email: contactForm.elements['email'].value,
      message: contactForm.elements['message'].value
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) { console.log('Contact form submitted'); }
    contactForm.style.display = 'none';
    if (contactSuccess) { contactSuccess.style.display = 'block'; }
  });
}

// Blog filter tabs
const filterTabs = document.querySelectorAll('.filter-tab');
const blogCards = document.querySelectorAll('.blog-card');
if (filterTabs.length) {
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.filter;
      let visible = 0;
      blogCards.forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.style.display = show ? 'block' : 'none';
        if (show) visible++;
      });
      const countEl = document.querySelector('.post-count');
      if (countEl) countEl.textContent = visible + ' article' + (visible !== 1 ? 's' : '');
    });
  });
}

// Active nav link
(function() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href !== '/' && path.startsWith(href)) link.classList.add('active');
    else if (href === '/' && path === '/') link.classList.add('active');
  });
})();
// Newsletter signup
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    const btn = newsletterForm.querySelector('button');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        newsletterForm.style.display = 'none';
        document.getElementById('newsletter-success').style.display = 'block';
      } else {
        btn.textContent = 'Try again';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  });
}

