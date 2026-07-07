(function () {
  "use strict";

  /* ---------- Sticky header shrink/scroll state ---------- */
  var header = document.getElementById("siteHeader");
  var backToTop = document.getElementById("backToTop");

  function onScroll() {
    var scrolled = window.scrollY > 40;
    header.classList.toggle("is-scrolled", scrolled);
    backToTop.classList.toggle("is-visible", window.scrollY > 600);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

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

  /* ---------- Active nav link on scroll ---------- */
  var sections = ["home", "services", "about", "projects", "reviews", "faq", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = document.querySelectorAll(".main-nav a");

  function updateActiveLink() {
    var scrollPos = window.scrollY + 160;
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) current = sec;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();

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

  /* Safety net: never leave content permanently hidden (covers reduced-motion,
     automated screenshot tools, or any missed observer callback). */
  setTimeout(function () {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }, 2000);

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");

    function setHeight() {
      a.style.maxHeight = item.classList.contains("is-open") ? a.scrollHeight + "px" : "0px";
    }
    setHeight();

    q.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      document.querySelectorAll(".faq-item").forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".faq-a").style.maxHeight = "0px";
      });
      if (willOpen) {
        item.classList.add("is-open");
        setHeight();
      }
    });

    window.addEventListener("resize", function () {
      if (item.classList.contains("is-open")) setHeight();
    });
  });

  /* ---------- Testimonial carousel ---------- */
  var track = document.getElementById("reviewTrack");
  var navWrap = document.getElementById("reviewNav");
  var cards = track ? Array.from(track.children) : [];

  function getPerView() {
    if (window.innerWidth <= 1100) return 1;
    return 3;
  }

  var perView = getPerView();
  var pageCount = Math.ceil(cards.length / perView);
  var currentPage = 0;
  var autoplayTimer;

  function buildNav() {
    navWrap.innerHTML = "";
    for (var i = 0; i < pageCount; i++) {
      var b = document.createElement("button");
      if (i === currentPage) b.classList.add("active");
      b.addEventListener("click", function (idx) {
        return function () { goToPage(idx); restartAutoplay(); };
      }(i));
      navWrap.appendChild(b);
    }
  }

  function goToPage(page) {
    currentPage = (page + pageCount) % pageCount;
    var offset = currentPage * 100;
    track.style.transform = "translateX(-" + offset + "%)";
    Array.from(navWrap.children).forEach(function (b, i) {
      b.classList.toggle("active", i === currentPage);
    });
  }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () { goToPage(currentPage + 1); }, 6000);
  }

  function rebuild() {
    perView = getPerView();
    pageCount = Math.ceil(cards.length / perView);
    track.innerHTML = "";
    for (var p = 0; p < pageCount; p++) {
      var page = document.createElement("div");
      page.className = "review-page";
      cards.slice(p * perView, p * perView + perView).forEach(function (card) {
        page.appendChild(card);
      });
      track.appendChild(page);
    }
    currentPage = 0;
    buildNav();
    track.style.transform = "translateX(0%)";
  }

  if (track && cards.length) {
    rebuild();
    restartAutoplay();
    window.addEventListener("resize", function () {
      rebuild();
    });
    track.addEventListener("mouseenter", function () { clearInterval(autoplayTimer); });
    track.addEventListener("mouseleave", restartAutoplay);
  }
})();
