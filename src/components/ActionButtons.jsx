/* global _ */
import React from 'react';
import classnames from 'classnames';

export default class ActionButtons extends React.Component {
  constructor(props) {
    super(props);
    this.elem = props.elem;
    this.poi = props.poi;
    this.favoriteClick = this.favoriteClick.bind(this);
  }

  favoriteClick() {
    console.log('hello!');
    click(this.elem.toggleStorePoi, this.elem);
  }

  render() {
    const elem = this.elem;
    const poi = this.poi;
    const phoneLinkStyle = elem.shouldPhoneBeHidden() ? { display: 'none' } : null;
    const phone = poi.blocksByType && poi.blocksByType.phone && elem.shouldPhoneBeHidden() &&
      <button className="poi_panel__action icon-icon_phone poi_phone_container_hidden"
        onClick={ () => click(elem.showPhone, elem) }>
        <div>{ _('SHOW NUMBER', 'poi') }</div>
      </button>;

    return <div className="poi_panel__actions">
      <button className={classnames('poi_panel__action', 'poi_panel__actions__icon__store', {
          'icon-icon_star-filled': poi.stored,
          'icon-icon_star': !poi.stored,
        })}
        onClick={ this.favoriteClick }
      >
        <div>{ poi.stored ? _('SAVED', 'poi') : _('FAVORITES', 'poi') }</div>
      </button>
      <button className="poi_panel__action icon-share-2" onClick={ () => click(elem.openShare, elem) }>
        <div>{ _('SHARE', 'poi') }</div>
      </button>
      { elem.isDirectionActive &&
        <button className="poi_panel__action icon-corner-up-right"
          onClick={ () => click(elem.openDirection, elem) }>
          <div>{ _('DIRECTIONS', 'poi') }</div>
        </button>
      }
      { phone }
      { poi.blocksByType && poi.blocksByType.phone &&
        <a style={ phoneLinkStyle }
          className="poi_panel__action icon-icon_phone poi_phone_container_revealed"
          data-rel="external"
          rel="noopener noreferrer" href={ poi.blocksByType.phone.url }>
          <div>{ elem.htmlEncode(poi.blocksByType.phone.local_format) }</div>
        </a>
      }
    </div>;
  }
}
