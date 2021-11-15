/* globals _ */
import React, { useState } from 'react';
import Panel from 'src/components/ui/Panel';
import { Box, Flex, Switch, Text } from '@qwant/qwant-ponents';
import { setHistoryEnabled, getHistoryEnabled } from 'src/adapters/search_history';

const HistoryPanel = () => {
  const [isChecked, setIsChecked] = useState(getHistoryEnabled());
  const close = () => {
    window.app.navigateTo('/');
  };

  const onChange = e => {
    setIsChecked(e.target.checked);
    setHistoryEnabled(e.target.checked);
  };

  return (
    <Panel
      resizable
      renderHeader={
        <div className="history-header u-text--smallTitle u-center">
          {_('My history', 'history panel')}
        </div>
      }
      minimizedTitle={_('Show history', 'history panel')}
      onClose={close}
      className="history_panel"
    >
      <Flex>
        <Text>
          {isChecked
            ? _(
                'Your history is enabled. It is only visible to you on this device.',
                'history panel'
              )
            : _(
                'Your history is disabled. If you enable it, it will only be visible to you on this device.',
                'history panel'
              )}
          &nbsp;
          <a href="#">{_('Learn more')}</a>
        </Text>
        <Switch
          name="history_enabled"
          id="history_enabled"
          checked={isChecked}
          onChange={onChange}
        />
      </Flex>
      <Box mt="xl">
        {isChecked && (
          <Text>{_('As soon as you do a search, you can find it here 👇', 'history panel')}</Text>
        )}
      </Box>
    </Panel>
  );
};

export default HistoryPanel;
