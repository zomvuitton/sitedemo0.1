const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const store = require("./lib/store");

const { site, partners } = store;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "public", "img", "uploads");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "verimlilik1992";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const SESSION_HOURS = 12;

if (!process.env.ADMIN_PASSWORD) {
  console.warn("UYARI: ADMIN_PASSWORD tanımlı değil, varsayılan parola kullanılıyor. Canlıya çıkmadan önce ayarlayın.");
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(express.json({ limit: "512kb" }));
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0
  })
);

// Her şablona ortak veri — depo üzerinden, düzenlemeler anında yansır
app.use((req, res, next) => {
  res.locals.site = site;
  res.locals.partners = partners;
  res.locals.projects = store.content.projects;
  res.locals.committees = store.content.committees;
  res.locals.boards = store.content.boards;
  res.locals.path = req.path;
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

function requireAdminPage(req, res, next) {
  if (!isAdmin(req)) return res.redirect("/admin/giris");
  next();
}

function requireAdminApi(req, res, next) {
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
    .map((m) => ({ name: clean(m.name, 120), role: clean(m.role, 160), photo: clean(m.photo, 400) }))
    .filter((m) => m.name)
    .slice(0, 40);
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
    .replace(/[çğıöşü]/g, (ch) => map[ch])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function appendRecord(file, record) {
  fs.appendFileSync(path.join(DATA_DIR, file), JSON.stringify({ ...record, at: new Date().toISOString() }) + "\n", "utf8");
}

// Basit bellek içi hız limiti: IP başına dakikada 10 POST
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const list = (hits.get(req.ip) || []).filter((t) => t > now - 60_000);
  if (list.length >= 10) {
    return res.status(429).json({ ok: false, error: "Çok fazla istek. Bir dakika sonra tekrar deneyin." });
  }
  list.push(now);
  hits.set(req.ip, list);
  next();
}

// ---------- Genel sayfalar ----------

app.get("/", (req, res) => {
  // Ana sayfada tüm projeler alfabetik sırayla 3+3 ızgarada gösterilir
  const homeProjects = [...store.content.projects].sort((a, b) =>
    a.short.localeCompare(b.short, "tr")
  );
  res.render("index", { title: `${site.short} — ${site.name}`, homeProjects });
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
  res.render("proje", { title: `${project.name} — ${site.short}`, project });
});

app.get("/komiteler", (req, res) => {
  res.render("komiteler", { title: `Komiteler — ${site.short}` });
});

app.get("/komiteler/:slug", (req, res, next) => {
  const committee = store.content.committees.find((c) => c.slug === req.params.slug);
  if (!committee) return next();
  res.render("komite", { title: `${committee.name} — ${site.short}`, committee });
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

// ---------- Admin: sayfalar ----------

app.get("/admin/giris", (req, res) => {
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

const YK_ROLE_RE = /Yönetim Kurulu Üyesi|YK Üyesi/;

app.get("/admin/kurullar", requireAdminPage, (req, res) => {
  // İdari Kurul türetilir: kaynak proje/komite bilgisiyle birlikte listelenir
  const leads = [];
  store.content.projects.forEach((p) => {
    (p.team || []).forEach((m) => {
      if (!YK_ROLE_RE.test(m.role)) leads.push({ ...m, source: p.slug });
    });
  });
  const coords = [];
  store.content.committees.forEach((c) => {
    (c.team || []).forEach((m) => {
      if (!YK_ROLE_RE.test(m.role)) coords.push({ ...m, source: c.slug });
    });
  });
  res.render("admin/kurullar", { title: `Kurullar — Yönetim paneli`, leads, coords });
});

// ---------- Admin: API ----------

app.post("/admin/api/login", rateLimit, (req, res) => {
  const given = Buffer.from(clean(req.body.password, 200));
  const expected = Buffer.from(ADMIN_PASSWORD);
  const ok = given.length === expected.length && crypto.timingSafeEqual(given, expected);
  if (!ok) return res.status(401).json({ ok: false, error: "Parola hatalı." });
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
  express.raw({ type: ["image/png", "image/jpeg", "image/webp"], limit: "6mb" }),
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
        photo: clean(m.photo, 400)
      }))
      .filter((m) => m.name && validSlugs.includes(m.source))
      .slice(0, 80);
  }

  const leads = cleanAssigned(req.body.leads, store.content.projects.map((p) => p.slug));
  const coords = cleanAssigned(req.body.coords, store.content.committees.map((c) => c.slug));

  store.content.projects.forEach((p) => {
    const yk = (p.team || []).filter((m) => YK_ROLE_RE.test(m.role));
    const assigned = leads.filter((l) => l.source === p.slug).map(({ name, role, photo }) => ({ name, role, photo }));
    p.team = [...yk, ...assigned];
  });
  store.content.committees.forEach((c) => {
    const yk = (c.team || []).filter((m) => YK_ROLE_RE.test(m.role));
    const assigned = coords.filter((k) => k.source === c.slug).map(({ name, role, photo }) => ({ name, role, photo }));
    c.team = [...yk, ...assigned];
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
  if (req.path.startsWith("/api/") || req.path.startsWith("/admin/api/")) {
    return res.status(500).json({ ok: false, error: "Sunucu hatası." });
  }
  res.status(500).render("404", { title: `Bir şeyler ters gitti — ${site.short}` });
});

app.listen(PORT, () => {
  console.log(`ODTÜ VT sitesi çalışıyor: http://localhost:${PORT}`);
});
