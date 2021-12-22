import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import debounce from 'lodash.debounce';
import { bool, string, func, object } from 'prop-types';
import { useConfig, useDevice, useI18n } from 'src/hooks';
import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { fetchSuggests, getInputValue, modifyList } from 'src/libs/suggest';
import { UserFeedbackYesNo } from './index';
import { getHistoryPrompt, setHistoryPrompt, setHistoryEnabled } from 'src/adapters/search_history';
import { Box, Button, Heading, Stack } from '@qwant/qwant-ponents';

const SUGGEST_DEBOUNCE_WAIT = 100;

let currentQuery = null;

const getSuggestItemLimits = ({ inputValue, withHistory, isMobile }) => {
  if (!withHistory) {
    return {
      maxHistoryItems: 0,
      maxFavorites: !inputValue ? 5 : 2,
    };
  }

  if (!inputValue) {
    return {
      maxFavorites: 2, // only if no history items
      maxHistoryItems: isMobile ? 7 : 3,
    };
  }

  return {
    maxFavorites: 1,
    maxHistoryItems: 1,
  };
};

const Suggest = ({
  outputNode,
  withHistory,
  withHistoryPrompt,
  withCategories,
  withGeoloc,
  onSelect,
  className,
  onToggle,
  children: renderInput,
  value,
  withFeedback,
  hide,
}) => {
  const searchHistoryConfig = useConfig('searchHistory');

  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const [hasFocus, setHasFocus] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [afterAnswer, setAfterAnswer] = useState(false);
  const historyPromptVisible =
    withHistoryPrompt &&
    isOpen &&
    searchHistoryConfig?.enabled &&
    value === '' &&
    !afterAnswer &&
    (getHistoryPrompt() === null || answer !== null);
  const dropdownVisible = hasFocus && isOpen && outputNode;
  const { isMobile } = useDevice();
  const { _ } = useI18n();
  const dropDownContent = useRef();

  const close = () => {
    if (!historyPromptVisible) {
      setIsOpen(false);
    }
    setItems([]);
    if (answer !== null) {
      setAfterAnswer(true);
    }
  };

  const historyPrompt = () => {
    if (!afterAnswer) {
      if (answer === null) {
        return (
          <Box m="l">
            <Heading as="h6">{_('History is available on Qwant Maps', 'history')}</Heading>
            <Stack>
              <Box>
                {_(
                  'Convenient and completely private, the history will only be visible to you on this device 🙈.',
                  'history'
                )}{' '}
                <a href="@TODO">{_('Read more', 'history')}</a>
              </Box>
              <Box mt="l">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setHistoryPrompt(true);
                    setAnswer(false);
                    document.querySelector('#search').focus();
                    document.querySelector('.top_bar').classList.add('top_bar--search_focus');
                    setHistoryEnabled(false);
                  }}
                >
                  {_('No thanks', 'history')}
                </Button>
                <Button
                  ml="l"
                  onClick={() => {
                    setHistoryPrompt(true);
                    setAnswer(true);
                    document.querySelector('#search').focus();
                    document.querySelector('.top_bar').classList.add('top_bar--search_focus');
                    setHistoryEnabled(true);
                  }}
                >
                  {_('Enable history', 'history')}
                </Button>
              </Box>
            </Stack>
          </Box>
        );
      } else if (answer === true) {
        return (
          <Box m="l">
            <Heading as="h6">{_('Well done, the history is activated!', 'history')}</Heading>
            <Stack>
              <Box>
                {_(
                  'You can find and manage your complete history at any time in the menu.',
                  'history'
                )}
              </Box>
            </Stack>
          </Box>
        );
      } else if (answer === false) {
        return (
          <Box m="l">
            <Heading as="h6">{_('No worries, history is disabled', 'history')}</Heading>
            <Stack>
              <Box>
                {_(
                  'You can change your mind at any time and manage the activation of the history in the menu.',
                  'history'
                )}
              </Box>
            </Stack>
          </Box>
        );
      }
    }
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
        ...getSuggestItemLimits({ inputValue: value, withHistory, isMobile }),
      });

      currentQuery = query;

      query
        .then(suggestions => modifyList(suggestions, withGeoloc && value === '', value, hide))
        .then(items => {
          setItems(items);
          currentQuery = null;
        })
        .catch(() => {
          /* Query aborted. Just ignore silently */
        });
    }, SUGGEST_DEBOUNCE_WAIT),
    [withCategories, withGeoloc, hide]
  );

  useEffect(() => {
    if (!hasFocus) {
      close();
    } else {
      setHighlighted(null);
      fetchItems(value);
      setIsOpen(true);
      if(value && answer !== null) {
        setAfterAnswer(true);
      }
    }
  }, [hasFocus, fetchItems, value]);

  const selectItem = item => {
    onSelect(item, { query: value });
    setHighlighted(null);
    if (answer) {
      setAfterAnswer(true);
    }
  };

  const onKeyDown = e => {
    switch (e.key) {
      case 'Esc':
      case 'Escape':
        close();
        break;
      case 'Enter':
        if (highlighted !== null) {
          e.preventDefault(); // prevent search input submit with its current content (highlighted POI name)
          selectItem(highlighted);
        }
        break;
      case 'ArrowDown':
        setHighlighted(items[items.indexOf(highlighted) + 1] || null);
        break;
      case 'ArrowUp':
        e.preventDefault(); // prevent cursor returning at beginning
        setHighlighted(
          !highlighted ? items[items.length - 1] : items[items.indexOf(highlighted) - 1] || null
        );
    }
  };

  useEffect(() => {
    // If available we use the Visual Viewport API, which informs about the visible page area,
    // in particular taking the virtual keyboard into account.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
    if (isMobile && dropdownVisible && window.visualViewport) {
      const setDropdownFixedHeight = () => {
        const TOP_BAR_HEIGHT = 60;
        // visualViewport.height is the real visible height, not including the virtual keyboard.
        // Giving a fixed height to the container makes the content scrollable
        outputNode.style.height = window.visualViewport.height - TOP_BAR_HEIGHT + 'px';
      };
      setDropdownFixedHeight();
      visualViewport.addEventListener('resize', setDropdownFixedHeight);

      const cancelTouchScrollIfNotOverflow = e => {
        const hasOverflow =
          dropDownContent.current &&
          dropDownContent.current.getBoundingClientRect().height >
            outputNode.getBoundingClientRect().height;
        if (!hasOverflow) {
          e.preventDefault();
        }
      };
      outputNode.addEventListener('touchmove', cancelTouchScrollIfNotOverflow);

      return () => {
        outputNode.style.height = 'auto';
        visualViewport.removeEventListener('resize', setDropdownFixedHeight);
        outputNode.removeEventListener('touchmove', cancelTouchScrollIfNotOverflow);
      };
    }
  }, [isMobile, items, dropdownVisible, outputNode]);

  return (
    <>
      {renderInput({
        onKeyDown,
        onFocus: () => {
          setHasFocus(true);
        },
        onBlur: () => {
          // The mouseLeave flag allows to keep the suggest open when clicking outside of the browser
          if (!window.mouseLeave) {
            setHasFocus(false);
          }
        },
        highlightedValue: highlighted ? getInputValue(highlighted) : null,
      })}
      {(dropdownVisible || historyPromptVisible) &&
        ReactDOM.createPortal(
          <div ref={dropDownContent}>
            {dropdownVisible && !historyPromptVisible && (
              <SuggestsDropdown
                className={className}
                suggestItems={items}
                highlighted={highlighted}
                onSelect={selectItem}
                value={value}
              />
            )}
            {historyPromptVisible && historyPrompt()}
            {withFeedback && value && items.length > 0 && !items[0].errorLabel && (
              <UserFeedbackYesNo
                questionId="suggest"
                context={encodeURIComponent(value) + document.location.hash}
                question={_('Satisfied with the results?')}
              />
            )}
          </div>,
          outputNode
        )}
      {}
    </>
  );
};

Suggest.propTypes = {
  outputNode: object,
  withCategories: bool,
  withGeoloc: bool,
  withHistory: bool,
  withHistoryPrompt: bool,
  onSelect: func.isRequired,
  onToggle: func,
  className: string,
  value: string,
  withFeedback: bool,
};

export default Suggest;
