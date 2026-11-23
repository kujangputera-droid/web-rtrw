/* kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id. Lisensi Nonkomersial Maliki Studio: wajib kredit, dilarang dijual (lihat LICENSE). */
/* Supabase — lapisan sambung data cloud (tanpa build, lewat CDN).
   BATAS AKSES (RLS, lihat supabase-schema.sql) — patuhi persis:
   - HANYA 3 tabel publik yang boleh dibaca/ditulis dari web ini:
     info, usaha, telp_penting. Anon hanya punya SELECT (+ GRANT SELECT)
     untuk ketiganya; tulis (INSERT/UPDATE/DELETE) BELUM ADA kebijakannya,
     jadi upsert akan gagal 403 sampai gerbang akses diputuskan — gagal
     dengan tenang (console.warn saja, simpan lokal tidak terganggu).
   - JANGAN ADA panggilan Supabase apa pun untuk: kk, anggota_kk, iuran,
     kas, surat, nomor_surat, pengaturan, pengurus. Tabel-tabel itu tetap
     100% localStorage. Pemetaan kolomnya di bawah hanya dokumentasi
     (untuk gerbang nanti), bukan untuk dipakai sekarang.
   - Bucket rtrw-foto: baca publik saja, TIDAK ADA kebijakan tulis/unggah,
     jadi uploadFotoKegiatan() mengembalikan null sampai gerbang diputuskan.
   - Mode ?demo TIDAK PERNAH menyentuh Supabase (data demo hanya lokal).
   - Gagal jaringan / kunci placeholder / CDN tidak termuat = mode offline
     penuh: situs jalan normal dengan localStorage, tanpa error. */
