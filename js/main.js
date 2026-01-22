// ========= SETTINGS -> CONTACTO =========
async function loadSiteSettingsIntoContact() {
  // Solo ejecutar si estamos en contacto.html (porque existe el form)
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  try {
    const res = await fetch(`${window.API_BASE}/api/settings`);
    const data = await res.json().catch(() => ({}));
    const s = data.settings || null;

    if (!s) return; // si aún no hay settings guardados, no pasa nada

    // Especialidades
    const esp = document.getElementById("contactEspecialidades");
    if (esp && s.especialidades) esp.textContent = s.especialidades;

    // Ubicación
    const ubi = document.getElementById("contactUbicacion");
    if (ubi && s.ubicacion) ubi.textContent = s.ubicacion;

    // Instagram
    const ig = document.getElementById("contactInstagram");
    if (ig && s.instagram) ig.textContent = s.instagram.startsWith("@") ? s.instagram : `@${s.instagram}`;

    // Link de WhatsApp
    const wa = document.getElementById("whatsappLink");
    if (wa) {
      const tel = String(s.telefonoWhatsApp || "").replace(/\s+/g, "");
      if (tel) {
        const texto = encodeURIComponent(
          "Hola Jessica, estoy interesad@ en una sesión de ....\n¿Me mandas información?"
        );
        wa.href = `https://wa.me/${tel}?text=${texto}`;
      } else {
        wa.href = "#";
      }
    }

    // Aviso web (opcional)
    const aviso = document.getElementById("contactAviso");
    if (aviso) {
      if (s.avisoWeb) {
        aviso.style.display = "block";
        aviso.textContent = s.avisoWeb;
      } else {
        aviso.style.display = "none";
        aviso.textContent = "";
      }
    }
  } catch (e) {
    console.warn("No se pudieron cargar los settings:", e);
  }
}

loadSiteSettingsIntoContact();


const form = document.getElementById("contactForm");
const message = document.getElementById("formMessage");

if (form && message) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const texto = document.getElementById("mensaje")?.value.trim();

    message.className = "";
    message.style.display = "block";

    if (!nombre || !email || !texto) {
      message.textContent = "Por favor, rellena todos los campos.";
      message.classList.add("error");
      return;
    }

    try {
      const res = await fetch(`${window.API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, mensaje: texto }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        message.textContent = data.error || "No se pudo enviar el mensaje.";
        message.classList.add("error");
        return;
      }

      message.textContent = "Mensaje enviado correctamente.";
      message.classList.add("success");
      form.reset();
    } catch (err) {
      console.error(err);
      message.textContent = "No se pudo conectar con el servidor.";
      message.classList.add("error");
    }
  });
}


const track = document.querySelector(".carousel-track");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");
const dotsContainer = document.querySelector(".carousel-dots");
const carousel = document.querySelector(".carousel");

if (track && prevBtn && nextBtn && dotsContainer && carousel) {
  const slides = Array.from(track.querySelectorAll("img"));
  let current = 0;
  let intervalId = null;

  function updateCarousel() {
    track.style.transform = `translateX(-${current * 100}%)`;

    const dots = dotsContainer.querySelectorAll("button");
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    updateCarousel();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function buildDots() {
    dotsContainer.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.addEventListener("click", () => {
        goTo(i);
        restartAuto();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function startAuto() {
    intervalId = setInterval(next, 8000);
  }

  function stopAuto() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  function restartAuto() {
    stopAuto();
    startAuto();
  }


  if (slides.length > 0) {
    buildDots();
    updateCarousel();
    startAuto();

    nextBtn.addEventListener("click", () => { next(); restartAuto(); });
    prevBtn.addEventListener("click", () => { prev(); restartAuto(); });

    // Pausa al pasar el ratón
    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);
  }
}
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

const portfolioImgs = document.querySelectorAll(".portfolio-img");

if (lightbox && lightboxImg && lightboxClose && portfolioImgs.length) {
  portfolioImgs.forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightbox.classList.add("open");
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}