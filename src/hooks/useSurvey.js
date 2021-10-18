import { useDevice, useConfig } from 'src/hooks';

export const useSurvey = () => {
  const testGroupPer = useConfig('testGroupPer');
  const { isMobile } = useDevice();
  const { surveyApiUrl } = useConfig('survey');
  const params = new URLSearchParams();
  params.set('website', 'maps');
  params.set('locale', window.preferedLanguage.locale); // case-insensitive: the API allows 'fr_FR' or 'fr_fr' formats.
  params.set('tgp', testGroupPer);
  params.set('device', isMobile ? 'mobile' : 'desktop');
  return surveyApiUrl + '?' + params.toString();
};

export const fetchSurvey = async surveyUrl => {
  return fetch(surveyUrl);
};
