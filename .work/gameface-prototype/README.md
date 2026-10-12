# GameFace Prototype

Prototype ini hanya untuk visualisasi dan pengujian kontrak aktivitas. Prototype tidak mengimpor, membaca, atau mengubah repository Mamet Ecosystem.

## Isi

- `index.html`: mockup kantor virtual dan avatar.
- `activity-bus.js`: Activity Bus berbasis ES module untuk browser.
- `activity-bus-fixture.cjs`: fixture Node.js untuk menguji normalisasi, deduplikasi, pemetaan ruangan, dan state avatar.
- `server.cjs`: server HTTP lokal sederhana.

## Menjalankan test fixture

```text
node .work/gameface-prototype/activity-bus-fixture.cjs
```

## Menjalankan preview

```text
node .work/gameface-prototype/server.cjs
```

Lalu buka `http://127.0.0.1:4173/` jika lingkungan browser dapat mengakses port lokal.
