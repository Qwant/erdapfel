/* globals _ */
import React, { useEffect, useState } from 'react';
import Panel from 'src/components/ui/Panel';
import { Stack, Box, Flex, Switch, Text, IconEmpty } from '@qwant/qwant-ponents';
import {
  setHistoryEnabled,
  getHistoryEnabled,
  listHistoryItemsByDate,
  historyLength,
  deleteQuery,
  deleteSearchHistory,
} from 'src/adapters/search_history';
import PlaceIcon from 'src/components/PlaceIcon';
import { capitalizeFirst } from 'src/libs/string';
import { listen, unListen } from 'src/libs/customEvents';
import { openDisableHistoryModal, openClearHistoryModal } from 'src/modals/HistoryModal';
import { PURPLE } from '../../libs/colors';
import { IconHistory } from '../../components/ui/icons';

const HistoryPanel = () => {
  const [isChecked, setIsChecked] = useState(getHistoryEnabled());
  const now = new Date();
  const lastMidnight = new Date().setUTCHours(0, 0, 0, 0);
  const lastWeek = new Date().setUTCDate(-7);
  const lastMonth = new Date().setUTCDate(-30);
  const last6Months = new Date().setUTCDate(-180);
  const lastYear = new Date().setUTCDate(-365);
  const [todayHistory, setTodayHistory] = useState(listHistoryItemsByDate(lastMidnight, now));
  const [lastWeekHistory, setLastWeekHistory] = useState(
    listHistoryItemsByDate(lastWeek, lastMidnight)
  );
  const [lastMonthHistory, setLastMonthHistory] = useState(
    listHistoryItemsByDate(lastMonth, lastWeek)
  );
  const [last6MonthsHistory, setLast6MonthsHistory] = useState(
    listHistoryItemsByDate(last6Months, lastMonth)
  );
  const [lastYearHistory, setLastYearHistory] = useState(
    listHistoryItemsByDate(lastYear, last6Months)
  );
  const [olderHistory, setOlderHistory] = useState(listHistoryItemsByDate(0, lastYear));

  const disableHistory = () => {
    setIsChecked(false);
    setHistoryEnabled(false);
    deleteSearchHistory();
    computeHistory();
  };

  const clearHistory = () => {
    deleteSearchHistory();
    computeHistory();
  };

  useEffect(() => {
    const disableHistoryHandler = listen('disable_history', disableHistory);
    return () => {
      unListen(disableHistoryHandler);
    };
  }, []);

  useEffect(() => {
    const clearHistoryHandler = listen('clear_history', clearHistory);
    return () => {
      unListen(clearHistoryHandler);
    };
  }, []);

  const close = () => {
    window.app.navigateTo('/');
  };

  // Switch change
  const onChange = e => {
    if (e.target.checked === false) {
      openDisableHistoryModal();
    } else {
      setIsChecked(true);
      setHistoryEnabled(true);
    }
  };

  const computeHistory = () => {
    setTodayHistory(listHistoryItemsByDate(lastMidnight, now));
    setLastWeekHistory(listHistoryItemsByDate(lastWeek, lastMidnight));
    setLastMonthHistory(listHistoryItemsByDate(lastMonth, lastWeek));
    setLast6MonthsHistory(listHistoryItemsByDate(last6Months, lastMonth));
    setLastYearHistory(listHistoryItemsByDate(lastYear, last6Months));
    setOlderHistory(listHistoryItemsByDate(0, lastYear));
  };

  const visit = item => {
    // PoI
    if (item.type === 'poi') {
      window.app.navigateTo(`/place/${item.item.id}`);
    }
    // Intention
    else if (item.type === 'intention') {
      // With category
      if (item.item.category && item.item.category.name) {
        window.app.navigateTo(
          `/places/?type=${item.item.category.name}&bbox=${item.item.bbox.join(',')}`
        );
      }
      // Without category (ex: macdonalds nice)
      else {
        window.app.navigateTo(
          `/places/?q=${item.item.fullTextQuery}&bbox=${item.item.bbox.join(',')}`
        );
      }
    }
  };

  // Remove one item from the list
  const remove = item => {
    // Remove the item in localStorage
    deleteQuery(item.item);

    // Refresh lists and re-render the page
    computeHistory();
  };

  // Clear all the history
  const clear = () => {
    openClearHistoryModal();
  };

  const showItem = item => {
    return item.type === 'poi' ? (
      // poi / city / address
      <Flex key={item.item.id} className="history-list-item">
        <Box
          onClick={() => {
            visit(item);
          }}
        >
          <PlaceIcon className="autocomplete_suggestion_icon" place={item.item} withBackground />
        </Box>
        <Flex
          takeAvailableSpace
          column
          onClick={() => {
            visit(item);
          }}
        >
          <Box>
            <Text typo="body-1" color="primary">
              {item.item.name}
            </Text>
          </Box>
          <Box>
            <Text typo="body-2" color="secondary">
              {item.item?.address?.label ||
                item.item?.address?.city ||
                item.item?.address?.stateDistrict ||
                item.item?.address?.state ||
                item.item?.address?.country ||
                ''}
            </Text>
          </Box>
        </Flex>
        <Text color="primary" onClick={() => remove(item)}>
          <IconEmpty width={20} className="history_panel_trash" />
        </Text>
      </Flex>
    ) : (
      // intention
      <Flex key={item.item.category?.id || item.item.fullTextQuery} className="history-list-item">
        <Box
          onClick={() => {
            visit(item);
          }}
        >
          <PlaceIcon
            className="autocomplete_suggestion_icon"
            category={item.item.category}
            withBackground
          />
        </Box>
        <Flex
          takeAvailableSpace
          column
          onClick={() => {
            visit(item);
          }}
        >
          <Box>
            <Text typo="body-1" color="primary">
              {item.item.category?.name || item.item.fullTextQuery}
            </Text>
          </Box>
          <Box>
            <Text typo="body-2" color="secondary">
              {item.item?.place?.properties?.geocoding?.name ||
                capitalizeFirst(_('nearby', 'history'))}
            </Text>
          </Box>
        </Flex>
        <Box color="primary" onClick={() => remove(item)}>
          <IconEmpty width={20} className="history_panel_trash" />
        </Box>
      </Flex>
    );
  };

  return (
    <Panel
      resizable
      renderHeader={
        <Text bold color="primary">
          {_('My history', 'history panel')}
        </Text>
      }
      minimizedTitle={_('Show history', 'history panel')}
      onClose={close}
      className="history_panel"
    >
      <Flex mt="xs">
        <Text typo="body-2">
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
          {!isChecked && <a href="@TODO">{_('Learn more')}</a>}
        </Text>
        <Switch
          name="history_enabled"
          id="history_enabled"
          checked={isChecked}
          onChange={onChange}
        />
      </Flex>
      {isChecked && (
        <Box className="history_panel_links">
          {isChecked && <a href="@TODO">{_('Learn more')}</a>}
          {isChecked && historyLength() > 0 && <a onClick={clear}>{_('Delete my history')}</a>}
        </Box>
      )}
      {isChecked && (
        <Stack gap="xl" mt="xl">
          {todayHistory.length > 0 && (
            <Box className="history-list">
              <Text bold color="primary" typo="body-2" className="history-list-title">
                {_('Today', 'history panel')}
              </Text>
              <hr />
              <Box>{todayHistory.map(showItem)}</Box>
            </Box>
          )}
          {lastWeekHistory.length > 0 && (
            <Box className="history-list">
              <Text bold color="primary" typo="body-2" className="history-list-title">
                {_('Last week', 'history panel')}
              </Text>
              <hr />
              <Box>{lastWeekHistory.map(showItem)}</Box>
            </Box>
          )}
          {lastMonthHistory.length > 0 && (
            <Box className="history-list">
              <Text bold color="primary" typo="body-2" className="history-list-title">
                {_('Last month', 'history panel')}
              </Text>
              <hr />
              <Box>{lastMonthHistory.map(showItem)}</Box>
            </Box>
          )}
          {last6MonthsHistory.length > 0 && (
            <Box className="history-list">
              <Text bold color="primary" typo="body-2" className="history-list-title">
                {_('Last 6 months', 'history panel')}
              </Text>
              <hr />
              <Box>{last6MonthsHistory.map(showItem)}</Box>
            </Box>
          )}
          {lastYearHistory.length > 0 && (
            <Box className="history-list">
              <Text bold color="primary" typo="body-2" className="history-list-title">
                {_('Last year', 'history panel')}
              </Text>
              <hr />
              <Box>{lastYearHistory.map(showItem)}</Box>
            </Box>
          )}
          {olderHistory.length > 0 && (
            <Box className="history-list">
              <Text bold color="primary" typo="body-2" className="history-list-title">
                {_('More than one year ago', 'history panel')}
              </Text>
              <hr />
              <Box>{olderHistory.map(showItem)}</Box>
            </Box>
          )}
          {historyLength() === 0 && (
            <Box className="history_panel_empty">
              <IconHistory width={20} fill={PURPLE} className="historyIcon" />
              <Text typo="body-2">
                {_('As soon as you do a search, you can find it here 👇', 'history panel')}
              </Text>
            </Box>
          )}
        </Stack>
      )}
    </Panel>
  );
};

listen('clear_history', () => {});

export default HistoryPanel;
