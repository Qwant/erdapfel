/* globals fire */
import React from 'react';
import PropTypes from 'prop-types';
import RoadMapStep from './RoadMapStep';

export default class MobileRoadMapPreview extends React.Component {
  static propTypes = {
    steps: PropTypes.array.isRequired,
  }

  state = {
    currentStep: 0,
  }

  componentDidMount() {
    this.zoomToCurrentStep();
  }

  zoomToCurrentStep = () => {
    fire('zoom_step', this.props.steps[this.state.currentStep]);
  }

  previous = () => {
    this.setState(
      prevState => ({ currentStep: Math.max(prevState.currentStep - 1, 0) }),
      this.zoomToCurrentStep
    );
  }

  next = () => {
    this.setState(
      prevState => ({ currentStep: Math.min(prevState.currentStep + 1, this.props.steps.length) }),
      this.zoomToCurrentStep
    );
  }

  render() {
    const currentStep = this.props.steps[this.state.currentStep];

    return <React.Fragment>
      <div className="itinerary_mobile_step">
        <RoadMapStep step={currentStep} />
      </div>

      <div className="itinerary_mobile_step_buttons">
        <button
          className="itinerary_mobile_step_button icon-chevron-left"
          disabled={this.state.currentStep === 0}
          onClick={this.previous}
        />
        <button
          className="itinerary_mobile_step_button icon-chevron-right"
          disabled={this.state.currentStep === this.props.steps.length - 1}
          onClick={this.next}
        />
      </div>
    </React.Fragment>;
  }
}
