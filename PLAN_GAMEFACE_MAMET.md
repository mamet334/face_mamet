# Rencana GameFace Mamet Ecosystem

**Status:** Perencanaan Aktif & Pembangunan Engine Mandiri

**Keputusan Owner (Diperbarui 2026-10-10):** 
1. **Fokus Penuh Membangun GameFace Engine:** `face mamet` diposisikan sebagai sub-code / modul engine mandiri yang dibangun dan dimatangkan terlebih dahulu hingga memenuhi seluruh ekspektasi visual dan interaktivitas Owner.
2. **Goal Akhir Adalah 3D:** Target visual dan pengalaman pengguna utama adalah **3D (Three.js / React Three Fiber / WebGL 3D Living Office)**. Prototipe 2D saat ini berfungsi sebagai fondasi validasi alur logika (NavGraph, FSM, Kurir Berkas, Workspace Modes) sebelum diimplementasikan penuh ke engine 3D.
3. **Fitur Suara Ditiadakan (No Audio):** Secara tegas **TIDAK MENGGUNAKAN FITUR SUARA** (tanpa SFX/BGM). Simulasi berfokus murni pada visual dan perilaku interaktif.
4. **Integrasi ke Mamet Ecosystem adalah Tahap Terakhir:** Integrasi modul sub-code ke dalam repositori inti `mamet os ecosystem` baru akan dilakukan pada tahap paling akhir setelah seluruh engine 3D dan fitur visual selesai dan disetujui.
5. **Konsep Multi-Agent Tim Manusia (Disetujui & Selesai):** Wujud berupa 5 karakter manusia ekspresif (*Human Office Squad*) dengan spot lounge terpisah di Pantry, bukan robot tunggal.
6. **Logika Kurir Berkas Fisik (Disetujui & Selesai):** Tidak ada berkas melayang sendiri; TokenSaver (*Courier Intern*) membawa map fisik secara nyata antar meja.
7. **Mode Workspace Mamet OS (Disetujui & Selesai):** Mendukung 5 mode workspace (`Global`, `Assistant`, `Engineer`, `Knowledge`, `Lite`) dengan penyorotan ruangan aktif dan kartu izin HUD.

**Tanggal keputusan:** 2026-10-10 (Arahan Strategis: Goal 3D, Tanpa Suara, Fokus Engine Sub-Code, Integrasi Tahap Akhir)

**Kemajuan Saat Ini (Diperbarui 2026-10-12):**
- **Repositori GitHub Terhubung & Bersih:** Terhubung ke `https://github.com/mamet334/face_mamet.git` (branch `main`). Aturan `.gitignore` ketat terpasang aktif, **0 file `node_modules` terupload (100% steril)**.
- **Engine 3D (Tahap 5) Selesai Dibangun:** Three.js 3D Living Office Engine aktif pada 60 FPS di `.work/gameface-3d-engine/` dan live preview di `http://127.0.0.1:5180/`.
- **5 Karakter Tim Manusia 3D Ekspresif:** Mamet Lead, The Engineer, The Researcher, The Archivist, dan TokenSaver dengan model low-poly 3D prosedural lengkap dengan sendi animasi (berjalan, mengetik, ngopi, tidur Zzz di sofa/meja, kaget bangun `!`, dan membawa map berkas fisik).
- **Kurir Berkas Fisik 3D (TokenSaver):** FIFO delivery queue menggerakkan TokenSaver mengambil map berkas manila di meja pengirim dan menyerahkannya langsung ke meja penerima secara fisik (tidak ada berkas melayang gaib).
- **5 Mode Workspace Mamet OS 3D:** (`Global`, `Assistant`, `Engineer`, `Knowledge`, `Lite`) dengan penyorotan karpet ruangan dan spotlight dinamis.
- **Kamera 3D Interaktif:** Orbit controls dengan smooth cinematic preset focus ke masing-masing meja kerja agen.
- **Integritas Ketat Tanpa Audio (No Audio):** Nol dependensi suara, SFX, atau BGM (100% visual simulation).
- **Pengujian Unit 3D Lulus Penuh:** **38/38 Unit Test 3D Lulus (100% PASS)** dan repositori inti `mamet os ecosystem` tetap 100% steril (Read-Only).

**Batasan Utama:** Repositori inti `mamet os ecosystem` tetap steril (Read-Only) sampai seluruh engine GameFace 3D selesai dibangun dan disetujui.

## 1. Tujuan

Membangun **GameFace Engine (Living Office AI)** sebagai sub-code mandiri dengan target visual akhir **3D interaktif**. Engine ini memvisualisasikan seluruh aktivitas agen AI, alur data antar-departemen, dan workspace secara hidup, manusiawi, dan dinamis.

