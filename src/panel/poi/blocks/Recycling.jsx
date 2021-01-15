/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, Meter } from 'src/components/ui';
import { GREEN_BASE, ORANGE_BASE, RED_BASE } from 'src/libs/colors';

const containerTypes = type => {
  return {
    glass: _('Glass', 'recycling'),
    recyclable: _('Recyclable', 'recycling'),
  }[type] || _('Unknown', 'recycling');
};

const Container = ({ type, filling_level, updated_at }) =>
  <div className="recycling-container">
    <Text level="caption" icon="icon_clock" className="u-mb-xs">
      {_(
        'Updated {datetime}',
        'recycling', {
          datetime: Intl.DateTimeFormat(window.getLang().locale.replace('_', '-'), {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric',
          }).format(new Date(updated_at)),
        }
      )}
    </Text>
    <Flex justifyContent="space-between">
      <Text level="smallTitle">{containerTypes(type)}</Text>
      <Text>{filling_level} %</Text>
    </Flex>
    <Meter value={filling_level} colors={[
      { min: 0, color: GREEN_BASE },
      { min: 50, color: ORANGE_BASE },
      { min: 75, color: RED_BASE },
    ]} />
  </div>;

const RecyclingBlock = ({ block }) => {
  const containers = block?.containers;
  if (containers.length === 0) {
    return null;
  }

  return <div className="recycling">
    {containers.map((container, index) => <Container key={index} {...container} />)}
  </div>;
};

RecyclingBlock.propTypes = {
  block: PropTypes.object.isRequired,
};

export default RecyclingBlock;
