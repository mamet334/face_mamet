/**
 * test-3d-engine.mjs
 * Automated Unit Test Suite untuk GameFace 3D Engine
 * Memverifikasi NavGraph3D, FSM, Kurir Berkas Fisik, Workspace Modes, dan Integritas NO AUDIO
 */

import { NavGraph3D } from './src/navigation/NavGraph3D.js';
import { AvatarStateMachine, AVATAR_STATE_ENUM } from './src/state/AvatarStateMachine.js';
import { ActivityBus } from './src/activity/ActivityBus.js';
import { ActivityAdapter } from './src/activity/ActivityAdapter.js';
import { AGENT_SPECS, WORKSPACE_DEFINITIONS, ROOMS } from './src/activity/ActivityTypes.js';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🧪 TESTING GAMFACE 3D LIVING OFFICE ENGINE');
console.log('====================================================\n');

// SUITE 1: NavGraph3D & 3D Waypoint Pathfinding
console.log('--- SUITE 1: NavGraph3D & 3D Waypoints ---');
const nav = new NavGraph3D();
assert(nav.nodes.size >= 14, `NavGraph3D memiliki ${nav.nodes.size} nodes (minimal 14)`);
assert(nav.getNode('command_desk') !== undefined, 'Node command_desk terdaftar');
assert(nav.getNode('engineer_desk') !== undefined, 'Node engineer_desk terdaftar');
assert(nav.getNode('research_desk') !== undefined, 'Node research_desk terdaftar');
assert(nav.getNode('memory_vault') !== undefined, 'Node memory_vault terdaftar');
assert(nav.getNode('tokensaver_station') !== undefined, 'Node tokensaver_station terdaftar');

// Pathfinding test: Research to Engineer
const pathResToEng = nav.findPath('research_desk', 'engineer_desk');
assert(pathResToEng !== null, 'Tersedia rute 3D dari Research Desk ke Engineer Workbench');
assert(pathResToEng.length >= 4, `Panjang rute 3D Research->Engineer adalah ${pathResToEng?.length} waypoints`);

// Pathfinding test: Command to Memory Vault
const pathCmdToMem = nav.findPath('command_desk', 'memory_vault');
assert(pathCmdToMem !== null, 'Tersedia rute 3D dari Command Desk ke Memory Vault');

// Anti-crowding lounge spots
assert(nav.getNode('lounge_spot_mamet') !== undefined, 'Spot lounge terpisah untuk Mamet');
assert(nav.getNode('lounge_spot_engineer') !== undefined, 'Spot lounge terpisah untuk Engineer');
assert(nav.getNode('lounge_spot_researcher') !== undefined, 'Spot lounge terpisah untuk Researcher');
assert(nav.getNode('lounge_spot_archivist') !== undefined, 'Spot lounge terpisah untuk Archivist');
assert(nav.getNode('lounge_spot_tokensaver') !== undefined, 'Spot lounge terpisah untuk TokenSaver');


// SUITE 2: AvatarStateMachine & Human Behaviors
console.log('\n--- SUITE 2: AvatarStateMachine (Idle, Relax, Sleep Zzz, Surprised !) ---');
const fsm = new AvatarStateMachine({
  agentId: 'test_agent',
  relaxThresholdSec: 0.1,
  sleepThresholdSec: 0.2
});
assert(fsm.getState() === AVATAR_STATE_ENUM.IDLE, 'State awal avatar adalah IDLE');

// Walking transition
assert(fsm.transitionTo(AVATAR_STATE_ENUM.WALKING) === true, 'Transisi IDLE -> WALKING berhasil');
assert(fsm.transitionTo(AVATAR_STATE_ENUM.CODING) === true, 'Transisi WALKING -> CODING berhasil');
assert(fsm.transitionTo(AVATAR_STATE_ENUM.SUCCESS) === true, 'Transisi CODING -> SUCCESS berhasil');

// Idle timer & Relaxing
fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
fsm.update(0.15); // Lewat relaxThresholdSec
assert(fsm.getState() === AVATAR_STATE_ENUM.RELAXING, 'Auto-idle bertransisi ke RELAXING (ngopi di lounge)');

fsm.update(0.25); // Lewat sleepThresholdSec
assert(fsm.getState() === AVATAR_STATE_ENUM.SLEEPING, 'Auto-idle bertransisi ke SLEEPING (tidur Zzz di sofa)');

