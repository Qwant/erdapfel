import React from 'react';
import { Viewer } from 'mapillary-js';

class ViewerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    this.viewer = new Viewer({
      accessToken: this.props.accessToken,
      container: this.containerRef.current,
      imageId: this.props.imageId,
    });
  }

  componentWillUnmount() {
    if (this.viewer) {
      this.viewer.remove();
    }
  }

  render() {
    return <div ref={this.containerRef} style={this.props.style} />;
  }
}

export default ViewerComponent;
