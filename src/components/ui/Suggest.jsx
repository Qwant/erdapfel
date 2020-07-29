import React, { useEffect, useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import debounce from 'lodash.debounce';
import { bool, string, func, object } from 'prop-types';

import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { fetchSuggests, getInputValue, selectItem, modifyList } from 'src/libs/suggest';
import { DeviceContext } from 'src/libs/device';
import { togglePanelVisibility } from 'src/libs/panel';

const SUGGEST_DEBOUNCE_WAIT = 100;

const Suggest = ({
  inputNode,
  outputNode,
  withCategories,
  withGeoloc,
  onSelect = selectItem,
  onClear,
  hidePanelOnOpen,
  className,
}) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useContext(DeviceContext);
  let currentQuery = null;

  const close = () => {
    setIsOpen(false);
    setItems([]);
  };

  useEffect(() => {
    if (hidePanelOnOpen) {
      togglePanelVisibility(!isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleFocus = () => {
      if (inputNode.value === '') {
        setIsOpen(true);
        fetchItems('');
      } else {
        inputNode.select();
        if (isMobile) {
          setIsOpen(true);
          fetchItems(inputNode.value);
        }
      }
    };

    const handleWindowClick = e => {
      if (e.target.tagName !== 'INPUT' && document.activeElement.tagName !== 'INPUT') {
        close();
      }
    };

    const fetchItems = debounce(value => {
      if (currentQuery) {
        currentQuery.abort();
      }

      setIsLoading(true);
      const query = fetchSuggests(value, {
        withCategories,
      });

      currentQuery = query;

      query
        .then(suggestions => modifyList(suggestions, withGeoloc, value))
        .then(items => {
          setItems(items);
          currentQuery = null;
          setIsLoading(false);
        })
        .catch(() => { /* Query aborted. Just ignore silently */ });
    }, SUGGEST_DEBOUNCE_WAIT);

    const handleInput = e => {
      const { value } = e.target;
      fetchItems(value);
      setIsOpen(true);
      setLastQuery(value);
    };

    const handleKeyDown = async event => {
      if (event.key === 'Esc' || event.key === 'Escape') {
        if (inputNode.value === '' && !isMobile) {
          close();
        } else {
          inputNode.value = '';
          fetchItems('');
          setIsOpen(true);
        }

        if (onClear) {
          onClear();
        }
      }
    };

    window.addEventListener('click', handleWindowClick);
    inputNode.addEventListener('focus', handleFocus);
    inputNode.addEventListener('input', handleInput);
    inputNode.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleWindowClick);
      inputNode.removeEventListener('focus', handleFocus);
      inputNode.removeEventListener('input', handleInput);
      inputNode.removeEventListener('keydown', handleKeyDown);
    };

  }, []);

  if (!isOpen) {
    return null;
  }

  const SuggestsDropdownElement = () =>
    <SuggestsDropdown
      className={className}
      inputNode={inputNode}
      isAttachedToInput={!outputNode}
      suggestItems={items}
      isLoading={isLoading}
      onHighlight={item => {
        if (!item) {
          inputNode.value = lastQuery;
        } else {
          inputNode.value = getInputValue(item);
        }
      }}
      onSelect={item => {
        inputNode.value = getInputValue(item);
        close();
        if (onSelect) {
          onSelect(item);
        }
      }}
      onClear={onClear}
    />;

  return outputNode
    ? ReactDOM.createPortal(<SuggestsDropdownElement />, outputNode)
    : <SuggestsDropdownElement />;
};

Suggest.propTypes = {
  inputNode: object.isRequired,
  outputNode: object,
  withCategories: bool,
  withGeoloc: bool,
  onSelect: func,
  onClear: func,
  hidePanelOnOpen: bool,
  className: string,
};

export default Suggest;

// Blur the focused field and close the suggest list when clicking outside of a field
window.onclick = null;

