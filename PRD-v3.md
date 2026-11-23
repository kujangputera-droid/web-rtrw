# PRD · Ubah template Website RT/RW: Warga, Iuran, Kas & Surat "portal-rtrw"

Versi 3 · 23 Nov 2026 · Revisi dari PRD Versi 2, 19 Nov 2026 (tersimpan sebagai PRD.md) atas perintah Masdan 23 Nov 2026 (PRD v1 disimpan di PRD-v1.md)

Perubahan dari PRD sebelumnya: (1) deploy ke Cloudflare Pages (proyek web-rtrw, alamat web-rtrw.pages.dev, sambung repo GitHub, tiap push ke main otomatis tayang; alamat GitHub Pages lama tetap jalan); (2) sambung Supabase proyek DB-web-rtrw (tabel cocok model data.js, bucket foto kegiatan rtrw-foto, kode Supabase di web statis lewat CDN tanpa build, localStorage tetap jadi cadangan saat tidak ada internet). Perubahan (2) membuka kunci PRD v1: lapisan data app.js BOLEH diubah hanya untuk baca/tulis Supabase + cadangan localStorage.

## 1. Ringkasan
Ubah template "Website RT/RW: Warga, Iuran, Kas & Surat" agar sesuai usahaku [portal-rtrw], tanpa merusak fitur yang sudah ada — lalu tayangkan lewat Cloudflare Pages dan simpan datanya di Supabase, supaya data tidak hanya tersimpan di browser masing-masing.

## 2. Tujuan & ukuran berhasil
| # | Tujuan | Ukuran berhasil (bisa dicek) |
|---|---|---|
| T1 | Tampilan baru sesuai gaya usahaku | Pola tata letak di bagian 6 terlihat jelas |
| T2 | Semua fitur lama tetap berfungsi | Buka index.html: tampil tanpa error di Console; Semua fitur di daftar fitur dicoba satu per satu |
| T3 | Rapi di HP & laptop | Tidak ada scroll ke samping di lebar 375 px |
| T4 | Web tayang di Cloudflare Pages dan otomatis tayang tiap ada push ke main | Buka https://web-rtrw.pages.dev: tampil tanpa error; push ke main lalu alamat itu ikut berubah tanpa langkah manual |
| T5 | Data tersimpan di Supabase, web tetap bisa dibuka saat tidak ada internet, foto kegiatan bisa diunggah | Tabel ada di Supabase (saat ini kosong, siap diisi sesudah gerbang akses diputuskan); matikan internet lalu buka web: data cadangan dari localStorage tetap tampil; unggah foto kegiatan (sesudah gerbang tulis): foto tersimpan di bucket rtrw-foto dan tampil di galeri |

## 3. Pengguna
1. warga perumahan
2. pengurus RT/RW (lewat Panel Pengurus berkunci PIN)

## 4. Lingkup
**Masuk:**
- Deploy ke Cloudflare Pages: proyek web-rtrw, alamat https://web-rtrw.pages.dev, sambung repo GitHub https://github.com/kujangputera-droid/web-rtrw, tiap push ke main otomatis tayang; alamat GitHub Pages lama tetap jalan
- Sambung Supabase proyek DB-web-rtrw: tabel cocok model data.js (pengaturan, pengurus, kk, anggota_kk, iuran, kas, info, usaha, telpPenting, surat, nomorSurat); galeri kegiatan BUKAN tabel — fotonya di bucket rtrw-foto; kode Supabase di web statis lewat CDN tanpa build (tanpa npm/framework, tetap statis murni HTML/CSS/JS)
- Mengubah lapisan data app.js HANYA untuk baca/tulis Supabase + cadangan localStorage (localStorage tetap jadi cadangan saat tidak ada internet; kunci localStorage `website-rt-data`, mode `?demo` memakai `website-rt-demo`, tetap dipakai sebagai cadangan lokal)
- Menambah berkas baru: supabase.js (lapisan sambung Supabase) dan supabase-schema.sql (skema tabel + bucket)

**Tidak masuk (jangan dibuat):**
- Mengubah tampilan, warna, font, atau fitur apa pun
- Mengubah logika/JavaScript di luar lapisan data (router, render, form, CSV/JSON, cetak surat tetap seperti sekarang)
- Menghapus atau menyembunyikan kredit Template oleh Maliki Saputra (footer, komentar kepala berkas, LICENSE)
- Mengubah PIN panel dan alur Panel Pengurus
- Memasukkan data warga asli — hanya data contoh fiktif dari data.js
- Menambah fitur baru lain di luar lingkup ini

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
| 10 | No Telp Penting | Tetap berfungsi (fitur dari PRD 19 Nov 2026); tampil di halaman publik, terlihat jelas, nomor bisa ditekan untuk menelepon (tel:); nomor nasional 112, 110, 113, 118/119, 115, 123; nomor lokal [ISI: nomor dari Masdan] | (tulis singkat, netral, tanpa klaim) |

