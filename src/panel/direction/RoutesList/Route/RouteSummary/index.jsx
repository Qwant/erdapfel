import React from 'react';
import PropTypes from 'prop-types';
import { IconList } from 'src/components/ui/icons';
import RouteSummaryInfo from '../../../RouteSummaryInfo';
import { Flex, Button } from '@qwant/qwant-ponents';
import { useI18n } from 'src/hooks';

const RouteSummary = ({
  id,
  route,
  vehicle,
  toggleDetails,
  selectRoute,
  isActive,
  showDetails,
}) => {
  const { _ } = useI18n();

  const onClickDetails = event => {
    event.stopPropagation();
    toggleDetails(id);
    event.currentTarget.blur();
  };

  return (
    <Flex
      className="itinerary_leg_summary"
      between
      onClick={() => {
        selectRoute(id);
      }}
    >
      <RouteSummaryInfo isFastest={id === 0} route={route} vehicle={vehicle} />

      {isActive && (
        <Button
          className="itinerary_leg_detailsBtn"
          onClick={onClickDetails}
          variant={showDetails ? 'tertiary-black' : 'secondary-black'}
        >
          {showDetails ? (
            _('See less', 'direction')
          ) : (
            <>
              <IconList width={16} />
              {_('Steps', 'steps')}
            </>
          )}
        </Button>
      )}
    </Flex>
  );
};

RouteSummary.propTypes = {
  id: PropTypes.number.isRequired,
  route: PropTypes.object.isRequired,
  vehicle: PropTypes.string.isRequired,
  toggleDetails: PropTypes.func.isRequired,
  selectRoute: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  showDetails: PropTypes.bool.isRequired,
};

export default RouteSummary;
