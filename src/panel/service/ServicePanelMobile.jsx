/* global _ */
import React, { Fragment } from 'react';
import Panel from 'src/components/ui/Panel';
import CategoryList from 'src/components/CategoryList';
import Action from 'src/components/ui/MainActionButton';
import nconf from '@qwant/nconf-getter';
import Telemetry from 'src/libs/telemetry';

const directionConf = nconf.get().direction;

class ServicePanelMobile extends React.Component {
  render() {
    return <Panel
      resizable
      minimizedTitle={_('Unfold to see quick actions', 'service panel')}
      className="service_panel"
    >
      {directionConf.enabled && <Fragment>
        <h3 className="u-text--smallTitle u-center u-mb-12">
          {_('Directions', 'service panel')}
        </h3>
        <div className="service_panel__actions">
          <Action
            onClick={() => {
              Telemetry.add(Telemetry.ITINERARY_MODE_DRIVING);
              window.app.navigateTo('/routes/?mode=driving');
            }}
            variant="directionMode"
            icon="drive"
            label={_('by car', 'service panel')}
          />
          {
            directionConf.publicTransport
            && directionConf.publicTransport.enabled
            && <Action
              onClick={() => {
                Telemetry.add(Telemetry.ITINERARY_MODE_PUBLICTRANSPORT);
                window.app.navigateTo('/routes/?mode=publicTransport');
              }}
              variant="directionMode"
              icon="public-transport"
              label={_('transit', 'service panel')}
            />
          }
          <Action
            onClick={() => {
              Telemetry.add(Telemetry.ITINERARY_MODE_WALKING);
              window.app.navigateTo('/routes/?mode=walking');
            }}
            variant="directionMode"
            icon="foot"
            label={_('on foot', 'service panel')}
          />
          <Action
            onClick={() => {
              Telemetry.add(Telemetry.ITINERARY_MODE_CYCLING);
              window.app.navigateTo('/routes/?mode=cycling');
            }}
            variant="directionMode"
            icon="bike"
            label={_('by bike', 'service panel')}
          />
        </div>
        <hr/>
      </Fragment>}

      <h3 className="u-text--smallTitle u-center u-mb-12">
        {_('Services nearby', 'service panel')}
      </h3>

      <CategoryList className="service_panel__categories" />
    </Panel>;
  }
}

export default ServicePanelMobile;
