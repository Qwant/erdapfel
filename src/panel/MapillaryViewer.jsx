import React from 'react';

class ViewerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const { init } = this.props;
    init({
      accessToken: 'MLY|4100327730013843|5bb78b81720791946a9a7b956c57b7cf',
      container: this.containerRef.current,
    });
  }

  componentWillUnmount() {
    const { dispose } = this.props;
    dispose();
  }

  render() {
    return <div ref={this.containerRef} style={this.props.style} />;
  }
}

export default ViewerComponent;
