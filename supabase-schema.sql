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

-- ================= 4. v4 — HIRARKI 5 LEVEL + PIN (24 Nov 2026) =================
-- Hirarki: L1 Superadmin (Masdan, pemilik web) — L2 Admin RW — L3 Admin RT —
-- L4 Pengurus (Sekretaris/Bendahara/Sie) — L5 Warga (publik saja).
-- 1 RW berisi beberapa RT. MVP hibrid: RT boleh daftar dulu baru RW atau sebaliknya.
-- Diterapkan langsung ke DB-web-rtrw (uoywhmhrlrvldigkhgfj) lewat konektor kujang.
--
-- CATATAN KEAMANAN (baca dulu):
-- - PIN dan kode pemulihan TIDAK PERNAH disimpan sebagai tulisan biasa, hanya
--   hash SHA-256 (pin_hash, kode_pemulihan_hash).
-- - Anon key TIDAK BISA membaca hash PIN: tidak ada kebijakan SELECT apa pun
--   atas public.pengurus untuk anon, dan tidak ada GRANT SELECT atas pengurus
--   untuk anon. Daftar nama untuk halaman masuk diambil lewat RPC
--   daftar_pengurus_aktif (hanya id+nama+jabatan+peran+wilayah_id+status,
--   tanpa hash). Verifikasi PIN hanya lewat RPC verifikasi_pin.
-- - pgcrypto di proyek ini terpasang di skema "extensions" (bukan public),
--   jadi semua pemakaian digest() di fungsi ditulis extensions.digest()
--   dan search_path fungsi = public, extensions.
-- - log_riwayat TIDAK punya kebijakan anon sama sekali: baca/tulis hanya
--   lewat fungsi server (service key), bukan anon.

-- --- 4a. pgcrypto (untuk digest SHA-256) ---
create extension if not exists pgcrypto;

-- --- 4b. pengurus: 8 kolom baru, kolom lama (id, jabatan, nama, wa) tidak diubah ---
alter table public.pengurus
  add column if not exists pin_hash text,
  add column if not exists kode_pemulihan_hash text,
  add column if not exists status text not null default 'menunggu'
    check (status in ('menunggu', 'aktif', 'nonaktif')),
  add column if not exists peran text not null default 'pengurus'
    check (peran in ('superadmin', 'admin_rw', 'admin_rt', 'pengurus')),
  add column if not exists email text not null default '',
  add column if not exists wilayah_id text,
  add column if not exists pin_sementara boolean not null default false,
  add column if not exists dibuat timestamptz not null default now();

-- --- 4c. wilayah baru ---
create table if not exists public.wilayah (
  id text primary key,
  jenis text not null check (jenis in ('rt', 'rw')),
  nomor text not null,
  kelurahan text not null default '',
  kecamatan text not null default '',
  kota text not null default '',
  provinsi text not null default '',
  ketua_nama text not null default '',
  ketua_wa text not null default '',
  ketua_email text not null default '',
  rw_induk_id text,
  kode_verifikasi text,
  status text not null default 'menunggu'
    check (status in ('menunggu', 'aktif', 'nonaktif')),
  dibuat timestamptz not null default now()
);

-- --- 4d. log_riwayat baru (hanya INSERT lewat fungsi server; tanpa UPDATE/DELETE
-- untuk siapa pun kecuali pemilik proyek via service key) ---
create table if not exists public.log_riwayat (
  id text primary key default gen_random_uuid()::text,
  wilayah_id text,
  waktu timestamptz not null default now(),
  pelaku_nama text not null default '',
  pelaku_peran text not null default '',
  aksi text not null,
  rincian text not null default ''
);

-- --- 4e. seed: 1 wilayah contoh + 1 Superadmin awal ---
-- Wilayah: RT 07 / RW 13, Kelurahan Pagelaran, Kecamatan Ciomas,
-- Kabupaten Bogor, Jawa Barat, status 'aktif'.
-- rw_induk_id NULL karena baris RW 13 belum terdaftar (MVP hibrid: RT boleh
-- daftar dulu sebelum RW ada). kode_verifikasi NULL (kode dibagikan RW ke
-- RT-nya; tidak berlaku untuk RT yang daftar sebelum RW ada).
insert into public.wilayah
  (id, jenis, nomor, kelurahan, kecamatan, kota, provinsi,
   ketua_nama, ketua_wa, ketua_email, rw_induk_id, kode_verifikasi, status)
values
  ('rt07-rw13-pagelaran', 'rt', '07', 'Pagelaran', 'Ciomas',
   'Kabupaten Bogor', 'Jawa Barat',
   'Masdan', '', '', null, null, 'aktif')
on conflict (id) do nothing;

-- Superadmin awal: nama 'Masdan', jabatan 'Superadmin', peran 'superadmin',
-- status 'aktif', wa/email KOSONG, PIN awal '1234' (PIN lama) sebagai hash
-- SHA-256. TIDAK ada pengurus contoh lain yang di-seed.
insert into public.pengurus
  (nama, jabatan, wa, email, peran, status, wilayah_id,
   pin_hash, kode_pemulihan_hash, pin_sementara)
values
  ('Masdan', 'Superadmin', '', '', 'superadmin', 'aktif',
   'rt07-rw13-pagelaran',
   encode(digest('1234', 'sha256'), 'hex'), null, false);

-- --- 4f. RPC SECURITY DEFINER (hash dihitung di server, hash tidak pernah keluar) ---
-- verifikasi_pin: kembalikan baris pengurus (id, nama, jabatan, peran,
-- wilayah_id, status, pin_sementara) HANYA bila status='aktif' dan PIN cocok;
-- bila tidak cocok kembalikan kosong. TIDAK mengembalikan pin_hash /
-- kode_pemulihan_hash.
create or replace function public.verifikasi_pin(p_nama text, p_pin text, p_wilayah_id text)
returns table (id text, nama text, jabatan text, peran text, wilayah_id text,
               status text, pin_sementara boolean)
language sql security definer set search_path = public, extensions as $$
  select p.id, p.nama, p.jabatan, p.peran, p.wilayah_id, p.status, p.pin_sementara
  from public.pengurus p
  where p.nama = p_nama
    and p.wilayah_id = p_wilayah_id
    and p.status = 'aktif'
    and p.pin_hash = encode(extensions.digest(p_pin, 'sha256'), 'hex')
  limit 1;
$$;

-- daftar_pengurus_aktif: daftar nama untuk halaman masuk — hanya pengurus AKTIF
-- di satu wilayah, hanya kolom non-sensitif (tanpa hash).
create or replace function public.daftar_pengurus_aktif(p_wilayah_id text)
returns table (id text, nama text, jabatan text, peran text, wilayah_id text,
               status text)
language sql security definer set search_path = public, extensions as $$
  select p.id, p.nama, p.jabatan, p.peran, p.wilayah_id, p.status
  from public.pengurus p
  where p.wilayah_id = p_wilayah_id and p.status = 'aktif'
  order by p.nama;
$$;