## 6. Arah desain
- **Pola tata letak (Hangat ramah HP):** tab bawah seperti aplikasi HP, kartu besar membulat, ikon garis, tombol tambah mengambang.
- **Nuansa:** Berani: kontras tinggi, blok warna penuh, judul sangat besar, sudut tegas.
- **Tata letak:** Tab bawah seperti aplikasi HP.
- **Warna & font:** warna bawaan template dulu atas perintah Masdan 19 Nov 2026 17:08 WIB: utama #2c6e49, aksen #e2723b, font Nunito, radius 18px
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
- R4. Buka https://web-rtrw.pages.dev di browser
- R5. Matikan internet, lalu buka web: data cadangan tetap tampil

**Wajib dipertahankan (jangan dihapus, diganti nama, atau dipindah ke elemen lain):**
- Kredit Template oleh Maliki Saputra (footer "Template oleh @malikisaputra", komentar kepala berkas, LICENSE)
- Berkas data (isinya boleh diganti, struktur & nama field jangan): data.js, tema.js
- #btnAtur #btnMode #btnPanel #cetak #fontTema #isi #merekSub #modal #modalIsi #navBawah #navSamping #toast [data-bagian] [data-tema-nama]
- Kelas yang dibuat oleh JavaScript tetap harus punya gaya di CSS.
- Kunci localStorage `website-rt-data` (dan `website-rt-demo` untuk mode `?demo`) tetap dipakai sebagai cadangan lokal.

**Cara uji fitur setelah diubah:**
1. Buka index.html: tampil tanpa error di Console
2. Semua fitur di daftar fitur dicoba satu per satu
3. HP 375 px tanpa scroll samping
4. Buka https://web-rtrw.pages.dev: tampil tanpa error di Console
5. Matikan internet, muat ulang web: data tetap tampil dari cadangan localStorage
6. Ubah satu data saat online, cek di Supabase: perubahan tersimpan di tabel

## 8. Aturan akses data (gerbang privasi — belum diputuskan, lihat bagian 12)
- Yang publik (boleh dilihat siapa saja tanpa login): info/pengumuman, List Usaha, No Telp Penting, galeri kegiatan.
- Yang TERTUTUP untuk pengunjung tanpa login (anon): data warga & KK (nama, NIK, No. KK, nomor HP), iuran, kas, dan surat. Data ini TIDAK BOLEH tampil di halaman publik sampai gerbang privasi diputuskan Budi/Masdan.
- PERINGATAN — PIN panel hanya di sisi web, bukan kunci server: PIN Panel Pengurus hanya memeriksa di browser (client-side), bukan pengaman di server Supabase. Jadi PIN BUKAN pengaman data. Selama aturan akses Supabase (Row Level Security) belum diputuskan dan dipasang, data tertutup di atas harus dianggap BELUM AMAN dari pembaca langsung, dan web ini belum boleh diisi data warga asli.
- Kunci rahasia Supabase (service_role) TIDAK BOLEH ditaruh di kode web; kode web hanya boleh memakai kunci publik anon lewat CDN.
- Data contoh tetap fiktif dari data.js (semua nama, NIK, No. KK, dan nomor HP di data.js adalah fiktif).

## 9. Fakta yang boleh dipakai
- Cloudflare Pages: proyek web-rtrw, alamat https://web-rtrw.pages.dev, repo https://github.com/kujangputera-droid/web-rtrw, tiap push ke main otomatis tayang; alamat GitHub Pages lama tetap jalan.
- Supabase: proyek DB-web-rtrw, id uoywhmhrlrvldigkhgfj, https://uoywhmhrlrvldigkhgfj.supabase.co, wilayah ap-southeast-1 (Singapura); bucket foto kegiatan rtrw-foto; tabel cocok model data.js (pengaturan, pengurus, kk, anggota_kk, iuran, kas, info, usaha, telpPenting, surat, nomorSurat); galeri kegiatan BUKAN tabel — fotonya di bucket rtrw-foto.
- Nomor darurat nasional Indonesia (terverifikasi dari beberapa sumber, 19 Nov 2026): 112 darurat terpadu, 110 polisi, 113 pemadam kebakaran, 118 dan 119 ambulans, 115 Basarnas, 123 PLN.
- Nomor lokal (Polsek, Puskesmas, RS terdekat, dan lain-lain): [ISI: nomor dari Masdan], jangan mengarang.
- Data usaha asli belum ada; pakai data dummy dulu yang jelas ditandai contoh.
- Bila butuh kontak, harga, atau angka lain, tulis tanda [ISI: …] dan jangan mengarang.

