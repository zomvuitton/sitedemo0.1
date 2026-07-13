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
    projects: seed.projects,
    committees: seed.committees,
    boards: [
      { slug: "yonetim-kurulu", name: "Yönetim Kurulumuz", members: seed.board },
      { slug: "denetleme-danisma", name: "Denetleme ve Danışma Kurulumuz", members: seed.advisors },
      { slug: "idari-kurul", name: "İdari Kurulumuz", members: [] }
    ]
  };
}

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(FILE)) {
    try {
      content = JSON.parse(fs.readFileSync(FILE, "utf8"));
      if (!content.projects || !content.committees || !content.boards) throw new Error("eksik alan");
      return;
    } catch (err) {
      console.error("content.json okunamadı, tohum veriyle devam ediliyor:", err.message);
    }
  }
  content = buildSeed();
  save();
}

function save() {
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(content, null, 2), "utf8");
  fs.renameSync(tmp, FILE);
}

load();

module.exports = {
  site: seed.site,
  partners: seed.partners,
  get content() {
    return content;
  },
  save
};
