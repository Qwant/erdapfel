import React from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';
import SuggestItem from './SuggestItem';
import { useI18n } from 'src/hooks';

const SuggestsDropdown = ({ className = '', suggestItems, onSelect, highlighted }) => {
  const { _ } = useI18n();

  // Focused and empty field, unanswered prompt, history feature enabled: show history prompt
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
  value: string,
};

export default SuggestsDropdown;
