const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const compression = require("compression");
const store = require("./lib/store");

const { site, partners } = store;

const app = express();
const CANLI = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "public", "img", "uploads");

// Varsayılan yalnızca yerel geliştirme içindir: canlıda ADMIN_PASSWORD zorunlu,
// tanımsızken panel sunucunun kendi makinesi dışına kapalı (bkz. panelKapali).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "yerel-gelistirme";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const SESSION_HOURS = 12;

// ---------- Canlı ortam ön kontrolleri ----------
// Depo herkese açık olduğu için varsayılan parola gizli sayılmaz: canlıda
// tanımsızsa sunucu hiç açılmaz, sessizce savunmasız kalmaktansa durur.
if (CANLI && !process.env.ADMIN_PASSWORD) {
  console.error("HATA: Canlıda ADMIN_PASSWORD zorunludur (varsayılan parola herkese açık). Sunucu başlatılmadı.");
  process.exit(1);
}
if (!process.env.ADMIN_PASSWORD) {
  console.warn("UYARI: ADMIN_PASSWORD tanımlı değil, varsayılan parola kullanılıyor. Canlıya çıkmadan önce ayarlayın.");
}
if (CANLI && !process.env.SESSION_SECRET) {
  console.warn("UYARI: SESSION_SECRET tanımlı değil; sunucu her yeniden başladığında admin oturumu düşer.");
}
if (CANLI && !process.env.SITE_URL) {
  console.warn("UYARI: SITE_URL tanımlı değil; canonical adresler ve paylaşım kartları localhost'u gösterir (SEO bozulur).");
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");

// Ters vekil (Cloudflare / Nginx) arkasında gerçek ziyaretçi IP'si için şart.
// Kapalıyken req.ip herkes için vekilin IP'si olur ve hız limiti tüm siteyi
// tek kişiymiş gibi sayıp formu bütün ziyaretçilere kapatır.
app.set("trust proxy", Number(process.env.TRUST_PROXY ?? (CANLI ? 1 : 0)));

// Statik sürüm damgası: CSS/JS içeriği değişince adresteki ?v= de değişir,
// böylece dönen ziyaretçiler önbellekteki eski tasarımda takılı kalmaz.
const ASSET_V = (() => {
  const ozet = crypto.createHash("sha1");
  ["css/style.css", "js/main.js", "js/admin.js"].forEach((f) => {
    try {
      const st = fs.statSync(path.join(__dirname, "public", f));
      ozet.update(`${f}:${st.size}:${st.mtimeMs}`);
    } catch {
      /* dosya yoksa damgaya katkısı olmaz */
    }
  });
  return ozet.digest("hex").slice(0, 8);
})();

app.use((req, res, next) => {
  // Her istek için tek kullanımlık nonce: CSP yalnızca bizim bastığımız
  // satır içi script'lere izin verir, enjekte edilene vermez.
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  res.locals.v = ASSET_V;
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'nonce-${res.locals.nonce}'`,
      "connect-src 'self'",
      "font-src 'self'"
    ].join("; ")
  );
  // HTTPS'e kilitle (tarayıcı düz http üzerinde bu başlığı yok sayar)
  if (CANLI) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

app.use(compression());
app.use(express.json({ limit: "512kb" }));
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: 0,
    setHeaders(res, dosyaYolu) {
      if (!CANLI) return;
      if (res.req && res.req.query && res.req.query.v) {
        // Sürümlenmiş adres: içerik değişirse adres de değişir, süresiz tutulabilir
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (/[\\/](img|vendor)[\\/]/.test(dosyaYolu)) {
        res.setHeader("Cache-Control", "public, max-age=2592000"); // 30 gün
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600"); // 1 saat
      }
    }
  })
);

// Genel sayfalar: tarayıcı her zaman taze alır, CDN (Cloudflare) 60 sn tutar.
// Duyuru sonrası ani trafikte istekler kenarda karşılanır, Node'a inmez.
app.use((req, res, next) => {
  if (CANLI && req.method === "GET" && !req.path.startsWith("/admin") && !req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
  }
  next();
});

// Yönetim paneli hiçbir yerde önbelleğe alınmaz
app.use("/admin", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Çok satırlı metinleri güvenle <br>'e çevirir (önce HTML kaçışı yapılır)
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function br(s) {
  return String(s ?? "").split("\n").map(escapeHtml).join("<br>");
}

// "2026-03-10" → "10 Mart 2026"
const AY_TAM = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
function trTarih(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${AY_TAM[m - 1]} ${y}`;
}

// Her şablona ortak veri — depo üzerinden, düzenlemeler anında yansır
app.use((req, res, next) => {
  res.locals.site = store.content.site;
  res.locals.texts = store.content.texts;
  res.locals.br = br;
  res.locals.trTarih = trTarih;
  res.locals.partners = partners;
  res.locals.projects = store.content.projects;
  res.locals.committees = store.content.committees;
  res.locals.campusPosts = store.content.campusPosts;
  res.locals.boards = store.content.boards;
  res.locals.events = store.content.events;
  res.locals.path = req.path;
  res.locals.siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  next();
});

// ---------- Oturum (HMAC imzalı çerez) ----------

function sign(value) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(String(value)).digest("hex");
}

function readCookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function isAdmin(req) {
  const raw = readCookies(req).vt_admin;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function setSession(res) {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  res.setHeader(
    "Set-Cookie",
    `vt_admin=${exp}.${sign(exp)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`
  );
}

function clearSession(res) {
  res.setHeader("Set-Cookie", "vt_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

// Güvenlik ağı: varsayılan parola herkese açık depoda yazılı olduğu için,
// o parola kullanılırken yönetim paneli yalnızca sunucunun kendi makinesinden
// açılabilir. NODE_ENV=production ayarlanmayı unutulsa bile panel dışarıya
// kapalı kalır.
const VARSAYILAN_PAROLA = !process.env.ADMIN_PASSWORD;

function yerelIstek(req) {
  const ip = String(req.ip || "").replace(/^::ffff:/, "");
  return ip === "127.0.0.1" || ip === "::1";
}

function panelKapali(req) {
  return VARSAYILAN_PAROLA && !yerelIstek(req);
}

const PANEL_KAPALI_MESAJ =
  "Yönetim paneli kapalı: ADMIN_PASSWORD tanımlanmadığı için yalnızca sunucunun kendi makinesinden açılabilir.";

function requireAdminPage(req, res, next) {
  if (panelKapali(req)) return res.status(403).render("404", { title: `Sayfa bulunamadı — ${site.short}` });
  if (!isAdmin(req)) return res.redirect("/admin/giris");
  next();
}

function requireAdminApi(req, res, next) {
  if (panelKapali(req)) return res.status(403).json({ ok: false, error: PANEL_KAPALI_MESAJ });
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: "Oturum gerekli." });
  next();
}

// ---------- Yardımcılar ----------

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ICONS = ["mic", "target", "chip", "scale", "leaf", "globe", "compass", "book", "users", "spark", "pen", "megaphone", "pin", "phone", "mail"];

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function cleanParagraphs(value, maxItems) {
  const arr = Array.isArray(value) ? value : String(value ?? "").split(/\n\s*\n/);
  return arr.map((p) => clean(p, 4000)).filter(Boolean).slice(0, maxItems || 12);
}

function cleanMembers(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((m) => {
      const member = { name: clean(m.name, 120), role: clean(m.role, 160), photo: clean(m.photo, 400) };
      // onlyProject: kişi yalnızca proje sayfasında görünür, Ekibimiz'e (İdari Kurul) yansımaz
      if (m.onlyProject) member.onlyProject = true;
      // quote: bir cümlelik kişisel alıntı — yalnızca proje/komite sayfasında gösterilir
      if (m.quote) member.quote = clean(m.quote, 240);
      // iletişim baloncukları: fotoğrafın köşesinde mail / LinkedIn
      if (m.email && emailRe.test(clean(m.email, 200))) member.email = clean(m.email, 200);
      if (m.linkedin) member.linkedin = clean(m.linkedin, 400);
      return member;
    })
    .filter((m) => m.name)
    .slice(0, 60);
}

function cleanFacts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((f) => ({ label: clean(f.label, 60), value: clean(f.value, 160) }))
    .filter((f) => f.label && f.value)
    .slice(0, 6);
}

function cleanGallery(value) {
  if (!Array.isArray(value)) return [];
  return value.map((g) => clean(g, 400)).filter(Boolean).slice(0, 12);
}

function slugify(text) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
  return clean(text, 80)
    .toLowerCase()
    // Aksanları ayrıştırıp at: "İ" küçülünce i + birleşen nokta olur, nokta kalırsa slug "i-lk" gibi bölünür
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[çğıöşü]/g, (ch) => map[ch])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function appendRecord(file, record) {
  fs.appendFileSync(path.join(DATA_DIR, file), JSON.stringify({ ...record, at: new Date().toISOString() }) + "\n", "utf8");
}

