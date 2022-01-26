/* global _, _n */
import {
  Box,
  Button,
  DateHelpers,
  DatePicker,
  Field,
  IconArrowDownSLine,
  IconCalendar,
  Stack,
} from '@qwant/qwant-ponents';
import React, { useState } from 'react';

import { useDatepickerDates } from './useDatepickerDates';
import { ReservationComposer } from './ReservationComposer';
import { ReservationDateModal } from './ReservationDateModal';
import { ReservationDatepickerPopup } from './ReservationPopup';

const DAY = 1000 * 3600 * 24;

const preventDefault = e => e.preventDefault();

function formatOccupants(occupants) {
  const items = [
    `${_n('%d room', '%d rooms', occupants.rooms)}`,
    `${_n('%d adult', '%d adults', occupants.adults)}`,
  ];
  if (occupants.children > 0) {
    items.push(`${_n('%d child', '%d children', occupants.children)}`);
  }
  return items.join(', ');
}

/**
 * @param {Date} date
 */
function formatDateForTripadvisor(date) {
  return `${date.getFullYear()}_${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}_${date.getDate().toString().padStart(2, '0')}`;
}

/**
 * @param {string} baseUrl
 * @param {{rooms: number, adults: number, ages: number[], start: Date, end: Date, children: number}} params
 */
function urlWithParams(baseUrl, params) {
  const url = new URL(baseUrl);
  url.searchParams.set(
    'uguests',
    `${params.rooms}_${params.adults}` + (params.children > 0 ? `_${params.ages.join(',')}` : '')
  );
  url.searchParams.set(
    'staydates',
    `${formatDateForTripadvisor(params.start)}_${formatDateForTripadvisor(params.end)}`
  );
  return url.toString();
}

export function Reservation({ mobile, url: baseUrl }) {
  const {
    startDate,
    endDate,
    showPicker,
    startInput,
    endInput,
    datepickerMode,
    handleFocusStart,
    handleCancel,
    handleFocusEnd,
    handleEndChange,
    handleStartChange,
    hideDatepicker,
  } = useDatepickerDates(DateHelpers.todayDate(), DateHelpers.addDays(DateHelpers.todayDate(), 1));
  const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
  const nights = Math.abs(Math.ceil((startDate.getTime() - endDate.getTime()) / DAY));
  const [occupants, setOccupants] = useState({
    rooms: 1,
    adults: 2,
    children: 0,
    ages: [],
  });
  const [showOccupantSelection, setOccupantSelection] = useState(false);
  const url = urlWithParams(baseUrl, {
    ...occupants,
    start: startDate,
    end: endDate,
  });

  return (
    <Box mt="xl" pb="l">
      <Box mb="m">
        <h3 className="u-text--smallTitle">{_('Make a reservation')}</h3>
      </Box>

      {/* Datepicker */}
      <ReservationDateModal
        active={mobile && showPicker}
        onBack={handleCancel}
        onReset={handleCancel}
        onSubmit={hideDatepicker}
        nights={nights}
        header={
          <Stack gap="m" horizontal nowrap>
            <Field
              id="DatePickerFieldOut"
              ref={startInput}
              label={_('Check in')}
              value={dateFormatter.format(startDate)}
              onFocus={handleFocusStart}
              onClick={preventDefault}
              icon={IconCalendar}
            />
            <Field
              id="DatePickerFieldIn"
              ref={endInput}
              label={_('Check out')}
              value={dateFormatter.format(endDate)}
              onFocus={handleFocusEnd}
              onClick={preventDefault}
              icon={IconCalendar}
            />
          </Stack>
        }
      >
        {showPicker && (
          <ReservationDatepickerPopup mobile={mobile} onHide={() => !mobile && hideDatepicker()}>
            <DatePicker
              mobile={mobile}
              startDate={startDate}
              endDate={endDate}
              selection={datepickerMode}
              onEndChange={handleEndChange}
              onStartChange={handleStartChange}
              showDayOfWeek={!mobile}
              onMonthVisible={() => null}
              weekStart={1}
              observerId={datepickerMode}
            />
            {mobile || (
              <>
                <hr className="ReservationSeparator" />
                <Stack horizontal gap="xs" px="xl" pt="m" end>
                  <Button variant="tertiary" onClick={handleCancel}>
                    {_('Cancel')}
                  </Button>
                  <Button onClick={hideDatepicker}>{_('Ok')}</Button>
                </Stack>
              </>
            )}
          </ReservationDatepickerPopup>
        )}
      </ReservationDateModal>

      <Stack gap="m" horizontal={!mobile} mt="m" className="Reservation2By2">
        <Box relative>
          <Field
            id="OccupantsPicker"
            label={_('Guests')}
            value={formatOccupants(occupants)}
            onFocus={() => setOccupantSelection(true)}
            onClick={() => setOccupantSelection(true)}
            icon={IconArrowDownSLine}
            className="ReservationOccupantField"
          />
          <ReservationComposer
            visible={showOccupantSelection}
            mobile={mobile}
            value={occupants}
            onChange={setOccupants}
            onClose={() => setOccupantSelection(false)}
          />
        </Box>
        <Button as="a" href={url} target="_blank">
          {_('Check availability')}
        </Button>
      </Stack>
    </Box>
  );
}
