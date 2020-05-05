import React, { useEffect, useState } from 'react';
import nconf from '@qwant/nconf-getter';
import debounce from 'lodash.debounce';

import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { suggestResults } from 'src/adapters/suggest_sources';
import { selectItem, modifyList } from 'src/libs/suggest';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;
const SUGGEST_USE_FOCUS = geocoderConfig.useFocus;
const SUGGEST_FOCUS_MIN_ZOOM = 11;

const Suggest = ({ withCategories, withGeoloc }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [isPending, setIsPending] = useState('unset');
  const [isPendingSubmit, setIsPendingSubmit] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const searchInputDomHandler = document.getElementById('search');
  let currentQuery = null;

  useEffect(() => {
    const handleFocus = () => setIsOpen(true);

    const handleBlur = () => {
      setIsHighlighted(false);
      setIsOpen(false);
    };

    const handleInput = debounce(e => {
      const typedValue = e.target.value;
      setIsPending('fetching');

      if (currentQuery) {
        currentQuery.abort();
      }

      const query = suggestResults(typedValue, {
        withCategories,
        useFocus: SUGGEST_USE_FOCUS,
        focusMinZoom: SUGGEST_FOCUS_MIN_ZOOM,
        maxFavorites: !typedValue ? 5 : 2,
        maxItems: SUGGEST_MAX_ITEMS,
      });

      currentQuery = query;
      setLastQuery(typedValue);

      query
        .then(suggestions => modifyList(suggestions, withGeoloc))
        .then(items => {
          setItems(items);
          setIsPending('completed');
          currentQuery = null;
        })
        .catch(() => { /* Query aborted. Just ignore silently */ });
    }, 100);

    searchInputDomHandler.addEventListener('focus', handleFocus);
    searchInputDomHandler.addEventListener('blur', handleBlur);
    searchInputDomHandler.addEventListener('input', handleInput);

    return () => {
      searchInputDomHandler.removeEventListener('blur', handleFocus);
      searchInputDomHandler.removeEventListener('blur', handleBlur);
      searchInputDomHandler.removeEventListener('input', handleInput);
    };
  }, []);

  useEffect(() => {
    const handleSubmit = () => {
      selectItem(items[0], true);
    };

    const handleKeyDown = async event => {
      if (event.key === 'Esc' || event.key === 'Escape') { // esc
        setIsOpen(false);
        setIsHighlighted(false);
      } else if (event.key === 'Enter' && !isHighlighted) {
        setIsPendingSubmit(true);
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    searchInputDomHandler.addEventListener('keydown', handleKeyDown);
    searchInputDomHandler.addEventListener('submit', handleSubmit);

    return () => {
      searchInputDomHandler.removeEventListener('keydown', handleKeyDown);
      searchInputDomHandler.removeEventListener('submit', handleSubmit);
    };
  }, [items, isHighlighted]);

  useEffect(() => {
    if (isPending === 'completed' && isPendingSubmit) {
      selectItem(items[0], true);
      setIsOpen(false);
      setIsPendingSubmit(false);
      setIsPending('unset');
    }
  }, [isPending, isPendingSubmit]);

  if (!isOpen) {
    return null;
  }

  return (
    <SuggestsDropdown
      inputId="search"
      suggestItems={items}
      onHighlight={item => {
        if (!item) {
          setIsHighlighted(false);
          searchInputDomHandler.value = lastQuery;
        } else {
          setIsHighlighted(true);
          searchInputDomHandler.value = item.name;
        }
      }}
      onSelect={item => {
        window.__searchInput.searchInputHandle.value = item.name;
        selectItem(item);
        setIsOpen(false);
        setIsHighlighted(false);
      }}
    />
  );
};

export default Suggest;
