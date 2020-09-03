import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf, bool } from 'prop-types';

import SuggestItem from './SuggestItem';

const computeStyle = (isAttachedToInput, inputNode, suggestItems) => {
  let style = {};

  if (isAttachedToInput) {
    // In case no output node is specified,
    // suggestions are rendered just below inputNode
    const boundingRect = inputNode.getBoundingClientRect();
    style = {
      ...style,
      position: 'fixed',
      top: boundingRect.bottom,
      left: boundingRect.left,
      width: boundingRect.width,
    };
  }

  if (suggestItems.length === 0 ||
      suggestItems.length > 0 && suggestItems[suggestItems.length - 1].simpleLabel) {
    // Revove bottom padding if last item is a simple label (no results)
    style = {
      ...style,
      paddingBottom: 0,
    };
  }

  return style;
};

const SuggestsDropdown = ({
  inputNode,
  isAttachedToInput,
  className = '',
  suggestItems,
  onSelect,
  onHighlight,
}) => {
  const [highlighted, setHighlighted] = useState(null);
  const style = computeStyle(isAttachedToInput, inputNode, suggestItems);

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
    <ul
      className={classnames('autocomplete_suggestions', className)}
      style={style}
    >
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
  className: string,
  inputNode: object.isRequired,
  isAttachedToInput: bool,
};

export default SuggestsDropdown;
