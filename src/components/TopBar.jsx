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

const executeSearch = async query => {
  const results = await fetchSuggests(query, {
    withCategories: true,
    useFocus: true,
  });

  selectItem(results[0] || null, {
    query,
    replaceUrl: true,
  });
};

const TopBar = ({
  inputValue,
  onClearInput,
  onInputChange,
  inputRef,
  onSuggestToggle,
  backButtonAction,
}) => {
  const suggestElement = useRef(null);
  const [focused, setFocused] = useState(false);
  const { isMobile } = useDevice();
  const config = useConfig();

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
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', globalKeyHandler);

    return () => {
      document.removeEventListener('keydown', globalKeyHandler);
    };
  }, [inputRef]);

  useEffect(() => {
    if (inputValue === '') {
      // needed to trigger an update on Suggest
      inputRef.current.dispatchEvent(new Event('input'));
    }
  }, [inputRef, inputValue]);

  const onClickDirections = () => {
    Telemetry.add(Telemetry.HOME_ITINERARY);
    window.app.navigateTo('/routes');
  };

  const onFocus = e => {
    handleFocus(e);
    setFocused(true);
  };

  const onBlur = () => {
    setFocused(false);
  };

  const onSubmit = e => {
    e.preventDefault();
    Telemetry.add(Telemetry.SUGGEST_SUBMIT);
    executeSearch(inputValue);
    inputRef.current.blur();
  };

  const onClear = e => {
    e.preventDefault(); // Prevent losing focus on input
    onClearInput();
  };

  return (
    <div
      className={cx('top_bar', {
        ['top_bar--search_focus']: focused,
        ['top_bar--search_filled']: inputValue,
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
          <input
            ref={inputRef}
            id="search"
            className="search_form__input"
            type="search"
            spellCheck="false"
            required
            autoComplete="off"
            placeholder={_('Search on Qwant Maps')}
            value={inputValue}
            onChange={e => {
              onInputChange(e.target.value);
            }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
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
      {inputRef.current && suggestElement.current && (
        <Suggest
          inputNode={inputRef.current}
          outputNode={suggestElement.current}
          withCategories
          onToggle={onSuggestToggle}
        />
      )}
    </div>
  );
};

const TopBarWithRef = React.forwardRef((props, ref) => <TopBar {...props} inputRef={ref} />);

TopBarWithRef.displayName = 'TopBar';

export default TopBarWithRef;
