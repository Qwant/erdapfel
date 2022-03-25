import React, { useEffect, useState, useRef } from 'react';
import cx from 'classnames';
import Telemetry from 'src/libs/telemetry';
import { Suggest } from 'src/components/ui';
import {
  IconArrowLeftLine,
  IconDirection,
  IconClose,
  Flex,
  IconMenu,
  IconApps,
} from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { useConfig, useDevice, useI18n } from 'src/hooks';
import { handleFocus } from 'src/libs/input';
import { selectItem, fetchSuggests } from 'src/libs/suggest';
import { getHistoryEnabled, saveQuery } from 'src/adapters/search_history';
import { useStore } from 'src/store';

const MAPBOX_RESERVED_KEYS = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', '-', '+', '='];

const TopBar = ({ value, setUserInputValue, inputRef, onSuggestToggle, backButtonAction }) => {
  const barElement = useRef(null);
  const suggestElement = useRef(null);
  const [focused, setFocused] = useState(false);
  const { isMobile } = useDevice();
  const config = useConfig();
  const searchHistoryEnabled = getHistoryEnabled();
  const { _ } = useI18n();
  const {
    isMenuDrawerOpen,
    setMenuDrawerOpen,
    isProductsDrawerOpen,
    setProductsDrawerOpen,
  } = useStore(state => state);

  // give keyboard focus to the field when typing anywhere
  useEffect(() => {
    const globalKeyHandler = e => {
      if (MAPBOX_RESERVED_KEYS.find(key => key === e.key)) {
        return;
      }
      // KeyboardEvent.key is either the printed character representation or a standard value for specials keys
      // See https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent/key/Key_Values
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        setUserInputValue(inputRef.current.value + e.key);
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', globalKeyHandler);

    return () => {
      document.removeEventListener('keydown', globalKeyHandler);
    };
  }, [setUserInputValue, inputRef]);

  const onClickDirections = () => {
    Telemetry.add(Telemetry.HOME_ITINERARY);
    window.app.navigateTo('/routes');
  };

  const onSelectSuggestion = (item, options) => {
    selectItem(item, options);
    if (item && searchHistoryEnabled) {
      saveQuery(item);
    }
    inputRef.current.blur();
  };

  const onSubmit = async e => {
    e.preventDefault();
    Telemetry.add(Telemetry.SUGGEST_SUBMIT);
    const query = inputRef.current.value;
    const results = await fetchSuggests(query, {
      withCategories: true,
      useFocus: true,
    });
    onSelectSuggestion(results[0], {
      query,
      replaceUrl: true,
    });
  };

  const onClear = e => {
    e.preventDefault(); // Prevent losing focus on input
    Telemetry.add(Telemetry.SUGGEST_CLEAR);
    setUserInputValue('');
    window.app.navigateTo('/');
  };

  // this insures the top bar cannot trigger a whole body scroll on iOS
  useEffect(() => {
    if (isMobile) {
      const bar = barElement.current;
      const cancelTouchScroll = e => e.preventDefault();
      bar.addEventListener('touchmove', cancelTouchScroll);
      return () => {
        bar.removeEventListener('touchmove', cancelTouchScroll);
      };
    }
  }, [isMobile, barElement]);

  return (
    <div
      className={cx('top_bar', {
        ['top_bar--search_focus']: focused,
        ['top_bar--search_filled']: value,
        ['top_bar--back_action']: !!backButtonAction,
      })}
    >
      <form onSubmit={onSubmit} noValidate className="search_form" ref={barElement}>
        <button
          type="button"
          onClick={() => {
            window.app.navigateTo('/');
          }}
          className="search_form__logo__button"
          title={_('Qwant Maps Home', 'search bar')}
        />
        <div className="search_form__wrapper">
          <div className="search_form__return" onMouseDown={backButtonAction}>
            <IconArrowLeftLine size={20} />
          </div>
          <Suggest
            value={value}
            outputNode={suggestElement.current}
            withCategories
            onToggle={onSuggestToggle}
            onSelect={onSelectSuggestion}
            withFeedback
            withHistory={searchHistoryEnabled}
            withHistoryPrompt
          >
            {({ onKeyDown, onFocus, onBlur, highlightedValue }) => (
              <input
                ref={inputRef}
                id="search"
                className="search_form__input"
                type="search"
                spellCheck="false"
                required
                autoComplete="off"
                placeholder={_('Search on Qwant Maps')}
                value={highlightedValue || value}
                onChange={e => {
                  setUserInputValue(e.target.value);
                }}
                onFocus={e => {
                  handleFocus(e);
                  setFocused(true);
                  onFocus();
                }}
                onBlur={() => {
                  // The mouseLeave flag allows to keep the suggest open when clicking outside of the browser
                  if (!window.mouseLeave) {
                    setFocused(false);
                    onBlur();
                  }
                }}
                onKeyDown={onKeyDown}
              />
            )}
          </Suggest>
          <button
            id="clear_button_mobile"
            className="search_form__clear"
            type="button"
            onMouseDown={onClear}
          >
            <IconClose size={24} />
          </button>
          <input className="search_form__action" type="submit" value="" title={_('Search')} />
        </div>

        <div id="react_menu__container">
          <Flex className="menu__button-container">
            <button
              type="button"
              className={cx('menu__button', {
                'menu__button--active': isMenuDrawerOpen,
                'menu__button--noShadow': !isMenuDrawerOpen && isProductsDrawerOpen,
              })}
              onClick={() => setMenuDrawerOpen(!isMenuDrawerOpen)}
              title={_('Menu')}
            >
              <IconMenu size={isMobile ? 24 : 16} />
            </button>
            {!isMobile && config.burgerMenu.products && (
              <button
                type="button"
                className={cx('u-mr-xs', 'menu__button', {
                  'menu__button--active': isProductsDrawerOpen,
                  'menu__button--noShadow': !isProductsDrawerOpen && isMenuDrawerOpen,
                })}
                onClick={() => setProductsDrawerOpen(!isProductsDrawerOpen)}
              >
                <IconApps className="u-mr-xxs" />
                {_('Products', 'menu')}
              </button>
            )}
          </Flex>
        </div>
        {config.direction.enabled && (
          <>
            <Flex
              as="button"
              center
              alignCenter
              className="search_form__direction_shortcut"
              title={_('Directions', 'top bar')}
              type="button"
              onClick={onClickDirections}
            >
              <IconDirection size={24} fill={ACTION_BLUE_BASE} />
            </Flex>
            <button
              id="clear_button_desktop"
              className="search_form__clear"
              type="button"
              onMouseDown={onClear}
            >
              <IconClose size={24} />
            </button>
          </>
        )}
      </form>
      <div ref={suggestElement} className="search_form__result" />
    </div>
  );
};

const TopBarWithRef = React.forwardRef((props, ref) => <TopBar {...props} inputRef={ref} />);

TopBarWithRef.displayName = 'TopBar';

export default TopBarWithRef;
