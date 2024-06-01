import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import DirectionInput from './DirectionInput';
import VehicleSelector from './VehicleSelector';
import { Divider } from 'src/components/ui';
import { IconArrowUpDown } from 'src/components/ui/icons';
import { Button } from '@qwant/qwant-ponents';
import { useI18n, useDevice } from 'src/hooks';

const DirectionForm = ({
  isLoading,
  origin,
  destination,
  onChangeDirectionPoint,
  onReversePoints,
  vehicles,
  onSelectVehicle,
  activeVehicle,
  isInitializing,
  originInputText,
  destinationInputText,
  onStartNow,
  onStartAt,
  onArriveBy,
}) => {
  const { _ } = useI18n();
  const { isMobile } = useDevice();
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  useEffect(() => {
    if (isMobile || isInitializing) {
      return;
    }

    if (!origin) {
      // If both text fields are empty or only destination is filled, focus on origin
      focus(originRef.current);
    } else if (!destination) {
      // an origin is set, destination is empty, so let's focus on destination
      focus(destinationRef.current);
    }
  }, [origin, destination, isMobile, isInitializing]);

  const focus = node => {
    setTimeout(() => {
      node.focus();
    }, 0);
  };

  return (
    <div className="direction-form">
      <VehicleSelector
        vehicles={vehicles}
        activeVehicle={activeVehicle}
        onSelectVehicle={onSelectVehicle}
        texts={{
          driving: _('by car'),
          walking: _('on foot'),
          cycling: _('by bike'),
          publicTransport: _('transit'),
        }}
      />
      <form className="direction-fields" noValidate>
        <div className="direction-fields-block">
          <DirectionInput
            isLoading={isLoading}
            value={originInputText}
            point={origin}
            otherPoint={destination}
            pointType="origin"
            onChangePoint={(input, point) => onChangeDirectionPoint('origin', input, point)}
            ref={originRef}
            withGeoloc={destination ? destination.type !== 'geoloc' : true}
          />
          <Divider className="direction-fields-block-divider" paddingTop={0} paddingBottom={0} />
          <DirectionInput
            isLoading={isLoading}
            value={destinationInputText}
            point={destination}
            otherPoint={origin}
            pointType="destination"
            onChangePoint={(input, point) => onChangeDirectionPoint('destination', input, point)}
            ref={destinationRef}
            withGeoloc={origin ? origin.type !== 'geoloc' : true}
          />
        </div>

        <Button
          pictoButton
          variant="secondary-black"
          disabled={originInputText === '' && destinationInputText === ''}
          className="direction-invert-button"
          onClick={onReversePoints}
          title={_('Invert start and end', 'direction')}
        >
          <IconArrowUpDown fill="currentColor" />
        </Button>
      </form>
      {activeVehicle === 'publicTransport' && (
        <div className="delayed">
          <p>
            Start now <button onClick={onStartNow}>GO</button>
          </p>
          <p>
            Start at <input type="datetime-local" id="start_at" />{' '}
            <button onClick={() => onStartAt(+new Date(document.querySelector('#start_at').value))}>
              OK
            </button>
          </p>
          <p>
            Arrive by <input type="datetime-local" id="arrive_by" />{' '}
            <button
              onClick={() => onArriveBy(+new Date(document.querySelector('#arrive_by').value))}
            >
              OK
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

DirectionForm.propTypes = {
  isLoading: PropTypes.bool,
  origin: PropTypes.object,
  destination: PropTypes.object,
  onChangeDirectionPoint: PropTypes.func.isRequired,
  onReversePoints: PropTypes.func.isRequired,
  vehicles: PropTypes.array.isRequired,
  onSelectVehicle: PropTypes.func.isRequired,
  activeVehicle: PropTypes.string.isRequired,
  isInitializing: PropTypes.bool,
  originInputText: PropTypes.string,
  destinationInputText: PropTypes.string,
};

export default DirectionForm;
