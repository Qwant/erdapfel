/* global _ */
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'src/components/ui/Modal';
import { listen } from 'src/libs/customEvents';
import { CloseButton } from 'src/components/ui';
import classnames from 'classnames';

const GeolocationModal = ({ status, onClose }) => {
  /* eslint-disable max-len */
  const statuses = {
    PENDING: {
      title: _('Enable your geolocation for better directions', 'geolocation'),
      text: _('Always respecting your privacy.<br>As stated in {privacyPolicyLink}our privacy policy{closeTag}, we don\'t store your information because we don\'t want to know your whereabouts.',
        'geolocation', {
          privacyPolicyLink: '<a target="_blank" rel="noopener noreferrer" href="https://about.qwant.com/legal/privacy">',
          closeTag: '</a>',
        }
      ),
      button: _('Ok, I\'ve got it', 'geolocation'),
      className: 'modal__maps__pending',
    },
    DENIED: {
      title: _('Geolocation not available.', 'geolocation'),
      text: _('You have not allowed Qwant Maps (or your device) to access your location.', 'geolocation'),
      button: _('Ok', 'geolocation'),
      className: 'modal__maps__denied',
    },
    NOT_ACTIVATED: {
      title: _('Geolocation not available.', 'geolocation'),
      text: _('Qwant Maps cannot determine your position. Check that location services are enabled on your system.'),
      button: _('Ok', 'geolocation'),
      className: 'modal__maps__not-activated',
    },
  };
  /* eslint-enable max-len */

  const { title, text, button, className } = statuses[status];
  return <Modal onClose={onClose}>
    <div className={classnames('modal__maps', className)}>
      <CloseButton onClick={onClose} />
      <div className="modal__maps__content">
        <h2 className="modal__title">{title}</h2>
        <div className="modal__subtitle" dangerouslySetInnerHTML={{ __html: text }} />
        <button className="modal__button" onClick={onClose}>{button}</button>
      </div>
    </div>
  </Modal>;
};

function close() {
  ReactDOM.unmountComponentAtNode(document.querySelector('.react_modal__container'));
}

function open(status, onClose) {
  ReactDOM.render(
    <GeolocationModal status={status} onClose={onClose} />,
    document.querySelector('.react_modal__container')
  );
}

listen('open_geolocate_not_activated_modal', () => open('NOT_ACTIVATED', close));

listen('open_geolocate_denied_modal', () => open('DENIED', close));

export async function openAndWaitForClose() {
  return new Promise(resolve => {
    open('PENDING', () => {
      close();
      resolve();
    });
  });
}

export default GeolocationModal;
