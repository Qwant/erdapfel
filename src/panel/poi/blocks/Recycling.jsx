/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, Meter } from 'src/components/ui';

const GREEN = '#87c966';
const YELLOW = '#ffda12';
const RED = '#ff3b4a';

const containerTypes = type => {
  return {
    glass: _('Glass', 'recycling'),
    recyclable: _('Recyclable', 'recycling'),
  }[type] || _('Unknown', 'recycling');
};

const Container = ({ type, filling_level, updated_at }) =>
  <div className="recycling-container">
    <Text level="caption" icon="icon_clock" className="u-mb-8">
      {_(
        'Updated {datetime}',
        'recycling', {
          datetime: Intl.DateTimeFormat(window.getLang(), {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false,
          }).format(new Date(updated_at)),
        }
      )}
    </Text>
    <Flex spaceBetween>
      <Text level="smallTitle">{containerTypes(type)}</Text>
      <Text>{filling_level} %</Text>
    </Flex>
    <Meter value={filling_level} colors={[
      { min: 0, color: GREEN },
      { min: 50, color: YELLOW },
      { min: 75, color: RED },
    ]} />
  </div>;

const RecyclingBlock = ({ block }) => {
  const containers = block?.containers;
  if (containers.length === 0) {
    return null;
  }

  return <div className="poi_panel__info__section recycling">
    {containers.map((container, index) => <Container key={index} {...container} />)}
  </div>;
};

RecyclingBlock.propTypes = {
  block: PropTypes.object.isRequired,
};

export default RecyclingBlock;
