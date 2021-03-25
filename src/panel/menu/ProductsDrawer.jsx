/* globals _ */
import React from 'react';
import { Flex } from 'src/components/ui';
import ProductCard from './ProductCard';

const ProductsDrawer = () => {
  return (
    <>
      <h3 className="u-text--heading3 u-mb-xl-2 u-center">
        {_('Products for everyday life.', 'menu')}
      </h3>
      <div className="products">
        {/* @HACK: the space characters in title string help create a distinct PO entry,
      as "Search"/"Rechercher" already existed and the context is ignored in our implementation.*/}
        <ProductCard
          title={_('   Search   ', 'products').trim()}
          logo="./statics/images/products/qwant-search.svg"
          desc={_('Responsible search that respects your privacy.', 'products')}
          link={_('Open Search', 'products')}
          href="https://qwant.com"
        />
        <ProductCard
          title={_('Maps', 'products')}
          logo="./statics/images/products/qwant-maps.svg"
          desc={_('The map that does not track you.', 'products')}
          link={_('Open Maps', 'products')}
          href="https://qwant.com/maps"
        />
        <ProductCard
          title={_('Junior', 'products')}
          logo="./statics/images/products/qwant-junior.svg"
          desc={_('Responsible search adapted to 6-12 year olds.', 'products')}
          link={_('Open Junior', 'products')}
          href="https://junior.qwant.com"
        />
      </div>
      <a
        href="https://qwant.com/?drawer=awareness"
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
              {_('We believe in an alternate model', 'products')}
            </div>
            <div className="card-link">{_('Read more', 'products')}</div>
          </div>
        </Flex>
      </a>
    </>
  );
};

export default ProductsDrawer;
