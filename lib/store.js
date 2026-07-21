// Düzenlenebilir içerik deposu.
// lib/content.js yalnızca İLK açılışta tohum (seed) olarak kullanılır;
// sonrasında tüm okuma/yazma data/content.json üzerinden yürür.
// Admin panelindeki her kayıt işlemi dosyaya anında yazılır.

const fs = require("fs");
const path = require("path");
const seed = require("./content");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "content.json");

let content = null;

function buildSeed() {
  return {
    site: seed.site,
    texts: seed.texts,
    events: [],
    projects: seed.projects,
    committees: seed.committees,
    campusPosts: seed.campusPosts,
    // İdari Kurul ayrı tutulmaz: proje liderleri + komite koordinatörlerinden
    // otomatik türetilir (bkz. ekibimiz sayfası).
    boards: [
      { slug: "yonetim-kurulu", name: "Yönetim Kurulumuz", members: seed.board },
      { slug: "denetleme-danisma", name: "Denetleme ve Danışma Kurulumuz", members: seed.advisors }
    ]
  };
}

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(FILE)) {
    try {
      content = JSON.parse(fs.readFileSync(FILE, "utf8"));
      if (!content.projects || !content.committees || !content.boards) throw new Error("eksik alan");
      // Eski sürümden kalan boş "idari-kurul" kaydını temizle (artık otomatik türetiliyor)
      content.boards = content.boards.filter((b) => b.slug !== "idari-kurul" || b.members.length);
      // site ve texts: eski dosyalarda olmayan anahtarlar tohumdan tamamlanır
      content.site = { ...seed.site, ...(content.site || {}) };
      content.texts = { ...seed.texts, ...(content.texts || {}) };
      content.events = Array.isArray(content.events) ? content.events : [];
      // Kampüs yazıları: eski dosyalarda yok, tohumdaki başlangıç yazılarıyla gelir
      content.campusPosts = Array.isArray(content.campusPosts) ? content.campusPosts : seed.campusPosts;
      return;
    } catch (err) {
      console.error("content.json okunamadı, tohum veriyle devam ediliyor:", err.message);
    }
  }
  content = buildSeed();
  save();
}

const BACKUP_DIR = path.join(DATA_DIR, "backups");
const BACKUP_KEEP = 10;

function save() {
  // Üzerine yazmadan önce mevcut dosyayı yedekle (son 10 sürüm tutulur)
  try {
    if (fs.existsSync(FILE)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      fs.copyFileSync(FILE, path.join(BACKUP_DIR, `content-${Date.now()}.json`));
      const old = fs.readdirSync(BACKUP_DIR).filter((f) => /^content-\d+\.json$/.test(f)).sort();
      while (old.length > BACKUP_KEEP) fs.unlinkSync(path.join(BACKUP_DIR, old.shift()));
    }
  } catch (err) {
    console.error("Yedek alınamadı:", err.message);
  }
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(content, null, 2), "utf8");
  fs.renameSync(tmp, FILE);
}

function listBackups() {
  try {
    return fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => /^content-\d+\.json$/.test(f))
      .sort()
      .reverse()
      .map((f) => ({ file: f, at: new Date(Number(f.match(/\d+/)[0])) }));
  } catch {
    return [];
  }
}

function restore(fileName) {
  if (!/^content-\d+\.json$/.test(fileName)) throw new Error("Geçersiz yedek adı");
  const src = path.join(BACKUP_DIR, fileName);
  const parsed = JSON.parse(fs.readFileSync(src, "utf8")); // bozuksa burada patlar, dosyaya dokunulmaz
  if (!parsed.projects || !parsed.committees || !parsed.boards) throw new Error("Yedek eksik görünüyor");
  fs.copyFileSync(src, FILE);
  load(); // belleğe al + tohum birleşimlerini uygula
}

load();

module.exports = {
  site: seed.site,
  partners: seed.partners,
  get content() {
    return content;
  },
  save,
  listBackups,
  restore
};
