import { useConstraintInWindow } from './useConstraintInWindow';
import { Box, Card } from '@qwant/qwant-ponents';
import React, { forwardRef, useEffect, useRef } from 'react';
import { useClickAway } from 'react-use';
import { createPortal } from 'react-dom';

export function ReservationDatepickerPopup({ children, onHide, mobile }) {
  const ref = useRef();
  const wrapperRef = useRef();
  useConstraintInWindow(ref, []);
  useClickAway(
    ref,
    e => {
      if (!['DatePickerFieldOut', 'DatePickerFieldIn'].includes(e.target.id)) {
        onHide();
      }
    },
    ['pointerdown']
  );
  useEffect(() => {
    if (wrapperRef) {
      const { left, top } = wrapperRef.current.getBoundingClientRect();
      ref.current.style.setProperty('left', `${left}px`);
      ref.current.style.setProperty('top', `${top}px`);
    }
  }, []);

  const Wrapper = mobile ? Box : PortaledCard;
  return (
    <Box relative ref={wrapperRef}>
      <Wrapper
        depth={2}
        pb={mobile ? null : 'm'}
        pt={mobile ? null : 'xl'}
        className="ReservationIADatePicker"
        ref={ref}
      >
        {children}
      </Wrapper>
    </Box>
  );
}

const PortaledCard = forwardRef((props, ref) => {
  return createPortal(<Card {...props} ref={ref} />, document.body);
});

PortaledCard.displayName = 'PortaledCard';
