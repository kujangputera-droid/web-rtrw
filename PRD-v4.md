# PRD · Ubah template Website RT/RW: Warga, Iuran, Kas & Surat "portal-rtrw"

Versi 4 · 24 Nov 2026 · Revisi dari PRD Versi 3, 23 Nov 2026 (tersimpan sebagai PRD-v3.md; PRD v1 di PRD-v1.md, PRD v2 di PRD.md) atas perintah Masdan 24 Nov 2026 15:50 WIB ("kerjakan sekarang semua halaman nya, pastikan backupnya web rtrw master sudah aman ya")

Perubahan dari PRD sebelumnya (v3 → v4): (1) gerbang privasi v3 bagian 12–13 diputuskan sebagian: PIN panel tidak lagi hanya cek di browser — PIN dicek lewat server (RPC di Supabase) dan disimpan sebagai hash, jadi web boleh mulai dipakai dengan data pengurus nyata di trial RT Masdan; (2) hirarki 5 level ditetapkan: L1 Superadmin (Masdan, pemilik web), L2 Admin RW, L3 Admin RT, L4 Pengurus sesuai peran, L5 Warga (halaman publik saja); 1 RW berisi beberapa RT; (3) pendaftaran wilayah RT/RW baru + pendaftaran pengurus dengan status menunggu dan persetujuan berlapis; (4) 11 UI baru: Masuk baru, Pendaftaran pengurus, Pendaftaran wilayah, Kelola Pengurus, Kelola Wilayah, Halaman RW, Pilih wilayah, Akun saya, Lupa PIN via WA, Disclaimer, Log histori per wilayah; (5) skema database baru: tabel pengurus tambah 8 kolom, tabel wilayah baru, tabel log_riwayat baru, tabel sesi baru, 20 RPC SECURITY DEFINER bertoken (lihat bagian 9E–9G); (6) MVP hibrid: RT boleh daftar dulu baru RW atau sebaliknya, dengan verifikasi RW dan kode verifikasi RW; flow tetap nanti RW dulu baru RT.

Perubahan di dalam v4 (perbaikan Pekerja 1 + Pekerja 2, 24 Nov 2026, tanpa naik versi — PRD tetap v4): semua RPC admin kini memakai token sesi (verifikasi_pin mengembalikan token 64 hex berlaku 8 jam; token disimpan sebagai hash di tabel sesi; peran + wilayah diambil server dari sesi, bukan dari parameter browser). Tanda tangan lama tanpa token DIHAPUS di server. Daftar lengkap RPC ada di bagian 9E.

