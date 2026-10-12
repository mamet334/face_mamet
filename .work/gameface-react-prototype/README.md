# React Avatar Prototype

Komponen React pertama untuk rendering visual avatar 2D GameFace. Komponen ini berdiri di luar repository Mamet Ecosystem.

## File

- `MametAvatarCanvas.jsx`: komponen React berbasis Canvas.
- `MametAvatarCanvas.css`: tampilan panel dan Canvas.
- `AvatarPreview.jsx`: contoh penggunaan dan kontrol simulasi aktivitas real-time.
- `assets/mamet-avatar-sprite.png`: sprite sheet transparan karakter robot kantor AI.

## Fitur komponen

- state `idle`, `thinking`, `researching`, `coding`, `storing`, `alert`, dan `success`;
- animasi frame menggunakan `requestAnimationFrame`;
- dukungan `devicePixelRatio`;
- label status avatar;
- indikator thinking, alert, dan success;
- sprite sheet empat frame: idle, walking kiri, walking kanan, dan typing/thinking;
- fallback ke avatar vector jika sprite gagal dimuat;
- `FRAME_MAP` 12 pose dasar: idle, walking left, walking right, thinking, talking A, talking B, holding document, reading, carrying memory, success, listening, dan alert;
- callback klik avatar melalui `onAvatarClick`;
- tidak membaca database atau service Mamet.

## Simulasi aktivitas

`AvatarPreview` menyediakan empat tombol simulasi:

- `Mulai Research`: berjalan → researching → success → idle;
- `Jalankan Kode`: berjalan → coding → success → idle;
- `Simpan Memory`: berjalan → storing → success → idle;
- `Simulasi Error`: berjalan → thinking → alert → idle.

Saat satu aktivitas sedang berjalan, tombol lain dinonaktifkan agar simulasi tidak tumpang tindih.

## Penggunaan

```jsx
<MametAvatarCanvas
  state="coding"
  x={160}
  y={150}
  label="Mamet Avatar"
  onAvatarClick={() => console.log('avatar clicked')}
/>
```

Komponen ini sengaja belum memakai Phaser. Tujuannya menguji kontrak visual dan state avatar terlebih dahulu. Phaser dapat ditambahkan pada tahap berikutnya ketika dunia, pathfinding, dan scene mulai diperlukan.

Sprite sheet dapat diganti melalui prop `spriteSrc`:

```jsx
<MametAvatarCanvas spriteSrc="/assets/custom-avatar.png" state="coding" />
```

`FRAME_MAP` sudah siap untuk sprite sheet v2 dengan 12 frame. Sprite sheet saat ini masih memiliki 4 frame awal, sehingga indeks pose tambahan otomatis dibatasi ke frame terakhir yang tersedia sampai aset v2 dibuat.
