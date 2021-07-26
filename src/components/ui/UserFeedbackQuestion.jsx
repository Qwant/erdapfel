import React from 'react';
import PropTypes from 'prop-types';
import { Flex, CloseButton, Button } from './index';

const UserFeedbackQuestion = ({ question, options, onClose }) => {
  return (
    <Flex className="feedback">
      <div className="feedback-question u-mr-s">{question}</div>
      <Flex>
        {options.map(({ label, icon, callback }) => (
          <Button
            icon={icon}
            variant="tertiary"
            key={label}
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              callback();
            }}
            className="feedback-button u-mr-xs"
          >
            {label}
          </Button>
        ))}
      </Flex>
      <CloseButton
        position="topRight"
        variant="small"
        onMouseDown={e => {
          e.preventDefault();
          onClose();
        }}
      />
    </Flex>
  );
};

UserFeedbackQuestion.propTypes = {
  question: PropTypes.node,
  onClose: PropTypes.func,
  options: PropTypes.array,
};

export default UserFeedbackQuestion;
