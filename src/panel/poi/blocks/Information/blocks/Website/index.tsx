import React from 'react';
import { components } from 'appTypes/idunn';
import URI from '@qwant/uri';
import Block from 'src/panel/poi/blocks/Block';
import { IconEarth } from '@qwant/qwant-ponents';

export type PoiWebsiteBlockProps = {
  texts?: {
    website: string;
  };
  block: components['schemas']['WebSiteBlock'];
  onClickWebsite?: () => void;
};

const WebsiteBlock: React.FunctionComponent<PoiWebsiteBlockProps> = ({
  block,
  texts,
  onClickWebsite,
}) => {
  return (
    <Block
      className="block-website"
      icon={<IconEarth size={20} fill="var(--green-500)" />}
      title={texts?.website}
      onClick={onClickWebsite}
      href={URI.externalise(block?.url)}
      rel="noopener noreferrer nofollow"
      target="_blank"
    >
      {block?.label ?? URI.extractDomain(block?.url)}
    </Block>
  );
};

export default WebsiteBlock;
