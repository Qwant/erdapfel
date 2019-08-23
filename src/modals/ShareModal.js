/* globals _ */
import facebookTemplate from '../views/templates/facebook';
import twitterTemplate from '../views/templates/twitter';
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'src/components/ui/Modal';

export default class ShareModal extends React.Component {
  state = {
    copied: false,
  };

  copyUrlToClipBoard = () => {
    this.urlInputField.select();
    document.execCommand('copy');
    this.urlInputField.blur();
    this.setState({ copied: true });
  }

  openPopup = href => {
    const style = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600';
    window.open(href, '', style);
  }

  render() {
    const { url, onClose } = this.props;
    const facebookUrl = facebookTemplate(url);
    const twitterUrl = twitterTemplate(url);

    return <Modal onClose={onClose}>
      <div className="modal__maps">
        <i className="icon-x modal__close" onClick={onClose} />
        <h2 className="modal__title">{_('Share link', 'share')}</h2>

        <div className="share_copy__input__container" onClick={this.copyUrlToClipBoard}>
          <input
            id="share_url_data"
            type="text"
            readOnly
            value={url}
            ref={el => this.urlInputField = el}
          />
          <div className="share_copy__container">
            {this.state.copied
              ? <span className="share_copy__status">
                <i className="icon-check share_copy__status__icon" />
                {_('Copied !', 'share')}
              </span>
              : <button className="share_copy__link">
                <i className="icon-copy" />
              </button>
            }
          </div>
        </div>

        <hr className="modal__hr" />
        <i className="share__icons icon-facebook" />
        <a rel="noopener noreferrer" target="_blank" className="share__link"
          href={facebookUrl} onClick={() => this.openPopup(facebookUrl)}
        >
          {_('SHARE ON FACEBOOK', 'share')}
        </a>
        <hr className="modal__hr" />
        <i className="share__icons icon-twitter"></i>
        <a rel="noopener noreferrer" target="_blank" className="share__link"
          href={twitterUrl} onClick={() => this.openPopup(twitterUrl)}
        >
          {_('SHARE ON TWITTER', 'share')}
        </a>
      </div>
    </Modal>;
  }
}

function close() {
  ReactDOM.unmountComponentAtNode(document.querySelector('.share_modal__container'));
}

export function openShareModal(url) {
  ReactDOM.render(
    <ShareModal url={url} onClose={close} />,
    document.querySelector('.share_modal__container')
  );
}
