/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import Telemetry from '../../libs/telemetry';

const facebookShareUrl = location => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location)}`;
};

const twitterShareUrl = location => {
  return `https://twitter.com/intent/tweet?url=${ encodeURIComponent(location) }`;
};

const menu_height = 3 * 32;

export default class ShareMenu extends React.Component {
  _isMounted = false;

  static propTypes = {
    url: PropTypes.string.isRequired,
    scrollableParent: PropTypes.string.isRequired,
  }

  state = {
    open: false,
    top: 0,
    left: 0,
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  open = e => {
    const targetBoundingRect = e.target.getBoundingClientRect();
    const top = targetBoundingRect.top;
    const left = targetBoundingRect.left;
    e.stopPropagation();
    this.setState({
      open: true,
      top: top + 30 + menu_height < innerHeight ? top + 20 : top - 15 - menu_height,
      left,
    });
    document.addEventListener('click', this.close);
    document.querySelector(this.props.scrollableParent).addEventListener('scroll', this.close);
    Telemetry.add(Telemetry.ITINERARY_SHARE);
  }

  close = () => {
    document.removeEventListener('click', this.close);
    document.querySelector(this.props.scrollableParent).removeEventListener('scroll', this.close);
    if (this._isMounted) {
      this.setState({ open: false });
    }
  }

  openPopup = href => {
    const style = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600';
    window.open(href, '', style);
  }

  copy(url) {
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  render() {
    const { url } = this.props;
    return <div className="shareMenu">
      <div className="shareMenu-button" onClick={this.open} >
        <i className="icon-share-2" />
      </div>
      {this.state.open && <div className="shareMenu-menu"
        style={{ left: this.state.left + 'px', top: this.state.top + 'px' }}>

        <div className="shareMenu-menuItem shareMenu-menuItem--copy" onClick={e => {
          e.stopPropagation();
          this.copy(url);
          this.close();
        }}>
          <i className="icon-copy" />
          {_('Copy link', 'share')}
        </div>

        <div className="shareMenu-menuItem shareMenu-menuItem--facebook" onClick={e => {
          e.stopPropagation();
          this.openPopup(facebookShareUrl(url));
          this.close();
        }}>
          <i className="icon-facebook" />
          {_('Facebook', 'share')}
        </div>

        <div className="shareMenu-menuItem shareMenu-menuItem--twitter" onClick={e => {
          e.stopPropagation();
          this.openPopup(twitterShareUrl(url));
          this.close();
        }}>
          <i className="icon-twitter" />
          {_('Twitter', 'share')}
        </div>

      </div>}
    </div>;
  }
}
