// ODTÜ VT — etkileşim katmanı (kütüphanesiz)

// Mobil menü
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    document.body.style.overflow = open ? "hidden" : "";
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
}

// Kaydırmada görünme — hafif, tek seferlik
const revealables = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add("visible"));
}

// Form gönderimi — data-api özniteliği olan tüm formlar
document.querySelectorAll("form[data-api]").forEach((form) => {
  const feedback = form.querySelector(".form-feedback");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const payload = Object.fromEntries(new FormData(form).entries());

    feedback.textContent = "";
    feedback.className = "form-feedback";
    button.disabled = true;

    try {
      const res = await fetch(form.dataset.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        feedback.textContent = data.message;
        feedback.classList.add("ok");
        form.reset();
      } else {
        feedback.textContent = data.error || "Bir şeyler ters gitti. Tekrar deneyin.";
        feedback.classList.add("err");
      }
    } catch {
      feedback.textContent = "Bağlantı kurulamadı. Tekrar deneyin.";
      feedback.classList.add("err");
    } finally {
      button.disabled = false;
    }
  });
});
