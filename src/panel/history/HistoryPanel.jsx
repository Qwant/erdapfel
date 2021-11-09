/* globals _ */
import React, { useState } from 'react';
import Panel from 'src/components/ui/Panel';
import { Box, Flex, Switch, Text } from '@qwant/qwant-ponents';
import {
  setHistoryEnabled,
  getHistoryEnabled,
  listHistoryItemsByDate,
  historyLength,
} from 'src/adapters/search_history';

const HistoryPanel = () => {
  const [isChecked, setIsChecked] = useState(getHistoryEnabled());
  const now = new Date();
  const lastMidnight = new Date().setUTCHours(0, 0, 0, 0);
  const lastWeek = new Date().setUTCDate(now.getUTCDate() - 7);
  const last2Weeks = new Date().setUTCDate(now.getUTCDate() - 14);
  const last3Weeks = new Date().setUTCDate(now.getUTCDate() - 21);
  const todayHistoryItems = listHistoryItemsByDate(lastMidnight, now);
  const lastWeekHistoryItems = listHistoryItemsByDate(lastWeek, lastMidnight);
  const last2WeeksHistoryItems = listHistoryItemsByDate(last2Weeks, lastWeek);
  const last3WeeksHistoryItems = listHistoryItemsByDate(last3Weeks, last2Weeks);
  const olderHistoryItems = listHistoryItemsByDate(0, last3Weeks);
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
        </Text>
        <Switch
          name="history_enabled"
          id="history_enabled"
          checked={isChecked}
          onChange={onChange}
        />
      </Flex>
      <Flex className="history_panel_links">
        <a href="#">{_('Learn more')}</a>
        {isChecked && historyLength() > 0 && <a href="#">{_('Delete my history')}</a>}
      </Flex>
      {isChecked && (
        <Box mt="xl">
          {todayHistoryItems.length ? (
            todayHistoryItems.map(item => (
              <Flex key={item.item.id}>
                {item.date} - {item.type} - {item.item.name}
              </Flex>
            ))
          ) : (
            <Text>{_('As soon as you do a search, you can find it here 👇', 'history panel')}</Text>
          )}
        </Box>
      )}
    </Panel>
  );
};

export default HistoryPanel;