## 10. Larangan (penting)
- Jangan menambah angka (jumlah klien, tahun, rating, statistik) yang tidak tertulis di PRD.
- Jangan menulis harga atau promo yang tidak tertulis di PRD.
- Jangan membuat testimoni, ulasan, atau logo klien.
- Jangan menambah janji atau garansi ("24 jam", "pasti laku").
- Jangan mengarang nama orang, alamat, atau kontak.
- Jangan menambah fitur atau bagian di luar lingkup.
- Jangan memasukkan data warga asli ke web atau ke Supabase — hanya data contoh fiktif dari data.js.
- Jangan mengandalkan PIN panel sebagai pengaman data; jangan menulis di web bahwa data warga "aman" atau "terkunci" hanya karena ada PIN.
- Jangan menaruh kunci rahasia Supabase (service_role) di kode web.

## 11. Kriteria selesai
1. Ketika hasil dicek untuk tujuan T1, maka pola tata letak di bagian 6 terlihat jelas.
2. Ketika hasil dicek untuk tujuan T2, maka buka index.html: tampil tanpa error di Console; Semua fitur di daftar fitur dicoba satu per satu.
3. Ketika hasil dicek untuk tujuan T3, maka tidak ada scroll ke samping di lebar 375 px.
4. Ketika pengguna menjalankan setiap fitur di tabel, maka fitur itu bekerja tanpa error di Console.
5. Ketika halaman dimuat ulang, maka data yang sudah dimasukkan tetap ada.
6. Ketika dibuka di HP lebar 375 px, maka semua tombol bisa ditekan dan tidak ada yang terpotong.
7. Ketika hasil dilihat sekilas, maka nuansa "Berani" terasa (sesuai ciri di bagian 6), bukan tampilan template umum.
8. Ketika seluruh hasil dibaca, maka tidak ada yang melanggar bagian 10 (Larangan).
9. Ketika dibuka https://web-rtrw.pages.dev (sesudah push pertama ke main — saat ini masih menunggu push pertama), maka web tampil tanpa error di Console.
10. Ketika ada push ke main di repo GitHub, maka alamat Cloudflare Pages ikut berubah tanpa langkah manual (proyek sudah tersambung ke repo; terverifikasi sesudah push pertama).
11. Ketika dicek di Supabase, maka tabel (pengaturan, pengurus, kk, anggota_kk, iuran, kas, info, usaha, telpPenting, surat, nomorSurat) ada di Supabase. Saat ini tabel masih kosong — sengaja, siap diisi sesudah gerbang akses diputuskan. Galeri kegiatan bukan tabel; fotonya di bucket rtrw-foto.
12. Ketika internet dimatikan lalu web dimuat ulang, maka data tetap tampil dari cadangan localStorage.
13. Ketika foto kegiatan diunggah (sesudah gerbang akses tulis diputuskan, kebijakan tulis bucket dibuat, dan UI unggah dipasang), maka foto tersimpan di bucket rtrw-foto dan tampil di galeri. Saat ini upload belum bisa: belum ada kebijakan tulis bucket dan belum ada UI unggah.
14. Ketika data contoh dicek, maka semua nama, NIK, No. KK, dan nomor HP tetap fiktif dari data.js (tidak ada data warga asli).

## 12. Langkah kerja (ikuti berurutan, jangan berhenti di tengah)
1. Baca seluruh PRD dan TASKS. Bila ada [ISI: …] atau yang tidak jelas, tanyakan dulu ke saya. Jangan menebak.
2. Pelajari template asli dan jalankan cara uji di bagian 7 sebelum mengubah apa pun.
3. Kerjakan deploy Cloudflare Pages dulu (sambung repo, cek alamat web-rtrw.pages.dev tampil), baru sambung Supabase.
4. Buat tabel + bucket di Supabase sesuai supabase-schema.sql, lalu sambung lewat supabase.js (CDN, tanpa build); jaga semua selector di bagian 7.
5. Setelah tiap langkah, jalankan lagi cara uji fitur. Bila ada yang rusak, kembalikan dulu sebelum lanjut.
6. Cek kriteria selesai, lalu laporkan berkas yang diubah dan hasil uji.

## 13. Yang masih perlu diputuskan (gerbang privasi — BUKAN bagian kerja ini)
1. Aturan akses Supabase (Row Level Security): siapa boleh baca/tulis tiap tabel — diputuskan Budi/Masdan sebelum web diisi data warga asli.
2. Apakah data warga/iuran/kas/surat tetap tertutup total untuk anon, atau ada sebagian yang boleh tampil (misalnya rekap kas tanpa nama) — diputuskan Budi/Masdan.
3. Apakah PIN panel diganti/ditambah pengaman server (misalnya login Supabase Auth untuk pengurus) — diputuskan Budi/Masdan.
4. Kapan data contoh fiktif diganti data warga asli, dan siapa yang memasukkan — diputuskan Masdan.
