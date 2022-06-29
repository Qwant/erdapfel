import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UserFeedbackQuestion } from './index';
import { Alert } from '@qwant/qwant-ponents';
import { useConfig, useI18n } from 'src/hooks';
import { IconThumbUp, IconThumbDown } from './icons';
import { sendAnswer, rememberAnswer, shouldBeDisplayed } from 'src/libs/userFeedback';

const UserFeedbackYesNo = ({ questionId, context, question }) => {
  const { enabled: userFeedBackEnabled, dismissDurationDays } = useConfig('userFeedback');
  const { _ } = useI18n();
  const [isAnswered, setAnswered] = useState(false);
  const [isDismissed, setDismissed] = useState(false);
  const [isSuccessHidden, setSuccessHidden] = useState(false);
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

  if (isAnswered && !isSuccessHidden) {
    return (
      <div className="feedback-success">
        <Alert
          className="feedback-success-alert"
          type="success"
          onClose={() => setSuccessHidden(true)}
        >
          {_('Thank you for helping us to improve your experience.')}
        </Alert>
      </div>
    );
  }

  if (!userFeedBackEnabled || !display || isDismissed || isSuccessHidden) {
    return null;
  }

  return (
    <UserFeedbackQuestion
      onClose={closeQuestion}
      question={question}
      options={[
        {
          label: `${_('Yes')}`,
          icon: <IconThumbUp fill="var(--green-500)" width={16} />,
          callback: onAnswer('yes'),
        },
        {
          label: `${_('No')}`,
          icon: <IconThumbDown fill="var(--green-500)" width={16} />,
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
