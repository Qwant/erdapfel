import React from 'react';
import classnames from 'classnames';
import { exact, string, func, bool } from 'prop-types';

const SuggestItem = ({
  className = '',
  suggest,
  isHighlighted = false,
  onClick,
  ...rest
}) =>
  <li
    className={classnames('autocomplete_suggestion', { 'selected': isHighlighted }, className)}
    onClick={onClick}
    {...rest}
  >
    <div className="autocomplete-icon icon icon-gift" />
    <div className="autocomplete_suggestion__lines_container">
      <div className="autocomplete_suggestion__first_line">
        {suggest.name}
      </div>
      <div className="autocomplete_suggestion__second_line">
        {suggest.location}
      </div>
    </div>
  </li>
;

SuggestItem.propTypes = {
  suggest: exact({
    icon: string,
    name: string,
    location: string,
  }).isRequired,
  isHighlighted: bool,
  onClick: func.isRequired,
};

export default SuggestItem
;
