import React from 'react';

const TopBar = ({ i18n, config }) => {
  const _ = i18n._;

  return <>
    <form onSubmit="return false" noValidate className="search_form"
      data-flag-text={config.app.versionFlag}
    >
      <div className="search_form__logo" />
      <div id="react_menu__container" />
      <div className="search_form__wrapper empty">
        <div className="search_form__return icon-arrow-left" />
        <input
          id="search"
          className="search_form__input"
          type="search"
          spellCheck="false"
          required
          autoComplete="off"
          placeholder={_('Search on Qwant Maps')}
        />
        <button
          id="clear_button_mobile"
          className="search_form__clear icon-x"
          type="button" />
        <input
          className="search_form__action"
          type="submit"
          value=""
          title={_('Search')}
        />
      </div>
      {config.direction.enabled && <>
        <button
          className="search_form__direction_shortcut"
          title={_('Directions', 'top bar')} />
        <button
          id="clear_button_desktop" className="search_form__clear icon-x"
          type="button"
        />
      </>}
    </form>
    <div className="search_form__result" />
  </>;
};

export default TopBar;
