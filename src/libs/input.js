import { isMobileDevice } from 'src/libs/device';

export function handleFocus(e) {
  const input = e.target;

  if (isMobileDevice()) {
    // on mobile, position cursor at the end of the text input
    const setCursorToEnd = () => {
      const pos = input.value.length;
      input.setSelectionRange(pos, pos);
    };

    setTimeout(setCursorToEnd, 0);
  }
}
