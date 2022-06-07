import React from 'react';
import { Flex } from '@qwant/qwant-ponents';
import { useI18n } from 'src/hooks';
import ProductCard from './ProductCard';

const ProductsDrawer = () => {
  const { getLocalizedUrl, getLocalizedString } = useI18n();

  return (
    <>
      <div className="products">
        {/* @HACK: the space characters in title string help create a distinct PO entry,
      as "Search"/"Rechercher" already existed and the context is ignored in our implementation.*/}
        <ProductCard
          name="productCardSearch"
          title="Search"
          logo="./statics/images/products/qwant-search.svg"
          desc={getLocalizedString('searchDesc')}
          link={getLocalizedString('searchOpen')}
          href="https://qwant.com"
          mobileApps={{
            android: 'https://play.google.com/store/apps/details?id=com.qwant.liberty',
            ios: 'https://itunes.apple.com/app/qwant/id924470452',
          }}
        />
        <ProductCard
          name="productCardMaps"
          title="Maps"
          logo="./statics/images/products/qwant-maps.svg"
          desc={getLocalizedString('mapsDesc')}
          link={getLocalizedString('mapsOpen')}
          href="https://qwant.com/maps"
        />
        <ProductCard
          name="productCardJunior"
          title="Junior"
          logo="./statics/images/products/qwant-junior.svg"
          desc={getLocalizedString('juniorDesc')}
          link={getLocalizedString('juniorOpen')}
          href="https://junior.qwant.com"
          mobileApps={{
            android: 'https://play.google.com/store/apps/details?id=com.qwantjunior.mobile',
            ios: 'https://apps.apple.com/app/qwant-junior/id1318660239',
          }}
        />
      </div>
      <a
        href={getLocalizedUrl('aboutHome')}
        target="_blank"
        rel="noopener noreferrer"
        className="card betterweb u-mb-l"
      >
        <Flex alignCenter>
          <div className="u-mr-l">
            <img width="100" height="100" src="./statics/images/products/web-internaute.svg" />
          </div>
          <div>
            <div className="u-color--primary u-text--heading5 u-mb-s">
              {getLocalizedString('betterwebDesc')}
            </div>
            <div className="card-link u-color--primary u-bold">
              {getLocalizedString('betterwebOpen')}
            </div>
          </div>
        </Flex>
      </a>
    </>
  );
};

export default ProductsDrawer;
