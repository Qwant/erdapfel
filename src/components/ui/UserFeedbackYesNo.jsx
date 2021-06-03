import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UserFeedbackQuestion } from './index';
import { useConfig, useI18n } from 'src/hooks';
import { IconThumbUp, IconThumbDown } from './icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { sendAnswer } from 'src/libs/userFeedback';

const UserFeedbackYesNo = ({ questionId, context, question }) => {
  const { enabled: userFeedBackEnabled } = useConfig('userFeedback');
  const { _ } = useI18n();
  // @TODO: replace by the real conditions
  const [isClosed, setClosed] = useState();

  const closeQuestion = () => {
    sendAnswer(questionId, 'dismiss', { context });
    setClosed(true);
  };

  const onAnswer = answer => () => {
    sendAnswer(questionId, answer, { context });
    setClosed(true);
    // @TODO:
    // - hide question and remember it
    // - display thank you message
  };

  if (!userFeedBackEnabled || isClosed) {
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
