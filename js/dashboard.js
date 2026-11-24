/* ==========================================================================
   SIWIMS - Shared dashboard behaviour
   --------------------------------------------------------------------------
   Handles access guarding, user identity rendering, sidebar navigation,
   notifications, and the interactive prototype actions (modals, status
   updates, CSV exports) shared by all four dashboards.
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
  var activateSection = null;

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

    activateSection = activate;

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var id = link.getAttribute("data-nav");
        if (activate(id)) {
          history.replaceState(null, "", "#" + id);
        }
      });
    });

    var fallback =
      document.body.getAttribute("data-default-section") ||
      links[0].getAttribute("data-nav");
    var initial = (global.location.hash || "").replace("#", "");
    if (!initial || !activate(initial, { scroll: false })) {
      activate(fallback, { scroll: false });
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
     Progress bars, rings, dismissibles
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

  /* ----------------------------------------------------------------------
     Tiny DOM helpers
     ---------------------------------------------------------------------- */
  var uid = 0;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function button(label, className, handler) {
    var node = el("button", className || "btn btn-secondary", label);
    node.type = "button";
    if (handler) node.addEventListener("click", handler);
    return node;
  }

  var toastTimer;

  function toast(message) {
    var node = document.getElementById("dashToast");
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    global.clearTimeout(toastTimer);
    toastTimer = global.setTimeout(function () {
      node.hidden = true;
    }, 3200);
  }

  function today() {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var d = new Date();
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  /* ----------------------------------------------------------------------
     Modal dialog
     ---------------------------------------------------------------------- */
  var activeModal = null;

  function closeModal() {
    if (!activeModal) return;
    var node = activeModal;
    activeModal = null;
    document.removeEventListener("keydown", onModalKeydown);
    node.classList.remove("is-open");
    global.setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 220);
  }

  function onModalKeydown(event) {
    if (event.key === "Escape") closeModal();
  }

  /**
   * Build and display a modal dialog.
   * @param {object} config
   * @param {string} config.title
   * @param {string} [config.subtitle]
   * @param {Node|Node[]} [config.body]
   * @param {string} [config.submitLabel]  Renders a submit button + Cancel.
   * @param {function} [config.onSubmit]   Return false to keep the dialog open.
   * @param {Array}  [config.actions]      [{label, className, onClick}] buttons.
   */
  function openModal(config) {
    closeModal();

    var backdrop = el("div", "modal-backdrop");
    var card = el("div", "modal-card");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    if (config.title) card.setAttribute("aria-label", config.title);

    var head = el("div", "modal-head");
    var heading = el("div");
    heading.appendChild(el("h2", null, config.title || ""));
    if (config.subtitle) heading.appendChild(el("p", null, config.subtitle));
    head.appendChild(heading);
    var closeBtn = el("button", "modal-close");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close dialog");
    closeBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    closeBtn.addEventListener("click", closeModal);
    head.appendChild(closeBtn);
    card.appendChild(head);

    var form = el("form");
    form.noValidate = true;

    var body = el("div", "modal-body");
    var nodes = Array.isArray(config.body) ? config.body : config.body ? [config.body] : [];
    nodes.forEach(function (node) {
      if (node) body.appendChild(node);
    });
    form.appendChild(body);

    var foot = el("div", "modal-foot");
    if (config.actions && config.actions.length) {
      config.actions.forEach(function (spec) {
        foot.appendChild(button(spec.label, spec.className || "btn btn-secondary", spec.onClick));
      });
    } else {
      foot.appendChild(button(config.cancelLabel || "Cancel", "btn btn-ghost", closeModal));
      if (config.submitLabel) {
        var submit = el("button", "btn btn-primary", config.submitLabel);
        submit.type = "submit";
        foot.appendChild(submit);
      }
    }
    form.appendChild(foot);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (config.onSubmit && config.onSubmit(form) === false) return;
      closeModal();
    });

    card.appendChild(form);
    backdrop.appendChild(card);
    backdrop.addEventListener("mousedown", function (event) {
      if (event.target === backdrop) closeModal();
    });

    document.body.appendChild(backdrop);
    activeModal = backdrop;
    document.addEventListener("keydown", onModalKeydown);
    global.requestAnimationFrame(function () {
      backdrop.classList.add("is-open");
    });
    var first = card.querySelector("input, select, textarea");
    if (first) global.setTimeout(function () { first.focus(); }, 80);
  }

  /* ----------------------------------------------------------------------
     Form controls
     ---------------------------------------------------------------------- */
  function field(labelText, control) {
    var wrap = el("div", "modal-field");
    var id = "mf" + ++uid;
    control.id = id;
    var label = el("label", "field-label", labelText);
    label.setAttribute("for", id);
    wrap.appendChild(label);
    wrap.appendChild(control);
    return wrap;
  }

  function row2(a, b) {
    var row = el("div", "form-row");
    row.appendChild(a);
    row.appendChild(b);
    return row;
  }

  function textInput(value, placeholder) {
    var input = el("input", "form-control");
    input.type = "text";
    input.value = value || "";
    if (placeholder) input.placeholder = placeholder;
    return input;
  }

  function numberInput(value, min, max) {
    var input = el("input", "form-control");
    input.type = "number";
    input.value = value == null ? "" : String(value);
    input.min = String(min);
    input.max = String(max);
    return input;
  }

  function textArea(value, placeholder) {
    var area = el("textarea", "form-control");
    area.value = value || "";
    if (placeholder) area.placeholder = placeholder;
    return area;
  }

  function selectInput(options, value) {
    var select = el("select", "form-control");
    options.forEach(function (option) {
      var data = typeof option === "string" ? { label: option, value: option } : option;
      var item = el("option", null, data.label);
      item.value = data.value;
      if (data.value === value) item.selected = true;
      select.appendChild(item);
    });
    return select;
  }

  /* ----------------------------------------------------------------------
     Table + row helpers
     ---------------------------------------------------------------------- */
  function findTable(captionText) {
    var tables = document.querySelectorAll("table.data-table");
    var wanted = captionText.replace(/\s+/g, " ").trim().toLowerCase();
    for (var i = 0; i < tables.length; i++) {
      var caption = tables[i].querySelector("caption");
      if (caption && caption.textContent.replace(/\s+/g, " ").trim().toLowerCase() === wanted) {
        return tables[i];
      }
    }
    return null;
  }

  function tableRows(table) {
    var rows = [];
    Array.prototype.forEach.call(table.querySelectorAll("tr"), function (tr) {
      var cells = [];
      Array.prototype.forEach.call(tr.children, function (cell) {
        cells.push(cell.textContent.replace(/\s+/g, " ").trim());
      });
      rows.push(cells);
    });
    return rows;
  }

  function findRowByText(table, text) {
    var rows = table.querySelectorAll("tbody tr");
    var wanted = text.toLowerCase();
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].children[0] && rows[i].children[0].textContent.trim().toLowerCase() === wanted) {
        return rows[i];
      }
    }
    return null;
  }

  function downloadCSV(filename, rows) {
    var csv = rows
      .map(function (row) {
        return row
          .map(function (cell) {
            return '"' + String(cell == null ? "" : cell).replace(/"/g, '""') + '"';
          })
          .join(",");
      })
      .join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    global.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1200);
  }

  function exportTables(filename, captions) {
    var rows = [];
    captions.forEach(function (caption) {
      var table = findTable(caption);
      if (!table) return;
      if (rows.length) rows.push([]);
      rows.push([caption]);
      rows = rows.concat(tableRows(table));
    });
    if (!rows.length) {
      toast("There is nothing to export on this page yet.");
      return;
    }
    downloadCSV(filename, rows);
    toast("Export ready: " + filename);
  }

  /* ----------------------------------------------------------------------
     Row status helpers
     ---------------------------------------------------------------------- */
  function rowScope(node) {
    return (
      node.closest("tr") ||
      node.closest(".list-item") ||
      node.closest(".posting-card") ||
      node.closest(".dash-card")
    );
  }

  function actionGroup(node) {
    return (
      node.closest(".table-actions") ||
      node.closest(".list-side") ||
      node.closest(".page-actions")
    );
  }

  /** Update the status badge of the surrounding row and drop its buttons. */
  function resolve(node, label, variant) {
    var scope = rowScope(node);
    if (!scope) return;
    var group = actionGroup(node);
    var badge = scope.querySelector(".badge");
    if (badge) {
      badge.className = "badge badge--" + variant;
      badge.textContent = label;
    } else if (group) {
      group.appendChild(el("span", "badge badge--" + variant, label));
    }
    if (group) {
      Array.prototype.forEach.call(group.querySelectorAll("button"), function (btn) {
        btn.remove();
      });
    }
  }

  function rowDetail(node) {
    var scope = rowScope(node);
    var wrap = el("div", "modal-detail");
    if (!scope) return wrap;

    if (scope.tagName === "TR") {
      var table = scope.closest("table");
      var heads = table
        ? Array.prototype.map.call(table.querySelectorAll("thead th"), function (th) {
            return th.textContent.trim();
          })
        : [];
      Array.prototype.forEach.call(scope.children, function (cell, index) {
        if (cell.querySelector("button")) return;
        var item = el("div", "info-item");
        item.appendChild(el("p", "info-label", heads[index] || "Detail"));
        item.appendChild(el("p", "info-value", cell.textContent.trim() || "—"));
        wrap.appendChild(item);
      });
    } else {
      var title = scope.querySelector(".list-title");
      var sub = scope.querySelector(".list-sub");
      var name = el("div", "info-item");
      name.appendChild(el("p", "info-label", "Name"));
      name.appendChild(el("p", "info-value", title ? title.textContent.trim() : "—"));
      wrap.appendChild(name);
      var detail = el("div", "info-item");
      detail.appendChild(el("p", "info-label", "Details"));
      detail.appendChild(el("p", "info-value", sub ? sub.textContent.trim() : "—"));
      wrap.appendChild(detail);
    }
    return wrap;
  }

  function openDetailModal(title, subtitle, node) {
    openModal({
      title: title,
      subtitle: subtitle,
      body: node,
      actions: [{ label: "Close", className: "btn btn-primary", onClick: closeModal }],
    });
  }

  /* ----------------------------------------------------------------------
     Opportunity postings (company)
     ---------------------------------------------------------------------- */
  var PHOTO_LIBRARY = [
    { label: "IT support workspace", value: "../assets/images/posting-it-support.jpg" },
    { label: "Quality assurance desk", value: "../assets/images/posting-qa.jpg" },
    { label: "Network operations", value: "../assets/images/posting-network.jpg" },
    { label: "Data encoding desk", value: "../assets/images/posting-data.jpg" },
  ];

  function buildPostingCard(data) {
    var card = el("article", "posting-card posting-card--media");

    var media = el("div", "posting-card__media");
    var img = el("img");
    img.src = data.photo;
    img.alt = data.title + " opportunity";
    img.loading = "lazy";
    media.appendChild(img);
    media.appendChild(el("span", "badge badge--success posting-card__status", "Open"));
    var cat = el("span", "posting-card__cat");
    cat.innerHTML = '<svg><use href="#i-briefcase"/></svg>';
    cat.appendChild(document.createTextNode(data.category));
    media.appendChild(cat);
    card.appendChild(media);

    var surface = el("div", "posting-card__surface");
    var top = el("div", "posting-card__top");
    var info = el("div");
    info.appendChild(el("p", "posting-card__title", data.title));
    info.appendChild(el("p", "posting-card__qual", data.qualification));
    top.appendChild(info);
    surface.appendChild(top);

    var meta = el("div", "company-card__meta");
    var pin = el("span", "meta-item");
    pin.innerHTML = '<svg><use href="#i-pin"/></svg>';
    pin.appendChild(document.createTextNode(data.location));
    meta.appendChild(pin);
    surface.appendChild(meta);

    var counts = el("div", "posting-card__meta");
    counts.innerHTML =
      "<span><b>0/" + data.slots + "</b>Slots filled</span><span><b>0</b>Applicants</span>";
    surface.appendChild(counts);

    var foot = el("div", "posting-card__foot");
    foot.appendChild(el("p", "posting-card__qual", "Published just now"));
    var edit = button("Edit", "btn btn-ghost btn-sm");
    edit.setAttribute("data-demo-action", "Editing a posting");
    foot.appendChild(edit);
    surface.appendChild(foot);

    card.appendChild(surface);
    return card;
  }

  function buildOpportunityRow(data) {
    var tr = document.createElement("tr");
    tr.appendChild(el("td", "cell-strong", data.title));
    tr.appendChild(el("td", null, data.qualification));
    tr.appendChild(el("td", null, String(data.slots)));
    tr.appendChild(el("td", null, "0"));
    var status = el("td");
    status.appendChild(el("span", "badge badge--success", "Open"));
    tr.appendChild(status);
    var actions = el("td");
    var group = el("div", "table-actions");
    var edit = button("Edit", "btn btn-ghost btn-sm");
    edit.setAttribute("data-demo-action", "Editing a posting");
    group.appendChild(edit);
    actions.appendChild(group);
    tr.appendChild(actions);
    return tr;
  }

  function bumpOpportunityCount() {
    Array.prototype.some.call(document.querySelectorAll(".kpi"), function (kpi) {
      var label = kpi.querySelector(".kpi-label");
      if (label && label.textContent.trim().toLowerCase() === "opportunities") {
        var value = kpi.querySelector(".kpi-value");
        if (value) value.textContent = String((parseInt(value.textContent, 10) || 0) + 1);
        return true;
      }
      return false;
    });
  }

  function openOpportunityForm() {
    var title = textInput("", "e.g. Software Engineering Intern");
    var qual = textInput("", "e.g. BSIT / BSCS");
    var category = selectInput(
      ["Information Technology", "Quality Assurance", "Network Operations", "Data & Analytics", "Design & Creative"],
      "Information Technology"
    );
    var slots = numberInput(2, 1, 50);
    var location = selectInput(
      ["Cebu City — Cebu IT Park", "Cebu City — Capitol Site", "Mandaue City", "Lapu-Lapu City", "Talisay City"],
      "Cebu City — Cebu IT Park"
    );
    var photo = selectInput(PHOTO_LIBRARY, PHOTO_LIBRARY[0].value);

    openModal({
      title: "Post an Internship Opportunity",
      subtitle: "Publish a new posting so students can discover and apply.",
      body: [
        field("Position title", title),
        row2(field("Qualification", qual), field("Slots", slots)),
        row2(field("Category", category), field("Location", location)),
        field("Cover photo", photo),
      ],
      submitLabel: "Publish Opportunity",
      onSubmit: function () {
        if (!title.value.trim()) {
          toast("Please enter a position title before publishing.");
          return false;
        }
        var data = {
          title: title.value.trim(),
          qualification: qual.value.trim() || "Any IT program",
          category: category.value,
          slots: Math.max(1, parseInt(slots.value, 10) || 1),
          location: location.value,
          photo: photo.value,
        };

        var boards = document.querySelectorAll(".posting-board--media");
        Array.prototype.forEach.call(boards, function (board) {
          board.insertBefore(buildPostingCard(data), board.firstChild);
        });

        var table = findTable("Your internship postings");
        if (table) {
          var tbody = table.querySelector("tbody");
          if (tbody) tbody.insertBefore(buildOpportunityRow(data), tbody.firstChild);
        }

        bumpOpportunityCount();
        toast("Opportunity published: " + data.title + ".");
      },
    });
  }

  function openEditPosting(node) {
    var scope = rowScope(node);
    if (!scope) return;
    var isRow = scope.tagName === "TR";
    var titleNode = isRow ? scope.children[0] : scope.querySelector(".posting-card__title");
    var qualNode = isRow ? scope.children[1] : scope.querySelector(".posting-card__qual");
    var slotNode = isRow ? scope.children[2] : scope.querySelector(".posting-card__meta b");

    var currentTitle = titleNode ? titleNode.textContent.trim() : "";
    var currentQual = qualNode ? qualNode.textContent.trim() : "";
    var currentSlots = 1;
    if (slotNode) {
      var match = String(slotNode.textContent).match(/(\d+)/);
      if (match) currentSlots = match[1];
    }

    var title = textInput(currentTitle, "");
    var qual = textInput(currentQual === "—" ? "" : currentQual, "");
    var slots = numberInput(parseInt(currentSlots, 10) || 1, 1, 50);

    openModal({
      title: "Edit Opportunity",
      subtitle: "Update the details of this posting.",
      body: [field("Position title", title), row2(field("Qualification", qual), field("Slots", slots))],
      submitLabel: "Save Changes",
      onSubmit: function () {
        var newTitle = title.value.trim() || currentTitle;
        if (isRow) {
          if (scope.children[0]) scope.children[0].textContent = newTitle;
          if (scope.children[1]) scope.children[1].textContent = qual.value.trim() || "—";
          if (scope.children[2]) scope.children[2].textContent = slots.value;
        } else {
          if (titleNode) titleNode.textContent = newTitle;
          if (qualNode) qualNode.textContent = qual.value.trim();
          var fill = scope.querySelector(".posting-card__meta b");
          if (fill) fill.textContent = "0/" + slots.value;
        }
        toast("Posting updated: " + newTitle + ".");
      },
    });
  }

  /* ----------------------------------------------------------------------
     Profile editing
     ---------------------------------------------------------------------- */
  function openProfileForm(node) {
    var section = node.closest("[data-section]") || document;
    var items = section.querySelectorAll(".info-item");
    var fields = [];
    var targets = [];

    Array.prototype.forEach.call(items, function (item) {
      var label = item.querySelector(".info-label");
      var value = item.querySelector(".info-value");
      if (!label || !value) return;
      if (
        value.hasAttribute("data-user-name") ||
        value.hasAttribute("data-user-email") ||
        value.hasAttribute("data-user-id")
      ) {
        return;
      }
      var current = value.textContent.trim();
      var control = textInput(current === "—" ? "" : current, "");
      fields.push(field(label.textContent.trim(), control));
      targets.push({ value: value, control: control });
    });

    if (!fields.length) {
      toast("There are no editable fields on this profile.");
      return;
    }

    openModal({
      title: "Edit Profile",
      subtitle: "Keep your profile information accurate and up to date.",
      body: fields,
      submitLabel: "Save Profile",
      onSubmit: function () {
        targets.forEach(function (target) {
          target.value.textContent = target.control.value.trim() || "—";
        });
        toast("Profile updated successfully.");
      },
    });
  }

  /* ----------------------------------------------------------------------
     Student self-service actions
     ---------------------------------------------------------------------- */
  function openAttendanceForm() {
    var date = textInput(today(), "");
    var timeIn = textInput("8:00 AM", "");
    var timeOut = textInput("5:00 PM", "");
    var rendered = textInput("8.0 hrs", "");

    openModal({
      title: "Log Attendance",
      subtitle: "Submit today's time log for supervisor verification.",
      body: [
        field("Date", date),
        row2(field("Time In", timeIn), field("Time Out", timeOut)),
        field("Rendered hours", rendered),
      ],
      submitLabel: "Submit Log",
      onSubmit: function () {
        var table = findTable("Recent attendance log") || findTable("Attendance logs");
        if (table) {
          var tbody = table.querySelector("tbody");
          var tr = document.createElement("tr");
          tr.appendChild(el("td", "cell-strong", date.value.trim()));
          tr.appendChild(el("td", null, timeIn.value.trim()));
          tr.appendChild(el("td", null, timeOut.value.trim()));
          tr.appendChild(el("td", null, rendered.value.trim()));
          var status = el("td");
          status.appendChild(el("span", "badge badge--warning", "Pending Verification"));
          tr.appendChild(status);
          if (tbody) tbody.insertBefore(tr, tbody.firstChild);
        }
        toast("Attendance log submitted for verification.");
      },
    });
  }

  function openRequirementForm() {
    var names = [
      "Internship Application Form",
      "Parent's Consent Form",
      "Medical Certificate",
      "Certificate of Enrollment",
      "Resume / Curriculum Vitae",
      "Certificate of Good Moral Character",
    ];
    var doc = selectInput(names, names[0]);
    var file = textInput("", "e.g. requirement-scan.pdf");

    openModal({
      title: "Upload Requirement",
      subtitle: "Submit a pre-deployment document for coordinator verification.",
      body: [field("Requirement", doc), field("File name", file)],
      submitLabel: "Upload Document",
      onSubmit: function () {
        var table = findTable("Submitted requirements");
        if (table) {
          var tbody = table.querySelector("tbody");
          var tr = document.createElement("tr");
          tr.appendChild(el("td", "cell-strong", doc.value));
          tr.appendChild(el("td", null, today()));
          var status = el("td");
          status.appendChild(el("span", "badge badge--info", "Pending Verification"));
          tr.appendChild(status);
          tr.appendChild(el("td", "cell-muted", file.value.trim() || "Awaiting coordinator review."));
          if (tbody) tbody.insertBefore(tr, tbody.firstChild);
        }
        toast(doc.value + " uploaded and sent for verification.");
      },
    });
  }

  function openReportForm() {
    var week = selectInput(["Week 8", "Week 9", "Week 10"], "Week 8");
    var period = textInput("Nov 24 – Nov 28, 2026", "");
    var summary = textArea("", "Summarise the tasks and accomplishments for this week");

    openModal({
      title: "New Weekly Report",
      subtitle: "Weekly accomplishment reports are reviewed by your supervisor.",
      body: [row2(field("Week", week), field("Period", period)), field("Accomplishments", summary)],
      submitLabel: "Submit Report",
      onSubmit: function () {
        var table = findTable("Weekly accomplishment reports");
        if (table) {
          var tbody = table.querySelector("tbody");
          var tr = document.createElement("tr");
          tr.appendChild(el("td", "cell-strong", week.value));
          tr.appendChild(el("td", null, period.value.trim()));
          tr.appendChild(el("td", null, today()));
          var status = el("td");
          status.appendChild(el("span", "badge badge--info", "Submitted"));
          tr.appendChild(status);
          if (tbody) tbody.insertBefore(tr, tbody.firstChild);
        }
        toast(week.value + " report submitted for approval.");
      },
    });
  }

  /* ----------------------------------------------------------------------
     Company / coordinator actions
     ---------------------------------------------------------------------- */
  function assignSupervisor(node) {
    var form = node.closest("form");
    if (!form) return;
    var selects = form.querySelectorAll("select");
    if (selects.length < 2) return;

    var intern = String(selects[0].value).split("\u2014")[0].trim();
    var supervisor = String(selects[1].value).trim();

    var table = findTable("Active interns roster");
    if (table) {
      var row = findRowByText(table, intern);
      if (row && row.children[2]) {
        row.children[2].textContent = supervisor;
        var badge = row.querySelector(".badge");
        if (badge) {
          badge.className = "badge badge--info";
          badge.textContent = "Ongoing";
        }
      }
    }
    toast(supervisor + " assigned to " + intern + ".");
  }

  function publishAnnouncement() {
    var title = textInput("", "e.g. Pre-deployment orientation on December 1");
    var message = textArea("", "Write the announcement for the student cohort");

    openModal({
      title: "New Announcement",
      subtitle: "Broadcast an update to the student cohort.",
      body: [field("Title", title), field("Message", message)],
      submitLabel: "Publish Announcement",
      onSubmit: function () {
        if (!title.value.trim()) {
          toast("Please enter an announcement title.");
          return false;
        }
        var section = document.querySelector('[data-section="notifications"] .list');
        if (section) {
          var item = el("div", "list-item");
          var main = el("div", "list-main");
          main.appendChild(el("span", "list-title", title.value.trim()));
          main.appendChild(el("span", "list-sub", message.value.trim() || "Announcement published to all students."));
          item.appendChild(main);
          var side = el("span", "list-side");
          side.appendChild(el("span", "badge badge--info", "Announcement"));
          side.appendChild(el("span", "cell-muted", "Just now"));
          item.appendChild(side);
          section.insertBefore(item, section.firstChild);
        }
        toast("Announcement published to the cohort.");
      },
    });
  }

  /* ----------------------------------------------------------------------
     Student browse: apply for a position
     ---------------------------------------------------------------------- */
  function bumpApplicationsCount() {
    Array.prototype.some.call(document.querySelectorAll(".hero-stat"), function (stat) {
      var label = stat.querySelector("span");
      if (label && /applications sent/i.test(label.textContent)) {
        var value = stat.querySelector("strong");
        if (value) value.textContent = String((parseInt(value.textContent, 10) || 0) + 1);
        return true;
      }
      return false;
    });
  }

  function openApplyModal(node) {
    var card = node.closest(".company-card");
    var company = card && card.querySelector(".company-card__name")
      ? card.querySelector(".company-card__name").textContent.trim()
      : "this company";
    var positions = card ? card.querySelectorAll(".position-row") : [];
    var body = [];

    Array.prototype.forEach.call(positions, function (row) {
      var name = row.querySelector(".position-name");
      var slots = row.querySelector(".position-slots");
      var option = el("div", "apply-option");
      var info = el("div");
      info.appendChild(el("p", "apply-option__name", name ? name.textContent.trim() : "Position"));
      info.appendChild(
        el("p", "apply-option__meta", (slots ? slots.textContent.trim() : "Open") + " · Cebu, Philippines")
      );
      option.appendChild(info);

      var apply = button("Apply", "btn btn-primary btn-sm");
      apply.addEventListener("click", function () {
        if (apply.disabled) return;
        apply.disabled = true;
        apply.textContent = "Applied";
        apply.className = "btn btn-ghost btn-sm";
        bumpApplicationsCount();
        toast("Application sent for " + (name ? name.textContent.trim() : "this position") + " at " + company + ".");
      });
      option.appendChild(apply);
      body.push(option);
    });

    if (!body.length) body.push(el("p", "card-text", "There are no open positions listed right now."));

    openModal({
      title: company,
      subtitle: "Review the open internship positions and send your application.",
      body: body,
      actions: [{ label: "Close", className: "btn btn-secondary", onClick: closeModal }],
    });
  }

  /* ----------------------------------------------------------------------
     Action map + delegated listener
     ---------------------------------------------------------------------- */
  var ACTIONS = {
    /* Company applicants */
    "Accepting an applicant": function (node) {
      resolve(node, "Accepted", "success");
      toast("Applicant accepted. They now appear in your accepted interns list.");
    },
    "Rejecting an applicant": function (node) {
      resolve(node, "Rejected", "danger");
      toast("Applicant rejected. The student will be notified.");
    },
    "Viewing an applicant": function (node) {
      openDetailModal("Applicant Details", "Review the submitted application profile.", rowDetail(node));
    },

    /* Company opportunities */
    "Creating an opportunity": function () {
      openOpportunityForm();
    },
    "Editing a posting": function (node) {
      openEditPosting(node);
    },
    "Publishing a posting": function (node) {
      resolve(node, "Open", "success");
      toast("Posting published. It is now visible to students.");
    },
    "Reviewing applicants": function () {
      if (activateSection) activateSection("applicants");
    },
    "Assigning a supervisor": function (node) {
      assignSupervisor(node);
    },

    /* Profiles */
    "Editing your profile": function (node) {
      openProfileForm(node);
    },
    "Editing the company profile": function (node) {
      openProfileForm(node);
    },

    /* Student self-service */
    "Logging attendance": function () {
      openAttendanceForm();
    },
    "Logging time-in / time-out": function () {
      openAttendanceForm();
    },
    "Uploading a requirement": function () {
      openRequirementForm();
    },
    "Submitting a report": function () {
      openReportForm();
    },
    "Creating a weekly report": function () {
      openReportForm();
    },

    /* Supervisor */
    "Approving a report": function (node) {
      resolve(node, "Approved", "success");
      toast("Report approved and recorded.");
    },
    "Returning a report for revision": function (node) {
      resolve(node, "Revision Required", "warning");
      toast("Report returned to the intern for revision.");
    },
    "Submitting an evaluation": function (node) {
      submitEvaluation(node);
    },

    /* Coordinator */
    "Reviewing a student": function (node) {
      openModal({
        title: "Student Requirement Review",
        subtitle: "Verify the submitted documents before deployment.",
        body: rowDetail(node),
        actions: [
          { label: "Close", className: "btn btn-ghost", onClick: closeModal },
          {
            label: "Mark Verified",
            className: "btn btn-primary",
            onClick: function () {
              closeModal();
              resolve(node, "Verified", "success");
              toast("Student requirements marked as verified.");
            },
          },
        ],
      });
    },
    "Approving a placement": function (node) {
      resolve(node, "Approved", "success");
      toast("Placement approved. The student may begin deployment.");
    },
    "Returning a placement": function (node) {
      resolve(node, "Returned", "warning");
      toast("Placement returned to the company for correction.");
    },
    "Viewing a placement": function (node) {
      openDetailModal("Placement Details", "Validated internship placement.", rowDetail(node));
    },
    "Approving a document": function (node) {
      resolve(node, "Approved", "success");
      toast("Document approved.");
    },
    "Requesting a revision": function (node) {
      resolve(node, "Revision Required", "warning");
      toast("Revision requested from the student.");
    },
    "Rejecting a document": function (node) {
      resolve(node, "Rejected", "danger");
      toast("Document rejected. The student will be notified.");
    },
    "Publishing an announcement": function () {
      publishAnnouncement();
    },

    /* Exports + reports */
    "Exporting records": function () {
      exportTables("siwims-cohort-records.csv", [
        "Registered students",
        "Internship applications",
        "Placements awaiting validation",
        "Documents pending verification",
      ]);
    },
    "Exporting the student list": function () {
      exportTables("siwims-student-records.csv", ["Registered students"]);
    },
    "Generating a summary report": function () {
      exportTables("siwims-summary-report.csv", [
        "Registered students",
        "Internship applications",
        "Placements awaiting validation",
      ]);
    },
    "Student report export": function () {
      exportTables("siwims-student-report.csv", ["Registered students"]);
    },
    "Company report export": function () {
      exportTables("siwims-company-report.csv", ["Internship applications"]);
    },
    "Completion report export": function () {
      exportTables("siwims-completion-report.csv", ["Registered students"]);
    },
  };

  function submitEvaluation(node) {
    var form = node.closest("form");
    var select = form ? form.querySelector("select") : null;
    var intern = select ? String(select.value).split("\u2014")[0].trim() : "Intern";
    var section = node.closest("[data-section]");
    var target = null;

    if (section) {
      Array.prototype.some.call(section.querySelectorAll(".list-item"), function (item) {
        var title = item.querySelector(".list-title");
        if (title && title.textContent.trim() === intern) {
          target = item;
          return true;
        }
        return false;
      });
    }

    if (target) {
      var badge = target.querySelector(".badge");
      if (badge) {
        badge.className = "badge badge--success";
        badge.textContent = "Submitted";
      }
      var sub = target.querySelector(".list-sub");
      if (sub) sub.textContent = "Final evaluation · Submitted " + today();
    }
    toast("Evaluation submitted for " + intern + ".");
  }

  /* Positions the student can apply to (shared with browse page). */
  function initPrototypeActions() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      var node = target.closest("[data-demo-action]");
      if (!node || node.disabled) return;

      event.preventDefault();
      var action = node.getAttribute("data-demo-action");

      if (/^Applying to /.test(action)) {
        openApplyModal(node);
        return;
      }

      var handler = ACTIONS[action];
      if (handler) handler(node, action);
      else toast(action + " completed.");
    });
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
