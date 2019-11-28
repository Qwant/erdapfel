/* global _ */
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'src/components/ui/Modal';

const MasqActivatingModal = ({ status, onClose }) => {
  return <Modal onClose={onClose}>
    <div className="modal__masq_activating">
      <div className="modal__masq_activating__header">
        <div className="icon-masq modal__masq_activating__logo" />
        <i className="icon-x modal__masq_activating__close" onClick={onClose} />
      </div>

      <div className="modal__masq_activating__body">
        {status === 'activating' && <Fragment>
          <div className="modal__masq_activating__animation">
            <img src="./statics/images/masq/gifs/masq_loading.gif" title="Masq loading" />
          </div>
          <h2 className="modal__masq_activating__message">
            {_('Patience, Masq is activating...')}
          </h2>
          <div className="modal__masq_activating__buttons">
            <button className="modal__masq_activating__button" onClick={onClose}>
              {_('Cancel')}
            </button>
          </div>
        </Fragment>}
        {status === 'success' && <Fragment>
          <div className="icon-thumbs-up" />
          <h2 className="modal__masq_activating__message">
            {_('Well done, Masq is activated !')}<br />{_('Your data is now secured, enjoy !')}
          </h2>
          <div className="modal__masq_activating__buttons">
            <button className="modal__masq_activating__button modal__masq_activating__button_filled"
              onClick={onClose}
            >
              {_('Close')}
            </button>
          </div>
        </Fragment>}
        {status !== 'activating' && status !== 'success' && <Fragment>
          <h2 className="modal__masq_activating__title">{_('Masq activation failed')}</h2>
          <h2 className="modal__masq_activating__subtitle">{status}</h2>
          <div className="modal__masq_activating__buttons">
            <button className="modal__masq_activating__button" onClick={onClose}>
              {_('Close')}
            </button>
          </div>
        </Fragment>}
      </div>
    </div>
  </Modal>;
};

function close() {
  ReactDOM.unmountComponentAtNode(document.querySelector('.react_modal__container'));
}

export function setMasqActivatingModal(status) {
  ReactDOM.render(
    <MasqActivatingModal status={status} onClose={close} />,
    document.querySelector('.react_modal__container')
  );
}

export default MasqActivatingModal;
