import { useConstraintInWindow } from './useConstraintInWindow';
import { Box, Card } from '@qwant/qwant-ponents';
import React, { forwardRef, useEffect, useRef } from 'react';
import { useClickAway } from 'react-use';
import { createPortal } from 'react-dom';

const ModalPadding = 30;

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
    if (wrapperRef && !mobile) {
      const { left, top } = wrapperRef.current.getBoundingClientRect();
      const { height } = ref.current.getBoundingClientRect();
      ref.current.style.setProperty('left', `${left}px`);
      // The popup will reach the outside of the screen
      if (top + height > window.innerHeight - ModalPadding) {
        ref.current.style.setProperty('top', 'auto');
        ref.current.style.setProperty('bottom', `${ModalPadding}px`);
      } else {
        ref.current.style.setProperty('top', `${top}px`);
        ref.current.style.removeProperty('bottom');
      }
    }
  }, [mobile]);

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
