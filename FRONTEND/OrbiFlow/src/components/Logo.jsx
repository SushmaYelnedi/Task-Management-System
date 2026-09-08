import React from 'react';
import orbiflowLogo from '../assets/OrbiFlow.png';
import './Logo.css';

/*
  Reusable Logo component
  Props:
    size: "sm" | "md" | "lg" | number (px) - default md
    variant: "default" | "sidebar" | "header" - preset style contexts
    withText: boolean - optionally render brand text
*/
const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

const Logo = ({ size = 'md', variant = 'default', withText = false, text = 'OrbiFlow' }) => {
  const pixelSize = typeof size === 'number' ? size : (sizeMap[size] || sizeMap.md);
  return (
    <div className={`orbiflow-logo-wrapper variant-${variant}`}>      
      <img
        src={orbiflowLogo}
        alt="OrbiFlow Logo"
        width={pixelSize}
        height={pixelSize}
        className="orbiflow-logo-img"
        draggable={false}
      />
      {withText && <span className="orbiflow-logo-text">{text}</span>}
    </div>
  );
};

export default Logo;
