import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UserFeedbackQuestion } from './index';
import { useConfig, useI18n } from 'src/hooks';
import { IconThumbUp, IconThumbDown } from './icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { sendAnswer, rememberAnswer, shouldBeDisplayed } from 'src/libs/userFeedback';

const UserFeedbackYesNo = ({ questionId, context, question }) => {
  const { enabled: userFeedBackEnabled, dismissDurationDays } = useConfig('userFeedback');
  const { _ } = useI18n();
  const [isClosed, setClosed] = useState();
  const display = shouldBeDisplayed(questionId, dismissDurationDays);

  const closeQuestion = () => {
    sendAnswer(questionId, 'dismiss', { context });
    rememberAnswer(questionId, 'dismiss');
    setClosed(true);
  };

  const onAnswer = answer => () => {
    sendAnswer(questionId, answer, { context });
    rememberAnswer(questionId, answer);
    setClosed(true);
    // @TODO: - display thank you message
  };

  if (!userFeedBackEnabled || !display || isClosed) {
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