// Basit bellek içi hız limiti. Sayaçlar IP başına tutulur; süresi dolan
// kayıtlar düzenli temizlenir, yoksa yıl boyu çalışan süreçte Map sınırsız
// büyür ve sunucu belleği yavaşça dolar.
const limitDepolari = [];

function hizLimiti(maxIstek, pencereMs, mesaj) {
  const depo = new Map();
  limitDepolari.push({ depo, pencereMs });
  function limit(req, res, next) {
    const simdi = Date.now();
    const liste = (depo.get(req.ip) || []).filter((t) => t > simdi - pencereMs);
    if (liste.length >= maxIstek) return res.status(429).json({ ok: false, error: mesaj });
    liste.push(simdi);
    depo.set(req.ip, liste);
    next();
  }
  // Başarılı işlemden sonra sayaç sıfırlanabilsin (doğru parolayı giren
  // yönetici, önceki hatalı denemeler yüzünden kilitli kalmasın)
  limit.sifirla = (req) => depo.delete(req.ip);
  return limit;
}

setInterval(() => {
  const simdi = Date.now();
  limitDepolari.forEach(({ depo, pencereMs }) => {
    for (const [ip, liste] of depo) {
      const kalan = liste.filter((t) => t > simdi - pencereMs);
      if (kalan.length) depo.set(ip, kalan);
      else depo.delete(ip);
    }
  });
}, 300_000).unref();

