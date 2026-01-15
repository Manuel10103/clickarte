function showMsg(el, text, type) {
  if (!el) return;
  el.className = "";
  el.style.display = "block";
  el.textContent = text;
  el.classList.add(type); // error/success
}

async function getMe() {
  const res = await fetch(`${window.API_BASE}/api/me`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  return data.user || null;
}

async function loadUsers() {
  const tbody = document.getElementById("usersTbody");
  const msg = document.getElementById("adminMessage");

  try {
    const res = await fetch(`${window.API_BASE}/api/admin/users`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      showMsg(msg, data.error || "No autorizado.", "error");
      return;
    }

    if (!tbody) return;
    tbody.innerHTML = "";

    (data.users || []).forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.nombre || "-"}</td>
        <td>${u.email || "-"}</td>
        <td>${u.role || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    showMsg(msg, "No se pudo cargar la lista de usuarios.", "error");
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
  if (user.role !== "ADMIN") return (window.location.href = "index.html");

  const welcome = document.getElementById("adminWelcome");
  if (welcome) welcome.textContent = `Hola, ${user.nombre} (ADMIN)`;

  loadUsers();
})();
