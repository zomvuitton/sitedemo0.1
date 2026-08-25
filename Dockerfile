FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Bu iki klasör canlıda kalıcı diske (volume) bağlanır: içerik düzenlemeleri
# ve yüklenen görseller konteyner yenilendiğinde kaybolmasın diye.
# Adlandırılmış volume ilk bağlandığında imajdaki içerikle dolar, yani depodaki
# başlangıç içeriği ilk kurulumda kendiliğinden gelir.
RUN mkdir -p data public/img/uploads && chown -R node:node data public/img/uploads

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
