export type ThemeMode = 'dark' | 'glass' | 'light';

const THEME_KEY = 'admin_dashboard_theme';

export const getStoredTheme = (): ThemeMode => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'glass' || saved === 'light' || saved === 'dark') {
    return saved;
  }
  return 'dark';
};

export const applyTheme = (theme: ThemeMode) => {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'light') {
    document.documentElement.classList.add('theme-light');
    document.documentElement.classList.remove('theme-dark', 'theme-glass');
  } else if (theme === 'glass') {
    document.documentElement.classList.add('theme-glass');
    document.documentElement.classList.remove('theme-dark', 'theme-light');
  } else {
    document.documentElement.classList.add('theme-dark');
    document.documentElement.classList.remove('theme-light', 'theme-glass');
  }
};
