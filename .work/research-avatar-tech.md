# Riset teknologi face avatar Mamet Ecosystem

## Konteks repository
- React 18.2 + Vite 5 + Electron.
- App masuk melalui App.jsx -> OSDesktopShell -> ApplicationContainer.
- Modul didaftarkan melalui AppRegistry.
- HomeDashboard sudah merupakan modul terpisah dan terhubung ke Supabase realtime.

## Temuan teknologi
- Phaser menyediakan template resmi React + Vite dengan PhaserGame.jsx sebagai bridge dan EventBus untuk komunikasi React <-> Phaser. Cocok untuk game 2D berbasis scene.
  Sumber: https://github.com/phaserjs/template-react
  Sumber: https://phaser.io/news/2024/02/official-phaser-3-and-react-template
- PixiJS React v8 adalah integrasi deklaratif modern, tetapi dokumentasi rilis v8 menyebut dukungan eksklusif React 19. Repository saat ini memakai React 18.2, sehingga perlu upgrade atau memakai PixiJS langsung/versi adapter yang kompatibel.
  Sumber: https://pixijs.com/blog/pixi-react-v8-live
- React Three Fiber adalah renderer React untuk three.js, scene deklaratif dan interaktif, serta Vite bekerja out of the box. Versi fiber harus dipasangkan dengan major React yang sesuai; React 18 memakai fiber v8.
  Sumber: https://r3f.docs.pmnd.rs/getting-started/introduction
  Sumber: https://r3f.docs.pmnd.rs/getting-started/installation

## Rekomendasi
- MVP: Phaser 2D + React overlay/HUD.
- Face baru sebagai modul GameFace terpisah.
- Arus aktivitas melalui ActivityPort/ActivityBus, bukan komponen UI membaca database langsung.
- Avatar memakai state machine: idle, walking, thinking, coding, reading, alert, success.
- Event payload minimal: id, type, source, status, targetRoom, message, timestamp, correlationId.
- Ruangan awal: Command Center, Memory, Research, Engineer/Code, Knowledge Graph.
- 3D: fase lanjutan memakai React Three Fiber + Three.js + Drei setelah kebutuhan visual dan performa tervalidasi.
