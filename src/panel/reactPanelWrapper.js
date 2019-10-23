import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactPanelWrapper {
  constructor(reactComponent) {
    this.reactComponent = reactComponent;
  }

  open(options = {}) {
    ReactDOM.render(<this.reactComponent {...options} />,
      document.querySelector('.react_panel__container'));
  }

  close() {
    ReactDOM.unmountComponentAtNode(document.querySelector('.react_panel__container'));
  }
}
