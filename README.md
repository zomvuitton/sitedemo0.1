# ODTÜ VT — Yeniden Tasarım

ODTÜ Verimlilik Topluluğu ([odtuvt.org.tr](https://www.odtuvt.org.tr/)) sitesinin
Apple tasarım diliyle yeniden yorumu. İçerik gerçek topluluk verilerinden derlenmiştir.

## Yığın

- **Backend:** Node.js + Express (form API'leri, sunucu taraflı şablonlar)
- **Şablon:** EJS
- **Frontend:** Saf CSS + saf JS — framework yok, harici font yok, CDN yok
- **Veri:** Form gönderimler `data/*.jsonl` dosyalarına yazılır (JSON Lines)

## Çalıştırma

```bash
npm install
npm start            # http://localhost:3000
```

Geliştirme modu (dosya izleme): `npm run dev`

## Ortam değişkenleri

| Değişken         | Varsayılan        | Açıklama                                        |
|------------------|-------------------|-------------------------------------------------|
| `PORT`           | `3000`            | Sunucu portu                                    |
| `DATA_DIR`       | `./data`          | Form kayıtları + düzenlenebilir içerik deposu   |
| `NODE_ENV`       | —                 | `production` → statik önbellek                  |
| `ADMIN_PASSWORD` | `verimlilik1992`  | Yönetim paneli parolası — **canlıda mutlaka değiştir** |
| `SESSION_SECRET` | rastgele (boot)   | Oturum çerezi imza anahtarı; sabitlersen oturumlar sunucu yeniden başlasa da geçerli kalır |

## Yönetim paneli

`/admin/giris` üzerinden parola ile girilir. Panelden:

- **Projeler:** oluştur/sil; ad, slogan, özet, açıklama paragrafları, bilgi
  kutuları, kapak görseli, galeri, ikon, tema, öne çıkarma ve **proje ekibi**
  (kişi ata/kaldır, fotoğraf yükle) düzenlenir.
- **Komiteler:** oluştur/sil; açıklamalar ve koordinatör atamaları.
- **Kurullar:** Yönetim Kurulu, Denetleme ve Danışma Kurulu, İdari Kurul —
  üye ekle/sil/düzenle. Üyesi olmayan kurul sitede gizlenir.

Düzenlemeler `data/content.json` dosyasına yazılır ve kaydedildiği anda
yayına yansır. Dosya silinirse site `lib/content.js` içindeki tohum veriyle
yeniden başlar. Görsel yüklemeleri `public/img/uploads/` altına gider.

**İçerik git ile taşınır:** `data/content.json` ve `public/img/uploads/`
repoya dahildir — siteyi nereye kurarsanız kurun aynı içerik gelir.
Önerilen akış: içeriği kendi bilgisayarınızda panelden düzenleyin, sonra
`git add . && git commit -m "içerik güncellendi" && git push` ile yayınlayın.
Deploy platformu push'u görünce siteyi otomatik günceller. (Canlı sunucu
üzerinde yapılan panel düzenlemeleri o sunucuda kalır; kalıcı olmaları için
ya oradan da git push kurgusu ya da düzenlemeleri lokalde yapmak gerekir.)
Form kayıtları (`data/*.jsonl`) kişisel veri içerdiği için repoya girmez.

## API

| Uç nokta          | Yöntem | Gövde                                              |
|-------------------|--------|----------------------------------------------------|
| `/api/contact`    | POST   | `name`, `email`, `subject?`, `message`             |
| `/api/newsletter` | POST   | `email`                                            |
| `/api/health`     | GET    | —                                                  |

Tüm POST uçları IP başına dakikada 10 istekle sınırlıdır.

Yönetim API'leri (`/admin/api/...`) HMAC imzalı `vt_admin` çerezi ister:
`login`, `logout`, `upload` (ham görsel gövdesi) ve projeler/komiteler için
POST-PUT-DELETE, kurullar için PUT uçları.

## Docker ile dağıtım

```bash
docker build -t odtuvt-site .
docker run -p 3000:3000 -v odtuvt-data:/app/data odtuvt-site
```

## Sayfalar

`/` · `/hakkimizda` · `/projeler` · `/projeler/:slug` (6 proje) · `/komiteler` · `/komiteler/:slug` · `/ekibimiz` · `/iletisim` · 404

Not: Topluluk internet üzerinden üyelik başvurusu almaz; sitede başvuru
formu yoktur. Eski `/katil` bağlantıları `/iletisim`e yönlendirilir.

## Tasarım sistemi

- **Renk:** VT kırmızısı `#A6192E` (tek vurgu) + Apple nötrleri (`#1d1d1f`, `#f5f5f7`, `#6e6e73`)
- **Tipografi:** SF Pro Display / SF Pro Text sistem yığını, sıkı başlık izlemesi (Apple imzası)
- **Boşluk:** 8px taban ölçek — `8/16/24/32/48/64/96/128`
- **Bileşenler:** hap butonlar (980px radius), buzlu sticky nav, tam genişlik açık/koyu karolar
- **Erişilebilirlik:** WCAG AA kontrast, klavye odak halkaları, `prefers-reduced-motion` desteği
