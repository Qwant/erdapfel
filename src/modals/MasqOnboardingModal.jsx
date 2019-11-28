/* global _ */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Modal from 'src/components/ui/Modal';
import Telemetry from 'src/libs/telemetry';
import Store from 'src/adapters/store';
import classnames from 'classnames';

const store = new Store();

/* eslint-disable max-len */
const steps = [
  {
    text: 'Welcome to Masq!',
  },
  {
    title: 'What is Masq?',
    text: 'Masq allows you to store all your preferences while guarantying your privacy',
  },
  {
    title: 'How does Masq work?',
    text: 'No more need for the Cloud! Your preferences and personnal data are stored directly on your devices, they are encrypted to guarantee their security. You are the owner of your data.',
  },
  {
    title: 'Why use Masq?',
    text: 'In the final release you will be able to synchronize your Masq profile between all your devices in real time without any Cloud!',
  },
];
/* eslint-enable max-len */

class MasqOnboardingModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
  }

  state = {
    currentStep: 0,
  }

  nextStep = () => {
    this.setState(prevState => ({
      currentStep: prevState.currentStep === 3 ? 0 : prevState.currentStep + 1,
    }));
  }

  previousStep = () => {
    this.setState(prevState => ({
      currentStep: prevState.currentStep === 0 ? 3 : prevState.currentStep - 1,
    }));
  }

  async openMasq() {
    try {
      await store.login();
      Telemetry.add(Telemetry.MASQ_ONBOARDING_ACTIVATE);
    } catch (e) {
      console.warn(`openMask: store.login failed: ${e}`);
    }
    this.props.onClose();
  }

  render() {
    const { onClose } = this.props;
    const { currentStep } = this.state;
    const { title, text } = steps[currentStep];

    return <Modal onClose={onClose}>
      <div className="modal__masq_onboarding">
        <div className="modal__masq_onboarding__steps">
          {currentStep === 0 ?
            <div className="modal__masq_onboarding__first_header">
              <div className="icon-masq modal__masq_onboarding__logo"></div>
              <i className="icon-x modal__masq_onboarding__close" onClick={onClose} />
            </div>
            :
            <div className="modal__masq_onboarding__header">
              <div>{_(title)}</div>
              <i className="icon-x modal__masq_onboarding__close" onClick={onClose} />
            </div>
          }

          <div className="modal__masq_onboarding__body">
            <div className="modal__masq_onboarding__middle">
              <div className="modal__masq_onboarding__chevron_container">
                {currentStep !== 0 &&
                  <div className="modal__masq_onboarding__chevron icon-chevron-left"
                    onClick={this.previousStep} />
                }
              </div>

              <div className={classnames(
                'modal__masq_onboarding__image',
                `modal__masq_onboarding__image_${currentStep + 1}`
              )} />

              <div className="modal__masq_onboarding__chevron_container">
                {currentStep !== 3 &&
                  <div className="modal__masq_onboarding__chevron icon-chevron-right"
                    onClick={this.nextStep} />
                }
              </div>
            </div>

            <div className="modal__masq_onboarding__text">{_(text)}</div>

            <div className="modal__masq_onboarding__slider">
              {[0, 1, 2, 3].map(step =>
                <div key={step} className={classnames('modal__masq_onboarding__dot', {
                  'modal__masq_onboarding__dot--active': currentStep === step,
                })} />
              )}
            </div>

            <div className="modal__masq_onboarding__buttons">
              <button className="modal__masq_onboarding__button" onClick={this.openMasq}>
                {_('Activate Masq')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>;
  }
}

function close() {
  ReactDOM.unmountComponentAtNode(document.querySelector('.react_modal__container'));
}

export function open(closeCallback) {
  ReactDOM.render(
    <MasqOnboardingModal onClose={closeCallback || close} />,
    document.querySelector('.react_modal__container')
  );
}

export async function openAndWaitForClose() {
  return new Promise(resolve => {
    open(() => {
      close();
      resolve();
    });
  });
}

export default MasqOnboardingModal;
