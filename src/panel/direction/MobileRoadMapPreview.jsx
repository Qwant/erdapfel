import React from 'react';
import PropTypes from 'prop-types';
import RoadMapStep from './RoadMapStep';
import { fire } from 'src/libs/customEvents';
import classnames from 'classnames';
import { Button } from '../../components/ui';

export default class MobileRoadMapPreview extends React.Component {
  constructor(props) {
    super(props);
    this.stepsRef = React.createRef();
  }

  static propTypes = {
    steps: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  state = {
    currentStep: 0,
    expanded: false,
  };

  componentDidMount() {
    fire('move_mobile_bottom_ui', 105);
    fire('zoom_step', this.props.steps[this.state.currentStep]);
  }

  scroll = () => {

    const currentStep = Math.floor(
      // Divide the step container's scrollLeft up to the middle of the screen with the size of a step
      // to determine which step is present at the middle of the screen
      (this.stepsRef.current.scrollLeft + window.innerWidth / 2) / (window.innerWidth - 70 + 12)
    );

    // If it has changed, save it and highlight it as the current step
    if (this.state.currentStep !== currentStep) {
      this.setState({ currentStep });
      fire('zoom_step', this.props.steps[currentStep]);
    }
  };

  toggleSize = () => {
    this.setState( { expanded: !this.state.expanded } );
    fire('move_mobile_bottom_ui', this.stepsRef.current.offsetHeight);
  };

  render() {
    return <div className="itinerary_mobile_step_by_step">
      <Button
        className="mobile-roadmap-preview-close"
        onClick={this.props.onClose}
        icon="arrow-left"
      />
      <div
        ref={this.stepsRef}
        className={classnames('mobile-roadmap-preview-steps', { expanded: this.state.expanded })}
        onScroll={this.scroll}
        onClick={this.toggleSize}
      >
        {
          this.props.steps.map((step, index) =>
            <div
              key={index}
              className={
                classnames(
                  'itinerary_mobile_step',
                  {
                    past: index < this.state.currentStep,
                    active: index === this.state.currentStep,
                  }
                )
              }>
              <RoadMapStep step={step}/>
            </div>)
        }
      </div>
    </div>;
  }
}
