/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { fire } from 'src/libs/customEvents';
import { DeviceContext } from 'src/libs/device';
import { isMobileDevice } from 'src/libs/device';
import Flex from 'src/components/ui/Flex';

const getEventClientY = event => event.changedTouches
  ? event.changedTouches[0].clientY
  : event.clientY;

// Pixel threshold to consider vertical swipes
const SWIPE_THRESHOLD_PX = 50;
// Pixel threshold from the bottom or top of the viewport to span to min or max
const MIN_MAX_THRESHOLD_PX = 75;
const MOBILE_DEFAULT_SIZE = '50%';
const MOBILE_MINIMIZED_SIZE = '50px';
const MOBILE_MAXIMIZED_SIZE = 'calc(100% - 64px)';

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
    /* Default panel height will be computed
       to display no more than this ref + a margin */
    defaultSizeTargetRef: PropTypes.object,
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
      // Animation, if any, will start from this currentHeight
      currentHeight: this.getInitialHeight(),
    };
  }

  componentDidMount() {
    this.updateMobileMapUI();
    this.defaultHeight = this.panelDOMElement.offsetHeight;
    window.addEventListener('load', this.loadHandler);
  }

  componentDidUpdate() {
    this.updateMobileMapUI();

    if (this.state.holding) {
      return;
    }

    /* Update height if needed */
    const height = this.getCurrentHeight();
    if (height !== this.state.currentHeight) {
      this.setState({
        currentHeight: height,
      });
    }
  }

  componentWillUnmount() {
    this.updateMobileMapUI(0);
    this.removeListeners();
    window.removeEventListener('load', this.loadHandler);
  }

  loadHandler = () => {
    /* Recalculate panel's size once all assets has been loaded. */
    const height = this.getCurrentHeight();
    this.setState({
      currentHeight: height,
    });
  }

  getInitialHeight() {
    if (!isMobileDevice()) {
      return '100%';
    }

    return this.props.defaultSizeTargetRef
      ? 0
      : MOBILE_DEFAULT_SIZE;
  }

  getCurrentHeight() {
    /* Extra margin after defaultSizeTarget */
    const marginBottom = 20;
    const { size } = this.state;
    const { defaultSizeTargetRef } = this.props;

    if (!isMobileDevice()) {
      // Desktop
      return '100%';
    }

    const sizes = {
      minimized: MOBILE_MINIMIZED_SIZE,
      maximized: MOBILE_MAXIMIZED_SIZE,
      default: (() => {
        if (!defaultSizeTargetRef || !defaultSizeTargetRef.current) {
          return MOBILE_DEFAULT_SIZE;
        }

        const targetRect = defaultSizeTargetRef.current.getBoundingClientRect();
        const panelRect = this.panelDOMElement.getBoundingClientRect();
        return targetRect.bottom - panelRect.top + marginBottom;
      })(),
    };

    return sizes[size] || MOBILE_DEFAULT_SIZE;
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
    });
  }

  handleHeaderClick() {
    const size = this.state.size === 'default' ? 'minimized' : 'default';
    this.setState({
      size,
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
    const resizeHandlers = resizable ? this.getEventHandlers(false) : {};
    const forceResizeHandlers = resizable ? this.getEventHandlers(true) : {};

    return (
      <DeviceContext.Consumer>
        {isMobile =>
          <div
            className={classnames('panel', size, className, {
              'panel--white': white,
              'panel--holding': holding,
            })}
            style={{ height: currentHeight }}
            ref={panel => this.panelDOMElement = panel}
            onTransitionEnd={() => this.updateMobileMapUI()}
          >
            <Flex
              justifyContent="space-between"
              className={classnames(
                'panel-header',
                { 'panel-resizeHandle': resizable && isMobile }
              )}
              ref={element => this.handleElement = element}
              onClick={() => this.handleHeaderClick()}
              {...(isMobile && forceResizeHandlers)}
            >
              {resizable && size === 'minimized' && minimizedTitle
                ? <span className="minimizedTitle">{minimizedTitle}</span>
                : title}
              {close &&
              <Flex
                justifyContent="center"
                className="panel-close"
                title={_('Close')}
                onClick={close}
              >
                <i className="icon-x" />
              </Flex>}
            </Flex>
            <div
              className="panel-content"
              ref={this.panelContentRef}
              {...(isMobile && resizeHandlers)}
            >
              {children}
            </div>
          </div>
        }
      </DeviceContext.Consumer>
    );
  }
}