Face baru ini berdiri sebagai sub-code independen yang siap dipasang ke dalam Mamet Ecosystem pada tahap akhir tanpa merusak atau mengganggu MAEF Kernel lama.

## 2. Prinsip kerja

1. **Sub-Code Mandiri & Terisolasi:** Fokus membangun engine GameFace secara terpisah sampai matang dan memuaskan.
2. **Integrasi Repositori di Tahap Akhir:** Tidak ada penggabungan ke core Mamet Ecosystem sebelum engine 3D selesai dan disetujui Owner.
3. **Read-Only terhadap Mamet Ecosystem:** Repositori inti hanya dibaca sebagai referensi arsitektur data dan kontrak telemetri.
4. **Tanpa Fitur Audio:** Murni visual dan interaksi grafis, tanpa sistem suara atau dependensi audio.
5. **Transisi Terstruktur 2D ke 3D:** Menggunakan fondasi logika yang sudah teruji 100% (state machine, activity bus, navgraph) untuk menggerakkan engine 3D.

## 3. Temuan arsitektur yang menjadi dasar

Dari inspeksi read-only terhadap repository:

- Frontend menggunakan React, Vite, dan Electron.
- `main.jsx` melakukan bootstrap Kernel sebelum UI dimuat.
- `App.jsx` memeriksa session Supabase lalu merender `OSDesktopShell` setelah login.
- `OSDesktopShell` memuat Sidebar dan `ApplicationContainer`.
- `ApplicationContainer` menampilkan aplikasi berdasarkan aplikasi aktif.
- `AppRegistry` mendaftarkan modul seperti `HomeDashboard`, `ConversationEngine`, `ResearchApp`, `MemoryApp`, dan `Settings`.
- `HomeDashboard` adalah modul knowledge graph yang sudah memiliki aktivitas realtime dari Supabase.
- Arsitektur tersebut menunjukkan adanya pola aplikasi modular yang secara konsep dapat menjadi lokasi integrasi face baru.

Temuan ini belum menjadi izin untuk mengubah file apa pun.

## 4. Konsep produk: Multi-Agent Human Office Squad

Nama kerja: **Mamet Living Office** atau **Mamet Human Agency**.

Face menampilkan suasana kantor agensi AI virtual yang hidup dengan **Multi-Agent Tokoh Manusia** (bukan robot kaku), di mana setiap spesialis memiliki kepribadian, meja kerja, dan perilaku alami manusiawi:

### A. Tokoh Tim Karakter Manusia
1. **Mamet (Team Leader & Orchestrator):** Pria berkemeja smart-casual rapi dengan ID lanyard. Bertugas di Command Center membagi instruksi dan menyapa Owner.
2. **The Engineer (Senior Developer):** Berpakaian hoodie kasual, kacamata, headphone. Bertugas di Engineer Room di depan monitor ganda dan server rack.
3. **The Researcher (Data & RAG Analyst):** Berpakaian cardigan/blazer rapi dengan tablet/buku. Bertugas di Research Room meneliti dokumen dan knowledge.
4. **The Archivist (Memory Specialist):** Berpakaian bernuansa hijau/pustakawan kalem. Bertugas di Memory Room menata kubus arsip dan preferensi user.
5. **TokenSaver (Junior Intern / Courier):** Berjaket sneakers lincah. Bertugas membawa map dokumen antar ruangan untuk efisiensi token.

### B. Area Kantor Tematik
- **Command Center:** Stasiun kerja Mamet Lead dan ringkasan status operasional.
- **Research Room:** Meja riset, rak buku, dan sintesis dokumen/RAG.
- **Engineer Room:** Workstation coding, terminal runtime, dan server rack.
- **Memory Room:** Lemari vault penyimpanan dan kristal Truth Graph.
- **Knowledge Graph Room:** Meja hologram relasi data dan kluster insight.
- **Alert & Verification Hub:** Stasiun inspeksi kualitas dan peringatan error.
- **Pantry & Break Lounge (Area Santai):** Meja kopi, dispenser air, sofa empuk, dan tanaman hias untuk agen yang sedang standby.

