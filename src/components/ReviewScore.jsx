/* global _ */
import React from 'react';
import Telemetry from 'src/libs/telemetry';
import { IconStar, IconStarFill } from 'src/components/ui/icons';

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
    <span className="reviewScore-stars">
      {[1, 2, 3, 4, 5].map(k => {
        const Icon = k > global_grade ? IconStar : IconStarFill;
        return <Icon key={k} width={12} height={12} />;
      })}
    </span>
    <span className="reviewScore-score">{global_grade}</span>
    <span className="reviewScore-count">
      ({total_grades_count}){!inList && ' ' + _('on PagesJaunes', 'reviews')}
    </span>
  </a>
);

export default ReviewScore;
