/* ========================================
   Navbar: scroll shadow + mobile toggle
   ======================================== */
const navbar = document.getElementById("navbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("open");
  navLinks.classList.toggle("open");
  document.body.style.overflow = navLinks.classList.contains("open")
    ? "hidden"
    : "";
});

// Close mobile menu on link click
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.classList.remove("open");
    navLinks.classList.remove("open");
    document.body.style.overflow = "";
  });
});

// Close mobile menu on outside tap
document.addEventListener("click", (e) => {
  if (
    navLinks.classList.contains("open") &&
    !navLinks.contains(e.target) &&
    !navToggle.contains(e.target)
  ) {
    navToggle.classList.remove("open");
    navLinks.classList.remove("open");
    document.body.style.overflow = "";
  }
});

/* ========================================
   Typing animation (hero role)
   ======================================== */
const roles = [
  "Software Engineer",
  "React / React Native Dev",
  "JavaScript / TypeScript Dev",
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedEl = document.getElementById("typed-text");

function type() {
  const current = roles[roleIndex];

  if (isDeleting) {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 60 : 90;

  if (!isDeleting && charIndex === current.length) {
    delay = 2200; // pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 400;
  }

  setTimeout(type, delay);
}

// Start typing after a short delay
setTimeout(type, 800);

/* ========================================
   Scroll reveal with IntersectionObserver
   ======================================== */
const revealEls = document.querySelectorAll(".reveal");

const isMobile = window.matchMedia("(max-width: 700px)").matches;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: isMobile ? 0.05 : 0.12 },
);

revealEls.forEach((el) => observer.observe(el));

/* ========================================
   Active nav link on scroll
   ======================================== */
const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-links a[href^='#']");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navItems.forEach((a) => {
          a.style.color = "";
          if (a.getAttribute("href") === `#${entry.target.id}`) {
            a.style.color = "var(--accent)";
          }
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" },
);

sections.forEach((s) => sectionObserver.observe(s));
