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

  // Ölçümü olayın içinde değil, önden alıyoruz: pointermove başına
  // getBoundingClientRect layout'u zorlar ve takılmaya yol açar.
  let rect = layer.getBoundingClientRect();
  const remeasure = () => { rect = layer.getBoundingClientRect(); };
  window.addEventListener("resize", remeasure);
  window.addEventListener("scroll", remeasure, { passive: true });

  // Hedef (tx/ty) ile çizilen konum (cx/cy) ayrı. Yazma yalnızca rAF içinde
  // olur; yoksa 120 Hz'lik pointermove maskeyi kare başına defalarca çizdirir.
  let tx = -9999, ty = -9999, cx = -9999, cy = -9999, running = false;

  const draw = () => {
    const dx = tx - cx, dy = ty - cy;
    // Çok uzaktan geliyorsa (ilk giriş / çıkış) yumuşatma yok, doğrudan otursun
    if (Math.abs(dx) > 1500 || Math.abs(dy) > 1500) { cx = tx; cy = ty; }
    else { cx += dx * 0.18; cy += dy * 0.18; }
    layer.style.setProperty("--mx", cx.toFixed(1) + "px");
    layer.style.setProperty("--my", cy.toFixed(1) + "px");
    if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) requestAnimationFrame(draw);
    else running = false;
  };

  const setSpot = (x, y) => {
    tx = x; ty = y;
    if (!running) { running = true; requestAnimationFrame(draw); }
  };

  if (window.matchMedia("(hover: hover)").matches) {
    gridHero.addEventListener("pointermove", (e) => {
      setSpot(e.clientX - rect.left, e.clientY - rect.top);
    });
    gridHero.addEventListener("pointerleave", () => setSpot(-9999, -9999));
  } else if (!reducedMotion) {
    // Dokunmatik cihazlarda imleç yok: ışık kendi kendine yavaşça gezinir
    const roam = (t) => {
      setSpot(
        rect.width * (0.5 + 0.4 * Math.sin(t / 2600)),
        rect.height * (0.5 + 0.35 * Math.cos(t / 3400))
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

// Partner şeritleri: kaydırma hızına tepki veren sonsuz logo akışı.
// Satırlar zıt yönlerde sabit hızla akar; sayfayı kaydırınca hızlanır,
// yukarı kaydırınca yön tersine döner (Motion'ın scroll-text-lines örneği gibi).
const partnerTicker = document.querySelector("[data-partner-ticker]");
if (partnerTicker && !reducedMotion) {
  const rows = [...partnerTicker.querySelectorAll(".ticker-row")].map((row) => {
    const track = row.querySelector(".ticker-track");
    const state = { track, dir: Number(row.dataset.dir) || 1, x: 0, setW: 0 };
    const olc = () => {
      // Şerit iki kopya içerir; döngü tek kopyanın genişliğinde sarılır
      state.setW = track.scrollWidth / 2;
    };
    olc();
    if ("ResizeObserver" in window) new ResizeObserver(olc).observe(track);
    return state;
  });

  let gorunur = false;
  let sonZaman = 0;
  let sonY = window.scrollY;
  let hiz = 0; // yumuşatılmış kaydırma hızı (px/sn)
  let yonKatsayisi = 1;
  const TABAN = 36; // px/sn — boştaki akış hızı

  const dongu = (now) => {
    if (!gorunur) return;
    const dt = sonZaman ? Math.min(0.05, (now - sonZaman) / 1000) : 0.016;
    sonZaman = now;

    const y = window.scrollY;
    const anlik = dt > 0 ? (y - sonY) / dt : 0;
    sonY = y;
    hiz += (anlik - hiz) * 0.12;

    // Belirgin bir kaydırma varsa akış yönü ona uyar
    if (hiz < -60) yonKatsayisi = -1;
    else if (hiz > 60) yonKatsayisi = 1;

    const carpan = 1 + Math.min(5, Math.abs(hiz) / 250);
    rows.forEach((r) => {
      if (!r.setW) return;
      r.x = (((r.x + r.dir * yonKatsayisi * TABAN * carpan * dt) % r.setW) + r.setW) % r.setW;
      r.track.style.transform = "translateX(" + -r.x + "px)";
    });
    requestAnimationFrame(dongu);
  };

  // Ekranda değilken hiç çalışmasın
  new IntersectionObserver(
    (entries) => {
      const v = entries[0].isIntersecting;
      if (v && !gorunur) {
        gorunur = true;
        sonZaman = 0;
        sonY = window.scrollY;
        requestAnimationFrame(dongu);
      } else if (!v) {
        gorunur = false;
      }
    },
    { threshold: 0.05 }
  ).observe(partnerTicker);
}

// Projeler girişi: bölümün ortasından geçen dalga çizgileri.
// Sayfa açılırken enerji tam — çizgiler hızlı ve geniş dalgalanır; enerji
// sönümlendikçe sakin bir akışa iner. İmleç bölüme girince hem genel tempo
// biraz artar hem de imlecin hizasındaki dalga yerel olarak kabarır.
const waveHero = document.querySelector(".wave-hero");
if (waveHero) {
  const band = waveHero.querySelector(".wave-band");
  const ctx = band.getContext("2d");
  const CIZGI = 5;
  let bw = 0;
  let bh = 0;

  let heroRect = waveHero.getBoundingClientRect();
  const olc = () => {
    heroRect = waveHero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    bw = band.clientWidth;
    bh = band.clientHeight;
    band.width = Math.round(bw * dpr);
    band.height = Math.round(bh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  olc();
  window.addEventListener("resize", olc);
  window.addEventListener("scroll", () => { heroRect = waveHero.getBoundingClientRect(); }, { passive: true });

  let enerji = 1;      // 1 = açılış coşkusu, 0 = sakin akış
  let imlec = 0;       // yumuşatılmış imleç etkisi
  let imlecHedef = 0;
  let mx = -9999;      // imlecin bölüm içindeki x'i
  let faz = 0;         // birikimli — hız değişince dalga geri sıçramaz
  let sonZaman = 0;
  let gorunur = false;

  waveHero.addEventListener("pointermove", (e) => {
    mx = e.clientX - heroRect.left;
    imlecHedef = 1;
  });
  waveHero.addEventListener("pointerleave", () => { imlecHedef = 0; });

  const ciz = () => {
    const koyu = document.documentElement.dataset.theme === "dark";
    const rgb = koyu ? "255, 80, 99" : "166, 25, 46";
    const yerel = imlec > 0.01;
    const orta = bh / 2;

    ctx.clearRect(0, 0, bw, bh);
    for (let i = 0; i < CIZGI; i++) {
      const f = i / (CIZGI - 1);            // 0 = en üst çizgi, 1 = en alt
      const kacik = Math.abs(f - 0.5) * 2;  // 0 = orta çizgi, 1 = dıştaki
      const taban = orta + (f - 0.5) * bh * 0.34;
      const genlik = bh * 0.21 * (1 - kacik * 0.2) * (0.4 + 0.6 * enerji);

      ctx.beginPath();
      for (let x = 0; x <= bw; x += 5) {
        // İmlecin hizasında gauss kabarma
        const d = x - mx;
        const kabar = yerel ? 1 + imlec * 1.4 * Math.exp(-(d * d) / 34000) : 1;
        // Üç harmonik: uzun taşıyıcı + iki kısa dalga — kıvrımı zenginleştirir
        const s =
          Math.sin(x * 0.013 + faz * 1.7 + i * 0.55) * 0.55 +
          Math.sin(x * 0.026 - faz * 1.15 + i * 1.1) * 0.3 +
          Math.sin(x * 0.045 + faz * 2.3 + i * 1.9) * 0.15;
        const y = taban + genlik * kabar * s;
        if (x) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.strokeStyle = "rgba(" + rgb + ", " + (0.32 - kacik * 0.14).toFixed(3) + ")";
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }
  };

  if (reducedMotion) {
    enerji = 0;
    ciz();
  } else {
    const dongu = (now) => {
      if (!gorunur) return;
      const dt = sonZaman ? Math.min(0.05, (now - sonZaman) / 1000) : 0.016;
      sonZaman = now;

      // Üstel sönümleme: ~2 sn içinde açılış temposundan sakin akışa iner
      enerji += (0 - enerji) * (1 - Math.exp(-dt * 1.7));
      imlec += (imlecHedef - imlec) * (1 - Math.exp(-dt * 5));
      faz += dt * (0.55 + enerji * 3.2 + imlec * 0.8);

      ciz();
      requestAnimationFrame(dongu);
    };

    // Ekranda değilken hiç çalışmasın
    new IntersectionObserver(
      (entries) => {
        const v = entries[0].isIntersecting;
        if (v && !gorunur) {
          gorunur = true;
          sonZaman = 0;
          requestAnimationFrame(dongu);
        } else if (!v) {
          gorunur = false;
        }
      },
      { threshold: 0.02 }
    ).observe(waveHero);
  }
}

// Hakkımızda: zaman çizelgesi rayındaki ışık kaydırmayı izler.
// Framer'ın useScroll({ offset: ["start 10%", "end 50%"] }) karşılığı elle
// hesaplanır: ilerleme, bölümün üstü ekranın %10'una indiğinde başlar,
// altı ekranın ortasına geldiğinde dolar.
const timeline = document.querySelector("[data-timeline]");
if (timeline) {
  const kapsayici = timeline.querySelector(".timeline-items");
  const isik = timeline.querySelector(".timeline-beam");
  const bloklar = [...timeline.querySelectorAll(".timeline-item")].map((el) => ({
    el,
    nokta: el.querySelector(".timeline-dot"),
    aktif: false
  }));

  const uygula = () => {
    const r = kapsayici.getBoundingClientRect();
    const vh = window.innerHeight;
    const yol = r.height - vh * 0.4;
    // Bölüm ekrandan kısaysa payda negatife düşer; o durumda eşiği geçince dolu say
    const p =
      yol > 0
        ? Math.min(1, Math.max(0, (vh * 0.1 - r.top) / yol))
        : r.top <= vh * 0.1
        ? 1
        : 0;

    isik.style.transform = "scaleY(" + p.toFixed(4) + ")";
    isik.style.opacity = Math.min(1, p / 0.1).toFixed(3);

    // Okunmakta olan blok: başlığın asılı durduğu hizayı geçmiş olan
    const esik = vh * 0.25;
    for (const b of bloklar) {
      const ir = b.el.getBoundingClientRect();
      const aktif = ir.top <= esik && ir.bottom > esik;
      if (aktif !== b.aktif) {
        b.aktif = aktif;
        b.nokta.classList.toggle("is-active", aktif);
      }
    }
  };

  if (reducedMotion) {
    isik.style.transform = "scaleY(1)";
    isik.style.opacity = "1";
    bloklar.forEach((b) => b.nokta.classList.add("is-active"));
  } else {
    let gorunur = false;
    let bekliyor = false;
    // Ölçüm ve yazma tek bir kareye toplanır; scroll olayı yalnız bayrak diker
    const iste = () => {
      if (bekliyor || !gorunur) return;
      bekliyor = true;
      requestAnimationFrame(() => {
        bekliyor = false;
        uygula();
      });
    };
    window.addEventListener("scroll", iste, { passive: true });
    window.addEventListener("resize", iste);

    // Ekranda değilken hiç hesaplamasın
    new IntersectionObserver(
      (entries) => {
        gorunur = entries[0].isIntersecting;
        if (gorunur) iste();
      },
      { threshold: 0 }
    ).observe(timeline);
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
