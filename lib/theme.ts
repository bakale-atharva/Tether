import { THEME_STORAGE_KEY } from "./constants";

// Inline script for <head>: applies the saved theme before first paint.
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
