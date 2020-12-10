import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';
import useScrollWatcher from 'src/hooks/useScrollWatcher';
import SuggestItem from './SuggestItem';

const SuggestsDropdown = ({
  className = '',
  suggestItems,
  onSelect,
  onHighlight,
  onScroll,
}) => {
  const [highlighted, setHighlighted] = useState(null);
  const dropdownElt = useRef(null);

  useScrollWatcher(dropdownElt, onScroll);

  useEffect(() => {
    const keyDownHandler = e => {
      const { key } = e;

      if (key === 'ArrowDown') {
        let h = highlighted === null ? - 1 : highlighted;

        if (h < suggestItems.length - 1) {
          // Jump label
          if (suggestItems[h + 1] && suggestItems[h + 1].simpleLabel) {
            h++;
          }

          setHighlighted(h + 1);
          onHighlight(suggestItems[h + 1]);
        } else {
          setHighlighted(null);
          onHighlight(null);
        }
      }

      if (key === 'ArrowUp') {
        e.preventDefault(); // prevent cursor returning at beggining
        let h = highlighted === null ? suggestItems.length : highlighted;
        // Jump label
        if (suggestItems[h - 1] && suggestItems[h - 1].simpleLabel) {
          h--;
        }

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
    <ul className={classnames('autocomplete_suggestions', className)} ref={dropdownElt}>
      {suggestItems.map((suggest, index) =>
        <li
          key={index}
          onMouseDown={e => suggestItems[index].simpleLabel
            ? e.preventDefault()
            : onSelect(suggestItems[index])
          }
          onMouseEnter={() => suggestItems[index].simpleLabel
            ? setHighlighted(null)
            : setHighlighted(index)
          }
          className={classnames({ 'selected': highlighted === index })}
        >
          <SuggestItem item={suggest} />
        </li>
      )}
    </ul>
  );
};

SuggestsDropdown.propTypes = {
  suggestItems: arrayOf(object).isRequired,
  onHighlight: func.isRequired,
  onSelect: func.isRequired,
  onScroll: func,
  className: string,
};

export default SuggestsDropdown;
