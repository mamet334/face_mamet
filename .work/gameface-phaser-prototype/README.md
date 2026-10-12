# GameFace Phaser 2D — Multi-Agent Human Office Squad

Prototipe GameFace modular berbasis **Phaser 2D Game Engine**, **Multi-Agent Human Office Squad**, dan **Sistem Perilaku Menganggur (Santai & Tidur)**. Berdiri sepenuhnya di dalam folder terisolasi `.work/` tanpa mengubah kode repository Mamet Ecosystem.

---

## 🏗️ Struktur Tim Agen Manusia

Setiap ruangan kantor memiliki spesialis manusianya masing-masing:

1. **👑 Mamet Lead** (`command_spot`, Cyan): Project Manager / Orchestrator di Command Center.
2. **💻 Engineer** (`engineer_spot`, Amber): Senior Developer di depan monitor ganda & server rack.
3. **📚 Researcher** (`research_spot`, Purple): Analis data & RAG di meja riset dan dokumen.
4. **💾 Archivist** (`memory_spot`, Emerald): Penjaga memori di rak vault Truth Graph.
5. **☕ TokenSaver** (`lounge_spot`, Pink): Kurir efisiensi token yang sering santai di Pantry Lounge.

---

## 🛋️ Area Kantor Tematik & Pantry Lounge

Peta kantor 960x600 kini memiliki 6 area:
- **Baris Atas:**
  - `Command Center`: Meja konsol utama Mamet Lead.
  - `Research Room`: Rak buku dan meja penelitian dokumen RAG.
  - `Engineer Room`: Workstation coding dan server rack ber-LED.
- **Baris Bawah:**
  - `Memory Room`: Lemari vault kubus kristal memori.
  - `Pantry & Break Lounge`: Sofa santai, mesin pembuat kopi, dispenser air galon, dan cangkir kopi.
  - `Knowledge Graph Room`: Meja interaktif diagram kluster relasi data.
- **Tengah:**
  - `Central Hallway Corridor`: Jalur utama yang menghubungkan pintu semua ruangan.
  - `Alert & Incident Station`: Titik bahaya (lingkaran merah berikon `!`) saat terjadi kegagalan verifikasi.

---

## 😴 Perilaku Alami Saat Menganggur (Idle / Relax / Sleep)

Agen tidak hanya mematung saat tidak ada pekerjaan:
1. **Menganggur ~8 detik:** Agen otomatis masuk ke state **`☕ RELAX`** (santai, ngopi, atau peregangan).
2. **Menganggur ~18 detik:** Agen tertidur lelap dengan animasi balon **`😴 Zzz...`**.
3. **Tugas Masuk:** Agen yang sedang santai/tidur langsung **kaget terbangun (`⚡ WAKE UP!`)**, lalu bergegas ke meja kerja untuk mengeksekusi tugas.

---

## 🧪 Hasil Pengujian Unit Otomatis (Node.js)

```bash
node .work/gameface-phaser-prototype/test-foundations.mjs
```

Hasil: **22/22 Test LULUS (100% PASS)**:
- ✅ NavGraph 6 ruangan + Pantry Lounge BFS shortest path routing
- ✅ FSM state transitions (`IDLE` $\rightarrow$ `RELAXING` $\rightarrow$ `SLEEPING` $\rightarrow$ `SURPRISED` $\rightarrow$ `WORKING` $\rightarrow$ `SUCCESS`)
- ✅ Auto-Idle Behavior Timers
- ✅ ActivityBus normalisasi & deduplikasi

---

## 🎮 Menjalankan Live Preview Standalone

Pastikan server berjalan:
```bash
node .work/gameface-phaser-prototype/server.cjs
```

Buka URL:
👉 **`http://127.0.0.1:4180/`**

**Fitur Baru yang Bisa Dicoba:**
1. **Perhatikan Roster Agen di Panel Kanan:** Status setiap agen (Mamet, Engineer, Researcher, Archivist, TokenSaver) terpantau secara *real-time*.
2. **Biarkan agen menganggur selama ~8 detik:** Agen akan otomatis santai (`☕ RELAX`). Setelah ~18 detik, mereka akan tidur pulas (`😴 Zzz...`).
3. **Klik tombol "Jalankan Kode" saat Engineer tidur:** Amati bagaimana Engineer kaget bangun (`⚡ WAKE UP!`), langsung mengetik cepat di meja coding (`CODING`), dan merayakan `SUCCESS`!
4. **Klik tombol "Semua Agen Santai di Pantry Lounge":** Seluruh agen akan keluar dari ruangannya dan berkumpul di sofa Pantry Lounge untuk istirahat bersama!
5. **Klik tombol "Kembali ke Stasiun Kerja":** Semua agen bubar dari Pantry dan kembali ke ruangan tugas masing-masing.
