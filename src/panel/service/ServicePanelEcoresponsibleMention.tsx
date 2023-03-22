import { Stack, Flex, Text } from '@qwant/qwant-ponents';
import React from 'react';
import { useI18n } from 'src/hooks';
import { ReactComponent as IconLeaf } from '../../../public/images/leaf.svg';

const ServicePanelEcoresponsibleMention = () => {
  const { _ } = useI18n();

  return (
    <Stack className="service_panel__ecoresponsibleMention" horizontal mt="l" gap="xs">
      <IconLeaf />
      <Text typo="caption-1" color="secondary">
        {_('Eco-responsible places')}
      </Text>
      <Flex className="service_panel__new">
        <Text typo="caption-2">{_('New')}</Text>
      </Flex>
    </Stack>
  );
};

export default ServicePanelEcoresponsibleMention;
