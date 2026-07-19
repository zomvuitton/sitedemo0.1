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

// Hero alt yazısı: daktilo efekti — "/" ile ayrılan kelimeler dönüşümlü yazılır.
// Metin panelden gelir; ilk parçanın son kelimesinden öncesi sabit kalır.
const heroLede = document.getElementById("heroLede");
if (heroLede && heroLede.textContent.includes("/")) {
  const parcalar = heroLede.textContent.split("/").map((s) => s.trim()).filter(Boolean);
  const bosluk = parcalar[0].lastIndexOf(" ");
  const sabit = bosluk === -1 ? "" : parcalar[0].slice(0, bosluk + 1);
  const kelimeler = [parcalar[0].slice(bosluk + 1), ...parcalar.slice(1)];

  if (reducedMotion) {
    heroLede.textContent = sabit + kelimeler.join(" ");
  } else {
    heroLede.textContent = "";

    // Ekran okuyucular animasyonu değil tam metni duyar
    const srMetin = document.createElement("span");
    srMetin.className = "sr-only";
    srMetin.textContent = sabit + kelimeler.join(" ");
    const gorsel = document.createElement("span");
    gorsel.setAttribute("aria-hidden", "true");
    const kelimeEl = document.createElement("span");
    const imlec = document.createElement("span");
    imlec.className = "type-cursor";
    imlec.textContent = "|";
    gorsel.append(sabit, kelimeEl, imlec);
    heroLede.append(srMetin, gorsel);

    const YAZMA = 50, SILME = 30, BEKLEME = 2000;
    let kelimeNo = 0, harf = 0, siliniyor = false;
    const adim = () => {
      const kelime = kelimeler[kelimeNo];
      harf += siliniyor ? -1 : 1;
      kelimeEl.textContent = kelime.slice(0, harf);
      let sure = siliniyor ? SILME : YAZMA;
      if (!siliniyor && harf === kelime.length) {
        siliniyor = true;
        sure = BEKLEME;
      } else if (siliniyor && harf === 0) {
        siliniyor = false;
        kelimeNo = (kelimeNo + 1) % kelimeler.length;
      }
      setTimeout(adim, sure);
    };
    setTimeout(adim, YAZMA);
  }
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
