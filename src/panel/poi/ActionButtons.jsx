/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import { ShareMenu, Button } from 'src/components/ui';

const ActionButtons = ({
  poi,
  isDirectionActive,
  openDirection,
  onClickPhoneNumber,
  isPoiInFavorite,
  toggleStorePoi,
}) => {
  return <div className="poi_panel__actions">
    {isDirectionActive && <Button
      className="poi_panel__action__direction"
      variant="primary"
      onClick={openDirection}
      title={_('Directions', 'poi panel')}
    >
      { _('Directions', 'poi panel') }
    </Button>}

    {poi?.blocksByType?.phone && <Button
      className="poi_panel__action__button poi_panel__action__phone"
      onClick={onClickPhoneNumber}
      icon="icon_phone"
      href={poi.blocksByType.phone.url}
      rel="noopener noreferrer external"
      title={_('Call', 'poi panel')}
    />}

    <Button
      className="poi_panel__action__button poi_panel__action__favorite"
      onClick={toggleStorePoi}
      icon={isPoiInFavorite ? 'icon_star-filled' : 'star'}
      title={_('Favorites', 'poi panel')}
    />

    <Button className="poi_panel__action__button poi_panel__action__share"
      title={_('Share', 'poi panel')}>
      <ShareMenu url={window.location.toString()} scrollableParent=".panel-content"/>
    </Button>
  </div>;
};

ActionButtons.propTypes = {
  poi: PropTypes.object.isRequired,
  isDirectionActive: PropTypes.bool,
  openDirection: PropTypes.func,
  onClickPhoneNumber: PropTypes.func,
  isPoiInFavorite: PropTypes.bool,
  toggleStorePoi: PropTypes.func.isRequired,
};

export default ActionButtons;
