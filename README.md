# Face Mamet — Living Office Engine

Sub-code engine mandiri untuk memvisualisasikan aktivitas multi-agent AI di dalam kantor virtual yang hidup (*Living Office*).

## 🎯 Visi & Keputusan Strategis

1. **Goal Utama Adalah 3D:** Target visual utama adalah **3D Living Office Engine** (Three.js / React Three Fiber / WebGL) dengan ruangan bergaya *stylized low-poly*, pencahayaan dinamis modern, dan kamera isometrik/orbit interaktif.
2. **Tanpa Fitur Audio (No Audio):** Bebas dari segala dependensi suara, SFX, dan BGM. Fokus murni pada keindahan visual dan simulasi interaktif.
3. **Sub-Code Mandiri & Terisolasi:** Berdiri independen di dalam direktori `face mamet` guna membangun dan mematangkan seluruh engine game sampai tuntas dan memuaskan.
4. **Integrasi ke Mamet Ecosystem adalah Tahap Terakhir:** Repositori inti `mamet os ecosystem` diperlakukan 100% Read-Only (steril). Integrasi ke core dilakukan setelah engine 3D selesai sempurna dan disetujui.

---

## 👥 Tim Karakter Manusia (Multi-Agent Squad)

- **Mamet (Team Leader & Orchestrator):** Bertugas di Command Center membagi instruksi dan memimpin rapat.
- **The Engineer (Senior Developer):** Bertugas di Engineer Room di depan monitor ganda dan server rack.
- **The Researcher (Data & RAG Analyst):** Bertugas di Research Room meneliti dokumen dan knowledge.
- **The Archivist (Memory Specialist):** Bertugas di Memory Vault menata arsip dan preferensi user.
- **TokenSaver (Courier Intern):** Membawa map berkas fisik antar meja kerja (*courier queue*), menjamin tidak ada berkas yang melayang mandiri.

---

## 📂 Struktur Proyek

```text
face mamet/
├── .gitignore                          # Aturan ignore (node_modules, logs, build)
├── README.md                           # Dokumentasi ringkas proyek
├── PLAN_GAMEFACE_MAMET.md              # Rencana induk dan keputusan Owner
├── INTEGRATION_MAP_READONLY_GAMEFACE.md # Peta integrasi read-only ke Mamet OS
├── ACTIVITY_CONTRACT_GAMEFACE.md       # Kontrak adapter aktivitas & event
└── .work/
    ├── gameface-phaser-prototype/      # Prototipe validasi logika 2D (42/42 tests PASS)
    ├── gameface-react-prototype/       # Eksperimen kanvas React avatar
    └── gameface-prototype/             # Fixture Activity Bus awal
```

---

## 🧪 Validasi Fondasi Logika

Fondasi logika telah diuji secara komprehensif dan terpisah dari renderer (*decoupled architecture*):
- NavGraph BFS Pathfinding
- Avatar FSM (Idle / Ngopi / Tidur Zzz / Kaget Bangun `!`)
- Courier Delivery Queue (pengantaran fisik berkas oleh TokenSaver)
- 5 Mode Workspace (`Global`, `Assistant`, `Engineer`, `Knowledge`, `Lite`)
- **Hasil Pengujian:** `42 / 42 Tests Passed (100% PASS)`.

---

## 🚀 Menjalankan Prototipe Fondasi

```bash
cd .work/gameface-phaser-prototype
npm install
node server.cjs
```
Buka browser di `http://localhost:4180` untuk melihat simulasi kantor multi-agent dan pengantaran berkas kurir.
