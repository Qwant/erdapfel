import React from 'react';
import { components } from 'appTypes/idunn';
import { TextType, parseText } from '../../../../libs/miniMarkdown';

export type PoiDescriptionBlockProps = {
  block: components['schemas']['DescriptionBlock'];
  texts: {
    wikipedia: string;
    pagesjaunes: string;
    readMore: string;
  };
  onClick: () => void;
};

function parseClaimValue(raw: string): JSX.Element {
  const content = parseText(raw).map(part => {
    switch (part.type) {
      case TextType.Raw:
        return <span>{part.text}</span>;
      case TextType.Link:
        return (
          <a href={'https://www.qwant.com/?q=' + part.text + '&t=web&sticky=' + part.url}>
            {part.text}
          </a>
        );
    }
  });

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
      {block.claims?.length && (
        <ul className="block-description-extra">
          {block.claims.map(claim => (
            <li key={claim.label}>
              <strong>{claim.label} :</strong> {parseClaimValue(claim.value)}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default PoiDescriptionBlock;
