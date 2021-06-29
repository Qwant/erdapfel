import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UserFeedbackQuestion, Alert } from './index';
import { useConfig, useI18n } from 'src/hooks';
import { IconThumbUp, IconThumbDown } from './icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { sendAnswer, rememberAnswer, shouldBeDisplayed } from 'src/libs/userFeedback';

const UserFeedbackYesNo = ({ questionId, context, question }) => {
  const { enabled: userFeedBackEnabled, dismissDurationDays } = useConfig('userFeedback');
  const { _ } = useI18n();
  const [isAnswered, setAnswered] = useState(false);
  const [isDismissed, setDismissed] = useState(false);
  const display = shouldBeDisplayed(questionId, dismissDurationDays);

  const closeQuestion = () => {
    sendAnswer(questionId, 'dismiss', { context });
    rememberAnswer(questionId, 'dismiss');
    setDismissed(true);
  };

  const onAnswer = answer => () => {
    sendAnswer(questionId, answer, { context });
    rememberAnswer(questionId, answer);
    setAnswered(true);
  };

  if (isAnswered) {
    return (
      <div className="feedback-success">
        <Alert type="success" autoHideDelay={5000}>
          {_('Thank you for helping us to improve your experience.')}
        </Alert>
      </div>
    );
  }

  if (!userFeedBackEnabled || !display || isDismissed) {
    return null;
  }

  return (
    <UserFeedbackQuestion
      onClose={closeQuestion}
      question={question}
      options={[
        {
          label: `${_('Yes')}`,
          icon: <IconThumbUp fill={ACTION_BLUE_BASE} width={16} />,
          callback: onAnswer('yes'),
        },
        {
          label: `${_('No')}`,
          icon: <IconThumbDown fill={ACTION_BLUE_BASE} width={16} />,
          callback: onAnswer('no'),
        },
      ]}
    />
  );
};

UserFeedbackYesNo.propTypes = {
  question: PropTypes.node.isRequired,
  questionId: PropTypes.string.isRequired,
  context: PropTypes.string,
};

export default UserFeedbackYesNo;
