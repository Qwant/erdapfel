import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const getEventClientY = event => event.changedTouches
  ? event.changedTouches[0].clientY
  : event.clientY;

// Pixel threshold to consider vertical swipes
const SWIPE_THRESHOLD_PX = 50;
// Pixel threshold from the bottom or top of the viewport to span to min or max
const MIN_MAX_THRESHOLD_PX = 75;
// Delay below which a mouseDown/mouseUp interaction
// will be considered a as single click instead of a draggin action
const CLICK_RESIZE_TIMEOUT_MS = 150;

function getTargetSize(previousSize, moveDuration, startHeight, endHeight, maxSize) {
  let size = previousSize;
  const heightDelta = startHeight - endHeight;
  if (Math.abs(heightDelta) < SWIPE_THRESHOLD_PX) {
    if (moveDuration < CLICK_RESIZE_TIMEOUT_MS) {
      // the resize handler was only clicked, provide 'smart' resize
      size = previousSize === 'default' ? 'minimized' : 'default';
    }
  } else if (endHeight < MIN_MAX_THRESHOLD_PX) {
    size = 'minimized';
  } else if (endHeight > maxSize - MIN_MAX_THRESHOLD_PX) {
    size = 'maximized';
  } else if (heightDelta < 0) {
    // swipe towards the top
    size = previousSize === 'default' ? 'maximized' : 'default';
  } else {
    // swipe towards the bottom
    size = previousSize === 'default' ? 'minimized' : 'default';
  }
  return size;
}

export default class Panel extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.node,
    minimizedTitle: PropTypes.node,
    resizable: PropTypes.bool,
    initialSize: PropTypes.oneOf(['default', 'minimized', 'maximized']),
    marginTop: PropTypes.number,
    close: PropTypes.func,
    className: PropTypes.string,
    white: PropTypes.bool,
  }

  static defaultProps = {
    initialSize: 'default',
    marginTop: 50, // default top bar size
  }

  constructor(props) {
    super(props);
    this.moveCallback = e => this.move(e);
    this.state = {
      holding: false,
      size: props.initialSize,
      currentHeight: null,
    };
  }

  componentDidMount() {
    this.updateMobileMapUI();
    this.setState({
      defaultHeight: this.panelDOMElement.offsetHeight,
    });
  }

  componentDidUpdate() {
    this.updateMobileMapUI();
  }

  componentWillUnmount() {
    this.updateMobileMapUI(0);
    document.removeEventListener('mousemove', this.moveCallback);
    document.removeEventListener('touchmove', this.moveCallback);
  }

  updateMobileMapUI = (height = this.panelDOMElement.offsetHeight) => {
    if (this.props.resizable) {
      window.execOnMapLoaded(() => {
        fire('move_mobile_bottom_ui', height);
      });

      if (height > this.state.defaultHeight) {
        // Transition to maximized
        fire('hide_mobile_geolocation_button');
        fire('hide_mobile_direction_button');
      } else if (this.state.size === 'minimized' || height < 40) {
        // Transition to minimized
        fire('show_mobile_geolocation_button');
        fire('show_mobile_direction_button');
      } else {
        // Transition to default
        fire('show_mobile_geolocation_button');
        fire('hide_mobile_direction_button');
      }
    }
  }

  holdResizer = event => {
    event.preventDefault();

    this.startHeight = this.panelDOMElement.offsetHeight;
    this.startClientY = getEventClientY(event.nativeEvent);
    this.interactionStarted = event.timeStamp;

    document.addEventListener('mousemove', this.moveCallback);
    document.addEventListener('touchmove', this.moveCallback);

    this.setState(previousState => {
      return {
        currentHeight: this.startHeight,
        size: 'default',
        previousSize: previousState.size,
        holding: true,
      };
    });
  }

  /**
  * Triggered on mouse move on the panel resizer
  * @param {MouseEvent|TouchEvent} e event
  */
  move = event => {
    event.preventDefault();

    const clientY = getEventClientY(event);
    const currentHeight = this.startHeight + (this.startClientY - clientY);
    this.setState({ currentHeight });
  }

  /**
   * Triggered on mouse up of the panel resizer
   * @param {MouseEvent|TouchEvent} event
   */
  stopResize = event => {
    event.preventDefault();

    document.removeEventListener('mousemove', this.moveCallback);
    document.removeEventListener('touchmove', this.moveCallback);

    const newSize = getTargetSize(
      this.state.previousSize,
      event.timeStamp - this.interactionStarted,
      this.startHeight,
      this.state.currentHeight,
      window.innerHeight - this.props.marginTop,
    );

    this.setState({
      holding: false,
      size: newSize,
      currentHeight: null,
    });
  }

  render() {
    const { children, title, minimizedTitle, resizable, close, className, white } = this.props;
    const { size, currentHeight, holding } = this.state;

    const resizeHandlers = resizable ? {
      onMouseDown: this.holdResizer,
      onTouchStart: this.holdResizer,
      onMouseUp: this.stopResize,
      onTouchEnd: this.stopResize,
    } : {};

    return <div
      className={classnames('panel', size, className, {
        'panel--white': white,
        'panel--holding': holding,
      })}
      style={{ height: currentHeight && `${currentHeight}px` }}
      ref={panel => this.panelDOMElement = panel}
      onTransitionEnd={() => this.updateMobileMapUI()}
    >
      {close && <div className="panel-close" onClick={() => { close(); }}>
        <i className="icon-x" />
      </div>}
      <div
        className={classnames('panel-header', { 'panel-resizeHandle': resizable })}
        {...resizeHandlers}
        ref={element => this.handleElement = element}
      >
        {resizable && size === 'minimized' && minimizedTitle ? minimizedTitle : title}
      </div>
      <div className="panel-content">
        {children}
      </div>
    </div>;
  }
}
