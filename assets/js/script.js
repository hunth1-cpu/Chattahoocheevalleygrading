(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  navToggle.addEventListener("click", function () {
    var isOpen = mobileNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobileNav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: "0px 0px -5% 0px" });
  revealEls.forEach(function (el) { io.observe(el); });

  /* Safety net: never leave content permanently hidden. */
  setTimeout(function () {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }, 2000);

  /* ---------- FAQ accordion (collapsed by default) ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");

    q.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      document.querySelectorAll(".faq-item").forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".faq-a").style.maxHeight = "0px";
      });
      if (willOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });

    window.addEventListener("resize", function () {
      if (item.classList.contains("is-open")) a.style.maxHeight = a.scrollHeight + "px";
    });
  });

  /* ---------- Contact form (Netlify Forms, AJAX submit) ---------- */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    var formSuccess = document.getElementById("formSuccess");
    var formError = document.getElementById("formError");
    var submitBtn = contactForm.querySelector("button[type=submit]");
    var submitBtnDefaultText = submitBtn.textContent;

    function encodeForm(form) {
      return Array.from(new FormData(form), function (pair) {
        return encodeURIComponent(pair[0]) + "=" + encodeURIComponent(pair[1]);
      }).join("&");
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      formError.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(contactForm)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Form submission failed");
          contactForm.hidden = true;
          formSuccess.hidden = false;
        })
        .catch(function () {
          formError.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtnDefaultText;
        });
    });
  }

  /* ---------- Generic horizontal swipe carousels with dot indicators ---------- */
  document.querySelectorAll(".hscroll-wrap").forEach(function (wrap) {
    var track = wrap.querySelector(".hscroll");
    var dots = wrap.querySelector(".hdots");
    if (!track || !dots) return;

    var items = Array.from(track.children);
    if (items.length < 2) return;

    function scrollToItem(item) {
      var delta = item.getBoundingClientRect().left - track.getBoundingClientRect().left;
      track.scrollTo({ left: track.scrollLeft + delta, behavior: "smooth" });
    }

    function build() {
      dots.innerHTML = "";
      items.forEach(function (item, i) {
        var b = document.createElement("button");
        if (i === 0) b.classList.add("active");
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", function () { scrollToItem(item); });
        dots.appendChild(b);
      });
    }
    build();

    // The active dot is whichever card's left edge sits closest to the
    // track's left edge. This stays correct even for the last card, which
    // can't always scroll all the way to a perfectly flush position (the
    // scroll container clamps at its max scrollLeft, short of a full
    // snap-width past the second-to-last card).
    function updateActiveDot() {
      var trackLeft = track.getBoundingClientRect().left;
      var closestIndex = 0;
      var closestDist = Infinity;
      items.forEach(function (item, i) {
        var dist = Math.abs(item.getBoundingClientRect().left - trackLeft);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });
      Array.from(dots.children).forEach(function (b, i) {
        b.classList.toggle("active", i === closestIndex);
      });
    }

    // After a fast swipe, the browser's own scroll-snap "settle" animation
    // glides the track the rest of the way to the nearest snap point, and
    // that glide does not reliably fire 'scroll' events in mobile Safari --
    // so a handler that only reacts to 'scroll' can miss the true final
    // position entirely and get stuck on the card before it. Instead, once
    // any interaction starts, poll on every animation frame for a bit so
    // we keep reading the live, current position regardless of whether a
    // 'scroll' event ever fires for it.
    var pollUntil = 0;
    function pollLoop() {
      updateActiveDot();
      if (performance.now() < pollUntil) {
        requestAnimationFrame(pollLoop);
      }
    }
    function kickPoll() {
      var alreadyPolling = performance.now() < pollUntil;
      pollUntil = performance.now() + 600;
      if (!alreadyPolling) requestAnimationFrame(pollLoop);
    }
    track.addEventListener("scroll", kickPoll, { passive: true });
    track.addEventListener("touchstart", kickPoll, { passive: true });
    track.addEventListener("touchmove", kickPoll, { passive: true });
    if ("onscrollend" in window) {
      track.addEventListener("scrollend", updateActiveDot);
    }

    window.addEventListener("resize", function () {
      build();
      updateActiveDot();
    });
  });
})();
