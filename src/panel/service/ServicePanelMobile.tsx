/* global _ */
import React, { Fragment } from 'react';
import Panel from 'src/components/ui/Panel';
import CategoryList from 'src/components/CategoryList';
import MainActionButton from 'src/components/ui/MainActionButton';
import VehicleIcon from 'src/panel/direction/VehicleIcon';
import { useConfig } from 'src/hooks';
import Telemetry from 'src/libs/telemetry';
import { QmapsConfig } from 'appTypes/config';

const ServicePanelMobile = () => {
  const directionConf = useConfig('direction') as unknown as QmapsConfig['direction'];

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
            <MainActionButton
              onClick={() => {
                Telemetry.add(Telemetry['ITINERARY_MODE_DRIVING']);
                window.app.navigateTo('/routes/?mode=driving');
              }}
              variant="directionMode"
              icon={<VehicleIcon vehicle="driving" fill="currentColor" />}
              label={_('by car', 'service panel')}
            />
            {directionConf.publicTransport && directionConf.publicTransport.enabled && (
              <MainActionButton
                onClick={() => {
                  Telemetry.add(Telemetry['ITINERARY_MODE_PUBLICTRANSPORT']);
                  window.app.navigateTo('/routes/?mode=publicTransport');
                }}
                variant="directionMode"
                icon={<VehicleIcon vehicle="publicTransport" fill="currentColor" />}
                label={_('transit', 'service panel')}
              />
            )}
            <MainActionButton
              onClick={() => {
                Telemetry.add(Telemetry['ITINERARY_MODE_WALKING']);
                window.app.navigateTo('/routes/?mode=walking');
              }}
              variant="directionMode"
              icon={<VehicleIcon vehicle="walking" fill="currentColor" />}
              label={_('on foot', 'service panel')}
            />
            <MainActionButton
              onClick={() => {
                Telemetry.add(Telemetry['ITINERARY_MODE_CYCLING']);
                window.app.navigateTo('/routes/?mode=cycling');
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
      <CategoryList className="service_panel__categories" limit={16} />
    </Panel>
  );
};

export default ServicePanelMobile;
