import Telemetry from 'src/libs/telemetry';
import { isMobileDevice } from 'src/libs/device';
import { version } from 'config/constants.yml';

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

const storagePrefix = `qmaps_v${version}_userFeedback_`;
const dayToMs = days => days * 24 * 60 * 60 * 1000;

function shouldBeDisplayed(questionId, hideForDays = 30) {
  const previouslyAnswered = localStorage.getItem(`${storagePrefix}${questionId}`);
  if (!previouslyAnswered) {
    return true;
  }
  const { answer, date } = JSON.parse(previouslyAnswered);
  // For now only hide further questions if the user dismissed the widget
  if (answer !== 'dismiss') {
    return true;
  }
  return Date.now() - new Date(date).getTime() > dayToMs(hideForDays);
}

function rememberAnswer(questionId, answer) {
  localStorage.setItem(
    `${storagePrefix}${questionId}`,
    JSON.stringify({ answer, date: new Date().toISOString() })
  );
}

export { sendAnswer, shouldBeDisplayed, rememberAnswer };
