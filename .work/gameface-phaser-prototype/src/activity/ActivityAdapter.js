/**
 * ActivityAdapter.js
 * Adapter Penerjemah Telemetri Nyata Mamet Ecosystem ke GameFace ActivityBus
 * Menerjemahkan sinyal dari ExecutionTraceService, EventBus, dan Supabase agent_logs
 * tanpa menyentuh atau mengganggu core kernel.
 */

import { normalizeActivity } from './ActivityBus.js';

// Pemetaan tipe event ekosistem Mamet ke domain & status GameFace
const MAMET_EVENT_MAP = {
  // 1. Pipeline & Orchestration
  'Pipeline.Start': { domain: 'system', status: 'running', targetRoom: 'command', avatarState: 'thinking', agent: 'mamet' },
  'Pipeline.Completed': { domain: 'system', status: 'success', targetRoom: 'command', avatarState: 'success', agent: 'mamet' },
  'Pipeline.Failed': { domain: 'system', status: 'failed', targetRoom: 'alert', avatarState: 'alert', agent: 'mamet' },

  // 2. RAG & Knowledge Retrieval (Researcher)
  'RAG.Start': { domain: 'rag', status: 'running', targetRoom: 'research', avatarState: 'researching', agent: 'researcher' },
  'RAG.Retrieval.Start': { domain: 'rag', status: 'running', targetRoom: 'research', avatarState: 'reading', agent: 'researcher' },
  'RAG.Retrieval.End': { domain: 'rag', status: 'success', targetRoom: 'research', avatarState: 'success', agent: 'researcher' },
  'RAG.NoResult': { domain: 'rag', status: 'failed', targetRoom: 'research', avatarState: 'thinking', agent: 'researcher' },
  'RAG.Error': { domain: 'rag', status: 'failed', targetRoom: 'alert', avatarState: 'alert', agent: 'researcher' },

  // 3. Engineering & Code Execution (The Engineer)
  'Engineer:TaskAssigned': { domain: 'engineering', status: 'running', targetRoom: 'engineer', avatarState: 'coding', agent: 'engineer' },
  'Capability.Executed': { domain: 'engineering', status: 'running', targetRoom: 'engineer', avatarState: 'coding', agent: 'engineer' },
  'Engineer:ExecutionPassed': { domain: 'engineering', status: 'success', targetRoom: 'engineer', avatarState: 'success', agent: 'engineer' },
  'Verification.Start': { domain: 'verification', status: 'running', targetRoom: 'engineer', avatarState: 'thinking', agent: 'engineer' },
  'Verification.Pass': { domain: 'verification', status: 'success', targetRoom: 'engineer', avatarState: 'success', agent: 'engineer' },
  'Verification.Fail': { domain: 'verification', status: 'failed', targetRoom: 'alert', avatarState: 'alert', agent: 'engineer' },

  // 4. Memory & Knowledge Vault (The Archivist)
  'Memory.Read.Start': { domain: 'memory', status: 'running', targetRoom: 'memory', avatarState: 'reading', agent: 'archivist' },
  'Memory.Read.End': { domain: 'memory', status: 'success', targetRoom: 'memory', avatarState: 'idle', agent: 'archivist' },
  'Memory.Write.Start': { domain: 'memory', status: 'running', targetRoom: 'memory', avatarState: 'storing', agent: 'archivist' },
  'Memory.Write.End': { domain: 'memory', status: 'success', targetRoom: 'memory', avatarState: 'success', agent: 'archivist' },
  'Memory.Write.Failed': { domain: 'memory', status: 'failed', targetRoom: 'alert', avatarState: 'alert', agent: 'archivist' },

  // 5. Tool & Capability Courier (TokenSaver)
  'Tool.Requested': { domain: 'tool', status: 'running', targetRoom: 'knowledge', avatarState: 'walking', agent: 'tokensaver' },
  'Tool.Invoked': { domain: 'tool', status: 'running', targetRoom: 'knowledge', avatarState: 'thinking', agent: 'tokensaver' },
  'Tool.Completed': { domain: 'tool', status: 'success', targetRoom: 'lounge', avatarState: 'relaxing', agent: 'tokensaver' },

  // 6. Application State Navigation
  'App:StateChanged': { domain: 'workspace', status: 'success', targetRoom: 'command', avatarState: 'idle', agent: 'mamet' }
};

export class ActivityAdapter {
  constructor(activityBus) {
    this.activityBus = activityBus;
    this.unsubscribers = [];
    this.pipelineRunning = false;
  }

