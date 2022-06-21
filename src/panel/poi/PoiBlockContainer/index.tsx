import React, { useMemo } from 'react';
import Telemetry from 'src/libs/telemetry';
import ImagesBlock from '../blocks/Images';
import { findBlock } from 'src/libs/pois';
import PoiInformationBlock, { PoiInformationBlockProps } from '../blocks/Information';
import DetailsBlock from '../blocks/Details';
import PoiDescriptionBlock, { PoiDescriptionBlockProps } from '../blocks/Description';
import { useI18n } from 'src/hooks';
import { components } from 'appTypes/idunn';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import OsmSchedule from 'src/adapters/osm_schedule';

export type PoiBlockContainerProps = {
  poi?: IdunnPoi;
};

const PoiBlockContainer: React.FunctionComponent<PoiBlockContainerProps> = ({ poi }) => {
  const { _ } = useI18n();
  const descriptionBlockProps: PoiDescriptionBlockProps = useMemo(
    () => ({
      block: findBlock(poi?.blocks, 'description') as components['schemas']['DescriptionBlock'],
      texts: {
        wikipedia: _('Read more on Wikipedia'),
        pagesjaunes: _('Read more on PagesJaunes'),
        readMore: _('Read more'),
      },
      onClick: () => {
        Telemetry.sendPoiEvent(
          poi,
          'description',
          Telemetry.buildInteractionData({
            id: poi?.id ?? '',
            source: poi?.meta?.source ?? '',
            template: 'single',
            zone: 'detail',
            element: 'description',
          })
        );
      },
    }),
    [_, poi]
  );

  const informationBlockProps: PoiInformationBlockProps = useMemo(
    () => ({
      title: _('Information'),
      addressBlock: {
        title: _('address'),
        address: poi?.address,
      },
      hourBlock: {
        schedule: new OsmSchedule(findBlock(poi?.blocks, 'opening_hours')),
        texts: {
          opening_hours: _('opening hours'),
          open: _('Open'),
          closed: _('Closed'),
          open_24_7: _('Open 24/7'),
          reopening: _('reopening at {nextTransitionTime}'),
          until: _('until {nextTransitionTime}'),
        },
      },
      phoneBlock: findBlock(poi?.blocks, 'phone'),
      websiteBlock: findBlock(poi?.blocks, 'website'),
      contactBlock: findBlock(poi?.blocks, 'contact'),
      recyclingBlock: findBlock(poi?.blocks, 'recycling'),
      socialBlock: findBlock(poi?.blocks, 'social'),
      poi,
    }),
    [_, poi]
  );

  if (!poi) {
    return null;
  }

  return (
    <div className="poi_panel__info">
      {descriptionBlockProps?.block && <PoiDescriptionBlock {...descriptionBlockProps} />}
      {informationBlockProps && <PoiInformationBlock {...informationBlockProps} />}
      <ImagesBlock poi={poi} />
      <DetailsBlock poi={poi} />
    </div>
  );
};

export default PoiBlockContainer;
