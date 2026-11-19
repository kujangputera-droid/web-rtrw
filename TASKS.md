# TASKS · Ubah template Website RT/RW: Warga, Iuran, Kas & Surat "portal-rtrw"

Kerjakan **satu task per giliran**, berurutan. Setelah tiap task: cek "Selesai bila", lalu tulis `✅ T# selesai` dan lanjut ke task berikutnya.
Acuan lengkap ada di PRD.md. Bila task dan PRD berbeda, ikuti PRD.

## T0 · Pelajari template dulu (jangan ubah apa pun)
- Baca README, AGENTS.md/DESIGN.md (bila ada), lalu berkas yang aman diubah.
- Catat semua selector di bagian 7 "Wajib dipertahankan" dan cari di mana dipakai.
- Jalankan cara uji di bagian 7 pada versi asli, catat hasilnya sebagai patokan.
- **Selesai bila:** kamu bisa menyebut berkas mana yang akan diubah dan selector mana yang dijaga.

## T1 · Ganti token desain (warna, font, radius)
- Ubah hanya berkas yang aman (bagian 4 Lingkup); jangan sentuh berkas terkunci di bagian 7.
- Simpan warna dan font dari bagian 6 (Arah desain) sebagai variabel/gaya bersama.
- Atur skala tipografi: skala ukuran jelas (48/32/20/16 px), isi 16–18 px, tinggi baris 1.5.
- **Selesai bila:** file terbuka di browser tanpa error, warna & font sudah sesuai.

## T2 · Fitur "Halaman publik"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Tata letak utama: Tab bawah seperti aplikasi HP.
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T3 · Fitur "Panel pengurus berkunci PIN"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Ikuti nuansa bagian 6; buat tata letaknya berbeda dari bagian sebelumnya (jangan monoton).
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T4 · Fitur "Data warga & KK"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Ikuti nuansa bagian 6; buat tata letaknya berbeda dari bagian sebelumnya (jangan monoton).
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T5 · Fitur "Iuran per KK"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Ikuti nuansa bagian 6; buat tata letaknya berbeda dari bagian sebelumnya (jangan monoton).
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T6 · Fitur "Pengingat iuran via WhatsApp berformat rapi"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Ikuti nuansa bagian 6; buat tata letaknya berbeda dari bagian sebelumnya (jangan monoton).
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T7 · Fitur "Kas RT"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Ikuti nuansa bagian 6; buat tata letaknya berbeda dari bagian sebelumnya (jangan monoton).
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T8 · Fitur "Surat pengantar A4 dengan kop & nomor otomatis"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Ikuti nuansa bagian 6; buat tata letaknya berbeda dari bagian sebelumnya (jangan monoton).
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T9 · Fitur "Ekspor/impor CSV + cadangan JSON"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Ikuti nuansa bagian 6; buat tata letaknya berbeda dari bagian sebelumnya (jangan monoton).
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T10 · Fitur "List Usaha"
- Isi: Tetap berfungsi; tampilannya mengikuti gaya baru
- Ikuti nuansa bagian 6; buat tata letaknya berbeda dari bagian sebelumnya (jangan monoton).
- **Selesai bila:** isi lengkap sesuai tabel, rapi di lebar 375 px dan laptop, tidak melanggar Larangan.

## T11 · Animasi & momen pembeda
- elemen muncul (fade + naik 16 px, 400–600 ms) saat masuk layar, pakai IntersectionObserver.
- kartu & tombol terangkat 2–4 px dengan bayangan saat disentuh kursor (200 ms).
- Matikan animasi untuk `prefers-reduced-motion`.
- **Selesai bila:** animasi halus (tanpa patah), momen pembeda terlihat jelas.

## T12 · Uji ulang fitur template
- Buka index.html: tampil tanpa error di Console
- Semua fitur di daftar fitur dicoba satu per satu
- HP 375 px tanpa scroll samping
- Bandingkan dengan hasil uji versi asli dari task pertama.
- **Selesai bila:** semua fitur bekerja sama seperti versi asli.

## T13 · Pemeriksaan akhir
- Cek bagian 10 (Kriteria selesai) PRD satu per satu.
- Cari pelanggaran bagian 9 (Larangan): angka, harga, testimoni, janji, nama karangan.
- Perbaiki yang belum lolos, lalu laporkan daftar kriteria + statusnya.
- **Selesai bila:** semua kriteria berstatus lolos.
