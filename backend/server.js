// backend/server.js
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   FRONTEND (carpeta raíz)
========================= */
app.use(express.static(path.join(__dirname, "..")));

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   CORS
   - Local: Live Server
   - Prod: Render (y/o tu FRONTEND_URL)
========================= */
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://clickarte.onrender.com",
  process.env.FRONTEND_URL, // si tu frontend está en Vercel, pon aquí esa URL exacta
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // requests sin Origin (Postman/Server-to-server)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      // En vez de lanzar Error (que puede acabar como 500),
      // devolvemos "false" y el navegador bloqueará por CORS sin petar el servidor.
      return cb(null, false);
    },
    credentials: true,
  })
);

/* =========================
   SESSION
========================= */
app.set("trust proxy", 1); // IMPORTANTE en Render (proxy)

app.use(
  session({
    name: "clickarte.sid",
    secret: process.env.SESSION_SECRET || "clickarte_secret_dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Si TODO va en el mismo dominio (clickarte.onrender.com) -> "lax" OK
      sameSite: "lax",

      // Si tu frontend está en OTRO dominio (ej Vercel) y quieres cookies cross-site:
      // sameSite: "none",

      // En producción en Render es https, así que secure debe ser true
      secure: process.env.NODE_ENV === "production",

      // Opcional
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    },
  })
);

/* =========================
   MONGO (LOCAL o ATLAS)
========================= */
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/clickarte";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Mongo conectado"))
  .catch((e) => console.error("❌ Error Mongo:", e.message));

/* =========================
   MODELO USER (timestamps)
========================= */
const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN", "JESSICA"], default: "USER" },
  },
  { collection: "users", timestamps: true }
);

const User = mongoose.model("User", userSchema);

/* =========================
   HELPERS AUTH / ROLES
========================= */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: "No autorizado" });
    if (!roles.includes(req.session.user.role)) return res.status(403).json({ error: "No tienes permisos" });
    next();
  };
}

/* =========================
   RUTA DEFAULT
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

/* =========================
   AUTH
========================= */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = String(email || "").toLowerCase().trim();
    const cleanPassword = String(password || "");

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user || user.password !== cleanPassword) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    req.session.user = {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      role: user.role,
    };

    return res.json({ ok: true, user: req.session.user });
  } catch (e) {
    console.error("❌ LOGIN ERROR:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const cleanNombre = String(nombre || "").trim();
    const cleanEmail = String(email || "").toLowerCase().trim();
    const cleanPassword = String(password || "");

    if (!cleanNombre || !cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    await User.create({
      nombre: cleanNombre,
      email: cleanEmail,
      password: cleanPassword,
      role: "USER",
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("❌ REGISTER ERROR:", e);
    if (String(e).includes("E11000")) return res.status(409).json({ error: "Ese email ya existe" });
    return res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

/* =========================
   ADMIN / PANEL
========================= */
app.get("/api/admin/users", requireRole("ADMIN"), async (req, res) => {
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
  res.json({ users });
});

app.get("/api/panel", requireRole("JESSICA", "ADMIN"), (req, res) => {
  res.json({ ok: true, msg: "Panel autorizado" });
});

/* =========================
   ERROR HANDLER (para ver motivos reales en logs)
========================= */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({ error: err.message || "Error interno" });
});

/* =========================
   START (Render usa PORT)
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Backend en puerto:", PORT));
