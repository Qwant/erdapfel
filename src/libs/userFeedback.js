import Telemetry from 'src/libs/telemetry';
import { isMobileDevice } from 'src/libs/device';

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

export { sendAnswer };
