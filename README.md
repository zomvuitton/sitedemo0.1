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

| Değişken   | Varsayılan | Açıklama                         |
|------------|------------|----------------------------------|
| `PORT`     | `3000`     | Sunucu portu                     |
| `DATA_DIR` | `./data`   | Form kayıtlarının yazıldığı yer  |
| `NODE_ENV` | —          | `production` → statik önbellek   |

## API

| Uç nokta          | Yöntem | Gövde                                              |
|-------------------|--------|----------------------------------------------------|
| `/api/contact`    | POST   | `name`, `email`, `subject?`, `message`             |
| `/api/join`       | POST   | `name`, `email`, `department`, `year?`, `interest?`, `motivation?` |
| `/api/newsletter` | POST   | `email`                                            |
| `/api/health`     | GET    | —                                                  |

Tüm POST uçları IP başına dakikada 10 istekle sınırlıdır.

## Docker ile dağıtım

```bash
docker build -t odtuvt-site .
docker run -p 3000:3000 -v odtuvt-data:/app/data odtuvt-site
```

## Sayfalar

`/` · `/hakkimizda` · `/projeler` · `/projeler/:slug` (8 proje) · `/ekibimiz` · `/iletisim` · `/katil` · 404

## Tasarım sistemi

- **Renk:** VT kırmızısı `#A6192E` (tek vurgu) + Apple nötrleri (`#1d1d1f`, `#f5f5f7`, `#6e6e73`)
- **Tipografi:** SF Pro Display / SF Pro Text sistem yığını, sıkı başlık izlemesi (Apple imzası)
- **Boşluk:** 8px taban ölçek — `8/16/24/32/48/64/96/128`
- **Bileşenler:** hap butonlar (980px radius), buzlu sticky nav, tam genişlik açık/koyu karolar
- **Erişilebilirlik:** WCAG AA kontrast, klavye odak halkaları, `prefers-reduced-motion` desteği
