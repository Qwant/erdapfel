import Telemetry from 'src/libs/telemetry';
import { isMobileDevice } from 'src/libs/device';
import { set as setLocalStorageItem, get as getLocalStorageItem } from 'src/adapters/store';

function sendAnswer(questionId, answer, { context } = {}) {
  const { locale, code } = window.getLang();

  Telemetry.add(Telemetry.USER_FEEDBACK_ANSWER, {
    front_search_user_interaction_data: {
      component: questionId,
      event: answer,
      item: context,
    },
    is_mobile: isMobileDevice(),
    language: {
      locale,
      code,
    },
  });
}

const storagePrefix = `userFeedback_`;
const dayToMs = days => days * 24 * 60 * 60 * 1000;

const answeredDuringSession = [];

function shouldBeDisplayed(questionId, hideForDays = 15) {
  if (answeredDuringSession.includes(questionId)) {
    return false;
  }
  const previouslyAnswered = getLocalStorageItem(`${storagePrefix}${questionId}`);
  if (!previouslyAnswered) {
    return true;
  }
  const { answer, date } = previouslyAnswered;
  // For now only hide further questions if the user dismissed the widget
  if (answer !== 'dismiss') {
    return true;
  }
  return Date.now() - new Date(date).getTime() > dayToMs(hideForDays);
}

function rememberAnswer(questionId, answer) {
  answeredDuringSession.push(questionId);
  setLocalStorageItem(`${storagePrefix}${questionId}`, { answer, date: new Date().toISOString() });
}

export { sendAnswer, shouldBeDisplayed, rememberAnswer };