// Formlar: IP başına dakikada 10 gönderim
const rateLimit = hizLimiti(10, 60_000, "Çok fazla istek. Bir dakika sonra tekrar deneyin.");
// Admin girişi ayrı ve çok daha dar: parola deneme saldırısını yavaşlatır
const girisLimiti = hizLimiti(10, 15 * 60_000, "Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.");

// ---------- Genel sayfalar ----------

const AY_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

app.get("/", (req, res) => {
  // Ana sayfada tüm projeler alfabetik sırayla 3+3 ızgarada gösterilir
  // Sıra: içerik dizisindeki kanonik sıra (ESTIEM, Kybele, OGP, VakaVT, W'EQUAL, YMG)
  const homeProjects = store.content.projects;
  // Yaklaşan etkinlikler: bugünden itibaren, tarihe göre, en fazla 4
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (store.content.events || [])
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
    .map((e) => {
      const d = new Date(e.date + "T00:00:00");
      return { ...e, day: d.getDate(), month: AY_KISA[d.getMonth()] };
    });
  res.render("index", { title: `${site.short} — ${site.name}`, homeProjects, upcoming });
});

app.get("/hakkimizda", (req, res) => {
  res.render("hakkimizda", { title: `Hakkımızda — ${site.short}` });
});

app.get("/projeler", (req, res) => {
  res.render("projeler", { title: `Projeler — ${site.short}` });
});

app.get("/projeler/:slug", (req, res, next) => {
  const project = store.content.projects.find((p) => p.slug === req.params.slug);
  if (!project) return next();
  res.render("proje", { title: `${project.name} — ${site.short}`, project, desc: project.summary });
});

app.get("/komiteler", (req, res) => {
  res.render("komiteler", { title: `Komiteler — ${site.short}` });
});

app.get("/komiteler/:slug", (req, res, next) => {
  const committee = store.content.committees.find((c) => c.slug === req.params.slug);
  if (!committee) return next();
  res.render("komite", { title: `${committee.name} — ${site.short}`, committee, desc: committee.summary });
});

// Kampüs: bilgi + yazı akışı. Taslaklar yayında görünmez.
function yayindakiYazilar() {
  return (store.content.campusPosts || [])
    .filter((p) => !p.draft)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

app.get("/kampus", (req, res) => {
  res.render("kampus", { title: `Kampüs — ${site.short}`, posts: yayindakiYazilar(), desc: store.content.texts.kampusLede });
});

app.get("/kampus/:slug", (req, res, next) => {
  const post = (store.content.campusPosts || []).find((p) => p.slug === req.params.slug);
  if (!post || post.draft) return next();
  const digerleri = yayindakiYazilar().filter((p) => p.slug !== post.slug).slice(0, 2);
  res.render("kampus-yazi", { title: `${post.title} — ${site.short}`, post, digerleri, desc: post.excerpt });
});

app.get("/ekibimiz", (req, res) => {
  res.render("ekibimiz", { title: `Ekibimiz — ${site.short}` });
});

app.get("/iletisim", (req, res) => {
  res.render("iletisim", { title: `İletişim — ${site.short}` });
});

// Üyelik başvurusu internet üzerinden alınmaz; eski bağlantılar iletişime yönlenir
app.get("/katil", (req, res) => {
  res.redirect(301, "/iletisim");
});

// ---------- Genel API ----------

app.post("/api/contact", rateLimit, (req, res) => {
  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 200);
  const subject = clean(req.body.subject, 200);
  const message = clean(req.body.message, 4000);

  if (name.length < 2) return res.status(400).json({ ok: false, error: "Lütfen adınızı yazın." });
  if (!emailRe.test(email)) return res.status(400).json({ ok: false, error: "Geçerli bir e-posta adresi girin." });
  if (message.length < 10) return res.status(400).json({ ok: false, error: "Mesajınız en az 10 karakter olmalı." });

  appendRecord("contact.jsonl", { name, email, subject, message });
  res.json({ ok: true, message: "Mesajınız alındı. En kısa sürede dönüş yapacağız." });
});

app.post("/api/newsletter", rateLimit, (req, res) => {
  const email = clean(req.body.email, 200);
  if (!emailRe.test(email)) return res.status(400).json({ ok: false, error: "Geçerli bir e-posta adresi girin." });
  appendRecord("newsletter.jsonl", { email });
  res.json({ ok: true, message: "Listeye eklendin. Etkinlik duyuruları e-postana gelecek." });
});

