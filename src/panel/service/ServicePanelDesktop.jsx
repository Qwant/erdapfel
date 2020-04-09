/* global _ */
import React from 'react';
import Panel from 'src/components/ui/Panel';
import CategoryList from 'src/components/CategoryList';
import EventTypeList from './EventTypeList';
import nconf from '@qwant/nconf-getter';

class ServicePanelDesktop extends React.Component {
  render() {
    return <Panel
      className="service_panel"
      title={_('Qwant Maps services', 'service panel')}
      white
    >
      <CategoryList className="service_panel__categories" />

      {nconf.get().events.enabled && <EventTypeList />}

      <hr/>

      <div className="service_panel__actions">
        {
          nconf.get().direction.enabled && <button
            onClick={() => { window.app.navigateTo('/routes/'); }}
            className="service_panel__action service_panel__item__direction">
            <div className="service_panel__action__icon">
              <span className="icon-corner-up-right"/>
            </div>
            <div className="service_panel__action__title">{_('Directions', 'service panel')}</div>
          </button>
        }

        <button className="service_panel__action service_panel__item__fav"
          onClick={() => { window.app.navigateTo('/favs'); }}>
          <div className="service_panel__action__icon">
            <span className="icon-icon_star"/>
          </div>
          <div className="service_panel__action__title">{ _('Favorites', 'service panel')}</div>
        </button>

      </div>
    </Panel>;
  }
}

export default ServicePanelDesktop;
