async function getMe() {
  const res = await fetch(`${window.API_BASE}/api/me`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  return data.user || null;
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
})();
