import React, { useCallback } from 'react';
import { components } from 'appTypes/idunn';
import Meter from 'src/components/ui/Meter';
import { GREEN_BASE, ORANGE_BASE, RED_BASE } from 'src/libs/colors';
import { Flex, IconTime } from '@qwant/qwant-ponents';

export type PoiRecyclingBlockProps = {
  texts?: {
    glass: string;
    recyclable: string;
    unknown: string;
    updated_at: string;
  };
  locale?: string;
  block: components['schemas']['RecyclingBlock'];
};

const RecyclingBlock: React.FunctionComponent<PoiRecyclingBlockProps> = ({
  block,
  texts,
  locale,
}) => {
  const containerTypes = useCallback(
    type => {
      return (
        {
          glass: texts?.glass,
          recyclable: texts?.recyclable,
        }[type] || texts?.unknown
      );
    },
    [texts]
  );

  if (block?.containers?.length === 0) {
    return null;
  }

  return (
    <div className="recycling">
      {block?.containers.map(({ type, updated_at, filling_level }) => (
        <div key={updated_at} className="recycling-container">
          <Flex className="u-mb-xs">
            <IconTime size={16} className="u-mr-xxs" />
            <div className="u-text--caption">
              {texts?.updated_at?.replace(
                '{datetime}',
                Intl.DateTimeFormat(locale?.replace('_', '-'), {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }).format(new Date(updated_at))
              )}
            </div>
          </Flex>
          <Flex between>
            <div className="u-text--smallTitle">{containerTypes(type)}</div>
            <div>
              {filling_level}
              {' %'}
            </div>
          </Flex>
          <Meter
            value={filling_level}
            colors={[
              { min: 0, color: GREEN_BASE },
              { min: 50, color: ORANGE_BASE },
              { min: 75, color: RED_BASE },
            ]}
          />
        </div>
      ))}
    </div>
  );
};

export default RecyclingBlock;
