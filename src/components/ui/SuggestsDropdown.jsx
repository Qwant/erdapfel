import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { exact, string, arrayOf, func } from 'prop-types';

import SuggestItem from './SuggestItem';

const SuggestsDropdown = ({
  className = '',
  suggests,
  onSelect,
  onHighlight,
}) => {
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    const keyDownHandler = ({ key }) => {
      if (key === 'ArrowDown') {
        const h = highlighted === null ? - 1 : highlighted;
        return h < suggests.length - 1 ? setHighlighted(h + 1) : setHighlighted(null);
      }

      if (key === 'ArrowUp') {
        const h = highlighted === null ? suggests.length : highlighted;
        return h > 0 ? setHighlighted(h - 1) : setHighlighted(null);
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  });

  useEffect(() => {
    if (onHighlight) {
      onHighlight(highlighted);
    }
  }, [highlighted]);

  return (
    <ul
      className={classnames('autocomplete_suggestions', className)}
      style={{ display: 'block', width: '100%' }}
    >
      {suggests.map((suggest, index) =>
        <SuggestItem
          isHighlighted={highlighted === index}
          key={index}
          suggest={suggest}
          onClick={() => onSelect(index)}
          onMouseEnter={() => setHighlighted(index)}
        />
      )}
    </ul>
  );
};

SuggestsDropdown.propTypes = {
  suggests: arrayOf(exact({
    icon: string,
    name: string,
    location: string,
  })).isRequired,
  onHighlight: func.isRequired,
  onSelect: func.isRequired,
};

export default SuggestsDropdown;
