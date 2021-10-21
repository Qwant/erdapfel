import { get, set } from './store';

const SURVEY_KEY = 'closed_survey_';

export function closeSurvey(id) {
  // Serialize the list and save it in localStorage
  set(SURVEY_KEY + id, true);
}

export function isSurveyClosed(id) {
  return get(SURVEY_KEY + id) || 0;
}
