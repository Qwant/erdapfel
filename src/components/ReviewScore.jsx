/* global _ _n */
import React from 'react';
import cx from 'classnames';
import Telemetry from 'src/libs/telemetry';
import { Flex, IconInformation, StarRating, Text, Tooltip } from '@qwant/qwant-ponents';
import { isFromEcotables, isFromTripAdvisor, isFromPagesJaunes } from 'src/libs/pois';
import { useDevice } from 'src/hooks';

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

const ReviewMultiScore = ({ poi }) => {
  return (
    <Flex mb="s">
      <a
        className={cx('reviewScore', 'reviewScore--multi')}
        rel="noopener noreferrer"
        href={poi?.blocksByType?.grades?.url}
        onClick={e => {
          e.stopPropagation();
          logGradesClick(poi, false);
        }}
      >
        <PagesJaunesRating
          isVertical
          grade={poi?.blocksByType?.grades?.global_grade}
          count={poi?.blocksByType?.grades?.total_grades_count}
          showSuffix
        />
      </a>
      <a
        className={cx('reviewScore', 'reviewScore--multi')}
        rel="noopener noreferrer"
        href={poi.blocksByType.ecoresponsible.url}
        onClick={e => {
          e.stopPropagation();
          logGradesClick(poi, false);
        }}
      >
        <EcotablesRating isVertical score={poi?.blocksByType?.ecoresponsible?.score} />
      </a>
    </Flex>
  );
};

const ReviewScore = ({ poi, inList }) => {
  const isEcotables = isFromEcotables(poi);
  const isTripAdvisor = isFromTripAdvisor(poi);
  const isPagesJaunesRating = isFromPagesJaunes(poi) && poi?.blocksByType?.grades;

  return (
    <div className="poiItem-reviews">
      {isPagesJaunesRating && isEcotables && !inList ? (
        <ReviewMultiScore poi={poi} />
      ) : (
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
            <PagesJaunesRating
              grade={poi?.blocksByType?.grades?.global_grade}
              count={poi?.blocksByType?.grades?.total_grades_count}
              showSuffix={!inList}
            />
          )}
        </a>
      )}
    </div>
  );
};

const EcotablesRating = ({ score, isVertical }) => {
  const { isMobile } = useDevice();
  return (
    <Flex className={cx(isVertical && 'ecotables__rating--vertical')}>
      <Flex alignCenter>
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
      </Flex>
      <Flex ml={isVertical ? undefined : 'xxs'}>
        <Flex mb={isVertical ? 'xxs' : undefined}>
          <Text typo={isMobile ? 'body-2' : 'caption-1'} color="secondary">
            {isVertical ? _('ecotable') : _('Ecotable from rating')}
          </Text>
        </Flex>
        <Tooltip
          className="reviewScore__ecotable--tooltip"
          position="bottom"
          content={_(`Ecotable rating ${score}`)}
        >
          <Flex className="reviewScore__ecotable--tooltip-element" alignCenter ml="xxs">
            <IconInformation size={12} />
          </Flex>
        </Tooltip>
      </Flex>
    </Flex>
  );
};

const PagesJaunesRating = ({ isVertical, grade, count, showSuffix }) => (
  <Flex className={cx(isVertical && 'pagesjaunes__rating--vertical')}>
    <Flex>
      <StarRating showScore note={grade} />
      <Flex ml="xxs">
        <Text
          className="reviewScore-starRating reviewScore-starRating--default"
          typo="body-2"
          color="secondary"
        >
          ({count})
        </Text>
      </Flex>
    </Flex>
    {showSuffix && (
      <Flex ml={isVertical ? undefined : 'xxs'}>
        <Text typo="body-2" color="secondary">
          {isVertical ? _('PagesJaunes') : ' ' + _('on PagesJaunes', 'reviews')}
        </Text>
      </Flex>
    )}
  </Flex>
);

const TripAdvisorRating = ({ grade_url, count }) => (
  <Flex>
    <Text className="reviewScore-starRating" typo="body-2">
      <Flex alignCenter>
        <div className="reviewScore-TripAdvisor">
          <img src={grade_url} alt="" width={119} height={20} loading="lazy" />
        </div>
        <span className="reviewScore-count">{_n('%d review', '%d reviews', count, 'reviews')}</span>
      </Flex>
    </Text>
  </Flex>
);

export default ReviewScore;
