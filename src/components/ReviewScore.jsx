/* global _n */
import React from 'react';

const ReviewScore = ({ poi, reviews: { global_grade, total_grades_count, url } }) =>
  <a className="reviewScore" rel="noopener noreferrer" href={url}
    onClick={() => poi.logGradesClick('single')}
  >
    <span className="reviewScore-stars">
      {[1, 2, 3, 4, 5].map(k =>
        <span key={k} className={k > global_grade ? 'icon-icon_star' : 'icon-icon_star-filled'} />
      )}
    </span>
    <span className="reviewScore-count">
      {total_grades_count} {_n('review', 'reviews', total_grades_count)}
    </span>
  </a>;

export default ReviewScore;
