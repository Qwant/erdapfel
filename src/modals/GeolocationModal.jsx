/* global _ */
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'src/components/ui/Modal';
import { listen } from 'src/libs/customEvents';

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
    },
  };
  /* eslint-enable max-len */

  const { title, text, button } = statuses[status];
  return <Modal onClose={onClose}>
    <div className="modal__maps">
      <i className="icon-x modal__close" onClick={onClose} />
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

export async function openAndWaitForClose() {
  return new Promise(resolve => {
    open('PENDING', () => {
      close();
      resolve();
    });
  });
}

export default GeolocationModal;