app.get("/api/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// ---------- SEO: sitemap + robots ----------

const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

app.get("/sitemap.xml", (req, res) => {
  const urls = [
    "/", "/hakkimizda", "/projeler", "/komiteler", "/kampus", "/ekibimiz", "/iletisim",
    ...store.content.projects.map((p) => `/projeler/${p.slug}`),
    ...store.content.committees.map((c) => `/komiteler/${c.slug}`),
    ...(store.content.campusPosts || []).filter((p) => !p.draft).map((p) => `/kampus/${p.slug}`)
  ];
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n") +
      `\n</urlset>`
  );
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

// ---------- Admin: sayfalar ----------

app.get("/admin/giris", (req, res) => {
  if (panelKapali(req)) return res.status(403).render("404", { title: `Sayfa bulunamadı — ${site.short}` });
  if (isAdmin(req)) return res.redirect("/admin");
  res.render("admin/giris", { title: `Yönetici girişi — ${site.short}` });
});

app.get("/admin", requireAdminPage, (req, res) => {
  res.render("admin/index", { title: `Yönetim paneli — ${site.short}` });
});

app.get("/admin/projeler", requireAdminPage, (req, res) => {
  res.render("admin/projeler", { title: `Projeler — Yönetim paneli` });
});

app.get("/admin/projeler/:slug", requireAdminPage, (req, res, next) => {
  const project = store.content.projects.find((p) => p.slug === req.params.slug);
  if (!project) return next();
  res.render("admin/proje", { title: `${project.short} — Yönetim paneli`, project, icons: ICONS });
});

app.get("/admin/komiteler", requireAdminPage, (req, res) => {
  res.render("admin/komiteler", { title: `Komiteler — Yönetim paneli` });
});

app.get("/admin/komiteler/:slug", requireAdminPage, (req, res, next) => {
  const committee = store.content.committees.find((c) => c.slug === req.params.slug);
  if (!committee) return next();
  res.render("admin/komite", { title: `${committee.name} — Yönetim paneli`, committee, icons: ICONS });
});

app.get("/admin/kampus", requireAdminPage, (req, res) => {
  const posts = [...(store.content.campusPosts || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  res.render("admin/kampus", { title: `Kampüs — Yönetim paneli`, posts });
});

app.get("/admin/kampus/:slug", requireAdminPage, (req, res, next) => {
  const post = (store.content.campusPosts || []).find((p) => p.slug === req.params.slug);
  if (!post) return next();
  res.render("admin/kampus-yazi", { title: `${post.title} — Yönetim paneli`, post });
});

const YK_ROLE_RE = /Yönetim Kurulu Üyesi|YK Üyesi/;

// Metinler sayfası şeması: yalnızca burada listelenen yollar düzenlenebilir
const TEXT_SCHEMA = [
  {
    group: "Marka & Genel",
    items: [
      ["site.slogan", "Hero üst yazısı (slogan)"],
      ["site.claim", "Alt bilgi sloganı"],
      ["texts.footerNote", "Alt bilgi notu", "textarea"],
      ["texts.newsletterLabel", "Bülten kutusu başlığı"],
      ["site.address", "Adres", "textarea"],
      ["site.phone", "Telefon"],
      ["site.email", "E-posta"]
    ]
  },
  {
    group: "Ana sayfa",
    items: [
      ["texts.homeHeroTitle", "Hero başlığı (satır bölmek için Enter)", "textarea"],
      ["site.heroLede", "Hero alt yazısı (\"/\" ile ayrılan kelimeler daktilo efektiyle yazılır)", "textarea"],
      ["texts.homeHeroButton", "Hero butonu"],
      ["texts.homeHeroLink", "Hero bağlantısı"],
      ["texts.homeProjectsTitle", "Projeler bölümü başlığı"],
      ["texts.homeCommitteesTitle", "Komiteler bölümü başlığı"],
      ["texts.homeEventsTitle", "Yaklaşan etkinlikler başlığı"],
      ["texts.homeStatsTitle", "Rakamlar başlığı", "textarea"],
      ["texts.homeStatsLede", "Rakamlar açıklaması", "textarea"],
      ["texts.homeAboutTitle", "Biz kimiz başlığı"],
      ["texts.homePartnersTitle", "Partnerler başlığı"],
      ["texts.homePartnersSub", "Partnerler alt yazısı"],
      ["texts.campusTitle", "Kampüste bul başlığı"],
      ["texts.campusLede", "Kampüste bul metni", "textarea"],
      ["texts.campusButton", "Kampüste bul butonu"],
      ["texts.campusLink", "Kampüste bul bağlantısı"]
    ]
  },
  {
    group: "İstatistikler",
    items: [
      ["site.stats.0.value", "1. değer"], ["site.stats.0.label", "1. etiket"],
      ["site.stats.1.value", "2. değer"], ["site.stats.1.label", "2. etiket"],
      ["site.stats.2.value", "3. değer"], ["site.stats.2.label", "3. etiket"],
      ["site.stats.3.value", "4. değer"], ["site.stats.3.label", "4. etiket"],
      ["site.stats.4.value", "5. değer"], ["site.stats.4.label", "5. etiket"]
    ]
  },
  {
    group: "Hakkımızda sayfası",
    items: [
      ["texts.aboutTitle", "Sayfa başlığı", "textarea"],
      ["site.description", "Sayfa alt yazısı", "textarea"],
      ["site.about.0", "Biz kimiz — 1. paragraf", "textarea"],
      ["site.about.1", "Biz kimiz — 2. paragraf", "textarea"],
      ["site.vision", "Vizyon", "textarea"],
      ["site.mission", "Misyon", "textarea"],
      ["texts.aboutQuote", "Koyu bölümdeki alıntı", "textarea"],
      ["texts.aboutQuoteSource", "Alıntı kaynağı"],
      ["texts.aboutStatsTitle", "Rakamlar başlığı"],
      ["texts.aboutStatsLede", "Rakamlar açıklaması"],
      ["texts.aboutPartnersSub", "Partnerler alt yazısı"]
    ]
  },
  {
    group: "Projeler sayfası",
    items: [
      ["texts.projectsTitle", "Sayfa başlığı", "textarea"],
      ["texts.projectsLede", "Sayfa alt yazısı", "textarea"]
    ]
  },
  {
    group: "Komiteler sayfası",
    items: [
      ["texts.committeesTitle", "Sayfa başlığı"],
      ["texts.committeesLede", "Sayfa alt yazısı", "textarea"],
      ["texts.committeesCtaTitle", "Alt koyu bölüm başlığı"],
      ["texts.committeesCtaLede", "Alt koyu bölüm metni"]
    ]
  },
  {
    group: "Kampüs sayfası",
    items: [
      ["texts.kampusTitle", "Sayfa başlığı", "textarea"],
      ["texts.kampusLede", "Sayfa alt yazısı", "textarea"],
      ["texts.kampusHours", "Bilgi şeridi — \"Ne zaman\"", "textarea"],
      ["texts.kampusHow", "Bilgi şeridi — \"Nasıl tanışılır\"", "textarea"],
      ["texts.kampusIntro", "Giriş paragrafı", "textarea"],
      ["texts.kampusPostsTitle", "Yazılar bölümü başlığı"]
    ]
  },
  {
    group: "Ekibimiz sayfası",
    items: [
      ["texts.teamTitle", "Sayfa başlığı"],
      ["texts.teamLede", "Sayfa alt yazısı", "textarea"],
      ["texts.teamIdariSub", "İdari Kurul alt yazısı"],
      ["texts.teamCtaTitle", "Alt koyu bölüm başlığı", "textarea"],
      ["texts.teamCtaLede", "Alt koyu bölüm metni"]
    ]
  },
  {
    group: "İletişim sayfası",
    items: [
      ["texts.contactTitle", "Sayfa başlığı", "textarea"],
      ["texts.contactLede", "Sayfa alt yazısı"]
    ]
  }
];

const TEXT_PATHS = new Set(TEXT_SCHEMA.flatMap((g) => g.items.map((i) => i[0])));

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (o[keys[i]] == null) o[keys[i]] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = value;
}

// ---------- Admin: Kayıtlar (form gönderileri) ----------

function readRecords(file) {
  try {
    return fs
      .readFileSync(path.join(DATA_DIR, file), "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean)
      .reverse();
  } catch {
    return [];
  }
}

app.get("/admin/kayitlar", requireAdminPage, (req, res) => {
  res.render("admin/kayitlar", {
    title: "Kayıtlar — Yönetim paneli",
    messages: readRecords("contact.jsonl").slice(0, 300),
    subscribers: readRecords("newsletter.jsonl").slice(0, 1000)
  });
});

// CSV dışa aktarma (Türkçe Excel için BOM + noktalı virgül)
function sendCsv(res, name, headers, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = [headers.map(esc).join(";"), ...rows.map((r) => r.map(esc).join(";"))].join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
  res.send("﻿" + body);
}

app.get("/admin/api/kayitlar/mesajlar.csv", requireAdminApi, (req, res) => {
  sendCsv(res, "mesajlar.csv", ["Tarih", "Ad", "E-posta", "Konu", "Mesaj"],
    readRecords("contact.jsonl").map((r) => [r.at, r.name, r.email, r.subject, r.message]));
});

app.get("/admin/api/kayitlar/aboneler.csv", requireAdminApi, (req, res) => {
  sendCsv(res, "aboneler.csv", ["Tarih", "E-posta"],
    readRecords("newsletter.jsonl").map((r) => [r.at, r.email]));
});

// ---------- Admin: Etkinlikler ----------

function sanitizeEvents(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((e) => ({
      title: clean(e.title, 160),
      date: /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : "",
      time: clean(e.time, 40),
      place: clean(e.place, 160),
      link: clean(e.link, 400),
      image: clean(e.image, 400)
    }))
    .filter((e) => e.title && e.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 50);
}

app.get("/admin/etkinlikler", requireAdminPage, (req, res) => {
  res.render("admin/etkinlikler", { title: "Etkinlikler — Yönetim paneli", events: store.content.events });
});

app.put("/admin/api/etkinlikler", requireAdminApi, (req, res) => {
  store.content.events = sanitizeEvents(req.body.events);
  store.save();
  res.json({ ok: true, count: store.content.events.length });
});

// ---------- Admin: Yedekler ----------

app.get("/admin/yedekler", requireAdminPage, (req, res) => {
  res.render("admin/yedekler", { title: "Yedekler — Yönetim paneli", backups: store.listBackups() });
});

app.post("/admin/api/yedekler/geri-yukle", requireAdminApi, (req, res) => {
  try {
    store.restore(clean(req.body.file, 80));
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: "Geri yüklenemedi: " + err.message });
  }
});

app.get("/admin/metinler", requireAdminPage, (req, res) => {
  res.render("admin/metinler", {
    title: "Metinler — Yönetim paneli",
    schema: TEXT_SCHEMA,
    getValue: (p) => getPath(store.content, p) ?? ""
  });
});

app.put("/admin/api/metinler", requireAdminApi, (req, res) => {
  let updated = 0;
  for (const [path, value] of Object.entries(req.body || {})) {
    if (!TEXT_PATHS.has(path) || typeof value !== "string") continue;
    setPath(store.content, path, value.trim().slice(0, 4000));
    updated++;
  }
  store.save();
  res.json({ ok: true, updated });
});

app.get("/admin/kurullar", requireAdminPage, (req, res) => {
  // İdari Kurul türetilir: kaynak proje/komite bilgisiyle birlikte listelenir
  const leads = [];
  store.content.projects.forEach((p) => {
    (p.team || []).forEach((m) => {
      if (!YK_ROLE_RE.test(m.role) && !m.onlyProject) leads.push({ ...m, source: p.slug });
    });
  });
  const coords = [];
  store.content.committees.forEach((c) => {
    (c.team || []).forEach((m) => {
      if (!YK_ROLE_RE.test(m.role) && !m.onlyProject) coords.push({ ...m, source: c.slug });
    });
  });
  res.render("admin/kurullar", { title: `Kurullar — Yönetim paneli`, leads, coords });
});

// ---------- Admin: API ----------

app.post("/admin/api/login", girisLimiti, (req, res) => {
  if (panelKapali(req)) return res.status(403).json({ ok: false, error: PANEL_KAPALI_MESAJ });
  const given = Buffer.from(clean(req.body.password, 200));
  const expected = Buffer.from(ADMIN_PASSWORD);
  const ok = given.length === expected.length && crypto.timingSafeEqual(given, expected);
  if (!ok) return res.status(401).json({ ok: false, error: "Parola hatalı." });
  girisLimiti.sifirla(req);
  setSession(res);
  res.json({ ok: true });
});

app.post("/admin/api/logout", (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

// Görsel yükleme: ham gövde olarak alınır, public/img/uploads altına yazılır
app.post(
  "/admin/api/upload",
  requireAdminApi,
  express.raw({ type: ["image/png", "image/jpeg", "image/webp"], limit: "15mb" }),
  (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ ok: false, error: "Görsel gövdesi boş. Content-Type image/png, image/jpeg veya image/webp olmalı." });
    }
    const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[req.headers["content-type"]];
    const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), req.body);
    res.json({ ok: true, path: `/img/uploads/${name}` });
  }
);

