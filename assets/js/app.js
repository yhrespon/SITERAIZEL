// app.js - interactions for RAIZEL TECH
// particles init
if(window.particlesJS){
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
              speed: 2,
              out_mode: "bounce"
          }
      },
      interactivity: {
          events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } }
      }
  });
}

// simple hamburger
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if(hamburger){
  hamburger.addEventListener('click',()=>{
    nav.classList.toggle('open');
  });
}

// simple scroll reveal
const sr_items = document.querySelectorAll('.card, .project-card, .service-intro, .hero-content');
const srObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('reveal');
    }
  });
},{threshold:0.12});
sr_items.forEach(i=>srObserver.observe(i));

// smooth anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    e.preventDefault();
    const id = this.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth'});
  });
});
