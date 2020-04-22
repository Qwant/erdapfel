/* global _ */
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'src/components/ui/Modal';

const GeolocationModal = ({ status, onClose }) => {
  /* eslint-disable max-len */
  const statuses = {
    PENDING: {
      title: _('Geolocation with privacy!', 'geolocation'),
      text: _('You need to know where you are? Please allow your application to access your location so that it can tell you. As stated in our {privacyPolicyLink} privacy policy {closeTag}, Qwant will not store your geolocation information. We don\'t want to know your whereabouts.',
        'geolocation', {
          privacyPolicyLink: '<a target="_blank" rel="noopener noreferrer" href="https://about.qwant.com/legal/privacy">',
          closeTag: '</a>',
        }
      ),
      button: _('Ok, I\'ve got it.', 'geolocation'),
    },
    DENIED: {
      title: _('Geolocation not available.', 'geolocation'),
      text: _('You have not allowed Qwant Maps (or your device) to access your location.', 'geolocation'),
      button: _('Ok', 'geolocation'),
    },
    NOT_ACTIVATED: {
      title: _('Geolocation not available.', 'geolocation'),
      text: _('Qwant Maps cannot determine your position. Check that location services are enabled on your system.'),
      button: _('Ok', 'geolocation'),
    },
  };
  /* eslint-enable max-len */

  const { title, text, button } = statuses[status];
  return <Modal onClose={onClose}>
    <div className="modal__maps">
      <i className="icon-x modal__close" onClick={onClose} />
      <h2 className="modal__title">{title}</h2>
      <div className="modal__subtitle" dangerouslySetInnerHTML={{ __html: text }} />
      <button className="modal__button" onClick={onClose}>{button}</button>
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
