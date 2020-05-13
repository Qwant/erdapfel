import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import debounce from 'lodash.debounce';
import { bool, string, func, object } from 'prop-types';

import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { fetchSuggests, selectItem, modifyList } from 'src/libs/suggest';

const SUGGEST_DEBOUNCE_WAIT = 100;

const Suggest = ({
  inputNode,
  outputNode,
  withCategories,
  withGeoloc,
  onSelect = selectItem,
  className,
}) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  let currentQuery = null;

  useEffect(() => {
    const handleFocus = () => {
      setIsOpen(true);
      fetchItems(inputNode.value);
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

    const handleKeyDown = async event => {
      if (event.key === 'Esc' || event.key === 'Escape') {
        if (inputNode.value === '') {
          setIsOpen(false);
        } else {
          inputNode.value = '';
          fetchItems('');
        }
      } else {
        setIsOpen(true);
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
  }, []);

  if (!isOpen) {
    return null;
  }

  const SuggestsDropdownElement = () =>
    <SuggestsDropdown
      className={className}
      inputNode={inputNode}
      outputNode={outputNode}
      suggestItems={items}
      onHighlight={item => {
        if (!item) {
          inputNode.value = lastQuery;
        } else {
          inputNode.value = item.name;
        }
      }}
      onSelect={item => {
        inputNode.value = item.name;
        setIsOpen(false);
        onSelect(item);
      }}
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
  className: string,
};

export default Suggest;
