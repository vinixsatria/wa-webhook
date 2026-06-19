# WAGW - Proxy API dengan NestJS

Aplikasi proxy sederhana yang dibangun dengan NestJS untuk melakukan proxy request ke berbagai backend berdasarkan parameter session.

## Fitur

- ✅ Proxy request ke backend berdasarkan parameter `session`
- ✅ Hanya menerima method POST
- ✅ Konfigurasi backend melalui file JSON
- ✅ Parameter session dapat dikirim via body, query params, atau header
- ✅ Error handling yang komprehensif
- ✅ CORS enabled
- ✅ Hot reload untuk development
- ✅ PM2 process management
- ✅ Auto-restart dan monitoring

## Instalasi

```bash
npm install
```

## Konfigurasi

Edit file `proxy.json` untuk menambahkan atau mengubah pemetaan session ke backend:

```json
[
  {
    "session": "session1",
    "url": "https://api.example1.com"
  },
  {
    "session": "session2", 
    "url": "https://api.example2.com"
  },
  {
    "session": "test",
    "url": "https://httpbin.org"
  }
]
```

## Menjalankan Aplikasi

### Development Mode
```bash
npm run start:dev
```

### Production Mode dengan PM2
```bash
npm run build
npm run pm2:start:prod
```

### Development Mode dengan PM2
```bash
npm run build
npm run pm2:start
```

## Penggunaan

### Format Request
```
POST http://localhost:3000/api/proxy
```

Parameter `session` dapat dikirim melalui:
- **Body (JSON)**: `{"session": "session_name"}`
- **Query Params**: `?session=session_name`
- **Header**: `X-Session: session_name`

### Contoh Penggunaan

1. **POST Request dengan Body**
```bash
curl -X POST "http://localhost:3000/api/proxy/post" \
  -H "Content-Type: application/json" \
  -d '{"session": "test", "key": "value"}'
```

2. **POST Request dengan Query Params**
```bash
curl -X POST "http://localhost:3000/api/proxy/anything?session=test" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

3. **POST Request dengan Header**
```bash
curl -X POST "http://localhost:3000/api/proxy/anything" \
  -H "Content-Type: application/json" \
  -H "X-Session: test" \
  -d '{"key": "value"}'
```

### Response

- **Success**: Response dari backend target
- **Error 400**: Parameter `session` tidak ditemukan atau tidak valid
- **Error 502**: Backend URL tidak ditemukan
- **Error 503**: Tidak dapat terhubung ke backend
- **Error 500**: Error internal server

## Struktur Proyek

```
WAGW/
├── proxy.json              # Konfigurasi pemetaan session ke backend
├── src/
│   ├── controllers/
│   │   └── proxy.controller.ts    # Controller untuk endpoint /proxy
│   ├── services/
│   │   ├── proxy.service.ts       # Service untuk proxy logic
│   │   └── proxy-config.service.ts # Service untuk membaca konfigurasi
│   ├── interfaces/
│   │   └── proxy.interface.ts     # Interface untuk tipe data
│   ├── app.module.ts              # Module utama
│   └── main.ts                    # Entry point aplikasi
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

- `PORT`: Port untuk menjalankan aplikasi (default: 3000)

## Development

### Menambahkan Session Baru

1. Edit file `proxy.json`
2. Tambahkan object baru dengan `session` dan `url`
3. Restart aplikasi atau gunakan `npm run start:dev` untuk hot reload

### Debug Mode

```bash
npm run start:debug
```

### PM2 Management Commands

```bash
# Start aplikasi
npm run pm2:start

# Start aplikasi dengan environment production
npm run pm2:start:prod

# Stop aplikasi
npm run pm2:stop

# Restart aplikasi
npm run pm2:restart

# Hapus aplikasi dari PM2
npm run pm2:delete

# Lihat logs
npm run pm2:logs

# Monitor aplikasi
npm run pm2:monit
```

## License

ISC
