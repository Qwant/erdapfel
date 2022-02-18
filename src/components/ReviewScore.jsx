/* global _ _n */
import React from 'react';
import Telemetry from 'src/libs/telemetry';
import { Flex, StarRating, Text } from '@qwant/qwant-ponents';
import { isFromTripAdvisor } from 'src/libs/pois';

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
    {isFromTripAdvisor(poi) ? (
      <TripAdvisorRating grade_url={poi.meta.rating_url} count={total_grades_count} />
    ) : (
      <DefaultRating grade={global_grade} count={total_grades_count} showSuffix={!inList} />
    )}
  </a>
);

const DefaultRating = ({ grade, count, showSuffix }) => (
  <>
    <Text className="reviewScore-starRating" bold color="action-link" typo="body-2">
      <StarRating showScore note={grade} />
    </Text>
    <span className="reviewScore-count">
      ({count}){showSuffix && ' ' + _('on PagesJaunes', 'reviews')}
    </span>
  </>
);

const TripAdvisorRating = ({ grade_url, count }) => (
  <>
    <Text className="reviewScore-starRating" color="action-link" typo="body-2">
      <Flex alignCenter>
        <div className="reviewScore-TripAdvisor">
          <img src={grade_url} alt="" width={119} height={20} />
        </div>
        <span>{_n('%d review', '%d reviews', count, 'reviews')}</span>
      </Flex>
    </Text>
  </>
);

export default ReviewScore;
