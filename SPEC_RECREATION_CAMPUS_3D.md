# Spesifikasi Desain: Hybrid Workplace & Recreation Campus 3D

**Tanggal Disetujui:** 2026-10-12  
**Status:** Dokumen Panduan Implementasi Resmi  
**Sifat:** Sub-Code Mandiri GameFace (`face mamet`)

---

## 1. Filosofi & Batasan Sistem

1. **Non-Otonom / User-Driven (Mamet Ecosystem Core):**
   - Seluruh proses komputasi, token LLM, dan eksekusi alat **hanya berjalan saat ada instruksi dari Owner** (*On-Demand / Human-in-the-Loop*).
   - Kantor 3D **bukan agen otonom liar** yang menghabiskan sumber daya sendiri.
2. **Visual Living AI Campus:**
   - Fasilitas rekreasi dan hiburan adalah representasi visual alami dari waktu **Siaga (*Standby on Call*)**.
   - Ketika Owner belum memberikan tugas, agen adalah manusia yang menikmati fasilitas kampus teknologi modern (berenang, main game, ngopi, dan tidur santai).
3. **Panggilan Tugas Cepat (*Recall on Command*):**
   - Begitu ada instruksi dari Owner atau kurir TokenSaver memanggil, agen seketika siaga (`!`), meninggalkan fasilitas hiburan, berlari kembali ke meja kerja, menyelesaikan tugas hingga tuntas, lalu bebas kembali bersantai.

---

## 2. Tata Ruang 3D (Spatial Architecture)

Dunia 3D dibagi menjadi dua zona berdampingan yang terhubung oleh koridor tengah (*Central Hallway*):

