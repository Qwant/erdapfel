import PropTypes from 'prop-types';
import { Notification, Text } from '@qwant/qwant-ponents';
import React, { useState } from 'react';
import { useDevice, useSurvey } from 'src/hooks';
import { closeSurvey } from 'src/adapters/survey';
import Telemetry from 'src/libs/telemetry';

const Survey = () => {
  const [enabled, setEnabled] = useState(true);
  const { isMobile } = useDevice();
  const survey = useSurvey();

  const onClose = () => {
    setEnabled(false);
    closeSurvey(survey.id);
    Telemetry.add(Telemetry.SURVEY_CLOSE, {
      id: survey.id,
      device: isMobile ? 'mobile' : 'desktop',
    });
  };

  const onClick = () => {
    Telemetry.add(Telemetry.SURVEY_ANSWER, {
      id: survey.id,
      device: isMobile ? 'mobile' : 'desktop',
    });
  };

  return (
    <div className="survey">
      {survey && enabled && (
        <Notification
          title={survey.person_name}
          titleSecondary={survey.title}
          icon={survey.image}
          url={survey.url}
          buttonLabel={survey.cta}
          onClose={onClose}
          onClick={onClick}
          mobile={isMobile}
        >
          <Text typo="body-2" color="primary">
            {survey.desc}
          </Text>
        </Notification>
      )}
    </div>
  );
};

Survey.propTypes = {
  home: PropTypes.bool,
};

export default Survey;
