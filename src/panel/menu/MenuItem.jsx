import React from 'react';
import cx from 'classnames';
import { Flex } from 'src/components/ui';
import { IconExternalLink } from 'src/components/ui/icons';
import { GREY_SEMI_DARKNESS } from 'src/libs/colors';

const MenuItem = ({ icon, children, href, onClick, outsideLink }) =>
  <a
    className={cx('menu-item', { 'menu-item--outsideLink': outsideLink })}
    href={href || '#'}
    onClick={onClick}
    {...(outsideLink ? {
      rel: 'noopener noreferrer',
      target: '_blank',
    } : {})}
  >
    <Flex>
      {icon && <Flex className="u-mr-s">{icon}</Flex>}
      <div style={{ flexGrow: 1 }}>{children}</div>
      {outsideLink && <IconExternalLink width={16} fill={GREY_SEMI_DARKNESS} />}
    </Flex>
  </a>;

export default MenuItem;
