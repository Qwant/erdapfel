import React from 'react';
import ServicePanelDesktop from './ServicePanelDesktop';
import ServicePanelMobile from './ServicePanelMobile';
import { useDevice } from 'src/hooks';

const ServicePanel = () => {
  const { isMobile } = useDevice();
  return isMobile ? <ServicePanelMobile /> : <ServicePanelDesktop />;
};

export default ServicePanel;
