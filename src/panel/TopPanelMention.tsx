import React from 'react';
import { Image, Box, Flex, Text } from '@qwant/qwant-ponents';

type TopPanelMentionProps = {
  image: string;
  text?: string;
  link?: {
    href?: string;
    text?: string;
  };
};

const TopPanelMention = ({ image, text, link }: TopPanelMentionProps) => {
  return (
    <Flex className="topPanelMention" m="m" p="s">
      {image && <Image className="topPanelMention__image" width="36" height="36" src={image} />}
      <Box className="topPanelMention__text" ml={image ? 's' : undefined}>
        {text && <Text html={text} color="primary" typo="body-2" />}
        {link && (
          <a target="_blank" href={link.href} rel="noreferrer">
            {link.text}
          </a>
        )}
      </Box>
    </Flex>
  );
};

export default TopPanelMention;
