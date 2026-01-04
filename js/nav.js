const API_BASE = "http://localhost:3000";

async function getMe() {
  try {
    const res = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

(async () => {
  const panelLink = document.getElementById("panelLink");
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");

  const user = await getMe();

  if (user) {
    // Mostrar Panel y Salir
    if (panelLink) {
      panelLink.style.display = "inline";
      panelLink.href = user.role === "ADMIN"
        ? "admin.html"
        : (user.role === "JESSICA" ? "panel-jessica.html" : "index.html");
    }
    if (logoutLink) logoutLink.style.display = "inline";
    if (loginLink) loginLink.style.display = "none";
  } else {
    // Mostrar Login
    if (loginLink) loginLink.style.display = "inline";
    if (panelLink) panelLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "none";
  }

  // Logout
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "login.html";
    });
  }
})();
