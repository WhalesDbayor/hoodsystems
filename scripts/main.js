// basic helpers
const yr = document.getElementById('yr'); yr.textContent = new Date().getFullYear();

// IntersectionObserver reveal & counter
const io = new IntersectionObserver((items)=>{
  items.forEach(i=>{
    if(i.isIntersecting){
      i.target.classList.add('visible');
      // animate counters inside
      i.target.querySelectorAll('[data-target]').forEach(el=>{
        if(!el.dataset.animated){ animateNum(el, +el.dataset.target); el.dataset.animated=1 }
      });
    }
  });
}, {threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

function animateNum(el,target){
  let start=0; const dur=900; const step=Math.ceil(target/(dur/20));
  const t=setInterval(()=>{ start+=step; if(start>=target){ el.textContent=target; clearInterval(t) } else el.textContent=start },20);
}

// Modal
function openModal(title, body){
  const m = document.getElementById('modal');
  document.getElementById('modalInner').innerHTML = `<h3 style="margin-top:0;color:#0b3f2a">${title}</h3><div style="color:var(--muted)">${body}</div>`;
  m.style.display='flex';
}
function closeModal(){ document.getElementById('modal').style.display='none' }
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal() });

// Carousel controls
// const carousel = document.getElementById('carousel');
// const leftBtn = document.getElementById('cLeft');
// const rightBtn = document.getElementById('cRight');
// const scrollAmount = 300;
// leftBtn.addEventListener('click', ()=>carousel.scrollBy({left:-scrollAmount, behavior:'smooth'}));
// rightBtn.addEventListener('click', ()=>carousel.scrollBy({left:scrollAmount, behavior:'smooth'}));
// keyboard
// carousel.addEventListener('keydown', (e)=>{ if(e.key==='ArrowLeft') carousel.scrollBy({left:-scrollAmount, behavior:'smooth'}); if(e.key==='ArrowRight') carousel.scrollBy({left:scrollAmount, behavior:'smooth'}) });


// CAROUSEL controls
// (function setupCarousel(){
//   const carousel = document.getElementById('activityCarousel');
//   const prev = document.getElementById('prev');
//   const next = document.getElementById('next');
//   const indicators = document.getElementById('indicators');
//   if(!carousel) return;
//   const slides = Array.from(carousel.querySelectorAll('.slide'));
//   // build indicators
//   slides.forEach((_,i)=>{
//     const dot = document.createElement('button');
//     dot.className = 'indicator'; dot.setAttribute('aria-label', 'Slide '+(i+1));
//     dot.addEventListener('click', ()=> { scrollToSlide(i); });
//     indicators.appendChild(dot);
//   });
//   updateIndicators();

//   function scrollToSlide(i){
//     const s = slides[i];
//     if(!s) return;
//     carousel.scrollTo({left: s.offsetLeft - (carousel.clientWidth - s.clientWidth)/2, behavior:'smooth'});
//   }
//   prev.addEventListener('click', ()=> carousel.scrollBy({left: -Math.min(600, carousel.clientWidth), behavior:'smooth'}));
//   next.addEventListener('click', ()=> carousel.scrollBy({left: Math.min(600, carousel.clientWidth), behavior:'smooth'}));
//   // update active indicator on scroll (throttled)
//   let last = 0;
//   carousel.addEventListener('scroll', ()=>{
//     window.requestAnimationFrame(updateIndicators);
//   });
//   function updateIndicators(){
//     const center = carousel.scrollLeft + carousel.clientWidth / 2;
//     let active = 0;
//     slides.forEach((s,i)=>{
//       if(s.offsetLeft + s.clientWidth/2 < center) active = i;
//     });
//     Array.from(indicators.children).forEach((dot,i)=> dot.classList.toggle('active', i === active));
//   }
//   updateIndicators();
//   // keyboard support
//   carousel.addEventListener('keydown', (e)=>{
//     if(e.key === 'ArrowLeft') prev.click();
//     if(e.key === 'ArrowRight') next.click();
//   });
//   // lazy load initial carousel images
//   lazyLoadImages(carousel);
// })();

