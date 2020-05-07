/* global _ */
import React, { Fragment } from 'react';
import Panel from 'src/components/ui/Panel';
import CategoryList from 'src/components/CategoryList';
import EventTypeList from './EventTypeList';
import Action from 'src/components/ui/MainActionButton';
import nconf from '@qwant/nconf-getter';

const directionConf = nconf.get().direction;

class ServicePanelMobile extends React.Component {
  render() {
    return <Panel
      resizable
      minimizedTitle={_('Unfold to see quick actions', 'service panel')}
      className="service_panel"
      white
    >
      <div className="service_panel__actions">

        <h3 className="u-text--smallTitle u-center">{_('Directions', 'service panel')}</h3>

        {
          nconf.get().direction.enabled &&
          <Fragment>
            <Action
              onClick={() => { window.app.navigateTo('/routes/?mode=driving'); }}
              variant="directionMode"
              icon="drive"
              label={_('by car', 'service panel')}
            />
            {
              directionConf.publicTransport
              && directionConf.publicTransport.enabled
              && <Action
                onClick={() => { window.app.navigateTo('/routes/?mode=publicTransport'); }}
                variant="directionMode"
                icon="public-transport"
                label={_('transit', 'service panel')}
              />
            }
            <Action
              onClick={() => { window.app.navigateTo('/routes/?mode=walking'); }}
              variant="directionMode"
              icon="foot"
              label={_('on foot', 'service panel')}
            />
            <Action
              onClick={() => { window.app.navigateTo('/routes/?mode=cycling'); }}
              variant="directionMode"
              icon="bike"
              label={_('by bike', 'service panel')}
            />
          </Fragment>
        }

      </div>

      <hr/>

      <h3 className="u-text--smallTitle u-center">{_('Services nearby', 'service panel')}</h3>

      <CategoryList className="service_panel__categories" />

      {nconf.get().events.enabled && <Fragment>
        <hr />
        <EventTypeList />
      </Fragment>}
    </Panel>;
  }
}

export default ServicePanelMobile;
