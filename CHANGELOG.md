# Changelog

## Fase A — Code Cleanup & Refactor (kerapihan)
- Hapus `import React` yang tidak perlu di semua komponen (React 19 automatic JSX runtime).
- Tambah CSS variable `--color-success` / `--color-danger` dan class utilitas reusable di `index.css`:
  `.icon-circle`, `.stat-card`, `.step-circle`, `.avatar-circle`, `.sorting-box`, `.footer-link`.
- Hapus dead CSS (`.glass-panel`).
- Refactor inline-style berulang ke class: TrackRecord (stat cards), Workflow (icon circle + sorting boxes), FAQ (avatars), Registration (step circles).
- Ekstrak 4 modal Pricing menjadi 1 komponen `ServiceModal.jsx` reusable + data object `services`.
- Ekstrak 4 business package menjadi array `businessPackages` + `.map()` (hilangkan ~40 baris duplikat).
- Footer hover dipindah dari inline `onMouseOver` JS handler ke CSS `:hover` (`.footer-link`).
- Rapikan import `App.jsx` dan ubah `html lang="en"` → `lang="id"`.
- Verifikasi: `npm run lint` bersih, `npm run build` sukses. Tampilan visual tidak berubah.

## Fase B — Performance & Lightness
- Install `sharp` sebagai devDependency untuk optimasi gambar otomatis.
- Backup aset asli ke `src/assets-backup/`.
- Buat `scripts/optimize-images.mjs` untuk kompresi/resize aset (reproducible).
- Optimasi gambar (total aset dist turun ~1.9MB → 708KB):
  - `workflow-img-1.png` / `workflow-img-2.png` → JPEG q80 (336K→116K, 387K→119K).
    Import di `Workflow.jsx` diubah `.png` → `.jpg`.
  - `hero1.jpg` compress q72 (172K→152K).
  - 4 logo partner: resize height 120px + compress (total ~399K→6.3K).
- Tambah `loading="lazy"` + `decoding="async"` pada semua `<img>` non-hero (TrackRecord, Workflow).
- Perbaiki parallax Hero: dari `setState` tiap scroll → `ref` + `requestAnimationFrame`
  (tidak memicu re-render React setiap scroll event).

## Cara menjalankan optimasi ulang
Jika mengganti gambar di `src/assets/`, jalankan:
```bash
node scripts/optimize-images.mjs
```
Aset asli tersimpan di `src/assets-backup/` untuk pemulihan.
