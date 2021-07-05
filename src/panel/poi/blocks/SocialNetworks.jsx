import React from 'react';
import PropTypes from 'prop-types';
import {
  IconLink,
  IconFacebook,
  IconTwitter,
  IconInstagram,
  IconYoutube,
} from 'src/components/ui/icons';
import { Flex } from 'src/components/ui';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { capitalizeFirst } from 'src/libs/string';
import Block from 'src/panel/poi/blocks/Block';
import { useI18n } from 'src/hooks';

const icons = {
  facebook: IconFacebook,
  twitter: IconTwitter,
  instagram: IconInstagram,
  youtube: IconYoutube,
};

const SocialNetworks = ({ block }) => {
  const { _ } = useI18n();

  return (
    <Block
      className="block-socialNetworks"
      icon={<IconLink fill={ACTION_BLUE_BASE} width={20} />}
      title={_('Social networks')}
      rel="noopener noreferrer nofollow"
      target="_blank"
    >
      {block.links.map(({ site, url }) => {
        const Icon = icons[site];
        return (
          <Flex as="a" key={site} href={url} className="u-mr-m" inline>
            <Icon className="u-mr-xxs" fill="currentColor" height={16} width={16} />
            {capitalizeFirst(site)}
          </Flex>
        );
      })}
    </Block>
  );
};

SocialNetworks.propTypes = {
  block: PropTypes.object.isRequired,
};

export default SocialNetworks;
