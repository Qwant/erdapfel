import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';

import SuggestItem from './SuggestItem';

const SuggestsDropdown = ({
  className = '',
  suggestItems,
  onSelect,
  onHighlight,
  inputId,
}) => {
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    const keyDownHandler = ({ key }) => {
      if (document.activeElement.getAttribute('id') !== inputId) {
        document.removeEventListener('keydown', keyDownHandler);
        return;
      }

      if (key === 'ArrowDown') {
        const h = highlighted === null ? - 1 : highlighted;
        if (h < suggestItems.length - 1) {
          setHighlighted(h + 1);
          onHighlight(suggestItems[h + 1]);
        } else {
          setHighlighted(null);
          onHighlight(null);
        }
      }

      if (key === 'ArrowUp') {
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
    <ul
      className={classnames('autocomplete_suggestions', className)}
      style={{ display: 'block', width: '100%' }}
    >
      {suggestItems.map((suggest, index) =>
        <li
          key={index}
          onClick={() => onSelect(suggestItems[index])}
          onMouseEnter={() => { setHighlighted(index); }}
        >
          <SuggestItem item={suggest} isHighlighted={highlighted === index} />
        </li>
      )}
    </ul>
  );
};

SuggestsDropdown.propTypes = {
  suggestItems: arrayOf(object).isRequired,
  onHighlight: func.isRequired,
  onSelect: func.isRequired,
  className: string,
  inputId: string.isRequired,
};

export default SuggestsDropdown;
