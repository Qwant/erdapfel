import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import debounce from 'lodash.debounce';
import { bool, string, func, object } from 'prop-types';

import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { fetchSuggests, getInputValue, modifyList } from 'src/libs/suggest';
import { useDevice } from 'src/hooks';

const SUGGEST_DEBOUNCE_WAIT = 100;

let currentQuery = null;

const Suggest = ({
  outputNode,
  withCategories,
  withGeoloc,
  onSelect,
  className,
  onToggle,
  children: renderInput,
  value,
}) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useDevice();
  const [highlighted, setHighlighted] = useState(null);
  const [hasFocus, setHasFocus] = useState(false);
  const dropdownVisible = hasFocus && isOpen && outputNode;

  const close = () => {
    setIsOpen(false);
    setItems([]);
  };

  useEffect(() => {
    if (onToggle) {
      onToggle(dropdownVisible);
    }
  }, [dropdownVisible, onToggle]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchItems = useCallback(
    debounce(value => {
      if (currentQuery) {
        currentQuery.abort();
      }

      const query = fetchSuggests(value, {
        withCategories,
      });

      currentQuery = query;

      query
        .then(suggestions => modifyList(suggestions, withGeoloc && value === '', value))
        .then(items => {
          setItems(items);
          currentQuery = null;
        })
        .catch(() => {
          /* Query aborted. Just ignore silently */
        });
    }, SUGGEST_DEBOUNCE_WAIT),
    [withCategories, withGeoloc]
  );

  useEffect(() => {
    if (!hasFocus) {
      close();
    } else if (isMobile) {
      setIsOpen(true);
    }
  }, [hasFocus, isMobile]);

  useEffect(() => {
    setHighlighted(null);
    if (value !== null) {
      fetchItems(value);
      setIsOpen(true);
    }
  }, [fetchItems, value]);

  const onKeyDown = e => {
    switch (e.key) {
      case 'Esc':
      case 'Escape':
        close();
        break;
      case 'Enter':
        if (highlighted !== null) {
          e.preventDefault(); // prevent search input submit with its current content (highlighted POI name)
          onSelect(highlighted);
        }
        break;
      case 'ArrowDown':
        setHighlighted(items[items.indexOf(highlighted) + 1] || null);
        break;
      case 'ArrowUp':
        e.preventDefault(); // prevent cursor returning at beggining
        setHighlighted(
          !highlighted ? items[items.length - 1] : items[items.indexOf(highlighted) - 1] || null
        );
    }
  };

  return (
    <>
      {renderInput({
        onKeyDown,
        onFocus: () => {
          setHasFocus(true);
        },
        onBlur: () => {
          setHasFocus(false);
        },
        highlightedValue: highlighted ? getInputValue(highlighted) : null,
      })}
      {dropdownVisible &&
        ReactDOM.createPortal(
          <SuggestsDropdown
            className={className}
            suggestItems={items}
            highlighted={highlighted}
            onSelect={item => {
              close();
              if (onSelect) {
                onSelect(item, { query: value });
              }
            }}
          />,
          outputNode
        )}
    </>
  );
};

Suggest.propTypes = {
  outputNode: object,
  withCategories: bool,
  withGeoloc: bool,
  onSelect: func.isRequired,
  onToggle: func,
  className: string,
};

export default Suggest;
