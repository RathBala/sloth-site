(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('[data-billing-option]');
    const planCards = document.querySelectorAll('[data-plan]');

    if (!toggleButtons.length || !planCards.length) return;

    const setBilling = (mode) => {
      toggleButtons.forEach((button) => {
        const isActive = button.dataset.billingOption === mode;
        button.classList.toggle('bg-white', isActive);
        button.classList.toggle('dark:bg-gray-900', isActive);
        button.classList.toggle('shadow', isActive);
        button.classList.toggle('text-gray-900', isActive);
        button.classList.toggle('dark:text-white', isActive);
        button.classList.toggle('text-gray-600', !isActive);
        button.classList.toggle('dark:text-gray-300', !isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      planCards.forEach((card) => {
        const shouldShow = card.dataset.plan === mode;
        card.classList.toggle('hidden', !shouldShow);
      });
    };

    toggleButtons.forEach((button) => {
      button.addEventListener('click', () => setBilling(button.dataset.billingOption));
    });

    setBilling('annual');
  });
})();
