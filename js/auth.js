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
      dashboard: "student/browse.html",
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
     Password hashing (PBKDF2-HMAC-SHA256)
     ----------------------------------------------------------------------
     Passwords are never written to storage in plain text. Each account
     stores a random salt plus a derived key; verifying a login re-derives
     the key from the submitted password and compares the two in constant
     time. The implementation is dependency-free (synchronous) so it works
     from file:// exactly like the rest of this prototype. Remember this is
     still client-side only: real security needs a server-side backend.
     ---------------------------------------------------------------------- */
  var HASH_ALGORITHM = "PBKDF2-HMAC-SHA256";
  var HASH_ITERATIONS = 12000;
  var HASH_KEY_LENGTH = 32; // derived key size in bytes
  var HASH_SALT_BYTES = 16;

  var SHA256_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  function rotateRight(value, bits) {
    return (value >>> bits) | (value << (32 - bits));
  }

  /** UTF-8 encode a string into bytes. */
  function utf8Bytes(text) {
    var value = String(text == null ? "" : text);
    if (global.TextEncoder) return new TextEncoder().encode(value);
    var encoded = unescape(encodeURIComponent(value));
    var bytes = new Uint8Array(encoded.length);
    for (var i = 0; i < encoded.length; i++) bytes[i] = encoded.charCodeAt(i);
    return bytes;
  }

  function concatBytes(a, b) {
    var merged = new Uint8Array(a.length + b.length);
    merged.set(a, 0);
    merged.set(b, a.length);
    return merged;
  }

  /** SHA-256 digest of a byte array (returns 32 bytes). */
  function sha256(bytes) {
    var length = bytes.length;
    var withPadding = length + 1;
    var totalLength = withPadding + 8;
    var remainder = totalLength % 64;
    if (remainder !== 0) totalLength += 64 - remainder;

    var message = new Uint8Array(totalLength);
    message.set(bytes);
    message[length] = 0x80;

    var bitLength = length * 8;
    var high = Math.floor(bitLength / 0x100000000);
    var low = bitLength >>> 0;
    message[totalLength - 8] = (high >>> 24) & 0xff;
    message[totalLength - 7] = (high >>> 16) & 0xff;
    message[totalLength - 6] = (high >>> 8) & 0xff;
    message[totalLength - 5] = high & 0xff;
    message[totalLength - 4] = (low >>> 24) & 0xff;
    message[totalLength - 3] = (low >>> 16) & 0xff;
    message[totalLength - 2] = (low >>> 8) & 0xff;
    message[totalLength - 1] = low & 0xff;

    var h = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];
    var schedule = new Array(64);

    for (var offset = 0; offset < totalLength; offset += 64) {
      for (var i = 0; i < 16; i++) {
        var index = offset + i * 4;
        schedule[i] =
          ((message[index] << 24) |
            (message[index + 1] << 16) |
            (message[index + 2] << 8) |
            message[index + 3]) >>>
          0;
      }
      for (i = 16; i < 64; i++) {
        var w15 = schedule[i - 15];
        var w2 = schedule[i - 2];
        var s0 = rotateRight(w15, 7) ^ rotateRight(w15, 18) ^ (w15 >>> 3);
        var s1 = rotateRight(w2, 17) ^ rotateRight(w2, 19) ^ (w2 >>> 10);
        schedule[i] = (schedule[i - 16] + s0 + schedule[i - 7] + s1) >>> 0;
      }

      var a = h[0], b = h[1], c = h[2], d = h[3];
      var e = h[4], f = h[5], g = h[6], hh = h[7];

      for (i = 0; i < 64; i++) {
        var sigma1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        var choose = (e & f) ^ (~e & g);
        var temp1 = (hh + sigma1 + choose + SHA256_K[i] + schedule[i]) >>> 0;
        var sigma0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        var majority = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (sigma0 + majority) >>> 0;

        hh = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      h[0] = (h[0] + a) >>> 0;
      h[1] = (h[1] + b) >>> 0;
      h[2] = (h[2] + c) >>> 0;
      h[3] = (h[3] + d) >>> 0;
      h[4] = (h[4] + e) >>> 0;
      h[5] = (h[5] + f) >>> 0;
      h[6] = (h[6] + g) >>> 0;
      h[7] = (h[7] + hh) >>> 0;
    }

    var digest = new Uint8Array(32);
    for (i = 0; i < 8; i++) {
      digest[i * 4] = (h[i] >>> 24) & 0xff;
      digest[i * 4 + 1] = (h[i] >>> 16) & 0xff;
      digest[i * 4 + 2] = (h[i] >>> 8) & 0xff;
      digest[i * 4 + 3] = h[i] & 0xff;
    }
    return digest;
  }

  /** HMAC-SHA256 over a byte array with a byte-array key. */
  function hmacSha256(key, message) {
    var blockSize = 64;
    var effectiveKey = key.length > blockSize ? sha256(key) : key;
    var padded = new Uint8Array(blockSize);
    padded.set(effectiveKey);

    var innerPad = new Uint8Array(blockSize);
    var outerPad = new Uint8Array(blockSize);
    for (var i = 0; i < blockSize; i++) {
      innerPad[i] = padded[i] ^ 0x36;
      outerPad[i] = padded[i] ^ 0x5c;
    }
    return sha256(concatBytes(outerPad, sha256(concatBytes(innerPad, message))));
  }

  /** PBKDF2 key derivation (single-block output is enough for our key size). */
  function pbkdf2(password, salt, iterations, keyLength) {
    var passwordBytes = utf8Bytes(password);
    var blocks = Math.ceil(keyLength / 32);
    var derived = new Uint8Array(blocks * 32);

    for (var block = 1; block <= blocks; block++) {
      var blockIndex = new Uint8Array(4);
      blockIndex[0] = (block >>> 24) & 0xff;
      blockIndex[1] = (block >>> 16) & 0xff;
      blockIndex[2] = (block >>> 8) & 0xff;
      blockIndex[3] = block & 0xff;

      var u = hmacSha256(passwordBytes, concatBytes(salt, blockIndex));
      var accumulator = u.slice(0);

      for (var round = 1; round < iterations; round++) {
        u = hmacSha256(passwordBytes, u);
        for (var j = 0; j < accumulator.length; j++) accumulator[j] ^= u[j];
      }
      derived.set(accumulator, (block - 1) * 32);
    }
    return derived.slice(0, keyLength);
  }

  function bytesToHex(bytes) {
    var hex = "";
    for (var i = 0; i < bytes.length; i++) {
      hex += (bytes[i] >>> 4).toString(16) + (bytes[i] & 0x0f).toString(16);
    }
    return hex;
  }

  function hexToBytes(hex) {
    var value = String(hex || "");
    var length = Math.floor(value.length / 2);
    var bytes = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      bytes[i] = parseInt(value.substr(i * 2, 2), 16) || 0;
    }
    return bytes;
  }

  /** Random salt as a hex string (falls back to Math.random if needed). */
  function randomHex(byteCount) {
    var bytes = new Uint8Array(byteCount);
    var crypto = global.crypto || global.msCrypto;
    if (crypto && typeof crypto.getRandomValues === "function") {
      crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < byteCount; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return bytesToHex(bytes);
  }

  /** Build the stored credential record for a new/re-keyed password. */
  function createCredential(password) {
    var salt = randomHex(HASH_SALT_BYTES);
    return {
      algorithm: HASH_ALGORITHM,
      iterations: HASH_ITERATIONS,
      salt: salt,
      hash: bytesToHex(
        pbkdf2(password, hexToBytes(salt), HASH_ITERATIONS, HASH_KEY_LENGTH)
      ),
    };
  }

  /** Compare two equal-length strings without leaking timing information. */
  function constantTimeEqual(a, b) {
    var left = String(a || "");
    var right = String(b || "");
    if (left.length !== right.length) return false;
    var mismatch = 0;
    for (var i = 0; i < left.length; i++) {
      mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
    }
    return mismatch === 0;
  }

  /** Verify a submitted password against a stored credential record. */
  function verifyCredential(password, credential) {
    if (!credential || !credential.salt || !credential.hash) return false;
    var computed = bytesToHex(
      pbkdf2(
        String(password == null ? "" : password),
        hexToBytes(credential.salt),
        Number(credential.iterations) || HASH_ITERATIONS,
        HASH_KEY_LENGTH
      )
    );
    return constantTimeEqual(computed, credential.hash);
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
      // Only a salted, derived hash is stored - never the plain password.
      credentials: createCredential(password),
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
   * The submitted password is hashed with the account's stored salt and the
   * resulting key is compared - the plain password is never stored or read.
   * @returns {{ok:boolean, code?:string, message?:string, user?:object}}
   */
  function authenticate(identifier, password) {
    var user = findUser(identifier);
    if (!user) {
      return {
        ok: false,
        code: "credentials",
        message: "Incorrect email/username or password. Please try again.",
      };
    }

    var submitted = String(password == null ? "" : password);
    var isMatch = verifyCredential(submitted, user.credentials);

    // Accounts created before hashing was introduced still hold a plain
    // password. Accept that single login, then upgrade the record in place.
    if (
      !isMatch &&
      typeof user.password === "string" &&
      constantTimeEqual(user.password, submitted)
    ) {
      upgradeLegacyPassword(user, submitted);
      isMatch = true;
    }

    if (!isMatch) {
      return {
        ok: false,
        code: "credentials",
        message: "Incorrect email/username or password. Please try again.",
      };
    }
    return { ok: true, user: user };
  }

  /** Replace a legacy plain-text password with a salted hash on disk. */
  function upgradeLegacyPassword(user, password) {
    var users = readUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === user.id) {
        users[i].credentials = createCredential(password);
        delete users[i].password;
        user.credentials = users[i].credentials;
        delete user.password;
        writeUsers(users);
        return;
      }
    }
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

  /* ----------------------------------------------------------------------
     "Back" control
     ----------------------------------------------------------------------
     Sends the visitor to the page they actually came from instead of the
     homepage. When there is no browsing history (e.g. the page was opened
     directly), the element's own href is used as a sensible fallback.
     ---------------------------------------------------------------------- */
  function bindBackControls() {
    var controls = document.querySelectorAll("[data-back]");
    Array.prototype.forEach.call(controls, function (control) {
      control.addEventListener("click", function (event) {
        if (global.history && global.history.length > 1) {
          event.preventDefault();
          global.history.back();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindBackControls);
  } else {
    bindBackControls();
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
