/* ==========================================================================
   SIWIMS - Shared dashboard behaviour
   --------------------------------------------------------------------------
   Handles access guarding, user identity rendering, sidebar navigation,
   notifications, and small UI enhancements shared by all four dashboards.
   ========================================================================== */
(function (global) {
  "use strict";

  var SIWIMS = global.SIWIMS;
  var auth = SIWIMS.auth;
  var access = SIWIMS.access;

  /* ----------------------------------------------------------------------
     Identity
     ---------------------------------------------------------------------- */
  function initials(name) {
    return String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0);
      })
      .join("")
      .toUpperCase();
  }

  function renderIdentity(session) {
    var map = {
      "[data-user-name]": session.name,
      "[data-user-role]": session.roleLabel || auth.getRoleLabel(session.role),
      "[data-user-email]": session.email,
      "[data-user-id]": session.id,
      "[data-user-initials]": initials(session.name),
    };

    Object.keys(map).forEach(function (selector) {
      Array.prototype.forEach.call(
        document.querySelectorAll(selector),
        function (node) {
          node.textContent = map[selector];
        }
      );
    });
  }

  /* ----------------------------------------------------------------------
     Sidebar navigation (in-page section switching)
     ---------------------------------------------------------------------- */
  function initSidebarNav() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll("[data-nav]")
    );
    var sections = Array.prototype.slice.call(
      document.querySelectorAll("[data-section]")
    );
    if (!links.length || !sections.length) return;

    var sidebar = document.getElementById("dashSidebar");
    var pageTitle = document.querySelector("[data-page-title]");

    function activate(sectionId, options) {
      var found = false;

      sections.forEach(function (section) {
        var isActive = section.getAttribute("data-section") === sectionId;
        section.hidden = !isActive;
        if (isActive) found = true;
      });
      if (!found) return false;

      links.forEach(function (link) {
        var isActive = link.getAttribute("data-nav") === sectionId;
        link.classList.toggle("is-active", isActive);
        link.setAttribute("aria-current", isActive ? "page" : "false");
        if (isActive && pageTitle) pageTitle.textContent = link.getAttribute("data-title") || link.textContent.trim();
      });

      if (sidebar) sidebar.classList.remove("is-open");
      if (!options || options.scroll !== false) {
        global.scrollTo({ top: 0, behavior: "smooth" });
      }
      return true;
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var id = link.getAttribute("data-nav");
        if (activate(id)) {
          history.replaceState(null, "", "#" + id);
        }
      });
    });

    var initial = (global.location.hash || "").replace("#", "");
    if (!initial || !activate(initial, { scroll: false })) {
      activate(links[0].getAttribute("data-nav"), { scroll: false });
    }
  }

  /* ----------------------------------------------------------------------
     Mobile sidebar
     ---------------------------------------------------------------------- */
  function initSidebarToggle() {
    var toggle = document.getElementById("sidebarToggle");
    var sidebar = document.getElementById("dashSidebar");
    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("is-open");
    });

    document.addEventListener("click", function (event) {
      if (!sidebar.classList.contains("is-open")) return;
      if (sidebar.contains(event.target) || toggle.contains(event.target)) return;
      sidebar.classList.remove("is-open");
    });
  }

  /* ----------------------------------------------------------------------
     Notifications dropdown
     ---------------------------------------------------------------------- */
  function initNotifications() {
    var button = document.getElementById("notifToggle");
    var panel = document.getElementById("notifPanel");
    if (!button || !panel) return;

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = !panel.hidden;
      panel.hidden = isOpen;
      button.setAttribute("aria-expanded", String(!isOpen));
    });

    document.addEventListener("click", function (event) {
      if (panel.hidden) return;
      if (panel.contains(event.target) || button.contains(event.target)) return;
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
    });

    var count = document.querySelector("[data-notif-count]");
    if (count) {
      var unread = panel.querySelectorAll("[data-notif-unread]").length;
      count.textContent = unread ? String(unread) : "";
      count.hidden = unread === 0;
    }
  }

  /* ----------------------------------------------------------------------
     Progress bars + dismissible demo alerts
     ---------------------------------------------------------------------- */
  function initProgressBars() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-progress]"),
      function (bar) {
        var value = Math.max(0, Math.min(100, Number(bar.getAttribute("data-progress")) || 0));
        var fill = bar.querySelector("[data-progress-fill]");
        if (fill) fill.style.width = value + "%";
        bar.setAttribute("role", "progressbar");
        bar.setAttribute("aria-valuenow", String(value));
        bar.setAttribute("aria-valuemin", "0");
        bar.setAttribute("aria-valuemax", "100");
      }
    );
  }

  /** Animate SVG progress rings declared with [data-ring]. */
  function initRings() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-ring]"),
      function (ring) {
        var value = Math.max(0, Math.min(100, Number(ring.getAttribute("data-ring")) || 0));
        var fill = ring.querySelector(".ring-fill");
        ring.setAttribute("role", "img");
        ring.setAttribute("aria-label", value + "% complete");
        if (!fill) return;
        // Start empty, then animate to the target on the next frame.
        fill.style.strokeDashoffset = "100";
        global.requestAnimationFrame(function () {
          global.requestAnimationFrame(function () {
            fill.style.strokeDashoffset = String(100 - value);
          });
        });
      }
    );
  }

  function initDismissibles() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-dismiss]"),
      function (button) {
        button.addEventListener("click", function () {
          var target = button.closest("[data-dismissible]");
          if (target) target.hidden = true;
        });
      }
    );
  }

  /** Placeholder feedback for prototype actions that have no backend yet. */
  function initPrototypeActions() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-demo-action]"),
      function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          var toast = document.getElementById("dashToast");
          if (!toast) return;
          toast.textContent =
            button.getAttribute("data-demo-action") +
            " is not yet available in this prototype.";
          toast.hidden = false;
          global.clearTimeout(initPrototypeActions._timer);
          initPrototypeActions._timer = global.setTimeout(function () {
            toast.hidden = true;
          }, 2600);
        });
      }
    );
  }

  /* ----------------------------------------------------------------------
     Bootstrap
     ---------------------------------------------------------------------- */
  function init() {
    var role = access.getPageRole();
    var session = access.requireAuth(role);
    if (!session) return; // redirecting

    renderIdentity(session);
    access.bindLogoutControls();
    access.guardPageCache();

    initSidebarNav();
    initSidebarToggle();
    initNotifications();
    initProgressBars();
    initRings();
    initDismissibles();
    initPrototypeActions();

    document.body.classList.add("is-ready");
  }

  document.addEventListener("DOMContentLoaded", init);
})(window);
