/* global _ */
import React from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';

import SuggestItem from './SuggestItem';
import { UserFeedbackYesNo } from './index';

const SuggestsDropdown = ({ className = '', suggestItems, onSelect, highlighted, value }) => {
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
      {value.length && suggestItems.length > 0 && !suggestItems[0].errorLabel && (
        <UserFeedbackYesNo question={_('Do these results match your query?')} />
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
};

export default SuggestsDropdown;
