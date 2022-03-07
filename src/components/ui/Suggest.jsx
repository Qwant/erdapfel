import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import debounce from 'lodash.debounce';
import { bool, string, func, object } from 'prop-types';
import { useConfig, useDevice, useI18n } from 'src/hooks';
import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { fetchSuggests, getInputValue, modifyList } from 'src/libs/suggest';
import { UserFeedbackYesNo } from './index';
import { setHistoryEnabled, getHistoryEnabled } from 'src/adapters/search_history';
import { Box, Button, Stack, Text, Flex } from '@qwant/qwant-ponents';
import { PURPLE } from 'src/libs/colors';
import { IconHistory, IconHistoryDisabled, IconMenu } from './icons';
import Telemetry from 'src/libs/telemetry';
import { listen, unListen } from 'src/libs/customEvents';
import useDelayedState from 'use-delayed-state';
import classnames from 'classnames';

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
  const [hasFocus, setHasFocus, cancelSetHasFocus] = useDelayedState(false);
  const [historyAnswer, setHistoryAnswer] = useState(null);
  const [keepHistoryPromptVisible, setKeepHistoryPromptVisible] = useState(
    getHistoryEnabled() === null
  );
  const { isMobile } = useDevice();

  const displayHistoryPrompt = useMemo(
    () =>
      withHistoryPrompt &&
      isOpen &&
      searchHistoryConfig?.enabled &&
      value === '' &&
      keepHistoryPromptVisible,
    [isOpen, keepHistoryPromptVisible, searchHistoryConfig?.enabled, value, withHistoryPrompt]
  );

  const isHistoryPromptVisible = useMemo(
    () => (isMobile ? displayHistoryPrompt && hasFocus : displayHistoryPrompt),
    [isMobile, hasFocus, displayHistoryPrompt]
  );
  const dropdownVisible = useMemo(() => hasFocus && isOpen && outputNode, [
    hasFocus,
    isOpen,
    outputNode,
  ]);
  const { _ } = useI18n();
  const dropDownContent = useRef();

  const close = useCallback(() => {
    if (!isHistoryPromptVisible) {
      setIsOpen(false);
    }
    setItems([]);
  }, [isHistoryPromptVisible]);

  const historyPrompt = () => {
    if (historyAnswer === null) {
      return (
        <Box m="l" className="historyPromptWrapper">
          <IconHistory width={20} fill={PURPLE} className="historyIcon" />
          <Text
            typo="body-1"
            color="primary"
            bold
            dangerouslySetInnerHTML={{
              __html: _(
                '<span class="historyText">History</span> is available on Qwant Maps',
                'history'
              ),
            }}
          />
          <Stack mt="xs">
            <Box>
              <Text typo="body-2">
                {_(
                  'Convenient and completely private, the history will only be visible to you on this device 🙈.',
                  'history'
                )}{' '}
                <a
                  href="@TODO"
                  target="_blank"
                  onMouseDown={e => {
                    e.preventDefault();
                  }}
                >
                  {_('Read more', 'history')}
                </a>
              </Text>
            </Box>
            <Box mt="xl" className="historyButtons">
              <Button
                variant="secondary"
                onClick={() => {
                  Telemetry.add(Telemetry.HISTORY_DISABLED_FROM_SUGGEST);
                  setHistoryAnswer(false);
                  document.querySelector('#search').focus();
                  document.querySelector('.top_bar').classList.add('top_bar--search_focus');
                  setHistoryEnabled(false);
                  cancelSetHasFocus();
                }}
              >
                {_('No thanks', 'history')}
              </Button>
              <Button
                ml="xs"
                onClick={() => {
                  Telemetry.add(Telemetry.HISTORY_ENABLED_FROM_SUGGEST);
                  setHistoryAnswer(true);
                  document.querySelector('#search').focus();
                  document.querySelector('.top_bar').classList.add('top_bar--search_focus');
                  setHistoryEnabled(true);
                  setHasFocus(true);
                  cancelSetHasFocus();
                }}
              >
                {_('Enable history', 'history')}
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    } else if (historyAnswer === true) {
      return (
        <Box m="l" className="historyPromptWrapper">
          <IconHistory width={20} fill={PURPLE} className="historyIcon" />
          <Text
            typo="body-1"
            color="primary"
            bold
            dangerouslySetInnerHTML={{
              __html: _(
                'Well done, the <span class="historyText">history</span> is activated',
                'history'
              ),
            }}
          />
          <Stack mt="xs">
            <Box>
              <Text
                typo="body-2"
                className="historyParagraph"
                dangerouslySetInnerHTML={{
                  __html: _(
                    'You can find and <a href="history" target="_self">manage your complete history</a> at any time in the menu',
                    'history'
                  ),
                }}
              />{' '}
              <IconMenu fill="currentColor" width={16} />
            </Box>
          </Stack>
        </Box>
      );
    } else if (historyAnswer === false) {
      return (
        <Box m="l" className="historyPromptWrapper">
          <IconHistoryDisabled width={20} className="historyDisabledIcon" />
          <Text typo="body-1" color="primary" bold>
            {_('No worries, history is disabled', 'history')}
          </Text>
          <Stack mt="xs">
            <Box>
              <Text
                typo="body-2"
                className="historyParagraph"
                dangerouslySetInnerHTML={{
                  __html: _(
                    'You can change your mind at any time and <a href="history" target="_self">manage</a> the activation of the history in the menu',
                    'history'
                  ),
                }}
              />{' '}
              <IconMenu fill="currentColor" width={16} />
            </Box>
          </Stack>
        </Box>
      );
    }
  };

  const navigateToHistoryPanel = useCallback(() => {
    window.app.navigateTo('/history/');
  }, []);

  useEffect(() => {
    if (onToggle) {
      onToggle(dropdownVisible);
    }
  }, [dropdownVisible, onToggle]);

  useEffect(() => {
    const disableHistoryHandler = listen('hide_history_prompt', () => {
      setKeepHistoryPromptVisible(false);
    });
    return () => {
      unListen(disableHistoryHandler);
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchItems = useCallback(
    debounce(value => {
      if (currentQuery) {
        currentQuery.abort();
      }

      // Check if history has been enabled in the current session before fetching suggest items
      withHistory = getHistoryEnabled();

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
      if (historyAnswer !== null) {
        setKeepHistoryPromptVisible(false);
      }
    } else {
      setHighlighted(null);
      fetchItems(value);
      setIsOpen(true);
      if (value) {
        setKeepHistoryPromptVisible(false);
      }
    }
    if (!value && keepHistoryPromptVisible) {
      document.body.classList.add('top_bar--history-suggest');
    } else {
      document.body.classList.remove('top_bar--history-suggest');
    }
  }, [hasFocus, fetchItems, value, keepHistoryPromptVisible, historyAnswer, close]);

  const selectItem = item => {
    if (item._suggestSource === 'history') {
      Telemetry.add(Telemetry.HISTORY_ITEM_CLICKED_SUGGEST);
    }
    onSelect(item, { query: value });
    setHighlighted(null);
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
            setHasFocus(false, 150);
          }
        },
        highlightedValue: highlighted ? getInputValue(highlighted) : null,
      })}
      {(dropdownVisible || isHistoryPromptVisible) &&
        ReactDOM.createPortal(
          <div ref={dropDownContent}>
            {!value &&
              items.length > 0 &&
              !items[0].errorLabel &&
              items.some(item => item._suggestSource === 'history') &&
              getHistoryEnabled() && (
                <Flex between className="manage_history">
                  <Text typo="body-1" color="primary" bold>
                    {_('Recent history')}
                  </Text>
                  <button onClick={() => navigateToHistoryPanel()}>{_('Manage history')}</button>
                </Flex>
              )}
            {dropdownVisible && !isHistoryPromptVisible && (
              <SuggestsDropdown
                className={classnames(
                  items.length === 0 && 'autocomplete_suggestions--empty',
                  items.length > 0 && getHistoryEnabled() && 'autocomplete_suggestions--history',
                  className
                )}
                suggestItems={items}
                highlighted={highlighted}
                onSelect={selectItem}
                value={value}
              />
            )}
            {isHistoryPromptVisible && historyPrompt()}
            {withFeedback && value && items.length > 0 && !items[0].errorLabel && (
              <UserFeedbackYesNo
                questionId="suggest"
                context={encodeURIComponent(value) + document.location.hash}
                question={_('Satisfied with the results?')}
              />
            )}
            {!value &&
              items.length > 0 &&
              !items[0].errorLabel &&
              items.some(item => item._suggestSource === 'history') &&
              getHistoryEnabled() && (
                <div className="suggestHistoryFooter">
                  {_(
                    'Your history is activated. It is only visible to you on this device.',
                    'suggest'
                  )}{' '}
                  <a
                    href="@TODO"
                    target="_blank"
                    onMouseDown={e => {
                      e.preventDefault();
                    }}
                  >
                    {_('Learn more', 'suggest')}
                  </a>
                </div>
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
