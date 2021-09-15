/* global _ */
import React from 'react';
import Telemetry from 'src/libs/telemetry';
import { StarRating, Text } from '@qwant/qwant-ponents';

function logGradesClick(poi, inList) {
  const grades = poi.blocksByType.grades;
  if (grades && grades.url) {
    Telemetry.sendPoiEvent(
      poi,
      'reviews',
      Telemetry.buildInteractionData({
        id: poi.id,
        source: poi.meta.source,
        template: inList ? 'multiple' : 'single',
        zone: inList ? 'list' : 'detail',
        element: 'reviews',
      })
    );
  }
}

const ReviewScore = ({ poi, reviews: { global_grade, total_grades_count, url }, inList }) => (
  <a
    className="reviewScore"
    rel="noopener noreferrer"
    href={url}
    onClick={e => {
      e.stopPropagation();
      logGradesClick(poi, inList);
    }}
  >
    <Text className="reviewScore-starRating" bold color="action-link" typo="body-2">
      <StarRating showScore note={global_grade} />
    </Text>
    <span className="reviewScore-count">
      ({total_grades_count}){!inList && ' ' + _('on PagesJaunes', 'reviews')}
    </span>
  </a>
);

export default ReviewScore;
