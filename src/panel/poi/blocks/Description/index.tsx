import React from 'react';
import { components } from 'appTypes/idunn';

export type PoiDescriptionBlockProps = {
  block: components['schemas']['DescriptionBlock'];
  texts: {
    wikipedia: string;
    pagesjaunes: string;
    readMore: string;
  };
  onClick: () => void;
};

// Build a regexp that matches links in the form [text](url), optionaly with or
// without capture groups.
function buildUrlPattern(capture: boolean): RegExp {
  const group = (inner: string) => '(' + (capture ? '' : '?:') + inner + ')';
  return RegExp('\\[' + group('[^\\]]*') + '\\]\\(' + group('[^\\)]*') + '\\)', 'g');
}

const urlPattern = buildUrlPattern(false);
const urlPatternWithCapture = buildUrlPattern(true);

function parseClaimValue(raw: string): JSX.Element {
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
  const texts = raw.split(urlPattern).map(text => <>{text}</>);
  const links = Array.from(raw.matchAll(urlPatternWithCapture)).map(([, text, link]) =>
    link.match(/^https?:\/\//) ? <a href={link}>{text}</a> : <span>{text}</span>
  );

  // Put the elements from texts and links in order to reflect original content.
  const content = Array.from(Array(texts.length + links.length).keys()).map(i =>
    // Note that `texts.lengths == links.length + 1` because links are
    // separators of text sections.
    i % 2 === 0 ? texts[i / 2] : links[(i - 1) / 2]
  );

  return <>{content}</>;
}

const PoiDescriptionBlock: React.FunctionComponent<PoiDescriptionBlockProps> = ({
  block,
  texts,
  onClick,
}) => {
  return (
    <>
      <div className="block-description u-mb-m">
        {block?.description && <p>{block?.description}</p>}
        {block?.url && (
          <a rel="noopener noreferrer" target="_blank" href={block?.url} onClick={onClick}>
            {texts[block.source] || texts.readMore}
          </a>
        )}
      </div>
      <ul className="block-description-extra">
        {(block.claims ?? []).map(claim => (
          <li key={claim.label}>
            <strong>{claim.label} :</strong> {parseClaimValue(claim.value)}
          </li>
        ))}
      </ul>
    </>
  );
};

export default PoiDescriptionBlock;
