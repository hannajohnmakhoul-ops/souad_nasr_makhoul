/* ── Lightbox ── */
var lbItems = [];
var lbIndex = 0;

/* ── Mobile Menu Toggle ── */
function toggleMobileMenu() {
  var btn = document.querySelector('.hamburger-btn');
  var menu = document.getElementById('nav-links-menu');
  btn.classList.toggle('active');
  menu.classList.toggle('mobile-open');
}

function closeMobileMenu() {
  var btn = document.querySelector('.hamburger-btn');
  var menu = document.getElementById('nav-links-menu');
  btn.classList.remove('active');
  menu.classList.remove('mobile-open');
}

// close menu when clicking outside of it (or on link already handled)
document.addEventListener('click', function(e) {
  var menu = document.getElementById('nav-links-menu');
  var btn = document.querySelector('.hamburger-btn');
  if (!menu || !btn) return;
  if (menu.classList.contains('mobile-open')) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      closeMobileMenu();
    }
  }
});

// collapse menu if viewport is resized above mobile threshold
window.addEventListener('resize', function() {
  if (window.innerWidth > 600) {
    closeMobileMenu();
  }
});

function buildLightboxItems() {
  lbItems = [];
  document.querySelectorAll('#page-gallery .gitem').forEach(function(item) {
    if (item.style.display === 'none') return;
    var img = item.querySelector('img');
    var src = img ? img.src : '';
    var canvas = item.querySelector('.gi-canvas');
    // for non-photo items, skip or use background
    var name   = item.querySelector('.gi-name')   ? item.querySelector('.gi-name').textContent   : '';
    var meta   = item.querySelector('.gi-meta')   ? item.querySelector('.gi-meta').textContent   : '';
    var medium = item.querySelector('.gi-medium') ? item.querySelector('.gi-medium').textContent : '';
    if (src) lbItems.push({ src: src, name: name, meta: meta, medium: medium, el: item });
  });
}

function openLightbox(el) {
  buildLightboxItems();
  var idx = lbItems.findIndex(function(i) { return i.el === el; });
  if (idx === -1) return;
  lbIndex = idx;
  showLbItem();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLbItem() {
  var item = lbItems[lbIndex];
  if (!item) return;
  var img = document.getElementById('lbImg');
  img.style.opacity = '0';
  img.src = item.src;
  img.onload = function() { img.style.transition = 'opacity 0.25s'; img.style.opacity = '1'; };
  document.getElementById('lbTitle').textContent  = item.name;
  document.getElementById('lbMeta').textContent   = item.meta;
  document.getElementById('lbMedium').textContent = item.medium;
  document.getElementById('lbCounter').textContent = (lbIndex + 1) + ' / ' + lbItems.length;
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function closeLightboxOutside(e) {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
}

function lbNav(dir) {
  lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
  showLbItem();
}

// keyboard support
document.addEventListener('keydown', function(e) {
  var lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') lbNav(1);
  if (e.key === 'ArrowLeft')  lbNav(-1);
});

// attach click to gallery items
function attachLightboxClicks() {
  document.querySelectorAll('#page-gallery .gitem').forEach(function(item) {
    item.addEventListener('click', function() { openLightbox(item); });
  });
}
attachLightboxClicks();

/* ── Page switching ── */
function showPage(id, skipHash) {
  // hide all
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  // show target
  var el = document.getElementById('page-' + id);
  if (el) { el.classList.add('active'); window.scrollTo(0,0); }
  // nav active state
  document.querySelectorAll('.nav-links a').forEach(function(a) { a.classList.remove('active'); });
  var navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  // update URL hash so refresh restores this page
  if (!skipHash) { window.location.hash = id; }
  // trigger reveals for newly shown page
  setTimeout(triggerReveals, 80);
  return false;
}

// restore page from URL hash on load
(function() {
  var hash = window.location.hash.replace('#', '');
  var validPages = ['home', 'gallery', 'haifa', 'about', 'shop'];
  if (hash && validPages.indexOf(hash) !== -1) {
    showPage(hash, true);
  }
})();

/* ── Scroll reveal ── */
function triggerReveals() {
  var activePage = document.querySelector('.page.active');
  if (!activePage) return;
  var reveals = activePage.querySelectorAll('.reveal:not(.visible)');
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(function(el) { obs.observe(el); });
}
triggerReveals();

/* ── Image protection ── */
document.addEventListener('contextmenu', function(e) {
  var t = e.target;
  if (
    t.tagName === 'IMG' ||
    t.closest('.gi-canvas') ||
    t.closest('.preview-thumb') ||
    t.closest('#lightbox')
  ) {
    e.preventDefault();
    return false;
  }
});

document.addEventListener('dragstart', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
    return false;
  }
});

document.addEventListener('keydown', function(e) {
  // Block Ctrl+S (save), Ctrl+U (view source), Ctrl+Shift+I / F12 (devtools)
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'u')) {
    e.preventDefault();
    return false;
  }
});

/* ── Gallery filter ── */
function filterGallery(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.gitem').forEach(function(item) {
    if (cat === 'all' || item.dataset.cat === cat) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}
