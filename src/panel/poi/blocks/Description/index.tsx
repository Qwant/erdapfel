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

const PoiDescriptionBlock: React.FunctionComponent<PoiDescriptionBlockProps> = ({
  block,
  texts,
  onClick,
}) => {
  return (
    <div className="block-description u-mb-m">
      {block?.description && <p>{block?.description}</p>}
      {block?.url && (
        <a rel="noopener noreferrer" target="_blank" href={block?.url} onClick={onClick}>
          {texts[block.source] || texts.readMore}
        </a>
      )}
    </div>
  );
};

export default PoiDescriptionBlock;
