import React, { useState } from 'react';
import MametAvatarCanvas from './MametAvatarCanvas';

const activities = [
  { id: 'research', label: 'Mulai Research', pose: 'reading', workingState: 'researching', message: 'Mamet sedang melakukan riset', result: 'success' },
  { id: 'code', label: 'Jalankan Kode', pose: 'coding', workingState: 'coding', message: 'Mamet sedang menganalisis kode', result: 'success' },
  { id: 'memory', label: 'Simpan Memory', pose: 'holdingDocument', workingState: 'storing', message: 'Mamet sedang menyimpan memory', result: 'success' },
  { id: 'error', label: 'Simulasi Error', pose: 'alert', workingState: 'thinking', message: 'Mamet menemukan masalah', result: 'alert' }
];

export const FRAME_MAP = Object.freeze({
  idle: [0],
  walkingLeft: [1],
  walkingRight: [2],
  thinking: [3],
  talkingA: [4],
  talkingB: [5],
  holdingDocument: [6],
  reading: [7],
  carryingMemory: [8],
  success: [9],
  listening: [10],
  alert: [11],
  walking: [1, 2],
  talking: [4, 5],
  coding: [3],
  researching: [7],
  storing: [8]
});

const poseOptions = [
  ['idle', 'Idle'],
  ['walkingLeft', 'Walking Left'],
  ['walkingRight', 'Walking Right'],
  ['thinking', 'Thinking'],
  ['talkingA', 'Talking A'],
  ['talkingB', 'Talking B'],
  ['holdingDocument', 'Memegang Dokumen'],
  ['reading', 'Membaca'],
  ['carryingMemory', 'Membawa Memory'],
  ['success', 'Success'],
  ['listening', 'Mendengarkan'],
  ['alert', 'Alert']
];

export default function AvatarPreview() {
  const [state, setState] = useState('idle');
  const [pose, setPose] = useState('idle');
  const [activityMessage, setActivityMessage] = useState('Mamet sedang menunggu aktivitas.');
  const [activeActivity, setActiveActivity] = useState(null);

  const simulateActivity = (activity) => {
    setActiveActivity(activity.id);
    setActivityMessage(`${activity.message}...`);
    setState('walking');
    setPose('walking');

    window.setTimeout(() => {
      setState(activity.workingState);
      setPose(activity.pose);

      window.setTimeout(() => {
        setState(activity.result);
        setPose(activity.result);
        setActivityMessage(
          activity.result === 'alert'
            ? 'Aktivitas berhenti dan membutuhkan perhatian Owner.'
            : 'Aktivitas selesai dengan berhasil.'
        );

        window.setTimeout(() => {
          setState('idle');
          setPose('idle');
          setActiveActivity(null);
          setActivityMessage('Mamet kembali menunggu aktivitas.');
        }, 1400);
      }, 2200);
    }, 900);
  };

  return (
    <section style={{ display: 'grid', gap: 12, color: '#e6f3f6', fontFamily: 'system-ui', maxWidth: 360 }}>
      <MametAvatarCanvas
        state={state}
        pose={pose}
        frameMap={FRAME_MAP}
        x={160}
        y={150}
        label="Mamet Avatar"
        onAvatarClick={() => { setState('thinking'); setPose('talking'); }}
      />
      <div style={{ padding: '10px 12px', border: '1px solid #1b4254', borderRadius: 10, background: '#0b1b28' }}>
        <div style={{ color: '#57d7e6', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          Activity Simulation
        </div>
        <div style={{ marginTop: 5, color: '#b9d7dd', fontSize: 12 }}>
          {activityMessage}
        </div>
        <div style={{ marginTop: 6, color: '#83a1ad', fontSize: 10 }}>
          Pose aktif: <strong style={{ color: '#c89cff' }}>{pose}</strong>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {activities.map((activity) => (
          <button
            key={activity.id}
            type="button"
            disabled={Boolean(activeActivity)}
            onClick={() => simulateActivity(activity)}
            style={{ opacity: activeActivity && activeActivity !== activity.id ? 0.5 : 1 }}
          >
            {activeActivity === activity.id ? 'Running...' : activity.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ color: '#57d7e6', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          Pose manual / FRAME_MAP
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {poseOptions.map(([poseId, poseLabel]) => (
            <button
              key={poseId}
              type="button"
              disabled={Boolean(activeActivity)}
              onClick={() => { setPose(poseId); setState(poseId === 'alert' ? 'alert' : 'idle'); }}
              style={{ opacity: activeActivity ? 0.5 : 1, fontSize: 10 }}
            >
              {poseLabel}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
