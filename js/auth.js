/* ==========================================================================
   SIWIMS - Authentication module (centralised)
   --------------------------------------------------------------------------
   Front-end prototype authentication. Accounts created through the
   registration form are persisted in the browser (localStorage); no data
   ever leaves the device and nothing here is production secure. Every piece
   of storage access is isolated in this file so a real backend/database can
   replace these functions later without touching any page.
   ========================================================================== */
(function (global) {
  "use strict";

  var SESSION_KEY = "siwims_session";
  var USERS_KEY = "siwims_users";
  var STORAGE_PERSISTENT = "localStorage"; // registered accounts + "remember me"
  var STORAGE_TEMPORARY = "sessionStorage"; // session-only logins

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,24}$/;

  /* ----------------------------------------------------------------------
     Role configuration
     ---------------------------------------------------------------------- */
  var ROLES = {
    student: {
      key: "student",
      label: "Student",
      blurb: "BS Information Technology \u00b7 4th Year",
      meta: "Student Account",
      dashboard: "student/dashboard.html",
    },
    coordinator: {
      key: "coordinator",
      label: "School / Internship Coordinator",
      blurb: "Internship Coordinator",
      meta: "Internship Coordinator",
      dashboard: "coordinator/dashboard.html",
    },
    company: {
      key: "company",
      label: "Company",
      blurb: "Human Resources \u00b7 Partner Company",
      meta: "Partner Company",
      dashboard: "company/dashboard.html",
    },
    supervisor: {
      key: "supervisor",
      label: "Supervisor",
      blurb: "Company Site Supervisor",
      meta: "Company Supervisor",
      dashboard: "supervisor/dashboard.html",
    },
  };

  /* ----------------------------------------------------------------------
     Path helpers - pages live at the root or one level inside a role folder.
     ---------------------------------------------------------------------- */
  function isInsideRoleFolder() {
    return /\/(student|coordinator|company|supervisor)\//i.test(
      global.location.pathname
    );
  }

  /** Resolve a project-root-relative path from the current page depth. */
  function rootPath(path) {
    return (isInsideRoleFolder() ? "../" : "") + path;
  }

  /* ----------------------------------------------------------------------
     Storage helpers
     ---------------------------------------------------------------------- */
  function safeStorage(name) {
    try {
      var store = global[name];
      var probe = "__siwims_probe__";
      store.setItem(probe, "1");
      store.removeItem(probe);
      return store;
    } catch (error) {
      return null;
    }
  }

  /* ----------------------------------------------------------------------
     Account registry (registered users)
     ---------------------------------------------------------------------- */
  function readUsers() {
    var store = safeStorage(STORAGE_PERSISTENT);
    if (!store) return [];
    try {
      var raw = store.getItem(USERS_KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Object.prototype.toString.call(list) === "[object Array]" ? list : [];
    } catch (error) {
      return [];
    }
  }

  function writeUsers(list) {
    var store = safeStorage(STORAGE_PERSISTENT);
    if (!store) return false;
    try {
      store.setItem(USERS_KEY, JSON.stringify(list));
      return true;
    } catch (error) {
      return false;
    }
  }

  function normalise(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  /** Find a registered account by username or email (case-insensitive). */
  function findUser(identifier) {
    var value = normalise(identifier);
    if (!value) return null;
    var users = readUsers();
    for (var i = 0; i < users.length; i++) {
      if (
        normalise(users[i].username) === value ||
        normalise(users[i].email) === value
      ) {
        return users[i];
      }
    }
    return null;
  }

  function emailExists(email) {
    return Boolean(findUser(email));
  }

  function usernameExists(username) {
    return Boolean(findUser(username));
  }

  function nextUserId(role, total) {
    var prefix = { student: "01", coordinator: "02", company: "03", supervisor: "04" };
    var seq = String(total + 1);
    while (seq.length < 4) seq = "0" + seq;
    return "U-" + new Date().getFullYear() + "-" + (prefix[role] || "00") + seq;
  }

  /* ----------------------------------------------------------------------
     Registration
     ---------------------------------------------------------------------- */
  /**
   * Validate and persist a new account.
   * @returns {{ok:boolean, code?:string, message?:string, errors?:object, user?:object}}
   */
  function registerUser(payload) {
    var data = payload || {};
    var name = String(data.name || "").trim();
    var username = String(data.username || "").trim();
    var email = String(data.email || "").trim();
    var password = String(data.password || "");
    var role = String(data.role || "");
    var affiliation = String(data.affiliation || "").trim();

    var errors = {};

    if (!name) errors.name = "Full name is required.";
    else if (name.length < 3) errors.name = "Please enter your full name.";

    if (!username) errors.username = "Username is required.";
    else if (!USERNAME_PATTERN.test(username))
      errors.username = "3-24 characters: letters, numbers, dot, dash or underscore.";
    else if (usernameExists(username)) errors.username = "That username is already taken.";

    if (!email) errors.email = "Email address is required.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
    else if (emailExists(email)) errors.email = "An account with this email already exists.";

    if (!ROLES[role]) errors.role = "Select the role that describes you.";

    if (!password) errors.password = "Password is required.";
    else if (password.length < 8) errors.password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
      errors.password = "Include at least one letter and one number.";

    if (Object.keys(errors).length) {
      return {
        ok: false,
        code: "validation",
        message: "Please correct the highlighted fields and try again.",
        errors: errors,
      };
    }

    var users = readUsers();
    var user = {
      id: nextUserId(role, users.length),
      name: name,
      username: username,
      email: email,
      password: password,
      role: role,
      meta: affiliation || (ROLES[role] ? ROLES[role].meta : "SIWIMS Account"),
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    if (!writeUsers(users)) {
      return {
        ok: false,
        code: "storage",
        message:
          "We could not save your account because browser storage is unavailable or full. Enable storage and try again.",
      };
    }

    return { ok: true, user: user };
  }

  /* ----------------------------------------------------------------------
     Authentication
     ---------------------------------------------------------------------- */
  /**
   * Validate credentials against registered accounts.
   * @returns {{ok:boolean, code?:string, message?:string, user?:object}}
   */
  function authenticate(identifier, password) {
    var user = findUser(identifier);
    if (!user || user.password !== String(password || "")) {
      return {
        ok: false,
        code: "credentials",
        message: "Incorrect email/username or password. Please try again.",
      };
    }
    return { ok: true, user: user };
  }

  /** Persist an authenticated session, honouring "Remember me". */
  function createSession(user, remember) {
    var session = {
      id: user.id,
      name: user.name,
      meta: user.meta,
      username: user.username,
      email: user.email,
      role: user.role,
      roleLabel: ROLES[user.role] ? ROLES[user.role].label : "Member",
      loginAt: new Date().toISOString(),
      remember: Boolean(remember),
    };

    var target = remember
      ? safeStorage(STORAGE_PERSISTENT)
      : safeStorage(STORAGE_TEMPORARY);
    var other = remember
      ? safeStorage(STORAGE_TEMPORARY)
      : safeStorage(STORAGE_PERSISTENT);

    if (other) other.removeItem(SESSION_KEY);
    if (target) target.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function readSession() {
    var persistent = safeStorage(STORAGE_PERSISTENT);
    var temporary = safeStorage(STORAGE_TEMPORARY);
    var raw =
      (persistent && persistent.getItem(SESSION_KEY)) ||
      (temporary && temporary.getItem(SESSION_KEY)) ||
      null;

    if (!raw) return null;

    try {
      var session = JSON.parse(raw);
      if (!session || !session.role || !ROLES[session.role]) return null;
      return session;
    } catch (error) {
      return null;
    }
  }

  function getSession() {
    return readSession();
  }

  function isAuthenticated() {
    return readSession() !== null;
  }

  function getCurrentRole() {
    var session = readSession();
    return session ? session.role : null;
  }

  function clearSession() {
    var persistent = safeStorage(STORAGE_PERSISTENT);
    var temporary = safeStorage(STORAGE_TEMPORARY);
    if (persistent) persistent.removeItem(SESSION_KEY);
    if (temporary) temporary.removeItem(SESSION_KEY);
  }

  function logout(redirect) {
    clearSession();
    if (redirect !== false) {
      global.location.replace(rootPath("login.html"));
    }
  }

  /** Get the dashboard path for a role (relative to the current page). */
  function getDashboardPath(role) {
    var config = ROLES[role];
    if (!config) return rootPath("login.html");
    return rootPath(config.dashboard);
  }

  function getRoleLabel(role) {
    return ROLES[role] ? ROLES[role].label : "Unknown";
  }

  /** Ordered list of selectable roles (for the registration form). */
  function getRoles() {
    return ["student", "coordinator", "company", "supervisor"].map(function (key) {
      return { key: key, label: ROLES[key].label, blurb: ROLES[key].blurb };
    });
  }

  global.SIWIMS = global.SIWIMS || {};
  global.SIWIMS.auth = {
    ROLES: ROLES,
    findUser: findUser,
    emailExists: emailExists,
    usernameExists: usernameExists,
    registerUser: registerUser,
    authenticate: authenticate,
    createSession: createSession,
    getSession: getSession,
    isAuthenticated: isAuthenticated,
    getCurrentRole: getCurrentRole,
    clearSession: clearSession,
    logout: logout,
    getDashboardPath: getDashboardPath,
    getRoleLabel: getRoleLabel,
    getRoles: getRoles,
    rootPath: rootPath,
  };
})(window);
