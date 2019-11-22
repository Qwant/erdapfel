/* global _ */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Modal from 'src/components/ui/Modal';
import Telemetry from 'src/libs/telemetry';
import Error from 'src/adapters/error';
import { version } from 'config/constants.yml';
import MasqOnboardingModal from './masq_onboarding_modal';
import Store from 'src/adapters/store';

const store = new Store();

class MasqFavoriteModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.doNotAskAgainCheckboxRef = React.createRef();
  }

  componentWillUnmount() {
    const doNotAskAgain = this.doNotAskAgainCheckboxRef.current.checked;
    localStorage.setItem(`qmaps_v${version}_add_favorite_ask_masq`, doNotAskAgain);
  }

  openMasq = async () => {
    try {
      await store.login();
      Telemetry.add(Telemetry.MASQ_ADD_POI_MODAL_ACTIVATE);
    } catch (e) {
      Error.sendOnce('masq_favorite_modal', 'openMasq', 'Failed to login', e);
    }
    this.props.onClose();
  }

  openOnboarding = async () => {
    const onboardingModal = new MasqOnboardingModal();
    onboardingModal.open();
    Telemetry.add(Telemetry.MASQ_ADD_POI_MODAL_ONBOARDING);
    await onboardingModal.waitForClose();

    if (await store.isLoggedIn()) {
      this.props.onClose();
    }
  }

  render() {
    const { onClose } = this.props;

    return <Modal onClose={onClose}>
      <div className="modal__masq_favorite">
        <div className="modal__masq_favorite__header">
          <div className="icon-masq modal__masq_favorite__logo" />
          <i className="icon-x modal__masq_favorite__close" onClick={onClose} />
        </div>

        <div className="modal__masq_favorite__body">
          <h2 className="modal__title">
            {/* eslint-disable-next-line */}
            {_('Qwant Maps + Masq is the solution for a web mapping service respecting your privacy!')}
          </h2>

          <div className="modal__subtitle">
            <div className="modal__masq_favorite__details">
              <i className="modal__masq_favorite__arrow" />
              <div onClick={this.openOnboarding}>{_('More Details')}</div>
            </div>
          </div>

          <div className="modal__masq_favorite__question">
            {_('Do you want to synchronize your favorites with Masq ?')}
          </div>

          <div className="modal__masq_favorite__buttons">
            <button className="modal__masq_favorite__button" onClick={this.openMasq}>
              {_('Activate Masq')}
            </button>
            <button
              className="modal__masq_favorite__button modal__masq_favorite__secondary_button"
              onClick={onClose}
            >
              {_('No thanks')}
            </button>
          </div>

          <div className="modal__masq_favorite__again">
            <label>
              <input type="checkbox" name="doNotAsk" ref={this.doNotAskAgainCheckboxRef}
                className="modal__masq_favorite__again_checkbox" />
              {_('Do not ask again')}
            </label>
          </div>
        </div>
      </div>
    </Modal>;
  }
}

function close() {
  ReactDOM.unmountComponentAtNode(document.querySelector('.react_modal__container'));
}

function open(onClose) {
  ReactDOM.render(
    <MasqFavoriteModal onClose={onClose} />,
    document.querySelector('.react_modal__container')
  );
}

export async function openAndWaitForClose() {
  const doNotAskAgain = localStorage.getItem(`qmaps_v${version}_add_favorite_ask_masq`);
  if (doNotAskAgain && doNotAskAgain !== 'false') {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    open(() => {
      close();
      resolve();
    });
  });
}

export default MasqFavoriteModal;
