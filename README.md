# project-bio — Bio Link + Generator

## Struktur Folder

```
project-bio/
├── index.html               ← Halaman utama bio link
├── x9k2m-create.html        ← Halaman generator (rahasia)
├── css/
│   └── style.css            ← Global styles
├── js/
│   └── script.js            ← Global scripts (particle, parallax, scroll reveal, secret)
└── assets/
    ├── banner/
    │   └── banner.jpg       ← Foto banner (isi sendiri)
    ├── profile/
    │   └── profile.png      ← Foto profil bulat (isi sendiri)
    ├── png/
    │   └── logoyoutube.png  ← Logo-logo link (isi sendiri)
    └── lottie/
        └── loading.json     ← Opsional lottie animation
```

## Setup

1. Taruh foto profil di `assets/profile/profile.png`
2. Taruh foto banner di `assets/banner/banner.jpg`
3. Taruh logo link di `assets/png/` (contoh: logoyoutube.png, logotiktok.png, dll)
4. Buka `index.html` di browser (via live server / web server lokal)

## Sistem Rahasia

- Tombol refresh di kanan atas
- Klik **5x** untuk membuka halaman generator
- Setiap klik 1-4 akan reload halaman (progress tersimpan di localStorage)
- Jika tidak ada klik selama **15 detik**, progress direset otomatis
- Klik ke-5 → loading animation → redirect ke `x9k2m-create.html`

## Cara Pakai Generator

1. Buka halaman generator (via sistem rahasia)
2. Isi form: ID kode, judul, link, logo, posisi, animasi, dsb.
3. Klik **Buat Kode**
4. Copy HTML → paste di `#links-container` di `index.html`
5. Copy CSS → paste di akhir `css/style.css`
6. Copy JS → paste di akhir `js/script.js`

## Kustomisasi

Edit bagian berikut di `index.html`:
- Nama: cari `<h1 class="profile-name">Daffa</h1>`
- Deskripsi: cari `<p class="profile-desc">`
- Tags: cari `<div class="profile-tags">`
- Kalimat penutup: cari `<p class="closing-text">`
- Footer: cari `<footer class="bio-footer">`

## Variabel Warna (CSS)

Edit di `css/style.css` bagian `:root { }`:
- `--accent`: warna aksen (default: `#00b4ff` biru neon)
- `--bg-primary`: background utama
- `--text-primary`: warna teks utama
