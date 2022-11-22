import React, { useCallback } from 'react';
import classnames from 'classnames';
import { capitalizeFirst } from 'src/libs/string';
import { RED_DARKER } from 'src/libs/colors';
import { PoiHourBlockProps } from 'src/panel/poi/blocks/Information/blocks/Hour';
import { PoiTimeTableProps } from 'src/panel/poi/blocks/Information/blocks/Hour/TimeTable';

const getStatusMessage = ({
  status,
  texts,
}: {
  status?: string;
  texts?: OpeningHourProps['texts'];
}): { label: string; color: string } => {
  if (status === 'open') {
    return {
      label: texts?.open ?? '',
      color: 'var(--green-600)',
    };
  }

  if (status === 'closed') {
    return {
      label: texts?.closed ?? '',
      color: RED_DARKER,
    };
  }

  return { label: '', color: '#fff' };
};

export type OpeningHourProps = {
  className?: string;
  schedule: PoiTimeTableProps['schedule'];
  showNextOpenOnly?: boolean;
  texts?: PoiHourBlockProps['texts'];
};

const OpeningHour: React.FunctionComponent<OpeningHourProps> = ({
  className,
  schedule,
  showNextOpenOnly = false,
  texts,
}) => {
  const { isTwentyFourSeven, status, nextTransition } = schedule;
  const { label, color } = getStatusMessage({ status, texts });
  const getDescription = useCallback(
    (texts: OpeningHourProps['texts']) => {
      if (isTwentyFourSeven && !showNextOpenOnly) {
        return texts?.open_24_7;
      }

      const parts: string[] = [];

      if (!nextTransition || status !== 'closed' || !showNextOpenOnly) {
        parts.push(label);
      }

      if (nextTransition && (status === 'closed' || !showNextOpenOnly)) {
        const options = { nextTransitionTime: nextTransition };
        parts.push(
          status === 'closed'
            ? texts?.reopening?.replace('{nextTransitionTime}', options.nextTransitionTime) ?? ''
            : texts?.until?.replace('{nextTransitionTime}', options.nextTransitionTime) ?? ''
        );
      }

      return capitalizeFirst(parts.join(' - '));
    },
    [isTwentyFourSeven, label, nextTransition, showNextOpenOnly, status]
  );

  if (!schedule) {
    return null;
  }

  return (
    <span
      className={classnames(
        'openingHour',
        {
          [`openingHour--${status}`]: status,
          'openingHour--24-7': isTwentyFourSeven,
        },
        className
      )}
      style={{ color }}
    >
      {getDescription(texts)}
    </span>
  );
};

export default OpeningHour;
