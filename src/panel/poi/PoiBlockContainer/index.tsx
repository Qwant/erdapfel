import React, { useMemo } from 'react';
import Telemetry from 'src/libs/telemetry';
import ImagesBlock from '../blocks/Images';
import { findBlock } from 'src/libs/pois';
import InformationBlock from '../blocks/Information';
import DetailsBlock from '../blocks/Details';
import DescriptionBlock, { PoiDescriptionBlockProps } from '../blocks/Description';
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

  if (!poi) {
    return null;
  }

  return (
    <div className="poi_panel__info">
      {descriptionBlockProps?.block && <DescriptionBlock {...descriptionBlockProps} />}
      <InformationBlock poi={poi} />
      <ImagesBlock poi={poi} />
      <DetailsBlock poi={poi} />
    </div>
  );
};

export default PoiBlockContainer;
