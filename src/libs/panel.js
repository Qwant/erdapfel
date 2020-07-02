
export function togglePanelVisibility(visible) {
  if (visible) {
    document.body.classList.remove('panel-hidden');
  } else {
    document.body.classList.add('panel-hidden');
  }
}
