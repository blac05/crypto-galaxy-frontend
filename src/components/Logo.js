import React from 'react';
import logoImg from '../assets/logo.jpeg';

export default function CryptoGalaxyLogo({ size = 'md', showText = false }) {
  const sizes = {
    sm: { icon: 36 },
    md: { icon: 52 },
    lg: { icon: 80 },
    xl: { icon: 140 },
  };
  const s = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src={logoImg}
        alt="Crypto Galaxy Logo"
        style={{
          width: s.icon,
          height: s.icon,
          objectFit: 'contain',
          borderRadius: size === 'xl' ? 24 : 12,
          filter: 'drop-shadow(0 0 12px rgba(123, 47, 190, 0.6)) drop-shadow(0 0 24px rgba(0, 245, 255, 0.3))',
        }}
      />
    </div>
  );
}
