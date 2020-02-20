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
    vehicles: PropTypes.array.isRequired,
    onSelectVehicle: PropTypes.func.isRequired,
    activeVehicle: PropTypes.string.isRequired,
    isInitializing: PropTypes.bool,
  }

  state = {
    originInputText: '',
    destinationInputText: '',
  }

  constructor(props) {
    super(props);
    this.originRef = React.createRef();
    this.destinationRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    const { origin, destination } = props;
    return {
      originInputText: origin ? origin.getInputValue() : state.originInputText,
      destinationInputText: destination ? destination.getInputValue() : state.destinationInputText,
    };
  }

  componentDidUpdate(prevProps) {
    if (isMobileDevice() || this.props.isInitializing) {
      return;
    }
    const { originInputText, destinationInputText } = this.state;
    const { origin, destination } = this.props;
    if (!originInputText && (prevProps.destination !== destination || prevProps.isInitializing)) {
      this.originRef.current.focus();
    } else if (!destinationInputText && prevProps.origin !== origin) {
      this.destinationRef.current.focus();
    }
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
    const { vehicles, activeVehicle, onSelectVehicle } = this.props;

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
