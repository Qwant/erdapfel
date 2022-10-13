import { get, set } from './store';

const SURVEY_KEY = 'closed_survey_';

export function closeSurvey(id: string) {
  // Serialize the list and save it in localStorage
  set(SURVEY_KEY + id, true);
}

export function isSurveyClosed(id: string) {
  return get(SURVEY_KEY + id) || 0;
}
