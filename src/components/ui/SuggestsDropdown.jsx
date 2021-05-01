import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';

import SuggestItem from './SuggestItem';

const SuggestsDropdown = ({ className = '', suggestItems, onSelect, onHighlight }) => {
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    const keyDownHandler = e => {
      const { key } = e;

      if (key === 'Enter') {
        if (highlighted !== null) {
          e.preventDefault(); // prevent search input submit with its current content (highlighted POI name)
          onSelect(highlighted);
        }
      }

      if (key !== 'ArrowDown' && key !== 'ArrowUp') {
        return;
      }

      let newHighlighted;
      if (key === 'ArrowDown') {
        newHighlighted = suggestItems[suggestItems.indexOf(highlighted) + 1] || null;
      }

      if (key === 'ArrowUp') {
        e.preventDefault(); // prevent cursor returning at beggining
        newHighlighted = suggestItems[suggestItems.indexOf(highlighted) - 1] || null;
      }

      setHighlighted(newHighlighted);
      onHighlight(newHighlighted);
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  });

  return (
    <ul className={classnames('autocomplete_suggestions', className)}>
      {suggestItems.map((suggestItem, index) => (
        <li
          key={index}
          onMouseDown={() => {
            onSelect(suggestItem);
          }}
          onMouseEnter={() => {
            setHighlighted(suggestItem);
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
  onHighlight: func.isRequired,
  onSelect: func.isRequired,
  className: string,
};

export default SuggestsDropdown;
