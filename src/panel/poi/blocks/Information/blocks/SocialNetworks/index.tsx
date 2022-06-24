import React from 'react';
import {
  IconLink,
  IconFacebook,
  IconTwitter,
  IconInstagram,
  IconYoutube,
} from 'src/components/ui/icons';
import { Flex } from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { capitalizeFirst } from 'src/libs/string';
import Block from 'src/panel/poi/blocks/Block';
import { components } from 'appTypes/idunn';

const icons = {
  facebook: IconFacebook,
  twitter: IconTwitter,
  instagram: IconInstagram,
  youtube: IconYoutube,
};

export type PoiSocialNetworksBlockProps = {
  texts?: {
    social_networks: string;
  };
  block: components['schemas']['SocialBlock'];
};

const SocialNetworksBlock: React.FunctionComponent<PoiSocialNetworksBlockProps> = ({
  block,
  texts,
}) => {
  return (
    <Block
      className="block-socialNetworks"
      icon={<IconLink fill={ACTION_BLUE_BASE} width={20} />}
      title={texts?.social_networks}
    >
      {block.links.map(({ site, url }) => {
        const Icon = icons[site];
        return (
          <Flex
            as="a"
            key={site}
            href={url}
            alignCenter
            className="u-mr-m"
            rel="noopener noreferrer nofollow"
            target="_blank"
            style={{ display: 'inline-flex' }}
            variant="tertiary"
          >
            <Icon className="u-mr-xxs" fill="currentColor" height={16} width={16} />
            {capitalizeFirst(site)}
          </Flex>
        );
      })}
    </Block>
  );
};

export default SocialNetworksBlock;
