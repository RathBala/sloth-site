(function () {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const openIcon = document.getElementById('mobile-menu-open-icon');
  const closeIcon = document.getElementById('mobile-menu-close-icon');

  if (!menuToggle || !mobileMenu || !openIcon || !closeIcon) return;

  const setMenuState = (isOpen) => {
    mobileMenu.classList.toggle('hidden', !isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
    openIcon.classList.toggle('hidden', isOpen);
    closeIcon.classList.toggle('hidden', !isOpen);
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('hidden');
    setMenuState(isOpen);
  });
})();
