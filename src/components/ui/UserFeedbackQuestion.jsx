import React from 'react';
import PropTypes from 'prop-types';
import { Flex, CloseButton, Button } from './index';

const UserFeedbackQuestion = ({ question, options, onClose }) => {
  return (
    <Flex className="feedback">
      <div className="u-mr-s">{question}</div>
      <Flex>
        {options.map(({ label, icon, callback }) => (
          <Button
            icon={icon}
            variant="tertiary"
            key={label}
            type="button"
            onClick={callback}
            className="u-mr-xs"
          >
            {label}
          </Button>
        ))}
      </Flex>
      <CloseButton position="topRight" variant="small" onClick={onClose} />
    </Flex>
  );
};

UserFeedbackQuestion.propTypes = {
  question: PropTypes.node,
  onClose: PropTypes.func,
  options: PropTypes.array,
};

export default UserFeedbackQuestion;
