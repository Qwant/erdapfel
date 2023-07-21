import React from 'react';
import { Viewer } from 'mapillary-js';
import { fire } from 'src/libs/customEvents';

class ViewerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    this.viewer = new Viewer({
      accessToken: 'MLY|4100327730013843|5bb78b81720791946a9a7b956c57b7cf',
      container: this.containerRef.current,
      component: { cover: false },
      imageId: this.props.imageId,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.imageId !== this.props.imageId) {
      if (this.viewer) {
        this.viewer.moveTo(this.props.imageId);
      }
    }
    const onBearing = async () => {
      const bearing = await this.viewer.getBearing();
      fire('change_camera_orientation', bearing);
    };
    const onPosition = async () => {
      const position = await this.viewer.getPosition();
      const pos = [position.lng, position.lat];
      fire('create_mapillary_marker', pos);
    };
    this.viewer.on('position', onPosition);
    this.viewer.on('bearing', onBearing);
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
