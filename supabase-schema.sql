-- Skema Supabase proyek DB-web-rtrw (uoywhmhrlrvldigkhgfj, ap-southeast-1)
-- Dibuat 23 Nov 2026. Pemetaan 1:1 dari data.js (window.buatDataContoh) —
-- nama kolom memakai snake_case dari field data.js (noKK -> no_kk, tglLahir -> tgl_lahir, dst).
-- Semua data contoh di data.js FIKTIF; tabel dibiarkan KOSONG, tidak diisi lewat SQL.
-- Primary key text (kk1, ks1, in1, ...) supaya id lama dari localStorage tetap cocok.
-- Pengurus & anggota_kk tidak punya id di data.js: id text default gen_random_uuid().

-- ================= 1. TABEL =================

create table public.pengaturan (
  id text primary key default 'utama',
  rt text not null default '01',
  rw text not null default '01',
  kelurahan text not null default '',
  kecamatan text not null default '',
  kota text not null default '',
  provinsi text not null default '',
  alamat text not null default '',
  iuran integer not null default 50000,
  iuran_mulai text not null default '',
  cara_bayar text not null default '',
  pin text not null default '1234'
);

create table public.pengurus (
  id text primary key default gen_random_uuid()::text,
  jabatan text not null,
  nama text not null,
  wa text not null default ''
);

create table public.kk (
  id text primary key,
  no_kk text not null default '',
  kepala text not null,
  alamat text not null default '',
  status text not null default 'tetap' check (status in ('tetap', 'kontrak')),
  wa text not null default '',
  dibuat date
);

create table public.anggota_kk (
  id text primary key default gen_random_uuid()::text,
  kk_id text not null references public.kk (id) on delete cascade,
  nama text not null,
  nik text not null default '',
  jk text not null default 'L' check (jk in ('L', 'P')),
  hubungan text not null default '',
  tempat_lahir text not null default '',
  tgl_lahir date,
  agama text not null default '',
  pekerjaan text not null default '',
  kawin text not null default ''
);

create table public.iuran (
  id text primary key default gen_random_uuid()::text,
  bulan text not null,
  kk_id text not null references public.kk (id) on delete cascade,
  tgl_bayar date not null,
  unique (bulan, kk_id)
);

create table public.kas (
  id text primary key,
  tgl date not null,
  jenis text not null check (jenis in ('masuk', 'keluar')),
  kategori text not null default '',
  ket text not null default '',
  jumlah integer not null default 0,
  ref text
);

create table public.info (
  id text primary key,
  jenis text not null check (jenis in ('pengumuman', 'agenda')),
  judul text not null,
  isi text not null default '',
  tgl date,
  jam text,
  tempat text,
  sematkan boolean not null default false
);

create table public.usaha (
  id text primary key,
  nama text not null,
  pemilik text not null default '',
  kk_id text references public.kk (id) on delete set null,
  jenis text not null default '',
  wa text not null default '',
  alamat text not null default '',
  jam text,
  ket text not null default '',
  aktif boolean not null default true,
  dibuat date
);

create table public.telp_penting (
  id text primary key,
  nama text not null,
  nomor text not null,
  ket text not null default '',
  jenis text not null default ''
);

create table public.surat (
  id text primary key,
  no text not null default '',
  tgl date not null,
  nama text not null,
  nik text not null default '',
  jk text not null default 'L' check (jk in ('L', 'P')),
  tempat_lahir text not null default '',
  tgl_lahir date,
  agama text not null default '',
  pekerjaan text not null default '',
  kawin text not null default '',
  alamat text not null default '',
  keperluan text not null default '',
  ket text not null default ''
);

create table public.nomor_surat (
  id text primary key default 'utama',
  tahun integer not null,
  urut integer not null default 0
);

-- ================= 2. RLS =================
-- ALASAN: data warga berisi NIK, No KK, dan nomor HP — tidak boleh bisa dibaca
-- siapa saja dari internet. Karena itu RLS diaktifkan di SEMUA tabel, dan
-- kebijakan baca anon (SELECT) HANYA dibuat untuk tabel yang isinya memang
-- tampil publik di web: info, usaha, telp_penting.
-- Tabel kk, anggota_kk, iuran, kas, surat, nomor_surat, pengaturan, pengurus
-- TIDAK punya kebijakan apa pun: tertutup total untuk anon (deny by default).
-- Keputusan soal akses tulis / panel pengurus diputuskan Budi/Masdan di gerbang
-- terpisah, bukan di skema ini.

alter table public.pengaturan enable row level security;
alter table public.pengurus enable row level security;
alter table public.kk enable row level security;
alter table public.anggota_kk enable row level security;
alter table public.iuran enable row level security;
alter table public.kas enable row level security;
alter table public.info enable row level security;
alter table public.usaha enable row level security;
alter table public.telp_penting enable row level security;
alter table public.surat enable row level security;
alter table public.nomor_surat enable row level security;

create policy "baca publik info" on public.info
  for select to anon using (true);
create policy "baca publik usaha" on public.usaha
  for select to anon using (true);
create policy "baca publik telp_penting" on public.telp_penting
  for select to anon using (true);

-- GRANT pendamping kebijakan di atas (wajib: tabel yang dibuat lewat SQL
-- tidak otomatis mendapat GRANT SELECT untuk anon; tanpa GRANT ini kebijakan
-- RLS tidak bisa jalan — SELECT anon ke info pun ditolak 42501).
-- HANYA tiga tabel publik ini yang diberi GRANT SELECT ke anon; delapan tabel
-- lain tetap tanpa GRANT apa pun (deny by default), dan tidak ada GRANT
-- INSERT/UPDATE/DELETE ke anon di tabel mana pun.
grant select on public.info to anon;
grant select on public.usaha to anon;
grant select on public.telp_penting to anon;

-- ================= 3. STORAGE: bucket foto kegiatan =================
-- Galeri kegiatan (window.GAMBAR.galeri) diunggah pengguna, bukan path statis.
-- Bucket publik baca; TIDAK ada kebijakan tulis/unggah publik.

insert into storage.buckets (id, name, public)
values ('rtrw-foto', 'rtrw-foto', true);

create policy "baca publik rtrw-foto" on storage.objects
  for select to anon using (bucket_id = 'rtrw-foto');
