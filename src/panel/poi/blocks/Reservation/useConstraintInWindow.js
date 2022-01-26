import { useEffect } from 'react';

/**
 * Move an element to avoid overflow with the border of the screen
 */
export function useConstraintInWindow(ref, deps) {
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const rightCornerPosition = rect.x + rect.width;
    if (rightCornerPosition > window.innerWidth) {
      ref.current.style.setProperty(
        'transform',
        `translateX(-${rightCornerPosition - window.innerWidth + 30}px)`
      );
    } else {
      ref.current.style.removeProperty('transform');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
