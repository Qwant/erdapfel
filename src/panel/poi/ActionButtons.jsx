/* globals _ */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Telemetry from 'src/libs/telemetry';
import { ShareMenu } from 'src/components/ui';
import { IconHeart, IconHeartFill } from 'src/components/ui/icons';
import { isFromTripAdvisor } from 'src/libs/pois';
import { PINK_DARK } from 'src/libs/colors';
import {
  Stack,
  Button,
  IconDirection,
  IconPhone,
  IconCalendar,
  IconFileList,
  IconShare,
} from '@qwant/qwant-ponents';

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
      href={url}
      rel="noopener noreferrer external"
      title={label}
      onClick={sendTelemetryEvent}
      variant="secondary-black"
      pictoButton
    >
      <Icon />
    </Button>
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
  const directionsButtonVariant = useMemo(
    () => (isFromTripAdvisor(poi) ? 'secondary-black' : 'primary-green'),
    [poi]
  );

  return (
    <Stack className="poi_panel__actions" horizontal gap="xs">
      {isDirectionActive && (
        <Button
          className="poi_panel__action__direction"
          variant={directionsButtonVariant}
          onClick={openDirection}
          title={_('Directions', 'poi panel')}
        >
          <IconDirection />
          {_('Directions', 'poi panel')}
        </Button>
      )}

      {poi?.blocksByType?.phone && (
        <Button
          className="poi_panel__action__phone"
          variant="secondary-black"
          pictoButton
          onClick={onClickPhoneNumber}
          href={poi.blocksByType.phone.url}
          rel="noopener noreferrer external"
          title={_('Call', 'poi panel')}
        >
          <IconPhone />
        </Button>
      )}

      <TransactionalButton poi={poi} />

      <Button
        className="poi_panel__action__favorite"
        variant="secondary-black"
        pictoButton
        data-active={isPoiInFavorite}
        title={_('Favorites', 'poi panel')}
        onClick={toggleStorePoi}
        style={{ borderColor: favoriteColor }}
      >
        {isPoiInFavorite ? (
          <IconHeartFill width={16} height={16} fill={favoriteColor} />
        ) : (
          <IconHeart width={16} height={16} fill="currentColor" />
        )}
      </Button>

      <ShareMenu
        url={window.location.toString()}
        scrollableParent=".panel-content"
        onShare={onShare}
      >
        {openMenu => (
          <Button
            className="poi_panel__action__share"
            variant="secondary-black"
            pictoButton
            title={_('Share', 'poi panel')}
            onClick={e => onShareClick(e, openMenu)}
          >
            <IconShare />
          </Button>
        )}
      </ShareMenu>
    </Stack>
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
