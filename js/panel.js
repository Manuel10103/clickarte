async function getMe() {
  const res = await fetch(`${window.API_BASE}/api/me`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  return data.user || null;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadMessages() {
  const list = document.getElementById("messagesList");
  const msg = document.getElementById("messagesMsg");

  if (!list) return; 

  try {
    if (msg) msg.textContent = "Cargando mensajes...";

    const res = await fetch(`${window.API_BASE}/api/messages`, {
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (msg) msg.textContent = data.error || "No autorizado.";
      return;
    }

    const messages = data.messages || [];

    if (messages.length === 0) {
      if (msg) msg.textContent = "";
      list.innerHTML = "<p>No hay mensajes todavía.</p>";
      return;
    }

    if (msg) msg.textContent = "";

    list.innerHTML = messages
      .map((m) => {
        const fecha = m.createdAt ? new Date(m.createdAt).toLocaleString() : "";
        return `
          <div class="msg-card">
            <div><strong>${escapeHtml(m.nombre)}</strong> — ${escapeHtml(m.email)}</div>
            <div style="opacity:.8;font-size:.9em;">${escapeHtml(fecha)}</div>
            <p>${escapeHtml(m.mensaje)}</p>
          </div>
        `;
      })
      .join("");
  } catch (e) {
    if (msg) msg.textContent = "No se pudieron cargar los mensajes.";
  }
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await fetch(`${window.API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "login.html";
  });
}

(async () => {
  const user = await getMe();

  if (!user) return (window.location.href = "login.html");
  if (user.role !== "JESSICA" && user.role !== "ADMIN") {
    return (window.location.href = "index.html");
  }

  const welcome = document.getElementById("jessicaWelcome");
  if (welcome) welcome.textContent = `Hola, ${user.nombre} (${user.role})`;

  // ✅ cargar mensajes
  loadMessages();
})();
