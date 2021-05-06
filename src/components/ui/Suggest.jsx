import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import debounce from 'lodash.debounce';
import { bool, string, func, object } from 'prop-types';

import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { fetchSuggests, getInputValue, selectItem, modifyList } from 'src/libs/suggest';
import { useDevice } from 'src/hooks';

const SUGGEST_DEBOUNCE_WAIT = 100;

let currentQuery = null;

const Suggest = ({
  inputNode,
  outputNode,
  withCategories,
  withGeoloc,
  onSelect = selectItem,
  onClear,
  onChange,
  className,
  onToggle,
}) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const { isMobile } = useDevice();

  const close = () => {
    setIsOpen(false);
    setItems([]);
  };

  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

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
    const handleFocus = () => {
      if (inputNode.value === '' || isMobile) {
        setIsOpen(true);
        fetchItems(inputNode.value);
      }
    };

    const handleBlur = () => {
      close();
    };

    const handleInput = e => {
      const { value } = e.target;
      fetchItems(value);
      setIsOpen(true);
      setLastQuery(value);

      if (onChange) {
        onChange(value);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Esc' || event.key === 'Escape') {
        if (inputNode.value === '') {
          close();
        } else {
          inputNode.value = '';
          fetchItems('');
          setIsOpen(true);

          if (onClear) {
            onClear();
          }
        }
      }
    };

    inputNode.addEventListener('focus', handleFocus);
    inputNode.addEventListener('blur', handleBlur);
    inputNode.addEventListener('input', handleInput);
    inputNode.addEventListener('keydown', handleKeyDown);

    return () => {
      inputNode.removeEventListener('focus', handleFocus);
      inputNode.removeEventListener('blur', handleBlur);
      inputNode.removeEventListener('input', handleInput);
      inputNode.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputNode, onClear, isMobile, onChange, fetchItems]);

  if (!isOpen) {
    return null;
  }

  const SuggestsDropdownElement = () => (
    <SuggestsDropdown
      className={className}
      suggestItems={items}
      onHighlight={item => {
        if (!item) {
          inputNode.value = lastQuery;
        } else {
          inputNode.value = getInputValue(item);
        }
      }}
      onSelect={item => {
        inputNode.value = getInputValue(item);
        inputNode.blur();
        close();
        if (onSelect) {
          onSelect(item, { query: inputNode.value });
        }
      }}
    />
  );

  return ReactDOM.createPortal(<SuggestsDropdownElement />, outputNode);
};

Suggest.propTypes = {
  inputNode: object.isRequired,
  outputNode: object.isRequired,
  withCategories: bool,
  withGeoloc: bool,
  onSelect: func,
  onClear: func,
  onToggle: func,
  onChange: func,
  className: string,
};

export default Suggest;