Yang TIDAK berubah dari v3: (a) halaman publik + 8 menu Panel Pengurus tetap seperti sekarang; (b) tampilan, warna (#2c6e49 / #e2723b), font Nunito, dan arah desain bagian 11 tetap; (c) deploy Cloudflare Pages (proyek web-rtrw, https://web-rtrw.pages.dev) dan Supabase proyek DB-web-rtrw tetap; (d) localStorage tetap cadangan saat tidak ada internet; (e) kredit Template oleh Maliki Saputra tetap dipertahankan; (f) data warga asli di luar data pengurus/wilayah trial tetap belum dimasukkan — data contoh di data.js tetap fiktif.

## 1. Ringkasan
Ubah template "Website RT/RW: Warga, Iuran, Kas & Surat" agar sesuai usahaku [portal-rtrw], tanpa merusak fitur yang sudah ada — lalu tayangkan lewat Cloudflare Pages dan simpan datanya di Supabase, supaya data tidak hanya tersimpan di browser masing-masing. Di v4, web menjadi bisa dipakai banyak RT/RW: tiap pengurus punya PIN sendiri yang dicek server, tiap wilayah mendaftar dan disetujui berlapis, dan semua kejadian penting dicatat di log histori per wilayah.

## 2. Tujuan & ukuran berhasil
| # | Tujuan | Ukuran berhasil (bisa dicek) |
|---|---|---|
| T1 | Tampilan baru sesuai gaya usahaku | Pola tata letak di bagian 11 terlihat jelas |
| T2 | Semua fitur lama tetap berfungsi | Buka index.html: tampil tanpa error di Console; Semua fitur di daftar fitur dicoba satu per satu |
| T3 | Rapi di HP & laptop | Tidak ada scroll ke samping di lebar 375 px |
| T4 | Web tayang di Cloudflare Pages dan otomatis tayang tiap ada push ke main | Buka https://web-rtrw.pages.dev: tampil tanpa error; push ke main lalu alamat itu ikut berubah tanpa langkah manual |
| T5 | Data tersimpan di Supabase, web tetap bisa dibuka saat tidak ada internet, foto kegiatan bisa diunggah | Tabel ada di Supabase; matikan internet lalu buka web: data cadangan dari localStorage tetap tampil; unggah foto kegiatan: foto tersimpan di bucket rtrw-foto dan tampil di galeri |
| T6 | Pengurus masuk dengan PIN sendiri yang dicek server, bukan PIN bersama 1234 di browser | Masuk dengan PIN salah ditolak server; masuk dengan PIN benar berhasil; anon tidak bisa membaca PIN/hash dari database |
| T7 | Wilayah RT/RW baru bisa mendaftar dan disetujui berlapis (MVP hibrid) | RT daftar dulu tanpa RW bisa disetujui Superadmin; RT daftar di bawah RW yang sudah ada diverifikasi RW; kode verifikasi RW yang salah ditolak |
| T8 | Kejadian penting tercatat di log histori per wilayah dan tidak bisa diubah RT | Tambah/ubah data lalu cek log: ada baris waktu + siapa + apa; coba ubah/hapus log sebagai Admin RT: gagal |

## 3. Pengguna (hirarki 5 level — rincian lengkap di bagian 5)
1. L1 Superadmin — Masdan, pemilik web.
2. L2 Admin RW — Ketua RW / admin satu RW, membawahi beberapa RT.
3. L3 Admin RT — Ketua RT / admin satu RT.
4. L4 Pengurus — Sekretaris, Bendahara, Sie, dan jabatan lain sesuai peran yang ditentukan Admin RT.
5. L5 Warga — hanya halaman publik, tanpa masuk.

## 4. Lingkup
**Masuk (v4):**
- 11 UI baru di bagian 6 (Masuk baru, Pendaftaran pengurus, Pendaftaran wilayah, Kelola Pengurus, Kelola Wilayah, Halaman RW, Pilih wilayah, Akun saya, Lupa PIN via WA, Disclaimer, Log histori per wilayah)
- Ganti PIN pindah dari Pengaturan ke Akun saya
- Skema database v4 di bagian 9 (kolom baru pengurus, tabel wilayah, tabel log_riwayat, RPC, RLS) — sudah dikerjakan Pekerja 1, dicatat di PRD ini sebagai acuan, bukan untuk dikerjakan ulang
- PIN dicek lewat server (RPC verifikasi_pin); PIN lama bersama 1234 hanya berlaku sebagai PIN awal Superadmin seed sampai diganti (lihat bagian 10 dan 18)
- Email ditambahkan sebagai kolom data pengurus dan wilayah, hanya disimpan — TIDAK dipakai mengirim apa pun di v4 (lihat bagian 16)

**Tidak masuk (jangan dibuat di v4):**
- Mengubah tampilan, warna, font, atau fitur halaman publik dan 8 menu Panel Pengurus di luar 11 UI baru (Ganti PIN pindah ke Akun saya adalah pengecualian yang disetujui)
- Menghapus atau menyembunyikan kredit Template oleh Maliki Saputra (footer, komentar kepala berkas, LICENSE)
- Memasukkan data warga asli di luar data pengurus/wilayah trial — data contoh tetap fiktif dari data.js
- Semua yang tertulis di bagian 16 (verifikasi email, reset lewat email, batas menu per jabatan secara rinci, email/SMTP apa pun)

## 5. Hirarki 5 level — fungsi, peran, dan batas

Aturan umum: 1 RW berisi beberapa RT. Berlaku sama untuk RW lain yang mau pakai web ini. Data ditandai per wilayah (wilayah_id). Sesudah Superadmin menyetujui sebuah RT, persetujuan selanjutnya (pengurus baru, peran, dan urusan dalam RT itu) adalah urusan RT itu sendiri tanpa Superadmin lagi — ditulis juga di Disclaimer (bagian 6, UI 10).

### L1 — Superadmin (Masdan, pemilik web)
- Fungsi: pemilik web; menyetujui wilayah RT/RW baru hanya bila RW-nya belum ada; mengangkat Admin (Admin RW / Admin RT) dan menonaktifkan wilayah; cadangan terakhir bila Admin RT lupa PIN (WA ke Superadmin); bisa membaca log histori semua wilayah.
- Yang BOLEH: setujui/tolak wilayah baru yang RW-nya belum ada; angkat Admin; nonaktifkan wilayah; reset PIN siapa pun sebagai cadangan (bukan SOP sehari-hari); baca log semua wilayah.
- Yang TIDAK BOLEH: ikut campur persetujuan pengurus di dalam RT yang sudah disetujui (itu urusan RT sendiri); memakai web untuk menindak warga — penindakan tetap offline lewat musyawarah.

### L2 — Admin RW (Ketua RW / admin satu RW)
- Fungsi: membawahi beberapa RT di bawah RW-nya; memverifikasi RT yang mengaku di bawah RW-nya (memastikan PAK/BU RT-nya memang benar orangnya); memberi kode verifikasi RW ke Ketua RT; melihat halaman RW berisi kartu-kartu RT di bawahnya.
- Yang BOLEH: verifikasi atau tolak RT yang mengaku di bawah RW-nya; memberi kode verifikasi RW; melihat data publik tiap RT di bawahnya, sama seperti warga; memilih wilayah bila memegang banyak wilayah.
- Yang TIDAK BOLEH: intervensi ke dalam RT (tidak bisa menyetujui/menolak pengurus RT, tidak bisa mengubah data RT, tidak bisa menonaktifkan RT); memeriksa keuangan RT (keuangan RT bukan dari RW; pemeriksaan RW di luar alur web ini); melihat log histori RT (log RT hanya Admin RT-nya + Superadmin); mengakses database langsung; menindak warga lewat web.

### L3 — Admin RT (Ketua RT / admin satu RT)
- Fungsi: admin satu RT; menyetujui/menolak pengurus yang mendaftar di RT-nya; menentukan peran tiap pengurus (akses tidak sama semua); mengaktifkan/menonaktifkan pengurus; mereset PIN pengurus lewat panel; menyetujui warga yang mau listing usaha, dengan syarat warga itu sudah terdaftar sebagai warga di RT tersebut; membaca log histori RT-nya sendiri.
- Yang BOLEH: setujui/tolak pengurus baru di RT-nya; ubah jabatan/peran pengurus; aktif/nonaktif pengurus; reset PIN pengurus (menghasilkan PIN sementara + kode pemulihan baru, dikirim lewat WA); setujui listing usaha warga terdaftar; baca log RT-nya sendiri.
- Yang TIDAK BOLEH: menyetujui wilayah baru (itu L1 bila RW belum ada, atau L2 bila RW sudah ada); melihat log RT lain; mengubah/menghapus log (log tidak bisa diubah/dihapus oleh RT); mengakses database langsung; menindak warga lewat web.

### L4 — Pengurus (Sekretaris, Bendahara, Sie, dan lain-lain)
- Fungsi: membantu Admin RT sesuai peran yang ditentukan Admin RT.
- Yang BOLEH: memakai menu Panel Pengurus sesuai peran yang diberikan Admin RT; mengganti PIN sendiri; memakai kode pemulihan sendiri.
- Yang TIDAK BOLEH: menyetujui pengurus baru; mengubah peran sendiri atau pengurus lain; mereset PIN pengurus lain; melihat log histori; melihat data wilayah lain di luar wilayahnya; mengakses database langsung.

### L5 — Warga (publik)
- Fungsi: hanya memakai halaman publik.
- Yang BOLEH: melihat halaman publik RT mana pun (info/pengumuman, List Usaha, No Telp Penting, galeri kegiatan, kartu Bayar iuran sebagai info); melihat halaman RW (kartu-kartu RT beserta data publik tiap RT).
- Yang TIDAK BOLEH: masuk Panel Pengurus tanpa PIN; melihat data warga & KK, iuran, kas, surat, dan log histori; mengakses database langsung; mendaftar sebagai pengurus tanpa persetujuan Admin RT.

Catatan batas yang disetujui Masdan: RW hanya lihat data publik berarti RW tidak bisa periksa keuangan RT. Warga bisa lihat RT lain berarti pengumuman jangan berisi data pribadi. Web ini hanya memudahkan informasi antar warga, bukan menindak; penindakan tetap offline lewat musyawarah.

## 6. Fitur / layar

### 6A. Fitur lama (tetap berfungsi, dari v3)
| # | Fitur | Yang bisa dilakukan pengguna | Teks persis |
|---|---|---|---|
| 1 | Halaman publik | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 2 | Panel pengurus berkunci PIN | Tetap berfungsi, dengan Masuk baru (UI 1 di bawah); tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 3 | Data warga & KK | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 4 | Iuran per KK | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 5 | Pengingat iuran via WhatsApp berformat rapi | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 6 | Kas RT | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 7 | Surat pengantar A4 dengan kop & nomor otomatis | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 8 | Ekspor/impor CSV + cadangan JSON | Tetap berfungsi; tampilannya mengikuti gaya baru | (tulis singkat, netral, tanpa klaim) |
| 9 | List Usaha | Tetap berfungsi; hanya usaha warga lingkungan ini; dikelola pengurus lewat Panel Pengurus; warga yang mau listing harus sudah terdaftar sebagai warga di RT itu dan disetujui Admin RT | (tulis singkat, netral, tanpa klaim) |
| 10 | No Telp Penting | Tetap berfungsi; tampil di halaman publik, terlihat jelas, nomor bisa ditekan untuk menelepon (tel:); nomor nasional 112, 110, 113, 118/119, 115, 123; nomor lokal [ISI: nomor dari Masdan] | (tulis singkat, netral, tanpa klaim) |

### 6B. 11 UI baru (v4) — alur langkah demi langkah

#### UI 1 — Masuk baru
1. Pengguna membuka halaman masuk.
2. Pengguna memilih wilayah (daftar wilayah aktif saja — anon hanya bisa SELECT wilayah status='aktif', lihat bagian 9).
3. Pengguna memilih namanya dari daftar pengurus aktif wilayah itu (daftar diambil lewat RPC daftar_pengurus_aktif — hanya id, nama, jabatan, peran, wilayah_id, status; tanpa hash).
4. Pengguna mengetik PIN 4–6 angka.
5. Web memanggil RPC verifikasi_pin (nama + PIN + wilayah_id); RPC hanya mengembalikan baris bila status='aktif' dan PIN cocok; bila tidak cocok, kembalikan kosong — web menampilkan pesan "PIN salah, coba lagi" tanpa memberi tahu apakah nama atau PIN-nya yang salah. Bila PIN cocok, RPC juga mengembalikan token sesi (64 karakter hex, berlaku 8 jam); web WAJIB menyimpan token itu di sessionStorage dan mengirimnya sebagai p_token pertama di semua RPC admin berikutnya (lihat bagian 9G). Token kadaluarsa / ditolak server → web melempar pengguna ke halaman masuk dengan pesan "Sesi habis, masuk lagi".
6. Bila PIN cocok dan pin_sementara=true, pengguna wajib ganti PIN dulu sebelum bisa memakai panel (lihat UI 8).
7. Halaman masuk menampilkan tautan "Lupa PIN" (ke UI 9) dan "Daftar" (ke UI 2).
8. PIN lama bersama 1234 tidak lagi dipakai sebagai pintu masuk umum; 1234 hanya PIN awal Superadmin seed (lihat bagian 9) sampai Superadmin menggantinya.

#### UI 2 — Pendaftaran pengurus
1. Calon pengurus membuka halaman daftar dari tautan di halaman masuk.
2. Calon pengurus mengisi: nama, jabatan, nomor WA, email, kode verifikasi RW, lalu membuat PIN 4–6 angka dan mengetik ulang PIN itu.
3. Calon pengurus mencentang "Saya setuju dengan Disclaimer" (tanpa centang, pendaftaran tidak bisa dikirim).
4. Web memeriksa: PIN 4–6 angka, PIN ulang sama dengan PIN pertama, kode verifikasi RW cocok dengan kode wilayah yang didaftar (bila wilayah sudah punya RW — lihat bagian 7).
5. Bila lolos, web menyimpan pendaftaran dengan status='menunggu' dan peran='pengurus' (anon hanya boleh INSERT dengan status='menunggu' dan peran='pengurus', lihat bagian 9). PIN disimpan sebagai hash, bukan tulisan biasa.
6. Web menampilkan kode pemulihan SATU KALI di layar dan meminta calon pengurus menyimpannya (dicatat/difoto). Kode ini tidak bisa ditampilkan lagi sesudah layar ini ditutup (lihat bagian 10 dan catatan bentrok di bagian 19, poin 3).
7. Status tetap 'menunggu' sampai Admin RT wilayah itu menyetujui (UI 4). Sebelum disetujui, calon pengurus tidak bisa masuk — RPC verifikasi_pin hanya menerima status='aktif'.

#### UI 3 — Pendaftaran wilayah RT/RW baru
1. Pendaftar membuka halaman daftar wilayah.
2. Pendaftar mengisi: jenis wilayah (RT atau RW), nomor (contoh: RT 07 / RW 13), kelurahan, kecamatan, kota, provinsi, nama Ketua + nomor WA Ketua + email Ketua.
3. Bila jenis = RT, pendaftar memilih RW induk (bila RW sudah terdaftar) dan mengisi nama Ketua RW + kode verifikasi RW.
4. Bila jenis = RW, pendaftar tidak memilih RW induk (RW tidak punya induk di web ini).
5. Web menyimpan wilayah dengan status='menunggu' (anon hanya boleh INSERT wilayah status='menunggu', lihat bagian 9).
6. Persetujuan mengikuti bagian 7: RW belum ada → Superadmin menyetujui; RW sudah ada → RW memverifikasi (UI 6). Wilayah baru tampil di daftar pilih wilayah dan halaman RW hanya sesudah status='aktif'.

#### UI 4 — Kelola Pengurus (Admin RT + Superadmin)
1. Admin RT membuka Kelola Pengurus di wilayahnya (Superadmin bisa membuka di wilayah mana pun sebagai cadangan).
2. Daftar menampilkan pengurus dengan status 'menunggu', 'aktif', dan 'nonaktif' di wilayah itu.
3. Admin RT dapat: menyetujui pendaftaran (menunggu → aktif) atau menolaknya; mengaktifkan/menonaktifkan pengurus aktif; mengubah jabatan/peran pengurus.
4. Admin RT dapat mereset PIN seorang pengurus: panel membuat PIN sementara baru + kode pemulihan baru, lalu menampilkan tombol "Kirim lewat WA" dengan format pesan yang sudah disiapkan web (PIN sementara + kode pemulihan baru).
5. Setiap tindakan di UI ini dicatat ke log_riwayat (persetujuan, penolakan, aktif/nonaktif, reset PIN, ganti peran) — lihat UI 11.
6. Pengurus biasa (L4) TIDAK bisa membuka UI ini.

#### UI 5 — Kelola Wilayah (Superadmin saja)
1. Superadmin membuka Kelola Wilayah.
2. Daftar menampilkan semua RW dan RT beserta statusnya (menunggu / aktif / nonaktif).
3. Superadmin dapat: menyetujui wilayah baru yang RW-nya belum ada (menunggu → aktif) atau menolaknya; mengangkat Admin (Admin RW / Admin RT) untuk sebuah wilayah; menonaktifkan wilayah.
4. Wilayah yang dinonaktifkan tidak tampil di daftar pilih wilayah dan halaman masuk.
5. Setiap tindakan di UI ini dicatat ke log_riwayat.
6. Admin RW dan Admin RT TIDAK bisa membuka UI ini.

#### UI 6 — Halaman RW
1. Warga/pengurus membuka halaman satu RW.
2. Halaman menampilkan banyak kartu RT di bawah RW itu; tiap kartu berisi data publik RT tersebut (info/pengumuman, List Usaha, galeri — tanpa data pribadi, tanpa data warga/KK, tanpa iuran/kas/surat, tanpa log).
3. Halaman memuat bagian verifikasi: daftar RT yang mengaku berada di bawah RW ini dan masih menunggu verifikasi (lihat bagian 7).
4. Admin RW dapat menyetujui (verifikasi) atau menolak RT dari bagian verifikasi ini. Verifikasi RW hanya memastikan PAK/BU RT-nya memang benar orangnya; apa yang dilakukan di dalam RT sesudah itu tanggung jawab RT masing-masing.
5. RW TIDAK bisa mengubah isi kartu RT, data RT, atau log RT dari halaman ini.

#### UI 7 — Pilih wilayah
1. UI ini dipakai oleh Superadmin dan Admin RW yang memegang banyak wilayah.
2. Sesudah masuk, pengguna yang memegang lebih dari satu wilayah memilih wilayah mana yang mau dikelola di sesi ini.
3. Pengguna yang hanya memegang satu wilayah langsung masuk ke wilayahnya tanpa layar ini.
4. Pilihan wilayah menentukan data mana yang tampil di panel dan log mana yang ditulis (log selalu per wilayah_id).

#### UI 8 — Akun saya
1. Pengurus yang sudah masuk membuka Akun saya.
2. Halaman menampilkan: nama, jabatan, wilayah, nomor WA, email.
3. Ganti PIN (pindah dari Pengaturan ke halaman ini): pengurus memasukkan PIN lama, PIN baru 4–6 angka, dan PIN baru sekali lagi. PIN baru dicek lewat RPC atur_pin_baru (PIN lama harus cocok; bila cocok, pin_sementara dimatikan).
4. PIN sementara: bila pengurus masuk dengan pin_sementara=true, web langsung mengarahkan ke ganti PIN di halaman ini dan panel tidak bisa dipakai sebelum PIN diganti.
5. Kode pemulihan: halaman ini TIDAK menampilkan kode pemulihan lama (kode hanya disimpan sebagai hash dan tidak bisa dibalik — lihat bagian 19, poin 3). Yang ditampilkan: apakah kode pemulihan masih ada atau sudah dipakai, dan tombol "Buat kode pemulihan baru" — kode baru ditampilkan satu kali di layar, lalu hanya hash-nya yang disimpan.
6. Pengurus memakai kode pemulihan lewat RPC pakai_kode_pemulihan_wilayah (nama + wilayah_id + kode + PIN baru); kode yang cocok langsung dikosongkan (sekali pakai) dan hanya berlaku bila status='aktif'. RPC lama pakai_kode_pemulihan (nama saja, tanpa wilayah_id) SUDAH DIHAPUS di server — jangan dipakai.

#### UI 9 — Lupa PIN (via WA ke Pak RT)
1. Pengguna di halaman masuk mengklik "Lupa PIN".
2. Web langsung membuka WhatsApp ke Pak RT (Admin RT wilayah itu) dengan format pesan yang sudah disiapkan web (nama pengurus + wilayah + permintaan reset PIN). WA dikirim dari WA masing-masing pengurus — gratis, bukan WA Business API dari server (lihat bagian 10).
3. Pak RT membuka Kelola Pengurus (UI 4), memilih pengurus itu, dan mereset PIN: panel membuat PIN sementara baru + kode pemulihan baru.
4. Pak RT mengirim PIN sementara + kode pemulihan baru ke pengurus lewat WA dengan format pesan yang disiapkan web.
5. Pengurus masuk dengan PIN sementara, lalu WAJIB mengganti PIN saat pertama masuk (UI 8, langkah 4). PIN sementara tidak boleh dipakai seterusnya.
6. Kalau Pak RT sendiri yang lupa PIN, alurnya sama tetapi WA ditujukan ke Superadmin (bukan ke Pak RT). Nomor WA Superadmin TIDAK ADA di RPC anon mana pun — web memakai nomor WA ketua wilayah bila ketuanya memang Masdan (Superadmin); bila nomor itu kosong, halaman lupa PIN menampilkan pesan "Nomor WA Superadmin belum diisi — hubungi Masdan langsung" (bukan tombol WA ke nomor karangan).
7. Alur ini dinyatakan disetujui Masdan 24 Nov 2026 13:27 WIB ("sudah beres ini urusan lupa password") — rancangan selesai, dan v4 ini yang membangunnya. Perilaku bila ketua_wa wilayah kosong: halaman menampilkan peringatan jelas dan tetap menyediakan formulir kode pemulihan di bawah sebagai jalan lain.

#### UI 10 — Disclaimer
1. Halaman Disclaimer berisi 6 aturan. Isi yang sudah disepakati Masdan (kata-kata sama persis dengan yang tampil di web, app.js ATURAN_DISCLAIMER):
   1. Superadmin hanya menyetujui wilayah masuk.
   2. Isi dan kebenaran data tanggung jawab RT/RW masing-masing.
   3. PIN dan email tanggung jawab pemilik akun, jangan dibagikan ke orang lain.
   4. Pengumuman publik jangan berisi data pribadi seperti NIK atau nama warga yang nunggak.
   5. Superadmin berhak menonaktifkan wilayah yang menyalahgunakan web.
   6. Penindakan tetap offline lewat musyawarah, web ini hanya memudahkan informasi antar warga.
2. Calon pengurus wajib mencentang "Saya setuju dengan Disclaimer" saat daftar (UI 2); tanpa centang, pendaftaran tidak bisa dikirim.
3. Tautan ke Disclaimer ada di footer web, bisa dibuka siapa saja tanpa masuk.
4. Isi Disclaimer di atas SUDAH final di v4 — jangan diubah tanpa keputusan Masdan (bagian 19, poin 5 sudah terjawab).

#### UI 11 — Log histori per wilayah
1. Log mencatat per wilayah: waktu, pelaku_nama, pelaku_peran, aksi, rincian.
2. Isi yang dicatat: tambah/ubah/hapus warga, iuran, kas, surat, pengumuman, persetujuan, reset PIN, ganti peran (tambah/ubah/hapus warga, iuran, kas, surat dicatat bila aksi itu dilakukan lewat panel; data lama localStorage sebelum v4 tidak punya log).
3. Yang bisa membaca log satu wilayah: Admin RT wilayah itu sendiri dan Superadmin. RW TIDAK bisa lihat log RT. Warga TIDAK bisa lihat log.
4. Log TIDAK bisa diubah atau dihapus oleh RT — log adalah bahan musyawarah offline bila ada selisih.
5. Penulisan log hanya lewat fungsi server (lihat bagian 9); anon tidak punya akses baca/tulis apa pun atas tabel log_riwayat.

## 7. Alur pendaftaran wilayah — MVP hibrid vs flow tetap

### MVP hibrid (yang dibangun di v4 — trial di RT Masdan dulu, campur offline)
- RT boleh daftar dulu baru RW, atau sebaliknya (RW daftar dulu baru RT).
- Bila RW belum ada saat RT mendaftar: persetujuan RT ke Superadmin (UI 5). Superadmin menyetujui, RT menjadi aktif.
- Bila RW sudah ada saat RT mendaftar: persetujuan RT ke RW dulu (UI 6, bagian verifikasi). RW memverifikasi bahwa RT itu betul di bawahnya dan PAK/BU RT-nya memang benar orangnya.
- Kode verifikasi RW: RW memberi kode ke Ketua RT; Ketua RT memasukkan kode itu saat daftar (UI 2 dan UI 3). Kode yang salah → pendaftaran tidak bisa lanjut.
- Bila RW baru mendaftar sesudah ada RT yang mengaku di bawahnya: RW mengonfirmasi daftar RT yang mengaku di bawahnya itu di Halaman RW (UI 6).
- Alasan hibrid: ini MVP dan trial di RT Masdan dulu; verifikasi offline (kenal orangnya, musyawarah) masih dipakai berdampingan dengan verifikasi di web.

### Flow tetap (nanti, BUKAN di v4)
- RW dulu yang mendaftar, baru RT-nya bisa daftar — memakai kode verifikasi RW.
- RT tidak bisa daftar sebelum RW-nya ada dan aktif.
- Flow tetap ini dicatat di PRD sebagai arah, dan TIDAK dibangun di v4. Perubahan dari hibrid ke flow tetap adalah revisi PRD naik versi (v5), bukan perubahan diam-diam di v4.

## 8. Alur lupa PIN — lengkap (ringkasan alur ada di UI 9; bagian ini alur ujung-ke-ujung)
1. Pengurus lupa PIN → klik "Lupa PIN" di halaman masuk → WA ke Pak RT (format siap) → Pak RT reset di Kelola Pengurus → panel buat PIN sementara + kode pemulihan baru → Pak RT kirim keduanya lewat WA (format siap) → pengurus masuk dengan PIN sementara → wajib ganti PIN saat pertama masuk → PIN sementara mati, PIN baru berlaku.
2. Jalur darurat bila pengurus juga kehilangan kode pemulihan: tetap lewat Pak RT (reset dari panel, UI 4) — kode pemulihan bukan satu-satunya jalan; reset oleh Admin RT selalu tersedia.
3. Jalur bila Pak RT lupa PIN: WA ke Superadmin → Superadmin reset dari Kelola Pengurus → kirim PIN sementara + kode pemulihan baru lewat WA → Pak RT wajib ganti PIN saat pertama masuk.
4. Jalur bila Superadmin lupa PIN: Superadmin lupa PIN → reset lewat dashboard Supabase oleh pemilik web (Masdan) dibantu Budi; tidak ada alur mandiri di web. PERLU KONFIRMASI MASDAN — jalur ini ditulis di PRD atas arahan koordinator sebagai fallback yang didokumentasikan, belum pernah disetujui Masdan secara eksplisit (lihat bagian 19, poin 8).
5. Yang TIDAK ada di alur ini: kirim tautan reset ke email, kirim kode 6 angka ke email, halaman buat PIN baru lewat email — semuanya TIDAK dibuat di v4 (lihat bagian 16).

## 9. Skema database (Supabase proyek DB-web-rtrw — dikerjakan Pekerja 1, dicatat di sini sebagai acuan)

### 9A. Tabel pengurus — tambah 8 kolom (kolom lama id, jabatan, nama, wa tidak diubah)
| Kolom | Jenis / aturan | Keterangan |
|---|---|---|
| pin_hash | text | Hash SHA-256 dari PIN; TIDAK PERNAH tulisan biasa |
| kode_pemulihan_hash | text | Hash SHA-256 dari kode pemulihan; null bila sudah dipakai / belum ada |
| status | text, NOT NULL, default 'menunggu', check ('menunggu', 'aktif', 'nonaktif') | Pendaftaran baru selalu 'menunggu' |
| peran | text, NOT NULL, default 'pengurus', check ('superadmin', 'admin_rw', 'admin_rt', 'pengurus') | Peran dasar v4; batas menu rinci per jabatan TIDAK di v4 |
| email | text, NOT NULL, default '' | Hanya disimpan; tidak dipakai kirim apa pun di v4 |
| wilayah_id | text | Wilayah pengurus (contoh seed: 'rt07-rw13-pagelaran') |
| pin_sementara | boolean, NOT NULL, default false | true = PIN dari reset, wajib diganti saat pertama masuk |
| dibuat | timestamptz, NOT NULL, default now() | Waktu pendaftaran |

### 9B. Tabel wilayah — baru
| Kolom | Jenis / aturan | Keterangan |
|---|---|---|
| id | text, primary key | Contoh seed: 'rt07-rw13-pagelaran' |
| jenis | text, NOT NULL, check ('rt', 'rw') | RT atau RW |
| nomor | text, NOT NULL | Contoh: '07' (RT) / '13' (RW) |
| kelurahan | text, NOT NULL, default '' | Contoh seed: 'Pagelaran' |
| kecamatan | text, NOT NULL, default '' | Contoh seed: 'Ciomas' |
| kota | text, NOT NULL, default '' | Contoh seed: 'Kabupaten Bogor' |
| provinsi | text, NOT NULL, default '' | Contoh seed: 'Jawa Barat' |
| ketua_nama | text, NOT NULL, default '' | Nama Ketua wilayah |
| ketua_wa | text, NOT NULL, default '' | Nomor WA Ketua |
| ketua_email | text, NOT NULL, default '' | Email Ketua; hanya disimpan di v4 |
| rw_induk_id | text | ID RW induk untuk RT; null bila RW belum terdaftar (MVP hibrid) atau bila jenis = RW |
| kode_verifikasi | text | Kode verifikasi RW; null bila belum ada / tidak berlaku (lihat catatan keamanan bagian 10) |
| status | text, NOT NULL, default 'menunggu', check ('menunggu', 'aktif', 'nonaktif') | Wilayah baru selalu 'menunggu' |
| dibuat | timestamptz, NOT NULL, default now() | Waktu pendaftaran |

### 9C. Tabel log_riwayat — baru
| Kolom | Jenis / aturan | Keterangan |
|---|---|---|
| id | text, primary key, default gen_random_uuid()::text | ID unik log |
| wilayah_id | text | Wilayah tempat kejadian |
| waktu | timestamptz, NOT NULL, default now() | Kapan kejadian |
| pelaku_nama | text, NOT NULL, default '' | Siapa yang berbuat |
| pelaku_peran | text, NOT NULL, default '' | Peran pelaku saat itu |
| aksi | text, NOT NULL | Apa yang dilakukan |
| rincian | text, NOT NULL, default '' | Rincian tambahan |

### 9D. Seed awal (sudah dimasukkan Pekerja 1)
- Wilayah (2 baris, sesudah perbaikan Pekerja 5, 24 Nov 2026): (1) RT 07 — id 'rt07-rw13-pagelaran', jenis 'rt', nomor '07', kelurahan 'Pagelaran', kecamatan 'Ciomas', kota 'Kabupaten Bogor', provinsi 'Jawa Barat', ketua_nama 'Masdan', ketua_wa '', ketua_email '', rw_induk_id 'rw13-pagelaran' (kini di bawah RW 13), kode_verifikasi null, status 'aktif'. (2) RW 13 — id 'rw13-pagelaran', jenis 'rw', nomor '13', kelurahan 'Pagelaran', kecamatan 'Ciomas', kota 'Kabupaten Bogor', provinsi 'Jawa Barat', ketua_nama '', ketua_wa '', ketua_email '', rw_induk_id null, kode_verifikasi null, status 'aktif' (ketua kosong karena RW 13 di-seed hanya sebagai induk RT 07 supaya halaman RW bisa didemokan).
- Superadmin awal: nama 'Masdan', jabatan 'Superadmin', peran 'superadmin', status 'aktif', wa '', email '', wilayah_id 'rt07-rw13-pagelaran', pin_hash = hash SHA-256 dari PIN awal '1234' (PIN lama), kode_pemulihan_hash null, pin_sementara false. TIDAK ada pengurus contoh lain yang di-seed.

### 9E. RPC SECURITY DEFINER (hash dihitung di server; hash tidak pernah keluar ke browser)
Daftar LENGKAP semua RPC yang ada sekarang (sesudah perbaikan Pekerja 1 + Pekerja 2, 24 Nov 2026). Semua RPC admin memakai token sesi sebagai parameter pertama (p_token) — tanda tangan lama tanpa token DIHAPUS di server (DROP), jadi tidak bisa lagi dipanggil. Peran + wilayah pemohon SELALU diambil server dari baris sesi (tabel sesi, bagian 9G), bukan dari parameter browser. RPC yang tetap anon (tanpa token): daftar_pengurus, daftar_pengurus_aktif, verifikasi_pin (penerbit token), pakai_kode_pemulihan_wilayah.

| Fungsi | Masukan | Keluaran / perilaku |
|---|---|---|
| verifikasi_pin(p_nama, p_pin, p_wilayah_id) | nama, PIN, wilayah_id | Kembalikan baris (id, nama, jabatan, peran, wilayah_id, status, pin_sementara, token) HANYA bila status='aktif' dan PIN cocok; bila tidak cocok kembalikan kosong. Token = 64 karakter hex acak, berlaku 8 jam (lihat 9G). TIDAK mengembalikan pin_hash / kode_pemulihan_hash. |
| keluar_sesi(p_token) | token | Hapus token dari tabel sesi (logout). Token tidak dikenal → false. |
| daftar_pengurus_aktif(p_wilayah_id) | wilayah_id | Daftar pengurus AKTIF di satu wilayah — hanya kolom non-sensitif (id, nama, jabatan, peran, wilayah_id, status), tanpa hash. Dipakai halaman masuk (UI 1) dan lupa PIN. Anon. |
| daftar_pengurus(p_nama, p_jabatan, p_wa, p_email, p_kode_verifikasi, p_pin, p_wilayah_id) | data pendaftaran | Mendaftar pengurus baru (status='menunggu', peran='pengurus'); PIN + kode pemulihan disimpan sebagai hash; kode pemulihan dikembalikan sekali ke pendaftar. Server memvalidasi kode verifikasi RW (wilayah harus ada + aktif, kode salah ditolak) dan PIN harus 4–6 angka (^[0-9]{4,6}$). Kode verifikasi pendaftar divalidasi lalu TIDAK disimpan di baris pengurus (kolom pengurus.kode_verifikasi sudah di-drop). Anon. Pendaftaran HANYA lewat RPC ini — GRANT INSERT anon ke tabel pengurus DICABUT (perbaikan Pekerja 5). |
| atur_pin_baru(p_token, p_pin_lama, p_pin_baru) | token, PIN lama, PIN baru | true bila PIN lama cocok dan PIN baru tersimpan (pin_sementara dimatikan); false bila PIN lama salah. PIN baru divalidasi server: harus 4–6 angka (^[0-9]{4,6}$). Hanya pemilik token itu sendiri. Dipakai ganti PIN (UI 8). |
| buat_kode_pemulihan_baru(p_token, p_pin) | token, PIN | Kembalikan kode pemulihan baru (sekali tampil) bila PIN cocok; hanya pemilik token itu sendiri. Dipakai UI 8. |
| profil_pengurus(p_token) | token | Hanya profil pemilik token (id, nama, jabatan, peran, wilayah_id, wa, email, ada_kode). Dipakai Akun saya (UI 8) dan validasi token di web. |
| pakai_kode_pemulihan_wilayah(p_nama, p_wilayah_id, p_kode, p_pin_baru) | nama, wilayah_id, kode, PIN baru | true bila kode cocok dan status='aktif'; kode langsung dikosongkan sesudah dipakai (sekali pakai); pin_sementara dimatikan. PIN baru divalidasi server: harus 4–6 angka (^[0-9]{4,6}$). Anon. RPC lama pakai_kode_pemulihan (nama saja) SUDAH DIHAPUS. |
| tulis_log(p_token, p_aksi, p_rincian, p_wilayah_target DEFAULT NULL) | token, aksi, rincian, wilayah target (opsional) | Menulis satu baris ke log_riwayat. wilayah_id + pelaku_nama + pelaku_peran diambil server dari baris sesi — TIDAK LAGI dari parameter, jadi log tidak bisa dipalsukan dari browser. Bila p_wilayah_target diisi (dan cakupan wilayah pemohon mengizinkan), log tercatat di wilayah TARGET — atribusi log lintas wilayah SUDAH diperbaiki (lihat §19 poin 9). Tanpa token valid → exception 'token sesi tidak valid'. |
| baca_log(p_token, p_wilayah_id) | token, wilayah_id | Daftar log satu wilayah. Superadmin boleh baca semua wilayah (p_wilayah_id kosong = semua); peran lain hanya wilayahnya sendiri (p_wilayah_id di luar wilayah sesi diabaikan). Dipakai UI 11. |
| daftar_semua_pengurus(p_token, p_wilayah_id) | token, wilayah_id | Daftar pengurus satu wilayah (menunggu / aktif / nonaktif). Masking kolom: wa/email HANYA untuk superadmin + admin_rt wilayah itu; admin_rw mendapat baris tanpa kontak (wa/email string kosong). Pengurus biasa (L4) mengembalikan [] — _boleh_wilayah('pengurus') = false, jadi tidak ada baris sama sekali, bukan baris tanpa kontak. Keputusan koordinator: admin_rw TETAP mendapat baris pengurus RT anaknya (nama/jabatan/peran/status saja, tanpa kontak) — nama pengurus adalah data publik (template menampilkan nama pengurus di halaman publik); yang sensitif (kontak, aksi) sudah tertutup. Kolom pengurus.kode_verifikasi SUDAH DI-DROP — RPC ini tidak lagi mengembalikan kode verifikasi pendaftar; UI tidak lagi menampilkannya. Dipakai UI 4. |
| setujui_pengurus(p_token, p_pengurus_id) | token, id pengurus | menunggu → aktif. Hanya bila cakupan wilayah sesi mengizinkan. Target Superadmin DITOLAK bila pemohon bukan Superadmin itu sendiri (guard server N1; UI menyembunyikan tombol Setujui/Tolak pada kartu Superadmin bila sesi bukan Superadmin itu). Dipakai UI 4. |
| tolak_pengurus(p_token, p_pengurus_id) | token, id pengurus | Hapus pendaftaran menunggu. Hanya bila cakupan wilayah sesi mengizinkan. Target Superadmin DITOLAK bila pemohon bukan Superadmin itu sendiri (guard server N1; UI menyembunyikan tombol). Dipakai UI 4. |
| ubah_pengurus(p_token, p_pengurus_id, p_jabatan, p_peran, p_status) | token, id, jabatan, peran, status | Ubah jabatan/peran/status. Pengangkatan ke admin_rt / admin_rw / superadmin HANYA bila peran token = superadmin; target Superadmin hanya boleh diubah dirinya sendiri. Dipakai UI 4 dan angkat Admin (UI 5). |
| reset_pin_admin(p_token, p_pengurus_id) | token, id pengurus | Kembalikan (pin sementara, kode pemulihan baru) untuk pengurus aktif; PIN lama langsung tidak berlaku. Target Superadmin DITOLAK bila pemohon bukan Superadmin itu sendiri (guard server N1; UI menyembunyikan tombol Reset PIN pada kartu Superadmin bila sesi bukan Superadmin itu). Dipakai UI 4. |
| daftar_semua_wilayah(p_token) | token | Semua RW + RT beserta statusnya. Hasil TANPA kolom kode_verifikasi (tidak pernah keluar lewat RPC ini). Masking: ketua_wa / ketua_email dikosongkan untuk peran pengurus (hanya superadmin + admin wilayah itu yang melihat kontak ketua). Dipakai UI 5 dan filter log Superadmin. |
| baca_kode_verifikasi(p_token, p_wilayah_id) | token, wilayah_id | Kembalikan kode_verifikasi satu wilayah — hanya superadmin (wilayah mana pun) atau admin_rw atas wilayahnya sendiri; peran lain / token tidak valid → null. Satu-satunya jalan membaca kode_verifikasi wilayah lewat RPC. Dipakai form Ubah data wilayah (UI 5). |
| ubah_wilayah(p_token, p_wilayah_id, p_nomor, p_kelurahan, p_kecamatan, p_kota, p_provinsi, p_ketua_nama, p_ketua_wa, p_ketua_email, p_kode_verifikasi, p_rw_induk_id) | token + 11 param | Ubah data wilayah. Cakupan wilayah via sesi (superadmin semua; admin_rt wilayahnya sendiri). admin_rw DITOLAK di RPC ini (perbaikan Pekerja 5) — admin_rw hanya boleh verifikasi RT lewat ubah_status_wilayah + membaca kode wilayahnya lewat baca_kode_verifikasi. Dipakai UI 5. |
| ubah_status_wilayah(p_token, p_wilayah_id, p_status) | token, id wilayah, status | Ubah status wilayah. Superadmin: wilayah mana pun. admin_rw: hanya RT yang rw_induk_id-nya = wilayah sesi (verifikasi RT, UI 6). admin_rt / pengurus: tidak boleh. Dipakai UI 5 dan UI 6. |
| daftar_rt_menunggu_rw(p_token, p_rw_id) | token, id RW | Daftar RT berstatus 'menunggu' yang rw_induk_id-nya = RW itu. Superadmin: RW mana pun; admin_rw: hanya RW-nya sendiri; admin_rt: hanya RW induk wilayahnya. Dipakai UI 6. |

Semua fungsi di atas memakai SECURITY DEFINER dengan search_path = public, extensions; hash dihitung dengan extensions.digest(..., 'sha256') (pgcrypto terpasang di skema extensions, bukan public). Helper internal _sesi_valid / _boleh_wilayah TIDAK diberi GRANT ke siapa pun.

### 9G. Sistem token sesi (F1 — dikerjakan Pekerja 1, dipakai web oleh Pekerja 2)
- Tabel sesi: kolom pengurus_id, token_hash (SHA-256 dari token, bukan token aslinya), peran, wilayah_id, kadaluarsa (waktu terbit + 8 jam). RLS aktif TANPA kebijakan anon dan TANPA GRANT apa pun atas tabel sesi — tabel tidak bisa dibaca/ditulis langsung oleh anon.
- Penerbitan: verifikasi_pin yang berhasil membuat token acak 32 byte (64 karakter hex), menyimpan HASH-nya di sesi, dan mengembalikan token ASLI sekali ke browser. PIN salah / nama tidak ada / tidak aktif → kosong, tanpa token.
- Penyimpanan di web: token disimpan di sessionStorage bersama objek sesi (app.js simpanSesi); TIDAK PERNAH di localStorage. Tab ditutup = sesi hilang.
- Validasi: ada DI DALAM tiap fungsi (helper _sesi_valid: hash token cocok + belum kadaluarsa; _boleh_wilayah: superadmin semua wilayah, admin_rt wilayahnya sendiri, admin_rw wilayahnya sendiri + RT di bawahnya). GRANT EXECUTE saja tidak memberi akses — tanpa token valid fungsi mengembalikan false/kosong (tulis_log melempar exception 'token sesi tidak valid').
- Logout: tombol Keluar memanggil keluar_sesi(p_token) lalu menghapus sesi lokal. Token palsu / kadaluarsa di sessionStorage → web melempar pengguna ke halaman masuk dengan pesan "Sesi habis, masuk lagi" (cek sekali per muat halaman lewat profil_pengurus).
- Batasan yang diketahui: token yang bocor tetap berlaku sampai 8 jam / kadaluarsa (tidak ada daftar blokir token); pakai_kode_pemulihan_wilayah tetap anon tanpa rate limit (lihat bagian 18).

### 9F. RLS + GRANT (anon)
- Tabel pengurus: RLS aktif. GRANT INSERT anon ke tabel pengurus DICABUT (perbaikan Pekerja 5) — pendaftaran pengurus HANYA lewat RPC daftar_pengurus, bukan INSERT langsung. TIDAK ADA SELECT anon atas pengurus. TIDAK ADA GRANT SELECT atas pengurus untuk anon.
- Batas peran admin_rw (perbaikan Pekerja 5): admin_rw DITOLAK di setujui_pengurus, tolak_pengurus, ubah_pengurus, reset_pin_admin, dan ubah_wilayah. admin_rw HANYA BOLEH: ubah_status_wilayah (verifikasi RT anaknya), daftar_rt_menunggu_rw (RW-nya sendiri), baca_kode_verifikasi (wilayahnya sendiri), dan tulis_log. admin_rw mendapat baris daftar_semua_pengurus RT anaknya TANPA kontak (nama/jabatan/peran/status saja — keputusan koordinator, nama pengurus adalah data publik).
- Tabel wilayah: RLS aktif. Anon boleh INSERT pendaftaran (status='menunggu') dan SELECT hanya wilayah status='aktif' (untuk pilih wilayah + halaman RW). GRANT: select, insert atas wilayah untuk anon.
- Tabel log_riwayat: RLS aktif. TIDAK ADA kebijakan anon sama sekali. TIDAK ADA GRANT select/insert/update/delete atas log_riwayat untuk anon. Baca/tulis log hanya lewat fungsi server (tulis_log / baca_log, bertoken).
- Tabel sesi: RLS aktif TANPA kebijakan anon dan TANPA GRANT apa pun (lihat 9G).
- GRANT EXECUTE atas semua RPC di bagian 9E diberikan ke anon dan authenticated. GRANT saja tidak memberi akses ke RPC admin — validasi token + peran ada DI DALAM fungsi (lihat 9G).
- Tabel lama v3 (pengaturan, kk, anggota_kk, iuran, kas, info, usaha, telp_penting, surat, nomor_surat) dan bucket rtrw-foto tetap seperti v3; aturan akses data warga (bagian 13) tetap berlaku.

## 10. Aturan keamanan
- K1. PIN dan kode pemulihan TIDAK PERNAH disimpan sebagai tulisan biasa — hanya hash SHA-256 (pin_hash, kode_pemulihan_hash). PIN awal seed '1234' pun disimpan sebagai hash.
- K2. Anon TIDAK BISA membaca hash PIN: tidak ada kebijakan SELECT apa pun atas tabel pengurus untuk anon, dan tidak ada GRANT SELECT atas pengurus untuk anon. Daftar nama untuk halaman masuk diambil lewat RPC daftar_pengurus_aktif (tanpa hash). Verifikasi PIN hanya lewat RPC verifikasi_pin.
- K3. Kunci rahasia Supabase (service_role) TIDAK BOLEH ditaruh di kode web; kode web hanya boleh memakai kunci publik anon lewat CDN.
- K4. PIN sementara WAJIB diganti saat pertama masuk (pin_sementara=true mengunci panel sampai PIN diganti lewat UI 8).
- K5. Kode pemulihan SEKALI PAKAI: begitu dipakai lewat pakai_kode_pemulihan, kode langsung dikosongkan (kode_pemulihan_hash = null) dan tidak bisa dipakai kedua kali. Kode pemulihan baru dibuat tiap kali reset PIN (UI 4) dan tiap kali pengurus membuat kode baru (UI 8).
- K6. Log tidak bisa diubah/dihapus RT: tidak ada kebijakan anon atas log_riwayat, dan tidak ada UPDATE/DELETE log untuk siapa pun kecuali pemilik proyek lewat service key.
- K7. WA gratis dari WA masing-masing, bukan dari server: semua WA di v4 (lupa PIN, kirim PIN sementara, pengingat iuran) dibuka dari WA pengirim sendiri lewat tautan wa.me dengan format pesan siap — TIDAK memakai WA Business API berbayar dari server, dan TIDAK ada pengiriman pesan otomatis dari server.
- K8. Email di v4 hanya kolom simpanan: email disimpan (pengurus + ketua wilayah) tetapi TIDAK dipakai mengirim apa pun — tidak ada verifikasi email, tidak ada tautan reset lewat email (lihat bagian 16).
- K9. Catatan jujur soal kode verifikasi RW: ada DUA kode yang berbeda — jangan dicampur. (1) Kode verifikasi pendaftar: kode yang diketik pendaftar saat daftar; divalidasi server saat daftar (cocok dengan kode_verifikasi wilayah + wilayah aktif) lalu TIDAK DISIMPAN di baris pengurus — kolom pengurus.kode_verifikasi sudah DI-DROP, daftar_semua_pengurus tidak lagi mengembalikannya, dan UI Kelola Pengurus tidak lagi menampilkannya. (2) Kode verifikasi wilayah: kolom kode_verifikasi di tabel wilayah, disimpan sebagai teks biasa (sesuai skema Pekerja 1), TIDAK di-hash seperti PIN. Keputusan koordinator: RW harus bisa membaca dan memberikannya ke Ketua RT, jadi kode tidak bisa di-hash. Kode ini hanya dipakai sekali saat daftar dan harus diganti berkala secara manual; jangan menulis di web bahwa kode verifikasi "terenkripsi" atau "seaman PIN". Kode_verifikasi wilayah TIDAK PERNAH dikembalikan lewat RPC anon — hanya lewat baca_kode_verifikasi (superadmin wilayah mana pun / admin_rw atas wilayahnya sendiri).
- K10. Data contoh tetap fiktif dari data.js (semua nama, NIK, No. KK, dan nomor HP di data.js adalah fiktif). Data warga asli di luar trial pengurus/wilayah tetap belum dimasukkan.
- K11. Token sesi: token asli (64 hex) hanya ada sekali di tangan browser yang baru masuk dan sebagai hash di tabel sesi; token TIDAK PERNAH ditulis ke localStorage (hanya sessionStorage). Token yang bocor tetap berlaku sampai 8 jam / kadaluarsa — tidak ada daftar blokir token di v4. Tombol Keluar memanggil keluar_sesi untuk menghapus token di server.

## 11. Arah desain (tetap dari v3)
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
- 11 UI baru mengikuti pola yang sama (kartu besar membulat, tab bawah di HP, tombol jelas, pesan kesalahan yang bisa dimengerti warga).

## 12. Persyaratan
- R1. Buka index.html di browser
- R2. Klik Pengurus, pilih wilayah, pilih nama, masukkan PIN
- R3. Ubah identitas RT di Pengaturan; ubah PIN di Akun saya (bukan lagi di Pengaturan)
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
2. Semua fitur di daftar fitur dicoba satu per satu, termasuk 11 UI baru
3. HP 375 px tanpa scroll samping
4. Buka https://web-rtrw.pages.dev: tampil tanpa error di Console
5. Matikan internet, muat ulang web: data tetap tampil dari cadangan localStorage
6. Ubah satu data saat online, cek di Supabase: perubahan tersimpan di tabel
7. Daftar pengurus baru, setujui sebagai Admin RT, lalu masuk dengan PIN-nya: berhasil; sebelum disetujui, masuk ditolak
8. Coba baca tabel pengurus langsung dengan kunci anon (tanpa RPC): ditolak / kosong — hash tidak bisa dibaca

## 13. Aturan akses data (gerbang privasi v3 — sebagian diputuskan di v4)
- Yang publik (boleh dilihat siapa saja tanpa login): info/pengumuman, List Usaha, No Telp Penting, galeri kegiatan, kartu Bayar iuran sebagai info, daftar wilayah aktif, kartu-kartu RT di Halaman RW (data publik saja).
- Yang TERTUTUP untuk pengunjung tanpa login (anon): data warga & KK (nama, NIK, No. KK, nomor HP), iuran, kas, dan surat. Data ini TIDAK BOLEH tampil di halaman publik.
- Yang TERTUTUP untuk anon dan hanya lewat RPC: PIN/hash PIN, kode pemulihan/hash-nya, daftar pengurus (nama pengurus aktif hanya tampil lewat RPC daftar_pengurus_aktif di halaman masuk), dan seluruh log_riwayat.
- Peringatan v3 yang SUDAH dijawab di v4: PIN tidak lagi hanya cek di browser — PIN dicek lewat server (RPC verifikasi_pin) dan disimpan sebagai hash. Namun PIN tetap PIN 4–6 angka (lihat bagian 18): jangan menulis di web bahwa data warga "aman" hanya karena ada PIN.
- Kunci rahasia Supabase (service_role) TIDAK BOLEH ditaruh di kode web; kode web hanya boleh memakai kunci publik anon lewat CDN.
- Data contoh tetap fiktif dari data.js (semua nama, NIK, No. KK, dan nomor HP di data.js adalah fiktif).

## 14. Fakta yang boleh dipakai
- Cloudflare Pages: proyek web-rtrw, alamat https://web-rtrw.pages.dev, repo https://github.com/kujangputera-droid/web-rtrw, tiap push ke main otomatis tayang; alamat GitHub Pages lama tetap jalan.
- Supabase: proyek DB-web-rtrw, id uoywhmhrlrvldigkhgfj, https://uoywhmhrlrvldigkhgfj.supabase.co, wilayah ap-southeast-1 (Singapura); bucket foto kegiatan rtrw-foto; tabel v3 cocok model data.js (pengaturan, pengurus, kk, anggota_kk, iuran, kas, info, usaha, telp_penting, surat, nomor_surat); galeri kegiatan BUKAN tabel — fotonya di bucket rtrw-foto.
- Seed v4: wilayah 2 baris — RT 07 'rt07-rw13-pagelaran' (di bawah RW 13) + RW 13 'rw13-pagelaran' (Pagelaran, Ciomas, Kabupaten Bogor, Jawa Barat, aktif) + Superadmin 'Masdan' dengan PIN awal '1234' (sebagai hash).
- Nomor darurat nasional Indonesia (terverifikasi dari beberapa sumber, 19 Nov 2026): 112 darurat terpadu, 110 polisi, 113 pemadam kebakaran, 118 dan 119 ambulans, 115 Basarnas, 123 PLN.
- Nomor lokal (Polsek, Puskesmas, RS terdekat, dan lain-lain): [ISI: nomor dari Masdan], jangan mengarang.
- Data usaha asli belum ada; pakai data dummy dulu yang jelas ditandai contoh.
- Fakta email dari riset Budi 24 Nov 2026 (dokumen Supabase): pengirim email bawaan Supabase gratis tapi hanya 2 email per jam dan hanya ke tim sendiri, tidak untuk produksi; SMTP sendiri bisa dipakai di paket gratis (mulai 30 email per jam); penyedia seperti Resend/SendGrid ada paket gratisnya. Fakta ini dicatat sebagai alasan email DITUNDA ke fase skala besar, bukan sebagai janji fitur.
- Bila butuh kontak, harga, atau angka lain, tulis tanda [ISI: …] dan jangan mengarang.

## 15. Larangan (penting)
- Jangan menambah angka (jumlah klien, tahun, rating, statistik) yang tidak tertulis di PRD.
- Jangan menulis harga atau promo yang tidak tertulis di PRD.
- Jangan membuat testimoni, ulasan, atau logo klien.
- Jangan menambah janji atau garansi ("24 jam", "pasti laku").
- Jangan mengarang nama orang, alamat, atau kontak.
- Jangan menambah fitur atau bagian di luar lingkup.
- Jangan memasukkan data warga asli ke web atau ke Supabase — hanya data contoh fiktif dari data.js (pengecualian: data pengurus/wilayah trial yang didaftarkan lewat UI v4).
- Jangan mengandalkan PIN panel sebagai pengaman data; jangan menulis di web bahwa data warga "aman" atau "terkunci" hanya karena ada PIN.
- Jangan menaruh kunci rahasia Supabase (service_role) di kode web.
- Jangan mengarang isi Disclaimer (bagian 6, UI 10 sudah final di v4) dan jangan mengarang nomor lokal (lihat bagian 14).

## 16. Yang TIDAK dibuat di v4 (eksplisit)
1. Verifikasi email — email yang diisi saat daftar TIDAK diverifikasi (tidak ada tautan/kode verifikasi ke email).
2. Reset PIN lewat email — tidak ada halaman lupa PIN lewat email, tidak ada tautan reset ke email, tidak ada kode 6 angka ke email.
3. Pengiriman email apa pun — tidak ada SMTP, tidak ada penyedia email (Resend/SendGrid/dll), tidak ada email sambutan, pemberitahuan, atau pengingat lewat email. Email hanya kolom simpanan, dipakai nanti saat skala besar.
4. Batas menu per jabatan secara rinci — v4 hanya memakai peran dasar (superadmin, admin_rw, admin_rt, pengurus). Menu mana yang boleh dibuka tiap jabatan di luar yang tertulis di bagian 5 dan 6 TIDAK dirinci di v4.
5. Flow tetap "RW dulu baru RT" — v4 memakai MVP hibrid (bagian 7); flow tetap dicatat sebagai arah nanti dan butuh PRD naik versi.
6. Penindakan lewat web — web tidak dipakai menindak warga; penindakan tetap offline lewat musyawarah.
7. Pemeriksaan keuangan RT oleh RW — RW tidak bisa memeriksa keuangan RT, dan tidak ada UI untuk itu.
8. Jalur laporan RW ke Superadmin di dalam web — dibahas saat diskusi 24 Nov 2026 sebagai kebutuhan, tetapi TIDAK ada UI-nya di 11 UI v4 (lihat bagian 19, poin 6).

## 17. Kriteria selesai

### 17A. Kriteria umum (lanjutan v3)
1. Ketika hasil dicek untuk tujuan T1, maka pola tata letak di bagian 11 terlihat jelas.
2. Ketika hasil dicek untuk tujuan T2, maka buka index.html: tampil tanpa error di Console; Semua fitur di daftar fitur dicoba satu per satu.
3. Ketika hasil dicek untuk tujuan T3, maka tidak ada scroll ke samping di lebar 375 px.
4. Ketika pengguna menjalankan setiap fitur di tabel, maka fitur itu bekerja tanpa error di Console.
5. Ketika halaman dimuat ulang, maka data yang sudah dimasukkan tetap ada.
6. Ketika dibuka di HP lebar 375 px, maka semua tombol bisa ditekan dan tidak ada yang terpotong.
7. Ketika hasil dilihat sekilas, maka nuansa "Berani" terasa (sesuai ciri di bagian 11), bukan tampilan template umum.
8. Ketika seluruh hasil dibaca, maka tidak ada yang melanggar bagian 15 (Larangan).
9. Ketika dibuka https://web-rtrw.pages.dev, maka web tampil tanpa error di Console.
10. Ketika ada push ke main di repo GitHub, maka alamat Cloudflare Pages ikut berubah tanpa langkah manual.
11. Ketika dicek di Supabase, maka tabel v3 + tabel wilayah + tabel log_riwayat ada; kolom baru pengurus ada; seed wilayah + Superadmin ada.
12. Ketika internet dimatikan lalu web dimuat ulang, maka data tetap tampil dari cadangan localStorage.
13. Ketika foto kegiatan diunggah, maka foto tersimpan di bucket rtrw-foto dan tampil di galeri.
14. Ketika data contoh dicek, maka semua nama, NIK, No. KK, dan nomor HP tetap fiktif dari data.js (tidak ada data warga asli di luar trial pengurus/wilayah).

### 17B. Kriteria selesai per UI baru (apa yang harus bisa diuji)
| UI | Harus bisa diuji |
|---|---|
| UI 1 Masuk baru | Pilih wilayah aktif → pilih nama → PIN benar masuk; PIN salah ditolak dengan pesan dan bisa coba lagi; tautan Lupa PIN dan Daftar ada dan bisa diklik; pengurus 'menunggu' tidak bisa masuk |
| UI 2 Pendaftaran pengurus | Isi lengkap + centang Disclaimer → tersimpan status 'menunggu', peran 'pengurus'; PIN ulang tidak sama ditolak; PIN bukan 4–6 angka ditolak; kode verifikasi RW salah ditolak; kode pemulihan tampil SATU KALI; tanpa centang Disclaimer pendaftaran tidak terkirim |
| UI 3 Pendaftaran wilayah | Daftar RT dengan RW induk + kode benar → tersimpan 'menunggu'; daftar RT tanpa RW → tersimpan 'menunggu' (hibrid); daftar RW → tersimpan 'menunggu' tanpa RW induk |
| UI 4 Kelola Pengurus | Admin RT menyetujui pengurus menunggu → status jadi 'aktif' dan pengurus bisa masuk; menolak → tidak bisa masuk; nonaktifkan pengurus aktif → tidak bisa masuk; ubah jabatan/peran tersimpan; reset PIN menghasilkan PIN sementara + kode pemulihan baru + tombol kirim WA tampil dengan format pesan |
| UI 5 Kelola Wilayah | Superadmin menyetujui wilayah menunggu (RW belum ada) → 'aktif' dan tampil di pilih wilayah; menolak → tidak tampil; menonaktifkan wilayah aktif → hilang dari pilih wilayah; Admin RW/RT tidak bisa membuka UI ini |
| UI 6 Halaman RW | Tampil banyak kartu RT di bawah satu RW, tiap kartu hanya data publik; bagian verifikasi menampilkan RT yang mengaku di bawah RW itu; Admin RW menyetujui dari sini → RT jadi aktif; RW tidak bisa mengubah isi kartu/data RT |
| UI 7 Pilih wilayah | Superadmin/Admin RW dengan banyak wilayah bisa pindah wilayah; pengguna satu wilayah langsung masuk tanpa layar ini |
| UI 8 Akun saya | Tampilkan nama, jabatan, wilayah, WA, email; ganti PIN dengan PIN lama benar berhasil, PIN lama salah ditolak; PIN sementara mengunci panel sampai diganti; kode pemulihan lama TIDAK tampil; buat kode baru menampilkan kode baru satu kali |
| UI 9 Lupa PIN | Klik "Lupa PIN" membuka WA ke Pak RT dengan format pesan siap; reset oleh Pak RT menghasilkan PIN sementara + kode pemulihan baru; pengurus masuk dengan PIN sementara lalu wajib ganti PIN; Pak RT lupa PIN → WA ke Superadmin; bila nomor WA Superadmin belum diisi tampil pesan "Nomor WA Superadmin belum diisi — hubungi Masdan langsung" |
| UI 10 Disclaimer | Halaman bisa dibuka dari footer tanpa masuk; 6 aturan tampil, sama persis dengan app.js ATURAN_DISCLAIMER; centang wajib di pendaftaran |
| UI 11 Log histori | Tiap aksi (persetujuan, reset PIN, ganti peran, tambah/ubah data) muncul di log dengan waktu + siapa + apa; Admin RT hanya bisa lihat log wilayahnya; RW dan warga tidak bisa lihat log; log tidak bisa diubah/dihapus oleh RT |

### 17C. Hal yang harus diuji reviewer (segar)
1. Uji keamanan anon: coba baca tabel pengurus dan log_riwayat langsung dengan kunci anon (tanpa RPC) — harus ditolak/kosong; coba panggil verifikasi_pin dengan PIN salah — harus kembalikan kosong, tanpa bocor hash.
2. Uji alur penuh ujung-ke-ujung: daftar wilayah RT baru (hibrid, RW belum ada) → Superadmin setujui → daftar pengurus → Admin RT setujui → masuk dengan PIN → lupa PIN via WA → reset oleh Admin RT → masuk dengan PIN sementara → wajib ganti PIN → masuk dengan PIN baru.
3. Uji alur hibrid kedua: RT daftar di bawah RW yang sudah ada dengan kode verifikasi RW benar dan salah.
4. Uji sekali pakai: pakai kode pemulihan sekali → berhasil ganti PIN; pakai kode yang sama kedua kali → gagal.
5. Uji batas peran: masuk sebagai Pengurus (L4) lalu coba buka Kelola Pengurus dan Kelola Wilayah — harus ditolak; masuk sebagai Admin RW lalu coba buka log RT dan Kelola Wilayah — harus ditolak.
6. Uji tampilan: 11 UI baru di lebar 320, 390, 768, dan 1280 px (screenshot dinilai proporsi/seleranya, bukan hanya cek teknis); HP 375 px tanpa scroll samping.
7. Uji regresi: halaman publik + 8 menu Panel Pengurus tetap berfungsi seperti v3; Ganti PIN sudah pindah dari Pengaturan ke Akun saya dan tidak ada lagi di Pengaturan.
8. Uji Disclaimer: 6 aturan tampil sama persis dengan app.js ATURAN_DISCLAIMER — reviewer membandingkan kata per kata; bila ada yang berbeda, itu cacat, bukan soal selera.

## 18. Catatan jujur — keamanan v4
- PIN 4–6 angka tetap BUKAN pengaman sekuat kata sandi panjang. PIN 4 angka hanya punya 10.000 kemungkinan; PIN 6 angka 1.000.000 kemungkinan. Seseorang yang tahu nama pengurus dan wilayahnya bisa mencoba menebak PIN.
- Keamanan v4 TIDAK bertumpu pada sulitnya menebak PIN, melainkan pada tiga lapis: (1) cek PIN di server (RPC) sehingga PIN/hash tidak bisa dibaca dari browser; (2) persetujuan berlapis — pendaftaran pengurus harus disetujui Admin RT dan pendaftaran wilayah harus disetujui Superadmin/RW, jadi akun tidak bisa dibuat sendiri lalu langsung dipakai; (3) log histori per wilayah sehingga setiap persetujuan, reset PIN, dan ganti peran tercatat siapa dan kapan, dan bisa dibahas offline lewat musyawarah bila ada yang janggal.
- Yang BELUM ada di v4 dan harus diakui: tidak ada batas percobaan PIN yang salah (rate limit / kunci sesudah sekian kali salah), tidak ada verifikasi email, kode verifikasi RW disimpan sebagai teks biasa (bagian 10, K9), pakai_kode_pemulihan_wilayah tetap anon tanpa rate limit, dan token sesi yang bocor tetap berlaku sampai 8 jam / kadaluarsa (tidak ada daftar blokir token). Kelima hal ini dicatat sebagai risiko yang diketahui, bukan disembunyikan — perbaikan masing-masing adalah revisi PRD naik versi sesudah diputuskan Masdan.
- Yang SUDAH diperbaiki di v4 (tidak lagi berlaku sebagai risiko): RPC pakai_kode_pemulihan lama (cocok nama saja, tanpa wilayah_id) SUDAH DIHAPUS dan diganti pakai_kode_pemulihan_wilayah (nama + wilayah_id); tulis_log dan daftar_pengurus SUDAH ADA (lihat 9E, bukan lagi "direncanakan"); RPC admin SUDAH bertoken (peran + wilayah dari sesi server, bukan dari parameter browser).
- Jangan menulis di web bahwa data "aman", "terkunci", atau "terenkripsi" hanya karena ada PIN. Bahasa yang benar di web: "PIN dicek di server" dan "masuk hanya untuk pengurus yang sudah disetujui".

## 19. Yang masih perlu diputuskan / bentrok yang ditemukan saat menulis PRD ini (untuk koordinator dan Masdan)
1. Reset PIN lewat email — bentrok antar catatan diskusi. Catatan 24 Nov 2026 12:45 WIB menulis "reset PIN bisa mandiri lewat email (Masdan tetap bisa, tapi bukan SOP)", tetapi keputusan akhir 24 Nov 2026 13:25 WIB yang dinyatakan "sudah beres" adalah lupa PIN lewat WA dan email TIDAK dipakai di MVP. PRD v4 ini mengikuti keputusan akhir (WA saja, bagian 16 poin 2–3). Bila Masdan maksud email tetap jadi jalan mandiri, itu butuh PRD naik versi.
2. Siapa yang menyetujui pengurus baru — catatan 24 Nov 2026 09:43 WIB menulis persetujuan oleh Superadmin, sedangkan rekap 13:28 WIB menulis status menunggu sampai Admin RT setujui, dan Disclaimer menulis sesudah Superadmin menyetujui sebuah RT, persetujuan selanjutnya urusan RT sendiri. PRD v4 ini mengikuti rekap 13:28 WIB (Admin RT menyetujui pengurus di RT-nya; Superadmin hanya menyetujui wilayah baru bila RW belum ada, dan sebagai cadangan reset PIN). Mohon koordinator pastikan ini yang dimaksud Masdan.
3. "Lihat kode pemulihan" di Akun saya (UI 8) — bentrok dengan penyimpanan hash. Rekap 13:28 WIB menulis Akun saya bisa "lihat kode pemulihan", tetapi kode pemulihan hanya disimpan sebagai hash (bagian 9) sehingga kode lama TIDAK BISA ditampilkan lagi — hash tidak bisa dibalik. PRD v4 ini menulis Akun saya hanya menampilkan status kode (ada/sudah dipakai) + tombol buat kode baru yang ditampilkan satu kali. Bila Masdan memang mau kode lama bisa dilihat lagi, skema harus diubah (kode disimpan sebagai tulisan biasa) — itu menurunkan keamanan dan butuh keputusan eksplisit Masdan.
4. RPC tulis_log dan daftar_pengurus — TERJAWAB di v4: kedua fungsi itu SUDAH ADA di supabase-schema.sql (lihat bagian 9E) dan sudah dipakai web. Catatan lama "direncanakan" di PRD ini sudah diperbaiki.
5. Isi Disclaimer poin 3–6 — TERJAWAB di v4: keenam aturan kini tertulis lengkap di bagian 6, UI 10, sama persis dengan app.js ATURAN_DISCLAIMER (aturan yang tampil di web). PRD lama menandai poin 3–6 [ISI] karena rekap hanya menyebut "isi 6 poin"; kata-kata yang dipakai sekarang adalah yang sudah ada di app.js dari rekap yang disetujui Masdan 24 Nov 2026 — bukan karangan baru.
6. Jalur laporan RW ke Superadmin — catatan diskusi 24 Nov 2026 menyebut RW verifikasi tapi tidak bisa intervensi sehingga "perlu jalur laporan RW ke Superadmin", tetapi tidak ada UI laporan di antara 11 UI. PRD v4 mencatatnya di bagian 16 poin 8 sebagai TIDAK dibuat di v4. Bila dibutuhkan, itu UI ke-12 di versi berikut.
7. Pencocokan berdasarkan nama saja — TERJAWAB di v4: RPC pakai_kode_pemulihan lama (nama saja) SUDAH DIHAPUS dan diganti pakai_kode_pemulihan_wilayah (nama + wilayah_id). verifikasi_pin tetap mencocokkan nama + wilayah_id. Risiko dua pengurus bernama sama di wilayah berbeda lewat kode pemulihan sudah tidak ada.
8. Jalur bila Superadmin lupa PIN — DIDOKUMENTASIKAN di v4 (bagian 8, poin 4): "Superadmin lupa PIN → reset lewat dashboard Supabase oleh pemilik web (Masdan) dibantu Budi; tidak ada alur mandiri di web". PERLU KONFIRMASI MASDAN: jalur ini belum pernah disetujui Masdan secara eksplisit — koordinator mohon tanyakan ke Masdan apakah fallback ini diterima, atau Masdan mau jalur lain.
9. Atribusi log Superadmin lintas wilayah — SUDAH DIPERBAIKI di v4 (perbaikan Pekerja 5, 24 Nov 2026): tulis_log kini menerima parameter keempat p_wilayah_target (DEFAULT NULL); bila diisi dan cakupan wilayah pemohon mengizinkan, log tercatat di wilayah TARGET, bukan wilayah sesi. Temuan lama Pekerja 2 (aksi Superadmin atas RT 99 tercatat di wilayah sesi 'rt07-rw13-pagelaran') sudah tidak berlaku — app.js catatLog sudah mengirim wilayah target untuk aksi lintas wilayah (setujui/tolak/reset/ubah pengurus, ubah wilayah, verifikasi RT).

## 20. Langkah kerja (ikuti berurutan, jangan berhenti di tengah)
1. Baca seluruh PRD ini dan TASKS. Bila ada [ISI: …] atau yang tidak jelas, tanyakan dulu ke saya. Jangan menebak.
2. Pelajari template asli dan jalankan cara uji di bagian 12 sebelum mengubah apa pun.
3. Kerjakan 11 UI baru per task (TASKS.md), hanya di berkas yang aman; jaga semua selector di bagian 12.
4. Setelah tiap task, jalankan lagi cara uji fitur. Bila ada yang rusak, kembalikan dulu sebelum lanjut.
5. Cek kriteria selesai bagian 17 (termasuk uji reviewer bagian 17C), lalu laporkan berkas yang diubah dan hasil uji.
