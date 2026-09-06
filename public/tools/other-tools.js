(function () {
  var TOOLS = [
    { slug: "chromary", name: "Chromary", tagline: "Color name finder" },
    { slug: "colorhyme", name: "Colorhyme", tagline: "Color harmony generator" },
    { slug: "webpalette", name: "WebPalette", tagline: "Website color palette generator" },
    { slug: "truegradient", name: "TrueGradient", tagline: "OKLCH gradient generator" },
    { slug: "mockupalettes", name: "Mockupalettes", tagline: "Website color palette visualizer" },
  ];

  var script = document.currentScript;
  var fromAttr = script && script.getAttribute("data-current");

  function currentSlug() {
    if (fromAttr) return fromAttr;
    var path = (location.pathname || "").replace(/\/+$/, "");
    var parts = path.split("/");
    var i = parts.indexOf("tools");
    return i >= 0 && parts[i + 1] ? parts[i + 1] : "";
  }

  function ensureStyles() {
    if (document.querySelector('link[href="/tools/other-tools.css"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/tools/other-tools.css";
    document.head.appendChild(link);
  }

  function render() {
    if (document.querySelector(".aw-other-tools")) return;
    var current = currentSlug();
    var others = TOOLS.filter(function (tool) {
      return tool.slug !== current;
    });
    if (!others.length) return;

    ensureStyles();
    document.documentElement.classList.add("aw-has-other-tools");

    var aside = document.createElement("aside");
    aside.className = "aw-other-tools";
    aside.setAttribute("aria-label", "Use our Other Tools");

    var heading = document.createElement("h2");
    heading.textContent = "Use our Other Tools";
    aside.appendChild(heading);

    others.forEach(function (tool) {
      var a = document.createElement("a");
      a.href = "/tools/" + tool.slug;
      var name = document.createElement("strong");
      name.textContent = tool.name;
      var tag = document.createElement("span");
      tag.textContent = tool.tagline;
      a.appendChild(name);
      a.appendChild(tag);
      aside.appendChild(a);
    });

    document.body.appendChild(aside);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
