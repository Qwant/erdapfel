import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactPanelWrapper {
  constructor(reactComponent) {
    this.reactComponent = reactComponent;
  }

  open() {
    ReactDOM.render(<this.reactComponent />, document.querySelector('.react_panel__container'));
  }

  close() {
    ReactDOM.unmountComponentAtNode(document.querySelector('.react_panel__container'));
  }
}
