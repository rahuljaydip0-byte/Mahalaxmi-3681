import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

export const CustomCursor: React.FC = () => {
  const { customCursorEnabled } = useApp();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!customCursorEnabled) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') !== null ||
        target.closest('a') !== null
      );
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [customCursorEnabled, isVisible]);

  if (!customCursorEnabled || !isVisible || window.innerWidth < 1024) {
    return null;
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 w-3 h-3 bg-amber-400 rounded-full pointer-events-none z-50 transition-transform duration-75 mix-blend-difference"
        style={{
          transform: `translate3d(${position.x - 6}px, ${position.y - 6}px, 0) scale(${isPointer ? 1.8 : 1})`,
        }}
      />
      <div
        className="fixed top-0 left-0 w-8 h-8 border border-amber-400/60 rounded-full pointer-events-none z-50 transition-all duration-200 ease-out"
        style={{
          transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0) scale(${isPointer ? 1.5 : 1})`,
        }}
      />
    </>
  );
};
