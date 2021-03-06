/* global _ */
import React, { useState, useRef, Fragment, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const facebookShareUrl = location => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location)}`;
};

const twitterShareUrl = location => {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(location)}`;
};

const menu_height = 3 * 32;

const copyToClipboard = value => {
  const el = document.createElement('textarea');
  el.value = value;
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

const openPopup = url => {
  const style = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600';
  window.open(url, '', style);
};

const ShareMenu = ({ url, scrollableParent = 'body', onShare = () => {}, children }) => {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const portalContainer = useRef(document.createElement('div'));

  useEffect(() => {
    const current = portalContainer.current;
    document.body.appendChild(current);

    return () => {
      document.body.removeChild(current);
    };
  }, []);

  useEffect(() => {
    const close = () => {
      setOpened(false);
    };

    if (opened) {
      document.addEventListener('click', close);
      document.querySelector(scrollableParent).addEventListener('scroll', close);
    }

    return () => {
      document.removeEventListener('click', close);
      document.querySelector(scrollableParent).removeEventListener('scroll', close);
    };
  }, [scrollableParent, opened]);

  const onOpen = e => {
    if (navigator.share) {
      // Native share modal (on mobile and Safari Mac)
      navigator.share({ title: document.title, url });
      return;
    }
    const { top: topPos, left: leftPos } = e.target.getBoundingClientRect();
    e.stopPropagation();
    setOpened(true);
    setCopied(false);
    setTop(topPos + 30 + menu_height < innerHeight ? topPos + 20 : topPos - 15 - menu_height);
    setLeft(leftPos);
  };

  const onCopyUrl = () => {
    copyToClipboard(url);
    setCopied(true);
  };

  return (
    <Fragment>
      {children(onOpen)}
      {opened &&
        ReactDOM.createPortal(
          <div className="shareMenu-menu" style={{ left: left + 'px', top: top + 'px' }}>
            <div
              className="shareMenu-menuItem shareMenu-menuItem--copy"
              onClick={e => {
                e.nativeEvent.stopImmediatePropagation();
                onCopyUrl();
                onShare('copy');
              }}
            >
              <i className="icon-copy" />
              {copied ? (
                <span className="shareMenu-menuItem--copied">{_('Copied!')}</span>
              ) : (
                _('Copy link', 'share')
              )}
            </div>

            <div
              className="shareMenu-menuItem shareMenu-menuItem--facebook"
              onClick={() => {
                openPopup(facebookShareUrl(url));
                onShare('facebook');
              }}
            >
              <i className="icon-facebook" />
              {_('Facebook', 'share')}
            </div>

            <div
              className="shareMenu-menuItem shareMenu-menuItem--twitter"
              onClick={() => {
                openPopup(twitterShareUrl(url));
                onShare('twitter');
              }}
            >
              <i className="icon-twitter" />
              {_('Twitter', 'share')}
            </div>
          </div>,
          portalContainer.current
        )}
    </Fragment>
  );
};

ShareMenu.propTypes = {
  url: PropTypes.string.isRequired,
  scrollableParent: PropTypes.string,
  children: PropTypes.func.isRequired,
  onShare: PropTypes.func,
};

export default ShareMenu;
