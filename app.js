/* kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id. Lisensi Nonkomersial Maliki Studio: wajib kredit, dilarang dijual (lihat LICENSE). */
/* Website RT/RW — aplikasi statis (tanpa server). Data di localStorage perangkat ini.
   Susunan: 1) utilitas  2) data & simpan  3) tema  4) router & kerangka  5) halaman publik
            6) halaman pengurus (ringkas, warga, iuran, kas, info, surat, pengaturan, akun)  6b) auth publik (masuk, daftar-wilayah, lupa-pin, disclaimer)  6c) admin (kelola pengurus, kelola wilayah, halaman RW, pilih wilayah, log)  7) modal/toast  8) CSV/JSON  9) mulai */
(function () {
  'use strict';

  /* ========== 1. Utilitas ========== */
  var DEMO = /[?&]demo\b/.test(location.search);
  var KUNCI = DEMO ? 'website-rt-demo' : 'website-rt-data';
  var KUNCI_TAMPILAN = 'website-rt-tampilan';
  var VERSI = 2;
  var RM = matchMedia('(prefers-reduced-motion: reduce)');
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  /* F12: isi innerHTML hanya bila elemen masih ada — callback async bisa
     jalan sesudah pengguna pindah halaman dan elemennya sudah tidak ada. */
  function aturHtml(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  function rp(n) { return fmtRp.format(n || 0).replace(/\s/g, ''); }
  function rpPendek(n) { var a = Math.abs(n); return (n < 0 ? '-' : '') + (a >= 1e6 ? (a / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + 'jt' : a >= 1e3 ? Math.round(a / 1e3) + 'rb' : a); }
  function idBaru(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function hariIni() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function bulanKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function geserBulan(k, n) { var p = k.split('-'); return bulanKey(new Date(+p[0], +p[1] - 1 + n, 1)); }
  function namaBulan(k, pendek) { var p = k.split('-'); var b = BULAN[+p[1] - 1]; return (pendek ? b.slice(0, 3) : b) + ' ' + p[0]; }
  function tglPanjang(s) { if (!s) return '-'; var d = new Date(s + 'T00:00'); return d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); }
  function tglHari(s) { var d = new Date(s + 'T00:00'); return HARI[d.getDay()] + ', ' + tglPanjang(s); }
  var G = window.GAMBAR || {};
  /* <img> dengan fallback: bila gagal dimuat, gambar dihapus sehingga isi cadangan (ikon/inisial) tampil. */
  function gbr(src, alt, kelas) { return src ? '<img class="' + (kelas || '') + '" src="' + e(src) + '" alt="' + e(alt || '') + '" loading="lazy" onerror="this.remove()">' : ''; }
  (function () { var mg = document.querySelector('.merek-gambar'); if (!mg) return; if (G.logo) { mg.src = G.logo; mg.hidden = false; } else mg.remove(); })();
  function inisial(n) { return String(n || '?').replace(/^(hj?\.|bpk\.|ibu)\s*/i, '').split(/\s+/).slice(0, 2).map(function (x) { return x[0]; }).join('').toUpperCase(); }
  function waNomor(n) { n = String(n || '').replace(/\D/g, ''); if (n[0] === '0') n = '62' + n.slice(1); return n; }
  function waLink(nomor, teks) { return 'https://wa.me/' + waNomor(nomor) + '?text=' + encodeURIComponent(teks); }
  function hormat(a) { return (a && a.jk === 'P' ? 'Ibu ' : 'Bapak ') + a.nama; }
  function umur(t) { if (!t) return ''; var d = new Date(t), k = new Date(); var u = k.getFullYear() - d.getFullYear(); if (k < new Date(k.getFullYear(), d.getMonth(), d.getDate())) u--; return u; }

  var IKON = {
    rumah: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    ringkas: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    warga: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    iuran: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M7 15h3"/>',
    kas: '<path d="M4 19V9M10 19V5M16 19v-7M21 19H3"/>',
    info: '<path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5L8 9H5a1 1 0 0 0-1 1z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
    surat: '<path d="M6 2.5h8l4 4V21.5H6z"/><path d="M14 2.5v4h4M9 12h6M9 16h6"/>',
    atur: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    tambah: '<path d="M12 5v14M5 12h14"/>', cari: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    wa: '<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3 3z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/>',
    telepon: '<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    kiri: '<path d="m15 18-6-6 6-6"/>', kanan: '<path d="m9 18 6-6-6-6"/>', tutup: '<path d="M18 6 6 18M6 6l12 12"/>',
    cek: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', unduh: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>', unggah: '<path d="M12 21V9m-5 5 5-5 5 5M4 4h16"/>',
    kalender: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>', jam: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lokasi: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    cetak: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><rect x="6" y="14" width="12" height="7"/>', bagikan: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
    keluar: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>', kunci: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    sunting: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>', pin: '<path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/>', jiwa: '<circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    dompet: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.3"/>'
  };
  function ik(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (IKON[n] || '') + '</svg>'; }

  /* ========== 2. Data & penyimpanan ========== */
  var D;
  function muat() {
    var mentah = null;
    try { mentah = JSON.parse(localStorage.getItem(KUNCI) || 'null'); } catch (x) { mentah = null; }
    if (DEMO || !mentah || !mentah.pengaturan) mentah = window.buatDataContoh();
    return migrasi(mentah);
  }
  // Migrasi: tambahkan bidang baru di sini supaya data lama pengguna tidak rusak.
  function migrasi(d) {
    d.versi = d.versi || 1;
    d.pengurus = d.pengurus || []; d.kk = d.kk || []; d.iuran = d.iuran || {}; d.kas = d.kas || []; d.info = d.info || []; d.surat = d.surat || [];
    d.usaha = d.usaha || [];
    d.telpPenting = d.telpPenting || [
      { id: 'tp1', nama: 'Layanan Darurat Terpadu', nomor: '112', ket: 'Bebas pulsa; operator meneruskan ke polisi / medis / pemadam. Langkah pertama bila panik. Catatan: ketersediaan 112 bisa berbeda antar daerah.', jenis: 'nasional' },
      { id: 'tp2', nama: 'Polisi', nomor: '110', ket: 'Lapor tindak kriminal, kecelakaan lalu lintas, gangguan keamanan.', jenis: 'nasional' },
      { id: 'tp3', nama: 'Pemadam Kebakaran', nomor: '113', ket: 'Kebakaran rumah/gedung/lahan.', jenis: 'nasional' },
      { id: 'tp4', nama: 'Ambulans', nomor: '118', ket: 'Ambulans gawat darurat.', jenis: 'nasional' },
      { id: 'tp5', nama: 'Ambulans / PSC Kemenkes', nomor: '119', ket: 'Public Safety Center, layanan darurat medis terpadu.', jenis: 'nasional' },
      { id: 'tp6', nama: 'Basarnas / SAR', nomor: '115', ket: 'Pencarian dan pertolongan.', jenis: 'nasional' },
      { id: 'tp7', nama: 'BNPB', nomor: '117', ket: 'Penanggulangan bencana.', jenis: 'nasional' },
      { id: 'tp8', nama: 'PLN', nomor: '123', ket: 'Gangguan listrik / call center PLN.', jenis: 'nasional' }
    ];
    d.nomorSurat = d.nomorSurat || { tahun: new Date().getFullYear(), urut: 0 };
    d.pengaturan = Object.assign({ rt: '01', rw: '01', kelurahan: '', kecamatan: '', kota: '', provinsi: '', alamat: '', iuran: 25000, iuranMulai: bulanKey(), caraBayar: '', pin: '1234' }, d.pengaturan);
    d.kk.forEach(function (k) { k.anggota = k.anggota || []; k.status = k.status || 'tetap'; });
    d.versi = VERSI;
    return d;
  }
  function simpan() {
    try { localStorage.setItem(KUNCI, JSON.stringify(D)); }
    catch (x) { toast('Gagal menyimpan: memori browser penuh', 'bahaya'); }
  }
  /* Sinkron tabel publik ke Supabase sesudah simpan lokal. Gagal = diam
     (console.warn di supabase.js), simpan lokal tidak pernah gagal karenanya.
     Mode demo tidak pernah menyentuh Supabase. */
  function sinkronPublik(tabel) {
    if (DEMO || !window.RTRW_SUPABASE) return;
    window.RTRW_SUPABASE.sinkronTabel(tabel, tabel === 'telp_penting' ? D.telpPenting : D[tabel]);
  }
  function cariKK(id) { return D.kk.filter(function (k) { return k.id === id; })[0]; }
  function jiwaTotal() { return D.kk.reduce(function (s, k) { return s + k.anggota.length; }, 0); }
  function sudahBayar(b, id) { return !!(D.iuran[b] && D.iuran[b][id]); }
  function bulanTagihan() { var a = [], b = D.pengaturan.iuranMulai || bulanKey(), kini = bulanKey(); var aman = 0; while (b <= kini && aman++ < 120) { a.push(b); b = geserBulan(b, 1); } return a; }
  function tunggakan(kk) {
    var awal = kk.dibuat ? kk.dibuat.slice(0, 7) : '';
    return bulanTagihan().filter(function (b) { return b >= awal && !sudahBayar(b, kk.id); });
  }
  function setLunas(b, id, lunas) {
    D.iuran[b] = D.iuran[b] || {};
    var ref = 'iuran:' + b + ':' + id, k = cariKK(id);
    D.kas = D.kas.filter(function (x) { return x.ref !== ref; });
    if (lunas) {
      D.iuran[b][id] = hariIni();
      D.kas.push({ id: idBaru('ks'), tgl: hariIni(), jenis: 'masuk', kategori: 'Iuran', ket: 'Iuran ' + b + ' — ' + k.kepala, jumlah: Number(D.pengaturan.iuran) || 0, ref: ref });
    } else delete D.iuran[b][id];
    simpan();
  }
  function saldo(sampai) { return D.kas.reduce(function (s, x) { return (!sampai || x.tgl <= sampai) ? s + (x.jenis === 'masuk' ? 1 : -1) * x.jumlah : s; }, 0); }
  function kasBulan(b) { var m = 0, k = 0; D.kas.forEach(function (x) { if (x.tgl.slice(0, 7) === b) { if (x.jenis === 'masuk') m += x.jumlah; else k += x.jumlah; } }); return { masuk: m, keluar: k }; }
  function namaRT() { var p = D.pengaturan; return 'RT ' + p.rt + ' / RW ' + p.rw; }

  /* ========== 3. Tema (kontrak customizer Maliki Studio) ========== */
  var FONT = ['Plus Jakarta Sans', 'Inter', 'Poppins', 'DM Sans', 'Space Grotesk', 'Nunito'];
  var tampilan = {};
  try { tampilan = JSON.parse(localStorage.getItem(KUNCI_TAMPILAN) || '{}') || {}; } catch (x) { tampilan = {}; }
  function modeAktif(m) { if (m === 'auto' || !m) return matchMedia('(prefers-color-scheme: dark)').matches ? 'gelap' : 'terang'; return m; }
  function muatFont(f) {
    var nama = String(f || '').split(',')[0].replace(/["']/g, '').trim();
    if (FONT.indexOf(nama) < 0) return;
    var href = 'https://fonts.googleapis.com/css2?family=' + nama.replace(/ /g, '+') + ':wght@400;500;600;700;800&display=swap';
    var l = $('#fontTema'); if (l && l.getAttribute('href') !== href) l.setAttribute('href', href);
  }
  function terapkan(t) {
    t = t || {}; var r = document.documentElement.style;
    if (t.utama) r.setProperty('--tema-utama', t.utama);
    if (t.aksen) r.setProperty('--tema-aksen', t.aksen);
    if (t.radius != null && t.radius !== '') r.setProperty('--tema-radius', /px$/.test(String(t.radius)) ? t.radius : t.radius + 'px');
    if (t.font) { var nm = String(t.font).split(',')[0].replace(/["']/g, '').trim(); r.setProperty('--tema-font', '"' + nm + '", system-ui, sans-serif'); muatFont(nm); }
    if (t.mode) document.documentElement.setAttribute('data-mode', modeAktif(t.mode));
    if (t.nama) { window.TEMA.nama = t.nama; $$('[data-tema-nama]').forEach(function (el) { el.textContent = t.nama; }); }
    if (t.bagian) {
      var peta = { latar: ['--latar', '--tema-latar'], panel: ['--permukaan', '--tema-panel'], nav: ['--nav', '--tema-nav'], teks: ['--teks', '--tema-teks'] };
      Object.keys(peta).forEach(function (k) { var v = t.bagian[k]; if (v) { r.setProperty(peta[k][0], v); r.setProperty(peta[k][1], v); } else if (v === null) { r.removeProperty(peta[k][0]); r.removeProperty(peta[k][1]); } });
    }
    hitungTeksKontras();
    var meta = $('meta[name="theme-color"]'); if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--tema-utama').trim();
  }
  // Luminansi: pilih teks hitam/putih yang paling kontras di atas nav & tombol utama.
  function luminansi(c) { var x = hex(c); var v = [1, 3, 5].map(function (i) { var n = parseInt(x.substr(i, 2), 16) / 255; return n <= .03928 ? n / 12.92 : Math.pow((n + .055) / 1.055, 2.4); }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; }
  function teksUntuk(c) { var L = luminansi(c); return (1.05 / (L + .05)) >= ((L + .05) / .05) ? '#ffffff' : '#111111'; }
  function hitungTeksKontras() {
    var r = document.documentElement.style, cs = getComputedStyle(document.documentElement);
    r.setProperty('--tema-utama-teks', teksUntuk(cs.getPropertyValue('--tema-utama').trim()));
    var nav = cs.getPropertyValue('--nav').trim();
    if (nav) r.setProperty('--tema-nav-teks', teksUntuk(nav));
  }
  // Tandai bagian untuk customizer (sorot & tap-untuk-pilih).
  function tandaiBagian(root) {
    root = root || document;
    $$('.kartu,.tabel-wadah,.anggota-baris,.langkah,.sapa-kartu', root).forEach(function (el) { el.setAttribute('data-bagian', 'panel'); });
    $$('.btn:not(.btn-garis):not(.btn-hapus):not(.btn-wa),.chip[aria-pressed="true"],.merek-logo,.pahlawan', root).forEach(function (el) { el.setAttribute('data-bagian', 'utama'); });
    $$('.lencana,.grafik,.tgl-blok,.batang,.cincin,.hitung-mundur', root).forEach(function (el) { el.setAttribute('data-bagian', 'aksen'); });
    $$('h1,h2,h3,p', root).forEach(function (el) { if (!el.closest('.pahlawan')) el.setAttribute('data-bagian', 'teks'); });
  }
  var NAMA_BAGIAN = { nav: 'Navigasi', latar: 'Latar', panel: 'Panel', utama: 'Warna utama', aksen: 'Aksen', teks: 'Teks' };
  var bagianSorot = null;
  function sorot(b) {
    bagianSorot = b || null;
    $$('[data-sorot]').forEach(function (el) { el.removeAttribute('data-sorot'); });
    $$('.label-sorot').forEach(function (el) { el.parentNode.removeChild(el); });
    if (!b) return;
    $$('[data-bagian="' + b + '"]').forEach(function (el, i) {
      el.setAttribute('data-sorot', '');
      if (i > 5) return;
      var k = el.getBoundingClientRect(); if (!k.width) return;
      var l = document.createElement('div'); l.className = 'label-sorot'; l.textContent = NAMA_BAGIAN[b] || b;
      l.style.left = (k.left + scrollX + 4) + 'px'; l.style.top = (k.top + scrollY + 4) + 'px'; document.body.appendChild(l);
    });
  }
  var modePilih = false, hoverEl = null;
  function bagianDari(el) { return el && el.closest ? el.closest('[data-bagian]') : null; }
  ['click', 'pointerdown', 'mousedown', 'submit', 'touchstart', 'keydown'].forEach(function (t) {
    document.addEventListener(t, function (ev) {
      if (!modePilih) return;
      ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
      if (t === 'click') { var x = bagianDari(ev.target); if (x && window.parent !== window) window.parent.postMessage({ tipe: 'bagian-dipilih', bagian: x.getAttribute('data-bagian') }, '*'); }
    }, { capture: true, passive: false });
  });
  document.addEventListener('mouseover', function (ev) {
    if (!modePilih) return; var x = bagianDari(ev.target);
    if (hoverEl && hoverEl !== x) hoverEl.removeAttribute('data-pilih-hover');
    hoverEl = x; if (x) x.setAttribute('data-pilih-hover', '');
  }, true);
  window.addEventListener('message', function (ev) {
    var d = ev.data; if (!d) return;
    if (d.tipe === 'tema') terapkan(d);
    if (d.tipe === 'sorot') sorot(d.bagian);
    if (d.tipe === 'mode-pilih') { modePilih = !!d.aktif; document.documentElement.classList.toggle('mode-pilih', modePilih); if (!modePilih && hoverEl) { hoverEl.removeAttribute('data-pilih-hover'); hoverEl = null; } }
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if ((tampilan.mode || TEMA.mode) === 'auto') terapkan({ mode: 'auto' }); });
  function namaUsaha() { return tampilan.nama || window.TEMA.nama; }

  /* ========== 4. Router & kerangka ========== */
  /* Peran yang boleh buka tiap menu (Pekerja 3, PRD-v4 UI 4-7, 11).
     admin_rw HANYA halaman RW + Akun saya; pengurus 8 menu dasar + Akun
     saya; admin_rt + Kelola Pengurus + Log; superadmin semua. */
  var MENU = [
    { id: 'ringkas', label: 'Ringkas', ikon: 'ringkas', peran: ['superadmin', 'admin_rt', 'pengurus'] },
    { id: 'warga', label: 'Warga', ikon: 'warga', peran: ['superadmin', 'admin_rt', 'pengurus'] },
    { id: 'iuran', label: 'Iuran', ikon: 'iuran', peran: ['superadmin', 'admin_rt', 'pengurus'] },
    { id: 'kas', label: 'Kas', ikon: 'kas', peran: ['superadmin', 'admin_rt', 'pengurus'] },
    { id: 'info', label: 'Info', ikon: 'info', peran: ['superadmin', 'admin_rt', 'pengurus'] },
    { id: 'usaha', label: 'Usaha', ikon: 'dompet', peran: ['superadmin', 'admin_rt', 'pengurus'] },
    { id: 'surat', label: 'Surat', ikon: 'surat', peran: ['superadmin', 'admin_rt', 'pengurus'] },
    { id: 'pengaturan', label: 'Pengaturan', ikon: 'atur', peran: ['superadmin', 'admin_rt', 'pengurus'] },
    { id: 'rw', label: 'Halaman RW', labelPendek: 'RW', ikon: 'rumah', peran: ['superadmin', 'admin_rw'] },
    { id: 'kelola-pengurus', label: 'Kelola Pengurus', labelPendek: 'Pengurus', ikon: 'warga', peran: ['superadmin', 'admin_rt'] },
    { id: 'kelola-wilayah', label: 'Kelola Wilayah', labelPendek: 'Wilayah', ikon: 'rumah', peran: ['superadmin'] },
    { id: 'log', label: 'Log Histori', labelPendek: 'Log', ikon: 'jam', peran: ['superadmin', 'admin_rt'] },
    { id: 'akun', label: 'Akun saya', ikon: 'jiwa', peran: ['superadmin', 'admin_rw', 'admin_rt', 'pengurus'] }
  ];
  function cariMenu(id) { return MENU.filter(function (m) { return m.id === id; })[0]; }
  function menuBoleh(id, peran) { var m = cariMenu(id); return !!m && (!m.peran || m.peran.indexOf(peran) >= 0); }
  function menuUntuk(peran) { return MENU.filter(function (m) { return !peran || !m.peran || m.peran.indexOf(peran) >= 0; }); }
  var JENIS_USAHA = ['Makanan & Minuman', 'Jasa', 'Produk / Barang', 'Lainnya'];
  var terbuka = DEMO || sessionStorage.getItem('website-rt-buka') === '1';
  var HAL = {};
  var halSebelum = '';

  /* ========== 4b. Auth Supabase — PIN & akun (bukan localStorage) ========== */
  /* Client Supabase KHUSUS auth: supabase.js tidak mengekspos client/RPC-nya
     dan berkas itu dilarang diubah, jadi app.js membuat client sendiri dari
     URL + anon key yang SAMA dengan supabase.js. Anon key bersifat publik
     (hanya lewat RLS/RPC; service_role tidak pernah ada di sini). Bila kunci
     dirotasi, samakan di kedua berkas. */
  var SB_URL = 'https://uoywhmhrlrvldigkhgfj.supabase.co';
  var SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveXdobWhybHJ2bGRpZ2toZ2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzOTUzMDIsImV4cCI6MjExMDk3MTMwMn0.qBcFzq8ZyYvw9P9v8-x3C_MyHw035-7iu-Do6j5D_LA';
  var sbKlien = null;
  function sb() {
    if (sbKlien) return sbKlien;
    if (DEMO) return null;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    try { sbKlien = window.supabase.createClient(SB_URL, SB_ANON_KEY); } catch (x) { sbKlien = null; }
    return sbKlien;
  }
  function sbRpc(nama, param) {
    var c = sb();
    if (!c) return Promise.reject(new Error('offline'));
    return c.rpc(nama, param).then(function (r) {
      if (r.error) {
        /* Token ditolak server (mis. tulis_log tanpa sesi valid): sesi habis. */
        if (/token sesi tidak valid/i.test(r.error.message || '')) sesiHabis();
        throw new Error(r.error.message);
      }
      return r.data;
    });
  }
  /* Token sesi: HANYA di sessionStorage (objek sesi), tidak pernah di
     localStorage. Diterbitkan verifikasi_pin (64 hex, 8 jam), dikirim
     sebagai p_token pertama di semua RPC admin. */
  function tokenSesi() { var s = sesi(); return (s && s.token) || ''; }
  /* Sesi habis / token ditolak: bersihkan sesi lalu lempar ke halaman masuk. */
  function sesiHabis() {
    if (sesi()) {
      tokenTervalidasiUntuk = '';
      simpanSesi(null); terbuka = false;
      try { sessionStorage.removeItem('website-rt-buka'); } catch (x) {}
      toast('Sesi habis, masuk lagi', 'bahaya');
      if (location.hash !== '#/masuk') location.hash = '#/masuk'; else render();
    }
  }
  /* Validasi token sekali per muat halaman DAN tiap kali nilainya berubah
     (dipakai render() untuk rute panel): profil_pengurus kosong = token
     tidak dikenal / kadaluarsa. Gagal jaringan (reject) TIDAK membuat sesi
     habis — hanya hasil kosong. */
  var tokenTervalidasiUntuk = '';
  function cekToken() {
    var s = sesi();
    if (!s || !s.token) { sesiHabis(); return; }
    if (tokenTervalidasiUntuk === s.token) return;
    sbRpc('profil_pengurus', { p_token: s.token }).then(function (rows) {
      if ((rows || []).length) tokenTervalidasiUntuk = s.token;
      else sesiHabis();
    }).catch(function () { tokenTervalidasiUntuk = s.token; });
  }
  /* Sesi pengurus (sessionStorage, hilang bila tab ditutup): id, nama,
     jabatan, peran, wilayah_id, pin_sementara, token. 'website-rt-buka'
     lama tetap dipakai sebagai penanda panel terbuka. Token TIDAK PERNAH
     ditulis ke localStorage. */
  var KUNCI_SESI = 'website-rt-sesi';
  function sesi() {
    try { return JSON.parse(sessionStorage.getItem(KUNCI_SESI) || 'null'); } catch (x) { return null; }
  }
  function simpanSesi(s) {
    if (!s) { try { sessionStorage.removeItem(KUNCI_SESI); } catch (x) {} return; }
    try { sessionStorage.setItem(KUNCI_SESI, JSON.stringify(s)); } catch (x) {}
  }
  function keluarSesi() {
    /* Logout: hapus token di server dulu (fire-and-forget), baru sesi lokal. */
    var t = tokenSesi();
    if (t && !DEMO) sbRpc('keluar_sesi', { p_token: t }).catch(function () {});
    tokenTervalidasiUntuk = '';
    terbuka = false; simpanSesi(null);
    try { sessionStorage.removeItem('website-rt-buka'); } catch (x) {}
  }
  if (!DEMO && sesi()) terbuka = true;
  /* Catat log (fire-and-forget, tidak pernah menghambat UI). Tanda tangan
     BARU tulis_log(p_token, p_aksi, p_rincian, p_wilayah_target): wilayah +
     pelaku diambil server dari baris sesi, jadi tidak bisa dipalsukan dari
     browser. Parameter ketiga (wilayahTarget) opsional: diisi untuk aksi
     lintas wilayah (mis. Superadmin menyetujui pengurus wilayah lain) agar
     log tercatat di wilayah TARGET, bukan wilayah sesi; kosong = NULL =
     wilayah sesi. Tanpa token (mis. pendaftaran anon) log dilewati
     diam-diam. Dipakai juga untuk: persetujuan pendaftaran, reset PIN,
     ganti peran, dan tambah/ubah/hapus warga, iuran, kas, surat, info (F7). */
  function catatLog(aksi, rincian, wilayahTarget) {
    var t = tokenSesi(), c = sb();
    if (!t || !c) return;
    c.rpc('tulis_log', { p_token: t, p_aksi: aksi, p_rincian: rincian || '', p_wilayah_target: wilayahTarget || null })
      .then(function (r) {
        if (r.error) {
          if (/token sesi tidak valid/i.test(r.error.message || '')) sesiHabis();
          else console.warn('[log] ' + r.error.message);
        }
      })
      .catch(function (x) { console.warn('[log] ' + (x && x.message || x)); });
  }
  /* Daftar wilayah aktif (cache per sesi halaman). */
  var daftarWilayah = null;
  function muatWilayah() {
    if (daftarWilayah) return Promise.resolve(daftarWilayah);
    var c = sb();
    if (!c) return Promise.reject(new Error('offline'));
    return c.from('wilayah').select('id,jenis,nomor,kelurahan,kecamatan,kota,provinsi,ketua_nama,ketua_wa,ketua_email,rw_induk_id')
      .eq('status', 'aktif').order('kelurahan').order('nomor')
      .then(function (r) {
        if (r.error) throw new Error(r.error.message);
        daftarWilayah = r.data || [];
        return daftarWilayah;
      });
  }
  function labelWilayah(w) {
    if (!w) return '-';
    return (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + (w.kelurahan ? ' — Kel. ' + w.kelurahan : '');
  }
  function cariWilayah(id) { return (daftarWilayah || []).filter(function (w) { return w.id === id; })[0]; }
  function opsiWilayah(pilih) {
    return '<option value="">— Pilih wilayah —</option>' + (daftarWilayah || []).map(function (w) {
      return '<option value="' + e(w.id) + '"' + (w.id === pilih ? ' selected' : '') + '>' + e(labelWilayah(w)) + '</option>';
    }).join('');
  }
  /* Pencarian di dalam select wilayah: simpan opsi penuh sekali, saring
     dari salinan itu saat mengetik. Dipasang di: masuk, lupa-pin,
     daftar-wilayah, pilih wilayah, saring log, ubah wilayah. */
  function catatOpsiPenuh(sel) {
    if (!sel) return;
    sel._opsiPenuh = Array.prototype.map.call(sel.options, function (o) {
      return { v: o.value, t: o.textContent, sel: o.selected, dis: o.disabled };
    });
  }
  function pasangPencarianSelect(sel) {
    if (!sel || sel._cariDipasang) return;
    sel._cariDipasang = true;
    var wadah = document.createElement('div');
    wadah.className = 'cari cari-wilayah';
    wadah.innerHTML = '<input type="search" placeholder="Cari wilayah…" aria-label="Cari wilayah">';
    sel.parentNode.insertBefore(wadah, sel);
    wadah.querySelector('input').addEventListener('input', function () {
      var q = this.value.trim().toLowerCase(), nilai = sel.value;
      var semua = sel._opsiPenuh || [];
      var cocok = !q ? semua : semua.filter(function (o) { return o.t.toLowerCase().indexOf(q) >= 0; });
      if (!cocok.length) { sel.innerHTML = '<option value="" disabled>Tidak ada wilayah yang cocok</option>'; return; }
      /* Pilihan yang sedang terpilih jangan hilang diam-diam bila tersaring:
         sisipkan lagi di atas hasil saringan (dari _opsiPenuh, selected). */
      var terpilih = nilai ? semua.filter(function (o) { return o.v === nilai; })[0] : null;
      if (terpilih && !cocok.some(function (o) { return o.v === nilai; })) cocok.unshift({ v: terpilih.v, t: terpilih.t, sel: true, dis: terpilih.dis });
      sel.innerHTML = cocok.map(function (o) {
        return '<option value="' + e(o.v) + '"' + (o.sel ? ' selected' : '') + (o.dis ? ' disabled' : '') + '>' + e(o.t) + '</option>';
      }).join('');
      if (nilai && cocok.some(function (o) { return o.v === nilai; })) sel.value = nilai;
    });
  }
  /* Format pesan Lupa PIN (disetujui Masdan 24 Nov 2026): buka wa.me gratis
     dari WA masing-masing, BUKAN WA Business API. */
  function pesanLupaPinSuperadmin(nama, jabatan, w) {
    var mana = (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor;
    return 'Halo Masdan, saya ' + nama + ' (' + jabatan + ') ' + mana + ' lupa PIN panel pengurus. Mohon reset PIN saya. Terima kasih.';
  }
  function pesanLupaPin(nama, jabatan, w) {
    var mana = (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor;
    var sapa = w.jenis === 'rw' ? 'Halo Pak/Bu RW' : 'Halo Pak RT';
    return sapa + ', saya ' + nama + ' (' + jabatan + ') ' + mana + ' lupa PIN panel pengurus. Mohon reset PIN saya. Terima kasih.';
  }
  /* Teks WA pengajuan wilayah (v5): RT ke Ketua RW induk, RW ke Masdan.
     Bila RT tidak punya RW induk, penyetujunya Superadmin — sapa Masdan. */
  function pesanPengajuanWilayah(jenis, namaKetua, nomor, kelurahan, namaKetuaRW) {
    if (jenis === 'rw') return 'Halo Masdan, saya ' + namaKetua + ' mengajukan RW ' + nomor + ' Kel. ' + kelurahan + ' sebagai Ketua RW. Mohon persetujuan di panel Website RT/RW. Terima kasih.';
    return 'Halo ' + namaKetuaRW + ', saya ' + namaKetua + ' mengajukan RT ' + nomor + ' Kel. ' + kelurahan + ' sebagai Ketua RT. Mohon verifikasi di panel Website RT/RW. Terima kasih.';
  }

  function rute() {
    var h = location.hash.replace(/^#\/?/, '');
    var bag = h.split('/');
    if (bag[0] === 'usaha') return { hal: 'usaha' };
    if (bag[0] === 'rw') return { hal: 'rw-publik', arg: bag[1] };
    if (bag[0] === 'masuk' || bag[0] === 'daftar-wilayah' || bag[0] === 'disclaimer' || bag[0] === 'lupa-pin') return { hal: bag[0] };
    if (bag[0] !== 'panel') return { hal: 'publik' };
    var id = bag[1] || 'ringkas';
    if (!MENU.some(function (m) { return m.id === id; })) id = 'ringkas';
    return { hal: id, arg: bag[2] };
  }
  function pergi(h) { if (location.hash === h) render(); else location.hash = h; }

  function render() {
    var r = rute();
    // Panel dikenali dari awalan hash '#/panel/', BUKAN dari r.hal: id menu panel
    // 'usaha' sama dengan hal direktori publik, jadi tes r.hal saja akan salah
    // menganggap panel Usaha sebagai halaman publik (tanpa PIN).
    var panel = /^#\/panel(\/|$)/.test(location.hash);
    var s = sesi();
    /* Gerbang masuk: panel butuh sesi Supabase (PIN lama 1234 tidak berlaku
       lagi). Tanpa sesi, lempar ke halaman masuk baru, bukan modal PIN lama. */
    if (panel && !DEMO && !s) { history.replaceState(null, '', '#/masuk'); render(); return; }
    /* Token sesi dicek sekali per muat halaman: token palsu / kadaluarsa
       dilempar ke halaman masuk (cekToken -> sesiHabis). */
    if (panel && !DEMO && s) cekToken();
    /* PIN sementara (habis reset Pak RT): wajib ganti PIN di Akun saya
       sebelum bisa buka menu lain. */
    if (panel && s && s.pin_sementara && r.hal !== 'akun') { location.hash = '#/panel/akun'; toast('PIN sementara — ganti PIN dulu di Akun saya', 'bahaya'); return; }
    /* Gating peran (Pekerja 3): menu di luar hak peran dilempar ke menu
       awal peran itu + toast. admin_rw -> Halaman RW, peran lain -> Ringkas. */
    if (panel && s && !menuBoleh(r.hal, s.peran)) {
      var tujuan = s.peran === 'admin_rw' ? 'rw' : 'ringkas';
      if (r.hal !== tujuan) { location.hash = '#/panel/' + tujuan; toast('Menu ini bukan untuk peran Anda', 'bahaya'); return; }
    }
    document.body.classList.toggle('panel', panel);
    $('#merekSub').textContent = panel ? 'Panel pengurus' : 'Layanan warga';
    var bp = $('#btnPanel');
    bp.innerHTML = panel ? ik('keluar') + '<span>Keluar</span>' : ik('kunci') + '<span>Pengurus</span>';
    bp.setAttribute('aria-label', panel ? 'Keluar dari panel pengurus' : 'Masuk panel pengurus');
    $('#btnAtur').hidden = !panel; $('#btnAtur').innerHTML = ik('atur');
    if (panel) gambarNav(r.hal);
    var isi = $('#isi');
    isi.innerHTML = '<div class="halaman">' + (panel ? barPilihWilayah() + HAL[r.hal](r.arg) : r.hal === 'usaha' ? halUsaha() : HALPUB[r.hal] ? HALPUB[r.hal](r.arg) : halPublik()) + '</div>';
    stagger(isi);
    amatiMuncul(isi);
    tandaiBagian();
    if (bagianSorot) sorot(bagianSorot);
    if (panel) { pasangPilihWilayah(); if (HAL[r.hal + 'Pasca']) HAL[r.hal + 'Pasca'](r.arg); } else if (r.hal === 'usaha') { halUsahaPasca(); } else if (HALPUB[r.hal + 'Pasca']) { HALPUB[r.hal + 'Pasca'](r.arg); }
    hitungNaik(isi);
    if (halSebelum && halSebelum !== r.hal) { window.scrollTo(0, 0); isi.focus({ preventScroll: true }); }
    halSebelum = r.hal;
    var judul = namaUsaha();
    if (panel) judul = (cariMenu(r.hal) || { label: r.hal }).label + ' · ' + judul;
    else if (r.hal === 'usaha') judul = 'Usaha Warga · ' + judul;
    else if (TITEL_PUBLIK[r.hal]) judul = TITEL_PUBLIK[r.hal] + ' · ' + judul;
    document.title = judul;
  }
  function gambarNav(aktif) {
    var s = sesi();
    var buat = function (daftar, pendek) {
      return daftar.map(function (m) {
        var kelas = m.id === 'akun' ? ' nav-pisah' : m.id === 'pengaturan' ? ' pengaturan-nav' : '';
        return '<a class="nav-item' + kelas + '" href="#/panel/' + m.id + '"' + (m.id === aktif ? ' aria-current="page"' : '') + '>' + ik(m.ikon) + '<span>' + (pendek ? (m.labelPendek || m.label) : m.label) + '</span></a>';
      }).join('');
    };
    var daftar = menuUntuk(s && s.peran);
    $('#navSamping').innerHTML = buat(daftar, false);
    /* Nav bawah HP: label pendek supaya 12 menu muat tanpa tumpang tindih. */
    $('#navBawah').innerHTML = buat(daftar, true);
  }
  function stagger(root) { $$('.stagger', root).forEach(function (g) { Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 14)); }); }); }
  /* T11: reveal saat masuk layar — satu observer, sekali tampil saja.
     Kelas 'muncul' hanya ditambah di sini (bukan di string HTML), supaya
     tanpa JS / tanpa IO / RM aktif halaman tetap tampil biasa. Anak
     .stagger tidak jadi target: mereka sudah dianimasikan .stagger > *. */
  var TARGET_MUNCUL = '#isi .pahlawan, #isi .langkah-wadah, #isi .telp-penting, #isi .galeri-wadah, #isi .sapa-kartu, #isi .kepala-hal, #isi .publik-grid section, #isi .halaman > .grid, #isi .halaman > section.kartu, #isi .grid > section.kartu';
  var pengamatMuncul = null;
  function amatiMuncul(root) {
    if (RM.matches || !('IntersectionObserver' in window)) return;
    if (pengamatMuncul) pengamatMuncul.disconnect();
    pengamatMuncul = new IntersectionObserver(function (masuk) {
      masuk.forEach(function (entri) {
        if (!entri.isIntersecting) return;
        entri.target.classList.add('tampak');
        pengamatMuncul.unobserve(entri.target);
      });
    }, { root: null, rootMargin: '0px 0px -48px 0px', threshold: 0.1 });
    $$(TARGET_MUNCUL, root).forEach(function (el) { el.classList.add('muncul'); pengamatMuncul.observe(el); });
  }
  function hitungNaik(root) {
    $$('[data-hitung]', root).forEach(function (el) {
      var target = Number(el.getAttribute('data-hitung')), uang = el.hasAttribute('data-rp');
      var tulis = function (v) { el.textContent = uang ? rp(Math.round(v)) : Math.round(v).toLocaleString('id-ID'); };
      if (RM.matches) { tulis(target); return; }
      var mulai = performance.now(), dur = 900;
      (function langkah(t) { var p = Math.min(1, (t - mulai) / dur); tulis(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(langkah); })(mulai);
    });
  }
  function kepalaHal(judul, sub, aksi) { return '<div class="kepala-hal"><div><h1>' + judul + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (aksi ? '<div class="baris-aksi">' + aksi + '</div>' : '') + '</div>'; }
  function kosong(teks, ikon) { return '<div class="kosong">' + ik(ikon || 'cari') + '<p>' + teks + '</p></div>'; }

  /* ========== 5. Halaman publik ========== */
  function infoDatang() { var h = hariIni(); return D.info.filter(function (i) { return i.jenis === 'agenda' && i.tgl >= h; }).sort(function (a, b) { return (a.tgl + (a.jam || '')).localeCompare(b.tgl + (b.jam || '')); }); }
  function pengumumanUrut() { return D.info.filter(function (i) { return i.jenis === 'pengumuman'; }).sort(function (a, b) { return (b.sematkan ? 1 : 0) - (a.sematkan ? 1 : 0) || b.tgl.localeCompare(a.tgl); }); }
  function kartuInfo(i, aksiPengurus) {
    var d = new Date(i.tgl + 'T00:00');
    return '<article class="kartu info-kartu' + (i.sematkan ? ' sematan' : '') + '">' +
      '<div class="tgl-blok" aria-hidden="true"><b>' + d.getDate() + '</b><small>' + BULAN[d.getMonth()].slice(0, 3) + '</small></div>' +
      '<div style="flex:1;min-width:0"><div class="baris-aksi" style="margin-bottom:4px">' + (i.sematkan ? '<span class="lencana">' + 'Disematkan</span>' : '') + '<span class="lencana ' + (i.jenis === 'agenda' ? 'aksen' : 'netral') + '">' + (i.jenis === 'agenda' ? 'Agenda' : 'Pengumuman') + '</span></div>' +
      '<h3>' + e(i.judul) + '</h3><p>' + e(i.isi) + '</p>' +
      '<div class="info-meta"><span>' + ik('kalender') + tglHari(i.tgl) + '</span>' + (i.jam ? '<span>' + ik('jam') + e(i.jam) + ' WIB</span>' : '') + (i.tempat ? '<span>' + ik('lokasi') + e(i.tempat) + '</span>' : '') + '</div>' +
      '<div class="baris-aksi" style="margin-top:12px"><button class="btn btn-garis btn-kecil" data-bagikan="' + i.id + '">' + ik('bagikan') + 'Bagikan ke WA</button>' +
      (aksiPengurus ? '<button class="btn btn-garis btn-kecil" data-ubah-info="' + i.id + '">' + ik('sunting') + 'Ubah</button><button class="btn btn-hapus btn-kecil" data-hapus-info="' + i.id + '">Hapus</button>' : '') + '</div></div></article>';
  }
  // Ilustrasi lingkungan (SVG orisinal, warna dari token lewat kelas .il-*)
  function ilustrasiKampung() {
    var rumah = function (x, w, h, kelas, atap) {
      var y = 200 - h;
      return '<g class="il-rumah ' + kelas + '"><rect class="dinding" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/>' +
        '<path class="atap ' + (atap || '') + '" d="M' + (x - 8) + ' ' + (y + 2) + ' L' + (x + w / 2) + ' ' + (y - w * 0.42) + ' L' + (x + w + 8) + ' ' + (y + 2) + 'Z"/>' +
        '<rect class="pintu" x="' + (x + w / 2 - 9) + '" y="' + (200 - 30) + '" width="18" height="30" rx="9"/>' +
        '<rect class="jendela" x="' + (x + 10) + '" y="' + (y + 14) + '" width="16" height="14" rx="3"/><rect class="jendela" x="' + (x + w - 26) + '" y="' + (y + 14) + '" width="16" height="14" rx="3"/></g>';
    };
    var pohon = function (x, s, d) { return '<g class="il-pohon" style="--d:' + d + 's;transform-origin:' + x + 'px 200px"><rect class="batang-p" x="' + (x - 3) + '" y="' + (200 - 26 * s) + '" width="6" height="' + 26 * s + '" rx="3"/><circle class="daun" cx="' + x + '" cy="' + (200 - 40 * s) + '" r="' + 20 * s + '"/><circle class="daun-2" cx="' + (x + 9 * s) + '" cy="' + (200 - 46 * s) + '" r="' + 11 * s + '"/></g>'; };
    var orang = function (x, kelas, lambai) {
      return '<g class="il-orang ' + kelas + '"><circle class="kepala" cx="' + x + '" cy="160" r="8"/><path class="badan" d="M' + (x - 11) + ' 200 v-20 a11 11 0 0 1 22 0 v20z"/>' +
        (lambai ? '<path class="lengan lambai" style="transform-origin:' + (x + 9) + 'px 178px" d="M' + (x + 9) + ' 178 l12 -16" />' : '<path class="lengan" d="M' + (x - 9) + ' 180 l-6 12"/>') + '</g>';
    };
    var bendera = ''; for (var i = 0; i < 9; i++) { var bx = 30 + i * 46; bendera += '<path class="umbul ' + (i % 2 ? 'putih' : 'merah') + '" style="--i:' + i + '" d="M' + bx + ' ' + (34 + Math.sin(i / 1.4) * 6) + ' l10 16 l10 -16z"/>'; }
    return '<svg class="ilustrasi" viewBox="0 0 440 224" role="img" aria-label="Ilustrasi rumah-rumah warga, pepohonan, dan dua tetangga saling menyapa">' +
      '<circle class="il-matahari" cx="372" cy="58" r="26"/>' +
      '<g class="il-awan"><path d="M70 82a14 14 0 0 1 26-6 11 11 0 0 1 18 9H62a8 8 0 0 1 8-3z"/></g><g class="il-awan dua"><path d="M250 64a12 12 0 0 1 22-5 9 9 0 0 1 15 8h-44a7 7 0 0 1 7-3z"/></g>' +
      '<path class="il-tali" d="M20 30 Q220 70 430 30"/>' + bendera +
      '<path class="il-bukit" d="M0 200 C80 150 160 160 230 176 S380 150 440 168 V224 H0z"/>' +
      pohon(28, 1.1, 0) + rumah(56, 92, 74, 'r1') + rumah(170, 76, 92, 'r2', 'tua') + pohon(268, .9, .6) + rumah(290, 98, 66, 'r3') + pohon(414, 1.2, 1.1) +
      orang(150, 'o1', true) + orang(264, 'o2', true) +
      '<rect class="il-jalan" x="0" y="200" width="440" height="24"/><path class="il-marka" d="M10 213h420"/></svg>';
  }
  function halPublik() {
    if (G.hero) window.__ilustrasi = ilustrasiKampung();
    var ag = infoDatang(), dekat = ag[0], peng = pengumumanUrut();
    var mundur = '';
    if (dekat) { var sel = Math.round((new Date(dekat.tgl + 'T00:00') - new Date(hariIni() + 'T00:00')) / 864e5); mundur = '<div class="hitung-mundur"><span class="titik"></span><b>' + (sel === 0 ? 'Hari ini' : sel === 1 ? 'Besok' : sel + ' hari lagi') + '</b>' + e(dekat.judul) + '</div>'; }
    var sek = D.pengurus.filter(function (p) { return /sekretaris/i.test(p.jabatan) && p.wa; })[0] || D.pengurus.filter(function (p) { return p.wa; })[0];
    var langkah = [
      { w: 'hijau', ik: 'info', j: 'Baca kabar terbaru', d: peng.length + ' pengumuman di papan warga', a: '#pengumuman', t: 'Buka papan' },
      { w: 'kuning', ik: 'kalender', j: 'Ikut kegiatan', d: ag.length ? ag.length + ' agenda menunggu kehadiran Anda' : 'Belum ada agenda baru', a: '#agenda', t: 'Lihat agenda' },
      { w: 'ungu', ik: 'surat', j: 'Urus surat pengantar', d: 'Kirim nama & keperluan ke Sekretaris', a: sek ? waLink(sek.wa, 'Assalamualaikum ' + sek.jabatan + ' ' + namaRT() + ', saya ingin minta surat pengantar untuk keperluan: ') : '#kontak', t: 'Minta via WA', luar: !!sek },
      { w: 'oranye', ik: 'iuran', j: 'Bayar iuran bulanan', d: rp(D.pengaturan.iuran) + ' per KK tiap bulan, tunai atau transfer', a: '#kontak', t: 'Hubungi Bendahara' },
      { w: 'hijau', ik: 'dompet', j: 'Lihat usaha warga', d: (D.usaha || []).filter(function (u) { return u.aktif; }).length + ' usaha warga di lingkungan ini', a: '#/usaha', t: 'Buka direktori' }
    ];
    return '<section class="pahlawan">' +
      '<div class="pahlawan-teks"><small>' + e(namaRT()) + ' · Kel. ' + e(D.pengaturan.kelurahan) + '</small>' +
      '<h1>Lingkungan yang guyub dimulai dari <em>satu sapaan.</em></h1>' +
      '<p>Pengumuman, jadwal kegiatan, dan kontak pengurus <span data-tema-nama>' + e(namaUsaha()) + '</span>, semuanya di satu papan.</p>' + mundur +
      '<div class="baris-aksi"><a class="btn" href="#pengumuman">' + ik('info') + 'Lihat pengumuman</a><a class="btn btn-garis" href="#kontak">' + ik('wa') + 'Kontak pengurus</a></div></div>' +
      '<div class="pahlawan-gambar"><div class="pahlawan-perumahan"><span class="sr">Perumahan Bukit Asri</span><span class="baris-kecil" aria-hidden="true">Perumahan</span><span class="baris-besar" aria-hidden="true">Bukit Asri</span></div>' + (G.hero ? '<img class="hero-foto" src="' + e(G.hero) + '" alt="Foto lingkungan ' + e(namaRT()) + '" onerror="this.outerHTML=window.__ilustrasi">' : ilustrasiKampung()) + '</div></section>' +
      '<section class="langkah-wadah" aria-labelledby="judulLangkah"><div class="judul-baris"><h2 id="judulLangkah">Yang bisa Anda lakukan</h2><span class="judul-sub">' + langkah.length + ' hal penting untuk warga</span></div>' +
      '<ol class="langkah-grid stagger">' + langkah.map(function (l, i) {
        return '<li class="langkah p-' + l.w + '"><span class="langkah-no">0' + (i + 1) + '</span><span class="langkah-ikon">' + ik(l.ik) + '</span><h3>' + l.j + '</h3><p>' + l.d + '</p>' +
          '<a class="langkah-cta" href="' + l.a + '"' + (l.luar ? ' target="_blank" rel="noopener"' : '') + '>' + l.t + ik('kanan') + '</a></li>';
      }).join('') + '</ol></section>' +
      bagianTelpPenting() +
      '<div class="publik-grid">' +
      '<section aria-labelledby="pengumuman"><div class="judul-baris"><h2 id="pengumuman">Papan pengumuman</h2><span class="judul-sub">' + peng.length + ' kabar</span></div><div class="tumpuk stagger">' + (peng.length ? peng.map(function (i) { return kartuInfo(i); }).join('') : kosong('Belum ada pengumuman.', 'info')) + '</div></section>' +
      '<div class="tumpuk"><section aria-labelledby="agenda"><div class="judul-baris"><h2 id="agenda">Agenda terdekat</h2></div><div class="tumpuk stagger">' + (ag.length ? ag.slice(0, 4).map(function (i) { return kartuInfo(i); }).join('') : kosong('Belum ada agenda.', 'kalender')) + '</div></section>' +
      '<section class="kartu" aria-labelledby="kontak"><h2 id="kontak">Kontak pengurus</h2><ul class="daftar stagger">' + D.pengurus.map(function (p, i) {
        return '<li class="pengurus-kartu"><span class="avatar">' + e(inisial(p.nama)) + gbr(p.foto || (G.pengurus || [])[i], 'Foto ' + p.nama, 'avatar-foto') + '</span><div class="utama-baris"><b>' + e(p.nama) + '</b><small>' + e(p.jabatan) + '</small></div>' + (p.wa ? '<a class="btn btn-wa btn-kecil" target="_blank" rel="noopener" href="' + waLink(p.wa, 'Assalamualaikum ' + p.jabatan + ' ' + namaRT() + ', saya warga ingin bertanya…') + '" aria-label="Chat WhatsApp ' + e(p.nama) + '">' + ik('wa') + 'Chat</a>' : '') + '</li>';
      }).join('') + '</ul><p style="color:var(--redup);font-size:13px;margin:12px 0 0">Sekretariat: ' + e(D.pengaturan.alamat) + '</p></section>' +
      '<section class="kartu warga-kita"><h2>Warga kita</h2><div class="grid" style="grid-template-columns:1fr 1fr"><div class="stat p-hijau"><div class="label">Kepala keluarga</div><div class="nilai" data-hitung="' + D.kk.length + '">0</div></div><div class="stat p-kuning"><div class="label">Jiwa</div><div class="nilai" data-hitung="' + jiwaTotal() + '">0</div></div></div></section>' +
      '</div></div>' + galeri();
  }
  // --- No Telp Penting (halaman publik; data dari D.telpPenting, seed U-1)
  function bagianTelpPenting() {
    var semua = D.telpPenting || [];
    var urut = semua.filter(function (t) { return t.jenis === 'nasional'; }).concat(semua.filter(function (t) { return t.jenis !== 'nasional'; }));
    var adaLokal = semua.some(function (t) { return t.jenis === 'lokal'; });
    var kartu = urut.map(function (t) {
      var tel = String(t.nomor || '').replace(/[\s-]/g, '');
      var lokal = t.jenis === 'lokal';
      return '<article class="kartu telp-kartu ' + (lokal ? 'telp-lokal' : 'telp-nasional') + '"><span class="lencana' + (lokal ? ' aksen' : '') + '">' + (lokal ? 'Lokal' : 'Nasional') + '</span><h3>' + e(t.nama) + '</h3>' +
        '<div class="telp-nomor">' + e(t.nomor) + '</div>' +
        '<a class="btn telp-tombol" href="tel:' + e(tel) + '" aria-label="Telepon ' + e(t.nama) + ' ' + e(t.nomor) + '">' + ik('telepon') + 'Telepon</a></article>';
    }).join('');
    return '<section class="telp-penting" id="telp-penting" aria-labelledby="judulTelp"><div class="judul-baris"><h2 id="judulTelp">No Telp Penting</h2><span class="judul-sub">Ketuk nomornya untuk langsung menelepon</span></div>' +
      '<div class="telp-grid stagger">' + kartu + '</div>' +
      (adaLokal ? '' : '<p class="telp-lokal-kosong">Nomor lokal belum diisi.</p>') + '</section>';
  }
  function galeri() {
    var g = (G.galeri || []).filter(function (x) { return x && x.src; });
    if (!g.length) return '';
    return '<section class="galeri-wadah" aria-labelledby="galeri"><div class="judul-baris"><h2 id="galeri">Galeri kegiatan</h2><span class="judul-sub">' + g.length + ' foto</span></div><div class="galeri stagger">' +
      g.map(function (x) { return '<figure class="galeri-item">' + gbr(x.src, x.ket) + '<figcaption>' + e(x.ket || '') + '</figcaption></figure>'; }).join('') + '</div></section>';
  }

  // --- Direktori usaha warga (halaman publik, bukan panel)
  var saringUsaha = { q: '', jenis: 'semua' };
  function halUsaha() {
    var aktif = (D.usaha || []).filter(function (u) { return u.aktif; });
    var chip = [['semua', 'Semua']].concat(JENIS_USAHA.map(function (j) { return [j, j]; }));
    return '<a class="btn btn-garis" href="#/">' + ik('kiri') + 'Kembali ke beranda</a>' +
      kepalaHal('Direktori Usaha Warga', aktif.length + ' usaha warga di lingkungan ini') +
      '<p style="color:var(--redup);font-size:14px;margin:0 0 16px">Data contoh — usaha asli akan diganti sesudah daftar asli dikirim.</p>' +
      '<div class="alat"><div class="cari">' + ik('cari') + '<label class="sr" for="cariUsaha">Cari usaha</label><input id="cariUsaha" type="search" placeholder="Cari nama usaha, pemilik…" value="' + e(saringUsaha.q) + '"></div></div>' +
      '<div class="chip-grup" role="group" aria-label="Saring jenis usaha" style="margin-bottom:16px">' + chip.map(function (c) { return '<button class="chip" data-filter-jenis="' + e(c[0]) + '" aria-pressed="' + (c[0] === saringUsaha.jenis) + '">' + e(c[1]) + '</button>'; }).join('') + '</div>' +
      '<div id="daftarUsaha"></div>';
  }
  function gambarUsaha() {
    var q = saringUsaha.q.toLowerCase();
    var hasil = (D.usaha || []).filter(function (u) { return u.aktif; }).filter(function (u) {
      if (saringUsaha.jenis !== 'semua' && u.jenis !== saringUsaha.jenis) return false;
      if (!q) return true;
      return [u.nama, u.pemilik, u.jenis].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    $('#daftarUsaha').innerHTML = hasil.length ? '<div class="tumpuk stagger">' + hasil.map(function (u) { return kartuUsahaPublik(u); }).join('') + '</div>' : kosong(q ? 'Tidak ada usaha yang cocok dengan "' + e(saringUsaha.q) + '".' : 'Belum ada usaha terdaftar.', 'dompet');
    stagger($('#daftarUsaha'));
  }
  function kartuUsahaPublik(u) {
    return '<article class="kartu info-kartu" data-jenis="' + e(u.jenis) + '">' +
      '<div style="flex:1;min-width:0"><div class="baris-aksi" style="margin-bottom:4px"><span class="lencana ' + (u.jenis === 'Makanan & Minuman' ? 'aksen' : 'netral') + '">' + e(u.jenis) + '</span></div>' +
      '<h3>' + e(u.nama) + '</h3><p>Pemilik: ' + e(u.pemilik) + ' · ' + e(u.alamat) + '</p>' +
      (u.jam ? '<div class="info-meta"><span>' + ik('jam') + e(u.jam) + '</span></div>' : '') +
      (u.ket ? '<p>' + e(u.ket) + '</p>' : '') +
      (u.wa ? '<div class="baris-aksi" style="margin-top:12px"><a class="btn btn-wa btn-kecil" target="_blank" rel="noopener" href="' + waLink(u.wa, 'Halo, saya mau tanya tentang ' + u.nama + '.') + '" aria-label="Chat WhatsApp ' + e(u.nama) + '">' + ik('wa') + 'Chat WA</a></div>' : '') + '</div></article>';
  }
  function halUsahaPasca() {
    gambarUsaha();
    $('#cariUsaha').addEventListener('input', function () { saringUsaha.q = this.value; gambarUsaha(); });
    $$('[data-filter-jenis]').forEach(function (b) {
      b.addEventListener('click', function () {
        saringUsaha.jenis = b.dataset.filterJenis;
        $$('[data-filter-jenis]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        gambarUsaha();
      });
    });
  }

  /* ========== 6. Halaman pengurus ========== */
  // --- Ringkas
  HAL.ringkas = function () {
    var b = bulanKey(), lunas = D.kk.filter(function (k) { return sudahBayar(b, k.id); }).length, pers = D.kk.length ? Math.round(lunas / D.kk.length * 100) : 0;
    var tetap = D.kk.filter(function (k) { return k.status === 'tetap'; }).length;
    var l = 0, p = 0; D.kk.forEach(function (k) { k.anggota.forEach(function (a) { if (a.jk === 'P') p++; else l++; }); });
    var km = kasBulan(b);
    var nunggak = D.kk.map(function (k) { return { k: k, t: tunggakan(k) }; }).filter(function (x) { return x.t.length; }).sort(function (a, c) { return c.t.length - a.t.length; });
    var jam = new Date().getHours(), sapa = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam';
    var ag = infoDatang().slice(0, 3);
    return '<section class="sapa-kartu"><div><small>' + tglHari(hariIni()) + ' · ' + e(namaRT()) + '</small><h1>' + sapa + ', ' + e((sesi() && sesi().nama) || 'Pengurus') + '</h1><p>' + (nunggak.length ? nunggak.length + ' KK perlu diingatkan iurannya' : 'Semua iuran lancar') + (ag.length ? ' · agenda berikutnya: ' + e(ag[0].judul) : '') + '.</p></div><div class="baris-aksi"><a class="btn" href="#/panel/warga/baru">' + ik('tambah') + 'Tambah KK</a><a class="btn btn-garis" href="#/panel/info/baru">' + ik('info') + 'Umumkan</a></div></section>' +
      '<div class="grid grid-4 stagger" style="margin-bottom:16px">' +
      '<div class="kartu stat p-hijau"><div class="label"><i>' + ik('warga') + '</i>Kepala keluarga</div><div class="nilai" data-hitung="' + D.kk.length + '">0</div><div class="sub">' + tetap + ' tetap · ' + (D.kk.length - tetap) + ' kontrak</div></div>' +
      '<div class="kartu stat p-kuning"><div class="label"><i>' + ik('jiwa') + '</i>Jumlah jiwa</div><div class="nilai" data-hitung="' + (l + p) + '">0</div><div class="sub">' + l + ' laki-laki · ' + p + ' perempuan</div></div>' +
      '<div class="kartu stat p-oranye"><div class="label"><i class="aksen">' + ik('iuran') + '</i>Iuran ' + BULAN[new Date().getMonth()] + '</div><div class="nilai">' + pers + '%</div><div class="batang" role="progressbar" aria-label="Persentase KK lunas" aria-valuenow="' + pers + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + pers + '%"></span></div><div class="sub" style="margin-top:6px">' + lunas + ' dari ' + D.kk.length + ' KK lunas</div></div>' +
      '<div class="kartu stat p-ungu"><div class="label"><i>' + ik('dompet') + '</i>Saldo kas</div><div class="nilai" data-rp data-hitung="' + saldo() + '">0</div><div class="sub"><span class="masuk">+' + rpPendek(km.masuk) + '</span> · <span class="keluar">−' + rpPendek(km.keluar) + '</span> bulan ini</div></div></div>' +
      '<div class="grid grid-2" style="align-items:start">' +
      '<section class="kartu"><h2>Kas 6 bulan terakhir <a class="btn btn-garis btn-kecil" href="#/panel/kas">Detail</a></h2>' + grafikKas(6) + '</section>' +
      '<section class="kartu"><h2>Perlu diingatkan <span class="lencana bahaya">' + nunggak.length + ' KK</span></h2>' + (nunggak.length ? '<ul class="daftar stagger">' + nunggak.slice(0, 5).map(function (x) {
        return '<li><span class="avatar aksen">' + e(inisial(x.k.kepala)) + '</span><div class="utama-baris"><b>' + e(x.k.kepala) + '</b><small>' + x.t.length + ' bulan · ' + rp(x.t.length * D.pengaturan.iuran) + '</small></div><a class="btn btn-wa btn-kecil" target="_blank" rel="noopener" href="' + linkPengingat(x.k) + '" aria-label="Kirim pengingat WA ke ' + e(x.k.kepala) + '">' + ik('wa') + 'Ingatkan</a></li>';
      }).join('') + '</ul>' : kosong('Semua KK lunas. Mantap!', 'cek')) + '</section>' +
      '<section class="kartu"><h2>Agenda terdekat <a class="btn btn-garis btn-kecil" href="#/panel/info">Kelola</a></h2>' + (ag.length ? '<ul class="daftar stagger">' + ag.map(function (i) { var d = new Date(i.tgl + 'T00:00'); return '<li><div class="tgl-blok" aria-hidden="true"><b>' + d.getDate() + '</b><small>' + BULAN[d.getMonth()].slice(0, 3) + '</small></div><div class="utama-baris"><b>' + e(i.judul) + '</b><small>' + HARI[d.getDay()] + (i.jam ? ', ' + e(i.jam) : '') + (i.tempat ? ' · ' + e(i.tempat) : '') + '</small></div></li>'; }).join('') + '</ul>' : kosong('Belum ada agenda.', 'kalender')) + '</section>' +
      '<section class="kartu"><h2>Aksi cepat</h2><div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">' +
      '<a class="btn btn-garis" href="#/panel/iuran">' + ik('iuran') + 'Catat iuran</a><a class="btn btn-garis" href="#/panel/kas/baru">' + ik('kas') + 'Catat kas</a>' +
      '<a class="btn btn-garis" href="#/panel/surat">' + ik('surat') + 'Buat surat</a><a class="btn btn-garis" href="#/panel/info/baru">' + ik('info') + 'Umumkan</a></div></section></div>';
  };
  HAL.ringkasPasca = pasangBagikan;

  function grafikKas(n) {
    var W = 600, H = 230, kiri = 46, bawah = 28, atas = 14, data = [], b = geserBulan(bulanKey(), -(n - 1));
    for (var i = 0; i < n; i++) { var k = kasBulan(b); var akhir = new Date(+b.slice(0, 4), +b.slice(5), 0); data.push({ b: b, m: k.masuk, k: k.keluar, s: saldo(akhir.getFullYear() + '-' + String(akhir.getMonth() + 1).padStart(2, '0') + '-' + String(akhir.getDate()).padStart(2, '0')) }); b = geserBulan(b, 1); }
    var maks = Math.max.apply(null, data.map(function (d) { return Math.max(d.m, d.k, d.s); }).concat([1]));
    var lang = Math.pow(10, Math.floor(Math.log10(maks))); maks = Math.ceil(maks / lang) * lang;
    var lebar = (W - kiri) / n, bw = Math.min(22, lebar / 4), y = function (v) { return atas + (H - atas - bawah) * (1 - v / maks); };
    var s = '<div class="grafik"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik pemasukan, pengeluaran, dan saldo kas ' + n + ' bulan terakhir">';
    for (var g = 0; g <= 4; g++) { var v = maks * g / 4; s += '<line class="grid-garis" x1="' + kiri + '" x2="' + W + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (kiri - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + rpPendek(v) + '</text>'; }
    var titik = [];
    data.forEach(function (d, i) {
      var cx = kiri + lebar * i + lebar / 2;
      s += '<rect class="bar" style="animation-delay:' + i * 70 + 'ms" x="' + (cx - bw - 2) + '" y="' + y(d.m) + '" width="' + bw + '" height="' + (H - bawah - y(d.m)) + '" rx="4" fill="var(--tema-utama)"><title>Masuk ' + namaBulan(d.b) + ': ' + rp(d.m) + '</title></rect>';
      s += '<rect class="bar" style="animation-delay:' + (i * 70 + 35) + 'ms" x="' + (cx + 2) + '" y="' + y(d.k) + '" width="' + bw + '" height="' + (H - bawah - y(d.k)) + '" rx="4" fill="var(--tema-aksen)"><title>Keluar ' + namaBulan(d.b) + ': ' + rp(d.k) + '</title></rect>';
      s += '<text x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle">' + namaBulan(d.b, true).slice(0, 3) + '</text>';
      titik.push(cx + ',' + y(d.s));
    });
    s += '<polyline class="garis-saldo" points="' + titik.join(' ') + '" fill="none" stroke="var(--teks)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    titik.forEach(function (t, i) { var p = t.split(','); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="var(--permukaan)" stroke="var(--teks)" stroke-width="2"><title>Saldo akhir ' + namaBulan(data[i].b) + ': ' + rp(data[i].s) + '</title></circle>'; });
    return s + '</svg><div class="legenda"><span style="--c:var(--tema-utama)">Pemasukan</span><span style="--c:var(--tema-aksen)">Pengeluaran</span><span style="--c:var(--teks)">Saldo akhir bulan</span></div></div>';
  }

  // --- Warga
  var saringWarga = { q: '', status: 'semua' };
  HAL.warga = function () {
    return kepalaHal('Data warga', D.kk.length + ' KK · ' + jiwaTotal() + ' jiwa', '<button class="btn btn-garis" data-csv="warga">' + ik('unduh') + 'CSV</button><button class="btn" data-kk-baru>' + ik('tambah') + 'Tambah KK</button>') +
      '<div class="alat"><div class="cari">' + ik('cari') + '<label class="sr" for="cariWarga">Cari warga</label><input id="cariWarga" type="search" placeholder="Cari nama, NIK, No. KK, alamat…" value="' + e(saringWarga.q) + '"></div>' +
      '<div class="chip-grup" role="group" aria-label="Saring status">' + ['semua', 'tetap', 'kontrak'].map(function (s) { return '<button class="chip" data-status="' + s + '" aria-pressed="' + (saringWarga.status === s) + '">' + (s === 'semua' ? 'Semua' : s === 'tetap' ? 'Tetap' : 'Kontrak') + '</button>'; }).join('') + '</div></div>' +
      '<div id="daftarWarga"></div>';
  };
  function gambarWarga() {
    var q = saringWarga.q.toLowerCase();
    var hasil = D.kk.filter(function (k) {
      if (saringWarga.status !== 'semua' && k.status !== saringWarga.status) return false;
      if (!q) return true;
      return [k.kepala, k.noKK, k.alamat].concat(k.anggota.map(function (a) { return a.nama + ' ' + a.nik; })).join(' ').toLowerCase().indexOf(q) >= 0;
    }).sort(function (a, b) { return a.alamat.localeCompare(b.alamat, 'id', { numeric: true }); });
    $('#daftarWarga').innerHTML = hasil.length ? '<div class="kk-grid stagger">' + hasil.map(function (k) {
      var t = tunggakan(k).length;
      return '<button class="kartu kk-kartu" data-kk="' + k.id + '" aria-label="Detail KK ' + e(k.kepala) + '"><div class="atas-kk"><span class="avatar' + (k.status === 'kontrak' ? ' aksen' : '') + '">' + e(inisial(k.kepala)) + '</span><div class="utama-baris" style="min-width:0;flex:1"><b style="display:block">' + e(k.kepala) + '</b><small class="mono" style="color:var(--redup)">KK ' + e(k.noKK) + '</small></div></div>' +
        '<div class="meta"><span class="lencana ' + (k.status === 'kontrak' ? 'aksen' : '') + '">' + (k.status === 'kontrak' ? 'Kontrak' : 'Tetap') + '</span><span class="lencana netral">' + k.anggota.length + ' jiwa</span>' + (t ? '<span class="lencana bahaya">Nunggak ' + t + ' bln</span>' : '') + '</div><div class="meta">' + ik('lokasi').replace('<svg', '<svg width="14" height="14" style="fill:none;stroke:currentColor;stroke-width:2"') + e(k.alamat) + '</div></button>';
    }).join('') + '</div>' : kosong(q ? 'Tidak ada warga yang cocok dengan "' + e(saringWarga.q) + '".' : 'Belum ada data KK. Klik "Tambah KK" untuk mulai.', 'warga');
    stagger($('#daftarWarga'));
  }
  HAL.wargaPasca = function (arg) {
    gambarWarga();
    $('#cariWarga').addEventListener('input', function () { saringWarga.q = this.value; gambarWarga(); });
    $$('[data-status]').forEach(function (b) { b.addEventListener('click', function () { saringWarga.status = b.dataset.status; $$('[data-status]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); gambarWarga(); }); });
    $('#daftarWarga').addEventListener('click', function (ev) { var b = ev.target.closest('[data-kk]'); if (b) detailKK(b.dataset.kk); });
    $('[data-kk-baru]').addEventListener('click', function () { formKK(); });
    if (arg === 'baru') { history.replaceState(null, '', '#/panel/warga'); formKK(); }
  };
  function detailKK(id) {
    var k = cariKK(id), t = tunggakan(k);
    modal('<div class="modal-kepala"><div><h2 id="modalJudul">' + e(k.kepala) + '</h2><p style="margin:4px 0 0;color:var(--redup)"><span class="mono">KK ' + e(k.noKK) + '</span> · ' + e(k.alamat) + '</p></div><button class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      '<div class="baris-aksi" style="margin-bottom:14px"><span class="lencana ' + (k.status === 'kontrak' ? 'aksen' : '') + '">' + (k.status === 'kontrak' ? 'Kontrak' : 'Tetap') + '</span><span class="lencana netral">' + k.anggota.length + ' jiwa</span>' + (t.length ? '<span class="lencana bahaya">Tunggakan ' + t.length + ' bln · ' + rp(t.length * D.pengaturan.iuran) + '</span>' : '<span class="lencana">Iuran lancar</span>') + '</div>' +
      '<div class="tabel-wadah"><table><thead><tr><th>Nama</th><th>Hubungan</th><th>NIK</th><th>L/P</th><th class="angka">Umur</th><th>Pekerjaan</th></tr></thead><tbody>' + k.anggota.map(function (a) { return '<tr><td><b>' + e(a.nama) + '</b></td><td>' + e(a.hubungan) + '</td><td class="mono">' + e(a.nik) + '</td><td>' + e(a.jk) + '</td><td class="angka">' + umur(a.tglLahir) + '</td><td>' + e(a.pekerjaan) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="modal-kaki"><button class="btn btn-hapus kiri" data-hapus>Hapus KK</button>' + (k.wa ? '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + (t.length ? linkPengingat(k) : waLink(k.wa, 'Halo ' + hormat(k.anggota[0]) + ', ')) + '">' + ik('wa') + (t.length ? 'Ingatkan iuran' : 'Chat') + '</a>' : '') + '<button class="btn" data-ubah>' + ik('sunting') + 'Ubah</button></div>', function (m) {
      $('[data-ubah]', m).addEventListener('click', function () { tutupModal(function () { formKK(k); }); });
      $('[data-hapus]', m).addEventListener('click', function () {
        konfirmasi('Hapus KK ' + k.kepala + '?', 'Data anggota dan riwayat iurannya ikut terhapus. Transaksi kas tetap tersimpan.', 'Hapus', function () {
          catatLog('hapus_kk', 'Hapus KK: ' + k.kepala + ' (' + k.alamat + ')');
          D.kk = D.kk.filter(function (x) { return x !== k; }); Object.keys(D.iuran).forEach(function (b) { delete D.iuran[b][k.id]; }); simpan(); render(); toast('KK ' + k.kepala + ' dihapus');
        });
      });
    });
  }
  var HUB = ['Kepala Keluarga', 'Istri', 'Suami', 'Anak', 'Menantu', 'Cucu', 'Orang Tua', 'Mertua', 'Famili Lain', 'Lainnya'];
  var AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];
  var KAWIN = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];
  function opsi(arr, nilai) { return arr.map(function (x) { return '<option' + (x === nilai ? ' selected' : '') + '>' + e(x) + '</option>'; }).join(''); }
  function barisAnggota(a, i) {
    a = a || { jk: 'L', hubungan: i === 0 ? 'Kepala Keluarga' : 'Anak', agama: 'Islam', kawin: i === 0 ? 'Kawin' : 'Belum Kawin' };
    var p = 'a' + i + '-' + Math.random().toString(36).slice(2, 6);
    return '<div class="anggota-baris" data-anggota><div class="kepala-baris"><span>' + (i === 0 ? 'Kepala keluarga' : 'Anggota') + '</span>' + (i === 0 ? '' : '<button type="button" class="btn btn-hapus btn-kecil" data-hapus-anggota>Hapus</button>') + '</div><div class="form-grid">' +
      bid(p + 'n', 'Nama lengkap', '<input id="' + p + 'n" name="nama" required autocomplete="off" value="' + e(a.nama) + '">') +
      bid(p + 'k', 'NIK', '<input id="' + p + 'k" name="nik" inputmode="numeric" pattern="\\d{16}" maxlength="16" title="NIK 16 angka" value="' + e(a.nik) + '">') +
      bid(p + 'h', 'Hubungan', '<select id="' + p + 'h" name="hubungan">' + opsi(HUB, a.hubungan) + '</select>') +
      bid(p + 'j', 'Jenis kelamin', '<select id="' + p + 'j" name="jk"><option value="L"' + (a.jk === 'L' ? ' selected' : '') + '>Laki-laki</option><option value="P"' + (a.jk === 'P' ? ' selected' : '') + '>Perempuan</option></select>') +
      bid(p + 't', 'Tempat lahir', '<input id="' + p + 't" name="tempatLahir" value="' + e(a.tempatLahir) + '">') +
      bid(p + 'd', 'Tanggal lahir', '<input id="' + p + 'd" name="tglLahir" type="date" value="' + e(a.tglLahir) + '">') +
      bid(p + 'g', 'Agama', '<select id="' + p + 'g" name="agama">' + opsi(AGAMA, a.agama) + '</select>') +
      bid(p + 'w', 'Status kawin', '<select id="' + p + 'w" name="kawin">' + opsi(KAWIN, a.kawin) + '</select>') +
      bid(p + 'p', 'Pekerjaan', '<input id="' + p + 'p" name="pekerjaan" value="' + e(a.pekerjaan) + '">') + '</div></div>';
  }
  function bid(id, label, kontrol, bantuan) { return '<div class="bidang"><label for="' + id + '">' + label + '</label>' + kontrol + (bantuan ? '<small>' + bantuan + '</small>' : '') + '</div>'; }
  function formKK(k) {
    var baru = !k; k = k || { status: 'tetap', anggota: [] };
    var ang = k.anggota.length ? k.anggota : [null];
    modal('<form id="fKK" novalidate><div class="modal-kepala"><h2 id="modalJudul">' + (baru ? 'Tambah KK' : 'Ubah KK') + '</h2><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      '<div class="form-grid">' + bid('fNoKK', 'No. KK', '<input id="fNoKK" name="noKK" inputmode="numeric" maxlength="16" value="' + e(k.noKK) + '">', '16 angka sesuai kartu keluarga') +
      bid('fAlamat', 'Alamat / blok', '<input id="fAlamat" name="alamat" required value="' + e(k.alamat) + '" placeholder="Blok A No. 1">') +
      bid('fStatus', 'Status tinggal', '<select id="fStatus" name="status"><option value="tetap"' + (k.status === 'tetap' ? ' selected' : '') + '>Tetap</option><option value="kontrak"' + (k.status === 'kontrak' ? ' selected' : '') + '>Kontrak / kos</option></select>') +
      bid('fWA', 'No. WhatsApp', '<input id="fWA" name="wa" inputmode="tel" value="' + e(k.wa) + '" placeholder="0812…">') + '</div>' +
      '<h3 style="font-size:15px;margin:6px 0 10px">Anggota keluarga</h3><div id="wadahAnggota">' + ang.map(barisAnggota).join('') + '</div>' +
      '<button type="button" class="btn btn-garis btn-kecil" id="tambahAnggota">' + ik('tambah') + 'Tambah anggota</button>' +
      '<p id="galatKK" role="alert" style="color:var(--bahaya);font-weight:600;margin:12px 0 0"></p>' +
      '<div class="modal-kaki"><button type="button" class="btn btn-garis" data-tutup>Batal</button><button class="btn" type="submit">' + ik('cek') + 'Simpan</button></div></form>', function (m) {
      var wadah = $('#wadahAnggota', m);
      $('#tambahAnggota', m).addEventListener('click', function () { wadah.insertAdjacentHTML('beforeend', barisAnggota(null, wadah.children.length)); $('input', wadah.lastElementChild).focus(); });
      wadah.addEventListener('click', function (ev) { if (ev.target.closest('[data-hapus-anggota]')) ev.target.closest('[data-anggota]').remove(); });
      $('#fKK', m).addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target, galat = '';
        var anggota = $$('[data-anggota]', f).map(function (b) { var o = {}; $$('input,select', b).forEach(function (x) { o[x.name] = x.value.trim(); }); return o; }).filter(function (a) { return a.nama; });
        if (!f.alamat.value.trim()) galat = 'Alamat wajib diisi.';
        else if (!anggota.length) galat = 'Isi minimal nama kepala keluarga.';
        else if (f.noKK.value && !/^\d{16}$/.test(f.noKK.value)) galat = 'No. KK harus 16 angka.';
        else if (anggota.some(function (a) { return a.nik && !/^\d{16}$/.test(a.nik); })) galat = 'NIK harus 16 angka (atau kosongkan dulu).';
        $('#galatKK', f).textContent = galat;
        if (galat) { var p = $('#galatKK', f); p.classList.remove('cap'); void p.offsetWidth; p.classList.add('cap'); return; }
        var data = { noKK: f.noKK.value.trim(), alamat: f.alamat.value.trim(), status: f.status.value, wa: f.wa.value.trim(), anggota: anggota, kepala: anggota[0].nama };
        if (baru) { data.id = idBaru('kk'); data.dibuat = hariIni(); D.kk.push(data); } else Object.assign(k, data);
        catatLog(baru ? 'tambah_kk' : 'ubah_kk', (baru ? 'Tambah KK: ' : 'Ubah KK: ') + data.kepala + ' (' + data.alamat + ')');
        simpan(); tutupModal(); render(); toast(baru ? 'KK ' + data.kepala + ' ditambahkan' : 'Perubahan disimpan');
      });
    });
  }

  // --- Iuran
  var iuranBulan = bulanKey(), iuranSaring = 'semua', iuranTab = 'bulan';
  HAL.iuran = function () {
    return kepalaHal('Iuran bulanan', 'Rp' + Number(D.pengaturan.iuran).toLocaleString('id-ID') + ' per KK per bulan', '<div class="chip-grup" role="tablist" aria-label="Tampilan iuran"><button class="chip" role="tab" data-tab="bulan" aria-selected="' + (iuranTab === 'bulan') + '" aria-pressed="' + (iuranTab === 'bulan') + '">Per bulan</button><button class="chip" role="tab" data-tab="rekap" aria-selected="' + (iuranTab === 'rekap') + '" aria-pressed="' + (iuranTab === 'rekap') + '">Rekap</button></div>') + '<div id="isiIuran"></div>';
  };
  function gambarIuran() {
    var w = $('#isiIuran'); if (!w) return;
    if (iuranTab === 'rekap') return gambarRekap(w);
    var b = iuranBulan, lunas = D.kk.filter(function (k) { return sudahBayar(b, k.id); }), pers = D.kk.length ? Math.round(lunas.length / D.kk.length * 100) : 0;
    var daftar = D.kk.filter(function (k) { var l = sudahBayar(b, k.id); return iuranSaring === 'semua' || (iuranSaring === 'lunas' ? l : !l); }).sort(function (a, c) { return a.alamat.localeCompare(c.alamat, 'id', { numeric: true }); });
    w.innerHTML = '<div class="kartu" style="margin-bottom:16px"><div class="ringkas-iuran"><div class="cincin" style="--p:' + pers + '" data-label="' + pers + '%" role="img" aria-label="' + pers + ' persen lunas"></div><div style="flex:1;min-width:180px">' +
      '<div class="bulan-nav"><button class="btn btn-garis btn-ikon" data-geser="-1" aria-label="Bulan sebelumnya">' + ik('kiri') + '</button><b aria-live="polite">' + namaBulan(b) + '</b><button class="btn btn-garis btn-ikon" data-geser="1" aria-label="Bulan berikutnya"' + (b >= bulanKey() ? ' disabled' : '') + '>' + ik('kanan') + '</button></div>' +
      '<p style="margin:10px 0 0;color:var(--redup)">Terkumpul <b style="color:var(--teks)">' + rp(lunas.length * D.pengaturan.iuran) + '</b> dari ' + rp(D.kk.length * D.pengaturan.iuran) + ' · ' + lunas.length + '/' + D.kk.length + ' KK</p></div>' +
      '<div class="baris-aksi"><button class="btn btn-garis" id="salinRekapWA">' + ik('bagikan') + 'Salin daftar belum bayar</button></div></div></div>' +
      '<div class="alat"><div class="chip-grup" role="group" aria-label="Saring status bayar">' + [['semua', 'Semua'], ['belum', 'Belum bayar'], ['lunas', 'Lunas']].map(function (s) { return '<button class="chip" data-saring="' + s[0] + '" aria-pressed="' + (iuranSaring === s[0]) + '">' + s[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="kartu" style="padding:6px 18px">' + (daftar.length ? '<ul class="daftar stagger">' + daftar.map(function (k) {
        var l = sudahBayar(b, k.id), t = tunggakan(k);
        return '<li><span class="avatar' + (l ? '' : ' aksen') + '">' + e(inisial(k.kepala)) + '</span><div class="utama-baris"><b>' + e(k.kepala) + '</b><small>' + e(k.alamat) + (l ? ' · dibayar ' + tglPanjang(D.iuran[b][k.id]) : t.length > 1 ? ' · <span class="keluar">nunggak ' + t.length + ' bln</span>' : '') + '</small></div>' +
          (!l && k.wa ? '<a class="btn btn-wa btn-kecil btn-ikon" target="_blank" rel="noopener" href="' + linkPengingat(k) + '" aria-label="Kirim pengingat WA ke ' + e(k.kepala) + '" title="Kirim pengingat WA">' + ik('wa') + '</a>' : '') +
          '<button class="btn btn-garis btn-kecil tombol-lunas" data-lunas="' + k.id + '" aria-pressed="' + l + '" aria-label="' + (l ? 'Batalkan lunas ' : 'Tandai lunas ') + e(k.kepala) + '">' + (l ? ik('cek') + 'Lunas' : 'Tandai lunas') + '</button></li>';
      }).join('') + '</ul>' : kosong(iuranSaring === 'belum' ? 'Semua KK sudah bayar bulan ini.' : 'Tidak ada data.', 'cek')) + '</div>';
    stagger(w);
  }
  function gambarRekap(w) {
    var bln = bulanTagihan().slice(-6);
    w.innerHTML = '<div class="alat"><p style="margin:0;color:var(--redup);flex:1">Rekap ' + bln.length + ' bulan terakhir. ✓ = lunas.</p><button class="btn btn-garis" data-csv="iuran">' + ik('unduh') + 'Ekspor CSV</button></div>' +
      '<div class="tabel-wadah"><table><thead><tr><th>Kepala keluarga</th>' + bln.map(function (b) { return '<th class="angka">' + namaBulan(b, true) + '</th>'; }).join('') + '<th class="angka">Tunggakan</th></tr></thead><tbody>' +
      D.kk.map(function (k) { var t = tunggakan(k); return '<tr><td><b>' + e(k.kepala) + '</b><br><small style="color:var(--redup)">' + e(k.alamat) + '</small></td>' + bln.map(function (b) { var l = sudahBayar(b, k.id); return '<td class="' + (l ? 'sel-lunas' : 'sel-belum') + '"><span aria-hidden="true">' + (l ? '✓' : '–') + '</span><span class="sr">' + (l ? 'lunas' : 'belum') + '</span></td>'; }).join('') + '<td class="angka ' + (t.length ? 'keluar' : '') + '">' + (t.length ? rp(t.length * D.pengaturan.iuran) : '–') + '</td></tr>'; }).join('') +
      '</tbody><tfoot><tr><th>Terkumpul</th>' + bln.map(function (b) { return '<th class="angka">' + rpPendek(D.kk.filter(function (k) { return sudahBayar(b, k.id); }).length * D.pengaturan.iuran) + '</th>'; }).join('') + '<th></th></tr></tfoot></table></div>';
  }
  HAL.iuranPasca = function () {
    gambarIuran();
    $$('[data-tab]').forEach(function (t) { t.addEventListener('click', function () { iuranTab = t.dataset.tab; $$('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', x === t); x.setAttribute('aria-pressed', x === t); }); gambarIuran(); }); });
    $('#isiIuran').addEventListener('click', function (ev) {
      var g = ev.target.closest('[data-geser]'), s = ev.target.closest('[data-saring]'), l = ev.target.closest('[data-lunas]');
      if (g) { iuranBulan = geserBulan(iuranBulan, +g.dataset.geser); gambarIuran(); }
      if (s) { iuranSaring = s.dataset.saring; gambarIuran(); }
      if (ev.target.closest('#salinRekapWA')) salinBelumBayar();
      if (l) {
        var id = l.dataset.lunas, jadi = !sudahBayar(iuranBulan, id), k = cariKK(id);
        setLunas(iuranBulan, id, jadi); gambarIuran();
        /* setLunas ikut menambah/menghapus baris kas otomatis — yang dicatat
           di sini hanya aksi iurannya. */
        catatLog(jadi ? 'tambah_iuran' : 'hapus_iuran', (jadi ? 'Iuran lunas ' : 'Batal lunas ') + namaBulan(iuranBulan) + ' — ' + k.kepala);
        var tb = $('[data-lunas="' + id + '"]'); if (tb) { tb.classList.add('cap'); tb.focus(); }
        toast(jadi ? k.kepala + ' lunas ' + namaBulan(iuranBulan) + ' · masuk kas' : 'Status lunas ' + k.kepala + ' dibatalkan');
      }
    });
  };
  function teksPengingat(k) {
    var t = tunggakan(k), kep = k.anggota[0] || { nama: k.kepala };
    return 'Assalamualaikum ' + hormat(kep) + ' 🙏\n\nIzin mengingatkan iuran warga *' + namaRT() + '*:\n' + t.map(function (b) { return '• ' + namaBulan(b) + ' — ' + rp(D.pengaturan.iuran); }).join('\n') +
      '\n\n*Total: ' + rp(t.length * D.pengaturan.iuran) + '*\n\nPembayaran: ' + D.pengaturan.caraBayar + '\n\nAbaikan pesan ini bila sudah membayar. Terima kasih atas partisipasinya.\n— Bendahara ' + namaRT();
  }
  function linkPengingat(k) { return waLink(k.wa, teksPengingat(k)); }
  function salinBelumBayar() {
    var b = iuranBulan, belum = D.kk.filter(function (k) { return !sudahBayar(b, k.id); });
    var teks = '*Iuran ' + namaRT() + ' — ' + namaBulan(b) + '*\nYang belum tercatat bayar (' + belum.length + ' KK):\n' + belum.map(function (k, i) { return (i + 1) + '. ' + k.kepala + ' (' + k.alamat + ')'; }).join('\n') + '\n\nIuran ' + rp(D.pengaturan.iuran) + '. ' + D.pengaturan.caraBayar + '\nTerima kasih 🙏';
    salin(teks, 'Daftar disalin. Tempel di grup WA warga.');
  }

  // --- Kas
  var kasSaring = 'semua';
  HAL.kas = function () {
    var b = bulanKey(), km = kasBulan(b);
    return kepalaHal('Kas RT', 'Saldo per hari ini', '<button class="btn btn-garis" data-csv="kas">' + ik('unduh') + 'CSV</button><button class="btn" data-kas-baru>' + ik('tambah') + 'Catat transaksi</button>') +
      '<div class="grid grid-4 stagger" style="margin-bottom:16px"><div class="kartu stat"><div class="label"><i>' + ik('dompet') + '</i>Saldo</div><div class="nilai" data-rp data-hitung="' + saldo() + '">0</div></div>' +
      '<div class="kartu stat"><div class="label"><i>' + ik('unduh') + '</i>Masuk ' + BULAN[new Date().getMonth()] + '</div><div class="nilai masuk" data-rp data-hitung="' + km.masuk + '">0</div></div>' +
      '<div class="kartu stat"><div class="label"><i class="aksen">' + ik('unggah') + '</i>Keluar ' + BULAN[new Date().getMonth()] + '</div><div class="nilai keluar" data-rp data-hitung="' + km.keluar + '">0</div></div></div>' +
      '<section class="kartu" style="margin-bottom:16px"><h2>Arus kas 6 bulan</h2>' + grafikKas(6) + '</section>' +
      '<div class="alat"><div class="chip-grup" role="group" aria-label="Saring jenis">' + [['semua', 'Semua'], ['masuk', 'Pemasukan'], ['keluar', 'Pengeluaran']].map(function (s) { return '<button class="chip" data-kas-saring="' + s[0] + '" aria-pressed="' + (kasSaring === s[0]) + '">' + s[1] + '</button>'; }).join('') + '</div></div><div id="daftarKas"></div>';
  };
  function gambarKas() {
    var d = D.kas.filter(function (x) { return kasSaring === 'semua' || x.jenis === kasSaring; }).sort(function (a, b) { return b.tgl.localeCompare(a.tgl); }).slice(0, 80);
    $('#daftarKas').innerHTML = d.length ? '<div class="tabel-wadah"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="angka">Jumlah</th><th><span class="sr">Aksi</span></th></tr></thead><tbody>' + d.map(function (x) {
      return '<tr><td>' + tglPanjang(x.tgl) + '</td><td style="white-space:normal;min-width:180px">' + e(x.ket) + '</td><td><span class="lencana ' + (x.jenis === 'masuk' ? '' : 'aksen') + '">' + e(x.kategori) + '</span></td><td class="angka ' + x.jenis + '"><b>' + (x.jenis === 'masuk' ? '+' : '−') + rp(x.jumlah) + '</b></td><td>' + (x.ref ? '<small style="color:var(--redup)">otomatis</small>' : '<button class="btn btn-garis btn-kecil btn-ikon" data-ubah-kas="' + x.id + '" aria-label="Ubah transaksi ' + e(x.ket) + '">' + ik('sunting') + '</button>') + '</td></tr>';
    }).join('') + '</tbody></table></div>' + (D.kas.length > 80 ? '<p style="color:var(--redup);font-size:13px">Menampilkan 80 transaksi terbaru. Ekspor CSV untuk melihat semua.</p>' : '') : kosong('Belum ada transaksi.', 'kas');
  }
  HAL.kasPasca = function (arg) {
    gambarKas();
    $$('[data-kas-saring]').forEach(function (b) { b.addEventListener('click', function () { kasSaring = b.dataset.kasSaring; $$('[data-kas-saring]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); gambarKas(); }); });
    $('[data-kas-baru]').addEventListener('click', function () { formKas(); });
    $('#daftarKas').addEventListener('click', function (ev) { var b = ev.target.closest('[data-ubah-kas]'); if (b) formKas(D.kas.filter(function (x) { return x.id === b.dataset.ubahKas; })[0]); });
    if (arg === 'baru') { history.replaceState(null, '', '#/panel/kas'); formKas(); }
  };
  var KATEGORI = { masuk: ['Iuran', 'Donasi', 'Sewa fasilitas', 'Saldo awal', 'Lainnya'], keluar: ['Kebersihan', 'Keamanan', 'Listrik', 'Perbaikan', 'Sosial', 'Kegiatan', 'Administrasi', 'Lainnya'] };
  function formKas(x) {
    var baru = !x; x = x || { jenis: 'keluar', tgl: hariIni(), kategori: 'Kebersihan' };
    modal('<form id="fKas"><div class="modal-kepala"><h2 id="modalJudul">' + (baru ? 'Catat transaksi' : 'Ubah transaksi') + '</h2><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      '<div class="chip-grup" role="radiogroup" aria-label="Jenis transaksi" style="margin-bottom:14px">' + ['masuk', 'keluar'].map(function (j) { return '<button type="button" class="chip" data-jenis="' + j + '" role="radio" aria-checked="' + (x.jenis === j) + '" aria-pressed="' + (x.jenis === j) + '">' + (j === 'masuk' ? 'Pemasukan' : 'Pengeluaran') + '</button>'; }).join('') + '</div>' +
      '<div class="form-grid">' + bid('kJml', 'Jumlah (Rp)', '<input id="kJml" name="jumlah" inputmode="numeric" required value="' + (x.jumlah ? Number(x.jumlah).toLocaleString('id-ID') : '') + '" placeholder="50.000">') +
      bid('kTgl', 'Tanggal', '<input id="kTgl" name="tgl" type="date" required value="' + e(x.tgl) + '">') +
      bid('kKat', 'Kategori', '<select id="kKat" name="kategori"></select>') + '</div>' +
      bid('kKet', 'Keterangan', '<input id="kKet" name="ket" required value="' + e(x.ket) + '" placeholder="mis. Honor petugas sampah">') +
      '<p id="galatKas" role="alert" style="color:var(--bahaya);font-weight:600;margin:0"></p>' +
      '<div class="modal-kaki">' + (baru ? '' : '<button type="button" class="btn btn-hapus kiri" data-hapus>Hapus</button>') + '<button type="button" class="btn btn-garis" data-tutup>Batal</button><button class="btn" type="submit">' + ik('cek') + 'Simpan</button></div></form>', function (m) {
      var jenis = x.jenis, sel = $('#kKat', m);
      function isiKat() { sel.innerHTML = opsi(KATEGORI[jenis], x.kategori); }
      isiKat();
      $$('[data-jenis]', m).forEach(function (b) { b.addEventListener('click', function () { jenis = b.dataset.jenis; $$('[data-jenis]', m).forEach(function (y) { y.setAttribute('aria-checked', y === b); y.setAttribute('aria-pressed', y === b); }); isiKat(); }); });
      var jml = $('#kJml', m);
      jml.addEventListener('input', function () { var v = this.value.replace(/\D/g, ''); this.value = v ? Number(v).toLocaleString('id-ID') : ''; });
      if (!baru) $('[data-hapus]', m).addEventListener('click', function () { catatLog('hapus_kas', (x.jenis === 'masuk' ? 'Pemasukan ' : 'Pengeluaran ') + rp(x.jumlah) + ' — ' + x.ket); D.kas = D.kas.filter(function (y) { return y !== x; }); simpan(); tutupModal(); render(); toast('Transaksi dihapus'); });
      $('#fKas', m).addEventListener('submit', function (ev) {
        ev.preventDefault(); var f = ev.target, n = Number(f.jumlah.value.replace(/\D/g, ''));
        if (!n) { $('#galatKas', m).textContent = 'Jumlah harus lebih dari 0.'; jml.focus(); return; }
        if (!f.ket.value.trim()) { $('#galatKas', m).textContent = 'Keterangan wajib diisi.'; f.ket.focus(); return; }
        var data = { jenis: jenis, jumlah: n, tgl: f.tgl.value || hariIni(), kategori: f.kategori.value, ket: f.ket.value.trim() };
        if (baru) { data.id = idBaru('ks'); D.kas.push(data); } else Object.assign(x, data);
        catatLog(baru ? 'tambah_kas' : 'ubah_kas', (jenis === 'masuk' ? 'Pemasukan ' : 'Pengeluaran ') + rp(n) + ' — ' + data.ket);
        simpan(); tutupModal(); render(); toast((jenis === 'masuk' ? 'Pemasukan ' : 'Pengeluaran ') + rp(n) + ' dicatat');
      });
    });
  }

  // --- Info (pengumuman & agenda)
  HAL.info = function () {
    var peng = pengumumanUrut(), ag = D.info.filter(function (i) { return i.jenis === 'agenda'; }).sort(function (a, b) { var h = hariIni(), ka = a.tgl + (a.jam || ''), kb = b.tgl + (b.jam || ''), la = a.tgl < h, lb = b.tgl < h; return la !== lb ? (la ? 1 : -1) : la ? kb.localeCompare(ka) : ka.localeCompare(kb); });
    return kepalaHal('Pengumuman & agenda', 'Tampil di halaman publik warga', '<a class="btn btn-garis" href="#/" target="_blank" rel="noopener">Lihat halaman publik</a><button class="btn" data-info-baru>' + ik('tambah') + 'Buat baru</button>') +
      '<div class="grid grid-2" style="align-items:start"><section><h2 style="font-size:18px;margin-bottom:12px">Pengumuman</h2><div class="tumpuk stagger">' + (peng.length ? peng.map(function (i) { return kartuInfo(i, true); }).join('') : kosong('Belum ada pengumuman.', 'info')) + '</div></section>' +
      '<section><h2 style="font-size:18px;margin-bottom:12px">Agenda</h2><div class="tumpuk stagger">' + (ag.length ? ag.map(function (i) { return kartuInfo(i, true); }).join('') : kosong('Belum ada agenda.', 'kalender')) + '</div></section></div>';
  };
  HAL.infoPasca = function (arg) {
    pasangBagikan();
    $('[data-info-baru]').addEventListener('click', function () { formInfo(); });
    $('#isi').addEventListener('click', infoKlik);
    if (arg === 'baru') { history.replaceState(null, '', '#/panel/info'); formInfo(); }
  };
  function infoKlik(ev) {
    var u = ev.target.closest('[data-ubah-info]'), h = ev.target.closest('[data-hapus-info]');
    if (u) formInfo(D.info.filter(function (i) { return i.id === u.dataset.ubahInfo; })[0]);
    if (h) { var i = D.info.filter(function (x) { return x.id === h.dataset.hapusInfo; })[0]; konfirmasi('Hapus "' + i.judul + '"?', 'Informasi ini akan hilang dari halaman publik.', 'Hapus', function () { catatLog('hapus_info', 'Hapus ' + i.jenis + ': ' + i.judul); D.info = D.info.filter(function (x) { return x !== i; }); simpan(); sinkronPublik('info'); render(); toast('Dihapus'); }); }
  }
  function teksBagikan(i) {
    return '📢 *' + i.judul + '*\n' + namaRT() + ' · Kel. ' + D.pengaturan.kelurahan + '\n\n' + i.isi + '\n\n🗓️ ' + tglHari(i.tgl) + (i.jam ? '\n⏰ ' + i.jam + ' WIB' : '') + (i.tempat ? '\n📍 ' + i.tempat : '') + '\n\nTerima kasih. — Pengurus ' + namaRT();
  }
  function pasangBagikan() {
    $$('[data-bagikan]').forEach(function (b) { b.addEventListener('click', function () { var i = D.info.filter(function (x) { return x.id === b.dataset.bagikan; })[0]; window.open('https://wa.me/?text=' + encodeURIComponent(teksBagikan(i)), '_blank', 'noopener'); }); });
  }
  function formInfo(i) {
    var baru = !i; i = i || { jenis: 'pengumuman', tgl: hariIni() };
    modal('<form id="fInfo"><div class="modal-kepala"><h2 id="modalJudul">' + (baru ? 'Buat pengumuman / agenda' : 'Ubah informasi') + '</h2><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      '<div class="form-grid">' + bid('iJenis', 'Jenis', '<select id="iJenis" name="jenis"><option value="pengumuman"' + (i.jenis === 'pengumuman' ? ' selected' : '') + '>Pengumuman</option><option value="agenda"' + (i.jenis === 'agenda' ? ' selected' : '') + '>Agenda / kegiatan</option></select>') +
      bid('iTgl', 'Tanggal', '<input id="iTgl" type="date" name="tgl" required value="' + e(i.tgl) + '">') + '</div>' +
      bid('iJudul', 'Judul', '<input id="iJudul" name="judul" required maxlength="90" value="' + e(i.judul) + '">') +
      bid('iIsi', 'Isi', '<textarea id="iIsi" name="isi" required>' + e(i.isi) + '</textarea>') +
      '<div class="form-grid">' + bid('iJam', 'Jam (opsional)', '<input id="iJam" type="time" name="jam" value="' + e(i.jam) + '">') + bid('iTempat', 'Tempat (opsional)', '<input id="iTempat" name="tempat" value="' + e(i.tempat) + '">') + '</div>' +
      '<label style="display:flex;gap:10px;align-items:center;font-weight:600"><input type="checkbox" name="sematkan" style="width:20px;min-height:20px"' + (i.sematkan ? ' checked' : '') + '> Sematkan di paling atas</label>' +
      '<div class="modal-kaki"><button type="button" class="btn btn-garis" data-tutup>Batal</button><button class="btn" type="submit">' + ik('cek') + 'Simpan</button></div></form>', function (m) {
      $('#fInfo', m).addEventListener('submit', function (ev) {
        ev.preventDefault(); var f = ev.target;
        if (!f.judul.value.trim() || !f.isi.value.trim()) { (f.judul.value.trim() ? f.isi : f.judul).focus(); toast('Judul dan isi wajib diisi', 'bahaya'); return; }
        var data = { jenis: f.jenis.value, tgl: f.tgl.value || hariIni(), judul: f.judul.value.trim(), isi: f.isi.value.trim(), jam: f.jam.value, tempat: f.tempat.value.trim(), sematkan: f.sematkan.checked };
        if (baru) { data.id = idBaru('in'); D.info.push(data); } else Object.assign(i, data);
        catatLog(baru ? 'tambah_info' : 'ubah_info', (baru ? 'Tambah ' : 'Ubah ') + data.jenis + ': ' + data.judul);
        simpan(); sinkronPublik('info'); tutupModal(); render(); toast('Tersimpan & tampil di halaman publik');
      });
    });
  }

  // --- Usaha warga (panel pengurus; daftar + hapus di U-3, form tambah/ubah di U-4)
  HAL.usaha = function () {
    var daftar = D.usaha || [];
    return kepalaHal('Usaha Warga', daftar.length + ' usaha terdaftar · hanya pengurus yang bisa menambah', '<a class="btn btn-garis" href="#/" target="_blank" rel="noopener">Lihat halaman publik</a><button class="btn" data-usaha-baru>' + ik('tambah') + 'Tambah usaha</button>') +
      '<div class="tumpuk stagger">' + (daftar.length ? daftar.map(function (u) { return kartuUsaha(u); }).join('') : kosong('Belum ada usaha terdaftar.', 'dompet')) + '</div>';
  };
  function kartuUsaha(u) {
    return '<article class="kartu info-kartu">' +
      '<div style="flex:1;min-width:0"><div class="baris-aksi" style="margin-bottom:4px"><span class="lencana ' + (u.jenis === 'Makanan & Minuman' ? 'aksen' : 'netral') + '">' + e(u.jenis) + '</span>' + (u.aktif ? '' : '<span class="lencana bahaya">Nonaktif</span>') + '</div>' +
      '<h3>' + e(u.nama) + '</h3><p>Pemilik: ' + e(u.pemilik) + '</p>' +
      '<div class="info-meta"><span>' + ik('lokasi') + e(u.alamat) + '</span>' + (u.jam ? '<span>' + ik('jam') + e(u.jam) + '</span>' : '') + '</div>' +
      (u.ket ? '<p>' + e(u.ket) + '</p>' : '') +
      '<div class="baris-aksi" style="margin-top:12px">' +
      (u.wa ? '<a class="btn btn-garis btn-kecil" href="' + waLink(u.wa, 'Halo, saya mau tanya tentang ' + u.nama + '.') + '" target="_blank" rel="noopener">' + ik('wa') + 'Chat WA</a>' : '') +
      '<button class="btn btn-garis btn-kecil" data-ubah-usaha="' + u.id + '">' + ik('sunting') + 'Ubah</button><button class="btn btn-hapus btn-kecil" data-hapus-usaha="' + u.id + '">Hapus</button></div></div></article>';
  }
  var usahaKlikTerpasang = false;
  HAL.usahaPasca = function () {
    $('[data-usaha-baru]').addEventListener('click', function () { formUsaha(); });
    if (!usahaKlikTerpasang) { $('#isi').addEventListener('click', usahaKlik); usahaKlikTerpasang = true; }
  };
  function usahaKlik(ev) {
    var u = ev.target.closest('[data-ubah-usaha]'), h = ev.target.closest('[data-hapus-usaha]');
    if (u) { formUsaha((D.usaha || []).filter(function (x) { return x.id === u.dataset.ubahUsaha; })[0]); return; }
    if (h) {
      var x = (D.usaha || []).filter(function (y) { return y.id === h.dataset.hapusUsaha; })[0];
      if (!x) return;
      konfirmasi('Hapus "' + x.nama + '"?', 'Usaha ini akan hilang dari daftar dan direktori.', 'Hapus', function () { D.usaha = D.usaha.filter(function (y) { return y !== x; }); simpan(); sinkronPublik('usaha'); render(); toast('Usaha dihapus'); });
    }
  }

  function formUsaha(u) {
    var baru = !u; u = u || { jenis: 'Makanan & Minuman', aktif: true };
    modal('<form id="fUsaha"><div class="modal-kepala"><h2 id="modalJudul">' + (baru ? 'Tambah usaha' : 'Ubah usaha') + '</h2><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      bid('uNama', 'Nama usaha (wajib)', '<input id="uNama" name="nama" maxlength="90" value="' + e(u.nama) + '">') +
      '<div class="form-grid">' + bid('uPemilik', 'Pemilik (wajib)', '<input id="uPemilik" name="pemilik" maxlength="60" value="' + e(u.pemilik) + '">') +
      bid('uJenis', 'Jenis', '<select id="uJenis" name="jenis">' + opsi(JENIS_USAHA, u.jenis) + '</select>') + '</div>' +
      bid('uWa', 'No WA (wajib)', '<input id="uWa" name="wa" inputmode="tel" value="' + e(u.wa) + '" placeholder="08xxxxxxxxxx">') +
      bid('uAlamat', 'Alamat (wajib)', '<input id="uAlamat" name="alamat" maxlength="90" value="' + e(u.alamat) + '">') +
      bid('uJam', 'Jam buka (opsional)', '<input id="uJam" name="jam" maxlength="20" value="' + e(u.jam) + '" placeholder="mis. 07:00–17:00">') +
      bid('uKet', 'Keterangan (opsional)', '<input id="uKet" name="ket" maxlength="120" value="' + e(u.ket) + '">') +
      '<label style="display:flex;gap:10px;align-items:center;font-weight:600"><input type="checkbox" name="aktif" style="width:20px;min-height:20px"' + (u.aktif ? ' checked' : '') + '> Usaha aktif (tampil di direktori)</label>' +
      '<div class="modal-kaki"><button type="button" class="btn btn-garis" data-tutup>Batal</button><button class="btn" type="submit">' + ik('cek') + 'Simpan</button></div></form>', function (m) {
      $('#fUsaha', m).addEventListener('submit', function (ev) {
        ev.preventDefault(); var f = ev.target;
        if (!f.nama.value.trim() || !f.pemilik.value.trim() || !waNomor(f.wa.value) || !f.alamat.value.trim()) { (!f.nama.value.trim() ? f.nama : !f.pemilik.value.trim() ? f.pemilik : !waNomor(f.wa.value) ? f.wa : f.alamat).focus(); toast('Nama, pemilik, WA, dan alamat wajib diisi', 'bahaya'); return; }
        var data = { nama: f.nama.value.trim(), pemilik: f.pemilik.value.trim(), jenis: f.jenis.value, wa: waNomor(f.wa.value), alamat: f.alamat.value.trim(), jam: f.jam.value.trim(), ket: f.ket.value.trim(), aktif: f.aktif.checked };
        if (baru) { data.id = idBaru('us'); data.dibuat = hariIni(); D.usaha.push(data); } else Object.assign(u, data);
        simpan(); sinkronPublik('usaha'); tutupModal(); render(); toast('Usaha tersimpan');
      });
    });
  }

  // --- Surat pengantar
  var KEPERLUAN = ['Pembuatan / perpanjangan KTP', 'Pembuatan / perubahan KK', 'Pengurusan SKCK', 'Surat keterangan domisili', 'Surat keterangan tidak mampu (SKTM)', 'Pengantar nikah', 'Pindah domisili', 'Pengurusan akta kelahiran', 'Lainnya'];
  function semuaOrang() { var o = []; D.kk.forEach(function (k) { k.anggota.forEach(function (a, j) { o.push({ kk: k, a: a, kunci: k.id + ':' + j }); }); }); return o; }
  HAL.surat = function () {
    var org = semuaOrang();
    return kepalaHal('Surat pengantar', 'Nomor otomatis · siap cetak A4 dengan kop RT') +
      '<div class="grid grid-2" style="align-items:start"><form class="kartu" id="fSurat"><h2>Buat surat</h2>' +
      bid('sWarga', 'Pilih warga', '<select id="sWarga"><option value="">— ketik/isi manual —</option>' + org.map(function (o) { return '<option value="' + o.kunci + '">' + e(o.a.nama) + ' · ' + e(o.kk.alamat) + '</option>'; }).join('') + '</select>', 'Data terisi otomatis dari data warga') +
      '<div class="form-grid">' + bid('sNama', 'Nama', '<input id="sNama" name="nama" required>') + bid('sNik', 'NIK', '<input id="sNik" name="nik" inputmode="numeric" maxlength="16">') +
      bid('sTempat', 'Tempat lahir', '<input id="sTempat" name="tempatLahir">') + bid('sTgl', 'Tanggal lahir', '<input id="sTgl" type="date" name="tglLahir">') +
      bid('sJk', 'Jenis kelamin', '<select id="sJk" name="jk"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select>') + bid('sAgama', 'Agama', '<select id="sAgama" name="agama">' + opsi(AGAMA, 'Islam') + '</select>') +
      bid('sKawin', 'Status kawin', '<select id="sKawin" name="kawin">' + opsi(KAWIN, 'Kawin') + '</select>') + bid('sKerja', 'Pekerjaan', '<input id="sKerja" name="pekerjaan">') + '</div>' +
      bid('sAlamat', 'Alamat', '<input id="sAlamat" name="alamat">') +
      bid('sPerlu', 'Keperluan', '<select id="sPerlu" name="keperluan">' + opsi(KEPERLUAN) + '</select>') +
      bid('sKet', 'Keterangan tambahan', '<textarea id="sKet" name="ket" placeholder="mis. Untuk melamar pekerjaan"></textarea>') +
      '<p style="color:var(--redup);font-size:13px;margin:0 0 12px">Nomor berikutnya: <b class="mono" style="color:var(--teks)">' + nomorBerikut() + '</b></p>' +
      '<button class="btn" type="submit" style="width:100%">' + ik('surat') + 'Buat & pratinjau surat</button></form>' +
      '<section class="kartu"><h2>Riwayat surat <span class="lencana netral">' + D.surat.length + '</span></h2>' + (D.surat.length ? '<ul class="daftar stagger">' + D.surat.slice().reverse().map(function (s) { return '<li><span class="avatar">' + ik('surat').replace('<svg', '<svg width="20" height="20" style="fill:none;stroke:currentColor;stroke-width:1.9"') + '</span><div class="utama-baris"><b>' + e(s.nama) + '</b><small><span class="mono">' + e(s.no) + '</span> · ' + e(s.keperluan) + '</small></div><button class="btn btn-garis btn-kecil" data-cetak-ulang="' + s.id + '">' + ik('cetak') + 'Buka</button></li>'; }).join('') + '</ul>' : kosong('Belum ada surat dibuat.', 'surat')) + '</section></div>';
  };
  function nomorBerikut() { var th = new Date().getFullYear(), u = D.nomorSurat.tahun === th ? D.nomorSurat.urut + 1 : 1; return String(u).padStart(3, '0') + '/RT' + D.pengaturan.rt + '/RW' + D.pengaturan.rw + '/' + ROMAWI[new Date().getMonth()] + '/' + th; }
  HAL.suratPasca = function () {
    var f = $('#fSurat'), org = semuaOrang();
    $('#sWarga').addEventListener('change', function () {
      var o = org.filter(function (x) { return x.kunci === this.value; }, this)[0]; if (!o) return;
      ['nama', 'nik', 'tempatLahir', 'tglLahir', 'jk', 'agama', 'kawin', 'pekerjaan'].forEach(function (k) { if (f[k]) f[k].value = o.a[k] || ''; });
      f.alamat.value = o.kk.alamat + ', ' + namaRT() + ', Kel. ' + D.pengaturan.kelurahan + ', Kec. ' + D.pengaturan.kecamatan + ', ' + D.pengaturan.kota;
      $$('input,select', f).forEach(function (x) { if (x.value && x.id !== 'sWarga') { x.classList.remove('cap'); void x.offsetWidth; x.classList.add('cap'); } });
    });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!f.nama.value.trim()) { f.nama.focus(); toast('Nama wajib diisi', 'bahaya'); return; }
      var th = new Date().getFullYear();
      if (D.nomorSurat.tahun !== th) D.nomorSurat = { tahun: th, urut: 0 };
      var s = { id: idBaru('sr'), no: nomorBerikut(), tgl: hariIni() };
      ['nama', 'nik', 'tempatLahir', 'tglLahir', 'jk', 'agama', 'kawin', 'pekerjaan', 'alamat', 'keperluan', 'ket'].forEach(function (k) { s[k] = f[k].value.trim(); });
      D.nomorSurat.urut++; D.surat.push(s); simpan();
      catatLog('tambah_surat', 'Surat ' + s.no + ' — ' + s.nama + ' (' + s.keperluan + ')');
      render(); pratinjauSurat(s); toast('Surat ' + s.no + ' dibuat');
    });
    $('#isi').addEventListener('click', function (ev) { var b = ev.target.closest('[data-cetak-ulang]'); if (b) pratinjauSurat(D.surat.filter(function (s) { return s.id === b.dataset.cetakUlang; })[0]); });
  };
  function htmlSurat(s) {
    var p = D.pengaturan, ketua = D.pengurus.filter(function (x) { return /ketua/i.test(x.jabatan); })[0] || { nama: '……………………' };
    var baris = [['Nama', s.nama], ['NIK', s.nik], ['Tempat/Tgl. Lahir', (s.tempatLahir || '-') + ', ' + tglPanjang(s.tglLahir)], ['Jenis Kelamin', s.jk === 'P' ? 'Perempuan' : 'Laki-laki'], ['Agama', s.agama], ['Status Perkawinan', s.kawin], ['Pekerjaan', s.pekerjaan], ['Alamat', s.alamat]];
    return '<div class="surat"><div class="kop">' + (G.logo ? '<img class="kop-logo" src="' + e(G.logo) + '" alt="" onerror="this.nextElementSibling.hidden=false;this.remove()">' : '') + '<svg viewBox="0 0 64 64" aria-hidden="true"' + (G.logo ? ' hidden' : '') + '><circle cx="32" cy="32" r="30" fill="none" stroke="#000" stroke-width="2"/><path d="M14 32 32 17l18 15v17H14z" fill="#000"/><rect x="28" y="37" width="8" height="12" fill="#fff"/></svg><div class="kop-teks"><div class="k1">PENGURUS RUKUN TETANGGA ' + e(p.rt) + ' / RUKUN WARGA ' + e(p.rw) + '</div><div class="k2">' + e(namaUsaha()) + '</div><div class="k3">Kecamatan ' + e(p.kecamatan) + ' · ' + e(p.kota) + (p.provinsi ? ' · ' + e(p.provinsi) : '') + '<br>Sekretariat: ' + e(p.alamat) + '</div></div><div style="width:70px"></div></div>' +
      '<h3>SURAT PENGANTAR</h3><div class="nomor">Nomor: ' + e(s.no) + '</div>' +
      '<p>Yang bertanda tangan di bawah ini, Ketua Rukun Tetangga ' + e(p.rt) + ' Rukun Warga ' + e(p.rw) + ' Kelurahan ' + e(p.kelurahan) + ', Kecamatan ' + e(p.kecamatan) + ', ' + e(p.kota) + ', dengan ini menerangkan bahwa:</p>' +
      '<table>' + baris.map(function (b) { return '<tr><td style="width:150px">' + b[0] + '</td><td>:</td><td>' + e(b[1] || '-') + '</td></tr>'; }).join('') + '</table>' +
      '<p>Orang tersebut benar adalah warga kami yang berdomisili di wilayah RT ' + e(p.rt) + ' / RW ' + e(p.rw) + ' dan berkelakuan baik. Surat pengantar ini diberikan untuk keperluan:</p><p style="text-align:center;font-weight:bold">' + e(s.keperluan) + '</p>' + (s.ket ? '<p>Keterangan: ' + e(s.ket) + '</p>' : '') +
      '<p>Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>' +
      '<div class="ttd"><div><br>Mengetahui,<br>Ketua RW ' + e(p.rw) + '<div class="ruang"></div><b>(………………………………)</b></div><div>' + e(p.kota.replace(/^Kota |^Kabupaten /, '')) + ', ' + tglPanjang(s.tgl) + '<br>Ketua RT ' + e(p.rt) + '<div class="ruang"></div><b><u>' + e(ketua.nama) + '</u></b></div></div></div>';
  }
  function pratinjauSurat(s) {
    modal('<div class="modal-kepala"><div><h2 id="modalJudul">Surat pengantar</h2><p class="mono" style="margin:4px 0 0;color:var(--redup)">' + e(s.no) + '</p></div><button class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div><div class="pratinjau-surat">' + htmlSurat(s) + '</div>' +
      '<div class="modal-kaki"><button class="btn btn-garis" data-tutup>Tutup</button><button class="btn" data-cetak>' + ik('cetak') + 'Cetak / simpan PDF</button></div>', function (m) {
      $('[data-cetak]', m).addEventListener('click', function () { $('#cetak').innerHTML = htmlSurat(s); window.print(); });
    });
  }

  // --- Pengaturan
  HAL.pengaturan = function () {
    var p = D.pengaturan, t = Object.assign({ utama: css('--tema-utama'), aksen: css('--tema-aksen'), radius: parseInt(css('--tema-radius'), 10), font: css('--tema-font').split(',')[0].replace(/"/g, '').trim(), mode: TEMA.mode, nama: TEMA.nama }, tampilan);
    return kepalaHal('Pengaturan', 'Identitas RT, tampilan, dan data') +
      '<div class="grid grid-2" style="align-items:start"><div class="tumpuk">' +
      '<form class="kartu" id="fIdentitas"><h2>Identitas RT</h2><div class="form-grid">' +
      bid('pRt', 'Nomor RT', '<input id="pRt" name="rt" value="' + e(p.rt) + '" maxlength="3">') + bid('pRw', 'Nomor RW', '<input id="pRw" name="rw" value="' + e(p.rw) + '" maxlength="3">') +
      bid('pKel', 'Kelurahan / desa', '<input id="pKel" name="kelurahan" value="' + e(p.kelurahan) + '">') + bid('pKec', 'Kecamatan', '<input id="pKec" name="kecamatan" value="' + e(p.kecamatan) + '">') +
      bid('pKota', 'Kota / kabupaten', '<input id="pKota" name="kota" value="' + e(p.kota) + '">') + bid('pProv', 'Provinsi', '<input id="pProv" name="provinsi" value="' + e(p.provinsi) + '">') + '</div>' +
      bid('pAlamat', 'Alamat sekretariat', '<input id="pAlamat" name="alamat" value="' + e(p.alamat) + '">') +
      '<div class="form-grid">' + bid('pIuran', 'Iuran per bulan (Rp)', '<input id="pIuran" name="iuran" inputmode="numeric" value="' + e(p.iuran) + '">') + bid('pMulai', 'Iuran dihitung sejak', '<input id="pMulai" name="iuranMulai" type="month" value="' + e(p.iuranMulai) + '">') + '</div>' +
      bid('pBayar', 'Cara bayar (muncul di pesan pengingat)', '<textarea id="pBayar" name="caraBayar">' + e(p.caraBayar) + '</textarea>') +
      '<button class="btn" type="submit">' + ik('cek') + 'Simpan identitas</button></form>' +
      '<section class="kartu"><h2>Pengurus <button class="btn btn-garis btn-kecil" id="tambahPengurus">' + ik('tambah') + 'Tambah</button></h2><div id="daftarPengurus"></div><button class="btn" id="simpanPengurus" style="margin-top:12px">' + ik('cek') + 'Simpan pengurus</button></section>' +
      '</div><div class="tumpuk">' +
      '<section class="kartu"><h2>No Telp Penting <button class="btn btn-garis btn-kecil" id="tambahTelp">' + ik('tambah') + 'Tambah nomor</button></h2><div id="daftarTelp"></div><button class="btn" id="simpanTelp" style="margin-top:12px">' + ik('cek') + 'Simpan no telp penting</button></section>' +
      '<form class="kartu" id="fTampilan"><h2>Tampilan</h2>' + bid('tNama', 'Nama di kop & judul', '<input id="tNama" name="nama" value="' + e(t.nama) + '">') +
      '<div class="form-grid">' + bid('tUtama', 'Warna utama', '<input id="tUtama" name="utama" type="color" value="' + hex(t.utama) + '">', 'Pilih warna cukup gelap agar teks putih terbaca') + bid('tAksen', 'Warna aksen', '<input id="tAksen" name="aksen" type="color" value="' + hex(t.aksen) + '">') +
      bid('tFont', 'Huruf', '<select id="tFont" name="font">' + opsi(FONT, t.font) + '</select>') + bid('tMode', 'Mode', '<select id="tMode" name="mode"><option value="auto"' + (t.mode === 'auto' ? ' selected' : '') + '>Ikuti perangkat</option><option value="terang"' + (t.mode === 'terang' ? ' selected' : '') + '>Terang</option><option value="gelap"' + (t.mode === 'gelap' ? ' selected' : '') + '>Gelap</option></select>') + '</div>' +
      bid('tRadius', 'Sudut membulat: <output id="oRadius">' + t.radius + 'px</output>', '<input id="tRadius" name="radius" type="range" min="0" max="24" value="' + t.radius + '" style="padding:0">') +
      '<div class="baris-aksi"><button class="btn" type="submit">' + ik('cek') + 'Simpan tampilan</button><button class="btn btn-garis" type="button" id="resetTampilan">Kembalikan bawaan</button></div></form>' +
      '<section class="kartu"><h2>Data & cadangan</h2><p style="color:var(--redup);margin:0 0 12px;font-size:14px">Data tersimpan di browser perangkat ini. Rutin unduh cadangan JSON supaya aman.</p><div class="baris-aksi" style="margin-bottom:10px">' +
      '<button class="btn" id="cadangan">' + ik('unduh') + 'Unduh cadangan JSON</button><label class="btn btn-garis" for="impJson" style="margin:0">' + ik('unggah') + 'Pulihkan JSON</label><input type="file" id="impJson" accept=".json,application/json" class="sr"></div>' +
      '<div class="baris-aksi" style="margin-bottom:10px"><button class="btn btn-garis btn-kecil" data-csv="warga">CSV warga</button><button class="btn btn-garis btn-kecil" data-csv="kas">CSV kas</button><button class="btn btn-garis btn-kecil" data-csv="iuran">CSV iuran</button>' +
      '<label class="btn btn-garis btn-kecil" for="impWarga" style="margin:0">Impor CSV warga</label><input type="file" id="impWarga" accept=".csv,text/csv" class="sr"><label class="btn btn-garis btn-kecil" for="impKas" style="margin:0">Impor CSV kas</label><input type="file" id="impKas" accept=".csv,text/csv" class="sr"></div>' +
      '<div class="baris-aksi"><button class="btn btn-garis btn-kecil" id="isiContoh">Muat data contoh</button><button class="btn btn-hapus btn-kecil" id="kosongkan">Kosongkan semua data</button></div></section></div></div>';
  };
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function hex(c) { if (/^#[0-9a-f]{6}$/i.test(c)) return c; var x = document.createElement('canvas').getContext('2d'); x.fillStyle = c; return x.fillStyle; }
  function gambarPengurus() {
    $('#daftarPengurus').innerHTML = D.pengurus.map(function (p, i) {
      return '<div class="anggota-baris" data-pengurus><div class="kepala-baris"><span>' + e(p.jabatan || 'Pengurus') + '</span><button type="button" class="btn btn-hapus btn-kecil" data-hapus-pengurus="' + i + '">Hapus</button></div><div class="form-grid">' +
        bid('pj' + i, 'Jabatan', '<input id="pj' + i + '" name="jabatan" value="' + e(p.jabatan) + '">') + bid('pn' + i, 'Nama', '<input id="pn' + i + '" name="nama" value="' + e(p.nama) + '">') + bid('pw' + i, 'WhatsApp', '<input id="pw' + i + '" name="wa" inputmode="tel" value="' + e(p.wa) + '">') + '</div></div>';
    }).join('') || kosong('Belum ada pengurus.', 'warga');
  }
  function bacaPengurus() { return $$('[data-pengurus]').map(function (b) { return { jabatan: $('[name=jabatan]', b).value.trim(), nama: $('[name=nama]', b).value.trim(), wa: waNomor($('[name=wa]', b).value) }; }); }
  // --- No Telp Penting di Pengaturan (meniru pola Pengurus; data dari D.telpPenting)
  // telpIdTersimpan: id baris yang SUDAH tersimpan (diisi saat Pengaturan dibuka,
  // diperbarui hanya di handler Simpan) — penentu konfirmasi hapus.
  var telpIdTersimpan = {};
  function gambarTelp() {
    $('#daftarTelp').innerHTML = (D.telpPenting || []).map(function (t, i) {
      return '<div class="anggota-baris" data-telp data-telp-id="' + e(t.id || '') + '"><div class="kepala-baris"><span>' + e(t.nama || 'Nomor baru') + '</span><button type="button" class="btn btn-hapus btn-kecil" data-hapus-telp="' + i + '">Hapus</button></div><div class="form-grid">' +
        bid('tn' + i, 'Nama layanan', '<input id="tn' + i + '" name="nama" value="' + e(t.nama) + '">') + bid('tno' + i, 'Nomor', '<input id="tno' + i + '" name="nomor" inputmode="tel" value="' + e(t.nomor) + '">') + bid('tk' + i, 'Keterangan', '<input id="tk' + i + '" name="ket" value="' + e(t.ket) + '">') +
        bid('tj' + i, 'Jenis', '<select id="tj' + i + '" name="jenis"><option value="nasional"' + (t.jenis === 'nasional' ? ' selected' : '') + '>Nasional</option><option value="lokal"' + (t.jenis === 'lokal' ? ' selected' : '') + '>Lokal</option></select>') + '</div></div>';
    }).join('') || kosong('Belum ada nomor.', 'telepon');
  }
  function bacaTelp() {
    return $$('[data-telp]').map(function (b) {
      return { id: b.dataset.telpId || idBaru('tp'), nama: $('[name=nama]', b).value.trim(), nomor: String($('[name=nomor]', b).value).replace(/\D/g, ''), ket: $('[name=ket]', b).value.trim(), jenis: $('[name=jenis]', b).value === 'lokal' ? 'lokal' : 'nasional' };
    });
  }
  HAL.pengaturanPasca = function () {
    gambarPengurus();
    gambarTelp();
    telpIdTersimpan = {};
    (D.telpPenting || []).forEach(function (t) { if (t.id) telpIdTersimpan[t.id] = true; });
    $('#fIdentitas').addEventListener('submit', function (ev) {
      ev.preventDefault(); var f = ev.target;
      ['rt', 'rw', 'kelurahan', 'kecamatan', 'kota', 'provinsi', 'alamat', 'iuranMulai', 'caraBayar'].forEach(function (k) { D.pengaturan[k] = f[k].value.trim(); });
      D.pengaturan.iuran = Number(String(f.iuran.value).replace(/\D/g, '')) || 0;
      simpan(); toast('Identitas RT disimpan'); render();
    });
    $('#tambahPengurus').addEventListener('click', function () { D.pengurus = bacaPengurus(); D.pengurus.push({ jabatan: '', nama: '', wa: '' }); gambarPengurus(); $('#daftarPengurus [data-pengurus]:last-child input').focus(); });
    $('#daftarPengurus').addEventListener('click', function (ev) { var b = ev.target.closest('[data-hapus-pengurus]'); if (b) { D.pengurus = bacaPengurus(); D.pengurus.splice(+b.dataset.hapusPengurus, 1); gambarPengurus(); } });
    $('#simpanPengurus').addEventListener('click', function () { D.pengurus = bacaPengurus().filter(function (p) { return p.nama; }); simpan(); gambarPengurus(); toast('Pengurus disimpan'); });
    $('#tambahTelp').addEventListener('click', function () { D.telpPenting = bacaTelp(); D.telpPenting.push({ id: idBaru('tp'), nama: '', nomor: '', ket: '', jenis: 'lokal' }); gambarTelp(); $('#daftarTelp [data-telp]:last-child input').focus(); });
    $('#daftarTelp').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-hapus-telp]'); if (!b) return;
      var baris = b.closest('[data-telp]');
      var tersimpan = baris && baris.dataset.telpId && telpIdTersimpan[baris.dataset.telpId];
      var hapus = function () { D.telpPenting = bacaTelp(); D.telpPenting.splice(+b.dataset.hapusTelp, 1); gambarTelp(); };
      if (tersimpan) konfirmasi('Hapus nomor ini?', 'Nomor "' + ($('[name=nama]', baris).value.trim() || 'tanpa nama') + '" akan dihapus dari daftar. Perubahan baru tersimpan sesudah Anda menekan "Simpan no telp penting".', 'Hapus', hapus);
      else hapus();
    });
    $('#simpanTelp').addEventListener('click', function () {
      var daftar = bacaTelp().filter(function (t) { return t.nama && t.nomor; });
      if (!daftar.length) { toast('Isi minimal 1 nomor', 'bahaya'); return; }
      D.telpPenting = daftar; telpIdTersimpan = {}; daftar.forEach(function (t) { telpIdTersimpan[t.id] = true; }); simpan(); sinkronPublik('telp_penting'); gambarTelp(); toast('No telp penting disimpan');
    });

    var fT = $('#fTampilan');
    function bacaT() { return { nama: fT.nama.value.trim() || TEMA.nama, utama: fT.utama.value, aksen: fT.aksen.value, font: fT.font.value, mode: fT.mode.value, radius: fT.radius.value }; }
    fT.addEventListener('input', function () { $('#oRadius').textContent = fT.radius.value + 'px'; terapkan(bacaT()); });
    fT.addEventListener('submit', function (ev) { ev.preventDefault(); tampilan = bacaT(); try { localStorage.setItem(KUNCI_TAMPILAN, JSON.stringify(tampilan)); } catch (x) {} toast('Tampilan disimpan'); });
    $('#resetTampilan').addEventListener('click', function () { try { localStorage.removeItem(KUNCI_TAMPILAN); } catch (x) {} tampilan = {}; document.documentElement.removeAttribute('style'); terapkan({ mode: TEMA.mode, nama: TEMA.nama, font: 'Nunito' }); render(); toast('Tampilan kembali ke bawaan'); });

    $('#cadangan').addEventListener('click', function () { unduh('cadangan-rt-' + hariIni() + '.json', JSON.stringify(D, null, 2), 'application/json'); toast('Cadangan diunduh'); });
    $('#impJson').addEventListener('change', function () {
      bacaBerkas(this, function (teks) {
        var d; try { d = JSON.parse(teks); } catch (x) { toast('Berkas JSON tidak valid', 'bahaya'); return; }
        if (!d || !d.pengaturan || !Array.isArray(d.kk)) { toast('Ini bukan cadangan Website RT', 'bahaya'); return; }
        konfirmasi('Pulihkan cadangan?', 'Data sekarang (' + D.kk.length + ' KK) akan diganti dengan isi cadangan (' + d.kk.length + ' KK).', 'Pulihkan', function () { D = migrasi(d); simpan(); render(); toast('Cadangan dipulihkan'); }, true);
      });
    });
    $('#impWarga').addEventListener('change', function () { bacaBerkas(this, imporWarga); });
    $('#impKas').addEventListener('change', function () { bacaBerkas(this, imporKas); });
    $('#isiContoh').addEventListener('click', function () { konfirmasi('Muat data contoh?', 'Semua data sekarang diganti data contoh RT 07/RW 13. Unduh cadangan dulu kalau perlu.', 'Muat contoh', function () { D = migrasi(window.buatDataContoh()); simpan(); render(); toast('Data contoh dimuat'); }); });
    $('#kosongkan').addEventListener('click', function () {
      konfirmasi('Kosongkan semua data?', 'Data warga, iuran, kas, info, dan surat dihapus dari perangkat ini. Identitas RT tetap. Tindakan ini tidak bisa dibatalkan.', 'Kosongkan', function () {
        D = migrasi({ pengaturan: D.pengaturan, pengurus: D.pengurus }); simpan(); render(); toast('Semua data dikosongkan');
      });
    });
  };

  /* ========== 6b. Auth publik & Akun saya (PIN/akun Supabase) ========== */
  var TITEL_PUBLIK = { masuk: 'Masuk panel pengurus', 'daftar-wilayah': 'Daftarkan wilayah', disclaimer: 'Disclaimer', 'lupa-pin': 'Lupa PIN', 'rw-publik': 'Halaman RW' };
  var HALPUB = {};
  /* Kartu sempit di tengah, pakai komponen yang sudah ada (.kartu, .form-grid,
     .bidang, .btn, .lencana) — tanpa gaya baru. */
  function kartuAuth(judul, sub, isiHtml) {
    return '<div style="max-width:560px;margin:0 auto"><a class="btn btn-garis btn-kecil" href="#/">' + ik('kiri') + 'Beranda</a>' +
      '<div class="kartu" style="margin-top:16px"><h1 style="font-size:22px;margin-bottom:6px">' + judul + '</h1>' +
      (sub ? '<p style="color:var(--redup);margin:0 0 16px">' + sub + '</p>' : '') + isiHtml + '</div></div>';
  }

  /* --- Masuk baru: tab peran (Superadmin / Pengurus RT-RW). Tab Pengurus:
     wilayah -> nama -> PIN (verifikasi_pin). Tab Superadmin: nama (dari RPC
     daftar_superadmin_aktif) -> PIN, tanpa pilih wilayah. PIN salah:
     "PIN salah, coba lagi". PIN lama 1234 TIDAK berlaku lagi. --- */
  HALPUB.masuk = function () {
    return kartuAuth('Masuk panel pengurus', 'Pilih peran Anda, lalu masuk dengan PIN.',
      '<div class="tab-peran" role="tablist"><button type="button" class="tab-peran-tombol" id="tabMasukPengurus" role="tab" aria-selected="true">Pengurus RT/RW</button><button type="button" class="tab-peran-tombol" id="tabMasukSuper" role="tab" aria-selected="false">Superadmin</button></div>' +
      '<form id="fMasuk"><div id="panelPengurus" role="tabpanel"><div class="form-grid">' +
      bid('mWilayah', 'Wilayah', '<select id="mWilayah" name="wilayah"><option value="">Memuat wilayah…</option></select>') +
      bid('mNama', 'Nama pengurus', '<select id="mNama" name="nama" disabled><option value="">Pilih wilayah dulu</option></select>') + '</div>' +
      bid('mPin', 'PIN (4–6 angka)', '<input id="mPin" name="pin" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password">') + '</div>' +
      '<div id="panelSuper" role="tabpanel" hidden><div class="form-grid">' +
      bid('mNamaSuper', 'Nama Superadmin', '<select id="mNamaSuper" name="namaSuper"><option value="">Memuat…</option></select>') +
      bid('mPinSuper', 'PIN (4–6 angka)', '<input id="mPinSuper" name="pinSuper" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password">') + '</div></div>' +
      '<p id="galatMasuk" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
      '<button class="btn" type="submit">' + ik('kunci') + 'Masuk panel</button></form>' +
      '<div class="baris-aksi" style="margin-top:16px"><a class="btn btn-garis btn-kecil" href="#/lupa-pin">Lupa PIN</a></div>' +
      '<p style="color:var(--redup);font-size:13px;margin:14px 0 0">Wilayah belum terdaftar? <a href="#/daftar-wilayah">Daftarkan wilayah RT/RW</a>.</p>');
  };
  HALPUB.masukPasca = function () {
    var f = $('#fMasuk'), galat = $('#galatMasuk'), daftarSuper = [];
    /* Tab peran: default Pengurus. */
    var tabPengurus = $('#tabMasukPengurus'), tabSuper = $('#tabMasukSuper');
    var pilihTab = function (superAktif) {
      tabPengurus.setAttribute('aria-selected', superAktif ? 'false' : 'true');
      tabSuper.setAttribute('aria-selected', superAktif ? 'true' : 'false');
      $('#panelPengurus').hidden = superAktif;
      $('#panelSuper').hidden = !superAktif;
      galat.textContent = '';
    };
    tabPengurus.addEventListener('click', function () { pilihTab(false); });
    tabSuper.addEventListener('click', function () { pilihTab(true); });
    muatWilayah().then(function () {
      aturHtml('mWilayah', opsiWilayah(''));
      pasangPencarianSelect($('#mWilayah'));
      catatOpsiPenuh($('#mWilayah'));
    })
      .catch(function () {
        aturHtml('mWilayah', '<option value="">Tidak bisa memuat wilayah</option>');
        catatOpsiPenuh($('#mWilayah'));
        if (galat) galat.textContent = 'Tidak bisa terhubung ke server. Periksa internet lalu muat ulang halaman.';
      });
    sbRpc('daftar_superadmin_aktif', {}).then(function (rows) {
      daftarSuper = rows || [];
      aturHtml('mNamaSuper', daftarSuper.length ? '<option value="">— Pilih nama —</option>' + daftarSuper.map(function (p) {
        return '<option value="' + e(p.nama) + '">' + e(p.nama) + ' — ' + e(p.jabatan) + '</option>';
      }).join('') : '<option value="">Belum ada Superadmin aktif</option>');
    }).catch(function () { aturHtml('mNamaSuper', '<option value="">Gagal memuat daftar nama</option>'); });
    $('#mWilayah').addEventListener('change', function () {
      var w = this.value, sel = $('#mNama');
      sel.innerHTML = '<option value="">Memuat…</option>'; sel.disabled = true;
      if (!w) { sel.innerHTML = '<option value="">Pilih wilayah dulu</option>'; return; }
      sbRpc('daftar_pengurus_aktif', { p_wilayah_id: w }).then(function (rows) {
        rows = rows || [];
        sel.innerHTML = rows.length ? '<option value="">— Pilih nama —</option>' + rows.map(function (p) {
          return '<option value="' + e(p.nama) + '">' + e(p.nama) + ' — ' + e(p.jabatan) + '</option>';
        }).join('') : '<option value="">Belum ada pengurus aktif di wilayah ini</option>';
        sel.disabled = !rows.length;
      }).catch(function () { sel.innerHTML = '<option value="">Gagal memuat daftar nama</option>'; });
    });
    var tanganiMasuk = function (rows, inputPin) {
      var p = (rows || [])[0];
      if (!p) { galat.textContent = 'PIN salah, coba lagi.'; inputPin.value = ''; inputPin.focus(); return; }
      terbuka = true;
      try { sessionStorage.setItem('website-rt-buka', '1'); } catch (x) {}
      /* verifikasi_pin mengembalikan token sesi (64 hex, 8 jam) — simpan
         di sessionStorage bersama data sesi, JANGAN di localStorage. */
      tokenTervalidasiUntuk = p.token || '';
      simpanSesi({ id: p.id, nama: p.nama, jabatan: p.jabatan, peran: p.peran, wilayah_id: p.wilayah_id, pin_sementara: !!p.pin_sementara, token: p.token || '' });
      catatLog('masuk', 'Masuk panel');
      toast('Selamat datang, ' + p.nama);
      location.hash = '#/panel/ringkas';
    };
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      galat.textContent = '';
      if (tabSuper.getAttribute('aria-selected') === 'true') {
        var namaS = $('#mNamaSuper').value, pinS = $('#mPinSuper').value;
        if (!namaS) { galat.textContent = 'Pilih nama Anda.'; return; }
        if (!/^\d{4,6}$/.test(pinS)) { galat.textContent = 'PIN harus 4–6 angka.'; $('#mPinSuper').focus(); return; }
        var baris = daftarSuper.filter(function (x) { return x.nama === namaS; })[0];
        if (!baris) { galat.textContent = 'Nama tidak ditemukan.'; return; }
        sbRpc('verifikasi_pin', { p_nama: namaS, p_pin: pinS, p_wilayah_id: baris.wilayah_id })
          .then(function (rows) { tanganiMasuk(rows, $('#mPinSuper')); })
          .catch(function () { galat.textContent = 'Tidak bisa terhubung ke server. Coba lagi.'; });
        return;
      }
      var w = f.wilayah.value, nama = f.nama.value, pin = f.pin.value;
      if (!w) { galat.textContent = 'Pilih wilayah dulu.'; return; }
      if (!nama) { galat.textContent = 'Pilih nama Anda.'; return; }
      if (!/^\d{4,6}$/.test(pin)) { galat.textContent = 'PIN harus 4–6 angka.'; $('#mPin').focus(); return; }
      sbRpc('verifikasi_pin', { p_nama: nama, p_pin: pin, p_wilayah_id: w })
        .then(function (rows) { tanganiMasuk(rows, $('#mPin')); })
        .catch(function () { galat.textContent = 'Tidak bisa terhubung ke server. Coba lagi.'; });
    });
  };

  /* --- Pendaftaran wilayah + Ketua GABUNG (v5): satu RPC
     daftar_wilayah_pengurus, TANPA PIN dan TANPA kode verifikasi. Ketua
     tidak bisa masuk sebelum wilayah disetujui; PIN sementara + kode
     pemulihan dibuat server saat penyetuju klik Setujui. --- */
  HALPUB['daftar-wilayah'] = function () {
    return kartuAuth('Daftarkan wilayah', 'RT atau RW baru. Pendaftaran menunggu persetujuan \u2014 RW memverifikasi RT di bawahnya, atau Superadmin bila RW belum ada.',
      '<form id="fWilayah">' +
      '<h2 style="font-size:16px;margin:0 0 12px">Data wilayah</h2><div class="form-grid">' +
      bid('wJenis', 'Jenis wilayah', '<select id="wJenis" name="jenis"><option value="rt">RT</option><option value="rw">RW</option></select>') +
      bid('wNomor', 'Nomor (contoh: 07)', '<input id="wNomor" name="nomor" maxlength="3" inputmode="numeric">') +
      bid('wKel', 'Kelurahan / desa', '<input id="wKel" name="kelurahan">') +
      bid('wKec', 'Kecamatan', '<input id="wKec" name="kecamatan">') +
      bid('wKota', 'Kota / kabupaten', '<input id="wKota" name="kota">') +
      bid('wProv', 'Provinsi', '<input id="wProv" name="provinsi">') + '</div>' +
      '<div id="wadahRwInduk"><div class="form-grid">' +
      bid('wRw', 'RW induk', '<select id="wRw" name="rw"><option value="">Memuat RW\u2026</option></select>') + '</div>' +
      '<p id="catatanRw" style="color:var(--redup);font-size:13px;margin:0 0 14px"></p></div>' +
      '<h2 style="font-size:16px;margin:0 0 12px">Data Ketua (yang mengajukan)</h2><div class="form-grid">' +
      bid('wKetua', 'Nama Ketua', '<input id="wKetua" name="ketua" autocomplete="off">') +
      bid('wWa', 'WA Ketua', '<input id="wWa" name="wa" inputmode="tel" placeholder="0812\u2026">') +
      bid('wEmail', 'Email Ketua', '<input id="wEmail" name="email" type="email" placeholder="nama@email.com">') + '</div>' +
      '<label style="display:flex;gap:8px;align-items:flex-start;margin:4px 0 14px"><input type="checkbox" id="wSetuju" style="width:20px;height:20px;margin-top:2px;flex:none"> <span>Saya setuju dengan <a href="#/disclaimer">disclaimer</a>.</span></label>' +
      '<p id="galatWilayah" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
      '<button class="btn" type="submit">' + ik('cek') + 'Kirim pendaftaran wilayah</button></form>' +
      '<div id="hasilWilayah"></div>');
  };
  HALPUB['daftar-wilayahPasca'] = function () {
    var f = $('#fWilayah'), galat = $('#galatWilayah');
    muatWilayah().then(function (semua) {
      var rw = semua.filter(function (w) { return w.jenis === 'rw'; });
      aturHtml('wRw', rw.length ? '<option value="">\u2014 Pilih RW induk \u2014</option>' + rw.map(function (w) {
        return '<option value="' + e(w.id) + '">' + e(labelWilayah(w)) + '</option>';
      }).join('') : '<option value="">Belum ada RW</option>');
      pasangPencarianSelect($('#wRw'));
      catatOpsiPenuh($('#wRw'));
      var ct = $('#catatanRw'); if (ct) ct.textContent = rw.length ? '' : 'RW belum ada \u2014 persetujuan oleh Superadmin.';
    }).catch(function () {
      aturHtml('wRw', '<option value="">Tidak bisa memuat RW</option>');
      pasangPencarianSelect($('#wRw'));
      catatOpsiPenuh($('#wRw'));
    });
    $('#wJenis').addEventListener('change', function () {
      $('#wadahRwInduk').style.display = this.value === 'rt' ? '' : 'none';
    });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      galat.textContent = '';
      var jenis = f.jenis.value, nomor = f.nomor.value.trim(), kel = f.kelurahan.value.trim(),
        kec = f.kecamatan.value.trim(), kota = f.kota.value.trim(), prov = f.provinsi.value.trim(),
        ketua = f.ketua.value.trim(), wa = f.wa.value.trim(), email = f.email.value.trim(),
        rwId = f.jenis.value === 'rt' ? f.rw.value : '';
      if (!/^\d{1,3}$/.test(nomor)) { galat.textContent = 'Nomor wilayah wajib diisi (angka).'; $('#wNomor').focus(); return; }
      if (!kel) { galat.textContent = 'Kelurahan wajib diisi.'; $('#wKel').focus(); return; }
      if (!ketua) { galat.textContent = 'Nama Ketua wajib diisi.'; $('#wKetua').focus(); return; }
      if (!wa) { galat.textContent = 'WA Ketua wajib diisi.'; $('#wWa').focus(); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { galat.textContent = 'Format email Ketua tidak benar.'; $('#wEmail').focus(); return; }
      if (!$('#wSetuju').checked) { galat.textContent = 'Centang persetujuan disclaimer dulu.'; return; }
      var rwDipilih = rwId ? cariWilayah(rwId) : null;
      sbRpc('daftar_wilayah_pengurus', {
        p_jenis: jenis, p_nomor: nomor, p_kelurahan: kel, p_kecamatan: kec, p_kota: kota, p_provinsi: prov,
        p_ketua_nama: ketua, p_ketua_wa: waNomor(wa), p_ketua_email: email, p_rw_induk_id: rwId || null
      }).then(function () {
        f.style.display = 'none';
        aturHtml('hasilWilayah', '<div style="text-align:center;padding:8px 0"><span class="lencana">Menunggu persetujuan</span>' +
          '<p style="margin:14px 0 6px">Pendaftaran <b>' + e(jenis === 'rt' ? 'RT ' + nomor : 'RW ' + nomor) + ' Kel. ' + e(kel) + '</b> sudah dikirim.</p>' +
          '<p style="color:var(--redup)">Sesudah disetujui, PIN sementara + kode pemulihan Ketua dikirim penyetuju lewat WhatsApp.</p>' +
          '<div id="waPengajuan"></div>' +
          '<div class="baris-aksi" style="justify-content:center;margin-top:14px"><a class="btn" href="#/">Kembali ke beranda</a></div></div>');
        var tampilWa = function (waPenyetuju, teks, namaPenyetuju) {
          var wadah = $('#waPengajuan'); if (!wadah) return;
          if (!waPenyetuju) {
            wadah.innerHTML = '<p style="color:var(--redup)">Pengajuan sudah tersimpan. Penyetuju bisa melihatnya di panel \u2014 hubungi langsung bila perlu.</p>';
            return;
          }
          wadah.innerHTML = '<p style="margin:12px 0 10px">Beri tahu penyetuju (' + e(namaPenyetuju) + ') lewat WhatsApp:</p>' +
            '<p style="background:var(--permukaan-2);border:1px solid var(--garis);border-radius:12px;padding:12px;margin:0 0 12px;text-align:left">\u201c' + e(teks) + '\u201d</p>' +
            '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waLink(waPenyetuju, teks) + '">' + ik('wa') + 'Buka WhatsApp ke penyetuju</a>';
        };
        if (jenis === 'rt' && rwDipilih) {
          var namaRw = rwDipilih.ketua_nama || ('RW ' + rwDipilih.nomor);
          tampilWa(rwDipilih.ketua_wa, pesanPengajuanWilayah('rt', ketua, nomor, kel, namaRw), namaRw);
        } else {
          sbRpc('wa_superadmin', {}).then(function (waSuper) {
            tampilWa(waSuper || '', pesanPengajuanWilayah(jenis, ketua, nomor, kel, 'Masdan'), 'Superadmin (Masdan)');
          }).catch(function () { tampilWa('', '', 'Superadmin (Masdan)'); });
        }
      }).catch(function (x) { galat.textContent = (x && x.message) || 'Pendaftaran gagal. Coba lagi.'; });
    });
  };

  /* --- Lupa PIN: WA ke Pak RT (format siap kirim, gratis) + pakai kode
     pemulihan lewat RPC wilayah (nama + wilayah_id, bukan nama saja). --- */
  HALPUB['lupa-pin'] = function () {
    return kartuAuth('Lupa PIN', 'Minta reset lewat WhatsApp, atau pakai kode pemulihan Anda.',
      '<div class="form-grid">' +
      bid('lWilayah', 'Wilayah', '<select id="lWilayah"><option value="">Memuat wilayah…</option></select>') +
      bid('lNama', 'Nama pengurus', '<select id="lNama" disabled><option value="">Pilih wilayah dulu</option></select>') + '</div>' +
      '<div id="lupaWa"></div>' +
      '<hr style="border:none;border-top:1px solid var(--garis);margin:18px 0">' +
      '<h2 style="font-size:16px;margin:0 0 12px">Pakai kode pemulihan</h2>' +
      '<form id="fPulih"><div class="form-grid">' +
      bid('lKode', 'Kode pemulihan', '<input id="lKode" name="kode" autocomplete="off" style="text-transform:uppercase">') +
      bid('lPin', 'PIN baru (4–6 angka)', '<input id="lPin" name="pin" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password">') +
      bid('lPin2', 'Ketik ulang PIN baru', '<input id="lPin2" name="pin2" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password">') + '</div>' +
      '<p id="galatPulih" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
      '<button class="btn" type="submit">Buat PIN baru</button></form>' +
      '<p style="color:var(--redup);font-size:13px;margin:14px 0 0">Kode pemulihan hanya tampil sekali saat dibuat. Bila kode sudah dipakai, minta reset lewat WhatsApp di atas.</p>');
  };
  HALPUB['lupa-pinPasca'] = function () {
    var galat = $('#galatPulih'), daftarNama = [], waSuperadmin = '';
    /* Nomor WA Superadmin diambil sekali saat halaman dimuat (RPC
       wa_superadmin, publik by design) — dipakai Tier 2 di gambarWa. */
    sbRpc('wa_superadmin', {}).then(function (wa) { waSuperadmin = wa || ''; gambarWa(); }).catch(function () {});
    /* Cache daftar wilayah satu sesi SPA bisa basi bila ketua_wa diubah
       dari luar sesi ini — segarkan dulu sebelum tampilkan nomor/form. */
    segarkanWilayah();
    muatWilayah().then(function () {
      aturHtml('lWilayah', opsiWilayah(''));
      pasangPencarianSelect($('#lWilayah'));
      catatOpsiPenuh($('#lWilayah'));
    })
      .catch(function () {
        aturHtml('lWilayah', '<option value="">Tidak bisa memuat wilayah</option>');
        catatOpsiPenuh($('#lWilayah'));
      });
    /* WA reset per tier (v5): Tier 3 pengurus -> WA Ketua wilayah;
       Tier 2 admin_rt/admin_rw -> WA Superadmin (RPC wa_superadmin);
       Tier 1 superadmin -> TANPA WA, hanya kode pemulihan. */
    function gambarWa() {
      var w = cariWilayah($('#lWilayah').value), nama = $('#lNama').value, wadah = $('#lupaWa');
      if (!wadah) return;
      if (!w || !nama) { wadah.innerHTML = ''; return; }
      var p = daftarNama.filter(function (x) { return x.nama === nama; })[0] || { jabatan: 'Pengurus', peran: 'pengurus' };
      if (p.peran === 'superadmin') {
        wadah.innerHTML = '<p style="color:var(--redup)">Superadmin tidak bisa minta reset ke siapa pun. Pakai kode pemulihan di bawah ini. Bila kode hilang, hubungi Budi untuk dibuatkan kode baru lewat dashboard.</p>';
        return;
      }
      if (p.peran === 'admin_rt' || p.peran === 'admin_rw') {
        if (!waSuperadmin) {
          wadah.innerHTML = '<p style="color:var(--bahaya);font-weight:700">Nomor WA Superadmin belum diisi — hubungi Masdan langsung</p>';
          return;
        }
        var teksS = pesanLupaPinSuperadmin(nama, p.jabatan, w);
        wadah.innerHTML = '<p style="margin:0 0 10px">Pesan WhatsApp siap kirim ke Superadmin (Masdan):</p>' +
          '<p style="background:var(--permukaan-2);border:1px solid var(--garis);border-radius:12px;padding:12px;margin:0 0 12px">“' + e(teksS) + '”</p>' +
          '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waLink(waSuperadmin, teksS) + '">' + ik('wa') + 'Buka WhatsApp ke Superadmin</a>';
        return;
      }
      if (!w.ketua_wa) {
        wadah.innerHTML = '<p style="color:var(--bahaya);font-weight:700">Nomor WA Pak RT belum diisi di data wilayah — hubungi Pak RT langsung untuk minta reset PIN.</p>' +
          '<p style="color:var(--redup)">Bila kode pemulihan Anda masih ada, pakai formulir di bawah untuk membuat PIN baru tanpa menunggu Pak RT.</p>';
        return;
      }
      var teks = pesanLupaPin(nama, p.jabatan, w);
      wadah.innerHTML = '<p style="margin:0 0 10px">Pesan WhatsApp siap kirim ke Pak RT (' + e(w.ketua_nama || 'Ketua RT') + '):</p>' +
        '<p style="background:var(--permukaan-2);border:1px solid var(--garis);border-radius:12px;padding:12px;margin:0 0 12px">“' + e(teks) + '”</p>' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waLink(w.ketua_wa, teks) + '">' + ik('wa') + 'Buka WhatsApp ke Pak RT</a>';
    }
    $('#lWilayah').addEventListener('change', function () {
      var w = this.value, sel = $('#lNama');
      sel.innerHTML = '<option value="">Memuat…</option>'; sel.disabled = true; daftarNama = []; gambarWa();
      if (!w) { sel.innerHTML = '<option value="">Pilih wilayah dulu</option>'; return; }
      sbRpc('daftar_pengurus_aktif', { p_wilayah_id: w }).then(function (rows) {
        daftarNama = rows || [];
        sel.innerHTML = daftarNama.length ? '<option value="">— Pilih nama —</option>' + daftarNama.map(function (p) {
          return '<option value="' + e(p.nama) + '">' + e(p.nama) + ' — ' + e(p.jabatan) + '</option>';
        }).join('') : '<option value="">Belum ada pengurus aktif di wilayah ini</option>';
        sel.disabled = !daftarNama.length;
      }).catch(function () { sel.innerHTML = '<option value="">Gagal memuat daftar nama</option>'; });
    });
    $('#lNama').addEventListener('change', gambarWa);
    $('#fPulih').addEventListener('submit', function (ev) {
      ev.preventDefault();
      galat.textContent = '';
      var w = $('#lWilayah').value, nama = $('#lNama').value,
        kode = $('#lKode').value.trim().toUpperCase(), pin = $('#lPin').value, pin2 = $('#lPin2').value;
      if (!w) { galat.textContent = 'Pilih wilayah dulu.'; return; }
      if (!nama) { galat.textContent = 'Pilih nama Anda.'; return; }
      if (!kode) { galat.textContent = 'Kode pemulihan wajib diisi.'; $('#lKode').focus(); return; }
      if (!/^\d{4,6}$/.test(pin)) { galat.textContent = 'PIN baru harus 4–6 angka.'; $('#lPin').focus(); return; }
      if (pin !== pin2) { galat.textContent = 'PIN baru dan ketik ulang tidak sama.'; $('#lPin2').focus(); return; }
      sbRpc('pakai_kode_pemulihan_wilayah', { p_nama: nama, p_wilayah_id: w, p_kode: kode, p_pin_baru: pin }).then(function (ok) {
        if (!ok) { galat.textContent = 'Kode pemulihan salah, coba lagi.'; return; }
        catatLog('pakai_kode_pemulihan', 'PIN dipulihkan dengan kode pemulihan: ' + nama);
        ev.target.style.display = 'none';
        galat.textContent = '';
        $('#fPulih').insertAdjacentHTML('afterend', '<p style="margin:0"><span class="lencana">PIN baru berhasil dibuat</span></p><p style="margin:12px 0">Silakan masuk dengan PIN baru Anda.</p><a class="btn" href="#/masuk">Masuk panel</a>');
      }).catch(function () { galat.textContent = 'Tidak bisa terhubung ke server. Coba lagi.'; });
    });
  };

  /* --- Disclaimer: 6 aturan (kata-kata disetujui Masdan, rekap 24 Nov 2026). --- */
  var ATURAN_DISCLAIMER = [
    'Superadmin hanya menyetujui wilayah masuk.',
    'Isi dan kebenaran data tanggung jawab RT/RW masing-masing.',
    'PIN dan email tanggung jawab pemilik akun, jangan dibagikan ke orang lain.',
    'Pengumuman publik jangan berisi data pribadi seperti NIK atau nama warga yang nunggak.',
    'Superadmin berhak menonaktifkan wilayah yang menyalahgunakan web.',
    'Penindakan tetap offline lewat musyawarah, web ini hanya memudahkan informasi antar warga.'
  ];
  HALPUB.disclaimer = function () {
    return kartuAuth('Disclaimer', 'Aturan pakai Website RT/RW.',
      '<div style="text-align:right;margin-bottom:12px"><button type="button" class="ikon-btn" id="btnTutupDisclaimer" aria-label="Tutup disclaimer" style="margin-left:auto">' + ik('tutup') + '</button></div>' +
      '<ol style="margin:0;padding-left:20px;display:grid;gap:10px">' + ATURAN_DISCLAIMER.map(function (a) { return '<li>' + e(a) + '</li>'; }).join('') + '</ol>');
  };
  HALPUB.disclaimerPasca = function () {
    var b = $('#btnTutupDisclaimer');
    if (b) b.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.hash = '#/';
    });
  };

  /* --- Akun saya (menu panel baru): profil, ganti PIN, kode pemulihan, keluar.
     KOREKSI koordinator (PRD-v4): kode pemulihan lama TIDAK BISA ditampilkan
     (hanya hash di server) — tampilkan hanya STATUS kode + tombol buat kode
     baru. Ganti PIN pindah ke sini dari Pengaturan. --- */
  HAL.akun = function () {
    var s = sesi() || {};
    return kepalaHal('Akun saya', e(s.nama || '') + (s.jabatan ? ' · ' + e(s.jabatan) : '') + (s.peran ? ' · ' + e(s.peran) : '')) +
      '<div class="grid grid-2" style="align-items:start"><div class="tumpuk">' +
      '<section class="kartu"><h2>Profil</h2><div id="profilAkun"><p style="color:var(--redup)">Memuat profil…</p></div></section>' +
      '<section class="kartu"><h2>Kode pemulihan</h2><div id="kodeAkun"><p style="color:var(--redup)">Memuat status kode…</p></div>' +
      '<p style="color:var(--redup);font-size:13px;margin:12px 0 0">Kode pemulihan lama tidak bisa ditampilkan lagi — hanya tersimpan sebagai hash di server. Buat kode baru bila kode lama hilang.</p></section>' +
      '</div><div class="tumpuk">' +
      '<form class="kartu" id="fGantiPin"><h2>Ganti PIN</h2><div class="form-grid">' +
      bid('gLama', 'PIN lama', '<input id="gLama" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password">') +
      bid('gBaru', 'PIN baru (4–6 angka)', '<input id="gBaru" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password">') +
      bid('gBaru2', 'Ketik ulang PIN baru', '<input id="gBaru2" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password">') + '</div>' +
      '<p id="galatGanti" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
      '<button class="btn" type="submit">' + ik('kunci') + 'Ganti PIN</button></form>' +
      '<section class="kartu"><h2>Keluar</h2><p style="color:var(--redup);margin:0 0 12px;font-size:14px">Keluar dari panel pengurus di perangkat ini.</p><button class="btn btn-garis" id="btnKeluarAkun">' + ik('keluar') + 'Keluar dari panel</button></section>' +
      '</div></div>';
  };
  HAL.akunPasca = function () {
    var s = sesi(); if (!s) return;
    muatWilayah().catch(function () {}).then(function () { return sbRpc('profil_pengurus', { p_token: tokenSesi() }); })
      .then(function (rows) {
        var p = (rows || [])[0], w = cariWilayah(s.wilayah_id);
        if (!p) { aturHtml('profilAkun', '<p>Profil tidak ditemukan.</p>'); return; }
        aturHtml('profilAkun', '<dl style="margin:0;display:grid;gap:8px">' +
          [['Nama', p.nama], ['Jabatan', p.jabatan], ['Peran', p.peran], ['Wilayah', w ? labelWilayah(w) : p.wilayah_id], ['WhatsApp', p.wa || '-'], ['Email', p.email || '-']].map(function (r) {
            return '<div style="display:flex;gap:10px"><dt style="width:90px;color:var(--redup);flex:none">' + r[0] + '</dt><dd style="margin:0;font-weight:700">' + e(r[1]) + '</dd></div>';
          }).join('') + '</dl>');
        if (p.ada_kode) {
          aturHtml('kodeAkun', '<p><span class="lencana">Kode masih berlaku</span></p>' +
            '<form id="fKodeBaru"><div class="form-grid">' + bid('kPin', 'Ketik PIN Anda', '<input id="kPin" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password">') + '</div>' +
            '<p id="galatKode" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
            '<button class="btn btn-garis" type="submit">Buat kode pemulihan baru</button></form><div id="hasilKode"></div>');
          var fk = $('#fKodeBaru');
          if (fk) fk.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var pin = $('#kPin').value;
            if (!/^\d{4,6}$/.test(pin)) { $('#galatKode').textContent = 'PIN harus 4–6 angka.'; return; }
            sbRpc('buat_kode_pemulihan_baru', { p_token: tokenSesi(), p_pin: pin }).then(function (kode) {
              if (!kode) { $('#galatKode').textContent = 'PIN salah, coba lagi.'; return; }
              catatLog('buat_kode_pemulihan', 'Kode pemulihan baru dibuat');
              aturHtml('hasilKode', '<p style="margin:14px 0 6px">Kode pemulihan baru — <b>hanya tampil sekali</b>:</p>' +
                '<div class="mono" style="font-size:28px;font-weight:900;letter-spacing:5px">' + e(kode) + '</div>' +
                '<p style="color:var(--redup)">Simpan kode ini, hanya tampil sekali. Kode lama tidak berlaku lagi.</p>' +
                '<button class="btn btn-garis btn-kecil" type="button" id="salinKodeBaru">Salin kode</button>');
              var sk = $('#salinKodeBaru'); if (sk) sk.addEventListener('click', function () { salin(kode, 'Kode pemulihan disalin'); });
            }).catch(function () { var gk = $('#galatKode'); if (gk) gk.textContent = 'Tidak bisa terhubung ke server. Coba lagi.'; });
          });
        } else {
          aturHtml('kodeAkun', '<p><span class="lencana bahaya">Kode sudah dipakai</span></p>' +
            '<p style="color:var(--redup)">Kode sudah dipakai, minta reset ke Pak RT.</p>' +
            '<a class="btn btn-garis" href="#/lupa-pin">Lupa PIN</a>');
        }
      }).catch(function () { aturHtml('profilAkun', '<p>Tidak bisa memuat profil — periksa internet.</p>'); });
    $('#fGantiPin').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var lama = $('#gLama').value, baru = $('#gBaru').value, ulang = $('#gBaru2').value, galat = $('#galatGanti');
      galat.textContent = '';
      if (!/^\d{4,6}$/.test(baru)) { galat.textContent = 'PIN baru harus 4–6 angka.'; return; }
      if (baru !== ulang) { galat.textContent = 'PIN baru dan ketik ulang tidak sama.'; return; }
      sbRpc('atur_pin_baru', { p_token: tokenSesi(), p_pin_lama: lama, p_pin_baru: baru }).then(function (ok) {
        if (!ok) { galat.textContent = 'PIN lama salah.'; return; }
        if (s.pin_sementara) { s.pin_sementara = false; simpanSesi(s); }
        catatLog('ganti_pin', 'Ganti PIN sendiri');
        ev.target.reset(); toast('PIN diganti');
      }).catch(function () { galat.textContent = 'Tidak bisa terhubung ke server. Coba lagi.'; });
    });
    $('#btnKeluarAkun').addEventListener('click', function () { keluarSesi(); location.hash = '#/'; toast('Anda keluar dari panel'); });
  };

  /* ========== 6c. Admin — Kelola Pengurus, Kelola Wilayah, Halaman RW,
     Pilih wilayah, Log Histori (Pekerja 3, PRD-v4 UI 4-7, 11) ========== */
  /* TOKEN SESI (F1): semua RPC admin mengirim p_token; peran + wilayah
     diambil server dari baris sesi, BUKAN dari parameter browser.
     Gating menu di bawah tetap dari sesi browser (hanya untuk tampilan);
     penegakan sesungguhnya ada DI DALAM fungsi server. */
  function peranSesi() { var s = sesi(); return (s && s.peran) || ''; }
  function wilayahSesi() { var s = sesi(); return (s && s.wilayah_id) || ''; }
  function labelWilayahSesi() { var w = cariWilayah(wilayahSesi()); return w ? labelWilayah(w) : (wilayahSesi() || '-'); }
  /* Format pesan WA reset PIN (disetujui Masdan 24 Nov 2026): dikirim dari
     WA masing-masing, gratis, BUKAN WA Business API. */
  function pesanResetPin(nama, pin, kode, namaAdmin) {
    return 'Halo ' + nama + ', PIN sementara panel pengurus Anda: ' + pin + '. Kode pemulihan baru: ' + kode + '. Segera masuk dan ganti PIN Anda. — ' + namaAdmin;
  }
  function lencanaStatus(st) {
    return '<span class="lencana' + (st === 'aktif' ? '' : st === 'menunggu' ? ' aksen' : ' bahaya') + '">' + (st === 'aktif' ? 'Aktif' : st === 'menunggu' ? 'Menunggu' : 'Nonaktif') + '</span>';
  }
  function fmtWaktu(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  /* Cache daftar wilayah (aktif) tidak berlaku lagi sesudah Kelola Wilayah
     mengubah status/data wilayah — panggil ini sesudah tiap aksi di sana. */
  function segarkanWilayah() { daftarWilayah = null; }

  /* --- Pilih wilayah (UI 7): hanya superadmin + admin_rw. Pengurus biasa
     dan admin_rt satu wilayah TIDAK melihat pemilih ini. --- */
  function opsiPilihWilayah() {
    var s = sesi(); if (!s) return [];
    var semua = daftarWilayah || [];
    if (s.peran === 'superadmin') return semua;
    if (s.peran === 'admin_rw') return semua.filter(function (w) { return w.id === s.wilayah_id || w.rw_induk_id === s.wilayah_id; });
    return [];
  }
  function barPilihWilayah() {
    var s = sesi();
    if (!s || (s.peran !== 'superadmin' && s.peran !== 'admin_rw')) return '';
    var daftar = opsiPilihWilayah();
    var opsi = daftar.length
      ? daftar.map(function (w) { return '<option value="' + e(w.id) + '"' + (w.id === s.wilayah_id ? ' selected' : '') + '>' + e(labelWilayah(w)) + '</option>'; }).join('')
      : '<option value="' + e(s.wilayah_id) + '">' + e(labelWilayahSesi()) + '</option>';
    return '<div class="kartu pilih-wilayah"><label for="pilihWilayah" style="margin:0"><b>Wilayah yang dikelola</b></label>' +
      '<select id="pilihWilayah">' + opsi + '</select>' +
      '<small style="color:var(--redup);flex-basis:100%">Pindah wilayah tanpa keluar masuk. Data warga, iuran, dan kas di panel ini masih tersimpan per perangkat, bukan per wilayah — yang ikut pindah wilayah adalah data admin (pengurus, wilayah, log).</small></div>';
  }
  function pasangPilihWilayah() {
    var sel = $('#pilihWilayah'); if (!sel) return;
    pasangPencarianSelect(sel);
    var isiOpsi = function () {
      var s = sesi(); if (!s) return;
      var daftar = opsiPilihWilayah();
      if (!daftar.length) { catatOpsiPenuh(sel); return; }
      sel.innerHTML = daftar.map(function (w) { return '<option value="' + e(w.id) + '"' + (w.id === s.wilayah_id ? ' selected' : '') + '>' + e(labelWilayah(w)) + '</option>'; }).join('');
      catatOpsiPenuh(sel);
    };
    if (!daftarWilayah) muatWilayah().then(isiOpsi).catch(function () {});
    else isiOpsi();
    sel.addEventListener('change', function () {
      var s = sesi(); if (!s || !this.value || this.value === s.wilayah_id) return;
      var idBaru = this.value;
      s.wilayah_id = idBaru; simpanSesi(s);
      catatLog('pindah_wilayah', 'Pindah kelola ke wilayah ' + idBaru);
      toast('Wilayah dikelola: ' + (cariWilayah(idBaru) ? labelWilayah(cariWilayah(idBaru)) : idBaru));
      render();
    });
  }

  /* --- Kelola Pengurus (UI 4): Admin RT + Superadmin. --- */
  var JABATAN_TAMBAH = ['Sekretaris', 'Bendahara', 'Sie Keamanan', 'Lainnya'];
  HAL['kelola-pengurus'] = function () {
    var s = sesi() || {};
    return kepalaHal('Kelola Pengurus', 'Wilayah: ' + e(labelWilayahSesi()) + (s.peran === 'superadmin' ? ' · Superadmin mengelola wilayah yang dipilih di pemilih di atas' : '')) +
      '<div class="baris-aksi" style="margin-bottom:16px"><button class="btn" id="btnTambahPengurus">' + ik('tambah') + 'Tambah pengurus</button></div>' +
      '<div id="daftarKelolaPengurus"><p style="color:var(--redup)">Memuat daftar pengurus…</p></div>';
  };
  var daftarKelola = [];
  function barisKelolaPengurus(p) {
    var s = sesi() || {};
    /* N1 (guard UI, melengkapi guard server): kartu Superadmin hanya boleh
       disentuh Superadmin itu sendiri — sembunyikan Reset PIN,
       Setujui/Tolak, Ubah, Nonaktifkan, dan Aktifkan bila sesi sekarang bukan
       Superadmin target. */
    var superadminLain = p.peran === 'superadmin' && !(s.peran === 'superadmin' && s.id === p.id);
    /* Ketua yang masih menunggu (admin_rt/admin_rw) TIDAK disetujui di
       sini — persetujuannya lewat Kelola Wilayah / Halaman RW (RPC
       setujui_wilayah, atomik dengan wilayahnya). */
    var ketuaMenunggu = p.status === 'menunggu' && (p.peran === 'admin_rt' || p.peran === 'admin_rw');
    var tombol = '';
    if (p.status === 'menunggu') tombol = (superadminLain || ketuaMenunggu) ? '' : '<button class="btn btn-kecil" data-aksi="setujui" data-id="' + p.id + '">' + ik('cek') + 'Setujui</button><button class="btn btn-hapus btn-kecil" data-aksi="tolak" data-id="' + p.id + '">Tolak</button>';
    else if (p.status === 'aktif') tombol = superadminLain ? '' : '<button class="btn btn-garis btn-kecil" data-aksi="reset" data-id="' + p.id + '">' + ik('kunci') + 'Reset PIN</button><button class="btn btn-garis btn-kecil" data-aksi="ubah" data-id="' + p.id + '">' + ik('sunting') + 'Ubah</button><button class="btn btn-hapus btn-kecil" data-aksi="nonaktif" data-id="' + p.id + '">Nonaktifkan</button>';
    else tombol = superadminLain ? '' : '<button class="btn btn-kecil" data-aksi="aktifkan" data-id="' + p.id + '">' + ik('cek') + 'Aktifkan</button><button class="btn btn-garis btn-kecil" data-aksi="ubah" data-id="' + p.id + '">' + ik('sunting') + 'Ubah</button>';
    return '<article class="kartu info-kartu"><div style="flex:1;min-width:0"><div class="baris-aksi" style="margin-bottom:4px">' + lencanaStatus(p.status) + '<span class="lencana netral">' + e(p.peran) + '</span>' + (p.pin_sementara ? '<span class="lencana bahaya">PIN sementara</span>' : '') + '</div>' +
      '<h3>' + e(p.nama) + '</h3><p>' + e(p.jabatan) + (p.wa ? ' · WA ' + e(p.wa) : ' · WA —') + (p.email ? ' · ' + e(p.email) : '') + '</p>' +
      (ketuaMenunggu ? '<p style="color:var(--redup);font-size:13px">Disetujui lewat Kelola Wilayah / Halaman RW.</p>' : '') +
      '<div class="baris-aksi" style="margin-top:12px">' + tombol + '</div></div></article>';
  }
  function gambarKelolaPengurus() {
    var wadah = $('#daftarKelolaPengurus'); if (!wadah) return;
    if (!daftarKelola.length) { wadah.innerHTML = kosong('Belum ada pengurus di wilayah ini.', 'warga'); return; }
    var grup = function (st, judul) {
      var rows = daftarKelola.filter(function (p) { return p.status === st; });
      if (!rows.length) return '';
      return '<section style="margin-bottom:16px"><h2 style="font-size:18px;margin-bottom:12px">' + judul + ' <span class="lencana netral">' + rows.length + '</span></h2><div class="tumpuk stagger">' + rows.map(barisKelolaPengurus).join('') + '</div></section>';
    };
    wadah.innerHTML = grup('menunggu', 'Menunggu persetujuan') + grup('aktif', 'Aktif') + grup('nonaktif', 'Nonaktif');
    stagger(wadah);
  }
  HAL['kelola-pengurusPasca'] = function () {
    var s = sesi(); if (!s) return;
    var muat = function () {
      sbRpc('daftar_semua_pengurus', { p_token: tokenSesi(), p_wilayah_id: s.wilayah_id }).then(function (rows) {
        daftarKelola = rows || [];
        gambarKelolaPengurus();
      }).catch(function () { aturHtml('daftarKelolaPengurus', '<p>Tidak bisa memuat daftar — periksa internet.</p>'); });
    };
    muat();
    var btnTambah = $('#btnTambahPengurus');
    if (btnTambah) btnTambah.addEventListener('click', function () { formTambahPengurus(s.wilayah_id, muat); });
    /* Judul ramah: subjudul dirender sebelum daftar wilayah termuat
       (labelWilayahSesi jatuh ke ID mentah) — perbarui sesudah muat. */
    muatWilayah().catch(function () {}).then(function () {
      var sub = document.querySelector('#isi .kepala-hal p');
      if (sub) sub.textContent = 'Wilayah: ' + labelWilayahSesi() + (s.peran === 'superadmin' ? ' · Superadmin mengelola wilayah yang dipilih di pemilih di atas' : '');
    });
    $('#daftarKelolaPengurus').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-aksi]'); if (!b) return;
      var p = daftarKelola.filter(function (x) { return x.id === b.dataset.id; })[0]; if (!p) return;
      var aksi = b.dataset.aksi;
      if (aksi === 'setujui') {
        sbRpc('setujui_pengurus', { p_token: tokenSesi(), p_pengurus_id: p.id }).then(function (ok) {
          if (!ok) { toast('Gagal menyetujui — mungkin sudah berubah', 'bahaya'); return; }
          catatLog('setujui_pengurus', 'Menyetujui pendaftaran: ' + p.nama + ' (' + p.jabatan + ')', p.wilayah_id);
          toast(p.nama + ' disetujui — sudah bisa masuk'); muat();
        }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
      }
      if (aksi === 'tolak') {
        konfirmasi('Tolak pendaftaran ' + p.nama + '?', 'Pendaftaran dihapus dan nama ini tidak bisa masuk. Pendaftar bisa daftar ulang bila perlu.', 'Tolak', function () {
          sbRpc('tolak_pengurus', { p_token: tokenSesi(), p_pengurus_id: p.id }).then(function (ok) {
            if (!ok) { toast('Gagal menolak — mungkin sudah berubah', 'bahaya'); return; }
            catatLog('tolak_pengurus', 'Menolak pendaftaran: ' + p.nama + ' (' + p.jabatan + ')', p.wilayah_id);
            toast('Pendaftaran ' + p.nama + ' ditolak'); muat();
          }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
        });
      }
      if (aksi === 'aktifkan' || aksi === 'nonaktif') {
        var jadi = aksi === 'aktifkan' ? 'aktif' : 'nonaktif';
        sbRpc('ubah_pengurus', { p_token: tokenSesi(), p_pengurus_id: p.id, p_jabatan: p.jabatan, p_peran: p.peran, p_status: jadi }).then(function (ok) {
          if (!ok) { toast('Gagal mengubah status', 'bahaya'); return; }
          catatLog('ubah_status_pengurus', p.nama + ' -> ' + jadi, p.wilayah_id);
          toast(p.nama + (jadi === 'aktif' ? ' diaktifkan' : ' dinonaktifkan — tidak bisa masuk')); muat();
        }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
      }
      if (aksi === 'ubah') formUbahPengurus(p, muat);
      if (aksi === 'reset') {
        konfirmasi('Reset PIN ' + p.nama + '?', 'PIN lama langsung tidak berlaku. PIN sementara + kode pemulihan baru dibuat dan hanya tampil sekali di layar ini.', 'Reset PIN', function () {
          sbRpc('reset_pin_admin', { p_token: tokenSesi(), p_pengurus_id: p.id }).then(function (rows) {
            var r = (rows || [])[0];
            if (!r) { toast('Reset gagal — pengurus harus aktif', 'bahaya'); return; }
            catatLog('reset_pin', 'Reset PIN pengurus: ' + p.nama, p.wilayah_id);
            tampilHasilReset(p, r.pin, r.kode);
            muat();
          }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
        });
      }
    });
  };
  /* Tambah pengurus dari panel (v5, ganti pendaftaran publik): langsung
     aktif, PIN sementara + kode pemulihan dibuat server (RPC
     tambah_pengurus) dan tampil sekali lewat tampilHasilReset. */
  function formTambahPengurus(wilayahId, lalu) {
    modal('<form id="fTambahPengurus"><div class="modal-kepala"><div><h2 id="modalJudul">Tambah pengurus</h2><p style="margin:4px 0 0;color:var(--redup)">Pengurus baru langsung aktif — PIN sementara + kode pemulihan dibuat server.</p></div><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      '<div class="form-grid">' +
      bid('tpNama', 'Nama lengkap', '<input id="tpNama" name="nama" autocomplete="off">') +
      bid('tpJabatan', 'Jabatan', '<select id="tpJabatan" name="jabatan">' + opsi(JABATAN_TAMBAH, 'Sekretaris') + '</select>') +
      bid('tpWa', 'No. WhatsApp', '<input id="tpWa" name="wa" inputmode="tel" placeholder="0812…">') +
      bid('tpEmail', 'Email', '<input id="tpEmail" name="email" type="email" placeholder="nama@email.com">') + '</div>' +
      '<p id="galatTambah" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
      '<div class="modal-kaki"><button type="button" class="btn btn-garis" data-tutup>Batal</button><button class="btn" type="submit">' + ik('cek') + 'Tambah pengurus</button></div></form>', function (m) {
      $('#fTambahPengurus', m).addEventListener('submit', function (ev) {
        ev.preventDefault();
        var nama = $('#tpNama', m).value.trim(), jab = $('#tpJabatan', m).value,
          wa = $('#tpWa', m).value.trim(), email = $('#tpEmail', m).value.trim(), galat = $('#galatTambah', m);
        galat.textContent = '';
        if (!nama) { galat.textContent = 'Nama wajib diisi.'; $('#tpNama', m).focus(); return; }
        if (!wa) { galat.textContent = 'No. WhatsApp wajib diisi.'; $('#tpWa', m).focus(); return; }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { galat.textContent = 'Format email tidak benar.'; $('#tpEmail', m).focus(); return; }
        sbRpc('tambah_pengurus', { p_token: tokenSesi(), p_nama: nama, p_jabatan: jab, p_wa: waNomor(wa), p_email: email, p_wilayah_id: wilayahId }).then(function (rows) {
          var r = (rows || [])[0];
          if (!r) { galat.textContent = 'Gagal menambah pengurus.'; return; }
          catatLog('tambah_pengurus', 'Tambah pengurus: ' + nama + ' (' + jab + ')', wilayahId);
          tampilHasilReset({ nama: nama, wa: waNomor(wa) }, r.pin, r.kode);
          if (lalu) lalu();
        }).catch(function (x) { galat.textContent = (x && x.message) || 'Tidak bisa terhubung ke server. Coba lagi.'; });
      });
    });
  }
  /* Ubah jabatan/peran. Admin RT HANYA boleh ubah ke peran 'pengurus'
     (server ikut menolak pengangkatan admin oleh bukan superadmin);
     hanya Superadmin boleh angkat admin_rt/admin_rw. */
  function formUbahPengurus(p, lalu) {
    var s = sesi() || {};
    var opsiPeran = s.peran === 'superadmin'
      ? [['pengurus', 'Pengurus'], ['admin_rt', 'Admin RT'], ['admin_rw', 'Admin RW']]
      : [['pengurus', 'Pengurus']];
    modal('<form id="fUbahPengurus"><div class="modal-kepala"><div><h2 id="modalJudul">Ubah ' + e(p.nama) + '</h2><p style="margin:4px 0 0;color:var(--redup)">' + e(p.jabatan) + ' · ' + e(p.peran) + ' · ' + lencanaStatus(p.status) + '</p></div><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      '<div class="form-grid">' +
      bid('upJabatan', 'Jabatan', '<input id="upJabatan" name="jabatan" value="' + e(p.jabatan) + '">') +
      bid('upPeran', 'Peran', '<select id="upPeran" name="peran">' + opsiPeran.map(function (o) { return '<option value="' + o[0] + '"' + (p.peran === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>') + '</div>' +
      (s.peran === 'superadmin' ? '' : '<p style="color:var(--redup);font-size:13px">Admin RT hanya boleh mengubah ke peran Pengurus. Pengangkatan Admin RT/RW hanya oleh Superadmin.</p>') +
      '<p id="galatUbah" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
      '<div class="modal-kaki"><button type="button" class="btn btn-garis" data-tutup>Batal</button><button class="btn" type="submit">' + ik('cek') + 'Simpan</button></div></form>', function (m) {
      $('#fUbahPengurus', m).addEventListener('submit', function (ev) {
        ev.preventDefault();
        var jab = $('#upJabatan', m).value.trim(), peran = $('#upPeran', m).value;
        if (!jab) { $('#galatUbah', m).textContent = 'Jabatan wajib diisi.'; return; }
        sbRpc('ubah_pengurus', { p_token: tokenSesi(), p_pengurus_id: p.id, p_jabatan: jab, p_peran: peran, p_status: p.status }).then(function (ok) {
          if (!ok) { $('#galatUbah', m).textContent = 'Tidak boleh mengangkat admin — hanya Superadmin.'; return; }
          if (jab !== p.jabatan) catatLog('ubah_jabatan', p.nama + ': ' + p.jabatan + ' -> ' + jab, p.wilayah_id);
          if (peran !== p.peran) catatLog('ubah_peran', p.nama + ': ' + p.peran + ' -> ' + peran, p.wilayah_id);
          tutupModal(); toast('Perubahan ' + p.nama + ' disimpan'); if (lalu) lalu();
        }).catch(function () { $('#galatUbah', m).textContent = 'Tidak bisa terhubung ke server. Coba lagi.'; });
      });
    });
  }
  /* Hasil reset PIN: PIN + kode tampil SEKALI + tombol Kirim WA (wa.me,
     gratis dari WA masing-masing). */
  function tampilHasilReset(p, pin, kode) {
    var s = sesi() || {};
    var teks = pesanResetPin(p.nama, pin, kode, s.nama || 'Admin');
    var isiWa = p.wa
      ? '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + waLink(p.wa, teks) + '">' + ik('wa') + 'Kirim WA ke ' + e(p.nama) + '</a>'
      : '<p style="color:var(--bahaya);font-weight:700">No. WA ' + e(p.nama) + ' kosong — salin PIN dan kode di bawah lalu kirim manual.</p>';
    modal('<div class="modal-kepala"><div><h2 id="modalJudul">PIN sementara ' + e(p.nama) + '</h2><p style="margin:4px 0 0;color:var(--redup)">Hanya tampil sekali — PIN lama sudah tidak berlaku.</p></div><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      '<div class="form-grid">' +
      '<div class="bidang"><label>PIN sementara</label><div class="mono" style="font-size:32px;font-weight:900;letter-spacing:6px">' + e(pin) + '</div></div>' +
      '<div class="bidang"><label>Kode pemulihan baru</label><div class="mono" style="font-size:28px;font-weight:900;letter-spacing:4px">' + e(kode) + '</div></div></div>' +
      '<p style="background:var(--permukaan-2);border:1px solid var(--garis);border-radius:12px;padding:12px">“' + e(teks) + '”</p>' +
      '<div class="baris-aksi">' + isiWa + '<button class="btn btn-garis" type="button" id="salinReset">Salin PIN + kode</button></div>' +
      '<p style="color:var(--redup);font-size:13px;margin:12px 0 0">' + e(p.nama) + ' wajib ganti PIN saat pertama masuk dengan PIN sementara ini.</p>', function (m) {
      $('#salinReset', m).addEventListener('click', function () { salin('PIN sementara: ' + pin + '\nKode pemulihan baru: ' + kode, 'PIN + kode disalin'); });
    });
  }

  /* --- Kelola Wilayah (UI 5): hanya Superadmin. --- */
  HAL['kelola-wilayah'] = function () {
    return kepalaHal('Kelola Wilayah', 'Semua RW + RT beserta statusnya. Hanya Superadmin.') +
      '<div id="daftarKelolaWilayah"><p style="color:var(--redup)">Memuat daftar wilayah…</p></div>';
  };
  var daftarWilayahAdmin = [];
  var rtMenungguRw = [];
  function barisKelolaWilayah(w) {
    var tombol = '';
    if (w.status === 'menunggu') tombol = '<button class="btn btn-kecil" data-aksi-w="setujui" data-id="' + e(w.id) + '">' + ik('cek') + 'Setujui</button><button class="btn btn-hapus btn-kecil" data-aksi-w="tolak" data-id="' + e(w.id) + '">Tolak</button>';
    else if (w.status === 'aktif') tombol = '<button class="btn btn-hapus btn-kecil" data-aksi-w="nonaktif" data-id="' + e(w.id) + '">Nonaktifkan</button>';
    else tombol = '<button class="btn btn-kecil" data-aksi-w="setujui" data-id="' + e(w.id) + '">' + ik('cek') + 'Aktifkan</button>';
    tombol += '<button class="btn btn-garis btn-kecil" data-aksi-w="ubah" data-id="' + e(w.id) + '">' + ik('sunting') + 'Ubah data</button><button class="btn btn-garis btn-kecil" data-aksi-w="angkat" data-id="' + e(w.id) + '">' + ik('jiwa') + 'Angkat Admin</button>';
    return '<article class="kartu info-kartu"><div style="flex:1;min-width:0"><div class="baris-aksi" style="margin-bottom:4px"><span class="lencana' + (w.jenis === 'rw' ? ' aksen' : '') + '">' + (w.jenis === 'rw' ? 'RW' : 'RT') + '</span>' + lencanaStatus(w.status) + '</div>' +
      '<h3>' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + e(w.nomor) + ' — Kel. ' + e(w.kelurahan) + '</h3>' +
      '<p>Ketua: ' + e(w.ketua_nama || 'Belum diisi') + (w.ketua_wa ? ' · WA ' + e(w.ketua_wa) : ' · WA Belum diisi') + (w.ketua_email ? ' · ' + e(w.ketua_email) : '') + '</p>' +
      '<p style="color:var(--redup);font-size:13px">' + e([w.kecamatan, w.kota, w.provinsi].filter(Boolean).join(', ')) + (w.rw_induk_id ? ' · RW induk: ' + e(w.rw_induk_id) : '') + '</p>' +
      '<div class="baris-aksi" style="margin-top:12px">' + tombol + '</div></div></article>';
  }
  function gambarKelolaWilayah() {
    var wadah = $('#daftarKelolaWilayah'); if (!wadah) return;
    if (!daftarWilayahAdmin.length) { wadah.innerHTML = kosong('Belum ada wilayah terdaftar.', 'rumah'); return; }
    var grup = function (jenis, judul) {
      var rows = daftarWilayahAdmin.filter(function (w) { return w.jenis === jenis; });
      if (!rows.length) return '';
      return '<section style="margin-bottom:16px"><h2 style="font-size:18px;margin-bottom:12px">' + judul + ' <span class="lencana netral">' + rows.length + '</span></h2><div class="tumpuk stagger">' + rows.map(barisKelolaWilayah).join('') + '</div></section>';
    };
    wadah.innerHTML = grup('rw', 'RW') + grup('rt', 'RT');
    stagger(wadah);
  }
  HAL['kelola-wilayahPasca'] = function () {
    var muat = function () {
      sbRpc('daftar_semua_wilayah', { p_token: tokenSesi() }).then(function (rows) {
        daftarWilayahAdmin = rows || [];
        gambarKelolaWilayah();
      }).catch(function () { aturHtml('daftarKelolaWilayah', '<p>Tidak bisa memuat daftar — periksa internet.</p>'); });
    };
    muat();
    $('#daftarKelolaWilayah').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-aksi-w]'); if (!b) return;
      var w = daftarWilayahAdmin.filter(function (x) { return x.id === b.dataset.id; })[0]; if (!w) return;
      var aksi = b.dataset.aksiW;
      var ubahStatus = function (jadi, aksiLog, rincian, pesan) {
        sbRpc('ubah_status_wilayah', { p_token: tokenSesi(), p_wilayah_id: w.id, p_status: jadi }).then(function (ok) {
          if (!ok) { toast('Gagal mengubah status wilayah', 'bahaya'); return; }
          segarkanWilayah();
          catatLog(aksiLog, rincian, w.id);
          toast(pesan); muat();
        }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
      };
      /* Setujui (v5): wilayah MENUNGGU disetujui atomik bersama Ketuanya
         lewat RPC setujui_wilayah — PIN sementara + kode Ketua tampil
         sekali. Wilayah NONAKTIF yang diaktifkan lagi tetap lewat
         ubah_status_wilayah seperti dulu. */
      if (aksi === 'setujui') {
        if (w.status === 'menunggu') {
          sbRpc('setujui_wilayah', { p_token: tokenSesi(), p_wilayah_id: w.id }).then(function (rows) {
            var r = (rows || [])[0];
            if (!r) { toast('Gagal menyetujui wilayah', 'bahaya'); return; }
            segarkanWilayah();
            catatLog('setujui_wilayah', 'Menyetujui wilayah: ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + ' Kel. ' + w.kelurahan, w.id);
            tampilHasilReset({ nama: w.ketua_nama, wa: w.ketua_wa }, r.pin, r.kode);
            muat();
          }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
        } else {
          ubahStatus('aktif', 'aktifkan_wilayah', 'Mengaktifkan wilayah: ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + ' Kel. ' + w.kelurahan, 'Wilayah diaktifkan lagi');
        }
      }
      if (aksi === 'tolak') {
        konfirmasi('Tolak wilayah ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + ' Kel. ' + w.kelurahan + '?', 'Wilayah dan pengajuan Ketuanya dihapus. Pendaftar bisa mendaftar ulang.', 'Tolak', function () {
          sbRpc('tolak_wilayah', { p_token: tokenSesi(), p_wilayah_id: w.id }).then(function (ok) {
            if (!ok) { toast('Gagal menolak wilayah', 'bahaya'); return; }
            segarkanWilayah();
            catatLog('tolak_wilayah', 'Menolak wilayah: ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + ' Kel. ' + w.kelurahan, w.id);
            toast('Wilayah ditolak dan dihapus'); muat();
          }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
        });
      }
      if (aksi === 'nonaktif') {
        konfirmasi('Nonaktifkan wilayah ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + '?', 'Wilayah tidak tampil lagi di pilih wilayah dan halaman masuk. Pengurus di wilayah ini tidak bisa masuk selama nonaktif.', 'Nonaktifkan', function () {
          ubahStatus('nonaktif', 'nonaktifkan_wilayah', 'Menonaktifkan wilayah: ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + ' Kel. ' + w.kelurahan, 'Wilayah dinonaktifkan');
        });
      }
      if (aksi === 'ubah') formUbahWilayah(w, function () { segarkanWilayah(); muat(); });
      if (aksi === 'angkat') formAngkatAdmin(w);
    });
  };
  function formUbahWilayah(w, lalu) {
    var rwList = daftarWilayahAdmin.filter(function (x) { return x.jenis === 'rw' && x.id !== w.id; });
    modal('<form id="fUbahWilayah"><div class="modal-kepala"><div><h2 id="modalJudul">Ubah data ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + e(w.nomor) + '</h2><p style="margin:4px 0 0;color:var(--redup)">ID: <span class="mono">' + e(w.id) + '</span></p></div><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div>' +
      '<div class="form-grid">' +
      bid('uwNomor', 'Nomor', '<input id="uwNomor" name="nomor" value="' + e(w.nomor) + '" maxlength="3">') +
      bid('uwKel', 'Kelurahan / desa', '<input id="uwKel" name="kelurahan" value="' + e(w.kelurahan) + '">') +
      bid('uwKec', 'Kecamatan', '<input id="uwKec" name="kecamatan" value="' + e(w.kecamatan) + '">') +
      bid('uwKota', 'Kota / kabupaten', '<input id="uwKota" name="kota" value="' + e(w.kota) + '">') +
      bid('uwProv', 'Provinsi', '<input id="uwProv" name="provinsi" value="' + e(w.provinsi) + '">') +
      bid('uwKetua', 'Nama Ketua', '<input id="uwKetua" name="ketua" value="' + e(w.ketua_nama) + '">') +
      bid('uwWa', 'WA Ketua', '<input id="uwWa" name="wa" inputmode="tel" value="' + e(w.ketua_wa) + '">', 'Wajib diisi supaya tombol WA Lupa PIN jalan.') +
      bid('uwEmail', 'Email Ketua', '<input id="uwEmail" name="email" type="email" value="' + e(w.ketua_email) + '">') +
      (w.jenis === 'rt' ? bid('uwRw', 'RW induk', '<select id="uwRw" name="rw"><option value="">— Tidak ada —</option>' + rwList.map(function (x) { return '<option value="' + e(x.id) + '"' + (w.rw_induk_id === x.id ? ' selected' : '') + '>' + e(labelWilayah(x)) + '</option>'; }).join('') + '</select>') : '') + '</div>' +
      '<p id="galatUbahW" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
      '<div class="modal-kaki"><button type="button" class="btn btn-garis" data-tutup>Batal</button><button class="btn" type="submit">' + ik('cek') + 'Simpan</button></div></form>', function (m) {
      var selRw = $('#uwRw', m);
      if (selRw) { pasangPencarianSelect(selRw); catatOpsiPenuh(selRw); }
      $('#fUbahWilayah', m).addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target;
        if (!/^\d{1,3}$/.test(f.nomor.value.trim()) || !f.kelurahan.value.trim() || !f.ketua.value.trim()) { $('#galatUbahW', m).textContent = 'Nomor, kelurahan, dan nama Ketua wajib diisi.'; return; }
        sbRpc('ubah_wilayah', {
          p_token: tokenSesi(), p_wilayah_id: w.id, p_nomor: f.nomor.value.trim(), p_kelurahan: f.kelurahan.value.trim(),
          p_kecamatan: f.kecamatan.value.trim(), p_kota: f.kota.value.trim(), p_provinsi: f.provinsi.value.trim(),
          p_ketua_nama: f.ketua.value.trim(), p_ketua_wa: waNomor(f.wa.value), p_ketua_email: f.email.value.trim(),
          p_kode_verifikasi: '', p_rw_induk_id: f.rw ? f.rw.value : ''
        }).then(function (ok) {
          if (!ok) { $('#galatUbahW', m).textContent = 'Gagal menyimpan perubahan.'; return; }
          catatLog('ubah_wilayah', 'Ubah data wilayah: ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + ' Kel. ' + w.kelurahan, w.id);
          tutupModal(); toast('Data wilayah disimpan'); if (lalu) lalu();
        }).catch(function () { $('#galatUbahW', m).textContent = 'Tidak bisa terhubung ke server. Coba lagi.'; });
      });
    });
  }
  function formAngkatAdmin(w, lalu) {
    modal('<div class="modal-kepala"><div><h2 id="modalJudul">Angkat Admin — ' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + e(w.nomor) + '</h2><p style="margin:4px 0 0;color:var(--redup)">Memuat pengurus wilayah ini…</p></div><button type="button" class="ikon-btn" data-tutup aria-label="Tutup">' + ik('tutup') + '</button></div><div id="isiAngkat"></div>', function (m) {
      sbRpc('daftar_semua_pengurus', { p_token: tokenSesi(), p_wilayah_id: w.id }).then(function (rows) {
        rows = (rows || []).filter(function (p) { return p.status === 'aktif'; });
        var wadah = $('#isiAngkat', m);
        if (!wadah) return;
        var peranDefault = w.jenis === 'rw' ? 'admin_rw' : 'admin_rt';
        wadah.innerHTML = '<form id="fAngkat"><div class="form-grid">' +
          bid('aaNama', 'Pengurus', '<select id="aaNama" name="pengurus">' + rows.map(function (p) { return '<option value="' + p.id + '">' + e(p.nama) + ' — ' + e(p.jabatan) + ' (' + e(p.peran) + ')</option>'; }).join('') + '</select>') +
          bid('aaPeran', 'Diangkat sebagai', '<select id="aaPeran" name="peran"><option value="admin_rt"' + (peranDefault === 'admin_rt' ? ' selected' : '') + '>Admin RT</option><option value="admin_rw"' + (peranDefault === 'admin_rw' ? ' selected' : '') + '>Admin RW</option></select>') + '</div>' +
          '<p id="galatAngkat" role="alert" style="color:var(--bahaya);font-weight:700;margin:0 0 12px"></p>' +
          '<div class="modal-kaki"><button type="button" class="btn btn-garis" data-tutup>Batal</button><button class="btn" type="submit">' + ik('cek') + 'Angkat Admin</button></div></form>';
        $('#fAngkat', m).addEventListener('submit', function (ev) {
          ev.preventDefault();
          var id = $('#aaNama', m).value, peran = $('#aaPeran', m).value;
          var p = rows.filter(function (x) { return x.id === id; })[0];
          sbRpc('ubah_pengurus', { p_token: tokenSesi(), p_pengurus_id: id, p_jabatan: p.jabatan, p_peran: peran, p_status: 'aktif' }).then(function (ok) {
            if (!ok) { $('#galatAngkat', m).textContent = 'Gagal mengangkat admin.'; return; }
            catatLog('angkat_admin', 'Angkat admin: ' + p.nama + ' -> ' + peran + ' (' + (w.jenis === 'rw' ? 'RW ' : 'RT ') + w.nomor + ')', w.id);
            tutupModal(); toast(p.nama + ' diangkat jadi ' + (peran === 'admin_rw' ? 'Admin RW' : 'Admin RT')); if (lalu) lalu();
          }).catch(function () { $('#galatAngkat', m).textContent = 'Tidak bisa terhubung ke server. Coba lagi.'; });
        });
      }).catch(function () { var wadah = $('#isiAngkat', m); if (wadah) wadah.innerHTML = '<p>Tidak bisa memuat pengurus — periksa internet.</p>'; });
    });
  }

  /* --- Halaman RW (UI 6): route publik #/rw/<id> + menu panel admin_rw. --- */
  function rwIdDariSesi() {
    var s = sesi(); if (!s) return null;
    var w = cariWilayah(s.wilayah_id);
    if (w && w.jenis === 'rw') return w.id;
    if (w && w.rw_induk_id) return w.rw_induk_id;
    return null;
  }
  function rtLokal(w) { return w && w.jenis === 'rt' && w.nomor === D.pengaturan.rt && w.kelurahan === D.pengaturan.kelurahan; }
  function halamanRW(rwId) {
    var rw = cariWilayah(rwId);
    if (!rw) return kepalaHal('Halaman RW', 'RW tidak ditemukan atau belum aktif.') + kosong('Periksa kembali tautan halaman RW.', 'cari');
    var rtList = (daftarWilayah || []).filter(function (w) { return w.jenis === 'rt' && w.rw_induk_id === rwId; });
    var kartu = rtList.length ? rtList.map(function (w) {
      var lokal = rtLokal(w);
      /* Pengumuman/agenda per RT belum ada di Supabase (info masih
         localStorage satu RT): tampilkan dari data lokal HANYA untuk RT
         yang datanya memang dimuat di perangkat ini; RT lain tampilkan
         keterangan jujur, bukan data RT lain. */
      var infoHtml;
      if (lokal) {
        var peng = pengumumanUrut().slice(0, 2), ag = infoDatang().slice(0, 1);
        var ikonKecil = function (n) { return ik(n).replace('<svg', '<svg width="16" height="16" style="vertical-align:-3px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"'); };
        infoHtml = (peng.length ? peng.map(function (i) { return '<p style="margin:4px 0">' + ikonKecil('info') + ' ' + e(i.judul) + '</p>'; }).join('') : '<p style="color:var(--redup)">Belum ada pengumuman.</p>') +
          (ag.length ? '<p style="margin:4px 0">' + ikonKecil('kalender') + ' ' + e(ag[0].judul) + ' · ' + tglPanjang(ag[0].tgl) + '</p>' : '');
      } else {
        infoHtml = '<p style="color:var(--redup)">Pengumuman &amp; agenda RT ini belum ditampilkan di web ini.</p>';
      }
      return '<article class="kartu info-kartu"><div style="flex:1;min-width:0"><div class="baris-aksi" style="margin-bottom:4px"><span class="lencana">RT</span></div>' +
        '<h3>RT ' + e(w.nomor) + ' — Kel. ' + e(w.kelurahan) + '</h3><p>Ketua: ' + e(w.ketua_nama || 'Belum diisi') + '</p>' + infoHtml +
        '<div class="baris-aksi" style="margin-top:12px">' + (lokal ? '<a class="btn btn-garis btn-kecil" href="#/">Buka halaman RT</a>' : '') + '</div></div></article>';
    }).join('') : kosong('Belum ada RT aktif di bawah RW ini.', 'rumah');
    return kepalaHal('RW ' + e(rw.nomor) + ' — Kel. ' + e(rw.kelurahan), 'Ketua RW: ' + e(rw.ketua_nama || 'Belum diisi') + ' · ' + e([rw.kecamatan, rw.kota].filter(Boolean).join(', '))) +
      '<section><h2 style="font-size:18px;margin-bottom:12px">RT di bawah RW ini <span class="lencana netral">' + rtList.length + '</span></h2><div class="grid grid-2 stagger" style="align-items:start">' + kartu + '</div></section>' +
      '<div id="verifikasiRw"></div>';
  }
  function gambarVerifikasiRw(rwId) {
    var wadah = $('#verifikasiRw'); if (!wadah) return;
    var s = sesi();
    if (!s || (s.peran !== 'admin_rw' && s.peran !== 'superadmin')) { wadah.innerHTML = ''; return; }
    if (s.peran === 'admin_rw' && s.wilayah_id !== rwId) { wadah.innerHTML = ''; return; }
    sbRpc('daftar_rt_menunggu_rw', { p_token: tokenSesi(), p_rw_id: rwId }).then(function (rows) {
      if (!wadah || !document.contains(wadah)) return;
      rows = rows || [];
      rtMenungguRw = rows;
      wadah.innerHTML = '<section class="kartu" style="margin-top:16px"><h2>Verifikasi RT <span class="lencana netral">' + rows.length + '</span></h2>' +
        '<p style="color:var(--redup)">RT yang mengaku di bawah RW ini dan masih menunggu. Verifikasi hanya memastikan Ketua RT-nya memang benar orangnya; isi RT sesudah itu tanggung jawab RT masing-masing.</p>' +
        (rows.length ? '<div class="tumpuk">' + rows.map(function (r) {
          return '<article class="kartu info-kartu"><div style="flex:1;min-width:0"><h3>RT ' + e(r.nomor) + ' — Kel. ' + e(r.kelurahan) + '</h3><p>Ketua: ' + e(r.ketua_nama || 'Belum diisi') + (r.ketua_wa ? ' · WA ' + e(r.ketua_wa) : '') + (r.ketua_email ? ' · ' + e(r.ketua_email) : '') + '</p>' +
            '<div class="baris-aksi" style="margin-top:12px"><button class="btn btn-kecil" data-verifikasi="ya" data-rt-id="' + e(r.id) + '">' + ik('cek') + 'Konfirmasi</button><button class="btn btn-hapus btn-kecil" data-verifikasi="tidak" data-rt-id="' + e(r.id) + '">Tolak</button></div></div></article>';
        }).join('') + '</div>' : kosong('Tidak ada RT menunggu verifikasi.', 'cek')) + '</section>';
    }).catch(function () { if (wadah && document.contains(wadah)) wadah.innerHTML = '<p>Tidak bisa memuat daftar verifikasi — periksa internet.</p>'; });
  }
  function pasangVerifikasiRw(rwId) {
    gambarVerifikasiRw(rwId);
    var wadah = $('#verifikasiRw'); if (!wadah) return;
    wadah.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-verifikasi]'); if (!b) return;
      var id = b.dataset.rtId;
      var r = rtMenungguRw.filter(function (x) { return x.id === id; })[0] || {};
      var labelRt = 'RT ' + (r.nomor || '') + ' Kel. ' + (r.kelurahan || '');
      if (b.dataset.verifikasi === 'ya') {
        /* Konfirmasi (v5): atomik lewat setujui_wilayah — PIN sementara +
           kode Ketua tampil sekali lewat tampilHasilReset. */
        sbRpc('setujui_wilayah', { p_token: tokenSesi(), p_wilayah_id: id }).then(function (rows) {
          var hasil = (rows || [])[0];
          if (!hasil) { toast('Gagal mengonfirmasi RT', 'bahaya'); return; }
          segarkanWilayah();
          catatLog('setujui_wilayah', 'Menyetujui wilayah: ' + labelRt, id);
          tampilHasilReset({ nama: r.ketua_nama, wa: r.ketua_wa }, hasil.pin, hasil.kode);
          toast('RT dikonfirmasi — sudah aktif');
          muatUlangHalamanRW(rwId);
        }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
      } else {
        konfirmasi('Tolak RT ini?', 'Wilayah dan pengajuan Ketuanya dihapus. Pendaftar bisa mendaftar ulang.', 'Tolak', function () {
          sbRpc('tolak_wilayah', { p_token: tokenSesi(), p_wilayah_id: id }).then(function (ok) {
            if (!ok) { toast('Gagal menolak RT', 'bahaya'); return; }
            segarkanWilayah();
            catatLog('tolak_wilayah', 'Menolak wilayah: ' + labelRt, id);
            toast('RT ditolak dan dihapus');
            muatUlangHalamanRW(rwId);
          }).catch(function () { toast('Tidak bisa terhubung ke server', 'bahaya'); });
        });
      }
    });
  }
  function muatUlangHalamanRW(rwId) {
    var h = $('#halRw'); if (!h) return;
    muatWilayah().then(function () { h.innerHTML = halamanRW(rwId); pasangVerifikasiRw(rwId); })
      .catch(function () { h.innerHTML = '<p>Tidak bisa memuat halaman RW — periksa internet.</p>'; });
  }
  HAL.rw = function () {
    var rwId = rwIdDariSesi();
    /* F9: RT tanpa rw_induk_id (kondisi seed RT 07 — RW 13 belum terdaftar):
       katakan jujur + beri jalan keluar, jangan hanya "belum terhubung". */
    if (!rwId) return kepalaHal('Halaman RW', 'RT ini belum punya RW induk di web ini.') + '<p style="color:var(--redup)">RW induk RT ini belum terdaftar, jadi belum ada kartu RT yang bisa ditampilkan di sini. Daftarkan dulu RW-nya, sesudah disetujui halaman ini akan menampilkan RT-RT di bawah RW itu.</p><div class="baris-aksi" style="margin-top:12px"><a class="btn" href="#/daftar-wilayah">' + ik('tambah') + 'Daftarkan RW</a></div>';
    return '<div id="halRw">' + (daftarWilayah ? halamanRW(rwId) : '<p style="color:var(--redup)">Memuat halaman RW…</p>') + '</div>';
  };
  HAL.rwPasca = function () {
    var rwId = rwIdDariSesi(); if (!rwId) return;
    var isi = function () { var h = $('#halRw'); if (h) { h.innerHTML = halamanRW(rwId); pasangVerifikasiRw(rwId); } };
    if (daftarWilayah) isi();
    else muatWilayah().then(isi).catch(function () { var h = $('#halRw'); if (h) h.innerHTML = '<p>Tidak bisa memuat halaman RW — periksa internet.</p>'; });
  };
  HALPUB['rw-publik'] = function (rwId) {
    if (!rwId) return kartuAuth('Halaman RW', 'Tautan halaman RW tidak lengkap.', '<p style="color:var(--redup)">Buka halaman RW dari tautan lengkap, contoh: #/rw/&lt;id-wilayah-rw&gt;.</p>');
    return '<div id="halRw">' + (daftarWilayah ? halamanRW(rwId) : '<p style="color:var(--redup)">Memuat halaman RW…</p>') + '</div>';
  };
  HALPUB['rw-publikPasca'] = function (rwId) {
    if (!rwId) return;
    var isi = function () { var h = $('#halRw'); if (h) { h.innerHTML = halamanRW(rwId); pasangVerifikasiRw(rwId); } };
    if (daftarWilayah) isi();
    else muatWilayah().then(isi).catch(function () { var h = $('#halRw'); if (h) h.innerHTML = '<p>Tidak bisa memuat halaman RW — periksa internet.</p>'; });
  };

  /* --- Log Histori (UI 11): Admin RT (wilayahnya) + Superadmin (semua).
     RW dan warga TIDAK bisa lihat — gating menu + RPC baca_log. --- */
  HAL.log = function () {
    var s = sesi() || {};
    var filter = s.peran === 'superadmin'
      ? '<div class="alat"><div class="cari">' + ik('cari') + '<label class="sr" for="saringLogWilayah">Saring wilayah</label><select id="saringLogWilayah" style="padding-left:12px"><option value="">Semua wilayah</option></select></div></div>'
      : '';
    return kepalaHal('Log Histori', s.peran === 'superadmin' ? 'Semua wilayah' : 'Wilayah: ' + e(labelWilayahSesi())) + filter +
      '<div id="daftarLog"><p style="color:var(--redup)">Memuat log…</p></div>' +
      '<p style="color:var(--redup);font-size:13px">Log dibatasi per wilayah berdasarkan token sesi Anda (peran + wilayah diambil server dari sesi, bukan dari browser).</p>';
  };
  HAL.logPasca = function () {
    var s = sesi(); if (!s) return;
    var muat = function (wilayahId) {
      sbRpc('baca_log', { p_token: tokenSesi(), p_wilayah_id: (wilayahId == null ? '' : wilayahId) }).then(function (rows) {
        rows = rows || [];
        var wadah = $('#daftarLog'); if (!wadah) return;
        if (!rows.length) { wadah.innerHTML = kosong('Belum ada log untuk wilayah ini.', 'jam'); return; }
        wadah.innerHTML = '<div class="tabel-wadah"><table><thead><tr><th>Waktu</th><th>Pelaku</th><th>Aksi</th><th>Rincian</th>' + (s.peran === 'superadmin' ? '<th>Wilayah</th>' : '') + '</tr></thead><tbody>' +
          rows.map(function (l) {
            return '<tr><td style="white-space:nowrap">' + e(fmtWaktu(l.waktu)) + '</td><td><b>' + e(l.pelaku_nama || '-') + '</b><br><small style="color:var(--redup)">' + e(l.pelaku_peran || '') + '</small></td><td><span class="mono">' + e(l.aksi) + '</span></td><td style="white-space:normal;min-width:180px">' + e(l.rincian || '') + '</td>' + (s.peran === 'superadmin' ? '<td class="mono">' + e(l.wilayah_id || '') + '</td>' : '') + '</tr>';
          }).join('') + '</tbody></table></div>';
      }).catch(function () { var w = $('#daftarLog'); if (w) w.innerHTML = '<p>Tidak bisa memuat log — periksa internet.</p>'; });
    };
    if (s.peran === 'superadmin') {
      sbRpc('daftar_semua_wilayah', { p_token: tokenSesi() }).then(function (rows) {
        var sel = $('#saringLogWilayah'); if (!sel) return;
        (rows || []).forEach(function (w) {
          var o = document.createElement('option'); o.value = w.id; o.textContent = labelWilayah(w) + ' (' + w.status + ')'; sel.appendChild(o);
        });
        pasangPencarianSelect(sel);
        catatOpsiPenuh(sel);
        sel.addEventListener('change', function () { muat(this.value); });
      }).catch(function () {});
      muat('');
    } else {
      muat(s.wilayah_id);
    }
  };

  /* ========== 7. Modal, konfirmasi, toast ========== */
  var modalEl = $('#modal'), fokusSebelum = null;
  function modal(html, pasang) {
    var buka = function () {
      fokusSebelum = document.activeElement;
      $('#modalIsi').innerHTML = html;
      modalEl.classList.remove('tutup');
      if (!modalEl.open) modalEl.showModal();
      $$('[data-tutup]', modalEl).forEach(function (b) { b.addEventListener('click', function () { tutupModal(); }); });
      if (pasang) pasang(modalEl);
      tandaiBagian(modalEl);
      var f = $('input:not([type=hidden]):not(.sr),select,textarea', modalEl) || $('.btn,[data-tutup]', modalEl); if (f) f.focus();
    };
    if (modalEl.open) tutupModal(buka); else buka();
  }
  function tutupModal(lalu) {
    if (!modalEl.open) { if (lalu) lalu(); return; }
    var selesai = function () { modalEl.classList.remove('tutup'); modalEl.close(); if (fokusSebelum && document.contains(fokusSebelum) && !lalu) fokusSebelum.focus(); if (lalu) lalu(); };
    if (RM.matches) return selesai();
    modalEl.classList.add('tutup'); setTimeout(selesai, 200);
  }
  modalEl.addEventListener('cancel', function (ev) { ev.preventDefault(); tutupModal(); });
  modalEl.addEventListener('click', function (ev) { if (ev.target === modalEl) tutupModal(); });
  function konfirmasi(judul, isi, tombol, ok, bukanBahaya) {
    modal('<div class="modal-kepala"><h2 id="modalJudul">' + e(judul) + '</h2></div><p style="margin:0;color:var(--redup)">' + e(isi) + '</p><div class="modal-kaki"><button class="btn btn-garis" data-tutup>Batal</button><button class="btn ' + (bukanBahaya ? '' : 'btn-hapus') + '" data-ya>' + e(tombol) + '</button></div>', function (m) {
      $('[data-ya]', m).addEventListener('click', function () { tutupModal(ok); });
    });
  }
  function toast(teks, jenis) {
    var t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = ik(jenis === 'bahaya' ? 'tutup' : 'cek') + '<span>' + e(teks) + '</span>';
    if (jenis === 'bahaya') t.style.background = 'var(--bahaya)';
    $('#toast').appendChild(t);
    setTimeout(function () { t.classList.add('pergi'); setTimeout(function () { t.remove(); }, RM.matches ? 0 : 260); }, 2800);
  }
  function salin(teks, pesan) {
    var jadi = function () { toast(pesan); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(teks).then(jadi, cadangan); else cadangan();
    function cadangan() { var a = document.createElement('textarea'); a.value = teks; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); jadi(); } catch (x) { toast('Gagal menyalin', 'bahaya'); } a.remove(); }
  }
  /* ========== 8. CSV & berkas ========== */
  function csvSel(v) { v = String(v == null ? '' : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function keCSV(baris) { return '﻿' + baris.map(function (r) { return r.map(csvSel).join(','); }).join('\r\n'); }
  function bacaCSV(teks) {
    teks = teks.replace(/^﻿/, ''); var pemisah = (teks.split('\n')[0].match(/;/g) || []).length > (teks.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
    var hasil = [], baris = [], sel = '', kutip = false;
    for (var i = 0; i < teks.length; i++) {
      var c = teks[i];
      if (kutip) { if (c === '"') { if (teks[i + 1] === '"') { sel += '"'; i++; } else kutip = false; } else sel += c; }
      else if (c === '"') kutip = true; else if (c === pemisah) { baris.push(sel); sel = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && teks[i + 1] === '\n') i++; baris.push(sel); hasil.push(baris); baris = []; sel = ''; }
      else sel += c;
    }
    if (sel || baris.length) { baris.push(sel); hasil.push(baris); }
    return hasil.filter(function (r) { return r.some(function (x) { return x.trim(); }); });
  }
  function unduh(nama, isi, tipe) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([isi], { type: tipe })); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function bacaBerkas(input, lalu) { var f = input.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { lalu(String(r.result)); input.value = ''; }; r.readAsText(f); }
  var KOLOM_WARGA = ['no_kk', 'alamat', 'status', 'wa', 'nama', 'nik', 'hubungan', 'jk', 'tempat_lahir', 'tgl_lahir', 'agama', 'status_kawin', 'pekerjaan'];
  function eksporCSV(jenis) {
    var b = [];
    if (jenis === 'warga') { b.push(KOLOM_WARGA); D.kk.forEach(function (k) { k.anggota.forEach(function (a) { b.push([k.noKK, k.alamat, k.status, k.wa, a.nama, a.nik, a.hubungan, a.jk, a.tempatLahir, a.tglLahir, a.agama, a.kawin, a.pekerjaan]); }); }); }
    if (jenis === 'kas') { b.push(['tanggal', 'jenis', 'kategori', 'keterangan', 'jumlah']); D.kas.slice().sort(function (x, y) { return x.tgl.localeCompare(y.tgl); }).forEach(function (x) { b.push([x.tgl, x.jenis, x.kategori, x.ket, x.jumlah]); }); }
    if (jenis === 'iuran') { var bln = bulanTagihan(); b.push(['kepala_keluarga', 'alamat'].concat(bln).concat(['tunggakan_bulan', 'tunggakan_rp'])); D.kk.forEach(function (k) { var t = tunggakan(k); b.push([k.kepala, k.alamat].concat(bln.map(function (x) { return D.iuran[x] && D.iuran[x][k.id] ? 'lunas ' + D.iuran[x][k.id] : ''; })).concat([t.length, t.length * D.pengaturan.iuran])); }); }
    unduh(jenis + '-rt-' + hariIni() + '.csv', keCSV(b), 'text/csv;charset=utf-8'); toast('CSV ' + jenis + ' diunduh');
  }
  document.addEventListener('click', function (ev) { var c = ev.target.closest('[data-csv]'); if (c) eksporCSV(c.dataset.csv); });
  function imporWarga(teks) {
    var r = bacaCSV(teks); if (r.length < 2) { toast('CSV kosong', 'bahaya'); return; }
    var kepala = r[0].map(function (h) { return h.trim().toLowerCase(); }), idx = function (n) { return kepala.indexOf(n); };
    if (idx('nama') < 0) { toast('Kolom "nama" tidak ditemukan. Pakai format CSV ekspor.', 'bahaya'); return; }
    var peta = {}, baru = 0;
    r.slice(1).forEach(function (s) {
      var g = function (n) { var i = idx(n); return i < 0 ? '' : (s[i] || '').trim(); };
      if (!g('nama')) return;
      var kunci = g('no_kk') || g('alamat') || g('nama');
      var k = peta[kunci] || D.kk.filter(function (x) { return (g('no_kk') && x.noKK === g('no_kk')); })[0];
      if (!k) { k = { id: idBaru('kk'), noKK: g('no_kk'), alamat: g('alamat') || '-', status: g('status') === 'kontrak' ? 'kontrak' : 'tetap', wa: g('wa'), anggota: [], kepala: g('nama'), dibuat: hariIni() }; D.kk.push(k); baru++; }
      else if (!peta[kunci]) k.anggota = [];
      peta[kunci] = k;
      k.anggota.push({ nama: g('nama'), nik: g('nik'), hubungan: g('hubungan') || (k.anggota.length ? 'Lainnya' : 'Kepala Keluarga'), jk: g('jk') === 'P' ? 'P' : 'L', tempatLahir: g('tempat_lahir'), tglLahir: g('tgl_lahir'), agama: g('agama') || 'Islam', kawin: g('status_kawin'), pekerjaan: g('pekerjaan') });
      k.kepala = k.anggota[0].nama;
    });
    simpan(); render(); toast(Object.keys(peta).length + ' KK diimpor (' + baru + ' baru)');
  }
  function imporKas(teks) {
    var r = bacaCSV(teks), kepala = (r[0] || []).map(function (h) { return h.trim().toLowerCase(); }), n = 0;
    var i = function (k) { return kepala.indexOf(k); };
    if (i('jumlah') < 0 || i('tanggal') < 0) { toast('Butuh kolom tanggal & jumlah', 'bahaya'); return; }
    r.slice(1).forEach(function (s) {
      var jml = Number(String(s[i('jumlah')] || '').replace(/[^\d]/g, '')); if (!jml) return;
      D.kas.push({ id: idBaru('ks'), tgl: (s[i('tanggal')] || hariIni()).trim(), jenis: /keluar/i.test(s[i('jenis')] || '') ? 'keluar' : 'masuk', kategori: (s[i('kategori')] || 'Lainnya').trim(), ket: (s[i('keterangan')] || '-').trim(), jumlah: jml }); n++;
    });
    simpan(); render(); toast(n + ' transaksi kas diimpor');
  }

  /* ========== 9. Mulai ========== */
  D = muat();
  if (!DEMO) simpan();
  /* Muat awal Supabase (hanya tabel publik; mode demo tidak pernah): bila
     cloud punya baris, pakai data cloud (menimpa data contoh lokal); bila
     cloud kosong, coba kirim data lokal sebagai seed; bila gagal/offline,
     pakai data lokal seperti sekarang. */
  if (!DEMO && window.RTRW_SUPABASE) window.RTRW_SUPABASE.muatAwal(
    { info: D.info, usaha: D.usaha, telpPenting: D.telpPenting },
    function (kunciLokal, baris) { D[kunciLokal] = baris; simpan(); render(); }
  );
  terapkan(Object.assign({ nama: TEMA.nama }, tampilan));
  $('#btnMode').addEventListener('click', function () {
    var jadi = document.documentElement.getAttribute('data-mode') === 'gelap' ? 'terang' : 'gelap';
    terapkan({ mode: jadi }); tampilan.mode = jadi; try { localStorage.setItem(KUNCI_TAMPILAN, JSON.stringify(tampilan)); } catch (x) {}
  });
  $('#btnPanel').addEventListener('click', function () {
    if (document.body.classList.contains('panel')) { keluarSesi(); location.hash = '#/'; toast('Anda keluar dari panel'); }
    else if (sesi()) location.hash = '#/panel/ringkas'; else pergi('#/masuk');
  });
  window.addEventListener('hashchange', function () { if (modalEl.open) tutupModal(); render(); });
  $('.bawah-publik a[href="#/"]').addEventListener('click', function (ev) { if (location.hash === '#/' || !location.hash) { ev.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else if (location.hash === '#pengumuman' || location.hash === '#agenda' || location.hash === '#kontak') { window.addEventListener('hashchange', function s() { window.removeEventListener('hashchange', s); window.scrollTo({ top: 0, behavior: 'smooth' }); }); } });
  window.addEventListener('afterprint', function () { $('#cetak').innerHTML = ''; });
  if (DEMO && !location.hash) history.replaceState(null, '', '#/panel/ringkas');
  render();
  if (/^https?:/.test(location.protocol)) { var mf = document.createElement('link'); mf.rel = 'manifest'; mf.href = 'manifest.webmanifest'; document.head.appendChild(mf); }
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol) && !DEMO) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
