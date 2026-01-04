const form = document.getElementById("contactForm");
const message = document.getElementById("formMessage");

if (form && message) {
  form.addEventListener("submit", function (e) {
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

    message.textContent = "Mensaje enviado correctamente.";
    message.classList.add("success");

    form.reset();
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

  // Init
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
// ========= Lightbox Portfolio =========
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