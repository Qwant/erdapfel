/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import DirectionInput from './DirectionInput';
import VehicleSelector from './VehicleSelector';
import { isMobileDevice } from 'src/libs/device';

export default class DirectionForm extends React.Component {
  static propTypes = {
    origin: PropTypes.object,
    destination: PropTypes.object,
    onChangeDirectionPoint: PropTypes.func.isRequired,
    onReversePoints: PropTypes.func.isRequired,
    onEmptyOrigin: PropTypes.func.isRequired,
    onEmptyDestination: PropTypes.func.isRequired,
    vehicles: PropTypes.array.isRequired,
    onSelectVehicle: PropTypes.func.isRequired,
    activeVehicle: PropTypes.string.isRequired,
    isInitializing: PropTypes.bool,
    originInputText: PropTypes.string,
    destinationInputText: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.originRef = React.createRef();
    this.destinationRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (isMobileDevice() || this.props.isInitializing) {
      return;
    }
    const { origin, destination, originInputText, destinationInputText } = this.props;
    if (!originInputText && (prevProps.destination !== destination || prevProps.isInitializing)) {
      this.originRef.current.focus();
    } else if (!destinationInputText && prevProps.origin !== origin) {
      this.destinationRef.current.focus();
    }
  }

  onChangePoint = (which, textInput, point) => {
    this.props.onChangeDirectionPoint(which, point);
  }

  onReverse = () => {
    this.props.onReversePoints();
  }

  render() {
    const {
      vehicles,
      activeVehicle,
      onSelectVehicle,
      originInputText,
      destinationInputText,
    } = this.props;

    return <div className="itinerary_form">
      <div className="itinerary_fields">
        <form noValidate>
          <DirectionInput
            value={originInputText}
            pointType="origin"
            onChangePoint={(input, point) => this.onChangePoint('origin', input, point)}
            ref={this.originRef}
          />
          <div className="itinerary__form__separator" />
          <DirectionInput
            value={destinationInputText}
            pointType="destination"
            onChangePoint={(input, point) => this.onChangePoint('destination', input, point)}
            ref={this.destinationRef}
          />
          <div
            className="itinerary_invert_origin_destination icon-reverse"
            onClick={this.onReverse}
            title={_('Invert start and end', 'direction')}
          />
        </form>
      </div>
      <VehicleSelector
        vehicles={vehicles}
        activeVehicle={activeVehicle}
        onSelectVehicle={onSelectVehicle}
      />
    </div>;
  }
}
