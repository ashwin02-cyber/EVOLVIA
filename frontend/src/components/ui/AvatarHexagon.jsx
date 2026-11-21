import React from 'react';
import defaultAvatar from '../../assets/images/avatar_ashwin.png';

export const AvatarHexagon = ({
  src = defaultAvatar,
  alt = 'Player Avatar',
  size = 90,
  className = ''
}) => {
  const clipId = `hex-clip-${size}`;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg width="0" height="0">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <polygon points="0.5 0, 0.98 0.25, 0.98 0.75, 0.5 1, 0.02 0.75, 0.02 0.25" />
          </clipPath>
        </defs>
      </svg>

      {/* Hexagon Border SVG with Glow */}
      <svg
        viewBox="0 0 100 115"
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_12px_rgba(0,229,255,0.7)]"
      >
        <defs>
          <linearGradient id="avatarBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00E5FF" />
            <stop offset="50%" stop-color="#3B0A6B" />
            <stop offset="100%" stop-color="#00E5FF" />
          </linearGradient>
        </defs>
        <polygon
          points="50,2 98,26 98,89 50,113 2,89 2,26"
          fill="none"
          stroke="url(#avatarBorderGrad)"
          strokeWidth="3.5"
        />
        {/* Bottom small crest diamond */}
        <polygon points="50,108 55,114 50,120 45,114" fill="#00E5FF" />
      </svg>

      {/* Clipped Avatar Image */}
      <div
        className="w-[90%] h-[90%] overflow-hidden bg-surface-2"
        style={{ clipPath: `url(#${clipId})` }}
      >
        <img
          src={src || defaultAvatar}
          alt={alt}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
      </div>
    </div>
  );
};

export default AvatarHexagon;
