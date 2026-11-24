/* =========================================================
   COCO · 寻梦环游记 —— 页面交互脚本
   原生 JavaScript，无任何依赖
   ========================================================= */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. 导航：滚动状态 ---------- */
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');
  var progress = document.querySelector('.scroll-progress span');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;

    if (nav) nav.classList.toggle('scrolled', y > 60);
    if (toTop) toTop.classList.toggle('show', y > 600);

    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    if (sections && links) {
      var current = sections[0];
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= 150) current = section;
      });
      if (current) setActive(current.id);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. 移动端菜单 ---------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', '打开菜单'); }
  }

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) { closeMenu(); burger.focus(); }
    });
  }

  /* ---------- 4. 导航高亮（滚动监听） ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

  function setActive(id) {
    links.forEach(function (a) {
      var current = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', current);
      if (current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- 5. 滚动进入动效 ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, ob) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        // 同组元素依次延迟，形成节奏
        var siblings = Array.prototype.slice.call(el.parentNode.children).filter(function (n) {
          return n.classList && n.classList.contains('reveal');
        });
        var idx = siblings.indexOf(el);
        el.style.transitionDelay = (idx > 0 ? Math.min(idx, 5) * 90 : 0) + 'ms';
        el.classList.add('in');
        ob.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 6. 首页飘落花瓣 ---------- */
  var petalsBox = document.getElementById('petals');

  if (petalsBox && !prefersReduced) {
    var COUNT = window.innerWidth < 700 ? 12 : 22;

    for (var i = 0; i < COUNT; i++) {
      var p = document.createElement('i');
      var size = 6 + Math.random() * 9;
      p.className = 'petal';
      p.style.left = Math.random() * 100 + '%';
      p.style.width = size + 'px';
      p.style.height = (size * 1.5) + 'px';
      p.style.opacity = (0.28 + Math.random() * 0.5).toFixed(2);
      p.style.animationDuration = (11 + Math.random() * 12).toFixed(1) + 's';
      p.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
      p.style.filter = 'blur(' + (Math.random() < 0.35 ? 0.8 : 0) + 'px)';
      petalsBox.appendChild(p);
    }
  }

  /* ---------- 7. 回到顶部 ---------- */
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 9. 锚点平滑滚动（兼容旧浏览器） ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;

    var id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;

    var target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
    try { history.replaceState(null, '', id); } catch (err) { /* 本地文件仍可滚动导航 */ }
    if (a.classList.contains('skip-link')) { target.tabIndex = -1; target.focus({preventScroll:true}); }
  });

})();
