import { React, useState } from 'react';
import classnames from 'classnames';
import { object, func, string, arrayOf } from 'prop-types';
import SuggestItem from './SuggestItem';
import { useConfig, useI18n } from 'src/hooks';
import { Stack, Box, Button, Heading } from '@qwant/qwant-ponents';
import { getHistoryPrompt } from 'src/adapters/search_history';

const SuggestsDropdown = ({ className = '', suggestItems, onSelect, highlighted, value }) => {
  const { _ } = useI18n();
  const searchHistoryConfig = useConfig('searchHistory');
  const [answer, setAnswer] = useState(null);

  const historyPrompt = () => {
    if (answer === null) {
      return (
        <Box m="l">
          <Heading as="h6">{_('History is available on Qwant Maps', 'history')}</Heading>
          <Stack>
            <Box>
              {_(
                'Convenient and completely private, the history will only be visible to you on this device 🙈.',
                'history'
              )}{' '}
              <a href="">{_('Read more', 'history')}</a>
            </Box>
            <Box mt="l">
              <Button variant="secondary" onClick={() => setAnswer(false)}>
                {_('No thanks', 'history')}
              </Button>
              <Button ml="l" onClick={() => setAnswer(true)}>
                {_('Enable history', 'history')}
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    }

    if (answer === true) {
      return (
        <Box m="l">
          <Heading as="h6">{_('Well done, the history is activated!', 'history')}</Heading>
          <Stack>
            <Box>
              {_(
                'You can find and manage your complete history at any time in the menu',
                'history'
              )}
            </Box>
          </Stack>
        </Box>
      );
    }

    if (answer === false) {
      return (
        <Box m="l">
          <Heading as="h6">{_('No worries, history is disabled', 'history')}</Heading>
          <Stack>
            <Box>
              {_(
                'You can change your mind at any time and manage the activation of the history in the menu.',
                'history'
              )}
            </Box>
          </Stack>
        </Box>
      );
    }
  };

  // Focused and empty field, unanswered prompt, history feature enabled: show history prompt
  return searchHistoryConfig?.enabled && value === '' && getHistoryPrompt() === null ? (
    historyPrompt()
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
