//import useFetch from 'use-http';
//import getABTestingInfos from '/bin/test-group.js';

export const useSurvey = () => {
  //const { testGroupPer } = getABTestingInfos();
  const testGroupPer = 50;

  const params = new URLSearchParams();
  params.set('website', 'maps');
  params.set('tgp', testGroupPer?.toString());

  //const surveyApiURL = useApiUrl('/api/ux/surveys?' + params.toString(), {
  //  version: 2,
  //});
  //const { data } = useFetch(surveyApiURL, {}, []);
  //return data?.data[0] || null;

  return params;
};
