// script.js — frontend interactions + animations
document.addEventListener("DOMContentLoaded", () => {
  const navBtns = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".section");
  navBtns.forEach(b => b.addEventListener("click", (e) => {
    navBtns.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    const target = b.dataset.section;
    sections.forEach(s => s.classList.toggle("active", s.id === "content-" + target));
  }));

  // theme toggle (simple class)
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    if (document.body.classList.contains("light")) {
      document.documentElement.style.setProperty('--bg-1', '#f6f8ff');
      document.documentElement.style.setProperty('--bg-2', '#e6eefc');
      document.documentElement.style.setProperty('--muted', '#274059');
      document.documentElement.style.setProperty('--accent-b', '#064e63');
      themeToggle.textContent = '☀️';
    } else {
      // restore via reload for simplicity
      location.reload();
    }
  });

  // Deploy form
  const deployForm = document.getElementById("deployForm");
  const pairingBox = document.getElementById("pairingBox");
  const pairingCodeEl = document.getElementById("pairingCode");
  const logsEl = document.getElementById("logs");
  let pollTimer = null;
  let currentNumber = null;

  deployForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const number = document.getElementById("number").value.trim();
    const owner = document.getElementById("owner").value.trim();
    const prefix = document.getElementById("prefix").value;
    const sudo = document.getElementById("sudo").value.trim();
    const mode = document.getElementById("mode").value;

    if (!number) { alert("Entrez un numéro WhatsApp"); return; }

    pairingBox.classList.add("hidden");
    pairingCodeEl.textContent = "Génération en cours…";
    logsEl.textContent = "Démarrage de la session…";

    // call backend
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number, owner, prefix, sudo: sudo ? sudo.split(",").map(s => s.trim()) : [], mode
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");

      currentNumber = number;
      pairingBox.classList.remove("hidden");
      // poll status logs
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(async () => {
        try {
          const st = await fetch(`/api/status/${encodeURIComponent(number)}`);
          if (!st.ok) return;
          const data = await st.json();
          logsEl.textContent = data.logs.map(l => `[${new Date(l.ts).toLocaleTimeString()}] ${l.type}: ${l.text.trim()}`).join("\n");

          // parse pairing code in logs
          const combined = data.logs.map(l => l.text).join("\n");
          const m = combined.match(/__PAIRING_CODE__:([^\s\n\r]+)/);
          if (m) {
            pairingCodeEl.textContent = m[1];
          }
        } catch (e) {
          console.error(e);
        }
      }, 1500);
    } catch (err) {
      logsEl.textContent = "Erreur : " + err.message;
    }
  });

  // quick stop button
  document.getElementById("stopSession").addEventListener("click", async () => {
    if (!currentNumber) return alert("Pas de session en cours");
    await fetch("/api/stop", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ number: currentNumber }) });
    logsEl.textContent += "\nStop demandé.";
    if (pollTimer) clearInterval(pollTimer);
  });

  // open sessions
  document.getElementById("openSessions").addEventListener("click", async () => {
    const res = await fetch("/api/list");
    const json = await res.json();
    const listArea = document.getElementById("sessionList");
    if (!json.length) { listArea.innerHTML = "Aucune session en cours."; return; }
    listArea.innerHTML = json.map(s => `<div class="session-item"><div><strong>${s.id}</strong><div class="muted">${s.running ? 'Running' : 'Stopped'}</div></div><div>${s.running ? '<button class="btn-danger" onclick="window.stopSession(\''+s.id+'\')">Stop</button>' : ''}</div></div>`).join("");
  });
});

// helper global to stop by session id (inlined simple)
window.stopSession = async (id) => {
  await fetch("/api/stop", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ number: id }) });
  alert("Stop demandé pour " + id);
};