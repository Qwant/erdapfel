import React from 'react';
import ReactDOM from 'react-dom';
import RouteResult from './RouteResult';

export default class RoadMapPanel {
  constructor(openMobilePreview) {
    this.onOpenMobilePreview = openMobilePreview;
  }

  getContainer = () => document.getElementById('react_itinerary_result');

  setRoad(routes, vehicle, origin, destination) {
    ReactDOM.render(
      <RouteResult
        routes={routes}
        vehicle={vehicle}
        origin={origin && origin.getInputValue()}
        destination={destination && destination.getInputValue()}
        onOpenMobilePreview={this.onOpenMobilePreview}
      />,
      this.getContainer()
    );
  }

  showPlaceholder(vehicle) {
    ReactDOM.render(<RouteResult isLoading vehicle={vehicle} />, this.getContainer());
  }

  showError() {
    ReactDOM.render(<RouteResult error />, this.getContainer());
  }

  close() {
    ReactDOM.unmountComponentAtNode(this.getContainer());
  }
}
