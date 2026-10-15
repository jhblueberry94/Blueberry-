// Start a Conversation button: moves the hover glow to follow the cursor.
// Runs only on devices with a mouse; does nothing on phones and tablets.
(function () {
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.addEventListener('pointermove', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('a.btn-primary[href="/contact"]') : null;
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', Math.round(e.clientX - r.left) + 'px');
    btn.style.setProperty('--my', Math.round(e.clientY - r.top) + 'px');
  }, { passive: true });
})();
