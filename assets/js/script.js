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

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var trackLeft = track.getBoundingClientRect().left;
        var pos = trackLeft + track.offsetWidth * 0.3;
        var activeIndex = 0;
        items.forEach(function (item, i) {
          if (item.getBoundingClientRect().left <= pos) activeIndex = i;
        });
        Array.from(dots.children).forEach(function (b, i) {
          b.classList.toggle("active", i === activeIndex);
        });
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener("resize", build);
  });
})();
