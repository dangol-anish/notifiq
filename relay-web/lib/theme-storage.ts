/** Must stay in sync with the inline script in `app/layout.tsx`. */
export const THEME_STORAGE_KEY = "notifiq-theme";

/** Runs in <head> before first paint to avoid light-mode flash on load/navigation refresh. */
export const themeBlockingScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var v=localStorage.getItem(k);var d=v==="dark"||(v!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
