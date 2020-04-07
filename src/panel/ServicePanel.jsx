/* global _ */
import React, { Fragment } from 'react';
import ServicePanelDesktop from './ServicePanelDesktop';
import ServicePanelMobile from './ServicePanelMobile';
import { DeviceContext } from 'src/libs/device';
import CategoryService from '../adapters/category_service';

class ServicePanel extends React.Component {

  events() {
    return <Fragment>
      <hr/>
      <div className="service_panel__events">
        <h3>{_('Good plans', 'service panel')}</h3>
        {
          CategoryService.getEvents().map(item =>
            <button className="service_panel__event" type="button" key={item.name}
              onClick={() => { window.app.navigateTo(`/events/?type=${item.name}`); }}>
              <div className="service_panel__event__icon"
                style={{ background: item.backgroundColor }}>
                <span className={`icon icon-${item.iconName}`}/>
              </div>
              <div className="service_panel__category__title">{item.label}</div>
            </button>
          )
        }
      </div>
      <hr/>
    </Fragment>;
  }

  render() {
    return <DeviceContext.Consumer>
      {isMobile => isMobile
        ? <ServicePanelMobile
          resizable
          minimizedTitle={_('Unfold to see quick actions', 'service panel')}
          className="service_panel"
          white
          events={this.events()}
        />
        : <ServicePanelDesktop
          title={_('Qwant Maps services', 'service panel')}
          className="service_panel"
          white
          events={this.events()}
        />
      }
    </DeviceContext.Consumer>;
  }
}

export default ServicePanel;
