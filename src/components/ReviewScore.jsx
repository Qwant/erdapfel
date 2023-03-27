/* global _ _n */
import React from 'react';
import Telemetry from 'src/libs/telemetry';
import { Flex, IconInformation, StarRating, Text, Tooltip } from '@qwant/qwant-ponents';
import { isFromEcotables, isFromTripAdvisor } from 'src/libs/pois';

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

const ReviewScore = ({ poi, inList }) => {
  const isEcotables = isFromEcotables(poi);
  const isTripAdvisor = isFromTripAdvisor(poi);

  return (
    <a
      className="reviewScore"
      rel="noopener noreferrer"
      href={isEcotables ? poi.blocksByType.ecoresponsible.url : poi?.blocksByType?.grades?.url}
      onClick={e => {
        e.stopPropagation();
        logGradesClick(poi, inList);
      }}
    >
      {isTripAdvisor ? (
        <TripAdvisorRating
          grade_url={poi.meta.rating_url}
          count={poi?.blocksByType?.grades?.total_grades_count}
        />
      ) : isEcotables ? (
        <EcotablesRating score={poi.blocksByType.ecoresponsible.score} />
      ) : (
        <DefaultRating
          grade={poi?.blocksByType?.grades?.global_grade}
          count={poi?.blocksByType?.grades?.total_grades_count}
          showSuffix={!inList}
        />
      )}
    </a>
  );
};

const EcotablesRating = ({ score }) => (
  <Flex alignCenter>
    <Text typo="body-2" bold>
      {score}
    </Text>
    <Flex ml="xxs" alignCenter>
      {new Array(score).fill().map((_, index) => (
        <img
          key={index}
          src="./statics/images/ecotable-rating-filled.svg"
          alt="Ecotable"
          width={12}
          height={12}
          loading="lazy"
        />
      ))}
      {new Array(3 - score).fill().map((_, index) => (
        <img
          key={index}
          src="./statics/images/ecotable-rating-empty.svg"
          alt="Ecotable"
          width={12}
          height={12}
          loading="lazy"
        />
      ))}
      <Flex ml="xxs">
        <Text typo="body-2" color="secondary">
          {_('Ecotable from rating')}
        </Text>
      </Flex>
      <Tooltip
        className="reviewScore__ecotable--tooltip"
        position="bottom"
        content={_(`Ecotable rating ${score}`)}
      >
        <Flex alignCenter ml="xxs">
          <IconInformation size={12} />
        </Flex>
      </Tooltip>
    </Flex>
  </Flex>
);

const DefaultRating = ({ grade, count, showSuffix }) => (
  <>
    <Text className="reviewScore-starRating reviewScore-starRating--default" typo="body-2">
      <StarRating showScore note={grade} />
    </Text>
    <span className="reviewScore-count">
      ({count}){showSuffix && ' ' + _('on PagesJaunes', 'reviews')}
    </span>
  </>
);

const TripAdvisorRating = ({ grade_url, count }) => (
  <>
    <Text className="reviewScore-starRating" typo="body-2">
      <Flex alignCenter>
        <div className="reviewScore-TripAdvisor">
          <img src={grade_url} alt="" width={119} height={20} loading="lazy" />
        </div>
        <span className="reviewScore-count">{_n('%d review', '%d reviews', count, 'reviews')}</span>
      </Flex>
    </Text>
  </>
);

export default ReviewScore;
