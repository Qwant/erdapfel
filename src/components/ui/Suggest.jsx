import React, { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';

import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { fetchSuggests, selectItem, modifyList } from 'src/libs/suggest';

const SUGGEST_DEBOUNCE_WAIT = 100;

const Suggest = ({
  tagSelector,
  withCategories,
  withGeoloc,
  onSelect = selectItem,
}) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const searchInputDomHandler = document.getElementById(tagSelector);
  let currentQuery = null;

  useEffect(() => {
    const handleFocus = () => {
      setIsOpen(true);
      fetchItems(searchInputDomHandler.value);
    };

    const handleBlur = () => {
      setIsOpen(false);
    };

    const fetchItems = debounce(value => {
      if (currentQuery) {
        currentQuery.abort();
      }

      const query = fetchSuggests(value, {
        withCategories,
      });

      currentQuery = query;
      setLastQuery(value);

      query
        .then(suggestions => modifyList(suggestions, withGeoloc))
        .then(items => {
          setItems(items);
          currentQuery = null;
        })
        .catch(() => { /* Query aborted. Just ignore silently */ });
    }, SUGGEST_DEBOUNCE_WAIT);

    const handleInput = e => {
      fetchItems(e.target.value);
    };

    searchInputDomHandler.addEventListener('focus', handleFocus);
    searchInputDomHandler.addEventListener('blur', handleBlur);
    searchInputDomHandler.addEventListener('input', handleInput);

    return () => {
      searchInputDomHandler.removeEventListener('focus', handleFocus);
      searchInputDomHandler.removeEventListener('blur', handleBlur);
      searchInputDomHandler.removeEventListener('input', handleInput);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = async event => {
      if (event.key === 'Esc' || event.key === 'Escape' && searchInputDomHandler.value === '') {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    searchInputDomHandler.addEventListener('keydown', handleKeyDown);

    return () => {
      searchInputDomHandler.removeEventListener('keydown', handleKeyDown);
    };
  }, [items]);

  if (!isOpen) {
    return null;
  }

  return (
    <SuggestsDropdown
      inputId={tagSelector}
      suggestItems={items}
      onHighlight={item => {
        if (!item) {
          searchInputDomHandler.value = lastQuery;
        } else {
          searchInputDomHandler.value = item.name;
        }
      }}
      onSelect={item => {
        searchInputDomHandler.value = item.name;
        setIsOpen(false);
        onSelect(item);
      }}
    />
  );
};

export default Suggest;
