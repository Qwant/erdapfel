import React from 'react';
import classNames from 'classnames';

const Block = ({ icon, title, children, className, onClick, href, ...rest }) => {
  const Tag = href ? 'a' : 'div';

  return (
    <Tag
      className={classNames('block', { 'block--clickable': onClick || href }, className)}
      onClick={onClick}
      href={href}
      {...rest}
    >
      <i className={`block-icon icon-${icon}`} />
      <div className="block-content">
        <div className="u-firstCap u-text--caption u-mb-xxxs">{title}</div>
        <div className="block-value">{children}</div>
      </div>
    </Tag>
  );
};

export default Block;
