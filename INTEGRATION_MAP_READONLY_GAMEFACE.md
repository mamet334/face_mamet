# Peta Integrasi Read-only GameFace

**Status:** Analisis arsitektur awal

**Aturan:** Tidak ada file repository Mamet Ecosystem yang diubah. Semua poin di bawah adalah temuan dan rekomendasi, bukan instruksi patch.

## 1. Jalur UI yang sudah ada

```text
main.jsx
  -> Kernel.boot(serviceManager)
  -> App.jsx
  -> OSDesktopShell
  -> Sidebar + ApplicationContainer
  -> active application component
```

`ApplicationContainer` mempertahankan komponen aplikasi dan menyembunyikan aplikasi yang tidak aktif. Pola ini secara konseptual cocok untuk face baru sebagai modul aplikasi terpisah.

## 2. Titik integrasi potensial

### ApplicationRegistry / ApplicationManager

**Peran saat ini:** registrasi aplikasi, aktivasi aplikasi, dan notifikasi perubahan state aplikasi.

**Sinyal potensial:** `App:StateChanged`.

**Kegunaan GameFace:** avatar dapat menuju Command Center atau ruangan aplikasi ketika Owner mengganti aplikasi.

**Batas:** GameFace tidak boleh menjadikan perubahan aplikasi sebagai pengganti event aktivitas AI. Ini hanya sinyal navigasi.

### EventBus

**Peran saat ini:** komunikasi bernamespace melalui `on(event, callback)` dan `emit(event, payload)`.

**Temuan penting:**

- nama event harus memiliki namespace dengan tanda titik dua, misalnya `Category:EventName`;
- wildcard listener dinonaktifkan;
- payload dibungkus dengan `source`, `timestamp`, dan `data`;
- ada rate limit per namespace;
- subscriber menerima wrapper event, bukan payload mentah langsung.

**Konsekuensi desain:** Activity Adapter harus berlangganan daftar event yang eksplisit dan membaca `event.data` sesuai kontrak event masing-masing.

### Kernel

**Peran saat ini:** boot lifecycle, pendaftaran service, event system, observability, knowledge/memory, dan aktivasi sistem.

**Sinyal yang terlihat:** `Kernel:PhaseCompleted` dan `Kernel:BootComplete`.

**Kegunaan GameFace:** animasi boot, status siap, atau status degraded.

**Batas:** GameFace hanya subscriber. Jangan menempatkan logika visual ke Kernel dan jangan membuat boot menunggu renderer.

### ExecutionTraceService

**Peran saat ini:** menormalkan telemetry dari `agent_logs` menjadi timeline aktivitas.

**Event/domain yang sudah terlihat:**

- `Capability.Executed`;
- `Memory.Read.Start` dan `Memory.Read.End`;
- `Memory.Write.Start`, `Memory.Write.End`, dan `Memory.Write.Failed`;
- `Pipeline.Start`, `Pipeline.Completed`, dan `Pipeline.Failed`;
- `Provider.Request`, `Provider.Response`, `Provider.Error`, dan `Provider.Fallback`;
- `Planner.Start`, `Planner.End`, dan `Planner.Failed`;
- `RAG.Start`, `RAG.Retrieval.Start`, `RAG.Retrieval.End`, `RAG.NoResult`, dan `RAG.Error`;
- `Verification.Start`, `Verification.Pass`, dan `Verification.Fail`;
- `Tool.Requested`, `Tool.Invoked`, dan `Tool.Completed`;
- `Response.Generated`.

**Kegunaan GameFace:** sumber aktivitas AI, RAG, memory, tool, dan verification.

**Batas:** GameFace tidak boleh menganggap setiap telemetry event sebagai perintah avatar. Adapter perlu memilih event, menggabungkan lifecycle, dan menerapkan prioritas.

### AssistantService

**Peran saat ini:** menangani alur assistant, streaming response, skill, error, dan komunikasi ke endpoint AI.

**Sinyal yang terlihat:** `Skill:Started`, `Skill:StepDone`, dan `Skill:AwaitingAnswer`.

**Kegunaan GameFace:** state thinking, reading, waiting for Owner, dan success/error.

**Batas:** jangan menampilkan isi pesan atau prompt secara mentah di dunia game. Gunakan label aman dari adapter.

### Engineer service

**Peran saat ini:** aktivitas engineering, capability, task, recommendation, verification, dan session artifact.

**Sinyal yang terlihat:** `Engineer:Ready` serta recommendation error dengan `type: ERROR`.

**Kegunaan GameFace:** Engineer Room, state coding, verification, alert, dan success.

**Batas kritis:** GameFace tidak boleh memanggil operasi Engineer. Ia hanya mempresentasikan event yang diterbitkan sistem.

## 3. Urutan integrasi yang disarankan

### Integrasi A — Fixture offline

