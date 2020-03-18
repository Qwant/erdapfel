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
  <>
    {suggest.categoryLabel &&
      <h3 className="autocomplete_suggestion__category_title">
        {suggest.categoryLabel.toUpperCase()}
      </h3>
    }
    <li
      className={classnames('autocomplete_suggestion', { 'selected': isHighlighted }, className)}
      style={{ borderBottom: suggest.divider ? '1px solid #e0e1e6' : '' }}
      onClick={onClick}
      {...rest}
    >
      <div className={`autocomplete-icon icon icon-${suggest.icon}`} style={{ color: suggest.iconColor }} />
      <div className="autocomplete_suggestion__lines_container">
        <div className="autocomplete_suggestion__first_line">
          {suggest.name}
        </div>
        {suggest.location && <div className="autocomplete_suggestion__second_line">
          {suggest.location}
        </div>}
      </div>
    </li>
  </>
;

SuggestItem.propTypes = {
  suggest: exact({
    icon: string.isRequired,
    iconColor: string,
    name: string.isRequired,
    location: string,
    divider: bool,
    categoryLabel: string,
  }).isRequired,
  isHighlighted: bool,
  onClick: func.isRequired,
};

export default SuggestItem
;
