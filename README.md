# Logam Mulia API

> API publik (gratis & open-source) untuk mengambil data harga jual / beli logam mulia (emas) di Indonesia, hasil _scraping_ dari berbagai website terpercaya.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-Framework-E36002?logo=hono&logoColor=white)](https://hono.dev/)
[![Issues](https://img.shields.io/github/issues/cacing69/logam-mulia-api)](https://github.com/cacing69/logam-mulia-api/issues)
[![Stars](https://img.shields.io/github/stars/cacing69/logam-mulia-api?style=social)](https://github.com/cacing69/logam-mulia-api/stargazers)

---

## Tentang Proyek

**Logam Mulia API** adalah _hobby project_ yang menyediakan _endpoint_ ringan untuk mengambil informasi harga emas dari berbagai sumber di Indonesia dalam format JSON yang konsisten. Cocok digunakan untuk dasbor harga emas, aplikasi tabungan emas, _bot_ notifikasi, atau riset data.

### Program iklan (GitAds)

Repository ini berpartisipasi dalam [GitAds](https://gitads.dev/) - iklan sponsor ditampilkan melalui _badge_ di bawah (bukan konten dalam kode API).

[![Sponsored by GitAds](https://gitads.dev/v1/ad-serve?source=cacing69/logam-mulia-api@github)](https://gitads.dev/v1/ad-track?source=cacing69/logam-mulia-api@github)

## Base URL

```bash
https://logam-mulia-api.iamutaki.workers.dev
```

> Deployment lama di Vercel sudah **inactive** dan API sepenuhnya dilayani melalui Cloudflare Worker. Lihat bagian [Migrasi dari Vercel ke Cloudflare Worker](#migrasi-dari-vercel-ke-cloudflare-worker) untuk detailnya.

## API Documentation

Dokumentasi interaktif OpenAPI 3.0 (auto-generated via `@hono/zod-openapi`) tersedia di:

- **Scalar API Reference:** [`/api/docs`](https://logam-mulia-api.iamutaki.workers.dev/api/docs)
- **OpenAPI JSON:** [`/api/docs/json`](https://logam-mulia-api.iamutaki.workers.dev/api/docs/json)

## Endpoint yang Tersedia

| Source | Status | Endpoint Terkini | Endpoint History | Cached |
| ------ | :----: | ---------------- | ---------------- | :----: |
| anekalogam | ✅ | [`/anekalogam`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam) | [`/anekalogam/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam/history) | ✅ |
| hargaemas-org | ✅ | [`/hargaemas-org`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/hargaemas-org) | [`/hargaemas-org/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/hargaemas-org/history) | ✅ |
| lakuemas | ✅ | [`/lakuemas`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/lakuemas) | [`/lakuemas/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/lakuemas/history) | ✅ |
| sakumas | ✅ | [`/sakumas`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/sakumas) | [`/sakumas/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/sakumas/history) | ✅ |
| kursdolar | ✅ | [`/kursdolar`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/kursdolar) | [`/kursdolar/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/kursdolar/history) | ✅ |
| cermati | ✅ | [`/cermati`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/cermati) | [`/cermati/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/cermati/history) | ✅ |
| indogold | ✅ | [`/indogold`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/indogold) | [`/indogold/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/indogold/history) | ✅ |
| hargaemas-net | ✅ | [`/hargaemas-net`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/hargaemas-net) | [`/hargaemas-net/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/hargaemas-net/history) | ✅ |
| hargaemas-com | ✅ | [`/hargaemas-com`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/hargaemas-com) | [`/hargaemas-com/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/hargaemas-com/history) | ✅ |
| treasury | ✅ | [`/treasury`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/treasury) | - | ❌ |
| logammulia | ✅ | [`/logammulia`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/logammulia) | [`/logammulia/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/logammulia/history) | ✅ |
| emasku | ✅ | [`/emasku`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/emasku) | [`/emasku/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/emasku/history) | ✅ |
| hartadinataabadi | ✅ | [`/hartadinataabadi`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/hartadinataabadi) | [`/hartadinataabadi/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/hartadinataabadi/history) | ✅ |
| galeri24 | ✅ | [`/galeri24`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/galeri24) | [`/galeri24/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/galeri24/history) | ✅ |
| sampoernagold | ✅ | [`/sampoernagold`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/sampoernagold) | - | ❌ |
| bankbsi | ✅ | [`/bankbsi`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/bankbsi) | [`/bankbsi/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/bankbsi/history) | ✅ |
| brankaslm | ✅ | [`/brankaslm`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/brankaslm) | [`/brankaslm/history`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/brankaslm/history) | ✅ |
| pegadaian | ✅ | [`/pegadaian`](https://logam-mulia-api.iamutaki.workers.dev/api/prices/pegadaian) | - | ❌ |

## Format Response

```json
{
  "success": true,
  "data": [
    {
      "source": "anekalogam",
      "material": "gold",
      "materialType": "Antam",
      "weight": 1,
      "weightUnit": "gr",
      "sellPrice": 2700000,
      "buybackPrice": 2650000,
      "currency": "IDR",
      "recordedDate": "2026-05-16",
      "lineKey": "",
      "url": "/api/prices/anekalogam",
      "displayName": "Aneka Logam",
      "logo": "",
      "urlHomepage": "https://www.anekalogam.co.id"
    }
  ],
  "count": 1,
  "timestamp": "2026-05-16T05:06:58.888Z",
  "cached": true
}
```

## Contoh Penggunaan

```bash
# Ambil harga terbaru
curl -X GET "https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam"
```

```bash
# Force refresh / lewati cache harian
curl -X GET "https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam?refresh=true"
```

```bash
# History (default: page=1, length=20)
curl -X GET "https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam/history"
```

```bash
# History dengan pagination
curl -X GET "https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam/history?page=1&length=20"
```

```bash
# History dengan filter berat
curl -X GET "https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam/history?weight=10"
```

```bash
# History dengan filter materialType
curl -X GET "https://logam-mulia-api.iamutaki.workers.dev/api/prices/galeri24/history?materialType=ANTAM"
```

```bash
# History dengan filter gabungan
curl -X GET "https://logam-mulia-api.iamutaki.workers.dev/api/prices/galeri24/history?materialType=ANTAM&weight=1"
```

## Parameter Query (History)

| Param | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `page` | int | Nomor halaman pagination. |
| `length` | int | Jumlah item per halaman (maks. `1000`). |
| `weight` | int | Filter berdasarkan berat (mis. `1`, `5`, `10`). |
| `material` | string | Filter berdasarkan jenis logam (mis. `gold`, `silver`). |
| `materialType` | string | Filter berdasarkan tipe material (mis. `ANTAM`, `UBS`, `GALERI 24`). |

## Tech Stack

- **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework:** [Hono](https://hono.dev/)
- **API Docs:** [`@hono/zod-openapi`](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) + [Scalar](https://scalar.com)

## Roadmap & Sumber Berikutnya

Kami punya daftar panjang website yang **akan diintegrasikan** ke dalam API ini. Daftar lengkapnya beserta status pengerjaan dapat dilihat di sini:

- **[`waiting-list.md`](./waiting-list.md)** - daftar antrean sumber data berikutnya beserta status (`[x]` selesai, `[ ]` belum dikerjakan).
- Punya referensi sumber baru? Tambahkan komentar di issue: [List of websites that can be scraped for data #10](https://github.com/cacing69/logam-mulia-api/issues/10).

## Migrasi dari Vercel ke Cloudflare Worker

API ini sebelumnya berjalan di **Vercel**, namun saat ini deployment Vercel berstatus **paused** (tidak lagi melayani request). Karena itu, seluruh endpoint dipindahkan ke **Cloudflare Worker** agar tetap aktif dan dapat diakses publik.

![Vercel deployment paused - alasan migrasi ke Cloudflare Worker](images/vercel_paused.png)

Status:

- ❌ `https://logam-mulia-api.vercel.app/` - _inactive_
- ✅ `https://logam-mulia-api.iamutaki.workers.dev/` - _active_

## Sponsor & dukungan

API ini gratis dan open source. Jika proyek ini membantu pekerjaan atau produk Anda, pertimbangkan untuk mendukung pengembangan.

## Kontribusi

Kontribusi dalam bentuk apa pun sangat kami hargai! Anda dapat membantu dengan cara:

1. Memberi _star_ pada repository ini.
2. Menambahkan sumber baru dari [`waiting-list.md`](./waiting-list.md) - tinggal pilih item yang masih `[ ]`, lalu kirim _pull request_.
3. Melaporkan _bug_ atau memberi saran melalui [Issues](https://github.com/cacing69/logam-mulia-api/issues).
4. Memperbaiki dokumentasi atau contoh penggunaan.

Sebelum mengirim PR, mohon pastikan kode lulus _test_ lokal (`npm run test`) dan ikuti _style_ yang sudah ada di repo. Terima kasih banyak atas waktu dan kontribusi Anda - proyek ini berkembang berkat dukungan komunitas!

## Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE).
