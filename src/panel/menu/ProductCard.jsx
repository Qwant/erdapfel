import React, { useContext } from 'react';
import { DeviceContext } from 'src/libs/device';
import { Button } from 'src/components/ui';
import { IconAndroid, IconApple } from 'src/components/ui/icons';
import { GREY_SEMI_DARKNESS } from 'src/libs/colors';

const ProductCard = ({ logo, title, desc, link, href, mobileApps }) => {
  const isMobile = useContext(DeviceContext);

  return (
    <div className="card-wrapper">
      <a className="card productCard" href={href} target="_self">
        <img className="u-mb-xxs" src={logo} width="48" height="48" alt="" />
        <div className="u-color--primary u-text--heading5 u-mb-s">{title}</div>
        <div className="card-desc u-color--secondary u-text--body1 u-mb-l">{desc}</div>
        <div className="card-link">{link}</div>
      </a>
      {!isMobile && mobileApps && (
        <div className="card-apps">
          {mobileApps.android && (
            <Button
              className="card-appButton"
              href={mobileApps.android}
              variant="tertiary"
              icon={<IconAndroid width={16} height={16} color={GREY_SEMI_DARKNESS} />}
            />
          )}
          {mobileApps.ios && (
            <Button
              className="card-appButton"
              href={mobileApps.ios}
              variant="tertiary"
              icon={<IconApple width={16} height={16} color={GREY_SEMI_DARKNESS} />}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
