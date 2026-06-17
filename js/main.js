const SELECTORS = {
  header: "[data-header]",
  nav: "[data-nav]",
  menuToggle: "[data-menu-toggle]",
  quoteForm: "[data-quote-form]",
  formStatus: "[data-form-status]",
  reveal: ".reveal",
};

function initMobileNav() {
  const header = document.querySelector(SELECTORS.header);
  const nav = document.querySelector(SELECTORS.nav);
  const toggle = document.querySelector(SELECTORS.menuToggle);

  if (!header || !nav || !toggle) return;

  nav.id = "primary-menu";

  const setOpen = (isOpen) => {
    nav.classList.toggle("is-open", isOpen);
    header.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });
}

function initHeaderScroll() {
  const header = document.querySelector(SELECTORS.header);
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initSmoothScroll() {
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!(link instanceof HTMLAnchorElement)) return;

    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", targetId);
  });
}

function initHashScrollCorrection() {
  const correctHashPosition = () => {
    if (!window.location.hash) return;

    const target = document.querySelector(window.location.hash);
    target?.scrollIntoView({ block: "start" });
  };

  requestAnimationFrame(correctHashPosition);
  window.addEventListener("load", correctHashPosition, { once: true });
  window.setTimeout(correctHashPosition, 350);
}

function initRevealAnimations() {
  const revealItems = document.querySelectorAll(SELECTORS.reveal);
  if (!revealItems.length) return;

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport) {
      item.classList.add("is-visible");
      return;
    }

    item.classList.add("reveal--pending");
    observer.observe(item);
  });
}

function initContactForm() {
  const form = document.querySelector(SELECTORS.quoteForm);
  if (!(form instanceof HTMLFormElement)) return;

  const status = form.querySelector(SELECTORS.formStatus);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setFieldError = (field, message) => {
    const wrapper = field.closest(".form-field");
    const error = form.querySelector(`[data-error-for="${field.name}"]`);

    field.setAttribute("aria-invalid", message ? "true" : "false");
    wrapper?.classList.toggle("is-invalid", Boolean(message));

    if (error) {
      error.textContent = message;
    }
  };

  const validateField = (field) => {
    const value = field.value.trim();
    let message = "";

    if (field.required && !value) {
      message = "This field is required.";
    } else if (field.type === "email" && value && !emailPattern.test(value)) {
      message = "Enter a valid email address.";
    }

    setFieldError(field, message);
    return !message;
  };

  const fields = Array.from(form.elements).filter(
    (element) => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement
  );

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isValid = fields.every((field) => validateField(field));

    if (!isValid) {
      const firstInvalid = fields.find((field) => field.getAttribute("aria-invalid") === "true");
      firstInvalid?.focus();
      if (status) {
        status.textContent = "Please check the highlighted fields.";
      }
      return;
    }

    form.reset();
    fields.forEach((field) => setFieldError(field, ""));

    if (status) {
      status.textContent = "Thanks. Your enquiry is ready for the next step in this static demo.";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initHeaderScroll();
  initSmoothScroll();
  initHashScrollCorrection();
  initRevealAnimations();
  initContactForm();
});
