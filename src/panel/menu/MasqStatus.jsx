/* globals _ */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import nconf from '@qwant/nconf-getter';
import MasqOnboardingModal from 'src/modals/masq_onboarding_modal';
import Telemetry from 'src/libs/telemetry';

const masqOnboardingModal = new MasqOnboardingModal();

export default class MasqStatus extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      profileImage: PropTypes.string,
      defaultProfileImage: PropTypes.object.isRequired,
    }),
  }

  login = async () => {
    try {
      Telemetry.add(Telemetry.MASQ_MENU_ACTIVATE);
      await this.props.store.login();
    } catch (e) {
      console.warn(`An exception occurred in MasqStatus::login: ${e}`);
    }
  }

  logout = async () => {
    Telemetry.add(Telemetry.MASQ_MENU_DESACTIVATE);
    await this.props.store.logout();
  }

  openMasqOnboarding = () => {
    Telemetry.add(Telemetry.MASQ_MENU_ONBOARDING);
    masqOnboardingModal.open();
  }

  openMasq = () => {
    Telemetry.add(Telemetry.MASQ_MENU_OPEN);
    window.open(nconf.get().masq.baseMasqAppUrl, '_blank');
  }

  renderLoggedIn = () => {
    const { username, profileImage, defaultProfileImage } = this.props.user;
    return <Fragment>
      <div
        className="masqStatus__login__button masqStatus__login__button_logged"
        onClick={this.openMasq}
      >
        {profileImage
          ? <img src={profileImage} className="masqStatus_profile_icon" />
          : <div className={`masqStatus_profile_icon masqStatus_profile_icon_default
              ${defaultProfileImage.backgroundColor}`}>
            <div>{defaultProfileImage.letter}</div>
          </div>
        }
        <span>{username}</span>
      </div>
      <div
        className="masqStatus__second__button masqStatus__second__button_logout"
        onClick={this.logout}
      >
        {_('Deactivate')}
      </div>
    </Fragment>;
  }

  renderLoggedOut = () => {
    return <Fragment>
      <input
        type="button"
        className="masqStatus__login__button"
        value={_('Activate')}
        onClick={this.login}
      />
      <div
        className="masqStatus__second__button masqStatus__second__button_discover"
        onClick={this.openMasqOnboarding}
      >
        {_('How does it work ?')}
      </div>
    </Fragment>;
  }

  render() {
    return <div className="masqStatus">
      <div className="icon-masq masqStatus__masq_icon" onClick={this.openMasq} />
      {this.props.user ? this.renderLoggedIn() : this.renderLoggedOut()}
    </div>;
  }
}
