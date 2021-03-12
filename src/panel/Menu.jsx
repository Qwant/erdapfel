/* globals _ */
import React, { Fragment, useEffect, useState, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import MenuPanel from './menu/MenuPanel';
import Telemetry from 'src/libs/telemetry';
import { IconMenu } from 'src/components/ui/icons';
import { DeviceContext } from 'src/libs/device';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuContainer = useRef(document.createElement('div'));
  const isMobile = useContext(DeviceContext);

  useEffect(() => {
    const current = menuContainer.current;
    document.body.appendChild(current);
    return () => {
      document.body.removeChild(current);
    };
  }, []);

  const toggle = () => {
    if (!isOpen) {
      Telemetry.add(Telemetry.MENU_CLICK);
    }
    setIsOpen(!isOpen);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <Fragment>
      <button
        type="button"
        className={cx('menu__button', { 'menu__button--active': isOpen })}
        onClick={toggle}
        title={_('Menu')}
      >
        {isMobile ? <IconMenu /> : <IconMenu width={16} height={16} />}
      </button>

      {isOpen && ReactDOM.createPortal(<MenuPanel close={close} />, menuContainer.current)}
    </Fragment>
  );
};

export default Menu;
