async function getMe() {
  const res = await fetch(`${window.API_BASE}/api/me`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  return data.user || null;
}

async function loadSettings() {
  const msg = document.getElementById("settingsMsg");

  try {
    const res = await fetch(`${window.API_BASE}/api/settings`);
    const data = await res.json().catch(() => ({}));

    const s = data.settings || {};
    document.getElementById("telefonoWhatsApp").value = s.telefonoWhatsApp || "";
    document.getElementById("instagram").value = s.instagram || "";
    document.getElementById("ubicacion").value = s.ubicacion || "";
    document.getElementById("especialidades").value = s.especialidades || "";
    document.getElementById("emailContacto").value = s.emailContacto || "";
    document.getElementById("avisoWeb").value = s.avisoWeb || "";

    if (msg) msg.textContent = "";
  } catch {
    if (msg) msg.textContent = "No se pudieron cargar los ajustes.";
  }
}

async function saveSettings(payload) {
  const res = await fetch(`${window.API_BASE}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al guardar");
  return data.settings;
}

(async () => {
  const user = await getMe();
  if (!user) return (window.location.href = "login.html");
  if (user.role !== "JESSICA" && user.role !== "ADMIN") return (window.location.href = "index.html");

  await loadSettings();

  const form = document.getElementById("settingsForm");
  const msg = document.getElementById("settingsMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "Guardando...";

    const payload = {
      telefonoWhatsApp: document.getElementById("telefonoWhatsApp").value.trim(),
      instagram: document.getElementById("instagram").value.trim(),
      ubicacion: document.getElementById("ubicacion").value.trim(),
      especialidades: document.getElementById("especialidades").value.trim(),
      emailContacto: document.getElementById("emailContacto").value.trim(),
      avisoWeb: document.getElementById("avisoWeb").value.trim(),
    };

    try {
      await saveSettings(payload);
      if (msg) msg.textContent = "✅ Ajustes guardados.";
    } catch (err) {
      if (msg) msg.textContent = "❌ " + (err.message || "No se pudo guardar.");
    }
  });
})();
