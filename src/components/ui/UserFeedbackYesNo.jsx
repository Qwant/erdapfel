import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UserFeedbackQuestion, Alert } from './index';
import { useConfig, useI18n } from 'src/hooks';
import { IconThumbUp, IconThumbDown } from './icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { sendAnswer } from 'src/libs/userFeedback';

const UserFeedbackYesNo = ({ questionId, context, question }) => {
  const { enabled: userFeedBackEnabled } = useConfig('userFeedback');
  const { _ } = useI18n();
  const [isAnswered, setAnswered] = useState(false);
  const [isDismissed, setDismissed] = useState(false);

  const closeQuestion = () => {
    sendAnswer(questionId, 'dismiss', { context });
    setDismissed(true);
  };

  const onAnswer = answer => () => {
    sendAnswer(questionId, answer, { context });
    setAnswered(true);
    // @TODO:
    // - hide question and remember it
  };

  if (!userFeedBackEnabled || isDismissed) {
    return null;
  }

  if (isAnswered) {
    return (
      <div className="feedback-success">
        <Alert type="success">
          {_("Thanks for your feedback, it's important for helping us improve our products.")}
        </Alert>
      </div>
    );
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
