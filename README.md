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

## Tek komutla güncelleme / yayınlama

Panel düzenlemeleri `data/content.json`'ı değiştirdiği için düz `git pull`
sık sık "local changes would be overwritten" hatası verir. Bunun yerine:

- `npm run guncelle` — yerel değişiklikleri güvene alıp GitHub'daki
  yenilikleri çeker (pull etmenin güvenli hâli)
- `npm run yayinla` — aynısını yapar ve kendi değişikliklerini
  GitHub'a da gönderir (push dahil)

## Ortam değişkenleri

| Değişken         | Varsayılan        | Açıklama                                        |
|------------------|-------------------|-------------------------------------------------|
| `PORT`           | `3000`            | Sunucu portu                                    |
| `DATA_DIR`       | `./data`          | Form kayıtları + düzenlenebilir içerik deposu   |
| `NODE_ENV`       | —                 | `production` → statik önbellek                  |
| `ADMIN_PASSWORD` | —                 | Yönetim paneli parolası. **Canlıda zorunlu:** tanımsızsa sunucu açılmaz. Tanımsızken panel yalnızca sunucunun kendi makinesinden erişilebilir. |
| `SESSION_SECRET` | rastgele (boot)   | Oturum çerezi imza anahtarı; sabitlersen oturumlar sunucu yeniden başlasa da geçerli kalır |
| `SITE_URL`       | `http://localhost:3000` | Canlı alan adı (örn. `https://odtuvt.org.tr`) — sitemap, canonical ve paylaşım kartları bunu kullanır |
| `TRUST_PROXY`    | canlıda `1`       | Ters vekil (Cloudflare/Nginx) sayısı. Kapalıyken hız limiti tüm ziyaretçileri tek kişi sayar. |

## Yönetim paneli

`/admin/giris` üzerinden parola ile girilir. Panelden:

- **Projeler:** oluştur/sil; ad, slogan, özet, açıklama paragrafları, bilgi
  kutuları, kapak görseli, galeri, ikon, tema, öne çıkarma ve **proje ekibi**
  (kişi ata/kaldır, fotoğraf yükle) düzenlenir.
- **Komiteler:** oluştur/sil; açıklamalar ve koordinatör atamaları.
- **Kurullar:** Yönetim Kurulu, Denetleme ve Danışma Kurulu, İdari Kurul —
  üye ekle/sil/düzenle. Üyesi olmayan kurul sitede gizlenir.
- **Metinler:** hero, bölüm başlıkları, istatistikler, iletişim bilgileri
  dahil sitedeki tüm sabit yazılar.
- **Etkinlikler:** ana sayfadaki "Yaklaşan etkinlikler" duyuruları;
  tarihi geçenler otomatik gizlenir.
- **Kayıtlar:** iletişim mesajları ve bülten aboneleri, CSV dışa aktarma.
- **Yedekler:** her kayıttan önce alınan son 10 içerik yedeği,
  tek tıkla geri yükleme.

Düzenlemeler `data/content.json` dosyasına yazılır ve kaydedildiği anda
yayına yansır. Dosya silinirse site `lib/content.js` içindeki tohum veriyle
yeniden başlar. Görsel yüklemeleri `public/img/uploads/` altına gider.

**İçerik git ile taşınır:** `data/content.json` ve `public/img/uploads/`
repoya dahildir — siteyi nereye kurarsanız kurun aynı içerik gelir.
Form kayıtları (`data/*.jsonl`) kişisel veri içerdiği için repoya girmez.

### Canlıya çıktıktan sonra içerik nereden düzenlenir

Canlıda bu iki klasör kalıcı diske (volume) bağlanır. Volume ilk kez
oluşturulduğunda depodaki içerikle dolar; **sonrasında depodan bağımsız
yaşar.** Pratikte:

- **İçeriği canlı sitenin kendi panelinden düzenleyin.** Düzenlemeler
  kalıcıdır, konteyner yeniden başlasa da durur.
- Depodaki `data/content.json` artık yalnızca *ilk kurulumun* başlangıç
  içeriğidir. Kendi bilgisayarınızda düzenleyip push etmeniz canlı siteyi
  **değiştirmez** — iki kopya birbirinden ayrılır.
