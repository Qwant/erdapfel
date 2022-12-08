import React from 'react';
import { useI18n } from 'src/hooks';
import ProductCard from './ProductCard';
import ProductCardSmall from './ProductCardSmall';

const ProductsDrawer = () => {
  const { getLocalizedUrl, getLocalizedString, _ } = useI18n();

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
      <ProductCardSmall
        url={getLocalizedUrl('aboutHome')}
        img="./statics/images/products/web-internaute.svg"
        title={getLocalizedString('betterwebDesc')}
        linkText={getLocalizedString('betterwebOpen')}
      />
      <ProductCardSmall
        url={getLocalizedUrl('aboutExtension')}
        img="./statics/images/products/VIPrivacy.svg"
        title={_('VIPrivacy Protected Navigation')}
        linkText={getLocalizedString('betterwebOpen')}
      />
    </>
  );
};

export default ProductsDrawer;