### C. Perilaku Alami Saat Menganggur (Idle / Relaxing / Sleeping)
Agen tidak hanya berdiri mematung saat tidak ada pekerjaan:
- **Santai & Ngopi (`RELAXING`):** Jika beberapa waktu menganggur, agen berjalan ke Pantry atau bersandar di kursi sambil memegang cangkir kopi/teh.
- **Tidur Nyenyak (`SLEEPING`):** Jika menganggur lama tanpa antrean tugas, agen tertidur di meja kerjanya atau di sofa santai dengan gelembung animasi `Zzz`.
- **Kaget & Terbangun (`SURPRISED`):** Begitu ada instruksi baru masuk dari Owner, agen yang sedang santai/tidur langsung kaget (tanda seru `!`), terbangun terburu-buru, lalu langsung fokus mengeksekusi tugasnya di komputer.
- **Kolaborasi:** Agen dapat saling mengoper berkas data, bertegur sapa, atau memberikan selebrasi saat verifikasi berhasil.

## 5. Rute Teknologi Engine Menuju Target 3D

### Target Utama: 3D Living Office Engine (React Three Fiber / Three.js / WebGL)
Target visual dan pengalaman pengguna akhir adalah **3D interaktif**:
- **Renderer 3D:** Three.js + React Three Fiber (R3F) dengan ekosistem `@react-three/drei`.
- **Dunia Kantor 3D:** Model ruangan isometrik/perspektif 3D low-poly stylization modern, lantai bertekstur smart office, kubus memori transparan, layar terminal berpendar (*emissive glow*), dan pencahayaan dinamis (*ambient & point lights*).
- **Karakter Manusia 3D:** Model karakter tim 3D bergaya *stylized chibi human* dengan rig animasi (ngopi, tidur di sofa, mengetik, kaget terbangun, dan membawa map berkas fisik).
- **Kamera Interaktif:** Mendukung pan, tilt, dan smooth zoom untuk menginspeksi meja kerja masing-masing agen secara sinematik.

### Fondasi Logika 2D (Fase Validasi yang Telah Selesai):
Prototipe Phaser 2D telah berhasil membuktikan dan memvalidasi 100% logika inti sistem:
- NavGraph waypoint BFS pathfinding.
- Avatar FSM (Finite State Machine) dan Idle Behaviors (Ngopi / Tidur Zzz / Kaget Bangun).
- Kurir Berkas Fisik (TokenSaver delivery queue) tanpa berkas melayang gaib.
- 5 Mode Workspace Mamet OS (`Global`, `Assistant`, `Engineer`, `Knowledge`, `Lite`).

Karena lapisan logika (`ActivityBus`, `AvatarStateMachine`, `NavGraph`, dan `ActivityTypes`) dirancang *decoupled* (terpisah penuh dari kanvas), seluruh logika ini siap diadopsi langsung oleh engine 3D.

## 6. Arsitektur target konseptual

```text
Mamet Kernel / Runtime Services (Read-Only)
            |
            v
        Activity Port
            |
            v
        Activity Bus
          /       \
         v         v
   React HUD    3D Engine Scene (Three.js / R3F)
                    |
                    v
            Avatar State Machine
```

### Activity Port

Lapisan ini menerjemahkan aktivitas internal menjadi format visual yang stabil. Face tidak boleh bergantung langsung pada detail Supabase atau service internal.

Contoh format event:

```js
{
  id: "activity-184",
  type: "code_execution",
  source: "EngineerWorkspace",
  status: "running",
  targetRoom: "engineer",
  message: "Menjalankan pemeriksaan kode",
  timestamp: "2026-10-09T20:40:00+07:00",
  correlationId: "run-991"
}
```

### Activity Bus

Activity Bus meneruskan aktivitas ke avatar, HUD, notifikasi, efek visual, dan log. Satu event dapat dipakai oleh beberapa bagian tanpa membuat komponen-komponen tersebut saling bergantung.

### Avatar State Machine

State awal:

```text
idle
walking
thinking
coding
reading
researching
alert
success
```

Contoh alur:

```text
activity started
       |
       v
walking -> coding/researching/reading
       |
       v
success atau alert
       |
       v
idle
```

## 7. Struktur modul konseptual

Struktur berikut hanya rancangan, bukan instruksi untuk langsung membuat file:

```text
frontend/src/components/game-face/
├── GameFace.jsx
├── GameHud.jsx
├── game/
│   ├── MametGame.jsx
│   ├── EventBus.js
│   ├── scenes/
│   │   ├── OfficeScene.js
│   │   └── LoadingScene.js
│   ├── entities/
│   │   └── MametAvatar.js
│   ├── state/
│   │   └── avatarStateMachine.js
│   └── world/
│       └── officeMap.js
└── activity/
    ├── ActivityBus.js
    └── activityTypes.js
```

## 8. Tahapan rencana

### Tahap 0 — Persetujuan dan batasan

- Menetapkan bahwa pekerjaan awal hanya read-only dan perencanaan.
- Menentukan nama face dan gaya visual.
- Menentukan apakah prototipe akan dibuat di luar repository terlebih dahulu.
- Menentukan perangkat utama: desktop saja atau desktop dan mobile.

