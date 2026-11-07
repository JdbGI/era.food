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
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const weekdayHours = { opens: 9 * 60 + 30, closes: 20 * 60 };
  const openingHours = {
    Mon: weekdayHours,
    Tue: weekdayHours,
    Wed: weekdayHours,
    Thu: weekdayHours,
    Fri: weekdayHours,
    Sat: weekdayHours,
    Sun: { opens: 9 * 60 + 30, closes: 18 * 60 },
  };

  const formatMinutes = (total) => {
    const hour = String(Math.floor(total / 60)).padStart(2, "0");
    const minute = String(total % 60).padStart(2, "0");
    return `${hour}:${minute}`;
  };

  const getMenuState = (date = new Date()) => {
    const parts = Object.fromEntries(
      gibraltarClock
        .formatToParts(date)
        .filter(({ type }) => type === "weekday" || type === "hour" || type === "minute")
        .map(({ type, value }) => [type, value]),
    );
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    const hours = openingHours[parts.weekday] || weekdayHours;

    if (minutes < hours.opens) {
      return { key: "opening-soon", message: `Online ordering opens at ${formatMinutes(hours.opens)}` };
    }
    if (minutes < 12 * 60) {
      return { key: "breakfast", message: "Our breakfast menu is open now" };
    }
    if (minutes < hours.closes) {
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

  const reviewsCarousel = document.querySelector("[data-reviews-carousel]");

  if (reviewsCarousel) {
    const track = reviewsCarousel.querySelector("[data-reviews-track]");
    const slides = [...reviewsCarousel.querySelectorAll(".review-card")];
    const previousButton = reviewsCarousel.querySelector("[data-review-prev]");
    const nextButton = reviewsCarousel.querySelector("[data-review-next]");
    const dotsContainer = reviewsCarousel.querySelector("[data-review-dots]");
    const toggleButton = reviewsCarousel.querySelector("[data-review-toggle]");
    const status = reviewsCarousel.querySelector("[data-review-status]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let currentSlide = 0;
    let rotationTimer;
    let isPaused = false;
    let isUserPaused = false;

    const dots = slides.map((slide, index) => {
      const dot = document.createElement("button");
      dot.className = "review-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Show review ${index + 1} of ${slides.length}`);
      dot.addEventListener("click", () => {
        showSlide(index, true);
      });
      dotsContainer?.append(dot);
      return dot;
    });

    const stopRotation = () => {
      window.clearInterval(rotationTimer);
      rotationTimer = undefined;
    };

    const startRotation = () => {
      stopRotation();
      if (reduceMotion.matches || isPaused || isUserPaused || slides.length < 2) return;
      rotationTimer = window.setInterval(() => {
        showSlide(currentSlide + 1, false);
      }, 7000);
    };

    function showSlide(index, announce = false) {
      currentSlide = (index + slides.length) % slides.length;
      if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;

      slides.forEach((slide, slideIndex) => {
        const isCurrent = slideIndex === currentSlide;
        slide.setAttribute("aria-hidden", String(!isCurrent));
        slide.toggleAttribute("inert", !isCurrent);
      });

      dots.forEach((dot, dotIndex) => {
        const isCurrent = dotIndex === currentSlide;
        dot.setAttribute("aria-current", String(isCurrent));
      });

      if (announce && status) {
        const reviewer = slides[currentSlide].querySelector(".review-meta strong")?.textContent || "customer";
        status.textContent = `Review ${currentSlide + 1} of ${slides.length}, from ${reviewer}.`;
      }
    }

    const pauseRotation = () => {
      isPaused = true;
      stopRotation();
    };

    const resumeRotation = () => {
      isPaused = false;
      startRotation();
    };

    previousButton?.addEventListener("click", () => {
      showSlide(currentSlide - 1, true);
      startRotation();
    });

    nextButton?.addEventListener("click", () => {
      showSlide(currentSlide + 1, true);
      startRotation();
    });

    toggleButton?.addEventListener("click", () => {
      isUserPaused = !isUserPaused;
      toggleButton.textContent = isUserPaused ? "play rotation" : "pause rotation";
      toggleButton.setAttribute(
        "aria-label",
        isUserPaused ? "Resume automatic review rotation" : "Pause automatic review rotation",
      );
      if (isUserPaused) stopRotation();
      else startRotation();
    });

    reviewsCarousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(currentSlide - 1, true);
        startRotation();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(currentSlide + 1, true);
        startRotation();
      }
    });

    reviewsCarousel.addEventListener("mouseenter", pauseRotation);
    reviewsCarousel.addEventListener("mouseleave", resumeRotation);
    reviewsCarousel.addEventListener("focusin", pauseRotation);
    reviewsCarousel.addEventListener("focusout", (event) => {
      if (!reviewsCarousel.contains(event.relatedTarget)) resumeRotation();
    });
    reduceMotion.addEventListener?.("change", startRotation);

    reviewsCarousel.classList.add("reviews-enhanced");
    showSlide(0, false);
    startRotation();
  }
})();
