/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import DirectionInput from './DirectionInput';
import Device from 'src/libs/device';

export default class DirectionForm extends React.Component {
  static propTypes = {
    origin: PropTypes.object,
    destination: PropTypes.object,
    onChangeDirectionPoint: PropTypes.func.isRequired,
    onReversePoints: PropTypes.func.isRequired,
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
    const { origin, destination } = this.props;
    const isMobile = Device.isMobile();

    return <div className="itinerary_fields">
      <DirectionInput
        value={originInputText}
        pointType="origin"
        onChangePoint={(input, point) => this.onChangePoint('origin', input, point)}
        claimFocus={!isMobile && !originInputText && !destination}
      />
      <div className="itinerary__form__separator" />
      <DirectionInput
        value={destinationInputText}
        pointType="destination"
        onChangePoint={(input, point) => this.onChangePoint('destination', input, point)}
        claimFocus={!isMobile && origin && !destinationInputText}
      />
      <div
        className="itinerary_invert_origin_destination icon-reverse"
        onClick={this.onReverse}
        title={_('Invert start and end', 'direction')}
      />
    </div>;
  }
}
