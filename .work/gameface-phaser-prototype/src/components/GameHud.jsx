import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus.js';
import { defaultActivityBus } from '../activity/ActivityBus.js';
import { ROOM_DEFINITIONS } from '../activity/ActivityTypes.js';

export default function GameHud({ activityBus = defaultActivityBus }) {
  const [avatarState, setAvatarState] = useState('idle');
  const [currentRoom, setCurrentRoom] = useState('command');
  const [activeMessage, setActiveMessage] = useState('Mamet Living Office siap.');
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const unsubState = EventBus.on('avatarStateChanged', ({ state, room, activity }) => {
      setAvatarState(state);
      if (room) setCurrentRoom(room);
      if (activity && activity.message) {
        setActiveMessage(activity.message);
      }
    });

    const unsubActivity = activityBus.subscribe((activity) => {
      setHistory(prev => [activity, ...prev].slice(0, 15));
      EventBus.emit('dispatchActivity', activity);
    });

    return () => {
      unsubState();
      unsubActivity();
    };
  }, [activityBus]);

  const dispatchSimulation = (type) => {
    setIsRunning(true);

    if (type === 'research') {
      activityBus.publish({
        id: `sim-${Date.now()}`,
        eventType: 'RAG:RetrievalStart',
        domain: 'research',
        status: 'running',
        message: 'Mamet sedang menelusuri knowledge base dan dokumen riset...'
      });

      setTimeout(() => {
        activityBus.publish({
          id: `sim-end-${Date.now()}`,
          eventType: 'RAG:Completed',
          domain: 'research',
          status: 'success',
          message: 'Riset selesai. Jawaban berhasil disintesis.'
        });
        setTimeout(() => {
          setIsRunning(false);
          EventBus.emit('navigateRoom', 'command');
        }, 2500);
      }, 4000);
    } else if (type === 'code') {
      activityBus.publish({
        id: `sim-${Date.now()}`,
        eventType: 'Engineer:ExecutionStarted',
        domain: 'engineering',
        status: 'running',
        message: 'Mamet sedang memvalidasi dan mengompilasi kode program...'
      });

      setTimeout(() => {
        activityBus.publish({
          id: `sim-end-${Date.now()}`,
          eventType: 'Engineer:ExecutionPassed',
          domain: 'engineering',
          status: 'success',
          message: 'Kode berhasil diverifikasi tanpa error.'
        });
        setTimeout(() => {
          setIsRunning(false);
          EventBus.emit('navigateRoom', 'command');
        }, 2500);
      }, 4500);
    } else if (type === 'memory') {
      activityBus.publish({
        id: `sim-${Date.now()}`,
        eventType: 'Memory:WriteStart',
        domain: 'memory',
        status: 'running',
        message: 'Mamet sedang mengekstraksi dan menyimpan konteks ke memori jangka panjang...'
      });

      setTimeout(() => {
        activityBus.publish({
          id: `sim-end-${Date.now()}`,
          eventType: 'Memory:WriteCompleted',
          domain: 'memory',
          status: 'success',
          message: 'Memori berhasil diindeks ke dalam Truth Graph.'
        });
        setTimeout(() => {
          setIsRunning(false);
          EventBus.emit('navigateRoom', 'command');
        }, 2500);
      }, 3500);
    } else if (type === 'alert') {
      activityBus.publish({
        id: `sim-err-${Date.now()}`,
        eventType: 'Verification:Failed',
        domain: 'verification',
        status: 'failed',
        message: 'Peringatan: Verifikasi patch menemukan potensi inkonsistensi!'
      });

      setTimeout(() => {
        setIsRunning(false);
      }, 4000);
    } else if (type === 'home') {
      EventBus.emit('navigateRoom', 'command');
      setIsRunning(false);
    }
  };

  const roomConfig = ROOM_DEFINITIONS[currentRoom] || ROOM_DEFINITIONS.command;

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      color: '#e6f3f6',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* 1. Status Card */}
      <div style={{
        padding: '16px',
        borderRadius: '14px',
        background: '#0a1c28',
        border: '1px solid #1b4254',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#57d7e6', fontWeight: 700, textTransform: 'uppercase' }}>
            Avatar Telemetry
          </span>
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '999px',
            background: `${roomConfig.color}22`,
            color: roomConfig.color,
            fontWeight: 700
          }}>
            {avatarState.toUpperCase()}
          </span>
        </div>

        <div style={{ marginTop: '10px', fontSize: '16px', fontWeight: 700, color: '#f0f9fa' }}>
          {roomConfig.label}
        </div>
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#9dbcc9', lineHeight: 1.4 }}>
          {activeMessage}
        </div>
      </div>

      {/* 2. Simulation Action Buttons */}
      <div style={{
        padding: '16px',
        borderRadius: '14px',
        background: '#0a1c28',
        border: '1px solid #1b4254'
      }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#57d7e6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
          Simulasi Event Real-Time
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => dispatchSimulation('research')}
            style={buttonStyle('#c89cff', isRunning)}
          >
            Mulai Riset (RAG)
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => dispatchSimulation('code')}
            style={buttonStyle('#ffd479', isRunning)}
          >
            Jalankan Kode
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => dispatchSimulation('memory')}
            style={buttonStyle('#72e6a1', isRunning)}
          >
            Simpan Memori
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => dispatchSimulation('alert')}
            style={buttonStyle('#ff7f88', isRunning)}
          >
            Simulasi Alert
          </button>
        </div>

        <button
          type="button"
          onClick={() => dispatchSimulation('home')}
          style={{
            ...buttonStyle('#57d7e6', false),
            width: '100%',
            marginTop: '8px',
            background: '#0d2d3e'
          }}
        >
          Kembali ke Command Center
        </button>
      </div>

      {/* 3. Activity Stream Log */}
      <div style={{
        padding: '14px',
        borderRadius: '14px',
        background: '#0a1c28',
        border: '1px solid #1b4254',
        flex: 1,
        maxHeight: '260px',
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#57d7e6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
          Normalized Activity Stream
        </div>

        {history.length === 0 ? (
          <div style={{ fontSize: '11px', color: '#688c9a', fontStyle: 'italic', padding: '6px 0' }}>
            Belum ada aktivitas. Tekan tombol simulasi untuk memicu event.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {history.map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: '#08141f',
                  borderLeft: `3px solid ${act.status === 'failed' ? '#ff7f88' : act.status === 'success' ? '#72e6a1' : '#57d7e6'}`,
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b2d7e0' }}>
                  <strong>{act.eventType}</strong>
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>{act.status}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#8aa8b3', marginTop: '2px' }}>
                  {act.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function buttonStyle(accentColor, disabled) {
  return {
    padding: '9px 10px',
    borderRadius: '8px',
    border: `1px solid ${accentColor}44`,
    background: '#0e2433',
    color: accentColor,
    fontSize: '11px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease'
  };
}
