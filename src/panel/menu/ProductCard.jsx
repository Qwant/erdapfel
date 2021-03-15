import React from 'react';

const ProductCard = ({ logo, title, desc, link, href }) => {
  return <a className="card productCard" href={href}>
    <div className="u-mb-s">
      <img src={logo} width="48" height="48" alt="" />
    </div>
    <div className="u-color--primary u-text--heading5 u-mb-s">{title}</div>
    <div className="u-color--secondary u-text--body1 u-mb-l">{desc}</div>
    <div className="card-link">{link}</div>
  </a>;
};

export default ProductCard;
