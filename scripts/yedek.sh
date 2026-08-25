#!/bin/sh
# Günlük yedek: içerik + yüklenen görseller + form kayıtları.
# Sunucuda cron ile çalıştırın (her gece 03:30):
#   30 3 * * * /opt/odtuvt/scripts/yedek.sh >> /var/log/vt-yedek.log 2>&1
#
# Yedekler sunucunun kendi diskinde durur. Disk tümden giderse hepsi gider:
# üretilen dosyayı ayrıca sunucu dışına (bulut depolama, başka makine) kopyalayın.

set -eu

HEDEF="${YEDEK_DIZINI:-/opt/odtuvt/yedekler}"
GUN_SAYISI="${YEDEK_GUN:-30}"
TARIH=$(date +%Y-%m-%d-%H%M)

mkdir -p "$HEDEF"

# Volume'ları geçici bir konteynerle okuyup tek arşive alıyoruz
docker run --rm \
  -v vt-data:/yedek/data:ro \
  -v vt-uploads:/yedek/uploads:ro \
  -v "$HEDEF":/cikti \
  alpine tar czf "/cikti/odtuvt-$TARIH.tar.gz" -C /yedek .

# Eskiyenleri temizle
find "$HEDEF" -name 'odtuvt-*.tar.gz' -mtime +"$GUN_SAYISI" -delete

echo "$(date '+%F %T') yedek alındı: $HEDEF/odtuvt-$TARIH.tar.gz ($(du -h "$HEDEF/odtuvt-$TARIH.tar.gz" | cut -f1))"