function sanitizeProject(input, existing) {
  const name = clean(input.name, 120) || (existing && existing.name);
  if (!name) return { error: "Proje adı gerekli." };
  return {
    value: {
      slug: existing ? existing.slug : "",
      name,
      short: clean(input.short, 40) || name,
      tagline: clean(input.tagline, 160),
      summary: clean(input.summary, 500),
      body: cleanParagraphs(input.body),
      facts: cleanFacts(input.facts),
      team: cleanMembers(input.team),
      hero: clean(input.hero, 400),
      gallery: cleanGallery(input.gallery),
      icon: ICONS.includes(input.icon) ? input.icon : "spark",
      external: clean(input.external, 400),
      theme: input.theme === "dark" ? "dark" : "light"
    }
  };
}

app.post("/admin/api/projeler", requireAdminApi, (req, res) => {
  const { value, error } = sanitizeProject(req.body, null);
  if (error) return res.status(400).json({ ok: false, error });
  let slug = slugify(value.name);
  if (!slug) return res.status(400).json({ ok: false, error: "Geçerli bir ad girin." });
  while (store.content.projects.some((p) => p.slug === slug)) slug += "-2";
  value.slug = slug;
  store.content.projects.push(value);
  store.save();
  res.json({ ok: true, slug });
});

app.put("/admin/api/projeler/:slug", requireAdminApi, (req, res) => {
  const i = store.content.projects.findIndex((p) => p.slug === req.params.slug);
  if (i === -1) return res.status(404).json({ ok: false, error: "Proje bulunamadı." });
  const { value, error } = sanitizeProject(req.body, store.content.projects[i]);
  if (error) return res.status(400).json({ ok: false, error });
  store.content.projects[i] = value;
  store.save();
  res.json({ ok: true });
});

