import { useDevice, useConfig, useI18n } from 'src/hooks';

export const useSurvey = () => {
  const testGroupPer = useConfig('testGroupPer');
  const { isMobile } = useDevice();
  const { surveyApiUrl } = useConfig('survey');
  const params = new URLSearchParams();
  params.set('website', 'maps');
  params.set('locale', useI18n().locale);
  params.set('tgp', testGroupPer);
  params.set('device', isMobile ? 'smartphone' : 'desktop');
  return surveyApiUrl + '?' + params.toString();
};

export const fetchSurvey = async surveyUrl => {
  return fetch(surveyUrl);
};
