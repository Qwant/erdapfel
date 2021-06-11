import React, { useEffect, useState, useRef } from 'react';
import cs from 'classnames';
import { string, node } from 'prop-types';
import { CloseButton } from './index';
import { IconCheckboxCircle } from './icons';
import { GREEN_DARK } from 'src/libs/colors';

const Alert = ({ className = '', children, type }) => {
  const [hidden, setHidden] = useState(false);
  const alertRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Animate is not supported on old iOS
      if (alertRef.current && alertRef.current.animate) {
        alertRef.current.animate([{ opacity: 1 }, { opacity: 0 }], 300).onfinish = () => {
          setHidden(true);
        };
      } else {
        setHidden(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [alertRef]);

  if (hidden) {
    return null;
  }

  return (
    <div className={cs('alert', `alert--${type}`, className)} ref={alertRef}>
      <div className="alert-content">
        {type === 'success' && (
          <IconCheckboxCircle fill={GREEN_DARK} width={20} className="alert-icon u-mr-xs" />
        )}
        <div className="alert-text">{children}</div>
        <CloseButton variant="small" onClick={() => setHidden(true)} />
      </div>
    </div>
  );
};

Alert.propTypes = {
  className: string,
  children: node.isRequired,
  type: string,
};

export default Alert;
