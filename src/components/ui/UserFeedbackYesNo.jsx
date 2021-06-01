import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UserFeedbackQuestion } from './index';
import { useConfig, useI18n } from 'src/hooks';

const UserFeedbackYesNo = ({ question }) => {
  const { enabled: userFeedBackEnabled } = useConfig('userFeedback');
  const { _ } = useI18n();
  // @TODO: replace by the real conditions
  const [isClosed, setClosed] = useState();

  const closeQuestion = () => {
    setClosed(true);
  };

  const onAnswer = answer => () => {
    // eslint-disable-next-line no-console
    console.log(answer);
    setClosed(true);
    // @TODO:
    // - send telemetry event
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
          label: `👍 ${_('Yes')}`,
          callback: onAnswer('yes'),
        },
        { label: `👎 ${_('No')}`, callback: onAnswer('no') },
      ]}
    />
  );
};

UserFeedbackYesNo.propTypes = {
  question: PropTypes.node,
  featureId: PropTypes.string,
};

export default UserFeedbackYesNo;
