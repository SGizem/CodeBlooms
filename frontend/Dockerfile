# Aşama 1: Build ortamı (Node alpine)
FROM node:18-alpine AS build

WORKDIR /app

# Paket dosyalarını kopyala ve bağımlılıkları kur
COPY package.json package-lock.json* ./
RUN npm install

# Uygulama kodlarını kopyala
COPY . .

# Üretim ortamı için build al (Vite varsayılan olarak dist klasörüne build eder)
RUN npm run build

# Aşama 2: Nginx ile serve etme (Nginx alpine)
FROM nginx:alpine

# Vite build çıktılarını Nginx'in sunacağı klasöre kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# React router (SPA) için Nginx konfigürasyonu
# index.html üzerinden tüm routing işlemlerinin çalışmasını sağlar
RUN echo 'server { \
    listen 80; \
    location / { \
    root   /usr/share/nginx/html; \
    index  index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
