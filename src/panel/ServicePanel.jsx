/* global _ */
import React from 'react';
import ServicePanelDesktop from './ServicePanelDesktop';
import ServicePanelMobile from './ServicePanelMobile';
import { isMobileDevice } from '../libs/device';


class ServicePanel extends React.Component {
  render() {
    if (isMobileDevice()) {
      return <ServicePanelMobile
        resizable
        title=""
        minimizedTitle={_('Unfold to see quick actions', 'service panel')}
        className="service_panel"
        white
      />;
    } else {
      return <ServicePanelDesktop
        className="service_panel"
      />;
    }
  }
}

export default ServicePanel;
