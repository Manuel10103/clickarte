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
   CORS
   - Local: Live Server
   - Prod: tu dominio de Render
========================= */
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // <-- pon aquí tu URL de Render (env)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   SESSION
========================= */
app.set("trust proxy", 1); // IMPORTANTE en Render (proxy)

app.use(
  session({
    secret: process.env.SESSION_SECRET || "clickarte_secret_dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // en Render será https
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

    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    req.session.user = {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      role: user.role,
    };

    return res.json({ ok: true, user: req.session.user });
  } catch {
    return res.status(500).json({ error: "Error interno" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: "Faltan campos" });

    await User.create({
      nombre,
      email: email.toLowerCase().trim(),
      password,
      role: "USER",
    });

    return res.json({ ok: true });
  } catch (e) {
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
   START (Render usa PORT)
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Backend en puerto:", PORT));
