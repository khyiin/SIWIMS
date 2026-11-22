/* ==========================================================================
   SIWIMS - Registration page controller
   --------------------------------------------------------------------------
   Client-side validation, live uniqueness checks against the local account
   registry, password strength feedback, and account creation.
   ========================================================================== */
(function () {
  "use strict";

  var auth = window.SIWIMS.auth;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,24}$/;

  var AFFILIATION = {
    student: { label: "School / University", placeholder: "e.g. Polytechnic University of the Philippines" },
    coordinator: { label: "School / Internship Office", placeholder: "e.g. Office of Internship Programs" },
    company: { label: "Company Name", placeholder: "e.g. Brightwave Solutions Inc." },
    supervisor: { label: "Company & Position", placeholder: "e.g. Brightwave Solutions Inc. \u2014 IT Supervisor" },
  };

  var form;
  var alertBox;
  var alertText;
  var submitButton;

  var fields = {};

  /* ----------------------------------------------------------------------
     Field error helpers
     ---------------------------------------------------------------------- */
  function setFieldError(input, errorId, message) {
    if (input) {
      input.classList.toggle("is-invalid", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }
    var errorElement = document.getElementById(errorId);
    if (errorElement) errorElement.textContent = message || "";
  }

  function clearAllFieldErrors() {
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (field.input) field.input.classList.remove("is-invalid");
      if (field.error) field.error.textContent = "";
    });
  }

  /* ----------------------------------------------------------------------
     Feedback banner
     ---------------------------------------------------------------------- */
  function showAlert(type, message) {
    alertBox.className = "alert alert--" + type;
    alertText.textContent = message;
    alertBox.hidden = false;
  }

  function hideAlert() {
    alertBox.hidden = true;
    alertText.textContent = "";
  }

  /* ----------------------------------------------------------------------
     Individual validators
     ---------------------------------------------------------------------- */
  function validateName() {
    var value = fields.fullName.input.value.trim();
    var message = "";
    if (!value) message = "Full name is required.";
    else if (value.length < 3) message = "Please enter your full name.";
    setFieldError(fields.fullName.input, "fullNameError", message);
    return !message;
  }

  function validateUsername() {
    var value = fields.username.input.value.trim();
    var message = "";
    if (!value) message = "Username is required.";
    else if (!USERNAME_PATTERN.test(value))
      message = "3-24 characters: letters, numbers, dot, dash or underscore.";
    else if (auth.usernameExists(value)) message = "That username is already taken.";
    setFieldError(fields.username.input, "usernameError", message);
    return !message;
  }

  function validateEmail() {
    var value = fields.email.input.value.trim();
    var message = "";
    if (!value) message = "Email address is required.";
    else if (!EMAIL_PATTERN.test(value)) message = "Enter a valid email address.";
    else if (auth.emailExists(value))
      message = "An account with this email already exists.";
    setFieldError(fields.email.input, "emailError", message);
    return !message;
  }

  function getSelectedRole() {
    var checked = form.querySelector('input[name="role"]:checked');
    return checked ? checked.value : "";
  }

  function validateRole() {
    var message = getSelectedRole() ? "" : "Select the role that describes you.";
    fields.role.error.textContent = message;
    return !message;
  }

  function validatePassword() {
    var value = fields.password.input.value;
    var message = "";
    if (!value) message = "Password is required.";
    else if (value.length < 8) message = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value))
      message = "Include at least one letter and one number.";
    setFieldError(fields.password.input, "passwordError", message);
    return !message;
  }

  function validateConfirmPassword() {
    var value = fields.confirmPassword.input.value;
    var message = "";
    if (!value) message = "Please confirm your password.";
    else if (value !== fields.password.input.value)
      message = "Passwords do not match.";
    setFieldError(fields.confirmPassword.input, "confirmPasswordError", message);
    return !message;
  }

  function validateTerms() {
    var message = fields.terms.input.checked
      ? ""
      : "Please accept the Terms of Use and Privacy Policy.";
    fields.terms.error.textContent = message;
    return !message;
  }

  /* ----------------------------------------------------------------------
     Password strength meter
     ---------------------------------------------------------------------- */
  function scorePassword(value) {
    if (!value) return 0;
    var score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return Math.min(score, 4);
  }

  function renderStrength() {
    var value = fields.password.input.value;
    var score = scorePassword(value);
    var labels = ["", "Weak", "Fair", "Good", "Strong"];
    var tones = ["", "danger", "warning", "info", "success"];

    var meter = document.getElementById("pwMeter");
    var bar = document.getElementById("pwMeterBar");
    var text = document.getElementById("pwStrengthText");

    meter.setAttribute("data-strength", value ? tones[score] : "");
    bar.style.width = (score / 4) * 100 + "%";

    if (!value) {
      text.textContent = "Use 8+ characters with a letter and a number.";
      text.className = "form-hint";
    } else {
      text.textContent = labels[score] + " password";
      text.className = "form-hint form-hint--" + tones[score];
    }
  }

  /* ----------------------------------------------------------------------
     Password visibility toggles
     ---------------------------------------------------------------------- */
  function initPasswordToggles() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-toggle-password]"),
      function (toggle) {
        var input = document.getElementById(toggle.getAttribute("data-toggle-password"));
        if (!input) return;
        var eye = toggle.querySelector(".icon-eye");
        var eyeOff = toggle.querySelector(".icon-eye-off");

        toggle.addEventListener("click", function () {
          var show = input.type === "password";
          input.type = show ? "text" : "password";
          toggle.setAttribute("aria-pressed", String(show));
          toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
          eye.hidden = show;
          eyeOff.hidden = !show;
          input.focus();
        });
      }
    );
  }

  /* ----------------------------------------------------------------------
     Role picker
     ---------------------------------------------------------------------- */
  function initRolePicker() {
    var options = document.querySelectorAll('input[name="role"]');

    function sync() {
      Array.prototype.forEach.call(options, function (radio) {
        radio.closest(".role-option").classList.toggle("is-selected", radio.checked);
      });

      var role = getSelectedRole();
      var config = AFFILIATION[role];
      var label = document.getElementById("affiliationLabel");
      var input = fields.affiliation.input;
      if (config) {
        label.textContent = config.label;
        input.placeholder = config.placeholder;
      } else {
        label.textContent = "Institution / Organization";
        input.placeholder = "Optional";
      }
    }

    Array.prototype.forEach.call(options, function (radio) {
      radio.addEventListener("change", function () {
        sync();
        fields.role.error.textContent = "";
      });
    });

    sync();
  }

  /* ----------------------------------------------------------------------
     Submission
     ---------------------------------------------------------------------- */
  function handleSubmit(event) {
    event.preventDefault();
    hideAlert();

    var checks = [
      { ok: validateRole(), input: null, focus: "role" },
      { ok: validateName(), input: fields.fullName.input },
      { ok: validateUsername(), input: fields.username.input },
      { ok: validateEmail(), input: fields.email.input },
      { ok: validatePassword(), input: fields.password.input },
      { ok: validateConfirmPassword(), input: fields.confirmPassword.input },
      { ok: validateTerms(), input: null, focus: "terms" },
    ];

    var firstInvalid = null;
    checks.forEach(function (check) {
      if (!check.ok && !firstInvalid) firstInvalid = check;
    });

    if (firstInvalid) {
      showAlert("error", "Please correct the highlighted fields and try again.");
      if (firstInvalid.input) {
        firstInvalid.input.focus();
      } else if (firstInvalid.focus === "terms") {
        fields.terms.input.focus();
      } else {
        form.querySelector('input[name="role"]').focus();
      }
      return;
    }

    var result = auth.registerUser({
      name: fields.fullName.input.value,
      username: fields.username.input.value,
      email: fields.email.input.value,
      password: fields.password.input.value,
      role: getSelectedRole(),
      affiliation: fields.affiliation.input.value,
    });

    if (!result.ok) {
      if (result.code === "validation" && result.errors) {
        Object.keys(result.errors).forEach(function (key) {
          var map = {
            name: ["fullName", "fullNameError"],
            username: ["username", "usernameError"],
            email: ["email", "emailError"],
            password: ["password", "passwordError"],
            role: [null, "roleError"],
          };
          var target = map[key];
          if (!target) return;
          if (target[0]) {
            var input = document.getElementById(target[0]);
            setFieldError(input, target[1], result.errors[key]);
          } else {
            document.getElementById(target[1]).textContent = result.errors[key];
          }
        });
      }
      showAlert("error", result.message);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Account created";
    showAlert(
      "success",
      "Account created successfully! Please log in with your new credentials to continue."
    );

    window.setTimeout(function () {
      window.location.href = "login.html";
    }, 1600);
  }

  /* ----------------------------------------------------------------------
     Initialisation
     ---------------------------------------------------------------------- */
  function init() {
    form = document.getElementById("registerForm");
    alertBox = document.getElementById("registerAlert");
    alertText = document.getElementById("registerAlertText");
    submitButton = document.getElementById("registerSubmit");

    if (auth.isAuthenticated()) {
      var session = auth.getSession();
      window.location.replace(auth.getDashboardPath(session.role));
      return;
    }

    fields = {
      fullName: { input: document.getElementById("fullName"), error: document.getElementById("fullNameError") },
      username: { input: document.getElementById("username"), error: document.getElementById("usernameError") },
      email: { input: document.getElementById("email"), error: document.getElementById("emailError") },
      role: { error: document.getElementById("roleError") },
      affiliation: { input: document.getElementById("affiliation"), error: document.getElementById("affiliationError") },
      password: { input: document.getElementById("password"), error: document.getElementById("passwordError") },
      confirmPassword: { input: document.getElementById("confirmPassword"), error: document.getElementById("confirmPasswordError") },
      terms: { input: document.getElementById("terms"), error: document.getElementById("termsError") },
    };

    initPasswordToggles();
    initRolePicker();

    fields.fullName.input.addEventListener("blur", validateName);
    fields.username.input.addEventListener("blur", validateUsername);
    fields.email.input.addEventListener("blur", validateEmail);
    fields.password.input.addEventListener("blur", validatePassword);
    fields.confirmPassword.input.addEventListener("blur", validateConfirmPassword);
    fields.terms.input.addEventListener("change", function () {
      if (fields.terms.error.textContent) validateTerms();
    });

    // Live re-validation once a field has been marked invalid.
    function revalidateOnInput(input, validator) {
      input.addEventListener("input", function () {
        if (input.classList.contains("is-invalid")) validator();
      });
    }
    revalidateOnInput(fields.fullName.input, validateName);
    revalidateOnInput(fields.username.input, validateUsername);
    revalidateOnInput(fields.email.input, validateEmail);
    revalidateOnInput(fields.password.input, validatePassword);
    revalidateOnInput(fields.confirmPassword.input, validateConfirmPassword);

    fields.password.input.addEventListener("input", function () {
      renderStrength();
      if (fields.confirmPassword.input.value) validateConfirmPassword();
    });

    document.getElementById("termsLink").addEventListener("click", function (event) {
      event.preventDefault();
      showAlert("info", "The Terms of Use are a placeholder in this prototype.");
    });
    document.getElementById("privacyLink").addEventListener("click", function (event) {
      event.preventDefault();
      showAlert("info", "The Privacy Policy is a placeholder in this prototype.");
    });

    form.addEventListener("submit", handleSubmit);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
