import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import RoadMapStep from './RoadMapStep';
import { fire } from 'src/libs/customEvents';
import classnames from 'classnames';
import { Button } from '../../components/ui';

const MobileRoadMapPreview = ({
  steps,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const stepsRef = React.createRef();

  const scroll = () => {

    const newStep = Math.floor(
      // Divide the step container's scrollLeft up to the middle of the screen with the size of a step
      // to determine which step is present at the middle of the screen
      (stepsRef.current.scrollLeft + window.innerWidth / 2) / (window.innerWidth - 70 + 12)
    );

    // If it has changed, save it and highlight it as the current step
    if (currentStep !== newStep) {
      setCurrentStep(newStep);
      fire('zoom_step', steps[newStep]);
    }
  };

  const toggleSize = () => {
    setExpanded(!expanded);
    fire('move_mobile_bottom_ui', stepsRef.current.offsetHeight);
  };

  // On load, zoom on step 0, unexpanded
  useEffect(
    () => {
      fire('move_mobile_bottom_ui', 105);
      fire('zoom_step', steps[0]);
    },
    []
  );

  // When expanded is modified, move the map's bottom UI
  useEffect(
    () => {
      fire('move_mobile_bottom_ui', stepsRef.current.offsetHeight);
    },
    [expanded]
  );

  // When currentStep is modified, zoom on it
  useEffect(
    () => {
      fire('zoom_step', steps[currentStep]);
    },
    [currentStep]
  );

  return <div className="itinerary_mobile_step_by_step">
    <Button
      className="mobile-roadmap-preview-close"
      onClick={onClose}
      icon="arrow-left"
    />
    <div
      ref={stepsRef}
      className={classnames('mobile-roadmap-preview-steps', { expanded })}
      onScroll={scroll}
      onClick={toggleSize}
    >
      {
        steps.map((step, index) =>
          <div
            key={index}
            className={
              classnames(
                'itinerary_mobile_step',
                {
                  past: index < currentStep,
                  active: index === currentStep,
                }
              )
            }>
            <RoadMapStep step={step}/>
          </div>)
      }
    </div>
  </div>;
};

MobileRoadMapPreview.propTypes = {
  steps: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MobileRoadMapPreview;
