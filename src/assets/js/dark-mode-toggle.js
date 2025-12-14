(function() {
  const STORAGE_KEY = 'sloth-money-theme';
  const DARK_CLASS = 'dark';
  const TRANSITION_CLASS = 'theme-transition';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[dark-mode-toggle] Error reading theme from localStorage:', error);
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn('[dark-mode-toggle] Error saving theme to localStorage:', error);
    }
  }

  function getPreferredTheme() {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme, withTransition = false) {
    const html = document.documentElement;

    if (withTransition) {
      html.classList.add(TRANSITION_CLASS);
      setTimeout(() => {
        html.classList.remove(TRANSITION_CLASS);
      }, 300);
    }

    if (theme === 'dark') {
      html.classList.add(DARK_CLASS);
    } else {
      html.classList.remove(DARK_CLASS);
    }

    updateToggleIcons(theme);
  }

  function updateToggleIcons(theme) {
    const sunIcon = document.getElementById('theme-toggle-sun');
    const moonIcon = document.getElementById('theme-toggle-moon');

    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      }
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains(DARK_CLASS) ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setStoredTheme(newTheme);
    applyTheme(newTheme, true);
  }

  applyTheme(getPreferredTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      applyTheme(e.matches ? 'dark' : 'light', true);
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleTheme);
    }
    updateToggleIcons(getPreferredTheme());
  });
})();
