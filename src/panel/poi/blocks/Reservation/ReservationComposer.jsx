/* global _ */
import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  IconClose,
  IconMinus,
  IconPlus,
  Modal,
  Stack,
  Text,
} from '@qwant/qwant-ponents';
import React, { useRef, useState } from 'react';
import { useClickAway } from 'react-use';

const max = {
  rooms: 8,
  adults: 32,
  children: 20,
};

const fillArray = (arr, count) => {
  if (arr.length > count) {
    return arr.slice(0, count);
  }
  return arr.concat(new Array(count - arr.length).fill(null));
};

const ageOptions = firstLabel => {
  return [firstLabel]
    .concat(new Array(16).fill(1).map((v, k) => k + 1))
    .reduce((acc, v, k) => ({ ...acc, [k]: v }), {});
};

/**
 * Small box where the user can select the composition of his reservation (rooms, children...)
 */
export function ReservationComposer({ value: propsValue, onChange, mobile, visible, onClose }) {
  const [value, setValue] = useState(propsValue);
  const handleSubmit = e => {
    e.preventDefault();
    onChange(value);
    onClose();
  };
  const ageOptionsMemo = ageOptions(_('< 1 y old'));
  const hasChildWithNoAge = value.ages.filter(a => a === null).length > 0;
  return (
    <Wrapper mobile={mobile} visible={visible} onClose={handleSubmit}>
      <Box px="m" py="s" className="ReservationComposerCounter">
        <Line value={value} onChange={setValue} field="rooms" />
        <Line value={value} onChange={setValue} field="adults" />
        <Line value={value} onChange={setValue} field="children" />
      </Box>
      <hr />
      {value.ages.length > 0 && (
        <>
          <Box px="m" py="s" className="ReservationComposerAges">
            {value.ages.map((v, k) => (
              <LineAge
                key={k}
                index={k}
                value={value}
                options={ageOptionsMemo}
                onChange={setValue}
              />
            ))}
          </Box>
          <hr />
        </>
      )}
      <Stack horizontal gap="xs" end alignCenter py="xs" px="m">
        <Button variant="tertiary" onClick={onClose}>
          {_('Cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={hasChildWithNoAge}>
          {_('Ok')}
        </Button>
      </Stack>
    </Wrapper>
  );
}

function Line({ value, field, onChange }) {
  const fieldTranslations = {
    rooms: _('Rooms'),
    adults: _('Adults'),
    children: _('Children'),
  };
  const fieldDescriptionTranslations = {
    adults: _('18 y old and more'),
    children: _('Between 0 and 17 y old'),
  };
  const fieldValue = value[field];
  const minValue = field === 'children' ? 0 : 1;
  const maxValue = max[field];
  const changeHandler = incr => e => {
    e.preventDefault();
    const newAges = field === 'children' ? fillArray(value.ages, fieldValue + incr) : value.ages;
    onChange({
      ...value,
      ages: newAges,
      // Constraint the value between min & max
      [field]: Math.min(Math.max(minValue, fieldValue + incr), maxValue),
    });
  };

  return (
    <>
      <Flex alignCenter>
        <div>
          <Text typo="body-2" color="primary">
            <Box mb="xxs">{fieldTranslations[field]}</Box>
          </Text>
          {fieldDescriptionTranslations[field] && (
            <Text typo="caption-1" color="secondary">
              {fieldDescriptionTranslations[field]}
            </Text>
          )}
        </div>
      </Flex>
      <button
        className="ReservationComposerIncrement"
        disabled={fieldValue === minValue}
        onClick={changeHandler(-1)}
      >
        <Button pictoButton as="span" disabled={fieldValue === minValue}>
          <IconMinus size={16} />
        </Button>
      </button>
      <div className="ReservationComposerNumber">
        <Text typo="body-2" color="secondary">
          {fieldValue}
        </Text>
      </div>
      <button
        className="ReservationComposerIncrement"
        onClick={changeHandler(1)}
        disabled={fieldValue === maxValue}
      >
        <Button pictoButton as="span" disabled={fieldValue === maxValue}>
          <IconPlus size={16} />
        </Button>
      </button>
    </>
  );
}

function LineAge({ index, value, options, onChange }) {
  const age = value.ages[index];
  const handleChange = e => {
    e.preventDefault();
    const newAges = [...value.ages];
    newAges[index] = parseInt(e.target.value, 10);
    onChange({
      ...value,
      ages: newAges,
    });
  };
  return (
    <>
      <Flex alignCenter>
        <Text typo="body-2" color="primary">
          {_('Child %d age').replace('%d', index + 1)}
        </Text>
      </Flex>
      <Field onChange={handleChange} type="select" options={options} value={age || ''} />
    </>
  );
}

function Wrapper({ children, mobile, onClose, visible }) {
  const ref = useRef();
  useClickAway(ref, e => onClose(e));
  if (!mobile) {
    return visible ? (
      <Card ref={ref} depth={2} className="ReservationComposerTooltip">
        {children}
      </Card>
    ) : null;
  }
  return (
    <Modal open={visible} size="raw" className="ReservationComposerModal">
      <Flex between p="m">
        <Text typo="body-2" color="primary" raw>
          <Flex alignCenter>{_('Guests')}</Flex>
        </Text>
        <Text typo="body-2" color="secondary" raw>
          <button className="ReservationComposerClose" onClick={onClose}>
            <IconClose size={16} />
          </button>
        </Text>
      </Flex>

      <hr />
      {children}
    </Modal>
  );
}
