(function(){
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (!toggle || !mobileNav) return;

  // open/close helper
  function openNav() {
    toggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.removeAttribute('hidden');
    // focus first link for keyboard users
    const first = mobileNav.querySelector('a, button');
    if (first) first.focus();
    // listen for escape and clicks outside
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick);
  }

  function closeNav(returnFocus=true) {
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    // wait for transition then hide to keep animations smooth
    const t = parseFloat(getComputedStyle(mobileNav).transitionDuration) * 1000 || 300;
    setTimeout(()=> mobileNav.setAttribute('hidden',''), t);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onDocClick);
    if (returnFocus) toggle.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') closeNav();
    // optional: trap focus inside mobileNav (small/simple variant)
  }

  function onDocClick(e) {
    // if click outside nav and not on toggle, close
    if (!mobileNav.contains(e.target) && !toggle.contains(e.target)) closeNav(false);
  }

  // toggle click
  toggle.addEventListener('click', function(e){
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeNav(); else openNav();
  });

  // allow Enter/Space on toggle when focused
  toggle.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle.click();
    }
  });

  // Close menu on link click (so nav collapses after selecting)
  mobileNav.addEventListener('click', function(e){
    const target = e.target;
    if (target.tagName === 'A' || target.tagName === 'BUTTON') {
      // small delay so user sees the tap feedback
      setTimeout(()=> closeNav(), 120);
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', function(){
    if (window.matchMedia('(min-width:881px)').matches) {
      // ensure hidden and aria reset
      toggle.setAttribute('aria-expanded','false');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('hidden','');
    }
  });
})();
