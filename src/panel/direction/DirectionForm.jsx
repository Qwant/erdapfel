/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import DirectionInput from './DirectionInput';
import VehicleSelector from './VehicleSelector';
import { DeviceContext } from 'src/libs/device';

export default class DirectionForm extends React.Component {
  static propTypes = {
    origin: PropTypes.object,
    destination: PropTypes.object,
    onChangeDirectionPoint: PropTypes.func.isRequired,
    onReversePoints: PropTypes.func.isRequired,
    vehicles: PropTypes.array.isRequired,
    onSelectVehicle: PropTypes.func.isRequired,
    activeVehicle: PropTypes.string.isRequired,
    isInitializing: PropTypes.bool,
  }

  state = {
    originInputText: '',
    destinationInputText: '',
  }

  static getDerivedStateFromProps(props, state) {
    const { origin, destination } = props;
    return {
      originInputText: origin ? origin.getInputValue() : state.originInputText,
      destinationInputText: destination ? destination.getInputValue() : state.destinationInputText,
    };
  }

  onChangePoint = (which, textInput, point) => {
    if (which === 'origin') {
      this.setState({ originInputText: textInput });
    } else {
      this.setState({ destinationInputText: textInput });
    }
    this.props.onChangeDirectionPoint(which, point);
  }

  onReverse = () => {
    this.setState(prevState => ({
      originInputText: prevState.destinationInputText,
      destinationInputText: prevState.originInputText,
    }));
    this.props.onReversePoints();
  }

  render() {
    const { originInputText, destinationInputText } = this.state;
    const {
      origin, destination, isInitializing,
      vehicles, activeVehicle, onSelectVehicle,
    } = this.props;

    return <DeviceContext.Consumer>
      {isMobile => <div className="itinerary_form">
        <div className="itinerary_fields">
          <form noValidate>
            <DirectionInput
              value={originInputText}
              pointType="origin"
              onChangePoint={(input, point) => this.onChangePoint('origin', input, point)}
              claimFocus={!isMobile && !isInitializing && !originInputText && !destination}
            />
            <div className="itinerary__form__separator" />
            <DirectionInput
              value={destinationInputText}
              pointType="destination"
              onChangePoint={(input, point) => this.onChangePoint('destination', input, point)}
              claimFocus={!isMobile && !isInitializing && origin && !destinationInputText}
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
      </div>}
    </DeviceContext.Consumer>;
  }
}
