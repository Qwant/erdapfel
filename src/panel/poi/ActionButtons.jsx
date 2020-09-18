/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import Telemetry from 'src/libs/telemetry';
import { Flex, ShareMenu, Button } from 'src/components/ui';

const ActionButtons = ({
  poi,
  isDirectionActive,
  openDirection,
  onClickPhoneNumber,
  isPoiInFavorite,
  toggleStorePoi,
}) => {
  const onShareClick = (e, handler) => {
    Telemetry.add(Telemetry.POI_SHARE);
    return handler(e);
  };

  const onShare = target => {
    Telemetry.add(Telemetry.POI_SHARE_TO, { target, id: poi.id });
  };

  return <Flex className="poi_panel__actions">
    {isDirectionActive && <Button
      className="poi_panel__action__direction"
      variant="primary"
      onClick={openDirection}
      title={_('Directions', 'poi panel')}
    >
      { _('Directions', 'poi panel') }
    </Button>}

    {poi?.blocksByType?.phone && <Button
      className="poi_panel__action__phone"
      onClick={onClickPhoneNumber}
      icon="icon_phone"
      href={poi.blocksByType.phone.url}
      rel="noopener noreferrer external"
      title={_('Call', 'poi panel')}
    />}

    <Button
      className="poi_panel__action__favorite"
      onClick={toggleStorePoi}
      icon={isPoiInFavorite ? 'icon_star-filled' : 'star'}
      title={_('Favorites', 'poi panel')}
    />

    <ShareMenu
      url={window.location.toString()}
      scrollableParent=".panel-content"
      onShare={onShare}
    >
      {openMenu => <Button className="poi_panel__action__share"
        title={_('Share', 'poi panel')}
        icon="share-2"
        onClick={e => onShareClick(e, openMenu)}
      />}
    </ShareMenu>
  </Flex>;
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
