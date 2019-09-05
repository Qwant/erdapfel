/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import IconManager from 'src/adapters/icon_manager';
import ExtendedString from 'src/libs/string';
import poiSubClass from 'src/mapbox/poi_subclass';
import Telemetry from 'src/libs/telemetry';
import layouts from 'src/panel/layouts.js';
import ContextMenu from 'src/components/ui/ContextMenu';
import { openShareModal } from 'src/modals/ShareModal';

export default class FavoritePoi extends React.Component {
  static propTypes = {
    poi: PropTypes.object.isRequired,
    removeFavorite: PropTypes.func.isRequired,
  }

  onClick = () => {
    Telemetry.add(Telemetry.FAVORITE_GO);
    window.app.navigateTo(`/place/${this.props.poi.toUrl()}`, {
      poi: this.props.poi.serialize(),
      centerMap: true,
      isFromFavorite: true,
      layout: layouts.FAVORITE,
    });
  }

  onShare = () => {
    Telemetry.add(Telemetry.FAVORITE_SHARE);
    openShareModal(this.props.poi.toAbsoluteUrl());
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
        <p className="favorite_panel__item__desc">
          {poi.subClassName ? poiSubClass(poi.subClassName) : ''}
        </p>
      </div>
      <ContextMenu items={contextMenuItems} />
    </div>;
  }
}
