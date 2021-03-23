import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';

import SuggestItem from './SuggestItem';

const SuggestsDropdown = ({ className = '', suggestItems, onSelect, onHighlight }) => {
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    const keyDownHandler = e => {
      const { key } = e;

      if (key === 'ArrowDown') {
        const h = highlighted === null ? -1 : highlighted;

        if (h < suggestItems.length - 1) {
          setHighlighted(h + 1);
          onHighlight(suggestItems[h + 1]);
        } else {
          setHighlighted(null);
          onHighlight(null);
        }
      }

      if (key === 'ArrowUp') {
        e.preventDefault(); // prevent cursor returning at beggining
        const h = highlighted === null ? suggestItems.length : highlighted;

        if (h > 0) {
          setHighlighted(h - 1);
          onHighlight(suggestItems[h - 1]);
        } else {
          setHighlighted(null);
          onHighlight(null);
        }
      }

      if (key === 'Enter') {
        if (highlighted !== null) {
          e.preventDefault(); // prevent search input submit with its current content (highlighted POI name)
          onSelect(suggestItems[highlighted]);
        }
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  });

  return (
    <ul className={classnames('autocomplete_suggestions', className)}>
      {suggestItems.map((suggest, index) => (
        <li
          key={index}
          onMouseDown={() => {
            onSelect(suggestItems[index]);
          }}
          onMouseEnter={() => {
            setHighlighted(index);
          }}
          className={classnames({ selected: highlighted === index })}
        >
          <SuggestItem item={suggest} />
        </li>
      ))}
    </ul>
  );
};

SuggestsDropdown.propTypes = {
  suggestItems: arrayOf(object).isRequired,
  onHighlight: func.isRequired,
  onSelect: func.isRequired,
  className: string,
};

export default SuggestsDropdown;
