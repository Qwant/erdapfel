/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import IconManager from 'src/adapters/icon_manager';
import ExtendedString from 'src/libs/string';
import poiSubClass from 'src/mapbox/poi_subclass';
import Telemetry from 'src/libs/telemetry';
import ContextMenu from 'src/components/ui/ContextMenu';
import { openShareModal } from 'src/modals/ShareModal';
import { toAbsoluteUrl, toUrl } from 'src/libs/pois';

export default class FavoritePoi extends React.Component {
  static propTypes = {
    poi: PropTypes.object.isRequired,
    removeFavorite: PropTypes.func.isRequired,
  }

  onClick = () => {
    Telemetry.add(Telemetry.FAVORITE_GO);
    window.app.navigateTo(`/place/${toUrl(this.props.poi)}`, {
      poi: this.props.poi,
      centerMap: true,
      isFromFavorite: true,
    });
  }

  onShare = () => {
    Telemetry.add(Telemetry.FAVORITE_SHARE);
    openShareModal(toAbsoluteUrl(this.props.poi));
  };

  onDelete = () => {
    this.props.removeFavorite(this.props.poi);
  };

  render() {
    const { poi } = this.props;
    const icon = IconManager.get(poi);
    const contextMenuItems = [
      {
        icon: 'share-2',
        label: _('Share'),
        action: this.onShare,
      },
      {
        icon: 'trash',
        label: _('Delete'),
        action: this.onDelete,
      },
    ];

    return <div className="favorite_panel__item" onClick={this.onClick}>
      <div
        className={`favorite_panel__item__image icon icon-${icon && icon.iconClass}`}
        style={{ color: icon && icon.color || '#444648' }}
      />
      <div className="favorite_panel__item__info">
        <p
          className="favorite_panel__item__title"
          dangerouslySetInnerHTML={{ __html: poi.name
            ? ExtendedString.htmlEncode(poi.name)
            : 'default',
          }}
        />
        <p className="favorite_panel__item__desc u-text--subtitle">
          {poi.subClassName ? poiSubClass(poi.subClassName) : ''}
        </p>
      </div>
      <ContextMenu items={contextMenuItems} />
    </div>;
  }
}
