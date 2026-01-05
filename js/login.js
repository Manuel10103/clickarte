// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMessage");

  const show = (text) => {
    if (msg) msg.textContent = text || "";
  };

  if (!form) {
    console.warn("No existe #loginForm en login.html");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    show("");

    const email = document.getElementById("loginEmail")?.value?.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) {
      show("Rellena email y contraseña.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        show(data.error || "No se pudo iniciar sesión.");
        return;
      }

      // Redirección según rol
      const role = data?.user?.role;
      if (role === "ADMIN") {
        window.location.href = "/admin.html";
      } else if (role === "JESSICA") {
        window.location.href = "/panel-jessica.html";
      } else {
        window.location.href = "/index.html";
      }
    } catch (err) {
      console.error(err);
      show("No se pudo conectar al servidor.");
    }
  });
});
