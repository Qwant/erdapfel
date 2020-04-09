/* global _ */
import React, { Fragment } from 'react';
import Panel from 'src/components/ui/Panel';
import CategoryList from 'src/components/CategoryList';
import EventTypeList from './EventTypeList';
import Action from 'src/components/ui/MainActionButton';
import nconf from '@qwant/nconf-getter';

class ServicePanelDesktop extends React.Component {
  render() {
    return <Panel
      className="service_panel"
      title={_('Qwant Maps services', 'service panel')}
      white
    >
      <CategoryList className="service_panel__categories" />

      {nconf.get().events.enabled && <Fragment>
        <hr />
        <EventTypeList />
      </Fragment>}

      <hr/>

      <div className="service_panel__actions">
        {
          nconf.get().direction.enabled && <Action
            onClick={() => { window.app.navigateTo('/routes/'); }}
            variant="feature"
            className="service_panel__item__direction"
            icon="corner-up-right"
            label={_('Directions', 'service panel')}
          />
        }
        <Action
          onClick={() => { window.app.navigateTo('/favs'); }}
          variant="feature"
          className="service_panel__item__fav"
          icon="icon_star"
          label={_('Favorites', 'service panel')}
        />
      </div>
    </Panel>;
  }
}

export default ServicePanelDesktop;
