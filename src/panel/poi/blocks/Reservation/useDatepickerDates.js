import { DatePicker } from '@qwant/qwant-ponents';
import { useEffect, useRef, useState } from 'react';

export function useDatepickerDates(initialStartDate, initialEndDate) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const startInput = useRef();
  const endInput = useRef();
  const [datepickerMode, setDatepickerMode] = useState(DatePicker.START);
  const [showPicker, setShowPicker] = useState(false);
  // keep refs when we want to rollback dates
  const datesRef = useRef([startDate, endDate]);

  const handleFocusStart = () => {
    setDatepickerMode(DatePicker.START);
    setShowPicker(true);
  };

  const handleFocusEnd = () => {
    setDatepickerMode(DatePicker.END);
    setShowPicker(true);
  };

  // Focus the right field when the datepicker is opened
  useEffect(() => {
    if (!showPicker) {
      return;
    }
    if (datepickerMode === DatePicker.START) {
      startInput.current.focus();
    } else {
      endInput.current.focus();
    }
  }, [datepickerMode, showPicker]);

  // Remember the selected dates when the datepicker is opened
  useEffect(() => {
    datesRef.current = [startDate, endDate];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPicker]);

  const handleCancel = () => {
    setShowPicker(false);
    setStartDate(datesRef.current[0]);
    setEndDate(datesRef.current[1]);
  };

  const handleStartChange = date => {
    setDatepickerMode(DatePicker.END);
    setStartDate(date);
  };

  const handleEndChange = date => {
    setDatepickerMode(DatePicker.START);
    setEndDate(date);
  };

  return {
    startDate,
    endDate,
    startInput,
    endInput,
    datepickerMode,
    showPicker,
    handleFocusStart,
    handleFocusEnd,
    handleCancel,
    handleStartChange,
    handleEndChange,
    hideDatepicker: () => setShowPicker(false),
  };
}
