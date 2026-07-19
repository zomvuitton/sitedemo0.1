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

// Tema anahtarı — tercih localStorage'da tutulur, ilk uygulama head'deki inline script'te
const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
  const applyTheme = (dark) => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    themeBtn.setAttribute("aria-label", dark ? "Açık temaya geç" : "Koyu temaya geç");
  };
  applyTheme(document.documentElement.dataset.theme === "dark");
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    applyTheme(dark);
    try {
      localStorage.setItem("vt-theme", dark ? "dark" : "light");
    } catch {}
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

// İstatistik sayaçları: görünür olunca 0'dan değere doğru sayar
const statEls = document.querySelectorAll(".stat dd");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (statEls.length && !reducedMotion && "IntersectionObserver" in window) {
  const animateStat = (el) => {
    const raw = el.textContent.trim();
    const m = raw.match(/\d[\d.]*/);
    if (!m) return;
    const target = parseInt(m[0].replace(/\./g, ""), 10);
    const prefix = raw.slice(0, m.index);
    const suffix = raw.slice(m.index + m[0].length);
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString("tr-TR") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        statIo.unobserve(entry.target);
        animateStat(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  statEls.forEach((el) => statIo.observe(el));
}

// Ekibimiz: kayan ızgara — yalnızca imlecin altı aydınlanır
const gridHero = document.querySelector(".grid-reveal-hero");
if (gridHero) {
  const layer = gridHero.querySelector(".grid-reveal");
  const setSpot = (x, y) => {
    layer.style.setProperty("--mx", x + "px");
    layer.style.setProperty("--my", y + "px");
  };
  if (window.matchMedia("(hover: hover)").matches) {
    gridHero.addEventListener("pointermove", (e) => {
      const r = layer.getBoundingClientRect();
      setSpot(e.clientX - r.left, e.clientY - r.top);
    });
    gridHero.addEventListener("pointerleave", () => setSpot(-9999, -9999));
  } else if (!reducedMotion) {
    // Dokunmatik cihazlarda imleç yok: ışık kendi kendine yavaşça gezinir
    const roam = (t) => {
      const r = layer.getBoundingClientRect();
      setSpot(
        r.width * (0.5 + 0.4 * Math.sin(t / 2600)),
        r.height * (0.5 + 0.35 * Math.cos(t / 3400))
      );
      requestAnimationFrame(roam);
    };
    requestAnimationFrame(roam);
  }
}

// Proje kapak görseli: geriye yatık başlar, kaydırdıkça düzleşip yerine oturur
const tiltEl = document.querySelector(".scroll-tilt");
if (tiltEl && !reducedMotion) {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const maxRot = isMobile ? 14 : 20;
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = tiltEl.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0: görselin üstü ekranın altında — 1: görsel ekranın üst yarısına vardı
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
    const eased = 1 - Math.pow(1 - p, 2);
    tiltEl.style.transform =
      "rotateX(" + maxRot * (1 - eased) + "deg) scale(" + (1.05 - 0.05 * eased) + ")";
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
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
