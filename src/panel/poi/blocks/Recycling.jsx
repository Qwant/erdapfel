import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Meter } from 'src/components/ui';
import { GREEN_BASE, ORANGE_BASE, RED_BASE } from 'src/libs/colors';
import { useI18n } from 'src/hooks';
import { IconTime } from '@qwant/qwant-ponents';

const Container = ({ type, filling_level, updated_at }) => {
  const { locale, _ } = useI18n();

  const containerTypes = type => {
    return (
      {
        glass: _('Glass', 'recycling'),
        recyclable: _('Recyclable', 'recycling'),
      }[type] || _('Unknown', 'recycling')
    );
  };

  return (
    <div className="recycling-container">
      <Flex className="u-mb-xs">
        <IconTime size={16} className="u-mr-xxs" />
        <div className="u-text--caption">
          {_('Updated {datetime}', 'recycling', {
            datetime: Intl.DateTimeFormat(locale.replace('_', '-'), {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            }).format(new Date(updated_at)),
          })}
        </div>
      </Flex>
      <Flex justifyContent="space-between">
        <div className="u-text--smallTitle">{containerTypes(type)}</div>
        <div>
          {filling_level}
          {' %'}
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
  );
};

const RecyclingBlock = ({ block }) => {
  const containers = block?.containers;
  if (containers.length === 0) {
    return null;
  }

  return (
    <div className="recycling">
      {containers.map((container, index) => (
        <Container key={index} {...container} />
      ))}
    </div>
  );
};

RecyclingBlock.propTypes = {
  block: PropTypes.object.isRequired,
};

export default RecyclingBlock;
