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
   Sirve: /index.html, /sobre-mi.html, etc.
========================= */
app.use(express.static(path.join(__dirname, "..")));

/* =========================
   CORS (para Live Server + backend con session cookie)
========================= */
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Permite llamadas sin origin (Postman, etc.)
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
app.use(
  session({
    secret: "clickarte_secret_dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax", // en local va bien
      // secure: true, // solo cuando estés en https en producción
    },
  })
);

/* =========================
   MONGO (LOCAL o ATLAS)
   - Si pones MONGO_URI en .env, usará Atlas.
   - Si no, usa local.
========================= */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/clickarte";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Mongo conectado"))
  .catch((e) => console.error("❌ Error Mongo:", e.message));

/* =========================
   MODELO USER (con createdAt/updatedAt)
========================= */
const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true, required: true },
    password: { type: String, required: true }, // ⚠️ sin hash (prácticas)
    role: { type: String, enum: ["USER", "ADMIN", "JESSICA"], default: "USER" },
  },
  { collection: "users", timestamps: true }
);

const User = mongoose.model("User", userSchema);

/* =========================
   HELPERS AUTH / ROLES
========================= */
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "No autorizado" });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: "No autorizado" });
    if (!roles.includes(req.session.user.role))
      return res.status(403).json({ error: "No tienes permisos" });
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
// LOGIN
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
  } catch (e) {
    return res.status(500).json({ error: "Error interno" });
  }
});

// REGISTER (crea USER)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    await User.create({
      nombre,
      email: email.toLowerCase().trim(),
      password,
      role: "USER",
    });

    return res.json({ ok: true });
  } catch (e) {
    if (String(e).includes("E11000")) {
      return res.status(409).json({ error: "Ese email ya existe" });
    }
    return res.status(500).json({ error: "Error interno" });
  }
});

// QUIÉN SOY
app.get("/api/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

// LOGOUT
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

/* =========================
   ADMIN / PANEL
========================= */
// ADMIN: ver usuarios (sin password)
app.get("/api/admin/users", requireRole("ADMIN"), async (req, res) => {
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
  res.json({ users });
});

// Panel Jessica (o Admin)
app.get("/api/panel", requireRole("JESSICA", "ADMIN"), (req, res) => {
  res.json({ ok: true, msg: "Panel autorizado" });
});

/* =========================
   START
========================= */
app.listen(3000, () => console.log("🚀 Backend: http://localhost:3000"));
