export function setBackButtonVisibility(visible = true) {
  const elem = document.getElementsByClassName('search_form__return')[0];
  elem.style.display = visible ? 'block' : 'none';

  const elem2 = document.getElementsByClassName('search_form__wrapper')[0];
  elem2.style.padding = visible ? '0 0 0 40px' : '0 0 0 20px';
}

export function registerBackButtonEvent(cb) {
  // Do not forget to unregister after use
  const btn = document.getElementsByClassName('search_form__return')[0];
  return btn.addEventListener('click', cb);
}
