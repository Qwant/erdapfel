/* global _ */
import React from 'react';
import { Fragment } from 'react';
import Panel from 'src/components/ui/Panel';
import CategoryList from 'src/components/CategoryList';
import PropTypes from 'prop-types';
import nconf from '@qwant/nconf-getter';

const directionConf = nconf.get().direction;

class ServicePanelMobile extends React.Component {

  static propTypes = {
    events: PropTypes.object,
  };

  render() {
    return <Panel
      resizable
      minimizedTitle={_('Unfold to see quick actions', 'service panel')}
      className="service_panel"
      white
    >
      <div className="service_panel__actions">

        <h3>{_('Itineraries', 'service panel')}</h3>

        {
          nconf.get().direction.enabled &&
          <Fragment>
            <button
              onClick={() => { window.app.navigateTo('/routes/?mode=driving'); }}
              className="service_panel__action service_panel__item__direction">
              <div className="service_panel__action__icon">
                <span className="icon-drive"/>
              </div>
              <div className="service_panel__action__title">{_('by car', 'service panel')}</div>
            </button>
            {
              directionConf.publicTransport
              && directionConf.publicTransport.enabled
              && <button
                onClick={() => {
                  window.app.navigateTo('/routes/?mode=publicTransport');
                }}
                className="service_panel__action service_panel__item__direction">
                <div className="service_panel__action__icon">
                  <span className="icon-public-transport"/>
                </div>
                <div className="service_panel__action__title">
                  {_('transport', 'service panel')}
                </div>
              </button>
            }
            <button
              onClick={() => { window.app.navigateTo('/routes/?mode=walking'); }}
              className="service_panel__action service_panel__item__direction">
              <div className="service_panel__action__icon">
                <span className="icon-foot"/>
              </div>
              <div className="service_panel__action__title">{_('on foot', 'service panel')}</div>
            </button>
            <button
              onClick={() => { window.app.navigateTo('/routes/?mode=cycling'); }}
              className="service_panel__action service_panel__item__direction">
              <div className="service_panel__action__icon">
                <span className="icon-bike"/>
              </div>
              <div className="service_panel__action__title">{_('by bike', 'service panel')}</div>
            </button>
          </Fragment>
        }

      </div>

      <hr/>

      <h3>{_('Services nearby', 'service panel')}</h3>

      <CategoryList className="service_panel__categories" />

      {
        nconf.get().events.enabled && this.props.events
      }
    </Panel>;
  }
}

export default ServicePanelMobile;
