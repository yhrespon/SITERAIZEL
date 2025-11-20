/* ---------------------------------------------------
   RAIZEL TECH — ANIMATION PARTICLES
----------------------------------------------------*/

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let w, h;
function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const particles = [];
const maxParticles = 90;

class Particle{
  constructor(){
    this.x = Math.random()*w;
    this.y = Math.random()*h;
    this.vx = (Math.random()-.5)*0.6;
    this.vy = (Math.random()-.5)*0.6;
    this.size = Math.random()*2.2 + 1.1;
  }
  move(){
    this.x += this.vx;
    this.y += this.vy;

    if(this.x < 0 || this.x > w) this.vx *= -1;
    if(this.y < 0 || this.y > h) this.vy *= -1;
  }
  draw(){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fillStyle = "rgba(0,255,122,0.8)";
    ctx.shadowColor = "#00ff7a";
    ctx.shadowBlur = 12;
    ctx.fill();
  }
}

for(let i=0;i<maxParticles;i++){
  particles.push(new Particle());
}

function animate(){
  ctx.clearRect(0,0,w,h);

  for(let p of particles){
    p.move();
    p.draw();
  }

  // Lines between particles
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      let dx = particles[i].x - particles[j].x;
      let dy = particles[i].y - particles[j].y;
      let dist = Math.sqrt(dx*dx+dy*dy);

      if(dist < 150){
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,255,122,"+(1 - dist/150)+")";
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();
