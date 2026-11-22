/* ==========================================================================
   SIWIMS - Landing page behaviour
   ========================================================================== */
(function () {
  "use strict";

  /** Mobile navigation toggle. */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    function setOpen(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      menu.classList.toggle("is-open", isOpen);
      menu.hidden = !isOpen;
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) setOpen(false);
    });
  }

  /** Stamp the current year into the footer. */
  function initFooterYear() {
    var year = document.getElementById("footerYear");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /** Highlight the navigation link of the section currently in view. */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll(".nav-links a[href^='#']")
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = links
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            var isActive =
              link.getAttribute("href") === "#" + entry.target.id;
            link.style.color = isActive ? "var(--color-primary)" : "";
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /** Reveal elements marked [data-reveal] as they scroll into view. */
  function initScrollReveal() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal]")
    );
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (target) {
        target.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initFooterYear();
    initScrollSpy();
    initScrollReveal();
  });
})();