  /**
   * Menerjemahkan event telemetri mentah dari Mamet Ecosystem ke GameFace Event
   * @param {Object} rawEvent - Event mentah dari EventBus / ExecutionTraceService / agent_logs
   * @returns {Object|null} Objek aktivitas ternormalisasi
   */
  adaptRawEvent(rawEvent) {
    if (!rawEvent) return null;

    // Ekstrak nama tipe event (mendukung wrapper { event, data } atau { type, payload })
    const eventType = rawEvent.eventType || rawEvent.event || rawEvent.type || rawEvent.name || '';
    const eventData = rawEvent.data || rawEvent.payload || rawEvent;

    const mapped = MAMET_EVENT_MAP[eventType];
    if (!mapped) {
      // Fallback ke normalisasi standar jika tipe belum terdaftar secara eksplisit
      return normalizeActivity({
        id: rawEvent.id || `act-${Date.now()}`,
        eventType: eventType || 'System:Event',
        domain: rawEvent.domain || 'system',
        status: rawEvent.status || 'running',
        message: rawEvent.message || eventData.message || `Aktivitas sistem: ${eventType}`,
        timestamp: rawEvent.timestamp || new Date().toISOString()
      });
    }

    const message = rawEvent.message || eventData.message || this.generateDefaultMessage(eventType, mapped.agent);

    return normalizeActivity({
      id: rawEvent.id || `adp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      eventType,
      domain: mapped.domain,
      status: mapped.status,
      targetRoom: mapped.targetRoom,
      avatarState: mapped.avatarState,
      targetAgent: mapped.agent,
      message,
      metadata: eventData,
      timestamp: rawEvent.timestamp || new Date().toISOString()
    });
  }

  /**
   * Publish event hasil adaptasi ke ActivityBus
   */
  ingest(rawEvent) {
    const normalized = this.adaptRawEvent(rawEvent);
    if (normalized && this.activityBus) {
      return this.activityBus.publish(normalized);
    }
    return false;
  }

  /**
   * Sambungkan ke instance EventBus resmi Mamet Ecosystem (read-only subscriber)
   * @param {Object} mametEventBus - Instance EventBus inti
   */
  connectEventBus(mametEventBus) {
    if (!mametEventBus || typeof mametEventBus.on !== 'function') {
      console.warn('[ActivityAdapter] mametEventBus tidak valid');
      return;
    }

    // Berlangganan event eksplisit sesuai temuan INTEGRATION_MAP_READONLY_GAMEFACE.md
    Object.keys(MAMET_EVENT_MAP).forEach((eventName) => {
      const unsub = mametEventBus.on(eventName, (wrapper) => {
        const payload = wrapper?.data || wrapper;
        this.ingest({
          eventType: eventName,
          ...payload
        });
      });
      if (typeof unsub === 'function') {
        this.unsubscribers.push(unsub);
      }
    });

    console.log(`[ActivityAdapter] Berhasil berlangganan ${Object.keys(MAMET_EVENT_MAP).length} tipe event Mamet.`);
  }

  /**
   * Simulasi Alur Pipeline Kolaboratif End-to-End
   * Menjalankan orkestrasi 5 pekerja: Mamet -> Researcher -> Engineer -> Archivist -> TokenSaver
   * Disertai sinyal data packet transfer
   * @param {Function} onPacketTransfer - Callback visual transfer berkas
   */
  runFullPipelineSimulation(onPacketTransfer = null) {
    if (this.pipelineRunning) return;
    this.pipelineRunning = true;

    // Step 1: Owner memberi tugas -> Mamet Lead memimpin di Command Center
    this.ingest({
      eventType: 'Pipeline.Start',
      message: '👑 Mamet Lead menerima tugas Owner dan merencanakan alur riset...'
    });

    // Step 2 (setelah 2 detik): Kurir TokenSaver menjemput dan mengantar spek ke Researcher
    setTimeout(() => {
      if (onPacketTransfer) onPacketTransfer('mamet', 'researcher', 'Dokumen Spek');
      this.ingest({
        eventType: 'RAG.Start',
        message: '📚 The Researcher menerima spek dan menyintesis dokumen pengetahuan (RAG)...'
      });
    }, 2000);

    // Step 3 (setelah 6.5 detik): Kurir TokenSaver mengantar hasil riset RAG ke The Engineer
    setTimeout(() => {
      if (onPacketTransfer) onPacketTransfer('researcher', 'engineer', 'Konteks RAG');
      this.ingest({
        eventType: 'Engineer:TaskAssigned',
        message: '💻 The Engineer menerima konteks RAG, mulai mengetik kode & merancang modul...'
      });
    }, 6500);

    // Step 4 (setelah 10.5 detik): The Engineer verifikasi kode
    setTimeout(() => {
      this.ingest({
        eventType: 'Verification.Pass',
        message: '✅ Hasil build kode lulus verifikasi pengujian teknis (PASS).'
      });
    }, 10500);

    // Step 5 (setelah 12.5 detik): Kurir TokenSaver mengantar artefak modul ke The Archivist
    setTimeout(() => {
      if (onPacketTransfer) onPacketTransfer('engineer', 'archivist', 'Artefak Modul');
      this.ingest({
        eventType: 'Memory.Write.Start',
        message: '💾 The Archivist menyimpan artefak kode ke Memory Vault & Truth Graph...'
      });
    }, 12500);

    // Step 6 (setelah 16.5 detik): Kurir TokenSaver menjemput laporan akhir dari Archivist
    setTimeout(() => {
      if (onPacketTransfer) onPacketTransfer('archivist', 'tokensaver', 'Laporan Akhir');
      this.ingest({
        eventType: 'Tool.Completed',
        message: '☕ TokenSaver memastikan efisiensi token dan menjemput ringkasan eksekutif...'
      });
    }, 16500);

    // Step 7 (setelah 19.5 detik): TokenSaver mengantar laporan akhir ke meja Mamet Lead
    setTimeout(() => {
      if (onPacketTransfer) onPacketTransfer('tokensaver', 'mamet', 'Laporan Final');
    }, 19500);

    // Step 8 (setelah 23 detik): Pipeline Selesai (Sukses Sempurna)
    setTimeout(() => {
      this.ingest({
        eventType: 'Pipeline.Completed',
        message: '🎉 Seluruh orkestrasi 5 agen dan pengantaran berkas berhasil diselesaikan!'
      });
      this.pipelineRunning = false;
    }, 23000);
  }

  generateDefaultMessage(eventType, agent) {
    const names = {
      mamet: 'Mamet Lead',
      engineer: 'The Engineer',
      researcher: 'The Researcher',
      archivist: 'The Archivist',
      tokensaver: 'TokenSaver'
    };
    const agentName = names[agent] || 'Agen';
    return `${agentName} mengeksekusi proses ${eventType}`;
  }

  disconnect() {
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
  }
}
