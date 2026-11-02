/* AllWebsites.Design UI layer for WebPalette: manual light/dark toggle.
   The theme is set before first paint by a small inline script in each
   page's <head>; this file injects the toggle button into whatever top
   bar the page renders and persists the choice (localStorage "wp-ui"). */
(function () {
  var KEY = "wp-ui";
  var root = document.documentElement;
  function current() { return root.getAttribute("data-ui") === "dark" ? "dark" : "light"; }

  var SUN = '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0Zm72 88a64 64 0 1 1-64-64 64.07 64.07 0 0 1 64 64Zm-16 0a48 48 0 1 0-48 48 48.05 48.05 0 0 0 48-48ZM58.34 69.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32ZM192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72Zm5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8Zm80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8Zm112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16Z"/></svg>';
  var MOON = '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M233.54 142.23a8 8 0 0 0-8-2 88.08 88.08 0 0 1-109.8-109.8 8 8 0 0 0-10-10 104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.09 103.09 0 0 0 62.52-20.88 104.84 104.84 0 0 0 37-52.91 8 8 0 0 0-1.98-7.98Zm-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104 106 106 0 0 0 14.92-1.06 89 89 0 0 1-26.02 31.4Z"/></svg>';

  var btn;
  function paint() {
    var c = current();
    btn.innerHTML = c === "dark" ? SUN : MOON;
    var lbl = "Theme: " + c + ". Switch to " + (c === "dark" ? "light" : "dark");
    btn.setAttribute("aria-label", lbl);
    btn.title = lbl;
  }
  function make() {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "awd-tt";
    paint();
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.classList.add("awd-fade");
      root.setAttribute("data-ui", next);
      window.setTimeout(function () { root.classList.remove("awd-fade"); }, 220);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint();
    });
  }
  function host() {
    return (
      document.querySelector(".top__right") ||
      document.querySelector(".start__top nav") ||
      document.querySelector(".cx-nav") ||
      document.querySelector(".bs__top") ||
      document.querySelector(".lib__top") ||
      document.querySelector(".wb-top") ||
      document.querySelector(".top")
    );
  }
  function place() {
    var h = host();
    if (!h) return false;
    if (btn.parentNode === h) return true;
    h.appendChild(btn);
    return true;
  }
  function boot() {
    make();
    place();
    // The main app swaps between a start screen and the editor, re-rendering
    // its top bar; re-place the button whenever the DOM changes or it detaches.
    var mo = new MutationObserver(function () { if (!btn.isConnected) place(); else if (!host() || host() !== btn.parentNode) place(); });
    try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    window.setInterval(function () { if (!btn.isConnected) place(); }, 1000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
