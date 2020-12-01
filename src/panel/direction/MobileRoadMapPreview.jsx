import React from 'react';
import PropTypes from 'prop-types';
import RoadMapStep from './RoadMapStep';
import { fire } from 'src/libs/customEvents';
import { CloseButton } from 'src/components/ui';

export default class MobileRoadMapPreview extends React.Component {
  static propTypes = {
    steps: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  state = {
    currentStep: 0,
  }

  componentDidMount() {
    this.highlightCurrentStep();
    fire('move_mobile_geolocation_button', 65);
    fire('move_mobile_bottom_ui', 105);
  }

  highlightCurrentStep = () => {
    fire('zoom_step', this.props.steps[this.state.currentStep]);
    const stepList = document.querySelectorAll('.itinerary_mobile_step');
    stepList.forEach((item, index) => {

      // Reset the style of all the steps
      item.classList.remove('active');
      item.classList.remove('past');

      // Show previous steps as "past"
      if (index < this.state.currentStep) {
        item.classList.add('past');
      }
    });

    // Show current step as "active"
    stepList[this.state.currentStep].classList.add('active');
  }

  scroll = () => {
    const steps = document.querySelector('.mobile-roadmap-preview-steps');
    const currentStep = Math.floor(
      // Divide the step container's scrollLeft up to the middle of the screen with the size of a step
      // to determine which step is present at the middle of the screen
      (steps.scrollLeft + window.innerWidth / 2) / (window.innerWidth - 70 + 12)
    );

    // If it has changed, save it and highlight it as the current step
    if (this.state.currentStep !== currentStep) {
      this.setState(
        () => ({ currentStep }),
        this.highlightCurrentStep
      );
    }
  }

  render() {
    return <div className="itinerary_mobile_step_by_step">
      <div className="mobile-roadmap-preview-close" onClick={this.props.onClose}>
        <i className="icon-arrow-left"/>
      </div>
      <div className="mobile-roadmap-preview-steps" onScroll={this.scroll}>
        {
          this.props.steps.map((step, index) =>
            <div key={index} className="itinerary_mobile_step">
              <RoadMapStep step={step}/>
            </div>)
        }
        <div className="itinerary_mobile_step spacer"></div>
      </div>
    </div>;
  }
}
