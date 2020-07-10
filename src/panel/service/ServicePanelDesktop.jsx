/* global _ */
import React, { Fragment, useState } from 'react';
import { Panel, Button } from 'src/components/ui';
import CategoryList from 'src/components/CategoryList';

const ServicePanelDesktop = () => {
  const [ collapsed, setCollapsed ] = useState(true);

  return <Fragment>
    <Panel className="service_panel u-mb-8" white>
      <h3 className="u-text--smallTitle u-mb-12">
        {_('Search around this place', 'service panel')}
      </h3>
      <CategoryList
        className="service_panel__categories"
        limit={collapsed ? 4 : undefined}
      />
    </Panel>
    <div className="u-center">
      <Button
        className="service_panel__category_toggle"
        variant="tertiary"
        icon={collapsed ? 'icon_chevron-down' : 'icon_chevron-up'}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? _('Display more proximity services') : _('Reduce')}
      </Button>
    </div>
  </Fragment>;
};

export default ServicePanelDesktop;
