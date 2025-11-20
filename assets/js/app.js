/* =====================================================
   app.js — RAIZEL TECH (VERSION STABLE)
   - Animations d'apparition
   - Navigation mobile
   - Smooth scroll
   - Sans erreurs sur pages sans sections
===================================================== */


/* ---------------------------
   1. SCROLL REVEAL ANIMATION
---------------------------- */
const revealItems = document.querySelectorAll(
    ".service-card, .project-card, .category-card, .contact-card, .intro"
);

if (revealItems.length > 0) {
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
            });
        },
        { threshold: 0.15 }
    );

    revealItems.forEach(item => {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        observer.observe(item);
    });
}


/* ---------------------------
   2. NAVIGATION MOBILE
---------------------------- */
const nav = document.querySelector(".nav");
const hamburger = document.querySelector(".hamburger");

if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
        nav.classList.toggle("nav-open");
    });
}


/* ---------------------------
   3. SMOOTH ANCHOR SCROLL
---------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        const targetID = this.getAttribute("href").substring(1);
        const target = document.getElementById(targetID);

        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});
