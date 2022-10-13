import React from 'react';
import { useI18n } from 'src/hooks';
import { Stack, Flex, Text, IconExternalLink } from '@qwant/qwant-ponents';

const NoResultMessage: React.FunctionComponent = () => {
  const { getLocalizedUrl, _ } = useI18n();
  const helpCenterLink: string = getLocalizedUrl('helpEditData');

  return (
    <Stack gap="xs">
      <Text
        center
        bold
        typo="body-1"
        html={_('Sorry, we could not find this place&nbsp;🏝️', 'suggest')}
      />
      <Text center typo="body-2">
        {_(
          'Please try to correct your query or rewrite it with more details about the location (city, country, …)',
          'suggest'
        )}
      </Text>
      <Flex center mt="xs">
        <Text center typo="body-2" raw>
          <a href={helpCenterLink}>
            <IconExternalLink style={{ transform: 'translateY(var(--spacing-xxxs))' }} />
            {_('Add a missing place on the map')}
          </a>
        </Text>
      </Flex>
    </Stack>
  );
};

export default NoResultMessage;