**Hasil:** keputusan Owner dan batas proyek yang jelas.

### Tahap 1 — Prototipe visual terisolasi

Prototipe dibuat di folder terpisah dari repository Mamet Ecosystem.

Ruang lingkup:

- satu map kantor sederhana;
- satu avatar;
- tiga ruangan;
- animasi idle dan walking;
- perpindahan berdasarkan waypoint;
- bubble status;
- beberapa tombol simulasi aktivitas;
- tanpa akses ke database atau Kernel.

**Hasil:** dapat menilai apakah pengalaman visualnya menyenangkan dan tidak membosankan.

### Tahap 2 — Desain kontrak aktivitas

Menentukan tipe event yang stabil, misalnya:

- `chat_started`;
- `chat_completed`;
- `research_started`;
- `memory_created`;
- `document_uploaded`;
- `code_execution_started`;
- `code_execution_completed`;
- `system_error`;
- `workspace_changed`.

Setiap event harus memiliki status, sumber, tujuan ruangan, pesan singkat, timestamp, dan correlation ID jika diperlukan.

**Hasil:** Activity Port dan Activity Bus memiliki kontrak yang dapat diuji tanpa mengubah repository.

### Tahap 3 — Desain integrasi read-only

Membaca service, registry, dan event yang sudah tersedia di repository untuk memetakan sumber aktivitas yang mungkin digunakan.

Pada tahap ini belum ada perubahan kode. Yang dibuat hanya dokumen pemetaan:

- sumber event;
- nama service;
- lifecycle aktivitas;
- risiko coupling;
- data yang aman ditampilkan di avatar;
- aktivitas yang sebaiknya tidak ditampilkan.

**Hasil:** peta integrasi dan daftar gap yang diketahui.

### Tahap 4 — Rencana implementasi terisolasi

Jika Owner menyetujui implementasi, kode baru terlebih dahulu dirancang sebagai modul terpisah dengan batas yang jelas.

Rencana perlindungan:

- tidak mengubah HomeDashboard;
- tidak mengganti OSDesktopShell secara langsung;
- tidak mengubah Kernel untuk kebutuhan visual;
- tidak membaca database langsung dari scene;
- menyediakan fallback ke face lama;
- menambahkan pengujian untuk event dan state machine;
- menilai build sebelum integrasi lebih dalam.

**Hasil:** proposal teknis rinci yang harus disetujui sebelum coding.

### Tahap 5 — Pembangunan 3D GameFace Engine (Fokus Utama Saat Ini)

Fokus penuh saat ini adalah membangun engine 3D GameFace sebagai sub-code mandiri sebelum menyentuh integrasi core:

- **Setup 3D Runtime:** Three.js + React Three Fiber (R3F) dengan `@react-three/drei`.
- **Dunia Kantor 3D:** Model ruangan isometrik/perspektif 3D low-poly modern (Command Center, Research Room, Engineer Room, Memory Vault, dan Pantry Lounge).
- **Karakter Tim Manusia 3D:** Model karakter 3D stylized human (Mamet, Engineer, Researcher, Archivist, TokenSaver) dengan rig pose (kerja, ngopi, tidur sofa Zzz, kaget bangun, dan kurir membawa map).
- **Kamera 3D Interaktif:** Kamera orbit/isometrik dengan kontrol pan, tilt, dan smooth auto-focus zoom ke meja pekerja yang sedang aktif.
- **Porting Logika:** Menghubungkan logika yang sudah teruji 100% (Avatar FSM, NavGraph 3D, Delivery Queue, dan ActivityAdapter) ke scene 3D.

**Hasil:** GameFace Engine 3D hidup, interaktif, dan memuaskan sesuai visi visual Owner.

### Tahap 6 — Penyempurnaan Visual & Interaktivitas Owner (Tanpa Audio)

- **Fitur Suara Ditiadakan:** Sesuai arahan tegas Owner, **tidak ada fitur audio/suara** (bebas dependensi suara).
- Interaktivitas klik langsung pada objek 3D (meja, terminal, sofa, avatar).
- Pengaturan visual: orientasi kamera, visual quality, dan reset view.
- Mode inspeksi mendalam: klik pekerja 3D untuk melihat alur tugas dan status aktivitas secara sinematik.

**Hasil:** Pengalaman pengguna visual 3D yang mulus, stabil, dan bebas distraksi suara.

### Tahap 7 — Integrasi ke Core Mamet Ecosystem (Tahap Paling Akhir)

