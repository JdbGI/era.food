(() => {
  "use strict";

  const menu = document.querySelector(".mobile-real-menu");
  const trigger = document.getElementById("mobile-menu-trig");
  const close = document.getElementById("close");

  if (menu && trigger) {
    const setMenuState = (open) => {
      menu.setAttribute("aria-hidden", String(!open));
      menu.toggleAttribute("inert", !open);
      trigger.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("menu-open", open);
      if (open && close) close.focus();
      if (!open) trigger.focus();
    };

    menu.setAttribute("aria-hidden", String(!menu.classList.contains("is-open")));
    menu.toggleAttribute("inert", !menu.classList.contains("is-open"));
    trigger.setAttribute("aria-controls", "mobile-navigation");
    trigger.setAttribute("aria-expanded", "false");

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      window.requestAnimationFrame(() => setMenuState(true));
    });

    close?.addEventListener("click", (event) => {
      event.preventDefault();
      window.requestAnimationFrame(() => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        trigger.classList.remove("is-hidden");
        setMenuState(false);
      }

      if (event.key === "Tab" && menu.classList.contains("is-open")) {
        const focusable = [...menu.querySelectorAll("a[href]")].filter((link) => link.getClientRects().length);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    link.setAttribute("rel", [...rel].join(" "));
  });

  const socialLabels = [
    ["facebook.com", "era. on Facebook"],
    ["instagram.com", "era. on Instagram"],
    ["x.com", "era. on X"],
    ["linkedin.com", "era. on LinkedIn"],
    ["youtube.com", "era. on YouTube"],
  ];

  document.querySelectorAll("a[href]").forEach((link) => {
    if (link.getAttribute("aria-label") || link.textContent.trim()) return;
    const match = socialLabels.find(([host]) => link.href.includes(host));
    if (match) link.setAttribute("aria-label", match[1]);
  });
})();