(function () {
  'use strict';

  /* ========== Konfigurasi ========== */
  var SUPABASE_URL = 'https://uoywhmhrlrvldigkhgfj.supabase.co';
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // GANTI 'ISI-ANON-KEY-DI-SINI' dengan anon key ASLI dari Dashboard
  // Supabase → Settings → API → "anon public" key.
  // Kunci service_role DILARANG di sini: kunci itu melewati RLS dan
  // TIDAK BOLEH ada di kode frontend yang bisa dibaca siapa saja.
  // Selama masih placeholder, situs jalan 100% offline (localStorage
  // saja) tanpa error.
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  var SUPABASE_ANON_KEY = 'ISI-ANON-KEY-DI-SINI';
  var BUCKET_FOTO = 'rtrw-foto';

  var DEMO = /[?&]demo\b/.test(location.search);
  var TABEL_PUBLIK = ['info', 'usaha', 'telp_penting'];
  /* Nama tabel Supabase -> kunci di objek D (app.js). */
  var TABEL_KE_LOKAL = { info: 'info', usaha: 'usaha', telp_penting: 'telpPenting' };
  /* Status baca awal per tabel: 'ok' (cloud ada isi), 'kosong' (cloud
     kosong), 'gagal' (baca awal gagal / offline). Tulis hanya jalan bila
     status 'ok'/'kosong', supaya data lokal lama tidak menimpa data cloud
     yang belum sempat dibaca. */
  var statusMuat = {};

  /* ========== Client (hanya bila pustaka termuat DAN kunci asli) ========== */
  var kunciOk = typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY !== 'ISI-ANON-KEY-DI-SINI' && SUPABASE_ANON_KEY.length > 20;
  var client = null;
  if (!DEMO && kunciOk && window.supabase && typeof window.supabase.createClient === 'function') {
    try { client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
    catch (e) { console.warn('[supabase] client gagal dibuat: ' + (e && e.message || e)); client = null; }
  }
  function aktif() { return !!client; }

  /* ========== Pemetaan kolom snake_case (Supabase) <-> camelCase (lokal) ==========
     Kunci = kolom Supabase, nilai = field lokal. Yang dipakai SEKARANG hanya
     info / usaha / telp_penting. Baris lain = dokumentasi skema untuk gerbang
     nanti, JANGAN dipakai sebelum RLS tabel itu diputuskan.
     Catatan bentuk lokal: anggota_kk tidak punya id sendiri (nested di
     kk.anggota) dan pengurus tidak punya id; iuran lokal bersarang
     { bulan: { kkId: tglBayar } } sehingga pemetaannya per-baris
     { bulan, kkId, tglBayar } dan harus diratakan dulu bila dipakai nanti. */
  var PETA = {
    info: { id: 'id', jenis: 'jenis', judul: 'judul', isi: 'isi', tgl: 'tgl', jam: 'jam', tempat: 'tempat', sematkan: 'sematkan' },
    usaha: { id: 'id', nama: 'nama', pemilik: 'pemilik', kk_id: 'kkId', jenis: 'jenis', wa: 'wa', alamat: 'alamat', jam: 'jam', ket: 'ket', aktif: 'aktif', dibuat: 'dibuat' },
    telp_penting: { id: 'id', nama: 'nama', nomor: 'nomor', ket: 'ket', jenis: 'jenis' },
    kk: { id: 'id', no_kk: 'noKK', kepala: 'kepala', alamat: 'alamat', status: 'status', wa: 'wa', dibuat: 'dibuat' },
    anggota_kk: { id: 'id', kk_id: 'kkId', nama: 'nama', nik: 'nik', jk: 'jk', hubungan: 'hubungan', tempat_lahir: 'tempatLahir', tgl_lahir: 'tglLahir', agama: 'agama', pekerjaan: 'pekerjaan', kawin: 'kawin' },
    iuran: { id: 'id', bulan: 'bulan', kk_id: 'kkId', tgl_bayar: 'tglBayar' },
    kas: { id: 'id', tgl: 'tgl', jenis: 'jenis', kategori: 'kategori', ket: 'ket', jumlah: 'jumlah', ref: 'ref' },
    surat: { id: 'id', no: 'no', tgl: 'tgl', nama: 'nama', nik: 'nik', jk: 'jk', tempat_lahir: 'tempatLahir', tgl_lahir: 'tglLahir', agama: 'agama', pekerjaan: 'pekerjaan', kawin: 'kawin', alamat: 'alamat', keperluan: 'keperluan', ket: 'ket' },
    nomor_surat: { id: 'id', tahun: 'tahun', urut: 'urut' },
    pengaturan: { id: 'id', rt: 'rt', rw: 'rw', kelurahan: 'kelurahan', kecamatan: 'kecamatan', kota: 'kota', provinsi: 'provinsi', alamat: 'alamat', iuran: 'iuran', iuran_mulai: 'iuranMulai', cara_bayar: 'caraBayar', pin: 'pin' },
    pengurus: { id: 'id', jabatan: 'jabatan', nama: 'nama', wa: 'wa' }
  };
  var KOLOM_TANGGAL = { tgl: 1, dibuat: 1, tgl_lahir: 1, tgl_bayar: 1 };
  function keCloud(tabel, lokal) {
    var peta = PETA[tabel];
    if (!peta || !lokal) return null;
    var o = {};
    Object.keys(peta).forEach(function (kolom) {
      var v = lokal[peta[kolom]];
      if (v === undefined) return;
      if (v === '' && KOLOM_TANGGAL[kolom]) v = null; /* kolom date menolak '' */
      o[kolom] = v;
    });
    /* usaha.kk_id menunjuk ke tabel kk (FK). Tabel kk di cloud masih kosong
       dan anon tidak bisa membacanya, jadi kirim null dulu supaya upsert
       tidak gagal karena FK; tautan KK tetap tersimpan di localStorage. */
    if (tabel === 'usaha') o.kk_id = null;
    return o;
  }
  function dariCloud(tabel, baris) {
    var peta = PETA[tabel];
    if (!peta || !baris) return null;
    var o = {};
    Object.keys(peta).forEach(function (kolom) {
      var v = baris[kolom];
      if (v === undefined || v === null) return;
      o[peta[kolom]] = v;
    });
    return o;
  }

  /* ========== Baca ========== */
  /* lalu({ ok, kosong, baris, alasan }). Gagal = ok:false, tanpa error ke pengguna. */
  function muatTabel(tabel, lalu) {
    if (!client) { statusMuat[tabel] = 'gagal'; lalu({ ok: false, kosong: false, baris: [], alasan: 'offline' }); return; }
    client.from(tabel).select('*').then(function (r) {
      if (r.error) { console.warn('[supabase] baca ' + tabel + ' gagal: ' + r.error.message); statusMuat[tabel] = 'gagal'; lalu({ ok: false, kosong: false, baris: [], alasan: r.error.message }); return; }
      var baris = (r.data || []).map(function (b) { return dariCloud(tabel, b); }).filter(function (b) { return !!b; });
      statusMuat[tabel] = baris.length ? 'ok' : 'kosong';
      lalu({ ok: true, kosong: !baris.length, baris: baris, alasan: '' });
    }).catch(function (e) {
      console.warn('[supabase] baca ' + tabel + ' gagal: ' + (e && e.message || e));
      statusMuat[tabel] = 'gagal'; lalu({ ok: false, kosong: false, baris: [], alasan: String(e && e.message || e) });
    });
  }

  /* ========== Tulis (hanya tabel publik; gagal = console.warn saja) ========== */
  /* Upsert semua baris lokal, lalu hapus baris cloud yang sudah tidak ada
     di lokal (supaya hapusan ikut tersinkron). Tanpa id, baris dilewati. */
  function sinkronTabel(tabel, barisLokal) {
    if (!client) return;
    if (TABEL_PUBLIK.indexOf(tabel) < 0) { console.warn('[supabase] tulis ' + tabel + ' ditolak: bukan tabel publik.'); return; }
    if (statusMuat[tabel] !== 'ok' && statusMuat[tabel] !== 'kosong') {
      console.warn('[supabase] tulis ' + tabel + ' ditahan: baca awal belum berhasil (hindari menimpa data cloud dengan data lokal lama).');
      return;
    }
    var lokal = (barisLokal || []).filter(function (b) { return b && b.id; });
    var cloud = lokal.map(function (b) { return keCloud(tabel, b); });
    var idsLokal = {};
    lokal.forEach(function (b) { idsLokal[b.id] = true; });
    client.from(tabel).select('id').then(function (r) {
      if (r.error) { console.warn('[supabase] tulis ' + tabel + ' gagal (baca id): ' + r.error.message); return; }
      var hapus = (r.data || []).map(function (x) { return x.id; }).filter(function (id) { return !idsLokal[id]; });
      var kirim = function () {
        if (!cloud.length) return;
        return client.from(tabel).upsert(cloud).then(function (u) {
          if (u.error) console.warn('[supabase] tulis ' + tabel + ' gagal: ' + u.error.message);
        });
      };
      if (!hapus.length) return kirim();
      return client.from(tabel).delete().in('id', hapus).then(function (d) {
        if (d.error) console.warn('[supabase] hapus ' + tabel + ' gagal: ' + d.error.message);
        return kirim();
      });
    }).catch(function (e) { console.warn('[supabase] tulis ' + tabel + ' gagal: ' + (e && e.message || e)); });
  }

  /* ========== Muat awal ========== */
  /* dataLokal: { info, usaha, telpPenting } (isi D saat mulai).
     terapkan(kunciLokal, barisCloud): dipanggil app.js bila cloud punya
     baris — app.js menimpa D, simpan lokal, lalu render ulang.
     Bila cloud kosong dan lokal ada isi: seed (coba upsert semua baris
     lokal; gagal 403 dulu sampai gerbang akses diputuskan — tidak apa-apa).
     Bila baca gagal: pakai data lokal seperti sekarang. */
  function muatAwal(dataLokal, terapkan) {
    if (!client) return;
    TABEL_PUBLIK.forEach(function (tabel) {
      muatTabel(tabel, function (hasil) {
        if (!hasil.ok) return;
        var kunci = TABEL_KE_LOKAL[tabel];
        if (hasil.baris.length) terapkan(kunci, hasil.baris);
        else if ((dataLokal[kunci] || []).length) sinkronTabel(tabel, dataLokal[kunci]);
      });
    });
  }

  /* ========== Galeri / foto kegiatan ========== */
  /* Unggah ke bucket rtrw-foto. Mengembalikan Promise<urlPublik|null>:
     null bila offline / gagal (belum ada kebijakan tulis) — tanpa error
     ke pengguna. UI unggah TIDAK dipasang di sini; fungsi saja, pemasangan
     UI menunggu gerbang. */
  function uploadFotoKegiatan(file) {
    if (!client || !file) return Promise.resolve(null);
    var nama = 'kegiatan/' + Date.now().toString(36) + '-' + String(file.name || 'foto').replace(/[^\w.\-]/g, '_');
    return client.storage.from(BUCKET_FOTO).upload(nama, file).then(function (r) {
      if (r.error) { console.warn('[supabase] unggah foto gagal: ' + r.error.message); return null; }
      var pub = client.storage.from(BUCKET_FOTO).getPublicUrl(nama);
      return (pub.data && pub.data.publicUrl) || null;
    }).catch(function (e) {
      console.warn('[supabase] unggah foto gagal: ' + (e && e.message || e));
      return null;
    });
  }

  window.RTRW_SUPABASE = {
    aktif: aktif,
    muatTabel: muatTabel,
    sinkronTabel: sinkronTabel,
    muatAwal: muatAwal,
    uploadFotoKegiatan: uploadFotoKegiatan,
    keCloud: keCloud,
    dariCloud: dariCloud,
    TABEL_PUBLIK: TABEL_PUBLIK.slice()
  };
})();
