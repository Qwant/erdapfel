/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import { CloseButton, Flex } from 'src/components/ui';

const ProductsPanel = ({ close }) => {
  return <div className="menu">
    <div className="menu__overlay" onClick={close} />

    <div className="menu__panel">
      <Flex className="menu-top u-mb-l">
        <CloseButton circle onClick={close} />
      </Flex>
      <h3 className="u-text--heading3">{_('Products for everyday life', 'menu')}</h3>
      <div className="products">
        <div className="product">
          {_('Search', 'menu')}
        </div>
        <div className="product">
          {_('Maps', 'menu')}
        </div>
        <div className="product">
          {_('Junior', 'menu')}
        </div>
      </div>
      <div className="model">
        {_('We believe in another model', 'menu')}
      </div>
    </div>
  </div>;
};

ProductsPanel.propTypes = {
  close: PropTypes.func.isRequired,
  openProducts: PropTypes.func.isRequired,
};

export default ProductsPanel;
