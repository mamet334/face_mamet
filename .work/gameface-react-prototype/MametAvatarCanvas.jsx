import React, { useEffect, useRef, useState } from 'react';
import './MametAvatarCanvas.css';
import defaultSprite from './assets/mamet-avatar-sprite.png';

const STATE_LABELS = {
  idle: 'READY',
  walking: 'MOVING',
  thinking: 'THINKING',
  reading: 'READING',
  researching: 'RESEARCHING',
  coding: 'CODING',
  storing: 'STORING',
  alert: 'ALERT',
  success: 'DONE'
};

const STATE_COLORS = {
  idle: '#57d7e6',
  walking: '#57d7e6',
  thinking: '#c89cff',
  reading: '#c89cff',
  researching: '#c89cff',
  coding: '#ffd479',
  storing: '#72e6a1',
  alert: '#ff7f88',
  success: '#72e6a1'
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawVectorAvatar(ctx, x, y, state, time, scale = 1) {
  const color = STATE_COLORS[state] || STATE_COLORS.idle;
  const bob = Math.sin(time / 220) * (state === 'idle' ? 1.5 : 2.5);
  const pulse = 1 + Math.sin(time / 180) * (state === 'alert' ? 0.08 : 0.03);
  const label = STATE_LABELS[state] || 'ACTIVE';

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);

  ctx.globalAlpha = 0.13;
  ctx.fillStyle = color;
  ctx.shadowBlur = 28;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.arc(0, 1, 32 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#102a38';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  // Head
  ctx.beginPath();
  ctx.arc(0, -13, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 15, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(-6, -14, 3, 0, Math.PI * 2);
  ctx.arc(6, -14, 3, 0, Math.PI * 2);
  ctx.fill();

  // Smile / status line
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -5);
  ctx.quadraticCurveTo(0, 0, 6, -5);
  ctx.stroke();

  // Working indicator
  if (['thinking', 'reading', 'researching', 'coding', 'storing'].includes(state)) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 3; i += 1) {
      const dotY = -50 - Math.abs(Math.sin(time / 180 + i)) * 4;
      ctx.beginPath();
      ctx.arc((i - 1) * 8, dotY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Alert marker
  if (state === 'alert') {
    ctx.fillStyle = '#ff7f88';
    ctx.beginPath();
    ctx.moveTo(25, -37);
    ctx.lineTo(34, -19);
    ctx.lineTo(16, -19);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#351820';
    ctx.font = '700 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('!', 25, -24);
  }

  // Success marker
  if (state === 'success') {
    ctx.strokeStyle = '#72e6a1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(19, -28);
    ctx.lineTo(24, -23);
    ctx.lineTo(34, -35);
    ctx.stroke();
  }

  ctx.fillStyle = color;
  ctx.font = '700 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, -64);
  ctx.restore();
}

function drawSpriteAvatar(ctx, image, x, y, state, time, scale = 1, pose = 'idle', frameMap = {}) {
  const frameWidth = image.width / 4;
  const frameHeight = image.height;
  const mappedFrames = frameMap[pose] || frameMap[state] || [
    state === 'walking' ? 1 : 0
  ];
  const frame = mappedFrames[Math.floor(time / 180) % mappedFrames.length];
  const safeFrame = Math.max(0, Math.min(Number(frame) || 0, Math.floor(image.width / frameWidth) - 1));
  const sourceY = frameHeight * 0.22;
  const sourceHeight = frameHeight * 0.58;
  const destinationWidth = 112 * scale;
  const destinationHeight = 176 * scale;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    image,
    safeFrame * frameWidth,
    sourceY,
    frameWidth,
    sourceHeight,
    x - destinationWidth / 2,
    y - destinationHeight + 20,
    destinationWidth,
    destinationHeight
  );

  const color = STATE_COLORS[state] || STATE_COLORS.idle;
  ctx.fillStyle = color;
  ctx.font = '700 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(STATE_LABELS[state] || 'ACTIVE', x, y - destinationHeight - 8);
  ctx.restore();
}

export default function MametAvatarCanvas({
  state = 'idle',
  x = 160,
  y = 150,
  scale = 1,
  width = 320,
  height = 260,
  label = 'Mamet Avatar',
  spriteSrc = defaultSprite,
  pose = 'idle',
  frameMap = {},
  onAvatarClick,
  className = ''
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [spriteImage, setSpriteImage] = useState(null);
  const latestPropsRef = useRef({ state, x, y, scale, width, height, pose, frameMap });

  useEffect(() => {
    latestPropsRef.current = { state, x, y, scale, width, height, pose, frameMap, spriteImage };
  }, [state, x, y, scale, width, height, pose, frameMap, spriteImage]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setSpriteImage(image);
    image.onerror = () => setSpriteImage(null);
    image.src = spriteSrc;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [spriteSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    let deviceScale = window.devicePixelRatio || 1;

    const resize = () => {
      deviceScale = window.devicePixelRatio || 1;
      const { width: logicalWidth, height: logicalHeight } = latestPropsRef.current;
      canvas.width = logicalWidth * deviceScale;
      canvas.height = logicalHeight * deviceScale;
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    };

    const render = (time) => {
      const current = latestPropsRef.current;
      const logicalWidth = current.width;
      const logicalHeight = current.height;
      context.clearRect(0, 0, logicalWidth, logicalHeight);
      context.fillStyle = '#081621';
      context.fillRect(0, 0, logicalWidth, logicalHeight);

      context.strokeStyle = '#123747';
      context.lineWidth = 1;
      for (let gridX = 16; gridX < logicalWidth; gridX += 32) {
        context.beginPath();
        context.moveTo(gridX, 0);
        context.lineTo(gridX, logicalHeight);
        context.stroke();
      }
      for (let gridY = 16; gridY < logicalHeight; gridY += 32) {
        context.beginPath();
        context.moveTo(0, gridY);
        context.lineTo(logicalWidth, gridY);
        context.stroke();
      }

      const avatarX = clamp(current.x, 65, logicalWidth - 65);
      const avatarY = clamp(current.y, 120, logicalHeight - 36);
      if (current.spriteImage) {
        drawSpriteAvatar(context, current.spriteImage, avatarX, avatarY, current.state, time, current.scale, current.pose, current.frameMap);
      } else {
        drawVectorAvatar(context, avatarX, avatarY, current.state, time, current.scale);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className={`mamet-avatar-canvas ${className}`}>
      <div className="mamet-avatar-canvas__header">
        <span>{label}</span>
        <span className="mamet-avatar-canvas__badge">2D</span>
      </div>
      <canvas
        ref={canvasRef}
        className="mamet-avatar-canvas__surface"
        role="img"
        aria-label={`${label}, status ${STATE_LABELS[state] || 'ACTIVE'}`}
        onClick={onAvatarClick}
      />
    </div>
  );
}
