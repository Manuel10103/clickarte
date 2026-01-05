const API_BASE = "";

// Helper para mensajes sin alerts
function showMsg(el, text, type) {
  if (!el) return;
  el.className = "";
  el.style.display = "block";
  el.textContent = text;
  el.classList.add(type); // "error" o "success"
}

// ========= LOGIN =========
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const msg = document.getElementById("loginMessage");

    if (!email || !password) {
      showMsg(msg, "Rellena email y contraseña.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMsg(msg, data.error || "Error al iniciar sesión.", "error");
        return;
      }

      showMsg(msg, "Login correcto. Redirigiendo...", "success");

      // Redirección por rol
      const role = data.user?.role;
      setTimeout(() => {
        if (role === "ADMIN") window.location.href = "admin.html";
        else if (role === "JESSICA") window.location.href = "panel-jessica.html";
        else window.location.href = "index.html";
      }, 600);

    } catch (err) {
      showMsg(msg, "No se pudo conectar con el servidor.", "error");
    }
  });
}

// ========= REGISTER =========
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("registerNombre").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const msg = document.getElementById("registerMessage");

    if (!nombre || !email || !password) {
      showMsg(msg, "Por favor, rellena todos los campos.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMsg(msg, data.error || "Error al registrarte.", "error");
        return;
      }

      showMsg(msg, "Cuenta creada. Ahora inicia sesión.", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 800);

    } catch (err) {
      showMsg(msg, "No se pudo conectar con el servidor.", "error");
    }
  });
}
