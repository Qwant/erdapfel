/* global _, _n */
import {
  Box,
  Button,
  DateHelpers,
  Flex,
  IconArrowLeftLine,
  Stack,
  Text,
} from '@qwant/qwant-ponents';
import React from 'react';

export function ReservationDateModal({
  children,
  active,
  header,
  onBack,
  onReset,
  onSubmit,
  nights,
}) {
  const daysOfWeek = DateHelpers.daysForLocale(undefined, 'long', -1);
  if (!active) {
    return (
      <>
        {header}
        {children}
      </>
    );
  }

  return (
    <Box className="ReservationDatepickerWrapper">
      <Box className="ReservationDatepickerWrapperHeader">
        <Flex alignCenter>
          <Text color="primary" typo="body-2">
            <Flex alignCenter>
              <Flex
                as="button"
                alignCenter
                center
                className="ReservationDatepickerBack"
                onClick={onBack}
              >
                <IconArrowLeftLine size={24} />
              </Flex>
            </Flex>
          </Text>
          <Box relative>{header}</Box>
        </Flex>
        <Flex className="ReservationDatepickerWrapperDays">
          {daysOfWeek.map(day => (
            <Box pb="xs" pt="xl2" key={day}>
              <Text center typo="caption-1" uppercase color="secondary">
                {day[0]}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>
      <Box className="ReservationDatepickerWrapperBody" px="s">
        {children}
      </Box>
      <Flex className="ReservationDatepickerWrapperFooter" between alignCenter px="s">
        <Text color="secondary" typo="body-2" style={{ width: 80, flex: 'none' }}>
          {nights ? _n('Night', 'Nights', nights) : ''}
        </Text>
        <Box>
          <Stack horizontal gap="xs">
            <Button variant="tertiary-black" onClick={onReset}>
              {_('Cancel')}
            </Button>
            <Button onClick={onSubmit}>{_('Ok')}</Button>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
}
