import React from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';

import SuggestItem from './SuggestItem';

const SuggestsDropdown = ({ className = '', suggestItems, onSelect, highlighted }) => {
  return (
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
  );
};

SuggestsDropdown.propTypes = {
  suggestItems: arrayOf(object).isRequired,
  highlighted: object,
  onSelect: func.isRequired,
  className: string,
};

export default SuggestsDropdown;
