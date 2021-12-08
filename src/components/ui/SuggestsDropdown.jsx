import React from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';
import SuggestItem from './SuggestItem';
import { useConfig, useI18n } from 'src/hooks';
import { Stack, Box, Button, Heading } from '@qwant/qwant-ponents';
import { getHistoryPrompt } from 'src/adapters/search_history';

const SuggestsDropdown = ({ className = '', suggestItems, onSelect, highlighted, value }) => {
  const { _ } = useI18n();
  const searchHistoryConfig = useConfig('searchHistory');

  // Focused and empty field, unanswered prompt, history feature enabled: show history prompt
  return searchHistoryConfig?.enabled && value === '' && getHistoryPrompt() === null ? (
    <Box m="l">
      <Heading as="h6">{_('History is available on Qwant Maps', 'history')}</Heading>
      <Stack>
        <Box>
          {_(
            'Convenient and completely private, the history will only be visible to you on this device 🙈.',
            'history'
          )}
          <a href="">{_('Read more', 'history')}</a>
        </Box>
        <Box mt="l">
          <Button variant="secondary">{_('No thanks', 'history')}</Button>
          <Button ml="l">{_('Enable history', 'history')}</Button>
        </Box>
      </Stack>
    </Box>
  ) : (
    // Focused field and (answered prompt or history feature disabled): show suggest
    <ul className={classnames('autocomplete_suggestions', className)}>
      {suggestItems.map((suggestItem, index) => (
        <li
          key={index}
          onMouseDown={() => {
            onSelect(suggestItem);
          }}
          className={classnames({ selected: highlighted === suggestItem })}
        >
          <SuggestItem item={suggestItem} />
        </li>
      ))}
    </ul>
  );
};

SuggestsDropdown.propTypes = {
  suggestItems: arrayOf(object).isRequired,
  highlighted: object,
  onSelect: func.isRequired,
  className: string,
  value: string,
};

export default SuggestsDropdown;