app.delete("/admin/api/projeler/:slug", requireAdminApi, (req, res) => {
  const i = store.content.projects.findIndex((p) => p.slug === req.params.slug);
  if (i === -1) return res.status(404).json({ ok: false, error: "Proje bulunamadı." });
  store.content.projects.splice(i, 1);
  store.save();
  res.json({ ok: true });
});

function sanitizeCommittee(input, existing) {
  const name = clean(input.name, 120) || (existing && existing.name);
  if (!name) return { error: "Komite adı gerekli." };
  return {
    value: {
      slug: existing ? existing.slug : "",
      name,
      summary: clean(input.summary, 500),
      body: cleanParagraphs(input.body),
      icon: ICONS.includes(input.icon) ? input.icon : "users",
      hero: clean(input.hero, 400),
      gallery: cleanGallery(input.gallery),
      team: cleanMembers(input.team)
    }
  };
}

app.post("/admin/api/komiteler", requireAdminApi, (req, res) => {
  const { value, error } = sanitizeCommittee(req.body, null);
  if (error) return res.status(400).json({ ok: false, error });
  let slug = slugify(value.name);
  if (!slug) return res.status(400).json({ ok: false, error: "Geçerli bir ad girin." });
  while (store.content.committees.some((c) => c.slug === slug)) slug += "-2";
  value.slug = slug;
  store.content.committees.push(value);
  store.save();
  res.json({ ok: true, slug });
});

