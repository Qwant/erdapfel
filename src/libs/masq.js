/* global _ */

import Error from '../adapters/error';
import MasqActivatingModal from '../modals/masq_activating_modal';
import importMasq from './import_masq';
import Poi from '../adapters/poi/poi';
import { detect } from 'detect-browser';

const handleError = (fct, msg, e) => {
  Error.sendOnce('masq_store', fct, msg, e);
};

export default class MasqStore {
  constructor(config) {
    this.storeName = 'masq';

    this.masq = null;
    this.config = config;

    this.initPromise = this.init();
    this.initialized = false;
  }

  async init() {
    const masqOptions = {
      hubUrls: this.config.signalhubUrl,
      masqAppBaseUrl: this.config.baseMasqAppUrl,
    };

    const stunTurn = this._getStunTurnFromConf();
    if (stunTurn.length > 0) {
      masqOptions.swarmConfig = {
        iceServers: stunTurn,
      };
    }

    const { Masq, MasqError } = await importMasq();
    const masqIconUrl = document.baseURI.replace(/(\/+)$/g, '') + this.config.icon;
    this.masq = new Masq(this.config.title, this.config.desc, masqIconUrl, masqOptions);
    await this.masq.init();
    this.masq.eventTarget.addEventListener('replicationError', (e) => {
      handleError('replicationError', e.detail.message, e.detail);
    });
    this.MasqError = MasqError;
    this.initialized = true;
  }

  async checkInit() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  _getStunTurnFromConf() {
    let stunTurn = [];
    if (this.config.stun) {
      stunTurn.push({
        urls: this.config.stun,
      });
    }
    if (this.config.turn) {
      const splitTurn = this.config.turn.split('|');
      stunTurn.push({
        urls: splitTurn[0],
        username: splitTurn[1],
        credential: splitTurn[2],
      });
    }
    return stunTurn;
  }

  openLoginPopupWindow(link) {
    this.masqPopupWindow = window.open(link, 'masq', 'height=800,width=1150');
    this.masqPopupWindow.focus();
  }

  /* eslint-disable-next-line */
  async login(apps) {
    await this.checkInit();
    // open Masq app window to connect to Masq
    this.openLoginPopupWindow(this.masq.loginLink);

    try {
      this.masqActivatingModal = new MasqActivatingModal();
      this.masqActivatingModal.open();
      await this.masq.logIntoMasq(true);
      this.masqActivatingModal.succeeded();
    } catch (e) {
      switch (e.code) {
      case this.MasqError.SIGNALLING_SERVER_ERROR:
        this.masqActivatingModal.failed(_('The connection failed between Qwant Maps and the Masq application (Signalling error)'));
        break;
      default:
        this.masqActivatingModal.failed(_('Could not connect to Masq'));
        break;
      }
      throw e;
    }
  }

  async logout() {
    await this.checkInit();
    await this.masq.signout();
  }

  async isLoggedIn() {
    await this.checkInit();
    return Boolean(this.masq && this.masq.isLoggedIn());
  }

  async getUserInfo() {
    await this.checkInit();
    const userInfo = {};
    userInfo.username = await this.masq.getUsername();
    userInfo.profileImage = await this.masq.getProfileImage();

    if (!userInfo.profileImage) {
      userInfo.defaultProfileImage = {};
      userInfo.defaultProfileImage.letter = userInfo.username[0].toUpperCase();

      const COLORS = [
        'masq-color-cyan',
        'masq-color-blue',
        'masq-color-green',
        'masq-color-red',
        'masq-color-bluegrey',
        'masq-color-yellow',
      ];
      const index = userInfo.username.charCodeAt(0) % COLORS.length;
      userInfo.defaultProfileImage.backgroundColor = COLORS[index];
    }

    return userInfo;
  }

  async get(k) {
    await this.checkInit();
    try {
      return await this.masq.get(k);
    } catch (e) {
      handleError('get', `error parsing item with key ${k}`, e);
      throw e;
    }
  }

  async getAllPois() {
    await this.checkInit();

    try {
      const list = await this.masq.list();

      const filteredValues = Object.entries(list)
        .filter(kv => Poi.isPoiCompliantKey(kv[0]))
        .map(kv => kv[1]);

      return filteredValues;
    } catch (e) {
      handleError('getAllPois', 'error getting pois', e);
      throw e;
    }
  }

  async has(k) {
    await this.checkInit();
    return Boolean(await this.get(k));
  }

  async set(k, v) {
    await this.checkInit();
    try {
      await this.masq.put(k, v);
    } catch (e) {
      handleError('set', 'error setting item', e);
      throw e;
    }
  }

  async clear() {
    handleError('clear', 'masq storage doesn\'t support clear method');
  }

  async del(k) {
    await this.checkInit();
    try {
      await this.masq.del(k);
    } catch (e) {
      handleError('del', 'error removing item', e);
      throw e;
    }
  }

  static isMasqForced() {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('masq') === '1';
  }

  static isMasqSupported() {
    const SUPPORTED_BROWSERS = ['chrome', 'firefox', 'safari'];
    const browser = detect();
    if (!browser) {
      return false;
    }
    const isSupportedPlatform = browser.os && (
      browser.os.startsWith('Windows')
      || browser.os === 'Linux'
      || browser.os === 'Mac OS'
    );
    const isSupportedBrowser = SUPPORTED_BROWSERS.indexOf(browser.name) !== -1;
    return isSupportedPlatform && isSupportedBrowser;
  }
}
