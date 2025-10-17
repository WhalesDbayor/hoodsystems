(function(){
  // helpers
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

  // DOM nodes
  const modal = document.getElementById('videoModal');
  const modalPanel = qs('.video-modal-panel', modal);
  const backdrop = qs('.video-modal-backdrop', modal);
  const closeBtn = qs('.modal-close', modal);
  const videoEl = document.getElementById('modalVideo');

  // find all .video-thumb triggers (we only have one in example)
  const triggers = qsa('.video-thumb');

  function openModal(src, poster) {
    if (!src) return;
    // set source (replace if already set)
    // remove existing sources
    while (videoEl.firstChild) videoEl.removeChild(videoEl.firstChild);

    // create source element
    const source = document.createElement('source');
    source.src = src;
    // you may set type if known: source.type = 'video/mp4';
    videoEl.appendChild(source);

    // optional poster — not all browsers honor poster on <video> when source set dynamically,
    // but setting attribute is harmless
    if (poster) videoEl.setAttribute('poster', poster);
    else videoEl.removeAttribute('poster');

    // show modal
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    // small delay to allow layout then play
    // use play() and catch promise (autoplay may be blocked on some browsers if no user-gesture)
    setTimeout(() => {
      const playPromise = videoEl.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
          // autoplay blocked — allow user to press play button in controls
        });
      }
    }, 150);

    // trap focus inside modal (basic)
    closeBtn.focus();
    document.addEventListener('keydown', onKeyDown);
  }

  function closeModal() {
    // pause & reset
    try {
      videoEl.pause();
      videoEl.currentTime = 0;
    } catch(e){ /* ignore */ }

    // remove sources to free memory/stop download
    while (videoEl.firstChild) videoEl.removeChild(videoEl.firstChild);
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
    // optional: left/right to skip, etc.
  }

  // click handlers for triggers
  triggers.forEach(node => {
    node.addEventListener('click', function(evt){
      // dataset attributes used to get video source & poster
      const src = node.dataset.videoSrc || node.getAttribute('data-video-src');
      const poster = node.dataset.poster || node.getAttribute('data-poster');
      openModal(src, poster);
    });
    // keyboard activation
    node.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        node.click();
      }
    });
  });

  // close handlers
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // prevent clicks inside panel from closing
  modalPanel.addEventListener('click', e => e.stopPropagation());

  // cleanup on unload
  window.addEventListener('unload', () => { try { videoEl.pause(); } catch(e){} });

})();
