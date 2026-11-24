/* ==========================================================================
   SIWIMS - Login page controller
   ========================================================================== */
(function () {
  "use strict";

  var auth = window.SIWIMS.auth;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var form;
  var identifierInput;
  var passwordInput;
  var rememberInput;
  var alertBox;
  var alertText;
  var submitButton;

  /* ----------------------------------------------------------------------
     Validation helpers
     ---------------------------------------------------------------------- */
  function setFieldError(input, errorElement, message) {
    input.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    errorElement.textContent = message || "";
  }

  function validateIdentifier() {
    var value = identifierInput.value.trim();
    var error = document.getElementById("identifierError");

    if (!value) {
      setFieldError(identifierInput, error, "Email or username is required.");
      return false;
    }
    if (value.indexOf("@") !== -1 && !EMAIL_PATTERN.test(value)) {
      setFieldError(
        identifierInput,
        error,
        "Enter a valid email address (e.g. name@siwims.edu)."
      );
      return false;
    }
    setFieldError(identifierInput, error, "");
    return true;
  }

  function validatePassword() {
    var value = passwordInput.value;
    var error = document.getElementById("passwordError");

    if (!value) {
      setFieldError(passwordInput, error, "Password is required.");
      return false;
    }
    if (value.length < 6) {
      setFieldError(passwordInput, error, "Password must be at least 6 characters.");
      return false;
    }
    setFieldError(passwordInput, error, "");
    return true;
  }

  /* ----------------------------------------------------------------------
     Feedback
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
     Password visibility
     ---------------------------------------------------------------------- */
  function initPasswordToggle() {
    var toggle = document.getElementById("passwordToggle");
    var eye = toggle.querySelector(".icon-eye");
    var eyeOff = toggle.querySelector(".icon-eye-off");

    toggle.addEventListener("click", function () {
      var show = passwordInput.type === "password";
      passwordInput.type = show ? "text" : "password";
      toggle.setAttribute("aria-pressed", String(show));
      toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
      eye.hidden = show;
      eyeOff.hidden = !show;
      passwordInput.focus();
    });
  }

  /* ----------------------------------------------------------------------
     Submission
     ---------------------------------------------------------------------- */
  function handleSubmit(event) {
    event.preventDefault();
    hideAlert();

    var isIdentifierValid = validateIdentifier();
    var isPasswordValid = validatePassword();
    if (!isIdentifierValid || !isPasswordValid) {
      (isIdentifierValid ? passwordInput : identifierInput).focus();
      showAlert("error", "Please correct the highlighted fields and try again.");
      return;
    }

    var result = auth.authenticate(identifierInput.value, passwordInput.value);
    if (!result.ok) {
      setFieldError(passwordInput, document.getElementById("passwordError"), "");
      passwordInput.classList.add("is-invalid");
      passwordInput.setAttribute("aria-invalid", "true");
      showAlert("error", result.message);
      passwordInput.focus();
      passwordInput.select();
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = "Signing in\u2026";

    auth.createSession(result.user, rememberInput.checked);

    window.setTimeout(function () {
      window.location.href = auth.getDashboardPath(result.user.role);
    }, 700);
  }

  /* ----------------------------------------------------------------------
     Initialisation
     ---------------------------------------------------------------------- */
  function init() {
    form = document.getElementById("loginForm");
    identifierInput = document.getElementById("identifier");
    passwordInput = document.getElementById("password");
    rememberInput = document.getElementById("rememberMe");
    alertBox = document.getElementById("loginAlert");
    alertText = document.getElementById("loginAlertText");
    submitButton = document.getElementById("loginSubmit");

    // Already signed in? Send the user straight to their dashboard.
    var existing = auth.getSession();
    if (existing) {
      window.location.replace(auth.getDashboardPath(existing.role));
      return;
    }

    initPasswordToggle();

    identifierInput.addEventListener("blur", validateIdentifier);
    passwordInput.addEventListener("blur", validatePassword);
    identifierInput.addEventListener("input", function () {
      if (identifierInput.classList.contains("is-invalid")) validateIdentifier();
    });
    passwordInput.addEventListener("input", function () {
      if (passwordInput.classList.contains("is-invalid")) validatePassword();
    });

    form.addEventListener("submit", handleSubmit);

    document.getElementById("forgotPassword").addEventListener("click", function (event) {
      event.preventDefault();
      showAlert(
        "info",
        "Password recovery is a placeholder in this prototype. Please contact your school's internship coordinator."
      );
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
