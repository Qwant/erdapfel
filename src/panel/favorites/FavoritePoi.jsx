/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import IconManager from 'src/adapters/icon_manager';
import { htmlEncode } from 'src/libs/string';
import poiSubClass from 'src/mapbox/poi_subclass';
import Telemetry from 'src/libs/telemetry';
import ShareMenu from 'src/components/ui/ShareMenu';
import { toAbsoluteUrl, toUrl } from 'src/libs/pois';

const FavoritePoi = ({ poi, removeFavorite }) => {
  const onClick = () => {
    Telemetry.add(Telemetry.FAVORITE_GO);
    window.app.navigateTo(`/place/${toUrl(poi)}`, {
      poi,
      centerMap: true,
      isFromFavorite: true,
    });
  };

  const onDelete = () => {
    removeFavorite(poi);
  };

  const onShareClick = (e, handler) => {
    Telemetry.add(Telemetry.FAVORITE_SHARE);
    return handler(e);
  };

  const icon = IconManager.get(poi);

  return (
    <div className="favorite_panel__item">
      <div
        className={`favorite_panel__item__image icon icon-${icon && icon.iconClass}`}
        style={{ color: (icon && icon.color) || '#444648' }}
      />
      <div className="favorite_panel__item__info" onClick={onClick}>
        <p
          className="favorite_panel__item__title"
          dangerouslySetInnerHTML={{ __html: poi.name ? htmlEncode(poi.name) : 'default' }}
        />
        <p className="favorite_panel__item__desc u-text--subtitle u-firstCap">
          {poi.subClassName ? poiSubClass(poi.subClassName) : ''}
        </p>
      </div>
      <ShareMenu url={toAbsoluteUrl(poi)} scrollableParent=".panel-content">
        {openMenu => (
          <div
            className="favorite_panel__item__share"
            title={_('Share')}
            onClick={e => onShareClick(e, openMenu)}
          >
            <i className="icon-share-2" />
          </div>
        )}
      </ShareMenu>
      <div className="favorite_panel__item__delete" title={_('Delete')} onClick={onDelete}>
        <span className="icon-trash" />
      </div>
    </div>
  );
};

FavoritePoi.propTypes = {
  poi: PropTypes.object.isRequired,
  removeFavorite: PropTypes.func.isRequired,
};

export default FavoritePoi;
