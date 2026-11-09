/* ==========================================================
   Moses Grace Miracle - Portfolio | COS 106 Term Project
   One script shared by every page. Each feature only runs
   when its elements exist on the current page.
   ========================================================== */
"use strict";

/* ---------- 1. Shared: footer year and mobile navigation ---------- */
function setFooterYear() {
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
}

function initNavigation() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    nav.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // close the menu after choosing a link or pressing Escape
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });
}

/* simulated links (demo project) should not jump to the top of the page */
function initSimulatedLinks() {
  document.querySelectorAll("a[data-simulated]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      alert("This is a demo link. The real address will be added when the project goes online.");
    });
  });
}

/* ==========================================================
   2. ACADEMIC PLANNER (add, complete, delete)
   Tasks live in an array of objects: { id, text, done }
   ========================================================== */
var STORAGE_KEY = "mgm-planner-tasks";
var tasks = [];
var currentFilter = "all";

function defaultTasks() {
  return [
    { id: 1, text: "Read COS 106 Notes", done: true },
    { id: 2, text: "Practice HTML and CSS", done: false },
    { id: 3, text: "Submit COS 106 Term Project", done: false }
  ];
}

function loadTasks() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    /* storage unavailable: fall back to the default tasks */
  }
  return defaultTasks();
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    /* ignore: planner still works for this visit */
  }
}

function nextId() {
  var highest = 0;
  tasks.forEach(function (task) {
    if (task.id > highest) highest = task.id;
  });
  return highest + 1;
}

function addTask(text) {
  tasks.push({ id: nextId(), text: text, done: false });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks.forEach(function (task) {
    if (task.id === id) task.done = !task.done;
  });
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  saveTasks();
  renderTasks();
}

function clearFinished() {
  tasks = tasks.filter(function (task) {
    return !task.done;
  });
  saveTasks();
  renderTasks();
}

function visibleTasks() {
  return tasks.filter(function (task) {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  });
}

function renderTasks() {
  var list = document.getElementById("task-list");
  var count = document.getElementById("task-count");
  if (!list) return;

  list.innerHTML = "";
  var shown = visibleTasks();

  if (shown.length === 0) {
    var empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = tasks.length === 0
      ? "No tasks yet. Add your first one above."
      : "Nothing to show in this view.";
    list.appendChild(empty);
  }

  shown.forEach(function (task) {
    var item = document.createElement("li");
    item.className = "task-item" + (task.done ? " done" : "");
    item.dataset.id = String(task.id);

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "task-" + task.id;
    checkbox.checked = task.done;

    var label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.textContent = task.text; // textContent keeps user input safe

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-btn";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete task: " + task.text);

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(remove);
    list.appendChild(item);
  });

  var remaining = tasks.filter(function (task) { return !task.done; }).length;
  count.textContent = tasks.length + (tasks.length === 1 ? " task" : " tasks") +
    " · " + remaining + " left to do";
}

function initPlanner() {
  var form = document.getElementById("task-form");
  if (!form) return;

  var input = document.getElementById("task-input");
  var error = document.getElementById("task-error");
  var list = document.getElementById("task-list");

  tasks = loadTasks();
  renderTasks();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (text === "") {
      error.textContent = "Please type a task before clicking Add Task.";
      input.focus();
      return;
    }
    error.textContent = "";
    addTask(text);
    input.value = "";
    input.focus();
  });

  input.addEventListener("input", function () {
    error.textContent = "";
  });

  // one listener for the whole list (event delegation)
  list.addEventListener("change", function (event) {
    if (event.target.matches('input[type="checkbox"]')) {
      toggleTask(Number(event.target.closest(".task-item").dataset.id));
    }
  });
  list.addEventListener("click", function (event) {
    if (event.target.matches(".delete-btn")) {
      deleteTask(Number(event.target.closest(".task-item").dataset.id));
    }
  });

  document.querySelectorAll(".filter-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.toggle("active", b === button);
      });
      renderTasks();
    });
  });

  document.getElementById("clear-done").addEventListener("click", clearFinished);
}

/* ==========================================================
   3. CONTACT FORM VALIDATION
   - no field may be empty
   - email format must be valid
   - phone number must contain digits only
   ========================================================== */
function isEmpty(value) {
  return value.trim() === "";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function isDigitsOnly(value) {
  return /^\d+$/.test(value.trim());
}

function showFieldError(field, message) {
  var errorBox = document.getElementById(field.id + "-error");
  errorBox.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateField(field) {
  var value = field.value;
  var message = "";

  if (isEmpty(value)) {
    message = "Please fill in this field.";
  } else if (field.id === "email" && !isValidEmail(value)) {
    message = "Enter a valid email address, like name@example.com.";
  } else if (field.id === "phone" && !isDigitsOnly(value)) {
    message = "Phone number must contain digits only (no spaces, plus sign or dashes).";
  }

  showFieldError(field, message);
  return message === "";
}

function initContactForm() {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var fields = Array.prototype.slice.call(
    form.querySelectorAll("input, textarea")
  );
  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    var allValid = true;
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!allValid) {
      status.className = "form-status fail";
      status.textContent = "Please correct the errors above and try again.";
      firstInvalid.focus();
      return;
    }

    var name = form.elements["name"].value.trim();
    status.className = "form-status success";
    status.textContent = "Thank you, " + name + "! Your details are valid and your message is ready. " +
      "This demo form does not send email, so you can also reach me directly at g.moses1437@miva.edu.ng.";
    form.reset();
    fields.forEach(function (field) { showFieldError(field, ""); });
  });

  // re-check a field when the user leaves it, clear its error while typing
  fields.forEach(function (field) {
    field.addEventListener("blur", function () {
      if (field.value !== "") validateField(field);
    });
    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });
}

/* ---------- 4. Start everything when the page is ready ---------- */
document.addEventListener("DOMContentLoaded", function () {
  setFooterYear();
  initNavigation();
  initSimulatedLinks();
  initPlanner();
  initContactForm();
});
