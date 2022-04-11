import React, { useMemo } from 'react';
import Telemetry from 'src/libs/telemetry';
import ImagesBlock from '../blocks/Images';
import { findBlock } from 'src/libs/pois';
import PoiInformationBlock, { PoiInformationBlockProps } from '../blocks/Information';
import DetailsBlock from '../blocks/Details';
import PoiDescriptionBlock, { PoiDescriptionBlockProps } from '../blocks/Description';
import { useI18n } from 'src/hooks';
import { components } from 'appTypes/idunn';

export type PoiBlockContainerProps = {
  poi?: components['schemas']['Place'];
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
      hourBlock: findBlock(poi?.blocks, 'opening_hours'),
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
