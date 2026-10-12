/**
 * test-foundations.mjs
 * Pengujian unit otomatis untuk Multi-Agent Squad & Idle Behaviors:
 * 1. NavGraph (konektivitas, waypoint, rute Pantry Lounge BFS)
 * 2. AvatarStateMachine (transisi state, idle relaxing, sleeping Zzz, surprised wake up)
 * 3. ActivityBus (normalisasi, deduplikasi, dan dispatch event)
 */

import { NavGraph } from './src/game/world/NavGraph.js';
import { AvatarStateMachine, AVATAR_STATE_ENUM } from './src/game/state/AvatarStateMachine.js';
import { ActivityBus, normalizeActivity } from './src/activity/ActivityBus.js';

console.log('=== MEMULAI TEST MULTI-AGENT & IDLE BEHAVIORS ===\n');
let passed = 0;
let total = 0;

function assert(description, condition) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ PASS: ${description}`);
  } else {
    console.error(`❌ FAIL: ${description}`);
  }
}

// -------------------------------------------------------------
// TEST SUITE 1: NAVGRAPH & PATHFINDING
// -------------------------------------------------------------
console.log('--- Test Suite 1: NavGraph & Pathfinding ---');
const nav = new NavGraph();

assert('NavGraph memiliki semua 5 spot ruangan kerja + Pantry Lounge', 
  Boolean(nav.getRoomSpot('command')) &&
  Boolean(nav.getRoomSpot('research')) &&
  Boolean(nav.getRoomSpot('engineer')) &&
  Boolean(nav.getRoomSpot('memory')) &&
  Boolean(nav.getRoomSpot('knowledge')) &&
  Boolean(nav.getRoomSpot('lounge'))
);

const pathToEngineer = nav.findPath('command_spot', 'engineer_spot');
assert('Rute dari Command ke Engineer berhasil ditemukan', pathToEngineer.length > 0);
assert('Rute dari Command ke Engineer dimulai di command_spot', pathToEngineer[0]?.id === 'command_spot');
assert('Rute dari Command ke Engineer berakhir di engineer_spot', pathToEngineer[pathToEngineer.length - 1]?.id === 'engineer_spot');
assert('Rute melewati koridor tengah/pintu secara logis (panjang rute minimal 5 node)', pathToEngineer.length >= 5);

const pathToLounge = nav.findPath('engineer_spot', 'lounge_spot');
assert('Rute dari Engineer ke Pantry Lounge berhasil ditemukan', pathToLounge.length > 0);
assert('Rute berakhir di lounge_spot', pathToLounge[pathToLounge.length - 1]?.id === 'lounge_spot');

const sameSpotPath = nav.findPath('command_spot', 'command_spot');
assert('Rute ke node yang sama menghasilkan 1 node', sameSpotPath.length === 1 && sameSpotPath[0].id === 'command_spot');

// -------------------------------------------------------------
// TEST SUITE 2: AVATAR STATE MACHINE & IDLE BEHAVIORS
// -------------------------------------------------------------
console.log('\n--- Test Suite 2: Avatar State Machine & Idle Behaviors ---');
const fsm = new AvatarStateMachine(AVATAR_STATE_ENUM.IDLE, { agentId: 'engineer' });

assert('State awal adalah IDLE', fsm.getState().state === AVATAR_STATE_ENUM.IDLE);

let transitionEventFired = false;
fsm.subscribe((evt, payload) => {
  if (evt === 'transition') transitionEventFired = true;
});

// Test Manual Transitions
const relax = fsm.transitionTo(AVATAR_STATE_ENUM.RELAXING);
assert('Transisi IDLE -> RELAXING (Santai/Ngopi) berhasil', relax && fsm.getState().state === AVATAR_STATE_ENUM.RELAXING);

const sleep = fsm.transitionTo(AVATAR_STATE_ENUM.SLEEPING);
assert('Transisi RELAXING -> SLEEPING (Tidur Zzz) berhasil', sleep && fsm.getState().state === AVATAR_STATE_ENUM.SLEEPING);

const surprise = fsm.transitionTo(AVATAR_STATE_ENUM.SURPRISED);
assert('Transisi SLEEPING -> SURPRISED (Kaget bangun !) berhasil', surprise && fsm.getState().state === AVATAR_STATE_ENUM.SURPRISED);

const coding = fsm.transitionTo(AVATAR_STATE_ENUM.CODING, { room: 'engineer' });
assert('Transisi SURPRISED -> CODING berhasil saat tugas masuk', coding && fsm.getState().state === AVATAR_STATE_ENUM.CODING);

const success = fsm.transitionTo(AVATAR_STATE_ENUM.SUCCESS);
assert('Transisi CODING -> SUCCESS berhasil', success && fsm.getState().state === AVATAR_STATE_ENUM.SUCCESS);

const idleAgain = fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
assert('Transisi SUCCESS -> IDLE berhasil', idleAgain && fsm.getState().state === AVATAR_STATE_ENUM.IDLE);

// Test Otomatisasi Waktu Menganggur (Timer Auto-Idle)
const idleFsm = new AvatarStateMachine(AVATAR_STATE_ENUM.IDLE, { autoIdleBehaviors: true });
idleFsm.update(8500); // Simulasi menganggur 8.5 detik
assert('Timer otomatis mengubah IDLE -> RELAXING setelah 8 detik menganggur', idleFsm.getState().state === AVATAR_STATE_ENUM.RELAXING);

idleFsm.update(10000); // Simulasi menganggur tambahan 10 detik
assert('Timer otomatis mengubah RELAXING -> SLEEPING setelah 18 detik menganggur', idleFsm.getState().state === AVATAR_STATE_ENUM.SLEEPING);

// -------------------------------------------------------------
// TEST SUITE 3: ACTIVITY BUS & NORMALIZATION
// -------------------------------------------------------------
console.log('\n--- Test Suite 3: Activity Bus & Normalization ---');
const bus = new ActivityBus();
const publishedEvents = [];
bus.subscribe(activity => publishedEvents.push(activity));

const normalized = normalizeActivity({
  id: 'test-1',
  eventType: 'Research:Start',
  domain: 'research',
  status: 'running'
});

assert('Normalisasi domain research mengarahkan ke targetRoom research', normalized.targetRoom === 'research');
assert('Normalisasi status running di research mengaktifkan avatarState researching', normalized.avatarState === 'researching');

bus.publish({
  id: 'evt-unique-1',
  eventType: 'Engineer:ExecutionStarted',
  domain: 'engineering',
  status: 'running',
  correlationId: 'run-alpha'
});

assert('ActivityBus berhasil mempublish event pertama', publishedEvents.length === 1);

// Test deduplikasi
const duplicate = bus.publish({
  id: 'evt-unique-2',
  eventType: 'Engineer:ExecutionStarted',
  domain: 'engineering',
  status: 'running',
  correlationId: 'run-alpha'
});

assert('ActivityBus menyaring duplikasi running dalam rentang waktu singkat', duplicate === null && publishedEvents.length === 1);

bus.publish({
  id: 'evt-fail',
  eventType: 'Verification:Failed',
  domain: 'verification',
  status: 'failed',
  message: 'Verification check failed'
});

assert('Event failed otomatis diarahkan ke alert room dan avatarState alert', 
  publishedEvents[1]?.targetRoom === 'alert' && publishedEvents[1]?.avatarState === 'alert'
);

// -------------------------------------------------------------
// TEST SUITE 4: ACTIVITY ADAPTER & MAMET TELEMETRY
// -------------------------------------------------------------
console.log('\n--- Test Suite 4: Activity Adapter & Mamet Telemetry ---');
const { ActivityAdapter } = await import('./src/activity/ActivityAdapter.js');
const adapter = new ActivityAdapter(bus);

const evtPipeline = adapter.adaptRawEvent({ eventType: 'Pipeline.Start' });
assert('ActivityAdapter memetakan Pipeline.Start ke Mamet Lead di Command Room', 
  evtPipeline?.targetAgent === 'mamet' && evtPipeline?.targetRoom === 'command' && evtPipeline?.avatarState === 'thinking'
);

const evtRag = adapter.adaptRawEvent({ eventType: 'RAG.Start' });
assert('ActivityAdapter memetakan RAG.Start ke Researcher di Research Room', 
  evtRag?.targetAgent === 'researcher' && evtRag?.targetRoom === 'research' && evtRag?.avatarState === 'researching'
);

const evtCode = adapter.adaptRawEvent({ eventType: 'Engineer:TaskAssigned' });
assert('ActivityAdapter memetakan Engineer:TaskAssigned ke Engineer di Engineer Room', 
  evtCode?.targetAgent === 'engineer' && evtCode?.targetRoom === 'engineer' && evtCode?.avatarState === 'coding'
);

const evtMemory = adapter.adaptRawEvent({ eventType: 'Memory.Write.Start' });
assert('ActivityAdapter memetakan Memory.Write.Start ke Archivist di Memory Room', 
  evtMemory?.targetAgent === 'archivist' && evtMemory?.targetRoom === 'memory' && evtMemory?.avatarState === 'storing'
);

const evtTool = adapter.adaptRawEvent({ eventType: 'Tool.Completed' });
assert('ActivityAdapter memetakan Tool.Completed ke TokenSaver di Pantry Lounge', 
  evtTool?.targetAgent === 'tokensaver' && evtTool?.targetRoom === 'lounge' && evtTool?.avatarState === 'relaxing'
);

const evtWrapper = adapter.adaptRawEvent({
  event: 'Verification.Pass',
  data: { message: 'Semua test pass 100%' }
});
assert('ActivityAdapter menangani format wrapper EventBus { event, data }', 
  evtWrapper?.targetAgent === 'engineer' && evtWrapper?.status === 'success' && evtWrapper?.message.includes('100%')
);

const beforeIngestCount = publishedEvents.length;
adapter.ingest({ eventType: 'RAG.Retrieval.Start' });
assert('ActivityAdapter.ingest berhasil mempublish ke ActivityBus', publishedEvents.length === beforeIngestCount + 1);

// -------------------------------------------------------------
// TEST SUITE 5: WORKSPACE MODES (MAMET OS ARCHITECTURE)
// -------------------------------------------------------------
console.log('\n--- Test Suite 5: Workspace Modes (Mamet OS Architecture) ---');
const { WORKSPACE_DEFINITIONS } = await import('./src/activity/ActivityTypes.js');

assert('Definisi Workspace memiliki 5 mode lengkap (global, assistant, engineer, knowledge, lite)',
  Boolean(WORKSPACE_DEFINITIONS.global) &&
  Boolean(WORKSPACE_DEFINITIONS['ws-assistant']) &&
  Boolean(WORKSPACE_DEFINITIONS['ws-engineer']) &&
  Boolean(WORKSPACE_DEFINITIONS['ws-knowledge']) &&
  Boolean(WORKSPACE_DEFINITIONS['ws-lite'])
);

const engWs = WORKSPACE_DEFINITIONS['ws-engineer'];
assert('Engineer Workspace memiliki kapabilitas cap:engineer', 
  engWs.capabilities.includes('cap:engineer')
);
assert('Engineer Workspace memiliki scope izin engineering_only', 
  engWs.permissions.write_scope === 'engineering_only' && engWs.permissions.tools_access === 'engineer_only'
);
assert('Engineer Workspace menunjuk pekerja utama "engineer"', 
  engWs.primaryAgent === 'engineer' && engWs.activeRooms.includes('engineer')
);

const knowWs = WORKSPACE_DEFINITIONS['ws-knowledge'];
assert('Knowledge Workspace memiliki kapabilitas cap:knowledge', 
  knowWs.capabilities.includes('cap:knowledge')
);
assert('Knowledge Workspace mencakup Research Room dan Memory Vault', 
  knowWs.activeRooms.includes('research') && knowWs.activeRooms.includes('memory')
);

const liteWs = WORKSPACE_DEFINITIONS['ws-lite'];
assert('Lite Workspace memiliki kapabilitas cap:lite dan izin minimal', 
  liteWs.capabilities.includes('cap:lite') && liteWs.permissions.tools_access === 'minimal'
);
assert('Lite Workspace menunjuk kurir "tokensaver" sebagai primaryAgent', 
  liteWs.primaryAgent === 'tokensaver' && liteWs.activeRooms.includes('lounge')
);

// -------------------------------------------------------------
// TEST SUITE 6: PHYSICAL COURIER DELIVERY & FILE HOLDING
// -------------------------------------------------------------
console.log('\n--- Test Suite 6: Physical Courier Delivery & File Holding ---');
// Mock visual MametAvatar untuk menguji state membawa berkas
class MockAvatarContainer {
  constructor() {
    this.x = 180;
    this.y = 235;
    this.scaleX = 1;
    this.children = [];
  }
  setScale(sx) { this.scaleX = sx; }
  setDepth(d) { this.depth = d; return this; }
  add(items) {
    if (Array.isArray(items)) this.children.push(...items);
    else this.children.push(items);
  }
}

const createMockText = () => {
  const txt = {
    setText: () => txt,
    setColor: () => txt,
    setPosition: () => txt,
    setOrigin: () => txt
  };
  return txt;
};

const mockScene = {
  add: {
    container: () => new MockAvatarContainer(),
    ellipse: () => ({}),
    graphics: () => ({ clear: () => {}, fillStyle: () => {}, fillRoundedRect: () => {}, lineStyle: () => {}, strokeRoundedRect: () => {}, strokeRect: () => {}, fillRect: () => {}, fillCircle: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, strokePath: () => {} }),
    text: () => createMockText(),
    zone: () => ({ setInteractive: () => ({ on: () => {} }) }),
    circle: () => ({ setDepth: () => {} })
  },
  tweens: {
    add: (cfg) => {
      if (cfg.onComplete) setTimeout(cfg.onComplete, 10);
      return {};
    }
  },
  time: {
    delayedCall: (delay, fn) => setTimeout(fn, 10)
  }
};

const { MametAvatar } = await import('./src/game/entities/MametAvatar.js');
const testAvatar = new MametAvatar(mockScene, nav, 'command_spot', { agentId: 'tokensaver' });

assert('Avatar awal tidak sedang membawa berkas (isCarryingFile = false)', 
  testAvatar.isCarryingFile === false
);

testAvatar.setCarryingFile(true, 'Dokumen Spek');
assert('setCarryingFile(true) mengaktifkan isCarryingFile dan mencatat nama berkas', 
  testAvatar.isCarryingFile === true && testAvatar.carriedFileName === 'Dokumen Spek'
);

testAvatar.setCarryingFile(false);
assert('setCarryingFile(false) melepaskan berkas secara bersih', 
  testAvatar.isCarryingFile === false
);

// Rute navigasi kurir membawa berkas dari Command ke Engineer
const courierPath = nav.findPath('command_spot', 'engineer_spot');
assert('Rute pengantaran kurir memiliki titik awal di Command dan tujuan di Engineer', 
  courierPath[0].id === 'command_spot' && courierPath[courierPath.length - 1].id === 'engineer_spot'
);

// Rute kembali kurir ke Pantry Lounge
const returnPath = nav.findPath('engineer_spot', 'lounge_spot_tokensaver');
assert('Rute kepulangan kurir kembali ke spot terpisah TokenSaver di Pantry Lounge', 
  returnPath[returnPath.length - 1].id === 'lounge_spot_tokensaver'
);

console.log(`\n=== HASIL AKHIR: ${passed}/${total} TEST LULUS ===`);
if (passed !== total) {
  process.exit(1);
} else {
  console.log('🎉 SELURUH PONDASI MULTI-AGENT, WORKSPACE MODES, & KURIR BERKAS FISIK 100% SUKSES!');
}

