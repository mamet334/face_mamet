# Kontrak Aktivitas GameFace

**Status:** Draft kontrak untuk prototipe dan desain integrasi

**Batasan:** Kontrak ini tidak mengubah MAEF Event System dan tidak mengubah kode Mamet Ecosystem. Ini adalah adapter contract untuk memetakan event sistem menjadi aktivitas visual.

## 1. Tujuan

GameFace membutuhkan format aktivitas yang stabil agar avatar dapat merespons aktivitas Mamet tanpa membaca database, log internal, atau detail service secara langsung.

Kontrak ini memisahkan tiga hal:

1. event asli dari runtime/MAEF;
2. adapter yang menyaring dan menormalkan event;
3. perilaku visual avatar dan HUD.

## 2. Prinsip

- Event asli tetap menjadi sumber kebenaran.
- GameFace hanya menjadi subscriber/presenter.
- Tidak ada event wildcard; subscriber harus memilih namespace/event yang jelas.
- Event yang tidak aman atau terlalu detail tidak ditampilkan mentah.
- Satu aktivitas sistem dapat memiliki beberapa event lifecycle.
- Event yang sama tidak boleh membuat avatar berpindah berulang-ulang tanpa deduplikasi.
- `traceId` atau `correlationId` dipertahankan jika tersedia agar aktivitas dapat ditelusuri.

## 3. Format aktivitas ternormalisasi

```js
{
  id: "activity-uuid",
  eventType: "research.started",
  source: "assistant",
  domain: "research",
  status: "running",
  priority: "normal",
  targetRoom: "research",
  avatarState: "researching",
  message: "Mamet sedang melakukan riset",
  timestamp: "2026-10-09T20:40:00.000Z",
  traceId: "trace-uuid-or-null",
  correlationId: "correlation-uuid-or-null",
  metadata: {
    safeLabel: "Research",
    progress: null
  },
  visibility: "owner"
}
```

## 4. Nilai yang diizinkan

### Domain

- `system`
- `conversation`
- `research`
- `memory`
- `rag`
- `tool`
- `engineering`
- `verification`
- `workspace`

### Status

- `pending`
- `running`
- `success`
- `failed`
- `cancelled`
- `unknown`

### Prioritas

- `owner`
- `critical`
- `high`
- `normal`
- `low`

### Ruangan

- `command`
- `research`
- `memory`
- `engineer`
- `knowledge`
- `alert`

### State avatar

- `idle`
- `walking`
- `thinking`
- `reading`
- `researching`
- `coding`
- `storing`
- `alert`
- `success`

## 5. Pemetaan event awal

| Event sumber | Domain | Status | Ruangan | State avatar |
|---|---|---:|---|---|
| `Kernel:BootComplete` | system | success | command | success lalu idle |
| `App:StateChanged` | workspace | running | command | walking |
| `Memory.Read.Start` | memory | running | memory | reading |
| `Memory.Read.End` | memory | success/failed | memory/alert | success/alert |
| `Memory.Write.Start` | memory | running | memory | storing |
| `Memory.Write.End` | memory | success/failed | memory/alert | success/alert |
| `RAG.Start` | rag | running | research | researching |
| `RAG.Retrieval.Start` | rag | running | research | researching |
| `RAG.Retrieval.End` | rag | success | research | success lalu idle |
| `RAG.Error` | rag | failed | alert | alert |
| `Pipeline.Start` | research | running | research | thinking |
| `Pipeline.Completed` | research | success | research | success lalu idle |
| `Pipeline.Failed` | research | failed | alert | alert |
| `Tool.Requested` | tool | pending | command | thinking |
| `Tool.Invoked` | tool | running | research/engineer | working |
| `Tool.Completed` | tool | success/failed | command/alert | success/alert |
| `Verification.Start` | verification | running | engineer | thinking |
| `Verification.Pass` | verification | success | engineer | success lalu idle |
| `Verification.Fail` | verification | failed | alert | alert |
| `Engineer:Ready` | engineering | success | engineer | success lalu idle |
| `Engineer:Recommendation` dengan `type: ERROR` | engineering | failed | alert | alert |

## 6. Aturan deduplikasi

Aktivitas memakai kunci deduplikasi berikut, dari yang paling kuat:

1. `correlationId` jika tersedia;
2. `traceId + eventType` jika tersedia;
3. `id` event asli;
4. kombinasi `source + eventType + timestamp window` sebagai fallback terbatas.

Event lifecycle yang sama tidak boleh memerintahkan avatar berjalan lagi jika avatar sudah berada di ruangan target dan aktivitas masih `running`.

## 7. Aturan prioritas visual

Jika beberapa aktivitas datang bersamaan:

1. event Owner atau event kritis menuju `alert`;
2. error atau verification failure;
3. engineering yang sedang berjalan;
4. research/RAG/tool;
5. memory;
6. perubahan workspace biasa.

Aktivitas yang kalah prioritas tetap masuk ke activity stream, tetapi tidak langsung memindahkan avatar.

## 8. Keamanan tampilan

GameFace hanya menampilkan label aman seperti `Menjalankan riset`, `Menyimpan memory`, atau `Verifikasi gagal`.

GameFace tidak menampilkan secara otomatis:

- isi prompt lengkap;
- token atau credential;
- isi dokumen privat;
- command mentah yang sensitif;
- stack trace lengkap;
- payload database mentah.

Detail teknis hanya dibuka jika Owner secara eksplisit memilih panel detail.

## 9. Mode tampilan

### Live mode

Aktivitas baru memengaruhi avatar dan HUD.

### Quiet mode

Aktivitas tetap masuk ke log, tetapi avatar hanya merespons event prioritas `owner` atau `critical`.

### Replay mode

Direncanakan untuk tahap berikutnya. Mode ini memakai event yang sudah ada dan tidak menjalankan ulang proses aslinya.

## 10. Kontrak adapter

Adapter konseptual menerima event asli dan menghasilkan nol atau satu aktivitas visual:

```js
function normalizeForGameFace(sourceEvent) {
  // sourceEvent tetap read-only
  // return null jika event tidak relevan atau tidak aman ditampilkan
  return {
    id,
    eventType,
    source,
    domain,
    status,
    priority,
    targetRoom,
    avatarState,
    message,
    timestamp,
    traceId,
    correlationId,
    metadata,
    visibility
  };
}
```

Adapter tidak boleh mengubah event sumber dan tidak boleh menjalankan capability apa pun.

## 11. Kriteria kontrak siap dipakai

Kontrak dianggap siap untuk prototipe berikutnya jika:

- semua event memiliki domain, status, ruangan, dan state avatar;
- event sensitif sudah memiliki aturan penyaringan;
- aktivitas ganda dapat dideduplikasi;
- event gagal tidak menghentikan GameFace;
- Activity Bus dapat diuji dengan fixture tanpa database;
- tidak ada kebutuhan mengubah Kernel hanya untuk membuat animasi.