```text
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│          ZONA KERJA PRODUKTIF (WORKPLACE)    │       ZONA REKREASI & HIBURAN (RESORT)       │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 1. Command Center   (-9, 0, -5)              │ 1. Kolam Renang 3D      (18, 0, -4)          │
│    - Meja Kerja Mamet Lead                   │    - Kolam air jernih & deck kayu            │
│    - Monitor Utama & Papan Strategi          │    - Kursi berjemur (sun loungers) & payung  │
│ 2. Research Desk    (0, 0, -5)               │ 2. Game Console Lounge  (18, 0, 6)           │
│    - Meja Kerja The Researcher               │    - TV Layar Lebar & Mesin Arcade           │
│    - Rak Dokumen & Terminal RAG              │    - Sofa Gaming empuk & stik controller     │
│ 3. Engineer Bay     (9, 0, -5)               │ 3. Daybed Tiduran Zzz   (10, 0, 7)           │
│    - Meja Kerja The Engineer                 │    - Kasur santai empuk untuk tidur siang    │
│    - Curved Monitor & Server Racks           │ 4. Cafe & Snack Bar     (8, 0, 3)            │
│ 4. Memory Vault     (-8, 0, 6)               │    - Bar kopi, mesin espresso, & dispenser   │
│    - Meja Kerja The Archivist & Vault        │                                              │
│ 5. TokenSaver Hub   (-5, 0, -2)              │                                              │
│    - Stasiun kurir berkas fisik              │                                              │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 3. Spesifikasi Geometri & Properti Fasilitas Hiburan

### A. Kolam Renang 3D (Resort Pool Deck)
- **Cekungan Kolam (*Pool Basin*):** Ukuran 8m x 6m dengan dinding ubin pirus toska.
- **Air 3D (*Water Mesh*):** Material `MeshStandardMaterial` berwarna biru toska jernih (`0x06b6d4`), sedikit transparan (opacity 0.82), dengan pantulan cahaya halus (*roughness: 0.1, metalness: 0.2*).
- **Deck Tepi Kolam (*Pool Deck*):** Lantai kayu dek luar ruangan modern (*warm teak wood*).
- **Kursi Berjemur (*Sun Loungers*):** 2 kursi santai berjemur dengan sandaran miring dan payung pantai bergaris.
- **Aktivitas Agen:** The Researcher atau The Archivist duduk di kursi santai membaca buku atau merendam kaki santai.

### B. Game Console & Arcade Lounge
- **Layar TV Gaming 3D:** TV LED layar lebar (65 inch) dipasang di partisi dengan pendaran neon layar game dinamis.
- **Sofa Gaming / Beanbag:** Sofa empuk warna gelap yang nyaman di depan TV.
- **Mesin Arcade Retro:** Kabinet arcade klasik dengan marquee menyala dan layar CRT arcade.
- **Stik Controller 3D:** Controller konsol yang dipegang di kedua tangan karakter.
- **Aktivitas Agen:** The Engineer duduk di sofa gaming menggerakkan stik controller saat tidak ada tugas coding.

### C. Daybed / Sofa Tiduran Santai
- **Kasur Daybed Empuk:** Matras santai dengan bantal empuk dan selimut lipat.
- **Efek Visual Tidur:** Huruf `Z z z` 3D mengambang halus di atas kepala karakter dengan gelombang sinus.
- **Aktivitas Agen:** Agen yang telah lama menganggur tidur nyenyak di daybed.

### D. Cafe & Snack Bar
- **Bar Counter:** Meja bar kayu modern dengan 2 bangku bar tinggi (*bar stools*).
- **Mesin Kopi Espresso & Dispenser:** Mesin kopi merah dengan cangkir kopi yang siap diambil.

---

## 4. Sistem Navigasi & Node 3D (`NavGraph3D`)

Penambahan waypoints khusus rekreasi yang terhubung ke Koridor Tengah:
- `pool_deck_entrance` (15, 0, 0)
- `pool_lounger_1` (17, 0, -6)
- `pool_lounger_2` (20, 0, -6)
- `pool_edge_seat` (18, 0, -2)
- `game_lounge_entrance` (15, 0, 4)
- `game_sofa_seat` (18, 0, 6)
- `arcade_cabinet_spot` (21, 0, 8)
- `daybed_spot_rest` (11, 0, 7)
- `cafe_bar_stool` (8, 0, 3)

---

## 5. Logika Perilaku & Animasi Karakter (`CharacterAnimator.js` & FSM)

### Pose Animasi Baru:
1. **Pose Main Game (`GAMING`):**
   - Karakter duduk di sofa gaming.
   - Kedua tangan di depan memegang stik controller, jari bergerak menekan tombol.
   - Kepala menatap lurus ke arah layar TV game.
2. **Pose Santai Tepi Kolam (`POOL_RELAX`):**
   - Karakter duduk di kursi berjemur (*sun lounger*).
   - Tangan memegang majalah/buku atau rileks di sandaran tangan.
   - Sprite kacamata hitam / topi santai opsional.
3. **Pose Tidur Nyenyak Daybed (`DAYBED_REST`):**
   - Karakter berbaring / bersandar rileks di daybed.
   - Huruf `Zzz` mengambang lembut.

### Siklus Panggilan Tugas Cepat (*Recall on Command Sequence*):
1. **Instruksi Diterima:** Pemicu dari input Owner atau TokenSaver mendekat.
2. **Reaksi Kaget (`SURPRISED`):**
   - Karakter melompat kecil, tanda seru `!` muncul di atas kepala.
   - Stik game / cangkir kopi seketika disimpan.
3. **Berlari Kembali ke Meja (*Sprint Recall*):**
   - Karakter menyusuri rute `NavGraph 3D` tercepat menuju node workstation mejanya dengan kecepatan lari (*speed 6.0 units/sec*).
4. **Fokus Eksekusi:**
   - Duduk di kursi kerja, menyalakan monitor, dan bekerja (`CODING` / `RESEARCHING` / `STORING`).
5. **Kembali Santai:**
   - Setelah tugas selesai dan timer idle terpenuhi tanpa ada tugas baru, karakter berjalan santai kembali ke zona hiburan.

---

## 6. Verifikasi & Pengujian
- Unit test di `test-3d-engine.mjs` memvalidasi:
  1. Keberadaan seluruh node navigasi kolam renang dan game lounge.
  2. Rute terhubung tanpa jalan buntu antara setiap fasilitas hiburan ke meja kerja masing-masing agen.
  3. Transisi FSM dari santai di kolam/game console kembali ke workstation saat perintah di-trigger.
  4. Integritas ketat 0 dependensi audio (No Audio).
