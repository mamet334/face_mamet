import React from 'react';
import MametGame from './MametGame.jsx';
import GameHud from './GameHud.jsx';
import { defaultActivityBus } from '../activity/ActivityBus.js';

export default function GameFace({ activityBus = defaultActivityBus, className = '' }) {
  return (
    <div
      className={`game-face-container ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '20px',
        width: '100%',
        height: '100%',
        minHeight: '660px',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 25%, #0e2738 0%, #06121a 50%, #03080d 100%)',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MametGame
          onAvatarClick={(state) => {
            console.log('[GameFace] Avatar clicked:', state);
          }}
          onRoomClick={(roomKey) => {
            console.log('[GameFace] Room clicked:', roomKey);
          }}
        />
      </div>

      <div style={{ height: '100%', overflow: 'hidden' }}>
        <GameHud activityBus={activityBus} />
      </div>
    </div>
  );
}
