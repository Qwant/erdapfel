import React, { useContext } from 'react';
import { Panel, Divider, ShareMenu } from 'src/components/ui';
import { Button, IconShare } from '@qwant/qwant-ponents';
import { DirectionContext } from './directionStore';
import { useI18n } from 'src/hooks';

const DesktopDirectionPanel = ({ form, result, onClose, onShareClick }) => {
  const { routes } = useContext(DirectionContext).state;
  const { _ } = useI18n();

  return (
    <Panel className="direction-panel" onClose={onClose} renderHeader={form}>
      <div className="direction-autocomplete_suggestions" />
      {routes.length > 0 && (
        <ShareMenu url={window.location.toString()}>
          {openMenu => (
            <Button
              className="direction-panel-share-button u-ml-auto u-flex-shrink-0 u-mr-m"
              variant="tertiary"
              title={_('Share itinerary', 'direction')}
              onClick={e => onShareClick(e, openMenu)}
            >
              <IconShare />
              {_('Share itinerary', 'direction')}
            </Button>
          )}
        </ShareMenu>
      )}
      <Divider paddingTop={8} paddingBottom={0} />
      {result}
    </Panel>
  );
};

export default DesktopDirectionPanel;
