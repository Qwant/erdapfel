import React from 'react';
import { Text, Flex } from '@qwant/qwant-ponents';
import Divider from 'src/components/ui/Divider';

export type PublicTransportRoadMapPointProps = {
  title?: string;
  details?: JSX.Element | string;
};

const PublicTransportRoadMapPoint: React.FunctionComponent<PublicTransportRoadMapPointProps> = ({
  title,
  details,
}) => {
  return (
    <>
      <Flex column>
        {title && (
          <Text typo="body-2" bold>
            {title}
          </Text>
        )}
        {details && (
          <Text typo="body-2" bold>
            {details}
          </Text>
        )}
      </Flex>
      <Divider paddingTop={0} paddingBottom={0} />
    </>
  );
};

export default PublicTransportRoadMapPoint;
