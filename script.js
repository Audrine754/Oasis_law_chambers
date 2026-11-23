document.documentElement.classList.add("js");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 1. Header turns into frosted glass after scrolling, and the hero background moves slower (parallax)
const header = document.querySelector(".top");
const slidesBox = document.querySelector(".slides");

function onScroll() {
  header.classList.toggle("solid", window.scrollY > 40);
  if (slidesBox && !calm) {
    slidesBox.style.transform = "translateY(" + Math.min(window.scrollY * 0.2, 90) + "px)";
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// 2. Landing slideshow: picture, text and dots change together
const slides = document.querySelectorAll(".slide");
const captions = document.querySelectorAll(".caption");
const dots = document.querySelectorAll(".dot");
const heroBox = document.querySelector(".hero-bg");
let current = 0;
let timer;

function show(next) {
  const target = (next + slides.length) % slides.length;
  if (target === current) return;
  const old = current;
  current = target;
  slides[old].classList.remove("active");
  slides[old].classList.add("leaving");
  setTimeout(() => slides[old].classList.remove("leaving"), 1700);
  captions[old].classList.remove("active");
  dots[old].classList.remove("active");
  slides[current].classList.add("active");
  captions[current].classList.add("active");
  dots[current].classList.add("active");
}

function start() {
  clearInterval(timer);
  if (slides.length > 1 && !calm) timer = setInterval(() => show(current + 1), 7000);
}

if (heroBox && slides.length > 1) {
  dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i); start(); }));

  // pause while the pointer is over the hero, resume when it leaves
  heroBox.addEventListener("mouseenter", () => clearInterval(timer));
  heroBox.addEventListener("mouseleave", start);

  // swipe left or right on a phone to change slide
  let startX = 0, startY = 0;
  heroBox.addEventListener("pointerdown", e => { startX = e.clientX; startY = e.clientY; });
  heroBox.addEventListener("pointerup", e => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(dx < 0 ? current + 1 : current - 1);
      start();
    }
  });

  start();
}

// 3. Fade in on scroll: these elements appear as you scroll down to them
const targets = ".section h2, .section .lead, .grid > div, .team-grid .member, .vm > div, .clients, .band, .split > div, .contact > div, .contact form, .mapwrap, .about-text, .profile > *";

const revealer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      revealer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(targets).forEach(el => {
  if (calm) return;
  const position = Array.from(el.parentNode.children).indexOf(el);
  el.style.transitionDelay = (position % 4) * 0.1 + "s";
  el.classList.add("rv");
  el.addEventListener("transitionend", e => {
    if (e.target !== el) return;
    el.classList.remove("rv", "in");
    el.style.transitionDelay = "";
  }, { once: true });
  revealer.observe(el);
});

// 4. Smooth fade when opening another page
document.addEventListener("click", e => {
  const link = e.target.closest("a[href]");
  if (!link || calm || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (link.target === "_blank" || link.hasAttribute("download")) return;
  const href = link.getAttribute("href");
  if (href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
  if (link.hostname !== window.location.hostname || link.href === window.location.href) return;
  e.preventDefault();
  document.body.classList.add("leaving");
  setTimeout(() => { window.location.href = link.href; }, 250);
});

window.addEventListener("pageshow", () => document.body.classList.remove("leaving"));

// 5. Contact form (only exists on pages with the form): sends the data to contact.php
const form = document.getElementById("contact-form");
const note = document.getElementById("form-msg");

if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();
    note.textContent = "Sending...";
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form) });
      const data = await res.json();
      if (!data.ok) throw new Error("failed");
      note.textContent = "Thank you. We will contact you soon.";
      form.reset();
    } catch (err) {
      note.textContent = "Sorry, your message was not sent. Please call us on 0788 559 143.";
    }
  });
} 
// 6. Statistics: numbers count up when they scroll into view
const counters = document.querySelectorAll(".num");

function countUp(el) {
  const target = Number(el.dataset.target);
  const suffix = el.dataset.suffix || "";
  const duration = 1800;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // starts fast, slows down at the end
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (counters.length && !calm) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(el => {
    el.textContent = "0" + (el.dataset.suffix || "");
    counterObserver.observe(el);
  });
} 
// 7. Phone menu: a menu button appears on small screens
if (header) {
  const menuNav = header.querySelector("nav");
  const burger = document.createElement("button");
  burger.className = "burger";
  burger.setAttribute("aria-label", "Menu");
  burger.setAttribute("aria-expanded", "false");
  header.insertBefore(burger, menuNav);

  const setMenu = open => {
    header.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
  };

  burger.addEventListener("click", () => setMenu(!header.classList.contains("menu-open")));
  menuNav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("click", e => { if (!header.contains(e.target)) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
}