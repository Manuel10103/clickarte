
async function getMe() {
  const res = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
  const data = await res.json();
  return data.user;
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
  window.location.href = "login.html";
});

(async () => {
  const user = await getMe();

  if (!user) return (window.location.href = "login.html");
  if (user.role !== "JESSICA" && user.role !== "ADMIN") return (window.location.href = "index.html");

  document.getElementById("jessicaWelcome").textContent = `Hola, ${user.nombre} (${user.role})`;
})();
