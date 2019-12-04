import React from 'react';
import events from 'config/events.yml';
import { toCssUrl } from 'src/libs/url_utils';

const EventTitleImage = ({ poi, eventName, iconOnly }) => {
  if (poi.topImageUrl && !iconOnly) {
    return <div
      className="poiTitleImage poiTitleImage--image"
      style={{ backgroundImage: toCssUrl(poi.topImageUrl) }}
    />;
  }

  const eventIcon = events.find(ev => ev.name === eventName.toLowerCase()).icon;
  return <div className="poiTitleImage">
    <div className={`icon icon-${eventIcon}`} style={{ color: '#444648' }} />
  </div>;
};

export default EventTitleImage;
