/* globals _ */
import React from 'react';
import { Flex } from 'src/components/ui';
import ProductCard from './ProductCard';

const ProductsDrawer = () => {
  return <>
    <h3 className="u-text--heading3 u-mb-xl-2 u-center">
      {_('Products for everyday life', 'menu')}
    </h3>
    <div className="products">
      <ProductCard
        logo="./statics/images/products/qwant-search.svg"
        title={_('Search', 'products')}
        desc={_('Responsible research that respects your privacy.', 'products')}
        link={_('Open Search', 'products')}
        href="https://qwant.com"
      />
      <ProductCard
        logo="./statics/images/products/qwant-maps.svg"
        title={_('Maps', 'products')}
        desc={_('The map department that doesn\'t track you.', 'products')}
        link={_('Open Maps', 'products')}
        href="https://qwant.com/maps"
      />
      <ProductCard
        logo="./statics/images/products/qwant-junior.svg"
        title={_('Junior', 'products')}
        desc={_('Responsible research adapted to the 6-12 ans.', 'products')}
        link={_('Open Junior', 'products')}
        href="https://junior.qwant.com"
      />
    </div>
    <a href="https://qwant.com/?drawer=awareness"
      target="_blank"
      rel="noopener noreferrer"
      className="card u-mb-l"
    >
      <Flex>
        <div className="u-mr-l">
          <img width="100" height="100" src="./statics/images/products/web-internaute.svg" />
        </div>
        <div>
          <div className="u-color--primary u-text--heading5 u-mb-s">
            {_('We believe in another model', 'products')}
          </div>
          <div className="card-link">{_('Learn more', 'products')}</div>
        </div>
      </Flex>
    </a>
  </>;
};

export default ProductsDrawer;
