const path = require("path");
const fs = require("fs");
const express = require("express");
const { site, projects, board, advisors, committees, partners } = require("./lib/content");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");

fs.mkdirSync(DATA_DIR, { recursive: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(express.json({ limit: "32kb" }));
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0
  })
);

// Her şablona ortak veri
app.use((req, res, next) => {
  res.locals.site = site;
  res.locals.projects = projects;
  res.locals.partners = partners;
  res.locals.path = req.path;
  next();
});

// ---------- Sayfalar ----------

app.get("/", (req, res) => {
  res.render("index", {
    title: `${site.short} — ${site.name}`,
    featured: projects.filter((p) => p.featured),
    rest: projects.filter((p) => !p.featured),
    partners
  });
});

app.get("/hakkimizda", (req, res) => {
  res.render("hakkimizda", { title: `Hakkımızda — ${site.short}` });
});

app.get("/projeler", (req, res) => {
  res.render("projeler", { title: `Projeler — ${site.short}` });
});

app.get("/projeler/:slug", (req, res, next) => {
  const project = projects.find((p) => p.slug === req.params.slug);
  if (!project) return next();
  res.render("proje", { title: `${project.name} — ${site.short}`, project });
});

app.get("/ekibimiz", (req, res) => {
  res.render("ekibimiz", { title: `Ekibimiz — ${site.short}`, board, advisors, projectLeads: projects });
});

app.get("/komiteler", (req, res) => {
  res.render("komiteler", { title: `Komiteler — ${site.short}`, committees });
});

app.get("/iletisim", (req, res) => {
  res.render("iletisim", { title: `İletişim — ${site.short}` });
});

app.get("/katil", (req, res) => {
  res.render("katil", { title: `Aramıza Katıl — ${site.short}` });
});

// ---------- API ----------

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max) {
  return String(value || "").trim().slice(0, max);
}

function appendRecord(file, record) {
  const target = path.join(DATA_DIR, file);
  fs.appendFileSync(
    target,
    JSON.stringify({ ...record, at: new Date().toISOString() }) + "\n",
    "utf8"
  );
}

// Basit bellek içi hız limiti: IP başına dakikada 10 POST
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip;
  const windowStart = now - 60_000;
  const list = (hits.get(key) || []).filter((t) => t > windowStart);
  if (list.length >= 10) {
    return res.status(429).json({ ok: false, error: "Çok fazla istek. Bir dakika sonra tekrar deneyin." });
  }
  list.push(now);
  hits.set(key, list);
  next();
}

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

app.post("/api/join", rateLimit, (req, res) => {
  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 200);
  const department = clean(req.body.department, 160);
  const year = clean(req.body.year, 20);
  const interest = clean(req.body.interest, 160);
  const motivation = clean(req.body.motivation, 2000);

  if (name.length < 2) return res.status(400).json({ ok: false, error: "Lütfen adınızı yazın." });
  if (!emailRe.test(email)) return res.status(400).json({ ok: false, error: "Geçerli bir e-posta adresi girin." });
  if (!department) return res.status(400).json({ ok: false, error: "Bölümünüzü belirtin." });

  appendRecord("join.jsonl", { name, email, department, year, interest, motivation });
  res.json({ ok: true, message: "Başvurun alındı. Görüşme dönemi başladığında sana ulaşacağız." });
});

app.post("/api/newsletter", rateLimit, (req, res) => {
  const email = clean(req.body.email, 200);
  if (!emailRe.test(email)) return res.status(400).json({ ok: false, error: "Geçerli bir e-posta adresi girin." });
  appendRecord("newsletter.jsonl", { email });
  res.json({ ok: true, message: "Listeye eklendin. Etkinlik duyuruları e-postana gelecek." });
});

app.get("/api/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// ---------- 404 / 500 ----------

app.use((req, res) => {
  res.status(404).render("404", { title: `Sayfa bulunamadı — ${site.short}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith("/api/")) {
    return res.status(500).json({ ok: false, error: "Sunucu hatası." });
  }
  res.status(500).render("404", { title: `Bir şeyler ters gitti — ${site.short}` });
});

app.listen(PORT, () => {
  console.log(`ODTÜ VT sitesi çalışıyor: http://localhost:${PORT}`);
});
