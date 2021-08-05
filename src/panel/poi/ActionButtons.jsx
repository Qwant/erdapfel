/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import Telemetry from 'src/libs/telemetry';
import { Flex, ShareMenu, Button } from 'src/components/ui';
import {
  IconHeart,
  IconHeartFill,
  IconCalendar,
  IconFileList,
  IconPhone,
  IconDirection,
  IconShare,
} from 'src/components/ui/icons';
import { PINK_DARK } from 'src/libs/colors';

const TransactionalButton = ({ poi }) => {
  const { booking_url, appointment_url, quotation_request_url } =
    poi?.blocksByType?.transactional || {};

  let Icon;
  let label;
  let url;
  let telemetryElement;
  if (booking_url) {
    Icon = IconCalendar;
    url = booking_url;
    label = _('Make a booking', 'poi panel');
    telemetryElement = 'booking';
  } else if (appointment_url) {
    Icon = IconCalendar;
    url = appointment_url;
    label = _('Make an appointment', 'poi panel');
    telemetryElement = 'appointment';
  } else if (quotation_request_url) {
    Icon = IconFileList;
    url = quotation_request_url;
    label = _('Request a quote', 'poi panel');
    telemetryElement = 'quotationRequest';
  } else {
    return null;
  }

  const sendTelemetryEvent = () => {
    Telemetry.sendPoiEvent(
      poi,
      'transactional',
      Telemetry.buildInteractionData({
        id: poi.id,
        source: poi.meta?.source,
        template: 'single',
        zone: 'detail',
        element: telemetryElement,
      })
    );
  };

  return (
    <Button
      icon={<Icon width={16} height={16} />}
      href={url}
      rel="noopener noreferrer external"
      title={label}
      onClick={sendTelemetryEvent}
    />
  );
};

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
    Telemetry.add(Telemetry.POI_SHARE_TO, { target });
  };

  const favoriteColor = isPoiInFavorite ? PINK_DARK : null;

  return (
    <Flex className="poi_panel__actions">
      {isDirectionActive && (
        <Button
          className="poi_panel__action__direction"
          variant="primary"
          icon={<IconDirection width={15} height={16} />}
          onClick={openDirection}
          title={_('Directions', 'poi panel')}
        >
          {_('Directions', 'poi panel')}
        </Button>
      )}

      {poi?.blocksByType?.phone && (
        <Button
          className="poi_panel__action__phone"
          onClick={onClickPhoneNumber}
          icon={<IconPhone width={16} height={16} />}
          href={poi.blocksByType.phone.url}
          rel="noopener noreferrer external"
          title={_('Call', 'poi panel')}
        />
      )}

      <TransactionalButton poi={poi} />

      <Button
        className="poi_panel__action__favorite"
        data-active={isPoiInFavorite}
        title={_('Favorites', 'poi panel')}
        onClick={toggleStorePoi}
        style={{ borderColor: favoriteColor }}
        icon={
          isPoiInFavorite ? (
            <IconHeartFill width={16} height={16} color={favoriteColor} />
          ) : (
            <IconHeart width={16} height={16} />
          )
        }
      />

      <ShareMenu
        url={window.location.toString()}
        scrollableParent=".panel-content"
        onShare={onShare}
      >
        {openMenu => (
          <Button
            className="poi_panel__action__share"
            title={_('Share', 'poi panel')}
            icon={<IconShare width={16} height={16} />}
            onClick={e => onShareClick(e, openMenu)}
          />
        )}
      </ShareMenu>
    </Flex>
  );
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
