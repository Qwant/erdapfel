import React from 'react';
import ReactDOM from 'react-dom';
import RouteResult from './RouteResult';

export default class RoadMapPanel {
  constructor(onOpen, onClose) {
    this.onOpen = onOpen;
    this.onClose = onClose;
  }

  setRoad(routes, vehicle, origin) {
    ReactDOM.render(
      <RouteResult
        routes={routes}
        vehicle={vehicle}
        origin={origin.getInputValue()}
      />,
      document.getElementById('react_itinerary_result')
    );
  }

  showPlaceholder(vehicle) {
    ReactDOM.render(
      <RouteResult isLoading vehicle={vehicle} />,
      document.getElementById('react_itinerary_result')
    );
  }

  showError() {
    ReactDOM.render(
      <RouteResult error />,
      document.getElementById('react_itinerary_result')
    );
  }

  preview() {
    this.previewRoadMap.setRoad(this.routes.find(route => route.isActive));
    this.onOpen();
    fire('show_marker_steps');
    document.querySelector('.map_bottom_button_group').classList.add('itinerary_preview--active');
  }

  closeAction() {
    this.previewRoadMap.close();
    this.onClose();
    document.querySelector('.map_bottom_button_group')
      .classList
      .remove('itinerary_preview--active');
  }
}
