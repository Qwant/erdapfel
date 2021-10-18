import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import DirectionInput from './DirectionInput';
import VehicleSelector from './VehicleSelector';
import { Divider } from 'src/components/ui';
import { IconArrowUpDown } from 'src/components/ui/icons';
import { Button } from '@qwant/qwant-ponents';
import * as address from 'src/libs/address';
import { getInputValue } from 'src/libs/suggest';
import { isNullOrEmpty } from 'src/libs/object';
import { useI18n, useDevice } from 'src/hooks';
import { DirectionContext } from './directionStore';

const DirectionForm = ({
  onChangeDirectionPoint,
  onReversePoints,
  onSelectVehicle,
  isInitializing,
}) => {
  const { _ } = useI18n();
  const { isMobile } = useDevice();
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const {
    state: { origin, destination, vehicles, vehicle, isLoading },
  } = useContext(DirectionContext);
  const [originInputText, setOriginInputText] = useState('');
  const [destinationInputText, setDestinationInputText] = useState('');

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

  const onChangePoint = which => (value, point) => {
    if (which === 'origin') {
      setOriginInputText(value);
    } else {
      setDestinationInputText(value);
    }
    if (point) {
      onChangeDirectionPoint(which, point);
    }
  };

  const setText = useCallback((which, point) => {
    const setter = which === 'origin' ? setOriginInputText : setDestinationInputText;

    async function fetchAddress(poi) {
      poi.address = await address.fetch(poi);
      setter(getInputValue(poi));
    }

    if (point) {
      if (isNullOrEmpty(point.address)) {
        fetchAddress(point);
      } else {
        setter(getInputValue(point));
      }
    }
  }, []);

  useEffect(() => {
    setText('origin', origin);
  }, [origin, setText]);

  useEffect(() => {
    setText('destination', destination);
  }, [destination, setText]);

  return (
    <div className="direction-form">
      <form className="direction-fields" noValidate>
        <div className="direction-fields-block">
          <DirectionInput
            isLoading={isLoading}
            value={originInputText}
            point={origin}
            otherPoint={destination}
            pointType="origin"
            onChangePoint={onChangePoint('origin')}
            ref={originRef}
            withGeoloc={destination ? destination.type !== 'geoloc' : true}
          />
          <Divider paddingTop={0} paddingBottom={0} />
          <DirectionInput
            isLoading={isLoading}
            value={destinationInputText}
            point={destination}
            otherPoint={origin}
            pointType="destination"
            onChangePoint={onChangePoint('destination')}
            ref={destinationRef}
            withGeoloc={origin ? origin.type !== 'geoloc' : true}
          />
        </div>

        <Button
          pictoButton
          variant="secondary"
          disabled={originInputText === '' && destinationInputText === ''}
          className="direction-invert-button"
          onClick={onReversePoints}
          title={_('Invert start and end', 'direction')}
        >
          <IconArrowUpDown fill="currentColor" />
        </Button>
      </form>
      <VehicleSelector
        vehicles={vehicles}
        activeVehicle={vehicle}
        onSelectVehicle={onSelectVehicle}
      />
    </div>
  );
};

DirectionForm.propTypes = {
  onChangeDirectionPoint: PropTypes.func.isRequired,
  onReversePoints: PropTypes.func.isRequired,
  onSelectVehicle: PropTypes.func.isRequired,
  isInitializing: PropTypes.bool,
};

export default DirectionForm;
