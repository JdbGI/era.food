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

  const orderUrl = "https://app.ordering.sumup.com/era/icc/order-type";
  const orderLinks = [...document.querySelectorAll("a[href]")].filter((link) => link.href === orderUrl);
  const featuredOrderLinks = orderLinks.filter((link) =>
    link.matches(".nav-link-button:not(.loyalty), .menu-item-mobil.order"),
  );

  orderLinks.forEach((link) => link.classList.add("order-cta"));

  featuredOrderLinks.forEach((link) => {
    link.classList.add("order-cta--feature");

    const label = document.createElement("span");
    label.className = "order-cta__label";
    label.textContent = "order now";

    const status = document.createElement("span");
    status.className = "order-cta__status";
    status.setAttribute("aria-hidden", "true");

    link.replaceChildren(label, status);
  });

  const gibraltarClock = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Gibraltar",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const getMenuState = (date = new Date()) => {
    const parts = Object.fromEntries(
      gibraltarClock
        .formatToParts(date)
        .filter(({ type }) => type === "hour" || type === "minute")
        .map(({ type, value }) => [type, Number(value)]),
    );
    const minutes = parts.hour * 60 + parts.minute;

    if (minutes < 8 * 60 + 30) {
      return { key: "opening-soon", message: "Online ordering opens at 08:30" };
    }
    if (minutes < 12 * 60) {
      return { key: "breakfast", message: "Our breakfast menu is open now" };
    }
    if (minutes < 21 * 60 + 30) {
      return { key: "all-day", message: "Our all-day menu is open now" };
    }
    return { key: "closed", message: "Online ordering is closed for today" };
  };

  const updateOrderState = () => {
    const state = getMenuState();
    document.documentElement.dataset.orderState = state.key;

    featuredOrderLinks.forEach((link) => {
      const status = link.querySelector(".order-cta__status");
      if (status) status.textContent = state.message;
      link.setAttribute("aria-label", `${state.message}. Order now.`);
      link.dataset.menuState = state.key;
    });
  };

  updateOrderState();
  const millisecondsToNextMinute = 60_000 - (Date.now() % 60_000) + 50;
  window.setTimeout(() => {
    updateOrderState();
    window.setInterval(updateOrderState, 60_000);
  }, millisecondsToNextMinute);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateOrderState();
  });
})();