- Canlıdaki içeriği depoya geri almak isterseniz `scripts/yedek.sh` ile
  alınan arşivden `content.json`'ı çıkarıp commit edin.

Volume kullanmadan (içeriği tamamen git'ten yönetmek isterseniz)
`docker-compose.yml` içindeki `volumes` satırlarını kaldırabilirsiniz —
ama o zaman canlı panelden yapılan her düzenleme ilk yeniden başlatmada
kaybolur.

## API

| Uç nokta          | Yöntem | Gövde                                              |
|-------------------|--------|----------------------------------------------------|
| `/api/contact`    | POST   | `name`, `email`, `subject?`, `message`             |
| `/api/newsletter` | POST   | `email`                                            |
| `/api/health`     | GET    | —                                                  |

Form uçları IP başına dakikada 10 istekle sınırlıdır. Yönetici girişi ayrıca
15 dakikada 10 denemeyle sınırlıdır (başarılı girişte sayaç sıfırlanır).

Yönetim API'leri (`/admin/api/...`) HMAC imzalı `vt_admin` çerezi ister:
`login`, `logout`, `upload` (ham görsel gövdesi) ve projeler/komiteler için
POST-PUT-DELETE, kurullar için PUT uçları.

## Canlıya alma

### 1. Sunucu

Kalıcı diski olan bir sunucu gerekir (Hetzner, DigitalOcean vb.). Geçici
diskli platformlarda (Render, Railway'in ücretsiz katmanı gibi) panelden
yapılan düzenlemeler ve yüklenen görseller her yeniden başlatmada silinir.

```bash
git clone https://github.com/zomvuitton/sitedemo0.1 /opt/odtuvt
cd /opt/odtuvt
cp .env.ornek .env        # ADMIN_PASSWORD ve SESSION_SECRET'ı doldurun
docker compose up -d --build
```

`docker-compose.yml` içeriği ve yüklenen görselleri adlandırılmış volume'da
tutar (`vt-data`, `vt-uploads`), süreç çökerse konteyneri yeniden başlatır ve
logları 50 MB'la sınırlar. Site yalnız `127.0.0.1:3000`'e açılır; dışarıya
Nginx/Caddy ya da Cloudflare Tunnel çıkarır.

### 2. Cloudflare (ücretsiz)

Alan adını Cloudflare'e alın, proxy'yi (turuncu bulut) açın. Sağladıkları:
TLS sertifikası, DDoS koruması, statik dosya önbelleği ve — sayfalar
`s-maxage=60` ile döndüğü için — ani trafikte istekleri sunucuya hiç
indirmeden karşılama.

**Alan adı taşınırken MX kayıtlarını olduğu gibi taşıyın**, yoksa
topluluğun e-postası kesilir.

### 3. İzleme

`/api/health` uç noktasını UptimeRobot (ücretsiz) gibi bir servise ekleyin;
site düşerse e-posta gelir. Konteynerin kendi healthcheck'i de vardır.

### 4. Yedek

`scripts/yedek.sh` içeriği, görselleri ve form kayıtlarını tek arşive alır.
Cron'a ekleyin:

```
30 3 * * * /opt/odtuvt/scripts/yedek.sh >> /var/log/vt-yedek.log 2>&1
```

Yedekler sunucunun kendi diskinde durur — **düzenli olarak sunucu dışına da
kopyalayın**, yoksa disk gittiğinde yedekler de gider.

### Yayın öncesi kontrol listesi

- [ ] `.env` dolduruldu (`ADMIN_PASSWORD`, `SESSION_SECRET`, `SITE_URL`)
- [ ] `SITE_URL` gerçek alan adı — yoksa canonical/paylaşım kartları bozulur
- [ ] Cloudflare proxy açık, HTTPS zorunlu
- [ ] MX kayıtları taşındı
- [ ] UptimeRobot `/api/health` izliyor
- [ ] Yedek cron'u kuruldu ve bir kez elle çalıştırılıp denendi
- [ ] Panele giriş yapılıp bir düzenleme kaydedildi, konteyner yeniden
      başlatılıp düzenlemenin kalıcı olduğu doğrulandı

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
