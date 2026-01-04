const API_BASE = "http://localhost:3000";

function showMsg(el, text, type) {
  el.className = "";
  el.style.display = "block";
  el.textContent = text;
  el.classList.add(type); // error/success
}

async function getMe() {
  const res = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
  const data = await res.json();
  return data.user;
}

async function loadUsers() {
  const tbody = document.getElementById("usersTbody");
  const msg = document.getElementById("adminMessage");

  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, { credentials: "include" });
    const data = await res.json();

    if (!res.ok) {
      showMsg(msg, data.error || "No autorizado.", "error");
      return;
    }

    tbody.innerHTML = "";
    data.users.forEach(u => {
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

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
  window.location.href = "login.html";
});

(async () => {
  const user = await getMe();

  if (!user) return (window.location.href = "login.html");
  if (user.role !== "ADMIN") return (window.location.href = "index.html");

  document.getElementById("adminWelcome").textContent = `Hola, ${user.nombre} (ADMIN)`;
  loadUsers();
})();
