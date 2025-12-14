document.addEventListener('DOMContentLoaded', function() {
  const revealElements = document.querySelectorAll('.reveal');
  
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom > 0
    );
  }

  revealElements.forEach(el => {
    if (isElementInViewport(el)) {
      el.classList.add('visible');
    }
  });

  document.body.classList.add('js-loaded');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    if (!el.classList.contains('visible')) {
      revealObserver.observe(el);
    }
  });
});
