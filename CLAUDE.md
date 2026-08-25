# ODTÜ Verimlilik Topluluğu — Resmî Web Sitesi

odtuvt.org.tr'nin yerini alacak site. Apple tasarım diliyle, kütüphanesiz
(vanilla) frontend ve Express backend. Tüm arayüz metinleri **Türkçe**dir;
kod yorumları da Türkçe yazılır.

## Çalıştırma

```
npm install
npm start          # http://localhost:3000 (PORT env ile değişir)
npm run dev        # --watch ile
```

Admin paneli: `/admin` — parola `ADMIN_PASSWORD` env değişkeni. Tanımsızsa
yerel geliştirme parolası `yerel-gelistirme` geçerlidir ve panel yalnızca
sunucunun kendi makinesinden açılır; canlıda (`NODE_ENV=production`)
ADMIN_PASSWORD zorunludur, yoksa sunucu başlamaz. Oturum imzası
`SESSION_SECRET`. Canlı kurulum: `docker compose up -d --build` + `.env`
(bkz. README "Canlıya alma").

Kullanıcının kısayolları (kendisi teknik değil, bunlarla çalışıyor):
- `npm run yayinla` → commit + pull + push (içeriği GitHub'a gönderir)
- `npm run guncelle` → commit + pull (GitHub'dakini çeker, göndermez)

## Mimari

- `server.js` — tüm rotalar + admin API'leri tek dosyada.
- `lib/content.js` — tohum (seed) içerik. Sıralamalar burada dizi
  sırasıyla belirlenir.
- `lib/store.js` — çalışma zamanı deposu: `data/content.json` gerçek
  kaynaktır (git'e DAHİLDİR — içerik düzenlemeleri git ile taşınır).
  Kaydetmede `data/backups/` altına son 10 yedek düşer (gitignore'lu).
- `data/*.jsonl` (mesaj/abone kayıtları) kişisel veridir, gitignore'lu.
- `views/` — EJS şablonları; `views/partials/person.ejs` üye kartı,
  `views/admin/` panel sayfaları.
- Kampüs yazı gövdesi (`campusPosts[].body`) blok listesidir: düz string
  paragraf demektir, nesneler tipli bloktur (`h2`/`quote`/`list`/`img`).
  Temizlik `server.js cleanBlocks`; admin'deki blok editörü
  `views/admin/kampus-yazi.ejs` şablonları + `public/js/admin.js` ile çalışır.
- `public/js/main.js` — tema anahtarı, reveal, sayaçlar, grid reveal,
  scroll tilt, partner şeritleri, daktilo efekti, form gönderimi.
- Kampüs hero'su: yazının ARKASINDA tam yüzey stilize kampüs haritası
  (`views/partials/campus-map.ejs`, geometri gerçek haritadan çıkarıldı;
  dekoratif katman, ayrı panel DEĞİL). İmleç EM binasına yaklaşınca hale
  parlar ve etiket belirir (`main.js` `--em-glow`, stiller
  `style.css .campus-map-hero`). Dokunmatikte nabız, reduced-motion'da
  sabit parlaklık; sol tarafta okunurluk için kâğıt rengine geçiş var.
- `public/js/hero-particles.js` + `campus-morph.js` — Three.js
  (vendored: `public/vendor/three.module.min.js`) partikül animasyonları;
  sayfa yüklendikten sonra boşta (idle) import edilir.

## Değiştirilemez kurallar

1. **Üyelik başvurusu YOK.** Topluluk internetten başvuru/katılım kabul
   etmez. "Aramıza katıl", başvuru formu, üyelik CTA'sı benzeri hiçbir
   öge eklenmez.
2. **Proje sırası ve adları** (kısaltma kullanma, yazım aynen böyle):
   ESTIEM, Kybele, ODTÜ'lüler için Gelecek Planları, VakaVT, W'EQUAL,
   Yönetim ve Mühendislik Günleri.
3. **Komite sırası:** İnovasyon, Dizayn, İletişim ve Pazarlama,
   Organizasyon.
4. **İdari Kurul türetilir:** proje liderleri + komite koordinatörleri.
   Ayrı bir kurul listesi tutulmaz; Kurullar admin sayfası kaynak
   proje/komite ekiplerine yazar. `onlyProject: true` üyeler yalnız
   kendi proje sayfasında görünür, Ekibimiz'e ve İdari Kurul'a girmez.
5. **İçerik git ile taşınır:** `data/content.json` ve
   `public/img/uploads/` commit edilir; site nereye kurulursa aynı
   içerik gelir.
6. Admin paneli her zaman açık temada kalır (tema script'i yüklemez).

## Tasarım dili

- Apple estetiği: bol boşluk, sıkı başlık izlemesi, hap (pill) butonlar,
  buzlu cam yüzeyler. Tokenlar `public/css/style.css` başındaki `:root`ta.
- Butonlar düz buzlu cam — kabartmalı/parlak kenarlıklı liquid glass
  denendi ve REDDEDİLDİ; geri getirme.
- Koyu tema: `html[data-theme="dark"]` + localStorage `vt-theme`;
  ilk uygulama `views/partials/head.ejs` içindeki inline script'te.
- `.partner-cell` arkaplanı sabit koyu kalır (logolar beyaz varyant).
- Animasyonlar `prefers-reduced-motion` tercihine saygı gösterir.

## Dikkat

- EJS'de çok satırlı düzenlenebilir başlıklar `br()` yardımcı
  fonksiyonuyla basılır (escape + \n→<br>).
- `cleanMembers`/`carryQuote` (server.js) üye ekstralarını
  (quote/email/linkedin) isim eşleşmesiyle korur — İdari Kurul PUT'u
  ekipleri yeniden kurarken bunları düşürme.
- Kullanıcı Windows'ta çalışıyor; git çakışması görürse çıktıyı
  yapıştırması söylendi. Çakışma çözümlerini onun yerine yap.
