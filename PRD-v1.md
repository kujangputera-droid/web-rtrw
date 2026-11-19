# PRD · Ubah template Website RT/RW: Warga, Iuran, Kas & Surat "portal-rtrw"

Versi 1 · 18 Nov 2026 · Dibuat dengan Pembuat PRD (malikisaputra.biz.id/prd)

## 1. Ringkasan
Ubah tampilan template "Website RT/RW: Warga, Iuran, Kas & Surat" agar sesuai usahaku [portal-rtrw], tanpa merusak fitur yang sudah ada.

## 2. Tujuan & ukuran berhasil
| # | Tujuan | Ukuran berhasil (bisa dicek) |
|---|---|---|
| T1 | Tampilan baru sesuai gaya usahaku | Pola tata letak di bagian 6 terlihat jelas |
| T2 | Semua fitur lama tetap berfungsi | Buka index.html: tampil tanpa error di Console; Semua fitur di daftar fitur dicoba satu per satu |
| T3 | Rapi di HP & laptop | Tidak ada scroll ke samping di lebar 375 px |

## 3. Pengguna
1. warga perumahan

## 4. Lingkup
**Masuk:**
- Mengubah tampilan: index.html, style.css, tema.css

**Tidak masuk (jangan dibuat):**
- Mengubah logika/JavaScript dan format data
- Menambah fitur baru
- Mengubah berkas terkunci: app.js, format data & kunci localStorage

## 5. Fitur / layar (urut dari awal)
| # | Fitur | Yang bisa dilakukan pengguna | Teks persis |
|---|---|---|---|
| 1 | Halaman publik | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 2 | Panel pengurus berkunci PIN | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 3 | Data warga & KK | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 4 | Iuran per KK | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 5 | Pengingat iuran via WhatsApp berformat rapi | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 6 | Kas RT | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 7 | Surat pengantar A4 dengan kop & nomor otomatis | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 8 | Ekspor/impor CSV + cadangan JSON | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 9 | List Usaha | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |

## 6. Arah desain
- **Pola tata letak (Hangat ramah HP):** tab bawah seperti aplikasi HP, kartu besar membulat, ikon garis, tombol tambah mengambang.
- **Nuansa:** Berani: kontras tinggi, blok warna penuh, judul sangat besar, sudut tegas.
- **Tata letak:** Tab bawah seperti aplikasi HP.
- **Warna & font:** [ISI: kode warna utama, aksen, dan font]
- **Tipografi:** skala ukuran jelas (48/32/20/16 px), isi 16–18 px, tinggi baris 1.5.
- **Animasi:**
  - elemen muncul (fade + naik 16 px, 400–600 ms) saat masuk layar, pakai IntersectionObserver.
  - kartu & tombol terangkat 2–4 px dengan bayangan saat disentuh kursor (200 ms).
  - Semua animasi mati bila pengguna memilih `prefers-reduced-motion`.
- **Hindari tampilan template:** jangan semua bagian rata tengah; jangan tiga kartu kembar tanpa variasi; jangan gradien ungu-biru acak; jangan emoji sebagai ikon; beri jarak antarbagian yang lega (minimal 96 px di laptop).

## 7. Persyaratan
- R1. Buka index.html di browser
- R2. Klik Pengurus, masukkan PIN 1234
- R3. Ubah identitas RT & PIN di Pengaturan

**Wajib dipertahankan (jangan dihapus, diganti nama, atau dipindah ke elemen lain):**
- Berkas terkunci (logika): app.js, format data & kunci localStorage
- Berkas data (isinya boleh diganti, struktur & nama field jangan): data.js, tema.js
- #btnAtur #btnMode #btnPanel #cetak #fontTema #isi #merekSub #modal #modalIsi #navBawah #navSamping #toast [data-bagian] [data-tema-nama]
- Kelas yang dibuat oleh JavaScript tetap harus punya gaya di CSS.

**Cara uji fitur setelah diubah:**
1. Buka index.html: tampil tanpa error di Console
2. Semua fitur di daftar fitur dicoba satu per satu
3. HP 375 px tanpa scroll samping

## 8. Fakta yang boleh dipakai
Belum ada. Bila butuh kontak, harga, atau angka, tulis tanda [ISI: …] dan jangan mengarang.

## 9. Larangan (penting)
- Jangan menambah angka (jumlah klien, tahun, rating, statistik) yang tidak tertulis di PRD.
- Jangan menulis harga atau promo yang tidak tertulis di PRD.
- Jangan membuat testimoni, ulasan, atau logo klien.
- Jangan menambah janji atau garansi ("24 jam", "pasti laku").
- Jangan mengarang nama orang, alamat, atau kontak.
- Jangan menambah fitur atau bagian di luar lingkup.

## 10. Kriteria selesai
1. Ketika hasil dicek untuk tujuan T1, maka pola tata letak di bagian 6 terlihat jelas.
2. Ketika hasil dicek untuk tujuan T2, maka buka index.html: tampil tanpa error di Console; Semua fitur di daftar fitur dicoba satu per satu.
3. Ketika hasil dicek untuk tujuan T3, maka tidak ada scroll ke samping di lebar 375 px.
4. Ketika pengguna menjalankan setiap fitur di tabel, maka fitur itu bekerja tanpa error di Console.
5. Ketika halaman dimuat ulang, maka data yang sudah dimasukkan tetap ada.
6. Ketika dibuka di HP lebar 375 px, maka semua tombol bisa ditekan dan tidak ada yang terpotong.
7. Ketika hasil dilihat sekilas, maka nuansa "Berani" terasa (sesuai ciri di bagian 6), bukan tampilan template umum.
8. Ketika seluruh hasil dibaca, maka tidak ada yang melanggar bagian 9 (Larangan).

## 11. Langkah kerja (ikuti berurutan, jangan berhenti di tengah)
1. Baca seluruh PRD dan TASKS. Bila ada [ISI: …] atau yang tidak jelas, tanyakan dulu ke saya. Jangan menebak.
2. Pelajari template asli dan jalankan cara uji di bagian 7 sebelum mengubah apa pun.
3. Ubah tampilan per task (TASKS.md), hanya di berkas yang aman; jaga semua selector di bagian 7.
4. Setelah tiap task, jalankan lagi cara uji fitur. Bila ada yang rusak, kembalikan dulu sebelum lanjut.
5. Cek kriteria selesai, lalu laporkan berkas yang diubah dan hasil uji.