Integrasi ke dalam repositori inti `mamet os ecosystem` **hanya dilakukan pada tahap paling akhir** setelah engine 3D selesai sempurna dan disetujui Owner:

- Memasang sub-code GameFace 3D ke `frontend/src/components/game-face/`.
- Mendaftarkan GameFace ke `AppRegistry` sebagai modul tampilan resmi.
- Menghubungkan ActivityAdapter ke live event bus Mamet OS tanpa mengubah MAEF Kernel.
- Mempertahankan HomeDashboard lama sebagai fallback permanen.

**Hasil:** Face baru 3D resmi beroperasi penuh di dalam Mamet Ecosystem.

## 9. Risiko dan pengendalian

### Risiko: face baru mengganggu face lama
Pengendalian: modul terpisah, tidak mengganti HomeDashboard, dan selalu menyediakan akses kembali ke face lama.

### Risiko: avatar bergerak terlalu sering
Pengendalian: Activity Bus memiliki deduplikasi, prioritas, cooldown, dan antrean pengantaran berkas (*courier queue*).

### Risiko: coupling dengan Kernel atau Supabase
Pengendalian: gunakan Activity Port sebagai adapter. Scene 3D hanya menerima event terstruktur.

### Risiko: informasi sensitif tampil di ruang virtual
Pengendalian: tentukan klasifikasi event dan data yang boleh divisualisasikan. Pesan di avatar harus ringkas dan aman.

### Risiko: performa grafis 3D
Pengendalian: gunakan gaya *stylized low-poly*, optimasi geometri instancing, batasi draw calls, dan gunakan pencahayaan terhitung efisien.

### Risiko: integrasi terburu-buru
Pengendalian: integrasi ke Mamet OS ditunda secara mutlak ke tahap paling akhir setelah engine 3D mandiri disetujui penuh oleh Owner.

## 10. Kriteria keberhasilan awal

Rancangan dan engine dianggap tuntas jika:

- face lama tetap tidak tersentuh;
- dunia kantor 3D berjalan mulus pada 60 FPS di desktop;
- karakter 3D manusia menampilkan pose kerja, santai, tidur Zzz, dan kurir membawa map berkas;
- gerakan dan alur berkas 3D merepresentasikan aktivitas AI secara logis;
- pengguna dapat memahami status sistem secara visual tanpa log teknis;
- tidak ada fitur audio/suara yang mengganggu;
- modul sub-code siap dipasang ke Mamet OS saat Owner memberikan persetujuan final.

## 11. Status Keputusan Owner (Diperbarui 2026-10-10)

1. **Gaya Visual & Dimensi:** ✅ **DISETUJUI (2026-10-10): GOAL UTAMA ADALAH 3D** (Stylized Low-Poly / Modern 3D Living Office via Three.js / R3F).
2. **Efek Suara / Audio:** ❌ **DITOLAK / TIDAK DIGUNAKAN (2026-10-10): Owner menegaskan tidak ingin fitur suara.**
3. **Posisi Kode:** ✅ **DISETUJUI: Sub-Code Mandiri Terisolasi** (`face mamet`) untuk membangun engine secara terpisah.
4. **Fokus Pengerjaan:** ✅ **Membangun & mematangkan GameFace Engine sampai tuntas sesuai keinginan Owner.**
5. **Waktu Integrasi ke Mamet OS:** ⏳ **TAHAP PALING AKHIR (FINAL PHASE)** setelah seluruh engine 3D selesai dan disetujui.
6. **Jumlah Agen:** ✅ Multi-Agent Tim Manusia 5 Pekerja (Mamet Lead, Engineer, Researcher, Archivist, TokenSaver).
7. **Perilaku Idle:** ✅ Otomatis santai/ngopi di pantry lounge, tidur Zzz di sofa/meja, dan kaget bangun saat tugas tiba.
8. **Pengantaran Berkas:** ✅ Fisik dibawa oleh kurir TokenSaver dengan antrean pengantaran teratur (tidak ada berkas melayang gaib).
9. **Mode Workspace:** ✅ 5 mode workspace (`Global`, `Assistant`, `Engineer`, `Knowledge`, `Lite`) dengan visual aktif/off-scope.
10. **Repositori Inti:** ✅ **Steril 100% (Read-Only)** sampai ada persetujuan integrasi final.

## 12. Aturan kerja yang berlaku

Sampai ada persetujuan integrasi final:

> **Mamet Ecosystem diperlakukan sebagai sumber yang hanya boleh dibaca (Read-Only).**

Seluruh pembangunan engine GameFace 3D dilakukan di dalam direktori sub-code `face mamet` tanpa mengubah repositori inti.
