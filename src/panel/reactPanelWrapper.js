import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactPanelWrapper {
  constructor(reactComponent, selector = '.react_panel__container') {
    this.reactComponent = reactComponent;
    this.selector = selector;
  }

  open(options) {
    ReactDOM.render(<this.reactComponent {...options} />,
      document.querySelector(this.selector));
  }

  close() {
    ReactDOM.unmountComponentAtNode(document.querySelector(this.selector));
  }
}
