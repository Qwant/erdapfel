/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { fire } from 'src/libs/customEvents';
import { isMobileDevice } from 'src/libs/device';

const getEventClientY = event => event.changedTouches
  ? event.changedTouches[0].clientY
  : event.clientY;

// Pixel threshold to consider vertical swipes
const SWIPE_THRESHOLD_PX = 50;
// Pixel threshold from the bottom or top of the viewport to span to min or max
const MIN_MAX_THRESHOLD_PX = 75;

function getTargetSize(previousSize, moveDuration, startHeight, endHeight, maxSize) {
  let size = previousSize;
  const heightDelta = startHeight - endHeight;
  if (Math.abs(heightDelta) < SWIPE_THRESHOLD_PX) {
    // ignore move
    return size;
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

function getCurrentHeight(size, {
  defaultHeight,
  minimizedHeight,
}) {
  if (!isMobileDevice()) {return '100%';}
  if (size === 'default') {return defaultHeight || '50%';}
  if (size === 'minimized') {return minimizedHeight || '50px';}
  if (size === 'maximized') {return 'calc(100% - 64px)';}
  return null;
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
    this.moveHandler = null;
    this.panelContentRef = React.createRef();
    this.state = {
      holding: false,
      size: props.initialSize,
      currentHeight: getCurrentHeight('default', {}),
    };
  }

  componentDidMount() {
    this.updateMobileMapUI();
    this.defaultHeight = this.panelDOMElement.offsetHeight;
  }

  componentDidUpdate() {
    this.updateMobileMapUI();
  }

  componentWillUnmount() {
    this.updateMobileMapUI(0);
    this.removeListeners();
  }

  updateMobileMapUI = (height = this.panelDOMElement.offsetHeight) => {
    if (this.props.resizable) {
      window.execOnMapLoaded(() => {
        fire('move_mobile_bottom_ui', height);
      });

      if (height > this.defaultHeight) {
        // Transition to maximized
        fire('mobile_geolocation_button_visibility', false);
        fire('mobile_direction_button_visibility', false);
      } else if (this.state.size === 'minimized' || height < 40) {
        // Transition to minimized
        fire('mobile_geolocation_button_visibility', true);
        fire('mobile_direction_button_visibility', true);
      } else {
        // Transition to default
        fire('mobile_geolocation_button_visibility', true);
        fire('mobile_direction_button_visibility', false);
      }
    }
  }

  removeListeners() {
    if (!this.moveHandler) {
      return;
    }
    document.removeEventListener('touchmove', this.moveHandler);
    document.removeEventListener('mousemove', this.moveHandler);
    this.moveHandler = null;
  }

  holdResizer = (event, forceResize = false) => {
    // event.preventDefault();
    this.startHeight = this.panelDOMElement.offsetHeight;
    this.startClientY = getEventClientY(event.nativeEvent);
    this.interactionStarted = event.timeStamp;

    this.removeListeners();

    this.moveHandler = event => this.move(event, forceResize);
    if (event.type === 'touchstart') {
      document.addEventListener('touchmove', this.moveHandler);
    } else {
      document.addEventListener('mousemove', this.moveHandler);
    }

    this.setState(previousState => ({
      currentHeight: this.startHeight,
      previousSize: previousState.size,
      holding: true,
    }));
  }

  /**
  * Triggered on mouse move on the panel resizer
  * @param {MouseEvent|TouchEvent} e event
  */
  move = (event, forceResize = false) => {
    const clientY = getEventClientY(event);
    const currentHeight = this.startHeight + (this.startClientY - clientY);

    if (!forceResize &&
        this.state.size === 'maximized' &&
        this.panelContentRef.current.scrollTop > 0) {
      /* User is scrolling inside the panel content,
         update startClientY to ignore current swipe gesture */
      this.startClientY = clientY;
      return;
    }

    if (!forceResize &&
        this.state.size === 'maximized' &&
        this.panelContentRef.current.scrollTop === 0 &&
        currentHeight >= this.state.currentHeight) {
      // User is starting to scroll content area from bottom to top, do nothing
      return;
    }

    this.setState({
      currentHeight,
      size: 'default',
    });
  }

  /**
   * Triggered on mouse up of the panel resizer
   * @param {MouseEvent|TouchEvent} event
   */
  stopResize = (event, forceResize = false) => {
    this.removeListeners();

    if (!forceResize &&
        this.state.size === 'maximized' &&
        this.panelContentRef.current.scrollTop > 0) {
      // User is scrolling inside the panel content
      return;
    }

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
      currentHeight: getCurrentHeight(newSize, {
        defaultHeight: this.props.defaultHeight,
        minimizedHeight: this.props.minimizedHeight,
      }),
    });
  }

  handleHeaderClick() {
    const size = this.state.size === 'default' ? 'minimized' : 'default';
    this.setState({
      size,
      currentHeight: getCurrentHeight(size, {
        defaultHeight: this.props.defaultHeight,
        minimizedHeight: this.props.minimizedHeight,
      }),
    });
  }

  getEventHandlers(forceResize = false) {
    return {
      onMouseDown: event => this.holdResizer(event, forceResize),
      onTouchStart: event => this.holdResizer(event, forceResize),
      onMouseUp: event => this.stopResize(event, forceResize),
      onTouchEnd: event => this.stopResize(event, forceResize),
    };
  }

  render() {
    const { children, title, minimizedTitle, resizable, close, className, white } = this.props;
    const { size, currentHeight, holding } = this.state;
    const resizeHandlers = resizable && isMobileDevice() ? this.getEventHandlers(false) : {};
    const forceResizeleHandlers = resizable && isMobileDevice() ? this.getEventHandlers(true) : {};

    return <div
      className={classnames('panel', size, className, {
        'panel--white': white,
        'panel--holding': holding,
      })}
      style={{ height: currentHeight }}
      ref={panel => this.panelDOMElement = panel}
      onTransitionEnd={() => this.updateMobileMapUI()}
    >
      {close && <div className="panel-close" title={_('Close')} onClick={close} >
        <i className="icon-x" />
      </div>}
      <div
        className={classnames('panel-header', { 'panel-resizeHandle': resizable })}
        ref={element => this.handleElement = element}
        onClick={() => this.handleHeaderClick()}
        {...forceResizeleHandlers}
      >
        {resizable && size === 'minimized' && minimizedTitle ? minimizedTitle : title}
      </div>
      <div className="panel-content" ref={this.panelContentRef} {...resizeHandlers}>
        {children}
      </div>
    </div>;
  }
}
