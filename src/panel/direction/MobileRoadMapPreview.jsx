import React from 'react';
import PropTypes from 'prop-types';
import RoadMapStep from './RoadMapStep';
import { fire } from 'src/libs/customEvents';

export default class MobileRoadMapPreview extends React.Component {
  static propTypes = {
    steps: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  state = { };

  componentDidMount() {
    this.steps = document.querySelector('.mobile-roadmap-preview-steps');
    this.stepList = document.querySelectorAll('.itinerary_mobile_step');
    this.currentStep = 0;
    fire('move_mobile_bottom_ui', 105);
    this.highlightCurrentStep();
  }

  highlightCurrentStep = () => {
    fire('zoom_step', this.props.steps[this.currentStep]);
    this.stepList.forEach((item, index) => {

      // Reset the style of all the steps
      item.classList.remove('active');
      item.classList.remove('past');

      // Show previous steps as "past"
      if (index < this.currentStep) {
        item.classList.add('past');
      }
    });

    // Show current step as "active"
    this.stepList[this.currentStep].classList.add('active');
  };

  scroll = () => {

    const currentStep = Math.floor(
      // Divide the step container's scrollLeft up to the middle of the screen with the size of a step
      // to determine which step is present at the middle of the screen
      (this.steps.scrollLeft + window.innerWidth / 2) / (window.innerWidth - 70 + 12)
    );

    // If it has changed, save it and highlight it as the current step
    if (this.currentStep !== currentStep) {
      this.currentStep = currentStep;
      this.highlightCurrentStep();
    }
  };

  toggleSize = () => {
    this.steps.classList.toggle('expanded');
    fire('move_mobile_bottom_ui', this.steps.offsetHeight);
  };

  render() {
    return <div className="itinerary_mobile_step_by_step">
      <div className="mobile-roadmap-preview-close" onClick={this.props.onClose}>
        <i className="icon-arrow-left"/>
      </div>
      <div
        className="mobile-roadmap-preview-steps"
        onScroll={this.scroll}
        onClick={this.toggleSize}
      >
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