app.put("/admin/api/komiteler/:slug", requireAdminApi, (req, res) => {
  const i = store.content.committees.findIndex((c) => c.slug === req.params.slug);
  if (i === -1) return res.status(404).json({ ok: false, error: "Komite bulunamadı." });
  const { value, error } = sanitizeCommittee(req.body, store.content.committees[i]);
  if (error) return res.status(400).json({ ok: false, error });
  store.content.committees[i] = value;
  store.save();
  res.json({ ok: true });
});

app.delete("/admin/api/komiteler/:slug", requireAdminApi, (req, res) => {
  const i = store.content.committees.findIndex((c) => c.slug === req.params.slug);
  if (i === -1) return res.status(404).json({ ok: false, error: "Komite bulunamadı." });
  store.content.committees.splice(i, 1);
  store.save();
  res.json({ ok: true });
});

// Kampüs yazıları: proje/komite API'leriyle aynı desen (oluştur / kaydet / sil)
// Yazı gövdesi blok listesidir: düz string paragraf demektir (eski içerikle aynı
// biçim), nesneler tipli bloklardır — h2 (ara başlık), quote (alıntı),
// list (madde listesi), img (yazı içi görsel).
function cleanBlocks(value, maxItems) {
  if (!Array.isArray(value)) return cleanParagraphs(value, maxItems); // eski tek-textarea biçimi
  const out = [];
  for (const raw of value) {
    if (out.length >= (maxItems || 60)) break;
    // Paragraf depoda düz string olarak tutulur
    if (typeof raw === "string" || (raw && raw.type === "p")) {
      const text = clean(typeof raw === "string" ? raw : raw.text, 4000);
      if (text) out.push(text);
      continue;
    }
    if (!raw || typeof raw !== "object") continue;
    if (raw.type === "h2") {
      const text = clean(raw.text, 200);
      if (text) out.push({ type: "h2", text });
    } else if (raw.type === "quote") {
      const text = clean(raw.text, 1000);
      if (!text) continue;
      const block = { type: "quote", text };
      const cite = clean(raw.cite, 160);
      if (cite) block.cite = cite;
      out.push(block);
    } else if (raw.type === "list") {
      // İstemci maddeleri tek metin (satır başına bir madde) da gönderebilir
      const items = (Array.isArray(raw.items) ? raw.items : String(raw.items ?? "").split("\n"))
        .map((item) => clean(item, 300))
        .filter(Boolean)
        .slice(0, 20);
      if (!items.length) continue;
      const block = { type: "list", items };
      if (raw.ordered) block.ordered = true;
      out.push(block);
    } else if (raw.type === "img") {
      const src = clean(raw.src, 400);
      if (!src) continue;
      const block = { type: "img", src };
      const caption = clean(raw.caption, 300);
      if (caption) block.caption = caption;
      out.push(block);
    }
  }
  return out;
}

function sanitizePost(input, existing) {
  const title = clean(input.title, 160) || (existing && existing.title);
  if (!title) return { error: "Yazı başlığı gerekli." };
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : new Date().toISOString().slice(0, 10);
  return {
    value: {
      slug: existing ? existing.slug : "",
      title,
      date,
      author: clean(input.author, 120),
      tag: clean(input.tag, 60),
      excerpt: clean(input.excerpt, 500),
      body: cleanBlocks(input.body, 60),
      cover: clean(input.cover, 400),
      gallery: cleanGallery(input.gallery),
      draft: Boolean(input.draft)
    }
  };
}

app.post("/admin/api/kampus", requireAdminApi, (req, res) => {
  // Oluşturma formu tek alan gönderir (name); onu başlık olarak alıyoruz
  const { value, error } = sanitizePost({ ...req.body, title: req.body.title || req.body.name }, null);
  if (error) return res.status(400).json({ ok: false, error });
  let slug = slugify(value.title);
  if (!slug) return res.status(400).json({ ok: false, error: "Geçerli bir başlık girin." });
  while (store.content.campusPosts.some((p) => p.slug === slug)) slug += "-2";
  value.slug = slug;
  store.content.campusPosts.push(value);
  store.save();
  res.json({ ok: true, slug });
});

app.put("/admin/api/kampus/:slug", requireAdminApi, (req, res) => {
  const i = store.content.campusPosts.findIndex((p) => p.slug === req.params.slug);
  if (i === -1) return res.status(404).json({ ok: false, error: "Yazı bulunamadı." });
  const { value, error } = sanitizePost(req.body, store.content.campusPosts[i]);
  if (error) return res.status(400).json({ ok: false, error });
  store.content.campusPosts[i] = value;
  store.save();
  res.json({ ok: true });
});

