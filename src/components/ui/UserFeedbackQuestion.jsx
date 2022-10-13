import React from 'react';
import PropTypes from 'prop-types';
import { CloseButton } from './index';
import { Flex, Button } from '@qwant/qwant-ponents';

const UserFeedbackQuestion = ({ question, options, onClose }) => {
  return (
    <Flex className="feedback" alignCenter>
      <div className="feedback-question u-mr-s">{question}</div>
      <Flex>
        {options.map(({ label, icon, callback }) => (
          <Button
            variant="tertiary-black"
            key={label}
            onMouseDown={e => {
              e.preventDefault();
              callback();
            }}
            className="u-mr-xs"
          >
            {icon}
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
