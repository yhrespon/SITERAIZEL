/* =====================================================
   app.js — RAIZEL TECH
   Interactions globales du site
   - Particules (si présent)
   - Animation scroll reveal
   - Navigation mobile
   - Scroll smooth
===================================================== */

/* ---------------------------
   1. PARTICLES BACKGROUND
---------------------------- */
if (window.particlesJS && document.getElementById("particles-js")) {
    particlesJS("particles-js", {
        particles: {
            number: { value: 90 },
            color: { value: "#00bfff" },
            shape: { type: "circle" },
            opacity: { value: 0.55 },
            size: { value: 3 },
            line_linked: {
                enable: true,
                color: "#009dff",
                opacity: 0.33,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.1
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
            },
            modes: {
                grab: { distance: 160, line_linked: { opacity: 0.7 } }
            }
        },
        retina_detect: true
    });
}

/* ---------------------------
   2. SCROLL REVEAL (simple)
---------------------------- */
const sr_elements = document.querySelectorAll(".service-card, .project-card, .category-card, .contact-card, .intro");

if (sr_elements.length > 0) {
    const srObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.transform = "translateY(0)";
                e.target.style.opacity = "1";
            }
        });
    }, { threshold: 0.12 });

    sr_elements.forEach(i => {
        i.style.opacity = "0";
        i.style.transform = "translateY(20px)";
        srObserver.observe(i);
    });
}

/* ---------------------------
   3. NAVIGATION MOBILE
---------------------------- */
const nav = document.querySelector(".nav");
const hamburger = document.querySelector(".hamburger");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        nav.classList.toggle("nav-open");
    });
}

/* ---------------------------
   4. SMOOTH ANCHOR LINKS
---------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", function (e) {
        const target = document.getElementById(this.getAttribute("href").slice(1));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});
