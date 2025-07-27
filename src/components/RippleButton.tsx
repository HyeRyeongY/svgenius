'use client';

import { ReactNode, useState, useRef, MouseEvent } from 'react';

interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function RippleButton({ 
  children, 
  className = '', 
  onClick, 
  disabled = false, 
  style,
  title,
  type = 'button',
  ...props 
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      x,
      y,
      id: rippleIdRef.current++
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 300);

    if (onClick) {
      onClick(e);
    }
  };

  const getRippleColor = () => {
    if (className?.includes('primary')) {
      return 'rgba(0, 0, 0, 0.2)';
    }
    return 'rgba(255, 255, 255, 0.3)';
  };

  return (
    <button
      ref={buttonRef}
      className={`ripple-button ${className}`}
      onClick={handleClick}
      disabled={disabled}
      style={{
        position: 'relative',
        overflow: 'hidden',
        zIndex: 0,
        ...style
      }}
      title={title}
      type={type}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: getRippleColor(),
            transform: 'scale(0)',
            animation: 'ripple-animation 0.3s ease-out',
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      ))}
    </button>
  );
}