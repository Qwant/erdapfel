import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Notification, Text } from '@qwant/qwant-ponents';
import React, { useState, useEffect } from 'react';
import { useDevice, useSurvey } from 'src/hooks';

const Survey = ({ home = false }) => {
  const [enabled, setEnabled] = useState(true);
  const [survey, setSurvey] = useState(null);
  const { isMobile } = useDevice();
  const surveyUrl = useSurvey();

  useEffect(async () => {
    fetch(surveyUrl)
      .then(response => response.json())
      .then(response => {
        setSurvey(response.data[0]);
      });
  }, []);

  const onClose = () => {
    setEnabled(false);
  };

  return (
    <div>
      {survey && enabled && (
        <div className={classnames('SurveyNotification', home && 'SurveyNotificationBottom')}>
          <Notification
            title={survey.person_name}
            titleSecondary={survey.title}
            icon={survey.image}
            url={survey.url}
            buttonLabel={survey.cta}
            onClose={onClose}
            onClick={() => {}}
            mobile={isMobile}
          >
            <Text typo="body-2" color="primary">
              desc
            </Text>
          </Notification>
        </div>
      )}
    </div>
  );
};

Survey.propTypes = {
  home: PropTypes.bool,
};

export default Survey;
