/* global _ */
import React from 'react';
import Panel from 'src/components/ui/Panel';
import CategoryList from 'src/components/CategoryList';

const ServicePanelDesktop = () => {
  return <Panel className="service_panel" white>
    <h3 className="u-text--smallTitle u-mb-12">
      {_('Search around this place', 'service panel')}
    </h3>
    <CategoryList className="service_panel__categories" />
  </Panel>;
};

export default ServicePanelDesktop;
