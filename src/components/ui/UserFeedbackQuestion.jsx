import React from 'react';
import PropTypes from 'prop-types';
import { Flex, CloseButton } from './index';
import { useI18n } from 'src/hooks';
import { IconQuestion } from './icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const UserFeedbackQuestion = ({ question, options, onClose }) => {
  const { _ } = useI18n();

  return (
    <div className="feedback">
      <Flex justifyContent="space-between" className="u-mb-xs">
        <Flex>
          <IconQuestion width={24} fill={ACTION_BLUE_BASE} className="u-mr-xs" />
          <div className="u-bold">{question}</div>
        </Flex>
        <CloseButton position="topRight" onClick={onClose} />
      </Flex>
      <Flex>
        {options.map(({ label, callback }) => (
          <button key={label} className="feedback-button" type="button" onClick={callback}>
            {label}
          </button>
        ))}{' '}
      </Flex>
    </div>
  );
};

UserFeedbackQuestion.propTypes = {
  question: PropTypes.node,
  onClose: PropTypes.func,
  options: PropTypes.array,
};

export default UserFeedbackQuestion;
