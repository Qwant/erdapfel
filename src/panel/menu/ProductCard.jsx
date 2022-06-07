import React from 'react';
import { useDevice } from 'src/hooks';
import { Button } from '@qwant/qwant-ponents';
import { IconAndroid, IconApple } from 'src/components/ui/icons';
import { GREY_SEMI_DARKNESS } from 'src/libs/colors';
import classnames from 'classnames';

const ProductCard = ({ name, logo, title, desc, link, href, mobileApps }) => {
  const { isMobile } = useDevice();

  return (
    <div className="card-wrapper">
      <a
        className={classnames('card', 'productCard', name)}
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        <img className="u-mb-xs" src={logo} width="48" height="48" alt="" />
        <div className="u-color--primary u-text--heading5 u-mb-s">{title}</div>
        <div
          className="card-desc u-color--primary u-text--body1 u-mb-xl"
          dangerouslySetInnerHTML={{ __html: desc }}
        />
        <div className="card-link u-color--primary u-bold">{link}</div>
      </a>
      {!isMobile && mobileApps && (
        <div className="card-apps">
          {mobileApps.android && (
            <Button
              pictoButton
              className="card-appButton"
              href={mobileApps.android}
              variant="tertiary"
            >
              <IconAndroid width={16} height={16} color={GREY_SEMI_DARKNESS} />
            </Button>
          )}
          {mobileApps.ios && (
            <Button pictoButton className="card-appButton" href={mobileApps.ios} variant="tertiary">
              <IconApple width={16} height={16} color={GREY_SEMI_DARKNESS} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
