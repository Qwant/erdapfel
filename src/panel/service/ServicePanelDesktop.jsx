/* global _ */
import React, { Fragment, useState } from 'react';
import { Panel, Button } from 'src/components/ui';
import CategoryList from 'src/components/CategoryList';
import { IconChevronDown, IconChevronUp } from 'src/components/ui/icons';

const ServicePanelDesktop = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Fragment>
      <Panel className="service_panel u-mb-xs">
        <h3 className="u-text--smallTitle u-mb-s">
          {_('Search around this place', 'service panel')}
        </h3>
        <CategoryList className="service_panel__categories" limit={collapsed ? 4 : undefined} />
      </Panel>
      <div className="u-center" style={{ width: 400 }}>
        <Button
          className="service_panel__category_toggle"
          variant="tertiary"
          icon={collapsed ? <IconChevronDown width={16} /> : <IconChevronUp width={16} />}
          onMouseDown={() => setCollapsed(!collapsed)}
        >
          {collapsed ? _('See more nearby services') : _('Reduce')}
        </Button>
      </div>
    </Fragment>
  );
};

export default ServicePanelDesktop;