-- atur_pin_baru: ganti PIN sendiri — cek PIN lama dulu; PIN lama salah -> false.
-- PIN baru langsung berlaku; pin_sementara dimatikan (PIN baru dibuat sendiri).
create or replace function public.atur_pin_baru(p_pengurus_id text, p_pin_lama text, p_pin_baru text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_ok boolean;
begin
  update public.pengurus
  set pin_hash = encode(extensions.digest(p_pin_baru, 'sha256'), 'hex'),
      pin_sementara = false
  where id = p_pengurus_id
    and status = 'aktif'
    and pin_hash = encode(extensions.digest(p_pin_lama, 'sha256'), 'hex')
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;

-- pakai_kode_pemulihan: set PIN baru dengan kode pemulihan — kode cocok dulu,
-- kode sekali pakai (langsung dikosongkan sesudah dipakai); hanya status='aktif'.
create or replace function public.pakai_kode_pemulihan(p_nama text, p_kode text, p_pin_baru text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_ok boolean;
begin
  update public.pengurus
  set pin_hash = encode(extensions.digest(p_pin_baru, 'sha256'), 'hex'),
      kode_pemulihan_hash = null,
      pin_sementara = false
  where nama = p_nama
    and status = 'aktif'
    and kode_pemulihan_hash is not null
    and kode_pemulihan_hash = encode(extensions.digest(p_kode, 'sha256'), 'hex')
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;

-- --- 4g. RLS + GRANT v4 ---
-- pengurus: RLS sudah aktif sejak bagian 2. Anon HANYA boleh INSERT pendaftaran
-- (status='menunggu' DAN peran='pengurus'). TIDAK ADA SELECT anon atas pengurus.
-- wilayah: RLS aktif; anon boleh INSERT pendaftaran (status='menunggu') dan
-- SELECT hanya wilayah status='aktif' (pilih wilayah + halaman RW).
-- log_riwayat: RLS aktif; TIDAK ADA kebijakan anon sama sekali.
alter table public.wilayah enable row level security;
alter table public.log_riwayat enable row level security;

create policy "daftar pengurus menunggu" on public.pengurus
  for insert to anon
  with check (status = 'menunggu' and peran = 'pengurus');

create policy "daftar wilayah menunggu" on public.wilayah
  for insert to anon
  with check (status = 'menunggu');

create policy "baca wilayah aktif" on public.wilayah
  for select to anon
  using (status = 'aktif');

grant insert on public.pengurus to anon;
grant select, insert on public.wilayah to anon;
grant execute on function public.verifikasi_pin(text, text, text) to anon, authenticated;
grant execute on function public.daftar_pengurus_aktif(text) to anon, authenticated;
grant execute on function public.atur_pin_baru(text, text, text) to anon, authenticated;
grant execute on function public.pakai_kode_pemulihan(text, text, text) to anon, authenticated;
-- TIDAK ADA grant select/insert/update/delete atas public.log_riwayat untuk anon,
-- dan TIDAK ADA grant select atas public.pengurus untuk anon.

-- ================= 4h. RPC AUTH — Pekerja 2 (24 Nov 2026) =================
-- tulis_log, daftar_pengurus, profil_pengurus, buat_kode_pemulihan_baru,
-- pakai_kode_pemulihan_wilayah. Semua SECURITY DEFINER + GRANT EXECUTE anon.
-- Dipakai UI auth di app.js (bagian 4b/6b). RPC lama pakai_kode_pemulihan
-- (Pekerja 1) dibiarkan saja dan TIDAK dipakai UI — pemulihan PIN memakai
-- pakai_kode_pemulihan_wilayah (cocokkan nama + wilayah_id).

-- tulis_log: catat aksi penting ke log_riwayat (INSERT saja).
create or replace function public.tulis_log(p_wilayah_id text, p_pelaku_nama text, p_pelaku_peran text, p_aksi text, p_rincian text)
returns void
language sql security definer set search_path = public as $$
  insert into public.log_riwayat (wilayah_id, pelaku_nama, pelaku_peran, aksi, rincian)
  values (p_wilayah_id, coalesce(p_pelaku_nama, ''), coalesce(p_pelaku_peran, ''), p_aksi, coalesce(p_rincian, ''));
$$;
grant execute on function public.tulis_log(text, text, text, text, text) to anon, authenticated;

-- daftar_pengurus: hash PIN + kode pemulihan (8 karakter) dihitung di server;
-- kode asli dikembalikan SEKALI. INSERT status='menunggu', peran='pengurus'.
create or replace function public.daftar_pengurus(p_nama text, p_jabatan text, p_wa text, p_email text, p_kode_verifikasi text, p_pin text, p_wilayah_id text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  if p_nama is null or btrim(p_nama) = '' then
    raise exception 'nama wajib diisi';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'PIN harus 4-6 angka';
  end if;
  if p_wilayah_id is null or btrim(p_wilayah_id) = '' then
    raise exception 'wilayah wajib dipilih';
  end if;
  if exists (select 1 from public.pengurus
             where nama = btrim(p_nama) and wilayah_id = p_wilayah_id
               and status in ('menunggu', 'aktif')) then
    raise exception 'nama sudah terdaftar di wilayah ini';
  end if;
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  insert into public.pengurus
    (nama, jabatan, wa, email, peran, status, wilayah_id,
     pin_hash, kode_pemulihan_hash, pin_sementara)
  values
    (btrim(p_nama), coalesce(p_jabatan, 'Pengurus'), coalesce(p_wa, ''),
     coalesce(p_email, ''), 'pengurus', 'menunggu', p_wilayah_id,
     encode(extensions.digest(p_pin, 'sha256'), 'hex'),
     encode(extensions.digest(v_kode, 'sha256'), 'hex'),
     false);
  return v_kode;
end;
$$;
grant execute on function public.daftar_pengurus(text, text, text, text, text, text, text) to anon, authenticated;

-- profil_pengurus: data Akun Saya (tanpa hash) + ada_kode (kode masih berlaku?).
create or replace function public.profil_pengurus(p_pengurus_id text)
returns table (id text, nama text, jabatan text, peran text, wilayah_id text,
               status text, wa text, email text, pin_sementara boolean,
               ada_kode boolean)
language sql security definer set search_path = public, extensions as $$
  select p.id, p.nama, p.jabatan, p.peran, p.wilayah_id, p.status,
         p.wa, p.email, p.pin_sementara,
         (p.kode_pemulihan_hash is not null)
  from public.pengurus p
  where p.id = p_pengurus_id and p.status = 'aktif'
  limit 1;
$$;
grant execute on function public.profil_pengurus(text) to anon, authenticated;

-- buat_kode_pemulihan_baru: cek PIN dulu, lalu buat kode baru (8 karakter),
-- simpan hash-nya, kembalikan kode SEKALI. Kode lama tidak berlaku lagi.
-- pin_sementara TIDAK diubah di sini (koreksi koordinator PRD-v4).
create or replace function public.buat_kode_pemulihan_baru(p_pengurus_id text, p_pin text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
  v_ok boolean;
begin
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  update public.pengurus
  set kode_pemulihan_hash = encode(extensions.digest(v_kode, 'sha256'), 'hex')
  where id = p_pengurus_id
    and status = 'aktif'
    and pin_hash = encode(extensions.digest(p_pin, 'sha256'), 'hex')
  returning true into v_ok;
  if coalesce(v_ok, false) then
    return v_kode;
  end if;
  return null;
end;
$$;
grant execute on function public.buat_kode_pemulihan_baru(text, text) to anon, authenticated;

-- pakai_kode_pemulihan_wilayah: seperti pakai_kode_pemulihan tapi cocokkan
-- nama + wilayah_id (dua pengurus bernama sama di wilayah berbeda aman).
-- Kode sekali pakai; hanya status='aktif'.
create or replace function public.pakai_kode_pemulihan_wilayah(p_nama text, p_wilayah_id text, p_kode text, p_pin_baru text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_ok boolean;
begin
  update public.pengurus
  set pin_hash = encode(extensions.digest(p_pin_baru, 'sha256'), 'hex'),
      kode_pemulihan_hash = null,
      pin_sementara = false
  where nama = p_nama
    and wilayah_id = p_wilayah_id
    and status = 'aktif'
    and kode_pemulihan_hash is not null
    and kode_pemulihan_hash = encode(extensions.digest(p_kode, 'sha256'), 'hex')
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.pakai_kode_pemulihan_wilayah(text, text, text, text) to anon, authenticated;

-- ================= 4i. RPC ADMIN — Pekerja 3 (24 Nov 2026) =================
-- Kelola Pengurus, Kelola Wilayah, Halaman RW (verifikasi), Log Histori.
-- Semua SECURITY DEFINER + GRANT EXECUTE anon.
-- KEJUJURAN GATING (wajib dicatat di laporan): RPC-RPC ini TIDAK memeriksa
-- Auth server — peran pemohon hanya dikirim dari sesi browser (sessionStorage)
-- lewat parameter p_peran / p_pemohon_peran. Siapa pun yang bisa memanggil RPC
-- anon dengan parameter peran='superadmin' akan dilayani. Ini gating berbasis
-- sesi, BUKAN keamanan server; cukup untuk MVP trial internal RT Masdan,
-- dan HARUS diganti Auth server (Supabase Auth + JWT + cek peran di dalam
-- fungsi) sebelum dipakai skala besar / data warga nyata.
-- Satu-satunya pengaman server di sini: (a) ubah_pengurus menolak mengangkat
-- admin_rt/admin_rw bila p_pemohon_peran <> 'superadmin'; (b) baca_log hanya
-- mengembalikan log wilayah pemohon bila peran <> 'superadmin'; (c) hash PIN /
-- kode tidak pernah keluar dari fungsi; (d) RLS anon atas pengurus/wilayah/
-- log_riwayat tetap tertutup (baca tulis hanya lewat RPC ini).

-- --- 4i-a. pengurus: simpan kode_verifikasi yang dimasukkan saat daftar ---
-- (daftar_pengurus v Pekerja 2 menerima p_kode_verifikasi tapi tidak
-- menyimpannya; Admin RT butuh melihatnya untuk membandingkan dengan
-- kode_verifikasi wilayah di MVP hibrid.)
alter table public.pengurus
  add column if not exists kode_verifikasi text not null default '';

-- daftar_pengurus didefinisikan ulang (tanda tangan sama) — hanya tambah
-- penyimpanan kode_verifikasi.
create or replace function public.daftar_pengurus(p_nama text, p_jabatan text, p_wa text, p_email text, p_kode_verifikasi text, p_pin text, p_wilayah_id text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  if p_nama is null or btrim(p_nama) = '' then
    raise exception 'nama wajib diisi';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'PIN harus 4-6 angka';
  end if;
  if p_wilayah_id is null or btrim(p_wilayah_id) = '' then
    raise exception 'wilayah wajib dipilih';
  end if;
  if exists (select 1 from public.pengurus
             where nama = btrim(p_nama) and wilayah_id = p_wilayah_id
               and status in ('menunggu', 'aktif')) then
    raise exception 'nama sudah terdaftar di wilayah ini';
  end if;
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  insert into public.pengurus
    (nama, jabatan, wa, email, peran, status, wilayah_id, kode_verifikasi,
     pin_hash, kode_pemulihan_hash, pin_sementara)
  values
    (btrim(p_nama), coalesce(p_jabatan, 'Pengurus'), coalesce(p_wa, ''),
     coalesce(p_email, ''), 'pengurus', 'menunggu', p_wilayah_id,
     coalesce(p_kode_verifikasi, ''),
     encode(extensions.digest(p_pin, 'sha256'), 'hex'),
     encode(extensions.digest(v_kode, 'sha256'), 'hex'),
     false);
  return v_kode;
end;
$$;
grant execute on function public.daftar_pengurus(text, text, text, text, text, text, text) to anon, authenticated;

-- daftar_semua_pengurus: semua pengurus (menunggu/aktif/nonaktif) untuk UI
-- Kelola Pengurus. Superadmin: semua wilayah (atau satu wilayah bila
-- p_wilayah_id diisi). Bukan superadmin: hanya wilayah_id itu.
create or replace function public.daftar_semua_pengurus(p_wilayah_id text, p_peran text)
returns table (id text, nama text, jabatan text, peran text, status text,
               wilayah_id text, wa text, email text, kode_verifikasi text,
               pin_sementara boolean)
language sql security definer set search_path = public as $$
  select p.id, p.nama, p.jabatan, p.peran, p.status, p.wilayah_id,
         p.wa, p.email, p.kode_verifikasi, p.pin_sementara
  from public.pengurus p
  where (p_peran = 'superadmin'
           and (p_wilayah_id is null or p_wilayah_id = '' or p.wilayah_id = p_wilayah_id))
     or (coalesce(p_peran, '') <> 'superadmin' and p.wilayah_id = p_wilayah_id)
  order by p.status, p.nama;
$$;
grant execute on function public.daftar_semua_pengurus(text, text) to anon, authenticated;

-- setujui_pengurus: menunggu -> aktif. Hanya dari status menunggu.
create or replace function public.setujui_pengurus(p_pengurus_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok boolean;
begin
  update public.pengurus set status = 'aktif'
  where id = p_pengurus_id and status = 'menunggu'
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.setujui_pengurus(text) to anon, authenticated;

-- tolak_pengurus: hapus pendaftaran yang masih menunggu (pendaftar bisa
-- daftar ulang). Pengurus aktif/nonaktif TIDAK bisa ditolak lewat sini.
create or replace function public.tolak_pengurus(p_pengurus_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok boolean;
begin
  delete from public.pengurus
  where id = p_pengurus_id and status = 'menunggu'
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.tolak_pengurus(text) to anon, authenticated;

-- ubah_pengurus: ubah jabatan / peran / status (aktif/nonaktif).
-- Pengaman server: mengangkat ke admin_rt/admin_rw HANYA bila pemohon
-- superadmin. Menurunkan ke 'pengurus' boleh oleh admin_rt/superadmin.
create or replace function public.ubah_pengurus(p_pengurus_id text, p_jabatan text, p_peran text, p_status text, p_pemohon_peran text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok boolean;
begin
  if p_peran not in ('superadmin', 'admin_rw', 'admin_rt', 'pengurus') then
    return false;
  end if;
  if p_status not in ('menunggu', 'aktif', 'nonaktif') then
    return false;
  end if;
  if p_peran in ('admin_rt', 'admin_rw') and coalesce(p_pemohon_peran, '') <> 'superadmin' then
    return false;
  end if;
  update public.pengurus
  set jabatan = coalesce(p_jabatan, jabatan),
      peran = p_peran,
      status = p_status
  where id = p_pengurus_id
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.ubah_pengurus(text, text, text, text, text) to anon, authenticated;

-- reset_pin_admin: buat PIN sementara baru (4 angka) + kode pemulihan baru
-- (8 karakter), simpan hash-nya, pin_sementara=true. PIN + kode dikembalikan
-- SEKALI. Hanya pengurus status='aktif'.
create or replace function public.reset_pin_admin(p_pengurus_id text)
returns table (pin text, kode text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_pin text;
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  v_pin := (1000 + floor(random() * 9000)::int)::text;
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  update public.pengurus
  set pin_hash = encode(extensions.digest(v_pin, 'sha256'), 'hex'),
      kode_pemulihan_hash = encode(extensions.digest(v_kode, 'sha256'), 'hex'),
      pin_sementara = true
  where id = p_pengurus_id and status = 'aktif';
  if not found then
    return;
  end if;
  return query select v_pin, v_kode;
end;
$$;
grant execute on function public.reset_pin_admin(text) to anon, authenticated;

-- daftar_semua_wilayah: semua wilayah (RW + RT) beserta statusnya, untuk UI
-- Kelola Wilayah (Superadmin). Anon SELECT biasa hanya boleh wilayah aktif.
create or replace function public.daftar_semua_wilayah()
returns table (id text, jenis text, nomor text, kelurahan text, kecamatan text,
               kota text, provinsi text, ketua_nama text, ketua_wa text,
               ketua_email text, rw_induk_id text, kode_verifikasi text,
               status text)
language sql security definer set search_path = public as $$
  select w.id, w.jenis, w.nomor, w.kelurahan, w.kecamatan, w.kota, w.provinsi,
         w.ketua_nama, w.ketua_wa, w.ketua_email, w.rw_induk_id,
         w.kode_verifikasi, w.status
  from public.wilayah w
  order by w.jenis, w.kelurahan, w.nomor;
$$;
grant execute on function public.daftar_semua_wilayah() to anon, authenticated;

-- ubah_wilayah: ubah data wilayah (termasuk ketua_wa, ketua_email,
-- kode_verifikasi RW). String kosong untuk kode_verifikasi / rw_induk_id
-- berarti NULL (dikosongkan).
create or replace function public.ubah_wilayah(p_wilayah_id text, p_nomor text, p_kelurahan text, p_kecamatan text, p_kota text, p_provinsi text, p_ketua_nama text, p_ketua_wa text, p_ketua_email text, p_kode_verifikasi text, p_rw_induk_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok boolean;
begin
  update public.wilayah
  set nomor = coalesce(p_nomor, nomor),
      kelurahan = coalesce(p_kelurahan, kelurahan),
      kecamatan = coalesce(p_kecamatan, kecamatan),
      kota = coalesce(p_kota, kota),
      provinsi = coalesce(p_provinsi, provinsi),
      ketua_nama = coalesce(p_ketua_nama, ketua_nama),
      ketua_wa = coalesce(p_ketua_wa, ketua_wa),
      ketua_email = coalesce(p_ketua_email, ketua_email),
      kode_verifikasi = nullif(p_kode_verifikasi, ''),
      rw_induk_id = nullif(p_rw_induk_id, '')
  where id = p_wilayah_id
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.ubah_wilayah(text, text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- ubah_status_wilayah: menunggu/aktif/nonaktif. Dipakai Setujui/Tolak/
-- Nonaktifkan wilayah (Kelola Wilayah) dan Konfirmasi/Tolak RT (Halaman RW).
create or replace function public.ubah_status_wilayah(p_wilayah_id text, p_status text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok boolean;
begin
  if p_status not in ('menunggu', 'aktif', 'nonaktif') then
    return false;
  end if;
  update public.wilayah set status = p_status
  where id = p_wilayah_id
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.ubah_status_wilayah(text, text) to anon, authenticated;

-- daftar_rt_menunggu_rw: RT yang mengaku di bawah RW ini (status menunggu),
-- untuk bagian Verifikasi di Halaman RW.
create or replace function public.daftar_rt_menunggu_rw(p_rw_id text)
returns table (id text, nomor text, kelurahan text, kecamatan text, kota text,
               ketua_nama text, ketua_wa text, ketua_email text, status text)
language sql security definer set search_path = public as $$
  select w.id, w.nomor, w.kelurahan, w.kecamatan, w.kota,
         w.ketua_nama, w.ketua_wa, w.ketua_email, w.status
  from public.wilayah w
  where w.jenis = 'rt' and w.rw_induk_id = p_rw_id and w.status = 'menunggu'
  order by w.nomor;
$$;
grant execute on function public.daftar_rt_menunggu_rw(text) to anon, authenticated;

-- baca_log: baca log_riwayat. Superadmin: semua wilayah. Bukan superadmin:
-- hanya log wilayah_id itu. UI wajib kirim wilayah_id + peran dari sesi.
create or replace function public.baca_log(p_wilayah_id text, p_peran text)
returns table (id text, wilayah_id text, waktu timestamptz, pelaku_nama text,
               pelaku_peran text, aksi text, rincian text)
language sql security definer set search_path = public as $$
  select l.id, l.wilayah_id, l.waktu, l.pelaku_nama, l.pelaku_peran, l.aksi, l.rincian
  from public.log_riwayat l
  where (p_peran = 'superadmin')
     or (coalesce(p_peran, '') <> 'superadmin' and l.wilayah_id = p_wilayah_id)
  order by l.waktu desc
  limit 200;
$$;
grant execute on function public.baca_log(text, text) to anon, authenticated;
-- ================= 5. TOKEN SESI SERVER (perbaikan reviewer, 24 Nov 2026) =================
-- F1: semua RPC admin WAJIB token sesi. Token diterbitkan verifikasi_pin,
-- disimpan sebagai HASH SHA-256 di public.sesi, berlaku 8 jam. Token asli
-- hanya keluar SEKALI dari verifikasi_pin; yang tersimpan hanya hash-nya.
-- GRANT EXECUTE tetap ke anon (PostgREST butuh itu agar RPC bisa dipanggil)
-- — pengaman ada DI DALAM fungsi (validasi token + peran dari baris sesi),
-- BUKAN di GRANT. Siapa pun tanpa token valid mendapat false/kosong.
-- RLS sesi aktif TANPA kebijakan anon sama sekali: tabel sesi tidak bisa
-- dibaca/ditulis langsung oleh anon (tanpa GRANT apa pun atas public.sesi).
-- Pengecualian yang DIKETAHUI dan disengaja: pakai_kode_pemulihan_wilayah
-- tetap anon (lupa PIN — tanpa sesi tidak ada jalan masuk lain); daftar
-- pendaftaran (daftar_pengurus), daftar nama masuk (daftar_pengurus_aktif),
-- dan penerbit token (verifikasi_pin) juga tetap anon sesuai tugas.
-- Helper internal _sesi_valid / _boleh_wilayah: TIDAK diberi GRANT ke siapa
-- pun (REVOKE FROM PUBLIC); hanya dipanggil dari dalam fungsi SECURITY
-- DEFINER lain, yang berjalan sebagai pemilik.

create table if not exists public.sesi (
  id text primary key default gen_random_uuid()::text,
  pengurus_id text not null references public.pengurus (id) on delete cascade,
  token_hash text not null,
  peran text not null,
  wilayah_id text,
  dibuat timestamptz not null default now(),
  kadaluarsa timestamptz not null default (now() + interval '8 hours')
);
alter table public.sesi enable row level security;
-- TIDAK ADA kebijakan anon dan TIDAK ADA grant atas public.sesi.

-- Helper internal: kembalikan baris sesi bila token cocok + belum kadaluarsa.
create or replace function public._sesi_valid(p_token text)
returns table (pengurus_id text, peran text, wilayah_id text)
language sql security definer stable set search_path = public, extensions as $$
  select s.pengurus_id, s.peran, s.wilayah_id
  from public.sesi s
  where p_token is not null and p_token <> ''
    and s.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and s.kadaluarsa > now()
  limit 1;
$$;
revoke execute on function public._sesi_valid(text) from public;

-- Helper internal: apakah peran sesi boleh mengelola wilayah target?
-- superadmin: semua wilayah. admin_rt: hanya wilayahnya sendiri.
-- admin_rw: wilayahnya sendiri + RT yang rw_induk_id-nya wilayah itu.
-- pengurus biasa: tidak boleh.
create or replace function public._boleh_wilayah(p_peran text, p_wilayah_sesi text, p_wilayah_target text)
returns boolean
language sql security definer stable set search_path = public as $$
  select case
    when p_peran = 'superadmin' then true
    when p_peran = 'admin_rt' then p_wilayah_target = p_wilayah_sesi
    when p_peran = 'admin_rw' then p_wilayah_target = p_wilayah_sesi
      or exists (select 1 from public.wilayah w
                 where w.id = p_wilayah_target and w.rw_induk_id = p_wilayah_sesi)
    else false
  end;
$$;
revoke execute on function public._boleh_wilayah(text, text, text) from public;

-- verifikasi_pin (DIUBAH: tambah kolom token di hasil). Bila PIN benar,
-- buatkan token acak 32 byte (64 karakter hex), simpan HASH-nya di sesi
-- dengan kadaluarsa 8 jam, kembalikan token ASLI sekali. PIN salah / nama
-- tidak ada / tidak aktif -> kosong (tanpa token).
-- DROP dulu karena tipe kembalian berubah (CREATE OR REPLACE tidak bisa).
drop function if exists public.verifikasi_pin(text, text, text);
create function public.verifikasi_pin(p_nama text, p_pin text, p_wilayah_id text)
returns table (id text, nama text, jabatan text, peran text, wilayah_id text,
               status text, pin_sementara boolean, token text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_id text; v_nama text; v_jabatan text; v_peran text; v_wilayah text;
  v_status text; v_sementara boolean; v_token text;
begin
  delete from public.sesi where kadaluarsa <= now();
  select p.id, p.nama, p.jabatan, p.peran, p.wilayah_id, p.status, p.pin_sementara
    into v_id, v_nama, v_jabatan, v_peran, v_wilayah, v_status, v_sementara
  from public.pengurus p
  where p.nama = p_nama
    and p.wilayah_id = p_wilayah_id
    and p.status = 'aktif'
    and p.pin_hash = encode(extensions.digest(p_pin, 'sha256'), 'hex')
  limit 1;
  if not found then return; end if;
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.sesi (pengurus_id, token_hash, peran, wilayah_id, kadaluarsa)
  values (v_id, encode(extensions.digest(v_token, 'sha256'), 'hex'),
          v_peran, v_wilayah, now() + interval '8 hours');
  return query select v_id, v_nama, v_jabatan, v_peran, v_wilayah,
                      v_status, v_sementara, v_token;
end;
$$;
grant execute on function public.verifikasi_pin(text, text, text) to anon, authenticated;

-- keluar_sesi: hapus token (logout). Token tidak dikenal -> false.
create or replace function public.keluar_sesi(p_token text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_ok boolean;
begin
  delete from public.sesi
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.keluar_sesi(text) to anon, authenticated;

-- DROP pakai_kode_pemulihan versi lama (nama-saja, jangan dipakai lagi).
-- Pemulihan PIN memakai pakai_kode_pemulihan_wilayah (tetap anon, pengecualian).
drop function if exists public.pakai_kode_pemulihan(text, text, text);
-- ================= 5b. F3 + RPC akun/log bertoken =================
-- F3: daftar_pengurus (tanda tangan SAMA) — tambah validasi kode verifikasi
-- RW: wilayah harus ada dan status='aktif', bila kode_verifikasi wilayah
-- TIDAK NULL/kosong maka p_kode_verifikasi wajib cocok persis, bila salah
-- TOLAK (exception, tanpa INSERT). Bila kode_verifikasi wilayah NULL/kosong
-- (MVP hibrid) kode boleh kosong. kode_verifikasi tetap disimpan TEKS BIASA
-- di pengurus.kode_verifikasi (keputusan koordinator: RW harus bisa membaca
-- / memberikan kodenya ke RT) — tetapi kode_verifikasi wilayah TIDAK PERNAH
-- dikembalikan lewat RPC anon (lihat F4 di bawah).
create or replace function public.daftar_pengurus(p_nama text, p_jabatan text, p_wa text, p_email text, p_kode_verifikasi text, p_pin text, p_wilayah_id text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
  v_wil public.wilayah%rowtype;
begin
  if p_nama is null or btrim(p_nama) = '' then
    raise exception 'nama wajib diisi';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'PIN harus 4-6 angka';
  end if;
  if p_wilayah_id is null or btrim(p_wilayah_id) = '' then
    raise exception 'wilayah wajib dipilih';
  end if;
  select * into v_wil from public.wilayah w where w.id = p_wilayah_id;
  if not found then
    raise exception 'wilayah tidak ditemukan';
  end if;
  if v_wil.status <> 'aktif' then
    raise exception 'wilayah tidak aktif';
  end if;
  if v_wil.kode_verifikasi is not null and btrim(v_wil.kode_verifikasi) <> '' then
    if coalesce(p_kode_verifikasi, '') <> v_wil.kode_verifikasi then
      raise exception 'kode verifikasi salah';
    end if;
  end if;
  if exists (select 1 from public.pengurus
             where nama = btrim(p_nama) and wilayah_id = p_wilayah_id
               and status in ('menunggu', 'aktif')) then
    raise exception 'nama sudah terdaftar di wilayah ini';
  end if;
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  insert into public.pengurus
    (nama, jabatan, wa, email, peran, status, wilayah_id, kode_verifikasi,
     pin_hash, kode_pemulihan_hash, pin_sementara)
  values
    (btrim(p_nama), coalesce(p_jabatan, 'Pengurus'), coalesce(p_wa, ''),
     coalesce(p_email, ''), 'pengurus', 'menunggu', p_wilayah_id,
     coalesce(p_kode_verifikasi, ''),
     encode(extensions.digest(p_pin, 'sha256'), 'hex'),
     encode(extensions.digest(v_kode, 'sha256'), 'hex'),
     false);
  return v_kode;
end;
$$;
grant execute on function public.daftar_pengurus(text, text, text, text, text, text, text) to anon, authenticated;

-- atur_pin_baru (DIUBAH: p_pengurus_id DIGANTI p_token; PIN hanya boleh
-- diubah pemilik token itu sendiri; PIN lama tetap dicek dulu).
drop function if exists public.atur_pin_baru(text, text, text);
create function public.atur_pin_baru(p_token text, p_pin_lama text, p_pin_baru text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_sesi record; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  update public.pengurus
  set pin_hash = encode(extensions.digest(p_pin_baru, 'sha256'), 'hex'),
      pin_sementara = false
  where id = v_sesi.pengurus_id
    and status = 'aktif'
    and pin_hash = encode(extensions.digest(p_pin_lama, 'sha256'), 'hex')
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.atur_pin_baru(text, text, text) to anon, authenticated;

-- buat_kode_pemulihan_baru (DIUBAH: p_pengurus_id DIGANTI p_token; kode baru
-- hanya boleh dibuat pemilik token itu sendiri sesudah cek PIN).
drop function if exists public.buat_kode_pemulihan_baru(text, text);
create function public.buat_kode_pemulihan_baru(p_token text, p_pin text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_sesi record;
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
  v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return null; end if;
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  update public.pengurus
  set kode_pemulihan_hash = encode(extensions.digest(v_kode, 'sha256'), 'hex')
  where id = v_sesi.pengurus_id
    and status = 'aktif'
    and pin_hash = encode(extensions.digest(p_pin, 'sha256'), 'hex')
  returning true into v_ok;
  if coalesce(v_ok, false) then
    return v_kode;
  end if;
  return null;
end;
$$;
grant execute on function public.buat_kode_pemulihan_baru(text, text) to anon, authenticated;

-- profil_pengurus (DIUBAH: p_pengurus_id DIGANTI p_token; hanya profil
-- pemilik token yang dikembalikan).
drop function if exists public.profil_pengurus(text);
create function public.profil_pengurus(p_token text)
returns table (id text, nama text, jabatan text, peran text, wilayah_id text,
               status text, wa text, email text, pin_sementara boolean,
               ada_kode boolean)
language plpgsql security definer set search_path = public, extensions as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  return query
  select p.id, p.nama, p.jabatan, p.peran, p.wilayah_id, p.status,
         p.wa, p.email, p.pin_sementara,
         (p.kode_pemulihan_hash is not null)
  from public.pengurus p
  where p.id = v_sesi.pengurus_id and p.status = 'aktif'
  limit 1;
end;
$$;
grant execute on function public.profil_pengurus(text) to anon, authenticated;

-- F5: tulis_log (DIUBAH: tanda tangan lama (p_wilayah_id, p_pelaku_nama,
-- p_pelaku_peran, p_aksi, p_rincian) DIGANTI (p_token, p_aksi, p_rincian);
-- pelaku_nama diambil dari baris pengurus pemilik token, pelaku_peran dan
-- wilayah_id diambil dari baris sesi — TIDAK LAGI dari parameter, jadi
-- log TIDAK BISA dipalsukan anon. Tanpa token valid -> exception.
drop function if exists public.tulis_log(text, text, text, text, text);
create function public.tulis_log(p_token text, p_aksi text, p_rincian text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then
    raise exception 'token sesi tidak valid';
  end if;
  insert into public.log_riwayat (wilayah_id, pelaku_nama, pelaku_peran, aksi, rincian)
  select v_sesi.wilayah_id, p.nama, v_sesi.peran, p_aksi, coalesce(p_rincian, '')
  from public.pengurus p where p.id = v_sesi.pengurus_id;
end;
$$;
grant execute on function public.tulis_log(text, text, text) to anon, authenticated;

-- F5: baca_log (DIUBAH: (p_wilayah_id, p_peran) DIGANTI (p_token,
-- p_wilayah_id); peran diambil dari sesi). Superadmin WAJIB menghormati
-- p_wilayah_id: bila diisi, filter ke wilayah itu; bila kosong/null, semua
-- wilayah. Bukan superadmin: hanya log wilayahnya sendiri, apa pun isi
-- p_wilayah_id.
drop function if exists public.baca_log(text, text);
create function public.baca_log(p_token text, p_wilayah_id text)
returns table (id text, wilayah_id text, waktu timestamptz, pelaku_nama text,
               pelaku_peran text, aksi text, rincian text)
language plpgsql security definer set search_path = public as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  return query
  select l.id, l.wilayah_id, l.waktu, l.pelaku_nama, l.pelaku_peran, l.aksi, l.rincian
  from public.log_riwayat l
  where (v_sesi.peran = 'superadmin'
           and (p_wilayah_id is null or p_wilayah_id = '' or l.wilayah_id = p_wilayah_id))
     or (v_sesi.peran <> 'superadmin' and l.wilayah_id = v_sesi.wilayah_id)
  order by l.waktu desc
  limit 200;
end;
$$;
grant execute on function public.baca_log(text, text) to anon, authenticated;
-- ================= 5c. RPC ADMIN bertoken (F1, F2, F4) =================
-- Semua RPC di bawah WAJIB p_token TEXT sebagai parameter pertama dan
-- memvalidasi sesi di dalam fungsi (token ada, belum kadaluarsa, peran
-- sesi cocok). Tanda tangan LAMA yang memakai p_peran / p_pemohon_peran
-- dari browser DIHAPUS (DROP) supaya versi tanpa token tidak bisa lagi
-- dipanggil — peran SELALU diambil dari baris sesi, bukan dari parameter.
-- Cakupan wilayah memakai helper _boleh_wilayah: superadmin semua wilayah,
-- admin_rt wilayahnya sendiri, admin_rw wilayahnya sendiri + RT di bawahnya.

-- setujui_pengurus (DIUBAH: (p_pengurus_id) -> (p_token, p_pengurus_id)).
drop function if exists public.setujui_pengurus(text);
create function public.setujui_pengurus(p_token text, p_pengurus_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_t public.pengurus%rowtype; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  select * into v_t from public.pengurus where id = p_pengurus_id;
  if not found then return false; end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, v_t.wilayah_id) then
    return false;
  end if;
  update public.pengurus set status = 'aktif'
  where id = p_pengurus_id and status = 'menunggu'
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.setujui_pengurus(text, text) to anon, authenticated;

-- tolak_pengurus (DIUBAH: (p_pengurus_id) -> (p_token, p_pengurus_id)).
drop function if exists public.tolak_pengurus(text);
create function public.tolak_pengurus(p_token text, p_pengurus_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_t public.pengurus%rowtype; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  select * into v_t from public.pengurus where id = p_pengurus_id;
  if not found then return false; end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, v_t.wilayah_id) then
    return false;
  end if;
  delete from public.pengurus
  where id = p_pengurus_id and status = 'menunggu'
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.tolak_pengurus(text, text) to anon, authenticated;

-- F2: ubah_pengurus (DIUBAH: (p_pengurus_id, p_jabatan, p_peran, p_status,
-- p_pemohon_peran) -> (p_token, p_pengurus_id, p_jabatan, p_peran, p_status);
-- parameter p_pemohon_peran DIHAPUS). Aturan: (a) target Superadmin HANYA
-- boleh diubah oleh Superadmin itu sendiri (pengurus_id token = target),
-- pemohon lain -> false untuk perubahan apa pun; (b) pengangkatan ke
-- admin_rt / admin_rw / superadmin HANYA bila peran token = superadmin;
-- (c) cakupan wilayah via _boleh_wilayah; pengurus biasa -> false.
drop function if exists public.ubah_pengurus(text, text, text, text, text);
create function public.ubah_pengurus(p_token text, p_pengurus_id text, p_jabatan text, p_peran text, p_status text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_t public.pengurus%rowtype; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  select * into v_t from public.pengurus where id = p_pengurus_id;
  if not found then return false; end if;
  if p_peran not in ('superadmin', 'admin_rw', 'admin_rt', 'pengurus') then
    return false;
  end if;
  if p_status not in ('menunggu', 'aktif', 'nonaktif') then
    return false;
  end if;
  if v_t.peran = 'superadmin' and v_sesi.pengurus_id <> v_t.id then
    return false;
  end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, v_t.wilayah_id) then
    return false;
  end if;
  if p_peran in ('admin_rt', 'admin_rw', 'superadmin') and v_sesi.peran <> 'superadmin' then
    return false;
  end if;
  update public.pengurus
  set jabatan = coalesce(p_jabatan, jabatan),
      peran = p_peran,
      status = p_status
  where id = p_pengurus_id
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.ubah_pengurus(text, text, text, text, text) to anon, authenticated;

-- reset_pin_admin (DIUBAH: (p_pengurus_id) -> (p_token, p_pengurus_id)).
drop function if exists public.reset_pin_admin(text);
create function public.reset_pin_admin(p_token text, p_pengurus_id text)
returns table (pin text, kode text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_sesi record; v_t public.pengurus%rowtype;
  v_pin text;
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  select * into v_t from public.pengurus where id = p_pengurus_id;
  if not found then return; end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, v_t.wilayah_id) then
    return;
  end if;
  v_pin := (1000 + floor(random() * 9000)::int)::text;
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  update public.pengurus
  set pin_hash = encode(extensions.digest(v_pin, 'sha256'), 'hex'),
      kode_pemulihan_hash = encode(extensions.digest(v_kode, 'sha256'), 'hex'),
      pin_sementara = true
  where id = p_pengurus_id and status = 'aktif';
  if not found then
    return;
  end if;
  return query select v_pin, v_kode;
end;
$$;
grant execute on function public.reset_pin_admin(text, text) to anon, authenticated;

-- F4: daftar_semua_pengurus (DIUBAH: (p_wilayah_id, p_peran) ->
-- (p_token, p_wilayah_id); peran dari sesi). Masking kolom: kode_verifikasi
-- HANYA untuk superadmin (diputuskan: admin wilayah TIDAK boleh melihat
-- kode_verifikasi pendaftar); wa/email HANYA untuk superadmin + admin
-- wilayah itu (cakupan _boleh_wilayah, termasuk admin_rw atas RT di
-- bawahnya); selain itu dikembalikan string kosong.
drop function if exists public.daftar_semua_pengurus(text, text);
create function public.daftar_semua_pengurus(p_token text, p_wilayah_id text)
returns table (id text, nama text, jabatan text, peran text, status text,
               wilayah_id text, wa text, email text, kode_verifikasi text,
               pin_sementara boolean)
language plpgsql security definer set search_path = public as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  return query
  select p.id, p.nama, p.jabatan, p.peran, p.status, p.wilayah_id,
         case when v_sesi.peran = 'superadmin'
                   or public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p.wilayah_id)
              then p.wa else '' end,
         case when v_sesi.peran = 'superadmin'
                   or public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p.wilayah_id)
              then p.email else '' end,
         case when v_sesi.peran = 'superadmin' then p.kode_verifikasi else '' end,
         p.pin_sementara
  from public.pengurus p
  where (v_sesi.peran = 'superadmin'
           and (p_wilayah_id is null or p_wilayah_id = '' or p.wilayah_id = p_wilayah_id))
     or (v_sesi.peran <> 'superadmin'
           and public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p.wilayah_id))
  order by p.status, p.nama;
end;
$$;
grant execute on function public.daftar_semua_pengurus(text, text) to anon, authenticated;

-- F4: daftar_semua_wilayah (DIUBAH: () -> (p_token); TIDAK lagi anon tanpa
-- token — hanya sesi valid). Kolom kode_verifikasi DIHAPUS dari hasil
-- (tidak pernah keluar lewat daftar ini lagi).
drop function if exists public.daftar_semua_wilayah();
create function public.daftar_semua_wilayah(p_token text)
returns table (id text, jenis text, nomor text, kelurahan text, kecamatan text,
               kota text, provinsi text, ketua_nama text, ketua_wa text,
               ketua_email text, rw_induk_id text, status text)
language plpgsql security definer set search_path = public as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  return query
  select w.id, w.jenis, w.nomor, w.kelurahan, w.kecamatan, w.kota, w.provinsi,
         w.ketua_nama, w.ketua_wa, w.ketua_email, w.rw_induk_id, w.status
  from public.wilayah w
  order by w.jenis, w.kelurahan, w.nomor;
end;
$$;
grant execute on function public.daftar_semua_wilayah(text) to anon, authenticated;

-- F4: baca_kode_verifikasi (BARU): kembalikan kode_verifikasi satu wilayah,
-- SEKALI per panggilan, hanya untuk superadmin (wilayah mana pun) atau
-- admin_rw atas wilayahnya sendiri. Peran lain / token tidak valid -> null.
-- Ini satu-satunya jalan membaca kode_verifikasi wilayah lewat RPC.
create or replace function public.baca_kode_verifikasi(p_token text, p_wilayah_id text)
returns text
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_kode text;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return null; end if;
  if v_sesi.peran <> 'superadmin'
     and not (v_sesi.peran = 'admin_rw' and v_sesi.wilayah_id = p_wilayah_id) then
    return null;
  end if;
  select w.kode_verifikasi into v_kode from public.wilayah w where w.id = p_wilayah_id;
  return v_kode;
end;
$$;
grant execute on function public.baca_kode_verifikasi(text, text) to anon, authenticated;

-- ubah_wilayah (DIUBAH: 11x text -> (p_token + 11x text); cakupan wilayah
-- via _boleh_wilayah — superadmin semua, admin_rw/rt wilayahnya sendiri
-- + RT di bawah RW-nya; pengurus biasa -> false).
drop function if exists public.ubah_wilayah(text, text, text, text, text, text, text, text, text, text, text);
create function public.ubah_wilayah(p_token text, p_wilayah_id text, p_nomor text, p_kelurahan text, p_kecamatan text, p_kota text, p_provinsi text, p_ketua_nama text, p_ketua_wa text, p_ketua_email text, p_kode_verifikasi text, p_rw_induk_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p_wilayah_id) then
    return false;
  end if;
  update public.wilayah
  set nomor = coalesce(p_nomor, nomor),
      kelurahan = coalesce(p_kelurahan, kelurahan),
      kecamatan = coalesce(p_kecamatan, kecamatan),
      kota = coalesce(p_kota, kota),
      provinsi = coalesce(p_provinsi, provinsi),
      ketua_nama = coalesce(p_ketua_nama, ketua_nama),
      ketua_wa = coalesce(p_ketua_wa, ketua_wa),
      ketua_email = coalesce(p_ketua_email, ketua_email),
      kode_verifikasi = nullif(p_kode_verifikasi, ''),
      rw_induk_id = nullif(p_rw_induk_id, '')
  where id = p_wilayah_id
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.ubah_wilayah(text, text, text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- ubah_status_wilayah (DIUBAH: (p_wilayah_id, p_status) ->
-- (p_token, p_wilayah_id, p_status)). Superadmin: wilayah mana pun.
-- admin_rw: hanya RT yang rw_induk_id-nya = wilayah sesi (verifikasi RT).
-- admin_rt / pengurus: tidak boleh.
drop function if exists public.ubah_status_wilayah(text, text);
create function public.ubah_status_wilayah(p_token text, p_wilayah_id text, p_status text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_w public.wilayah%rowtype; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  if p_status not in ('menunggu', 'aktif', 'nonaktif') then
    return false;
  end if;
  if v_sesi.peran = 'superadmin' then
    -- boleh semua wilayah
  elsif v_sesi.peran = 'admin_rw' then
    select * into v_w from public.wilayah where id = p_wilayah_id;
    if not found or v_w.jenis <> 'rt' or v_w.rw_induk_id <> v_sesi.wilayah_id then
      return false;
    end if;
  else
    return false;
  end if;
  update public.wilayah set status = p_status
  where id = p_wilayah_id
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.ubah_status_wilayah(text, text, text) to anon, authenticated;

-- daftar_rt_menunggu_rw (DIUBAH: (p_rw_id) -> (p_token, p_rw_id)).
-- Superadmin: RW mana pun. admin_rw: hanya RW-nya sendiri. admin_rt: hanya
-- RW induk dari wilayahnya sendiri. pengurus biasa: kosong.
drop function if exists public.daftar_rt_menunggu_rw(text);
create function public.daftar_rt_menunggu_rw(p_token text, p_rw_id text)
returns table (id text, nomor text, kelurahan text, kecamatan text, kota text,
               ketua_nama text, ketua_wa text, ketua_email text, status text)
language plpgsql security definer set search_path = public as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  if v_sesi.peran = 'superadmin' then
    -- boleh RW mana pun
  elsif v_sesi.peran = 'admin_rw' then
    if p_rw_id <> v_sesi.wilayah_id then return; end if;
  elsif v_sesi.peran = 'admin_rt' then
    if not exists (select 1 from public.wilayah w
                   where w.id = v_sesi.wilayah_id and w.rw_induk_id = p_rw_id) then
      return;
    end if;
  else
    return;
  end if;
  return query
  select w.id, w.nomor, w.kelurahan, w.kecamatan, w.kota,
         w.ketua_nama, w.ketua_wa, w.ketua_email, w.status
  from public.wilayah w
  where w.jenis = 'rt' and w.rw_induk_id = p_rw_id and w.status = 'menunggu'
  order by w.nomor;
end;
$$;
grant execute on function public.daftar_rt_menunggu_rw(text, text) to anon, authenticated;
-- ================= 5d. PERBAIKAN ATRIBUSI LOG + MASKING KODE VERIFIKASI (Pekerja perbaikan 3, 24 Nov 2026) =================
-- 1) tulis_log: atribusi log lintas wilayah (temuan Pekerja perbaikan 2).
--    Tanda tangan lama (p_token, p_aksi, p_rincian) DIGANTI
--    (p_token, p_aksi, p_rincian, p_wilayah_target DEFAULT NULL). Bila
--    p_wilayah_target diisi, divalidasi dengan _boleh_wilayah (superadmin:
--    semua wilayah; admin_rt: wilayahnya; admin_rw: wilayahnya + RT di
--    bawahnya) — tidak boleh -> exception; lolos -> log ditulis dengan
--    wilayah_id = target. Bila NULL/kosong, pakai wilayah sesi seperti
--    sebelumnya. Pengurus biasa BOLEH tulis log untuk aksi datanya sendiri
--    HANYA di wilayah sesinya (tambah warga/iuran/kas); target wilayah
--    lain -> exception.
--    KEPUTUSAN (dicatat atas perintah koordinator): aturan pengurus ini
--    diterapkan DI DALAM tulis_log, BUKAN dengan mengubah _boleh_wilayah
--    secara global — mengubah helper itu akan membuka setujui_pengurus /
--    tolak_pengurus / reset_pin_admin / ubah_wilayah dan daftar_semua_
--    pengurus (pengurus jadi dapat baris + wa/email) untuk pengurus di
--    wilayahnya sendiri, yang bertentangan dengan tugas 2 (pengurus biasa
--    tetap 0 baris di daftar_semua_pengurus). _boleh_wilayah TIDAK DIUBAH.
-- 2) daftar_semua_pengurus: masking kode_verifikasi dilonggarkan — kolom
--    dikembalikan bila peran token = superadmin (wilayah mana pun) ATAU
--    peran token = admin_rt DAN wilayah pendaftar = wilayah sesi admin
--    itu. admin_rw tetap kosong; pengurus biasa tetap 0 baris; masking
--    wa/email tidak berubah.

-- --- 5d-a. tulis_log (DIUBAH) ---
-- DROP dulu karena jumlah parameter berubah (CREATE OR REPLACE tidak bisa).
drop function if exists public.tulis_log(text, text, text);
create function public.tulis_log(p_token text, p_aksi text, p_rincian text, p_wilayah_target text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_wilayah text;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then
    raise exception 'token sesi tidak valid';
  end if;
  if p_wilayah_target is null or btrim(p_wilayah_target) = '' then
    v_wilayah := v_sesi.wilayah_id;
  else
    if v_sesi.peran = 'pengurus' then
      -- Pengurus biasa: hanya wilayah sesinya sendiri.
      if p_wilayah_target <> v_sesi.wilayah_id then
        raise exception 'pengurus hanya boleh tulis log di wilayahnya sendiri';
      end if;
    elsif not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p_wilayah_target) then
      raise exception 'tidak boleh tulis log di wilayah ini';
    end if;
    v_wilayah := p_wilayah_target;
  end if;
  insert into public.log_riwayat (wilayah_id, pelaku_nama, pelaku_peran, aksi, rincian)
  select v_wilayah, p.nama, v_sesi.peran, p_aksi, coalesce(p_rincian, '')
  from public.pengurus p where p.id = v_sesi.pengurus_id;
end;
$$;
grant execute on function public.tulis_log(text, text, text, text) to anon, authenticated;

-- --- 5d-b. daftar_semua_pengurus (DIUBAH: masking kode_verifikasi) ---
-- Tanda tangan sama (p_token, p_wilayah_id), jadi CREATE OR REPLACE cukup.
-- Satu-satunya perubahan: CASE kode_verifikasi — tambah cabang admin_rt
-- atas wilayahnya sendiri. WHERE (cakupan baris) dan masking wa/email
-- TIDAK berubah.
create or replace function public.daftar_semua_pengurus(p_token text, p_wilayah_id text)
returns table (id text, nama text, jabatan text, peran text, status text,
               wilayah_id text, wa text, email text, kode_verifikasi text,
               pin_sementara boolean)
language plpgsql security definer set search_path = public as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  return query
  select p.id, p.nama, p.jabatan, p.peran, p.status, p.wilayah_id,
         case when v_sesi.peran = 'superadmin'
                   or public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p.wilayah_id)
              then p.wa else '' end,
         case when v_sesi.peran = 'superadmin'
                   or public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p.wilayah_id)
              then p.email else '' end,
         case when v_sesi.peran = 'superadmin'
                   or (v_sesi.peran = 'admin_rt' and p.wilayah_id = v_sesi.wilayah_id)
              then p.kode_verifikasi else '' end,
         p.pin_sementara
  from public.pengurus p
  where (v_sesi.peran = 'superadmin'
           and (p_wilayah_id is null or p_wilayah_id = '' or p.wilayah_id = p_wilayah_id))
     or (v_sesi.peran <> 'superadmin'
           and public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p.wilayah_id))
  order by p.status, p.nama;
end;
$$;
grant execute on function public.daftar_semua_pengurus(text, text) to anon, authenticated;

-- ================= 5e. PERBAIKAN REVIEWER KE-2 N1-N7 (Pekerja perbaikan 5, 24 Nov 2026) =================
-- Diterapkan langsung ke DB-web-rtrw (uoywhmhrlrvldigkhgfj) lewat konektor kujang.
-- Semua RPC di bawah tanda tangan SAMA dengan sebelumnya, kecuali
-- daftar_semua_pengurus yang KEHILANGAN kolom kode_verifikasi dari hasil
-- (DROP + CREATE ulang, karena tipe kembalian berubah).
-- CATATAN KONFLIK (untuk koordinator): N3 menyebut daftar_semua_pengurus
-- harus menolak admin_rw sepenuhnya, tetapi N5 + daftar uji menyebut
-- admin_rw tetap mendapat baris pengurus RT di bawahnya (nama/jabatan/
-- peran/status saja, tanpa wa/email). Yang diterapkan: N5/uji — admin_rw
-- tetap dapat baris, wa/email dikosongkan. Bila N3 yang menang, tambah
-- satu baris di daftar_semua_pengurus: if v_sesi.peran = 'admin_rw'
-- then return; end if;
-- N2: kebijakan RLS "daftar pengurus menunggu" atas pengurus TIDAK dihapus
-- (tetap ada di skema), tetapi GRANT INSERT-nya dicabut sehingga INSERT
-- langsung anon tertutup; pendaftaran HANYA lewat RPC daftar_pengurus.
-- Pengecekan frontend (hanya laporan, tidak diubah): TIDAK ADA kode
-- frontend yang INSERT langsung ke pengurus — satu-satunya .insert() ke
-- Supabase adalah c.from('wilayah').insert(...) di app.js:1302
-- (pendaftaran wilayah, memang lewat RLS anon). Pendaftaran pengurus
-- frontend memakai RPC daftar_pengurus (app.js:1234). supabase.js hanya
-- sinkronisasi tabel lokal (info/usaha/dst), bukan pengurus.
-- N6: kode verifikasi pendaftar TIDAK LAGI disimpan — daftar_pengurus
-- tetap memvalidasi p_kode_verifikasi terhadap wilayah.kode_verifikasi,
-- tetapi nilainya tidak ditulis ke mana pun; kolom pengurus.kode_verifikasi
-- di-DROP. Pembacaan p.kode_verifikasi di app.js SUDAH DIHAPUS oleh
-- Pekerja perbaikan 6 (grep literal 'p.kode_verifikasi' di app.js
-- kosong — yang tersisa hanya parameter p_kode_verifikasi saat daftar /
-- ubah wilayah, bukan pembacaan kolom pengurus; UI Kelola Pengurus
-- terverifikasi tidak lagi menampilkan kode verifikasi).

-- --- 5e-a. N5+N6: daftar_semua_pengurus tanpa kode_verifikasi; masking
-- wa/email HANYA superadmin + admin_rt atas wilayahnya sendiri (admin_rw
-- dan pengurus biasa: kosong). Lalu DROP COLUMN pengurus.kode_verifikasi.
drop function if exists public.daftar_semua_pengurus(text, text);
create function public.daftar_semua_pengurus(p_token text, p_wilayah_id text)
returns table (id text, nama text, jabatan text, peran text, status text,
               wilayah_id text, wa text, email text, pin_sementara boolean)
language plpgsql security definer set search_path = public as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  return query
  select p.id, p.nama, p.jabatan, p.peran, p.status, p.wilayah_id,
         case when v_sesi.peran = 'superadmin'
                   or (v_sesi.peran = 'admin_rt' and p.wilayah_id = v_sesi.wilayah_id)
              then p.wa else '' end,
         case when v_sesi.peran = 'superadmin'
                   or (v_sesi.peran = 'admin_rt' and p.wilayah_id = v_sesi.wilayah_id)
              then p.email else '' end,
         p.pin_sementara
  from public.pengurus p
  where (v_sesi.peran = 'superadmin'
           and (p_wilayah_id is null or p_wilayah_id = '' or p.wilayah_id = p_wilayah_id))
     or (v_sesi.peran <> 'superadmin'
           and public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p.wilayah_id))
  order by p.status, p.nama;
end;
$$;
grant execute on function public.daftar_semua_pengurus(text, text) to anon, authenticated;
alter table public.pengurus drop column if exists kode_verifikasi;

-- --- 5e-b. N6+N2: daftar_pengurus TIDAK menulis p_kode_verifikasi
-- (validasi terhadap wilayah.kode_verifikasi tetap; PIN 4-6 angka tetap),
-- lalu REVOKE INSERT anon atas pengurus.
create or replace function public.daftar_pengurus(p_nama text, p_jabatan text, p_wa text, p_email text, p_kode_verifikasi text, p_pin text, p_wilayah_id text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
  v_wil public.wilayah%rowtype;
begin
  if p_nama is null or btrim(p_nama) = '' then
    raise exception 'nama wajib diisi';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'PIN harus 4-6 angka';
  end if;
  if p_wilayah_id is null or btrim(p_wilayah_id) = '' then
    raise exception 'wilayah wajib dipilih';
  end if;
  select * into v_wil from public.wilayah w where w.id = p_wilayah_id;
  if not found then
    raise exception 'wilayah tidak ditemukan';
  end if;
  if v_wil.status <> 'aktif' then
    raise exception 'wilayah tidak aktif';
  end if;
  if v_wil.kode_verifikasi is not null and btrim(v_wil.kode_verifikasi) <> '' then
    if coalesce(p_kode_verifikasi, '') <> v_wil.kode_verifikasi then
      raise exception 'kode verifikasi salah';
    end if;
  end if;
  if exists (select 1 from public.pengurus
             where nama = btrim(p_nama) and wilayah_id = p_wilayah_id
               and status in ('menunggu', 'aktif')) then
    raise exception 'nama sudah terdaftar di wilayah ini';
  end if;
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  insert into public.pengurus
    (nama, jabatan, wa, email, peran, status, wilayah_id,
     pin_hash, kode_pemulihan_hash, pin_sementara)
  values
    (btrim(p_nama), coalesce(p_jabatan, 'Pengurus'), coalesce(p_wa, ''),
     coalesce(p_email, ''), 'pengurus', 'menunggu', p_wilayah_id,
     encode(extensions.digest(p_pin, 'sha256'), 'hex'),
     encode(extensions.digest(v_kode, 'sha256'), 'hex'),
     false);
  return v_kode;
end;
$$;
grant execute on function public.daftar_pengurus(text, text, text, text, text, text, text) to anon, authenticated;
revoke insert on public.pengurus from anon;

-- --- 5e-c. N1+N3: setujui/tolak/ubah/reset — admin_rw DITOLAK eksplisit
-- (hanya superadmin + admin_rt); target Superadmin hanya boleh oleh
-- Superadmin itu sendiri (pengurus_id token = target).
create or replace function public.setujui_pengurus(p_token text, p_pengurus_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_t public.pengurus%rowtype; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  if v_sesi.peran not in ('superadmin', 'admin_rt') then return false; end if;
  select * into v_t from public.pengurus where id = p_pengurus_id;
  if not found then return false; end if;
  if v_t.peran = 'superadmin' and v_sesi.pengurus_id <> v_t.id then return false; end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, v_t.wilayah_id) then
    return false;
  end if;
  update public.pengurus set status = 'aktif'
  where id = p_pengurus_id and status = 'menunggu'
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.setujui_pengurus(text, text) to anon, authenticated;

create or replace function public.tolak_pengurus(p_token text, p_pengurus_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_t public.pengurus%rowtype; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  if v_sesi.peran not in ('superadmin', 'admin_rt') then return false; end if;
  select * into v_t from public.pengurus where id = p_pengurus_id;
  if not found then return false; end if;
  if v_t.peran = 'superadmin' and v_sesi.pengurus_id <> v_t.id then return false; end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, v_t.wilayah_id) then
    return false;
  end if;
  delete from public.pengurus
  where id = p_pengurus_id and status = 'menunggu'
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.tolak_pengurus(text, text) to anon, authenticated;

create or replace function public.ubah_pengurus(p_token text, p_pengurus_id text, p_jabatan text, p_peran text, p_status text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_t public.pengurus%rowtype; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  if v_sesi.peran not in ('superadmin', 'admin_rt') then return false; end if;
  select * into v_t from public.pengurus where id = p_pengurus_id;
  if not found then return false; end if;
  if p_peran not in ('superadmin', 'admin_rw', 'admin_rt', 'pengurus') then
    return false;
  end if;
  if p_status not in ('menunggu', 'aktif', 'nonaktif') then
    return false;
  end if;
  if v_t.peran = 'superadmin' and v_sesi.pengurus_id <> v_t.id then
    return false;
  end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, v_t.wilayah_id) then
    return false;
  end if;
  if p_peran in ('admin_rt', 'admin_rw', 'superadmin') and v_sesi.peran <> 'superadmin' then
    return false;
  end if;
  update public.pengurus
  set jabatan = coalesce(p_jabatan, jabatan),
      peran = p_peran,
      status = p_status
  where id = p_pengurus_id
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.ubah_pengurus(text, text, text, text, text) to anon, authenticated;

create or replace function public.reset_pin_admin(p_token text, p_pengurus_id text)
returns table (pin text, kode text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_sesi record; v_t public.pengurus%rowtype;
  v_pin text;
  v_kode text := '';
  v_alfabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  if v_sesi.peran not in ('superadmin', 'admin_rt') then return; end if;
  select * into v_t from public.pengurus where id = p_pengurus_id;
  if not found then return; end if;
  if v_t.peran = 'superadmin' and v_sesi.pengurus_id <> v_t.id then return; end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, v_t.wilayah_id) then
    return;
  end if;
  v_pin := (1000 + floor(random() * 9000)::int)::text;
  for i in 1..8 loop
    v_kode := v_kode || substr(v_alfabet, 1 + floor(random() * length(v_alfabet))::int, 1);
  end loop;
  update public.pengurus
  set pin_hash = encode(extensions.digest(v_pin, 'sha256'), 'hex'),
      kode_pemulihan_hash = encode(extensions.digest(v_kode, 'sha256'), 'hex'),
      pin_sementara = true
  where id = p_pengurus_id and status = 'aktif';
  if not found then
    return;
  end if;
  return query select v_pin, v_kode;
end;
$$;
grant execute on function public.reset_pin_admin(text, text) to anon, authenticated;

-- --- 5e-d. N3: ubah_wilayah tolak admin_rw (hanya superadmin + admin_rt).
create or replace function public.ubah_wilayah(p_token text, p_wilayah_id text, p_nomor text, p_kelurahan text, p_kecamatan text, p_kota text, p_provinsi text, p_ketua_nama text, p_ketua_wa text, p_ketua_email text, p_kode_verifikasi text, p_rw_induk_id text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_sesi record; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  if v_sesi.peran not in ('superadmin', 'admin_rt') then return false; end if;
  if not public._boleh_wilayah(v_sesi.peran, v_sesi.wilayah_id, p_wilayah_id) then
    return false;
  end if;
  update public.wilayah
  set nomor = coalesce(p_nomor, nomor),
      kelurahan = coalesce(p_kelurahan, kelurahan),
      kecamatan = coalesce(p_kecamatan, kecamatan),
      kota = coalesce(p_kota, kota),
      provinsi = coalesce(p_provinsi, provinsi),
      ketua_nama = coalesce(p_ketua_nama, ketua_nama),
      ketua_wa = coalesce(p_ketua_wa, ketua_wa),
      ketua_email = coalesce(p_ketua_email, ketua_email),
      kode_verifikasi = nullif(p_kode_verifikasi, ''),
      rw_induk_id = nullif(p_rw_induk_id, '')
  where id = p_wilayah_id
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.ubah_wilayah(text, text, text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- --- 5e-e. N5: daftar_semua_wilayah — ketua_wa/ketua_email KOSONG bila
-- peran token = pengurus (L4). Peran lain tidak berubah.
create or replace function public.daftar_semua_wilayah(p_token text)
returns table (id text, jenis text, nomor text, kelurahan text, kecamatan text,
               kota text, provinsi text, ketua_nama text, ketua_wa text,
               ketua_email text, rw_induk_id text, status text)
language plpgsql security definer set search_path = public as $$
declare v_sesi record;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return; end if;
  return query
  select w.id, w.jenis, w.nomor, w.kelurahan, w.kecamatan, w.kota, w.provinsi,
         w.ketua_nama,
         case when v_sesi.peran = 'pengurus' then '' else w.ketua_wa end,
         case when v_sesi.peran = 'pengurus' then '' else w.ketua_email end,
         w.rw_induk_id, w.status
  from public.wilayah w
  order by w.jenis, w.kelurahan, w.nomor;
end;
$$;
grant execute on function public.daftar_semua_wilayah(text) to anon, authenticated;

-- --- 5e-f. N4: validasi format PIN baru ^[0-9]{4,6}$ di atur_pin_baru
-- dan pakai_kode_pemulihan_wilayah (daftar_pengurus sudah punya sejak
-- Pekerja 2, dipertahankan di 5e-b).
create or replace function public.atur_pin_baru(p_token text, p_pin_lama text, p_pin_baru text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_sesi record; v_ok boolean;
begin
  select * into v_sesi from public._sesi_valid(p_token);
  if not found then return false; end if;
  if p_pin_baru is null or p_pin_baru !~ '^[0-9]{4,6}$' then return false; end if;
  update public.pengurus
  set pin_hash = encode(extensions.digest(p_pin_baru, 'sha256'), 'hex'),
      pin_sementara = false
  where id = v_sesi.pengurus_id
    and status = 'aktif'
    and pin_hash = encode(extensions.digest(p_pin_lama, 'sha256'), 'hex')
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.atur_pin_baru(text, text, text) to anon, authenticated;

create or replace function public.pakai_kode_pemulihan_wilayah(p_nama text, p_wilayah_id text, p_kode text, p_pin_baru text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_ok boolean;
begin
  if p_pin_baru is null or p_pin_baru !~ '^[0-9]{4,6}$' then return false; end if;
  update public.pengurus
  set pin_hash = encode(extensions.digest(p_pin_baru, 'sha256'), 'hex'),
      kode_pemulihan_hash = null,
      pin_sementara = false
  where nama = p_nama
    and wilayah_id = p_wilayah_id
    and status = 'aktif'
    and kode_pemulihan_hash is not null
    and kode_pemulihan_hash = encode(extensions.digest(p_kode, 'sha256'), 'hex')
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;
grant execute on function public.pakai_kode_pemulihan_wilayah(text, text, text, text) to anon, authenticated;

-- --- 5e-g. Seed RW 13 (keputusan koordinator): RW 13 Pagelaran + RT 07
-- di bawahnya, supaya halaman RW bisa didemokan.
insert into public.wilayah
  (id, jenis, nomor, kelurahan, kecamatan, kota, provinsi,
   ketua_nama, ketua_wa, ketua_email, rw_induk_id, kode_verifikasi, status)
values
  ('rw13-pagelaran', 'rw', '13', 'Pagelaran', 'Ciomas',
   'Kabupaten Bogor', 'Jawa Barat', '', '', '', null, null, 'aktif')
on conflict (id) do nothing;
update public.wilayah set rw_induk_id = 'rw13-pagelaran' where id = 'rt07-rw13-pagelaran';

-- TIDAK DIUBAH di 5e (tetap seperti sebelumnya): _boleh_wilayah (dipakai
-- superadmin/admin_rt; admin_rw ditolak eksplisit di tiap fungsi di atas),
-- ubah_status_wilayah (admin_rw BOLEH verifikasi RT anaknya),
-- daftar_rt_menunggu_rw (admin_rw BOLEH atas RW-nya sendiri),
-- baca_kode_verifikasi (admin_rw BOLEH atas wilayahnya sendiri),
-- tulis_log (admin_rw BOLEH tulis log aksi verifikasi RT).
-- Hasil uji 24 Nov 2026 (REST anon, 26/26 LULUS): N1 reset admin_rt atas
-- superadmin lain false + reset superadmin atas diri sendiri berhasil;
-- N2 POST /rest/v1/pengurus anon 401 + daftar kode salah ditolak/kode
-- benar berhasil; N3 admin_rw setujui/ubah/reset/tolak/ubah_wilayah atas
-- RT anak false, ubah_status verifikasi RT true, daftar_rt_menunggu_rw
-- berhasil; N4 PIN "1"/"12" false, "1234"/"5678" true; N5 wa/email kosong
-- untuk pengurus (wilayah) dan admin_rw (pengurus RT); N6 kolom
-- pengurus.kode_verifikasi SUDAH TIDAK ADA. Kondisi akhir: pengurus 1
-- (Masdan, PIN 1234 jalan), wilayah 2, log 0, sesi 0.