// Surprised interrupt
const interruptResult = fsm.transitionTo(AVATAR_STATE_ENUM.CODING);
assert(interruptResult === true, 'Tugas baru menginterupsi agen yang sedang tidur');
assert(fsm.getState() === AVATAR_STATE_ENUM.SURPRISED, 'Agen kaget terbangun (!) sebelum mulai kerja');


// SUITE 3: Multi-Agent Human Squad Specs
console.log('\n--- SUITE 3: Tim Karakter Manusia (Multi-Agent Squad) ---');
const agentKeys = Object.keys(AGENT_SPECS);
assert(agentKeys.length === 5, 'Tepat 5 tokoh manusia terdaftar di tim');
assert(AGENT_SPECS.mamet.role.includes('Lead'), 'Mamet terdaftar sebagai Lead/Orchestrator');
assert(AGENT_SPECS.engineer.role.includes('Code'), 'The Engineer terdaftar untuk Code & Execution');
assert(AGENT_SPECS.researcher.role.includes('RAG'), 'The Researcher terdaftar untuk RAG & Analysis');
assert(AGENT_SPECS.archivist.role.includes('Memory'), 'The Archivist terdaftar untuk Memory Vault');
assert(AGENT_SPECS.tokensaver.role.includes('Courier'), 'TokenSaver terdaftar sebagai Courier & Optimizer');


// SUITE 4: Workspace Modes
console.log('\n--- SUITE 4: 5 Mode Workspace Mamet OS ---');
const wsKeys = Object.keys(WORKSPACE_DEFINITIONS);
assert(wsKeys.length === 5, 'Tepat 5 mode workspace terdefinisi');
assert(WORKSPACE_DEFINITIONS.global.activeAgents.length === 5, 'Mode Global mengaktifkan seluruh 5 agen');
assert(WORKSPACE_DEFINITIONS['ws-assistant'].activeAgents.includes('researcher'), 'Assistant mode mengaktifkan researcher');
assert(WORKSPACE_DEFINITIONS['ws-engineer'].activeAgents.includes('engineer'), 'Engineer mode mengaktifkan engineer');
assert(WORKSPACE_DEFINITIONS['ws-knowledge'].activeAgents.includes('archivist'), 'Knowledge mode mengaktifkan archivist');
assert(WORKSPACE_DEFINITIONS['ws-lite'].activeAgents.length === 2, 'Lite mode hanya mengaktifkan 2 agen hemat token');


// SUITE 5: ActivityBus & ActivityAdapter
console.log('\n--- SUITE 5: ActivityBus & ActivityAdapter ---');
const bus = new ActivityBus();
let receivedEvent = null;
bus.on('activity:received', (evt) => { receivedEvent = evt; });

const adapter = new ActivityAdapter(bus);
const norm = adapter.processAndEmit({
  domain: 'research',
  message: 'Riset embeddings RAG dokumen'
});
assert(receivedEvent !== null, 'Event berhasil disalurkan melalui ActivityBus');
assert(receivedEvent.targetRoom === 'research', 'Domain research diarahkan ke ruang research');
assert(receivedEvent.targetAgent === 'researcher', 'Domain research diarahkan ke agent researcher');


// SUITE 6: Strict NO AUDIO Integrity Check
console.log('\n--- SUITE 6: Integritas Ketat NO AUDIO (Bebas Suara) ---');
function scanDirForAudioKeywords(dirPath) {
  let found = [];
  const files = fs.readdirSync(dirPath);
  for (const f of files) {
    if (f === 'node_modules' || f === 'dist') continue;
    const fullPath = path.join(dirPath, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      found = found.concat(scanDirForAudioKeywords(fullPath));
    } else if (f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (
        content.includes('AudioContext') ||
        content.includes('HTMLAudioElement') ||
        content.includes('.mp3') ||
        content.includes('.wav') ||
        content.includes('.ogg')
      ) {
        found.push(fullPath);
      }
    }
  }
  return found;
}

const audioViolations = scanDirForAudioKeywords(path.resolve('./src'));
assert(audioViolations.length === 0, `Nol dependensi audio di folder src (ditemukan: ${audioViolations.length})`);

console.log('\n====================================================');
console.log(`HASIL AKHIR: ${passed} PASS, ${failed} FAIL`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
