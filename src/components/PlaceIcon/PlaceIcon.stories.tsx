import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import PlaceIcon, { PlaceIconProps } from './';

export default {
  title: 'Components/PlaceIcon',
  component: PlaceIcon,
} as ComponentMeta<typeof PlaceIcon>;

export const Favorite: ComponentStory<typeof PlaceIcon> = () => <PlaceIcon isFavorite />;
export const History: ComponentStory<typeof PlaceIcon> = () => <PlaceIcon isHistory />;
export const Geolocation: ComponentStory<typeof PlaceIcon> = () => (
  <PlaceIcon place={{ type: 'geoloc' }} />
);
export const WithPlacePoiTennisWithoutBackground: ComponentStory<typeof PlaceIcon> = () => (
  <PlaceIcon
    place={{
      type: 'poi',
      className: 'sports_centre',
      subClassName: 'tennis',
    }}
  />
);
export const WithPlacePoiTennisWithBackground: ComponentStory<typeof PlaceIcon> = () => (
  <PlaceIcon
    place={{
      type: 'poi',
      className: 'sports_centre',
      subClassName: 'tennis',
    }}
    withBackground
  />
);
export const WithCategoryPoiHotel: ComponentStory<typeof PlaceIcon> = () => (
  <PlaceIcon
    category={
      {
        iconName: 'lodging',
        color: '#6d6d76',
      } as PlaceIconProps['category']
    }
    withBackground
  />
);
