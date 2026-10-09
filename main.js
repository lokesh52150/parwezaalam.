/* =========================================================
   Parwez Aalam — Portfolio interactions
   Vanilla JS, no dependencies
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + progress bar ---------- */
  var nav = document.getElementById("nav");
  var progressBar = document.getElementById("progressBar");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;

    if (nav) nav.classList.toggle("is-scrolled", y > 24);

    if (progressBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = h > 0 ? (y / h) * 100 + "%" : "0%";
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = false;
    // let the browser register the element before transitioning
    requestAnimationFrame(function () {
      menu.classList.toggle("is-open", open);
    });
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      setTimeout(function () {
        if (!menu.classList.contains("is-open")) menu.hidden = true;
      }, 450);
    }
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
    });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (l) {
          l.classList.toggle("is-active", l.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || prefersReduced) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1600;
    var start = null;

    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".stat__num");
  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObserver.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = (c.getAttribute("data-count") || "") + (c.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- Skill bars ---------- */
  var skillCards = document.querySelectorAll(".skill-card");

  skillCards.forEach(function (card) {
    card.querySelectorAll(".bars b").forEach(function (bar) {
      var level = parseInt(bar.getAttribute("data-level"), 10) || 0;
      bar.style.setProperty("--w", level + "%");

      var label = bar.parentElement.querySelector("span");
      if (label) {
        var pct = document.createElement("i");
        pct.textContent = level + "%";
        label.appendChild(pct);
      }
    });
  });

  if ("IntersectionObserver" in window) {
    var barObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    skillCards.forEach(function (c) { barObserver.observe(c); });
  } else {
    skillCards.forEach(function (c) { c.classList.add("is-visible"); });
  }

  /* ---------- Skill card pointer glow ---------- */
  if (!prefersReduced && window.matchMedia("(hover: hover)").matches) {
    skillCards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------- Project filter ---------- */
  var filters = document.querySelectorAll(".filter");
  var projects = document.querySelectorAll(".project");

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-filter");

      filters.forEach(function (f) {
        var active = f === btn;
        f.classList.toggle("is-active", active);
        f.setAttribute("aria-selected", String(active));
      });

      projects.forEach(function (p) {
        var match = value === "all" || p.getAttribute("data-category") === value;
        p.classList.toggle("is-hidden", !match);
        if (match) {
          p.classList.add("is-visible");
          p.style.opacity = "";
        }
      });
    });
  });

  /* ---------- Role rotator ---------- */
  var track = document.getElementById("roleTrack");
  if (track && !prefersReduced) {
    var count = track.children.length;
    var index = 0;
    setInterval(function () {
      index = (index + 1) % count;
      track.style.transform = "translateY(-" + index * 1.5 + "em)";
    }, 2600);
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  function showError(name, message) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) return;
    var wrap = field.closest(".field");
    var err = form.querySelector('.error[data-for="' + name + '"]');
    wrap.classList.toggle("has-error", Boolean(message));
    if (err) err.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var valid = true;

      showError("name", "");
      showError("email", "");
      showError("message", "");

      if (name.length < 2) {
        showError("name", "Please tell me your name.");
        valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        showError("email", "That email doesn't look right.");
        valid = false;
      }
      if (message.length < 10) {
        showError("message", "A few more words would help — 10 characters min.");
        valid = false;
      }

      if (!valid) {
        if (status) status.textContent = "Just a couple of fields need a look.";
        var firstError = form.querySelector(".has-error input, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      var subject = form.subject.value.trim() || "Hello from your portfolio";
      var body =
        "Hi Parwez,\n\n" + message + "\n\n— " + name + "\n" + email;

      window.location.href =
        "mailto:hello@parwezalam.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      if (status) {
        status.textContent =
          "Thanks " + name.split(" ")[0] + " — your mail app is opening. If nothing happened, email hello@parwezalam.com directly.";
      }
      form.reset();
    });

    // clear a field's error as soon as the user fixes it
    form.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.name) showError(field.name, "");
        if (status) status.textContent = "";
      });
    });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }
})();
