// Build a regexp that matches links in the form [text](url), optionaly with or
// without capture groups.
function buildUrlPattern(capture: boolean): RegExp {
  const group = (inner: string) => '(' + (capture ? '' : '?:') + inner + ')';
  return RegExp('\\[' + group('[^\\]]*') + '\\]\\(' + group('[^\\)]*') + '\\)', 'g');
}

const urlPattern = buildUrlPattern(false);
const urlPatternWithCapture = buildUrlPattern(true);

export enum textType {
  Raw = 'Raw',
  Link = 'Link',
}

export type textLink = {
  type: textType;
  text: string;
  url: string;
};

export type textRaw = {
  type: textType;
  text: string;
};

export type textElement = textLink | textRaw;

export function parseText(raw: string): textElement[] {
  // Build elements for chunks of the raw value, with specific handling for links
  //
  // For example with "first link: [a](https://b), second link: [c](https://d)":
  //
  // texts = [
  //     <>first link: </>,
  //     <>, second link:</>,
  //     <></>
  // ];
  //
  // links = [
  //     <a href="https://b">a</a>,
  //     <a href="https://d">c</a>
  // ];
  const texts = raw.split(urlPattern).map(text => ({
    type: textType.Raw,
    text,
  }));

  const links = Array.from(raw.matchAll(urlPatternWithCapture)).map(([, text, url]) => ({
    type: textType.Link,
    text,
    url,
  }));

  // Put the elements from texts and links in order to reflect original content.
  const content = Array.from(Array(texts.length + links.length).keys())
    .map(i =>
      // Note that `texts.lengths == links.length + 1` because links are
      // separators of text sections.
      i % 2 === 0 ? texts[i / 2] : links[(i - 1) / 2]
    )
    // Cleanup empty text sections
    .filter(part => !(part.type === 'Raw' && !part.text));

  return content;
}