app.delete("/admin/api/kampus/:slug", requireAdminApi, (req, res) => {
  const i = store.content.campusPosts.findIndex((p) => p.slug === req.params.slug);
  if (i === -1) return res.status(404).json({ ok: false, error: "Yazı bulunamadı." });
  store.content.campusPosts.splice(i, 1);
  store.save();
  res.json({ ok: true });
});

// İdari Kurul kaydı: satırlar kaynak proje/komite ekiplerine geri yazılır.
// YK rolündeki üyeler korunur; diğer üyeler gönderilen listeyle değiştirilir.
app.put("/admin/api/idari-kurul", requireAdminApi, (req, res) => {
  function cleanAssigned(value, validSlugs) {
    if (!Array.isArray(value)) return [];
    return value
      .map((m) => ({
        source: clean(m.source, 80),
        name: clean(m.name, 120),
        role: clean(m.role, 160),
        photo: clean(m.photo, 400),
        quote: clean(m.quote, 240)
      }))
      .filter((m) => m.name && validSlugs.includes(m.source))
      .slice(0, 80);
  }

  const leads = cleanAssigned(req.body.leads, store.content.projects.map((p) => p.slug));
  const coords = cleanAssigned(req.body.coords, store.content.committees.map((c) => c.slug));

  // YK üyeleri ve "yalnızca proje sayfasında" işaretli kişiler korunur.
  // Quote/e-posta/LinkedIn kurullar sayfasından düzenlenmediği için
  // mevcut kayıttan (isimle eşleşerek) taşınır.
  function carryQuote(team, m) {
    const existing = (team || []).find((t) => t.name === m.name) || {};
    const member = { name: m.name, role: m.role, photo: m.photo };
    for (const key of ["quote", "email", "linkedin"]) {
      const val = m[key] || existing[key];
      if (val) member[key] = val;
    }
    return member;
  }
  store.content.projects.forEach((p) => {
    const kept = (p.team || []).filter((m) => YK_ROLE_RE.test(m.role) || m.onlyProject);
    const assigned = leads.filter((l) => l.source === p.slug).map((m) => carryQuote(p.team, m));
    p.team = [...kept, ...assigned];
  });
  store.content.committees.forEach((c) => {
    const kept = (c.team || []).filter((m) => YK_ROLE_RE.test(m.role) || m.onlyProject);
    const assigned = coords.filter((k) => k.source === c.slug).map((m) => carryQuote(c.team, m));
    c.team = [...kept, ...assigned];
  });
  store.save();
  res.json({ ok: true });
});

app.put("/admin/api/kurullar/:slug", requireAdminApi, (req, res) => {
  const board = store.content.boards.find((b) => b.slug === req.params.slug);
  if (!board) return res.status(404).json({ ok: false, error: "Kurul bulunamadı." });
  const name = clean(req.body.name, 120);
  if (name) board.name = name;
  board.members = cleanMembers(req.body.members);
  store.save();
  res.json({ ok: true });
});

// ---------- 404 / 500 ----------

app.use((req, res) => {
  res.status(404).render("404", { title: `Sayfa bulunamadı — ${site.short}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const apiYolu = req.path.startsWith("/api/") || req.path.startsWith("/admin/api/");
  // Boyut aşımı: dostça mesaj (istemci küçültmesine rağmen çok büyük dosya)
  if (err.type === "entity.too.large" || err.status === 413) {
    if (apiYolu) {
      return res.status(413).json({ ok: false, error: "Görsel çok büyük. Lütfen daha küçük bir dosya deneyin." });
    }
  }
  if (apiYolu) {
    return res.status(500).json({ ok: false, error: "Sunucu hatası." });
  }
  res.status(500).render("404", { title: `Bir şeyler ters gitti — ${site.short}` });
});

const server = app.listen(PORT, () => {
  console.log(`ODTÜ VT sitesi çalışıyor: http://localhost:${PORT}`);
});

// ---------- Düzgün kapanma ----------
// Docker/systemd yeniden başlatırken SIGTERM gönderir: açık istekleri
// tamamlayıp çıkarız, böylece ziyaretçi yarıda kesilmiş sayfa görmez.
let kapaniyor = false;
function kapat(sinyal, kod = 0) {
  if (kapaniyor) return;
  kapaniyor = true;
  console.log(`${sinyal} alındı, sunucu kapatılıyor…`);
  server.close(() => process.exit(kod));
  // Takılan bağlantı olursa 10 sn sonra yine de çık
  setTimeout(() => process.exit(kod), 10_000).unref();
}
["SIGTERM", "SIGINT"].forEach((s) => process.on(s, () => kapat(s)));

// Beklenmeyen hatalar kayda geçsin; süreç yöneticisi (restart: always)
// yeniden başlatır, ama neden çöktüğü loglarda kalır.
process.on("unhandledRejection", (err) => console.error("İşlenmemiş promise reddi:", err));
process.on("uncaughtException", (err) => {
  console.error("Yakalanmamış hata:", err);
  kapat("uncaughtException", 1);
});
