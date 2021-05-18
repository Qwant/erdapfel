/* global _ */
import React, { useEffect, useState, useRef } from 'react';
import cx from 'classnames';
import Telemetry from 'src/libs/telemetry';
import Suggest from 'src/components/ui/Suggest';
import Menu from 'src/panel/Menu';
import { useConfig, useDevice } from 'src/hooks';
import { handleFocus } from 'src/libs/input';
import { selectItem, fetchSuggests } from 'src/libs/suggest';

const MAPBOX_RESERVED_KEYS = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', '-', '+', '='];

const TopBar = ({ value, setUserInputValue, inputRef, onSuggestToggle, backButtonAction }) => {
  const suggestElement = useRef(null);
  const [focused, setFocused] = useState(false);
  const { isMobile } = useDevice();
  const config = useConfig();

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

  const onSelectSuggestion = (item, query) => {
    selectItem(item, { query });
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

  return (
    <div
      className={cx('top_bar', {
        ['top_bar--search_focus']: focused,
        ['top_bar--search_filled']: value,
        ['top_bar--back_action']: !!backButtonAction,
      })}
    >
      <form onSubmit={() => false} noValidate className="search_form">
        <button
          type="button"
          onClick={() => {
            window.app.navigateTo('/');
          }}
          className="search_form__logo__button"
          title={_('Qwant Maps Home', 'search bar')}
          data-flag-text={config.app.versionFlag}
        />
        <div className="search_form__wrapper">
          <div className="search_form__return icon-arrow-left" onMouseDown={backButtonAction} />
          <Suggest
            value={value}
            outputNode={suggestElement.current}
            withCategories
            onToggle={onSuggestToggle}
            onSelect={onSelectSuggestion}
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
                  setFocused(false);
                  onBlur();
                }}
                onKeyDown={onKeyDown}
              />
            )}
          </Suggest>
          <button
            id="clear_button_mobile"
            className="search_form__clear icon-x"
            type="button"
            onMouseDown={onClear}
          />
          <input
            className="search_form__action"
            type="submit"
            value=""
            title={_('Search')}
            onClick={onSubmit}
          />
        </div>
        {isMobile && config.burgerMenu.enabled && (
          <div id="react_menu__container">
            <Menu />
          </div>
        )}
        {config.direction.enabled && (
          <>
            <button
              className="search_form__direction_shortcut"
              title={_('Directions', 'top bar')}
              type="button"
              onClick={onClickDirections}
            />
            <button
              id="clear_button_desktop"
              className="search_form__clear icon-x"
              type="button"
              onMouseDown={onClear}
            />
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