// lazy images (simple)
document.querySelectorAll('img.lazy[data-src]').forEach(img=>{
  const src = img.dataset.src;
  if(src){ img.src = src; img.removeAttribute('data-src'); img.classList.remove('lazy') }
});

// contact form -> mailto fallback
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  const fd = new FormData(this); if(!fd.get('name')||!fd.get('email')){ alert('Please fill name and email'); return; }
  const body = Array.from(fd.entries()).map(([k,v])=>`${k}: ${v}`).join('\n');
  const mail = `mailto:hoodsystems123@gmail.com?subject=${encodeURIComponent('Website Contact')}&body=${encodeURIComponent(body)}`;
  window.location.href = mail;
});

// TESTIMONIAL form handler
// document.getElementById('testimonialForm').addEventListener('submit', function(e){
//   e.preventDefault();
//   const name = this.name.value.trim() || 'Anonymous';
//   const text = this.testimonial.value.trim();
//   if(!text){ alert('Please enter a testimonial'); return; }
//   Add to carousel locally (pending moderation)
//   const div = document.createElement('div'); div.className='testimonial';
//   div.innerHTML = `<strong>${escapeHtml(name)}</strong><p>${escapeHtml(text)}</p><small class="muted">Pending moderation</small>`;
//   qs('#testiList').appendChild(div);
//   this.reset();
//   alert('Thanks — your testimonial has been submitted for review.');
// });
// === CONFIG ===
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxw1EeWeD-BCHYVhie5f4OegbnUonI0uoC3IRdLn0CMhk21ryYAuVXlOLi-Hwxww5soGg/exec"; // <<--- REPLACE with your deployed Apps Script Web App URL
const LOCAL_COOLDOWN_MS = 15 * 1000;       // 15s per browser throttle
const MIN_SUBMIT_TIME_MS = 3000;           // require at least 3s on page before submit
const MIN_TEXT_LENGTH = 30;                // minimum testimonial characters
// ==============

// Utilities
const el = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const escapeHtml = s => (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

// form timestamp for min submit time
document.getElementById('formTimestamp').value = Date.now();

// Load testimonials (GET)
async function loadTestimonials() {
  try {
    const res = await fetch(SCRIPT_URL);
    if (!res.ok) throw new Error('Network response not ok');
    const list = await res.json();
    renderList(list);
  } catch (err) {
    console.error('Load error:', err);
    // show friendly message but don't spam the user
    const container = el('testiList');
    if (!container.innerHTML.trim()) container.innerHTML = '<p class="muted">Unable to load testimonials right now.</p>';
  }
}

function renderList(list) {
  const container = el('testiList');
  container.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<p class="muted">No testimonials yet — be the first!</p>';
    return;
  }
  // newest first (server returns oldest→newest)
  list.slice().reverse().forEach(item => {
    const d = document.createElement('div');
    d.className = 'testimonial';
    const when = item.date ? new Date(item.date).toLocaleString() : '';
    d.innerHTML = `<strong>${escapeHtml(item.name || 'Anonymous')}</strong>
                    <p>${escapeHtml(item.text)}</p>
                    <div class="muted">${escapeHtml(when)}</div>`;
    container.appendChild(d);
  });
}