Gunakan event buatan dalam prototipe terisolasi:

- research start/end;
- code start/end;
- memory write start/end;
- verification failure;
- system ready.

Tujuan: menguji Activity Bus, deduplikasi, state machine, dan gerakan tanpa repository.

### Integrasi B — Sinyal navigasi

Secara konsep, baca perubahan aplikasi aktif dan tampilkan avatar menuju area yang sesuai. Ini paling mudah dipahami dan tidak memerlukan telemetry detail.

### Integrasi C — Event runtime eksplisit

Tambahkan subscriber eksplisit hanya untuk event yang sudah terbukti stabil. Mulai dari `Kernel:BootComplete`, memory lifecycle, verification lifecycle, dan beberapa pipeline/RAG event.

### Integrasi D — Engineering lifecycle

Setelah kontrak event aman, mapping aktivitas Engineer dan verification. Event error harus memiliki jalur prioritas ke Alert Area.

### Integrasi E — Live telemetry

Gunakan ExecutionTraceService atau sumber observability yang sudah ada hanya setelah menentukan filtering, privacy, rate limit, dan pengelompokan lifecycle.

## 4. Hal yang tidak boleh dilakukan

- Tidak memasang listener wildcard pada EventBus.
- Tidak membaca semua event dengan cara menyadap console.
- Tidak mengakses Supabase langsung dari Phaser Scene.
- Tidak mengubah Kernel agar cocok dengan animasi.
- Tidak memanggil Engineer, Assistant, atau Memory Service dari scene.
- Tidak menjadikan avatar sebagai pengambil keputusan sistem.
- Tidak menampilkan payload mentah atau data sensitif.
- Tidak mengganti HomeDashboard atau OSDesktopShell sebagai langkah awal.

## 5. Risiko yang ditemukan

### EventBus memiliki rate limit

GameFace harus melakukan throttling visual sendiri. Banyak event tidak boleh berarti banyak perpindahan avatar.

### Event payload memiliki wrapper

Adapter harus memproses struktur wrapper dengan benar dan tidak mengasumsikan payload ada di level paling atas.

### Sebagian aktivitas hanya tersedia sebagai telemetry

Tidak semua telemetry cocok dijadikan event navigasi. Perlu agregasi berdasarkan trace atau correlation ID.

### Aktivitas Engineer memiliki konsekuensi sensitif

Label visual harus disanitasi dan tidak boleh menampilkan command, path, atau isi patch secara otomatis.

### Renderer bukan sumber kebenaran

Posisi avatar, animasi, dan bubble adalah representasi sementara. Status sistem tetap berasal dari event runtime.

## 6. Keputusan arsitektur (Diperbarui 2026-10-10)

1. **Goal Akhir Adalah 3D:** Renderer utama GameFace bermigrasi ke 3D Living Office Engine (Three.js / React Three Fiber / WebGL). Prototipe 2D Phaser bertindak sebagai validasi logika awal yang kini sudah 100% tuntas.
2. **Fitur Suara Ditiadakan:** Bebas dari segala dependensi audio/suara (tanpa SFX/BGM), fokus murni visual & simulasi perilaku.
3. **Sub-Code Mandiri Terisolasi:** Pengembangan GameFace berfokus penuh di direktori sub-code `face mamet` hingga engine matang dan disetujui Owner.
4. **Integrasi ke Mamet OS adalah Tahap Paling Akhir:** Integrasi repositori (`frontend/src/...`) ditunda mutlak hingga engine 3D selesai sempurna dan disetujui Owner.
5. **Activity Adapter sebagai Satu-satunya Pintu:** Activity Adapter menjadi gerbang abstraksi dari event sistem ke GameFace 3D tanpa coupling langsung ke Supabase/Kernel.
6. **Multi-Agent Tim Manusia & Kurir Fisik:** Menampilkan 5 tokoh manusia (Mamet, Engineer, Researcher, Archivist, TokenSaver) dengan alur kurir berkas fisik tanpa berkas melayang gaib.
7. **Face Lama Tetap Aman:** HomeDashboard lama tetap menjadi modul independen dan fallback permanen.

## 7. Status hasil tahap ini

- Fondasi Logika 2D: **100% Tuntas & Teruji** (42/42 tests PASS).
- Pembangunan Engine 3D: **Aktif (Fase Utama Berjalan)** di direktori sub-code `face mamet`.
- Kontrak aktivitas & Workspace Modes: Disetujui & tervalidasi.
- Pemetaan integrasi read-only: Lengkap untuk jalur UI, EventBus, Kernel, Assistant, Engineer, dan ExecutionTrace.
- Perubahan repository inti: **NIHIL (100% Read-Only Steril)**.
- Langkah aman berikutnya: Membangun 3D Living Office Engine (Three.js / R3F) dengan mengadopsi lapisan logika yang sudah teruji.
