/* global _ */
import React from 'react';
import classnames from 'classnames';
import { bool, object, func, string, arrayOf } from 'prop-types';

import SuggestItem from './SuggestItem';
import { UserFeedbackYesNo } from './index';

const SuggestsDropdown = ({
  className = '',
  suggestItems,
  onSelect,
  highlighted,
  value,
  withFeedback,
}) => {
  return (
    <>
      <ul className={classnames('autocomplete_suggestions', className)}>
        {suggestItems.map((suggestItem, index) => (
          <li
            key={index}
            onMouseDown={() => {
              onSelect(suggestItem);
            }}
            className={classnames({ selected: highlighted === suggestItem })}
          >
            <SuggestItem item={suggestItem} />
          </li>
        ))}
      </ul>
      {withFeedback && value && suggestItems.length > 0 && !suggestItems[0].errorLabel && (
        <UserFeedbackYesNo
          questionId="suggest"
          context={encodeURIComponent(value) + document.location.hash}
          question={_('Do these results match your query?')}
        />
      )}
    </>
  );
};

SuggestsDropdown.propTypes = {
  suggestItems: arrayOf(object).isRequired,
  highlighted: object,
  onSelect: func.isRequired,
  className: string,
  value: string,
  withFeedback: bool,
};

export default SuggestsDropdown;