// Form submit handler
document.getElementById('testimonialForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const btn = el('submitBtn');
  const status = el('statusMsg');
  status.textContent = '';

  // Honeypot
  if (this.website && this.website.value.trim()) {
    alert('Submission rejected.');
    return;
  }

  // Local cooldown
  const last = parseInt(localStorage.getItem('lastTestiAt') || '0', 10);
  if (Date.now() - last < LOCAL_COOLDOWN_MS) {
    alert('Please wait a bit before submitting again.');
    return;
  }

  // Min submit time (help block bots)
  const formTs = parseInt(document.getElementById('formTimestamp').value || '0', 10);
  if (Date.now() - formTs < MIN_SUBMIT_TIME_MS) {
    alert('Please take a moment to write your testimonial.');
    return;
  }

  // Gather values
  const name = (this.name?.value || '').trim() || 'Anonymous';
  const text = (this.testimonial?.value || '').trim();

  if (!text) { alert('Please enter a testimonial.'); return; }
  if (text.length < MIN_TEXT_LENGTH) { alert('Please write a more detailed testimonial (longer).'); return; }
  if (/https?:\/\//i.test(text) || /www\./i.test(text) || /mailto:/i.test(text)) { alert('Please remove links from your testimonial.'); return; }
  if (!/[aeiou]/i.test(text)) { alert('Please provide meaningful text.'); return; }

  // Prepare form-encoded body to avoid CORS preflight
  const params = new URLSearchParams();
  params.append('name', name);
  params.append('text', text);

  try {
    btn.disabled = true;
    status.textContent = 'Sending...';
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: params.toString()
    });

    const json = await res.json();
    if (json && json.status === 'success') {
      localStorage.setItem('lastTestiAt', Date.now().toString());
      this.reset();
      // reset timestamp so quick resubmission blocked by min submit time
      document.getElementById('formTimestamp').value = Date.now();
      status.textContent = 'Added ✅';
      loadTestimonials();
    } else {
      // Provide helpful rejection reason if available
      const reason = (json && (json.reason || json.message)) || 'rejected';
      if (reason === 'contains_link') alert('Remove links from your testimonial.');
      else if (reason === 'too_short') alert('Write a longer, meaningful testimonial.');
      else if (reason === 'duplicate_exact' || reason === 'recent_duplicate') alert('This testimonial looks like a duplicate and was rejected.');
      else if (reason === 'rate_limit') alert('Too many submissions right now — try again later.');
      else alert('Submission rejected or an error occurred.');
      console.warn('Server response:', json);
    }
  } catch (err) {
    console.error('Submit error:', err);
    alert('Network error — please try again.');
  } finally {
    btn.disabled = false;
    status.textContent = '';
  }
});

// assume `loadTestimonials()` fetches all items into `allTestimonials` array
let allTestimonials = []; // filled by fetch
let pageSize = 2;
let currentPage = 1;

function renderPage(page = 1) {
  currentPage = page;
  const start = (page-1)*pageSize;
  const pageItems = allTestimonials.slice(start, start + pageSize);
  const container = document.getElementById('testiList');
  container.innerHTML = '';
  pageItems.forEach(item => container.appendChild(renderTestimonial(item)));
  renderPager();
}

function renderPager() {
  const pager = document.getElementById('pager');
  const totalPages = Math.ceil(allTestimonials.length / pageSize) || 1;
  let html = `<button class="pager-btn" ${currentPage===1?'disabled':''} onclick="renderPage(${currentPage-1})">Prev</button>`;
  // show condensed page numbers (first, prev, current +-1, next, last)
  const range = [];
  for (let i = Math.max(1, currentPage-2); i <= Math.min(totalPages, currentPage+2); i++) range.push(i);
  if (range[0] > 1) html += `<button class="pager-btn" onclick="renderPage(1)">1</button><span>…</span>`;
  range.forEach(p => html += `<button class="pager-btn" ${p===currentPage?'disabled':''} onclick="renderPage(${p})">${p}</button>`);
  if (range[range.length-1] < totalPages) html += `<span>…</span><button class="pager-btn" onclick="renderPage(${totalPages})">${totalPages}</button>`;
  html += `<button class="pager-btn" ${currentPage===totalPages?'disabled':''} onclick="renderPage(${currentPage+1})">Next</button>`;
  pager.innerHTML = html;
}

// Example integration: after fetching
// allTestimonials = await fetchAll(); renderPage(1);


// initial load
document.addEventListener('DOMContentLoaded', loadTestimonials);