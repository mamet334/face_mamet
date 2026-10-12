import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config.js';
import { EventBus } from '../game/EventBus.js';

export default function MametGame({ onGameReady, onAvatarClick, onRoomClick }) {
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Inisialisasi Phaser Game Instance
    const config = createGameConfig(gameContainerRef.current);
    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    // Hubungkan EventBus ke props React
    const unsubReady = EventBus.on('gameReady', (data) => {
      if (onGameReady) onGameReady(data);
    });

    const unsubAvatar = EventBus.on('avatarClicked', (state) => {
      if (onAvatarClick) onAvatarClick(state);
    });

    const unsubRoom = EventBus.on('roomClicked', (roomKey) => {
      if (onRoomClick) onRoomClick(roomKey);
    });

    // Cleanup saat unmount
    return () => {
      unsubReady();
      unsubAvatar();
      unsubRoom();
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={gameContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45), inset 0 0 60px rgba(87, 215, 230, 0.05)'
      }}
    />
  );
}
