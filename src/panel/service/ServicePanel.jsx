import React, { useContext } from 'react';
import ServicePanelDesktop from './ServicePanelDesktop';
import ServicePanelMobile from './ServicePanelMobile';
import { DeviceContext } from 'src/libs/device';

const ServicePanel = () => {
  const isMobile = useContext(DeviceContext);
  return isMobile ? <ServicePanelMobile /> : <ServicePanelDesktop />;
};

export default ServicePanel;
