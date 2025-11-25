/*
  主交互脚本
  - 导航栏滚动背景透明度变化
  - 移动端菜单展开/收起（ARIA 无障碍）
  - 产品卡片悬停与轻微倾斜微交互
  - 内部链接平滑滚动（含降级）
  - 图片懒加载（IntersectionObserver 优先，回退为原生 loading=lazy）
*/

(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');

  /* 导航滚动时背景透明度变化 */
  const nav = document.querySelector('.global-nav');
  const onScroll = () => {
    const scrolled = window.scrollY > 8;
    nav.classList.toggle('has-scrolled', scrolled);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* 移动端菜单展开/收起 */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const openMenu = () => {
    mobileMenu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    // 将焦点置于菜单首项，提升无障碍体验
    const firstLink = mobileMenu.querySelector('a');
    firstLink && firstLink.focus();
    document.addEventListener('keydown', onKeyDown);
  };
  const closeMenu = () => {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeyDown);
  };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') closeMenu();
  };
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });
  // 点击移动菜单中的链接后关闭菜单
  mobileMenu.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.tagName === 'A') closeMenu();
  });

  /* 内部链接平滑滚动（CSS 已启用；此处为增强与回退） */
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.tagName === 'A') {
      const href = target.getAttribute('href') || '';
      if (href.startsWith('#') && href.length > 1) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.focus({ preventScroll: true });
        }
      }
    }
  });

  /* 产品卡片倾斜与浮动微交互（尊重减弱动画偏好） */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rx = ((y / rect.height) - 0.5) * -4; // 上下倾斜
        const ry = ((x / rect.width) - 0.5) * 4;  // 左右倾斜
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  /* 图片懒加载：优先使用 IntersectionObserver */
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach((img) => {
    img.decoding = 'async';
    img.fetchPriority = 'low';
  });

  const loadImage = (img) => {
    const src = img.getAttribute('data-src');
    if (!src) return;
    img.src = src;
    img.removeAttribute('data-src');
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '120px' });
    lazyImages.forEach((img) => io.observe(img));
  } else {
    // 回退：依赖原生 loading=lazy 或立即加载
    lazyImages.forEach((img) => loadImage(img));
  }
})();

