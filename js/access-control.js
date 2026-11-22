/* ==========================================================================
   SIWIMS - Role-based access control (frontend prototype)
   --------------------------------------------------------------------------
   These guards are a client-side convenience only. Real security must be
   enforced by a backend once one exists.
   ========================================================================== */
(function (global) {
  "use strict";

  var auth = global.SIWIMS.auth;

  /** Current page's expected role, read from <body data-role="...">. */
  function getPageRole() {
    return document.body ? document.body.getAttribute("data-role") : null;
  }

  function redirectToLogin() {
    global.location.replace(auth.rootPath("login.html"));
  }

  function redirectToDashboard(role) {
    global.location.replace(auth.getDashboardPath(role));
  }

  /**
   * Guard the current page.
   * - No session            -> login page
   * - Session role mismatch -> that role's own dashboard
   * @param {string} [requiredRole] Defaults to <body data-role>.
   * @returns {object|null} The active session when access is granted.
   */
  function requireAuth(requiredRole) {
    var expected = requiredRole || getPageRole();
    var session = auth.getSession();

    if (!session) {
      redirectToLogin();
      return null;
    }

    if (expected && session.role !== expected) {
      redirectToDashboard(session.role);
      return null;
    }

    return session;
  }

  /** True when the active session belongs to the given role. */
  function hasRole(role) {
    var session = auth.getSession();
    return Boolean(session && session.role === role);
  }

  /** Sign the user out and return to the login page. */
  function logout() {
    auth.logout();
  }

  /**
   * Wire every element marked `data-action="logout"`.
   * Call after requireAuth() has granted access.
   */
  function bindLogoutControls() {
    var controls = document.querySelectorAll('[data-action="logout"]');
    Array.prototype.forEach.call(controls, function (control) {
      control.addEventListener("click", function (event) {
        event.preventDefault();
        logout();
      });
    });
  }

  /**
   * Re-check access when a page is restored from the browser's back/forward
   * cache, so logging out then navigating back cannot reveal a dashboard.
   */
  function guardPageCache() {
    global.addEventListener("pageshow", function (event) {
      if (event.persisted) {
        requireAuth(getPageRole());
      }
    });
  }

  global.SIWIMS = global.SIWIMS || {};
  global.SIWIMS.access = {
    requireAuth: requireAuth,
    hasRole: hasRole,
    logout: logout,
    getPageRole: getPageRole,
    bindLogoutControls: bindLogoutControls,
    guardPageCache: guardPageCache,
  };
})(window);
