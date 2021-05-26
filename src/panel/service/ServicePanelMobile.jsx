/* global _ */
import React, { Fragment } from 'react';
import { history } from 'src/proxies/app_router';
import Panel from 'src/components/ui/Panel';
import CategoryList from 'src/components/CategoryList';
import Action from 'src/components/ui/MainActionButton';
import VehicleIcon from 'src/panel/direction/VehicleIcon';
import { useConfig } from 'src/hooks';
import Telemetry from 'src/libs/telemetry';

const ServicePanelMobile = () => {
  const directionConf = useConfig('direction');

  return (
    <Panel
      resizable
      minimizedTitle={_('Unfold to see quick actions', 'service panel')}
      className="service_panel"
    >
      {directionConf.enabled && (
        <Fragment>
          <h3 className="u-text--smallTitle u-center u-mb-s">{_('Directions', 'service panel')}</h3>
          <div className="service_panel__actions">
            <Action
              onClick={() => {
                Telemetry.add(Telemetry.ITINERARY_MODE_DRIVING);
                history.push('/routes/?mode=driving');
              }}
              variant="directionMode"
              icon={<VehicleIcon vehicle="driving" fill="currentColor" />}
              label={_('by car', 'service panel')}
            />
            {directionConf.publicTransport && directionConf.publicTransport.enabled && (
              <Action
                onClick={() => {
                  Telemetry.add(Telemetry.ITINERARY_MODE_PUBLICTRANSPORT);
                  history.push('/routes/?mode=publicTransport');
                }}
                variant="directionMode"
                icon={<VehicleIcon vehicle="publicTransport" fill="currentColor" />}
                label={_('transit', 'service panel')}
              />
            )}
            <Action
              onClick={() => {
                Telemetry.add(Telemetry.ITINERARY_MODE_WALKING);
                history.push('/routes/?mode=walking');
              }}
              variant="directionMode"
              icon={<VehicleIcon vehicle="walking" fill="currentColor" />}
              label={_('on foot', 'service panel')}
            />
            <Action
              onClick={() => {
                Telemetry.add(Telemetry.ITINERARY_MODE_CYCLING);
                history.push('/routes/?mode=cycling');
              }}
              variant="directionMode"
              icon={<VehicleIcon vehicle="cycling" fill="currentColor" />}
              label={_('by bike', 'service panel')}
            />
          </div>
          <hr />
        </Fragment>
      )}

      <h3 className="u-text--smallTitle u-center u-mb-s">
        {_('Services nearby', 'service panel')}
      </h3>

      <CategoryList className="service_panel__categories" />
    </Panel>
  );
};

export default ServicePanelMobile;
