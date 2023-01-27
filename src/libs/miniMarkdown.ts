// Build a regexp that matches links in the form [text](url), optionaly with or
// without capture groups.
function buildUrlPattern(capture: boolean): RegExp {
  const group = (inner: string) => '(' + (capture ? '' : '?:') + inner + ')';
  return RegExp('\\[' + group('[^\\]]*') + '\\]\\(' + group('[^\\)]*') + '\\)', 'g');
}

const urlPattern = buildUrlPattern(false);
const urlPatternWithCapture = buildUrlPattern(true);

export enum TextType {
  Raw = 'Raw',
  Link = 'Link',
}

export type textLink = {
  type: TextType.Link;
  text: string;
  url: string;
};

export type textRaw = {
  type: TextType.Raw;
  text: string;
};

export type textElement = textLink | textRaw;

// Parse a simple text with markdown formatted links and return an array of `textElement`.
//
// For example with text "Hello, [World](https://perdu.com)!" it returns the following array:
// [
//     { type: 'Raw', text: 'Hello, ' },
//     { type: 'Link', text: 'World', url: 'https://perdu.com/' },
//     { type: 'Raw', text: '!' },
// ]
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
  const texts: textElement[] = raw.split(urlPattern).map(text => ({
    type: TextType.Raw,
    text,
  }));

  const links: textElement[] = Array.from(raw.matchAll(urlPatternWithCapture)).map(
    ([, text, url]) => ({
      type: TextType.Link,
      text,
      url,
    })
  );

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
